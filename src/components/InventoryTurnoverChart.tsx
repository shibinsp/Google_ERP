import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Boxes,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  INVENTORY_TURNOVER_TRENDS,
  CATEGORY_TURNOVER_DETAILS,
} from '../data/financialAnalyticsData';
import { InventoryItem } from '../types';

interface InventoryTurnoverChartProps {
  inventory: InventoryItem[];
}

export const InventoryTurnoverChart: React.FC<InventoryTurnoverChartProps> = ({ inventory }) => {
  const [activeTab, setActiveTab] = useState<'velocity' | 'working_capital' | 'categories'>('velocity');

  // Dynamic calculations from current live inventory
  const liveAvgTurnover = (
    inventory.reduce((sum, i) => sum + i.turnoverRatio, 0) / (inventory.length || 1)
  ).toFixed(1);

  const liveAvgDsi = Math.round(
    inventory.reduce((sum, i) => sum + i.daysSalesOfInventory, 0) / (inventory.length || 1)
  );

  const totalCurrentStockValue = inventory.reduce((sum, i) => sum + i.currentStock * i.unitCost, 0);

  // Custom Tooltip for Velocity & DSI
  const CustomTurnoverTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

      return (
        <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl shadow-xl text-xs space-y-2 min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-900">{data.periodLabel}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {data.turnoverRatio}x Turnover
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Turnover Velocity:</span>
              <span className="font-mono font-bold text-emerald-700">{data.turnoverRatio}x / year</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Days Sales of Inventory (DSI):</span>
              <span className="font-mono font-bold text-slate-900">{data.daysSalesOfInventory} Days</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Inventory Valuation:</span>
              <span className="font-mono font-medium text-slate-700">
                ${(data.inventoryValuation / 1000).toLocaleString()}k
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Quarterly COGS:</span>
              <span className="font-mono font-medium text-slate-700">
                ${(data.cogsQuarterly / 1000).toLocaleString()}k
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 text-[11px] space-y-1">
            <div className="flex justify-between items-center text-indigo-700 font-semibold">
              <span>Cumulative Capital Freed:</span>
              <span className="font-mono font-bold">+${(data.workingCapitalFreed / 1000).toLocaleString()}k</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 text-[10px]">
              <span>Inventory Carrying Cost Rate:</span>
              <span className="font-mono text-slate-700">{data.holdingCostRate}% / yr</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Categories
  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

      return (
        <div className="bg-white border border-slate-200/90 p-3 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span className="font-bold text-slate-900">{data.category}</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-indigo-50 text-indigo-700">
              {data.velocityRating}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Turnover Ratio:</span>
            <span className="font-mono font-bold text-emerald-700">{data.turnoverRatio}x / yr</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Days Sales of Inv (DSI):</span>
            <span className="font-mono font-bold text-slate-900">{data.daysSalesOfInventory} Days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Industry Peer Benchmark:</span>
            <span className="font-mono text-slate-600">{data.benchmarkRatio}x / yr</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-slate-500 text-[10px]">
            <span>Current Capital In Stock:</span>
            <span className="font-mono font-semibold text-slate-800">${(data.inventoryValue / 1000).toLocaleString()}k</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
      {/* Header & Metric Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Working Capital Optimization
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mt-1.5">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Inventory Turnover Trends & Working Capital Velocity</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time annualized turnover ratios, cash-to-cash cycle days (DSI), carrying cost compression, and liberated operational liquidity.
          </p>
        </div>

        {/* Turnover KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Catalog Avg Turnover</span>
            <div className="text-base font-bold text-emerald-700 font-mono mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" /> {liveAvgTurnover}x / yr
            </div>
          </div>
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Days Sales Inv (DSI)</span>
            <div className="text-base font-bold text-indigo-700 font-mono mt-0.5 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4 text-emerald-600" /> {liveAvgDsi} Days
            </div>
          </div>
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Working Capital Freed</span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              +$485,000
            </div>
          </div>
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Carrying Value</span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              ${(totalCurrentStockValue / 1000).toFixed(0)}k
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('velocity')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'velocity'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Turnover Ratio vs DSI Timeline
          </button>
          <button
            onClick={() => setActiveTab('working_capital')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'working_capital'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Working Capital Freed & Valuation
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'categories'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Category Velocity Matrix
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-emerald-600 inline-block" /> Turnover Ratio (turns/yr)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-indigo-600 inline-block" /> Days Sales Inv (DSI)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-200 inline-block" /> Inventory Valuation
          </span>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="h-80 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'velocity' ? (
            <ComposedChart
              data={INVENTORY_TURNOVER_TRENDS}
              margin={{ top: 15, right: 35, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="periodLabel"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickMargin={8}
              />
              {/* Left Y Axis: Turnover Ratio */}
              <YAxis
                yAxisId="turns"
                stroke="#059669"
                tick={{ fontSize: 11, fill: '#059669' }}
                domain={[5, 11]}
                tickFormatter={(val) => `${val}x`}
              />
              {/* Right Y Axis: DSI Days */}
              <YAxis
                yAxisId="dsi"
                orientation="right"
                stroke="#4f46e5"
                tick={{ fontSize: 11, fill: '#4f46e5' }}
                domain={[30, 65]}
                tickFormatter={(val) => `${val}d`}
              />
              <Tooltip content={<CustomTurnoverTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: 11, color: '#64748b' }}
              />

              {/* Turnover Ratio Line */}
              <Line
                yAxisId="turns"
                type="monotone"
                dataKey="turnoverRatio"
                name="Annualized Turnover Ratio (x)"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, fill: '#047857' }}
              />

              {/* Days Sales of Inventory Line */}
              <Line
                yAxisId="dsi"
                type="monotone"
                dataKey="daysSalesOfInventory"
                name="Days Sales of Inventory (DSI Days)"
                stroke="#4f46e5"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#4f46e5' }}
                activeDot={{ r: 6, fill: '#4338ca' }}
              />

              {/* Industry Benchmark Turnover */}
              <ReferenceLine
                yAxisId="turns"
                y={7.5}
                stroke="#059669"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: 'Peer Benchmark (7.5x)',
                  fill: '#059669',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />

              {/* Industry Benchmark DSI */}
              <ReferenceLine
                yAxisId="dsi"
                y={48}
                stroke="#6366f1"
                strokeDasharray="2 2"
                strokeWidth={1}
                label={{
                  value: 'Target DSI (≤ 48d)',
                  fill: '#6366f1',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
            </ComposedChart>
          ) : activeTab === 'working_capital' ? (
            <ComposedChart
              data={INVENTORY_TURNOVER_TRENDS}
              margin={{ top: 15, right: 35, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="capitalFreedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="periodLabel"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickMargin={8}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTurnoverTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: 11, color: '#64748b' }}
              />

              {/* Inventory Valuation Bar */}
              <Bar
                dataKey="inventoryValuation"
                name="Inventory Carrying Valuation ($)"
                fill="#cbd5e1"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />

              {/* Working Capital Freed Area */}
              <Area
                type="monotone"
                dataKey="workingCapitalFreed"
                name="Cumulative Working Capital Freed ($)"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#capitalFreedGrad)"
              />
            </ComposedChart>
          ) : (
            /* Category Velocity Matrix Bar Chart */
            <BarChart
              data={CATEGORY_TURNOVER_DETAILS}
              layout="vertical"
              margin={{ top: 15, right: 35, left: 50, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `${val}x`}
                domain={[0, 15]}
              />
              <YAxis
                dataKey="category"
                type="category"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 500 }}
                width={150}
              />
              <Tooltip content={<CustomCategoryTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: 11, color: '#64748b' }}
              />

              <Bar
                dataKey="turnoverRatio"
                name="Current Category Turnover (x/yr)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {CATEGORY_TURNOVER_DETAILS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>

              <ReferenceLine
                x={7.5}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{
                  value: 'Enterprise Target (7.5x)',
                  fill: '#dc2626',
                  fontSize: 10,
                  position: 'insideTop',
                }}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
        {CATEGORY_TURNOVER_DETAILS.map((cat) => (
          <div
            key={cat.category}
            className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 truncate" title={cat.category}>
                {cat.category}
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Turnover:</span>
              <span className="font-mono font-bold text-emerald-700">{cat.turnoverRatio}x / yr</span>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Runway (DSI):</span>
              <span className="font-mono font-semibold text-slate-800">{cat.daysSalesOfInventory} Days</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>Velocity:</span>
              <span className="font-semibold text-indigo-700">{cat.velocityRating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
