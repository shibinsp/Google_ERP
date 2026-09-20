import React from 'react';
import {
  Sparkles,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Repeat,
  Layers,
  Compass,
} from 'lucide-react';

export const ExecutiveBISynthesis: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" /> Strategic Synergy Model
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mt-1.5">
            <Compass className="w-5 h-5 text-purple-600" />
            <span>Cross-Domain Business Intelligence: Working Capital & Growth Correlation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical correlation demonstrating how inventory turnover acceleration directly liberated cash to fund +30.3% YoY revenue expansion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-right">
            <span className="text-[10px] text-purple-700 uppercase font-semibold block">Synergy Multiple</span>
            <span className="text-sm font-bold font-mono text-purple-900">3.5x Capital Velocity</span>
          </div>
        </div>
      </div>

      {/* 3 Pillar Strategic Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
              1
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold">
              -16 Days DSI
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-900">1. Supply Chain Compression</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            By shifting from quarterly batch ordering to automated velocity-based replenishment, fleet turnover increased from <strong className="text-slate-900">6.4x to 8.6x</strong>, compressing warehouse dwell time from 57 days down to 41 days.
          </p>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Holding Cost Reduction:</span>
            <span className="font-mono font-bold text-emerald-700">-4.7% per annum</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              2
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold">
              +$485k Liquidity
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-900">2. Working Capital Liberation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Reduced dead stock across raw materials and packaging unlocked <strong className="text-slate-900">$485,000 in immediate cash flow</strong> without dilutive equity financing or credit line borrowing, boosting Treasury reserves to $2.89M.
          </p>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Cash-to-Cash Cycle:</span>
            <span className="font-mono font-bold text-indigo-700">34 Days Net</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
              3
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono font-bold">
              +30.3% YoY
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-900">3. Non-Dilutive Growth Funding</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Liberated capital was redirected directly into high-margin Finished Goods (Edge Chassis & Industrial Cortex-M7), driving quarterly revenues from <strong className="text-slate-900">$1.55M to $2.02M</strong> with gross margins widening to 57.8%.
          </p>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Margin Expansion:</span>
            <span className="font-mono font-bold text-purple-700">+440 bps YoY</span>
          </div>
        </div>
      </div>

      {/* Strategic Takeaway Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-white">Executive Strategic Directive for Q4 2026</span>
          </div>
          <p className="text-slate-300 max-w-3xl">
            Target a catalog turnover of <strong className="text-white">9.1x</strong> in Q4 by synchronizing JIT supplier buffers for NXP Cortex-M7 and optical transceivers. This will liberate an additional <strong className="text-emerald-400">+$95,000 in working capital</strong> and support FY2026 revenue crossing the <strong className="text-white">$7.66M</strong> target threshold.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-center font-mono">
            <span className="text-[10px] text-slate-300 block">FY26 Projected Target</span>
            <span className="font-bold text-emerald-300 text-sm">$7,660,000</span>
          </div>
        </div>
      </div>
      {/* EMPIRICAL ROI & VALUE REALIZATION GRID */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Empirical ROI & Business Impact Benchmarks</span>
            </h3>
            <p className="text-xs text-slate-500">Gartner, McKinsey, & PwC real-world value realization metrics</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            Total Financial Lift: $3,540,000 / yr
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {[
            { title: 'Financial Close Speed', current: '3.2 Days', baseline: '11.5 Days', imp: '72% Faster', domain: 'Gartner Benchmark' },
            { title: 'O2C Touchless Cash', current: '94.2%', baseline: '38.0%', imp: '147% Lift', domain: 'Accounts Receivable' },
            { title: 'Demand Forecast Acc.', current: '91.8%', baseline: '68.4%', imp: '+34% Accuracy', domain: 'McKinsey Metric' },
            { title: 'Workflow MTTR Incident', current: '42 Mins', baseline: '4.5 Hours', imp: '84% MTTR Cut', domain: 'EAAF Architecture' },
            { title: 'P2P Processing Time', current: '1.4 Days', baseline: '8.2 Days', imp: '83% Speedup', domain: 'Procurement' },
          ].map((m, idx) => (
            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-750 space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">{m.title}</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white font-mono">{m.current}</div>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-slate-400">Base: {m.baseline}</span>
                <span className="text-emerald-600 font-bold">{m.imp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
