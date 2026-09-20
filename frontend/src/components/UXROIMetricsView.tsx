import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { UXUsabilityBenchmark } from '../types';

interface UXROIMetricsViewProps {
  benchmarks: UXUsabilityBenchmark[];
}

export const UXROIMetricsView: React.FC<UXROIMetricsViewProps> = ({ benchmarks }) => {
  // Calculator Form State
  const [usersCount, setUsersCount] = useState<number>(250);
  const [hourlyRateUSD, setHourlyRateUSD] = useState<number>(65);
  const [minutesSavedPerDay, setMinutesSavedPerDay] = useState<number>(18);
  const [errorRateReductionPercent, setErrorRateReductionPercent] = useState<number>(45);

  // Financial ROI Calculation
  const annualWorkDays = 240;
  const hoursSavedPerYearPerUser = (minutesSavedPerDay * annualWorkDays) / 60;
  const totalDirectTimeSavingsUSD = usersCount * hoursSavedPerYearPerUser * hourlyRateUSD;
  const errorRiskMitigationUSD = (totalDirectTimeSavingsUSD * (errorRateReductionPercent / 100)) * 0.5;
  const totalNetAnnualROIUSD = totalDirectTimeSavingsUSD + errorRiskMitigationUSD;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Usability Benchmarking & Financial UX ROI Model</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System Usability Scale (SUS), UMUX-Lite, NASA Task Load Index (TLX), and bottom-line workforce productivity ROI.
          </p>
        </div>
      </div>

      {/* Usability & Cognitive Benchmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benchmarks.map((bench) => (
          <div key={bench.id} className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">{bench.moduleName}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                SUS: {bench.susScore} / 100
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">UMUX-Lite</span>
                <span className="font-bold text-indigo-700 font-mono text-sm">{bench.umuxLiteScore}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">Mental Demand</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{bench.nasaTlxWorkload.mentalDemand}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">Error Rate</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">{bench.operationalMetrics.userErrorRate}%</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-center justify-between text-xs font-semibold text-indigo-950">
              <span>Annual Reclaimed Productivity Value:</span>
              <span className="font-mono text-emerald-700 font-bold">${bench.operationalMetrics.annualDollarsSaved.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Financial UX ROI Model Calculator */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>Interactive Enterprise UX ROI Calculator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Calculate quantifiable operational savings from cognitive friction reduction.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Active Workforce Size</label>
            <input
              type="number"
              value={usersCount}
              onChange={(e) => setUsersCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-mono text-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Avg Fully-Loaded Hourly Rate ($)</label>
            <input
              type="number"
              value={hourlyRateUSD}
              onChange={(e) => setHourlyRateUSD(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-mono text-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Time Saved / User / Day (Mins)</label>
            <input
              type="number"
              value={minutesSavedPerDay}
              onChange={(e) => setMinutesSavedPerDay(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-mono text-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Error Reduction Target (%)</label>
            <input
              type="number"
              value={errorRateReductionPercent}
              onChange={(e) => setErrorRateReductionPercent(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-mono text-sm"
            />
          </div>
        </div>

        {/* Calculated Results Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-300">
              Projected Total Annual Financial ROI
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
              ${totalNetAnnualROIUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Includes ${totalDirectTimeSavingsUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} in direct time savings + ${errorRiskMitigationUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} in risk mitigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
