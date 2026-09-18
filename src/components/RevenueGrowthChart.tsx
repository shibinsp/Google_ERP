import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  QUARTERLY_YOY_REVENUE,
  MONTHLY_YOY_REVENUE,
} from '../data/financialAnalyticsData';

export const RevenueGrowthChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<'quarterly' | 'monthly' | 'breakdown'>('quarterly');

  // Custom Rich Tooltip for Quarterly YoY Chart
  const CustomQuarterlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

      const delta = data.fy2026Revenue - data.fy2025Revenue;

      return (
        <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl shadow-xl text-xs space-y-2 min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-900">{data.periodLabel}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              +{data.yoyGrowthRate}% YoY
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-slate-500">
              <span>FY2025 Revenue:</span>
              <span className="font-mono font-medium text-slate-700">
                ${(data.fy2025Revenue / 1000).toLocaleString()}k
              </span>
            </div>
            <div className="flex justify-between items-center font-semibold text-slate-900">
              <span>FY2026 Revenue:</span>
              <span className="font-mono text-indigo-600 font-bold">
                ${(data.fy2026Revenue / 1000).toLocaleString()}k
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-700 text-[11px] pt-0.5 border-t border-slate-100">
              <span>Incremental Expansion:</span>
              <span className="font-mono font-bold">+${(delta / 1000).toLocaleString()}k</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 text-[11px] space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Gross Margin:</span>
              <span className="font-mono font-bold text-slate-800">
                {data.grossMargin2025}% → {data.grossMargin2026}% (+{(data.grossMargin2026 - data.grossMargin2025).toFixed(1)}%)
              </span>
            </div>
            <div className="text-[10px] text-slate-500 italic mt-1 leading-snug">
              Driver: {data.growthDriver}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Monthly Tooltip
  const CustomMonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;
      const diff = data.fy26 - data.fy25;

      return (
        <div className="bg-white border border-slate-200/90 p-3 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span className="font-bold text-slate-900">{label} Comparison</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              +{data.yoyGrowth}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">FY2025:</span>
            <span className="font-mono text-slate-700">${(data.fy25 / 1000).toLocaleString()}k</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">FY2026:</span>
            <span className="font-mono font-bold text-indigo-600">${(data.fy26 / 1000).toLocaleString()}k</span>
          </div>
          <div className="flex justify-between items-center text-emerald-700 font-medium pt-0.5 border-t border-slate-100">
            <span>Net Delta:</span>
            <span className="font-mono font-bold">+${(diff / 1000).toLocaleString()}k</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 text-[10px]">
            <span>Gross Margin:</span>
            <span className="font-mono font-semibold text-slate-800">{data.margin26}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
      {/* Header & High-Level KPIs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Executive Business Intelligence
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mt-1.5">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Year-over-Year (YoY) Revenue Growth & Margin Expansion</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative performance telemetry measuring FY2025 baseline actuals against FY2026 enterprise expansion and product line velocity.
          </p>
        </div>

        {/* Executive Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Q3 YoY Growth</span>
            <div className="text-base font-bold text-emerald-700 font-mono mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" /> +30.3%
            </div>
          </div>
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Gross Margin 2026</span>
            <div className="text-base font-bold text-indigo-700 font-mono mt-0.5">
              56.4% <span className="text-[10px] font-normal text-slate-500">(+3.6% pts)</span>
            </div>
          </div>
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Net YoY Revenue Delta</span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              +$1.70M
            </div>
          </div>
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Projected FY2026</span>
            <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
              $7.66M
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('quarterly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              viewMode === 'quarterly'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quarterly YoY Growth
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              viewMode === 'monthly'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Run-Rate Trajectory
          </button>
          <button
            onClick={() => setViewMode('breakdown')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              viewMode === 'breakdown'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hardware vs Software SLA
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" /> FY2025 Baseline
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block" /> FY2026 Expansion
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-emerald-500 inline-block" /> YoY Growth Rate (%)
          </span>
        </div>
      </div>

      {/* Chart Visualizer */}
      <div className="h-80 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'quarterly' ? (
            <ComposedChart
              data={QUARTERLY_YOY_REVENUE}
              margin={{ top: 15, right: 35, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="periodLabel"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickMargin={8}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                tick={{ fontSize: 11, fill: '#10b981' }}
                tickFormatter={(val) => `+${val}%`}
                domain={[15, 35]}
              />
              <Tooltip content={<CustomQuarterlyTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: 11, color: '#64748b' }}
              />

              {/* FY2025 Bar */}
              <Bar
                yAxisId="left"
                dataKey="fy2025Revenue"
                name="FY2025 Revenue"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
                barSize={34}
              />

              {/* FY2026 Bar */}
              <Bar
                yAxisId="left"
                dataKey="fy2026Revenue"
                name="FY2026 Revenue"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                barSize={34}
              />

              {/* YoY Growth % Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="yoyGrowthRate"
                name="YoY Growth Rate (%)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, fill: '#059669' }}
              />

              <ReferenceLine
                yAxisId="right"
                y={25}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: 'Board Target (25% Growth)',
                  fill: '#059669',
                  fontSize: 10,
                  position: 'top',
                }}
              />
            </ComposedChart>
          ) : viewMode === 'monthly' ? (
            <ComposedChart
              data={MONTHLY_YOY_REVENUE}
              margin={{ top: 15, right: 35, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickMargin={8}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                tick={{ fontSize: 11, fill: '#10b981' }}
                tickFormatter={(val) => `+${val}%`}
                domain={[20, 35]}
              />
              <Tooltip content={<CustomMonthlyTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: 11, color: '#64748b' }}
              />

              <Bar
                yAxisId="left"
                dataKey="fy25"
                name="FY2025 Actuals"
                fill="#cbd5e1"
                radius={[3, 3, 0, 0]}
                barSize={18}
              />
              <Bar
                yAxisId="left"
                dataKey="fy26"
                name="FY2026 Actuals / Run-Rate"
                fill="#6366f1"
                radius={[3, 3, 0, 0]}
                barSize={18}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="yoyGrowth"
                name="YoY Monthly Growth Rate (%)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981' }}
              />
            </ComposedChart>
          ) : (
            /* Breakdown view: Hardware vs Software Recurring */
            <ComposedChart
              data={QUARTERLY_YOY_REVENUE}
              margin={{ top: 15, right: 35, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="periodLabel"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomQuarterlyTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: 11, color: '#64748b' }}
              />

              <Bar
                dataKey="hardwareRevenue2026"
                stackId="a"
                name="Hardware Platforms & Edge Chassis ($)"
                fill="#4f46e5"
                radius={[0, 0, 0, 0]}
                barSize={38}
              />
              <Bar
                dataKey="softwareServicesRevenue2026"
                stackId="a"
                name="Firmware Licensing & Enterprise SLA ($)"
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
                barSize={38}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Strategic Quarter-over-Quarter Driver Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {QUARTERLY_YOY_REVENUE.map((q) => (
          <div
            key={q.period}
            className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">{q.period} Fiscal</span>
              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100/70 text-emerald-800">
                +{q.yoyGrowthRate}% YoY
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Revenue:</span>
              <span className="font-mono font-bold text-slate-900">
                ${(q.fy2026Revenue / 1000).toLocaleString()}k
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Gross Margin:</span>
              <span className="font-mono font-semibold text-indigo-700">{q.grossMargin2026}%</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 leading-tight">
              {q.growthDriver}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
