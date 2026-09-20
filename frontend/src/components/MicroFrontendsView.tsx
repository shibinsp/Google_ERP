import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Activity,
  Globe,
  Share2,
} from 'lucide-react';
import { MicroFrontendConfig } from '../types';

interface MicroFrontendsViewProps {
  remotes: MicroFrontendConfig[];
}

export const MicroFrontendsView: React.FC<MicroFrontendsViewProps> = ({ remotes }) => {
  const [selectedRemoteId, setSelectedRemoteId] = useState<string>(remotes[0]?.id || 'mfe-01');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedRemote = remotes.find((r) => r.id === selectedRemoteId) || remotes[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>Webpack Module Federation Micro-Frontend Orchestrator</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Runtime dynamic code loading, shared singleton dependencies, and independent release cadence.
          </p>
        </div>

        <button
          onClick={() => {
            setIsRefreshing(true);
            setTimeout(() => setIsRefreshing(false), 700);
          }}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Ping Remotes</span>
        </button>
      </div>

      {/* Remotes Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {remotes.map((rem) => (
          <div
            key={rem.id}
            onClick={() => setSelectedRemoteId(rem.id)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              rem.id === selectedRemoteId
                ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-bold block">{rem.name}</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>ONLINE ({rem.latencyMs}ms)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Scope:</span>
                <span className="font-mono font-semibold text-slate-800">{rem.scope}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Filename:</span>
                <span className="font-mono font-semibold text-slate-800">{rem.filename}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Module Federation Inspector */}
      {selectedRemote && (
        <div className="p-6 bg-slate-950 text-white rounded-2xl border border-indigo-900/50 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-indigo-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>webpack.config.js - ModuleFederationPlugin ({selectedRemote.scope})</span>
            </span>
            <span className="text-emerald-400 text-[11px]">Dynamic Module Injection Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="font-bold text-slate-400 block mb-2 text-[11px]">Exposed Runtime Modules:</span>
              <div className="space-y-1.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                {Object.entries(selectedRemote.exposedModules).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-slate-800/60 text-[11px]">
                    <span className="text-indigo-300 font-bold">{key}</span>
                    <span className="text-slate-400">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-400 block mb-2 text-[11px]">Shared Singleton Dependencies:</span>
              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                {selectedRemote.sharedDependencies.map((dep) => (
                  <span key={dep} className="px-2.5 py-1 rounded bg-slate-800 text-indigo-300 font-bold text-[10px] border border-slate-700">
                    {dep} (singleton)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
