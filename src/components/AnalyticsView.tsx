import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Boxes,
  FileSpreadsheet,
  HardDrive,
  Mail,
  Download,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Zap,
  Clock,
  AlertTriangle,
  Sparkles,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  InventoryItem,
  ResourceAllocation,
  FinancialMetric,
  Employee,
  PayrollRecord,
  StockMovement,
} from '../types';
import { calculateStockForecasts, ForecastModelType } from '../services/forecasting';
import { RevenueGrowthChart } from './RevenueGrowthChart';
import { InventoryTurnoverChart } from './InventoryTurnoverChart';
import { ExecutiveBISynthesis } from './ExecutiveBISynthesis';

interface AnalyticsViewProps {
  inventory: InventoryItem[];
  movements?: StockMovement[];
  resources: ResourceAllocation[];
  employees: Employee[];
  payroll: PayrollRecord[];
  metrics: FinancialMetric;
  googleConnected: boolean;
  onOpenGoogleModal: () => void;
  onExportSheets: () => void;
  onBackupDrive: () => void;
  onQuickReorder?: (itemId: string, quantity?: number) => void;
  isExporting: boolean;
  sheetsUrl?: string;
  driveUrl?: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  inventory,
  movements = [],
  resources,
  employees,
  payroll,
  metrics,
  googleConnected,
  onOpenGoogleModal,
  onExportSheets,
  onBackupDrive,
  onQuickReorder,
  isExporting,
  sheetsUrl,
  driveUrl,
}) => {
  const [timeRange, setTimeRange] = useState<'30d' | 'q3' | 'ytd'>('q3');

  // Predictive Forecasting Model States
  const [forecastModelType, setForecastModelType] = useState<ForecastModelType>('exponential');
  const [leadTimeBuffer, setLeadTimeBuffer] = useState<number>(0); // 0 or +3 days
  const [selectedForecastSku, setSelectedForecastSku] = useState<string>('inv-101'); // Industrial Cortex-M7 by default

  // Calculate dynamic forecasts based on current inventory, movements, and selected model
  const forecasts = useMemo(() => {
    return calculateStockForecasts(inventory, movements, {
      modelType: forecastModelType,
      surgeFactor: forecastModelType === 'surge' ? 1.3 : 1.0,
      leadTimeBufferDays: leadTimeBuffer,
    });
  }, [inventory, movements, forecastModelType, leadTimeBuffer]);

  // Selected item forecast for primary trend chart
  const currentForecast = useMemo(() => {
    return forecasts.find((f) => f.itemId === selectedForecastSku) || forecasts[0];
  }, [forecasts, selectedForecastSku]);

  // Comparative multi-SKU depletion data for the 24-day horizon
  const multiSkuComparativeData = useMemo(() => {
    if (forecasts.length === 0) return [];
    const pointsCount = forecasts[0]?.projectionTimeline.length || 0;
    const topSkus = forecasts.slice(0, 5);

    const timeline = [];
    for (let i = 0; i < pointsCount; i++) {
      const basePoint = topSkus[0].projectionTimeline[i];
      const entry: any = {
        date: basePoint.date,
        day: basePoint.day,
        isProjected: basePoint.isProjected,
      };

      topSkus.forEach((f) => {
        const pt = f.projectionTimeline[i];
        if (pt) {
          entry[f.sku] = pt.projectedStock;
        }
      });
      timeline.push(entry);
    }
    return timeline;
  }, [forecasts]);

  // Summary statistics for predictive forecasting
  const immediateReorders = forecasts.filter((f) => f.urgency === 'critical_immediate');
  const upcomingReorders = forecasts.filter((f) => f.urgency === 'reorder_soon');
  const totalReorderCapital = forecasts
    .filter((f) => f.urgency !== 'optimal')
    .reduce((sum, f) => sum + f.recommendedReorderQuantity * f.unitCost, 0);

  const aggregateFleetVelocity = forecasts
    .reduce((sum, f) => sum + f.averageDailyDemand, 0)
    .toFixed(1);

  // Resource statistics
  const totalAllocated = resources.reduce((sum, r) => sum + r.hoursAllocatedTotal, 0);
  const totalUtilized = resources.reduce((sum, r) => sum + r.hoursUtilized, 0);
  const overallUtilization = Math.round((totalUtilized / (totalAllocated || 1)) * 100);

  // Custom Recharts Tooltip for Predictive Trend Line
  const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

      const isProjected = data.isProjected;
      const stock = data.projectedStock;
      const reorderPt = data.reorderThreshold;
      const safetyPt = data.safetyThreshold;

      let statusBadge = (
        <span className="text-emerald-700 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Healthy Stock
        </span>
      );
      if (stock <= safetyPt) {
        statusBadge = (
          <span className="text-rose-700 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Safety Floor Breached
          </span>
        );
      } else if (stock <= reorderPt) {
        statusBadge = (
          <span className="text-amber-700 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Reorder Triggered
          </span>
        );
      }

      return (
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-900">Date: {label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                isProjected ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              {isProjected ? 'Projected' : 'Historical Actual'}
            </span>
          </div>

          <div className="flex justify-between items-center pt-0.5">
            <span className="text-slate-500 font-medium">Inventory Level:</span>
            <span className="font-mono font-bold text-sm text-slate-900">{stock} Units</span>
          </div>

          {isProjected && (
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>95% Confidence Band:</span>
              <span className="font-mono font-medium text-slate-700">
                {data.lowerConfidenceBound} - {data.upperConfidenceBound}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] border-t border-slate-100 pt-1">
            <span className="text-slate-500 font-medium">Reorder Threshold:</span>
            <span className="font-mono text-amber-700 font-bold">{reorderPt} Units</span>
          </div>

          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-medium">Safety Floor:</span>
            <span className="font-mono text-rose-700 font-bold">{safetyPt} Units</span>
          </div>

          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">State:</span>
            {statusBadge}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Analytical Reporting & Cloud Telemetry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Predictive stock forecasting models, historical movement trendlines, resource allocation efficiency, and Google Workspace integrations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                timeRange === '30d' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('q3')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                timeRange === 'q3' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q3 2026
            </button>
            <button
              onClick={() => setTimeRange('ytd')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                timeRange === 'ytd' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              YTD Fiscal
            </button>
          </div>

          <button
            id="analytics-export-sheets-btn"
            onClick={onExportSheets}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export to Google Sheets'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Sync Status Notification if Links Exist */}
      {(sheetsUrl || driveUrl) && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Real-time enterprise data successfully synchronized with Google Workspace!</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {sheetsUrl && (
              <a
                href={sheetsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow-2xs"
              >
                <span>Open Google Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {driveUrl && (
              <a
                href={driveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-2xs"
              >
                <span>View Google Drive Backup</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW SECTION: PREDICTIVE STOCK FORECASTING & REORDER TREND LINE CHARTS */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        {/* Section Header & High-level Forecast KPIs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" /> Machine Learning & Statistical Forecasting
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mt-1.5">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Predictive Demand Velocity & Depletion Trajectory Model</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyzes historical stock movement dispatches, consumption velocity, and lead times to calculate exact reorder points and depletion trend lines.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Immediate Reorders</span>
              <div className="text-base font-bold text-rose-700 font-mono mt-0.5">
                {immediateReorders.length} SKU{immediateReorders.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Reorder Soon (&lt;7d)</span>
              <div className="text-base font-bold text-amber-700 font-mono mt-0.5">
                {upcomingReorders.length} SKU{upcomingReorders.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Fleet Velocity</span>
              <div className="text-base font-bold text-indigo-700 font-mono mt-0.5">
                {aggregateFleetVelocity} u/day
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Replenish Budget</span>
              <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                ${totalReorderCapital.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Model Configuration Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5 mr-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Forecasting Algorithm:
            </span>

            <button
              onClick={() => setForecastModelType('exponential')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                forecastModelType === 'exponential'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
              }`}
            >
              Exponential Smoothing (Recency Weighted)
            </button>

            <button
              onClick={() => setForecastModelType('linear')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                forecastModelType === 'linear'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
              }`}
            >
              Linear Regression Moving Avg
            </button>

            <button
              onClick={() => setForecastModelType('surge')}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold flex items-center gap-1 ${
                forecastModelType === 'surge'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-amber-700 hover:text-amber-800 border border-amber-200 shadow-2xs'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" /> Demand Surge Shock (+30%)
            </button>
          </div>

          {/* Lead Time Stress Buffer */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Lead Time Buffer:</span>
            <button
              onClick={() => setLeadTimeBuffer(leadTimeBuffer === 0 ? 3 : 0)}
              className={`px-3 py-1 rounded-xl border text-xs font-semibold font-mono transition-colors shadow-2xs ${
                leadTimeBuffer > 0
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {leadTimeBuffer > 0 ? '+3 Days Supply Lag' : 'Standard Supplier SLA'}
            </button>
          </div>
        </div>

        {/* SKU Selector Carousel / Pill Row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Select SKU to Inspect Depletion Curve & Suggested Reorder Date:
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Anchor Date: 2026-09-18
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {forecasts.map((f) => {
              const isSelected = f.itemId === selectedForecastSku;
              const isUrgent = f.urgency === 'critical_immediate';
              const isSoon = f.urgency === 'reorder_soon';

              return (
                <button
                  key={f.itemId}
                  onClick={() => setSelectedForecastSku(f.itemId)}
                  className={`p-2.5 rounded-xl text-left border transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-500 shadow-2xs ring-1 ring-indigo-500 text-slate-900'
                      : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-900 truncate block">
                      {f.sku}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isUrgent
                          ? 'bg-red-500 animate-pulse'
                          : isSoon
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{f.itemName}</div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-mono">{f.currentStock} u</span>
                    <span className="text-[10px] text-indigo-600 font-mono font-bold">
                      {f.averageDailyDemand} u/d
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PRIMARY TREND LINE CHART: DEVIATION & DEPLETION TRAJECTORY */}
        {currentForecast && (
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{currentForecast.itemName}</span>
                  <span className="px-2 py-0.5 rounded bg-white text-indigo-700 font-mono text-xs font-semibold border border-slate-200">
                    {currentForecast.sku}
                  </span>
                  <span className="text-xs text-slate-500">({currentForecast.category})</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Warehouse: <strong className="text-slate-800">{currentForecast.warehouseLocation}</strong></span>
                  <span>Supplier: <strong className="text-slate-800">{currentForecast.supplier}</strong></span>
                  <span>Lead Time: <strong className="text-slate-800">{currentForecast.leadTimeDays} days</strong></span>
                </div>
              </div>

              {/* Action and Reorder recommendation callout */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Suggested Reorder Date</span>
                  <div
                    className={`text-sm font-bold font-mono ${
                      currentForecast.urgency === 'critical_immediate'
                        ? 'text-rose-700 animate-pulse'
                        : currentForecast.urgency === 'reorder_soon'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {currentForecast.daysUntilReorderPoint === 0
                      ? 'IMMEDIATE (Today)'
                      : `${currentForecast.suggestedReorderDate} (${currentForecast.daysUntilReorderPoint}d)`}
                  </div>
                </div>

                {onQuickReorder && (
                  <button
                    onClick={() => onQuickReorder(currentForecast.itemId, currentForecast.recommendedReorderQuantity)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors whitespace-nowrap"
                  >
                    Order +{currentForecast.recommendedReorderQuantity} Units
                  </button>
                )}
              </div>
            </div>

            {/* Recharts Composed Chart (Area + Lines + Reference Thresholds) */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={currentForecast.projectionTimeline}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickMargin={8}
                  />

                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    domain={[0, 'auto']}
                    tickFormatter={(val) => `${val} u`}
                  />

                  <Tooltip content={<CustomForecastTooltip />} />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: 11, color: '#64748b' }}
                  />

                  {/* Confidence interval area */}
                  <Area
                    type="monotone"
                    dataKey="upperConfidenceBound"
                    stroke="transparent"
                    fill="url(#confidenceGradient)"
                    name="95% Confidence Band"
                  />

                  {/* Historical stock curve */}
                  <Line
                    type="monotone"
                    dataKey="historicalActualStock"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#4f46e5', strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: '#6366f1' }}
                    name="Historical Stock (Prior 7d)"
                    connectNulls={false}
                  />

                  {/* Projected stock depletion curve */}
                  <Line
                    type="monotone"
                    dataKey="projectedStock"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#0284c7', strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: '#38bdf8' }}
                    name="Projected Depletion (Demand Velocity)"
                  />

                  {/* Reorder Point Threshold */}
                  <ReferenceLine
                    y={currentForecast.reorderPoint}
                    stroke="#d97706"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Reorder Point (${currentForecast.reorderPoint} u)`,
                      fill: '#d97706',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />

                  {/* Safety Stock Buffer Floor */}
                  <ReferenceLine
                    y={currentForecast.safetyStock}
                    stroke="#dc2626"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{
                      value: `Safety Floor (${currentForecast.safetyStock} u)`,
                      fill: '#dc2626',
                      fontSize: 10,
                      position: 'insideBottomRight',
                    }}
                  />

                  {/* Today vertical marker */}
                  <ReferenceLine
                    x="09-18"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    label={{
                      value: 'Today (09-18)',
                      fill: '#475569',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Model Insight Callout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[11px] font-medium">Daily Burn Velocity</span>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {currentForecast.averageDailyDemand} units / day
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Trend: <strong className="text-slate-800 capitalize">{currentForecast.demandVelocityTrend}</strong> ({currentForecast.velocityChangePercent >= 0 ? `+${currentForecast.velocityChangePercent}%` : `${currentForecast.velocityChangePercent}%`})
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[11px] font-medium">Projected Depletion to Zero</span>
                <div className="text-base font-bold text-rose-700 font-mono mt-0.5">
                  {currentForecast.daysUntilStockout} Days ({currentForecast.projectedStockoutDate})
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Based on current velocity without inbound receipts
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[11px] font-medium">Statistical Confidence</span>
                <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                  {currentForecast.modelConfidence}% Confidence
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Validated against {currentForecast.historicalMovementsCount} movements & {currentForecast.totalHistoricalDispatched} outbound dispatches
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECONDARY CHART: COMPARATIVE MULTI-SKU VELOCITY DEPLETION CURVES */}
        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <LineChart className="w-4 h-4 text-indigo-600" />
                <span>Multi-SKU Depletion Horizon (Top High-Velocity Components)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Simultaneous 24-day projected drawdown trajectories across key production components and materials.
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Comparative Velocity Tracking
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={multiSkuComparativeData}
                margin={{ top: 10, right: 30, left: 10, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#0f172a',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />

                <ReferenceLine x="09-18" stroke="#94a3b8" strokeWidth={1} />

                <Line
                  type="monotone"
                  dataKey="EL-MICRO-884"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                  name="Cortex-M7 (EL-MICRO-884)"
                />
                <Line
                  type="monotone"
                  dataKey="RAW-ALUM-6061"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={false}
                  name="6061-T6 Alum (RAW-ALUM-6061)"
                />
                <Line
                  type="monotone"
                  dataKey="EL-OPTIC-10G"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                  name="10GbE SFP+ (EL-OPTIC-10G)"
                />
                <Line
                  type="monotone"
                  dataKey="RAW-COPPER-WIR"
                  stroke="#9333ea"
                  strokeWidth={2}
                  dot={false}
                  name="OFHC Copper (RAW-COPPER-WIR)"
                />
                <Line
                  type="monotone"
                  dataKey="FG-SERVER-RACK"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                  name="Server Chassis (FG-SERVER-RACK)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive Reorder Schedule Roadmap Table */}
        <div className="rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden bg-white">
          <div className="p-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-900">Suggested Reorder Schedule & Velocity Rankings</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Calculated based on daily burn rate, supplier lead times, and economic reorder thresholds
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">{forecasts.length} SKUs Modeled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">SKU & Product</th>
                  <th className="px-4 py-2.5 text-right">Physical Stock</th>
                  <th className="px-4 py-2.5 text-right">Demand Velocity</th>
                  <th className="px-4 py-2.5 text-center">Velocity Trend</th>
                  <th className="px-4 py-2.5 text-center">Suggested Reorder Date</th>
                  <th className="px-4 py-2.5 text-right">Recommended Qty</th>
                  <th className="px-4 py-2.5 text-center">Urgency</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {forecasts.map((f) => (
                  <tr key={f.itemId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{f.itemName}</div>
                      <div className="text-[10px] font-mono text-indigo-600">{f.sku} • {f.supplier}</div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono">
                      <div className="text-slate-900 font-medium">{f.currentStock} units</div>
                      <div className="text-[10px] text-slate-500">Reorder: {f.reorderPoint}</div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono">
                      <div className="text-sky-700 font-bold">{f.averageDailyDemand} u / day</div>
                      <div className="text-[10px] text-slate-500">Lead: {f.leadTimeDays}d</div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                          f.demandVelocityTrend === 'accelerating'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : f.demandVelocityTrend === 'decelerating'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {f.demandVelocityTrend}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center font-mono">
                      <div
                        className={`font-semibold ${
                          f.daysUntilReorderPoint === 0
                            ? 'text-rose-700 font-bold'
                            : f.daysUntilReorderPoint <= 7
                            ? 'text-amber-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {f.daysUntilReorderPoint === 0 ? 'IMMEDIATE (Today)' : f.suggestedReorderDate}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {f.daysUntilReorderPoint === 0
                          ? 'Stock < Reorder Point'
                          : `in ${f.daysUntilReorderPoint} days`}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
                      +{f.recommendedReorderQuantity} units
                      <div className="text-[10px] text-slate-500">
                        ${(f.recommendedReorderQuantity * f.unitCost).toLocaleString()}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          f.urgency === 'critical_immediate'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : f.urgency === 'reorder_soon'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {f.urgency === 'critical_immediate'
                          ? 'Critical'
                          : f.urgency === 'reorder_soon'
                          ? 'Upcoming'
                          : 'Optimal'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {onQuickReorder && (
                        <button
                          onClick={() => onQuickReorder(f.itemId, f.recommendedReorderQuantity)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium transition-colors shadow-2xs"
                        >
                          Reorder
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION: YEAR-OVER-YEAR (YOY) REVENUE GROWTH & MARGIN EXPANSION */}
      <RevenueGrowthChart />

      {/* SECTION: INVENTORY TURNOVER TRENDS & WORKING CAPITAL VELOCITY */}
      <InventoryTurnoverChart inventory={inventory} />

      {/* SECTION: EXECUTIVE CROSS-DOMAIN BI SYNTHESIS */}
      <ExecutiveBISynthesis />

      {/* SECTION 2: REAL-TIME RESOURCE ALLOCATION */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Real-Time Resource Allocation & Project Capacity</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Workload bandwidth, engineering capacity utilization, and project execution burn rates.
            </p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Allocated</span>
              <div className="text-lg font-bold text-slate-900 font-mono">{totalAllocated} hrs / wk</div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Utilization Rate</span>
              <div className="text-lg font-bold text-indigo-700 font-mono">{overallUtilization}%</div>
            </div>
          </div>
        </div>

        {/* Department Bandwidth Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500">Engineering</span>
            <div className="text-base font-bold text-slate-900 mt-1">91.5% Load</div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2">
              <div className="h-full rounded-full bg-indigo-600" style={{ width: '91.5%' }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500">Supply Chain</span>
            <div className="text-base font-bold text-amber-700 mt-1">95.8% Load</div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2">
              <div className="h-full rounded-full bg-amber-500" style={{ width: '95.8%' }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500">Finance & Treasury</span>
            <div className="text-base font-bold text-slate-900 mt-1">84.0% Load</div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2">
              <div className="h-full rounded-full bg-indigo-600" style={{ width: '84%' }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500">Operations & Logistics</span>
            <div className="text-base font-bold text-slate-900 mt-1">79.2% Load</div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2">
              <div className="h-full rounded-full bg-indigo-600" style={{ width: '79.2%' }} />
            </div>
          </div>
        </div>

        {/* Project Resource Utilization Table */}
        <div className="rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Project Initiative</th>
                  <th className="px-4 py-3">Department & Lead</th>
                  <th className="px-4 py-3 text-right">Hours Budgeted / Utilized</th>
                  <th className="px-4 py-3 text-center">Utilization</th>
                  <th className="px-4 py-3 text-right">Budget Spent</th>
                  <th className="px-4 py-3 text-center">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((proj) => {
                  const util = Math.round((proj.hoursUtilized / proj.hoursAllocatedTotal) * 100);
                  return (
                    <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {proj.projectName}
                        <div className="text-[10px] font-mono text-indigo-600 font-normal">{proj.code}</div>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {proj.leadEmployee}
                        <div className="text-[10px] text-slate-500">{proj.department} ({proj.teamSize} staff)</div>
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-slate-900">
                        {proj.hoursUtilized} / {proj.hoursAllocatedTotal} hrs
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-mono font-bold text-xs ${
                            util >= 95 ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {util}%
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        ${proj.budgetSpent.toLocaleString()} / ${proj.budgetAllocated.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            proj.health === 'optimal'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {proj.health}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
