import React, { useState } from 'react';
import {
  Boxes,
  Network,
  ListFilter,
  Layers,
  ArrowRight,
  Shield,
  Zap,
  Tag,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { OOUXObject } from '../types';

interface OOUXFrameworkViewProps {
  objects: OOUXObject[];
}

export const OOUXFrameworkView: React.FC<OOUXFrameworkViewProps> = ({ objects }) => {
  const [selectedObjId, setSelectedObjId] = useState<string>(objects[0]?.id || 'ooux-01');
  const [viewMode, setViewMode] = useState<'orca_matrix' | 'heterarchy_graph'>('orca_matrix');

  const selectedObject = objects.find((o) => o.id === selectedObjId) || objects[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-600" />
            <span>Object-Oriented UX (OOUX) & ORCA Framework Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Noun-first architecture: Deconstructing enterprise domains into Objects, Relationships, Calls to Action, and Attributes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setViewMode('orca_matrix')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'orca_matrix' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ORCA Matrix Mode
          </button>
          <button
            onClick={() => setViewMode('heterarchy_graph')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'heterarchy_graph' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Heterarchy Graph Mode
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Object Selection Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Enterprise Domain Objects ({objects.length})
          </h3>
          <div className="space-y-2">
            {objects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => setSelectedObjId(obj.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  obj.id === selectedObjId
                    ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold block">{obj.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                    NOUN
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{obj.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ORCA Detail View */}
        <div className="lg:col-span-3 space-y-6">
          {viewMode === 'orca_matrix' ? (
            <div className="space-y-6">
              {/* Objects Card */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Object Core Definition</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">ID: {selectedObject.id}</span>
                </div>
                <p className="text-xs text-slate-600">{selectedObject.description}</p>
              </div>

              {/* ORCA 4-Pillar Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Attributes Pillar */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    <span>1. Attributes (Metadata & State)</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px]">Core Content:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedObject.attributes.coreContent.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px]">Metadata:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedObject.attributes.metadata.map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px]">State Values:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedObject.attributes.stateValues.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relationships Pillar */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-4 h-4" />
                    <span>2. Relationships (Heterarchy)</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {selectedObject.relationships.map((rel, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">{rel.targetObject}</span>
                          <span className="text-[11px] text-slate-500">{rel.description}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono font-bold text-[10px]">
                          {rel.cardinality}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calls to Action Pillar */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 md:col-span-2">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>3. Calls to Action (Verbs & Permissions)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {selectedObject.callsToAction.map((cta, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">{cta.action}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">Role: {cta.requiredRole}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cta.impact === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cta.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-950 text-white rounded-2xl border border-indigo-900/50 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-indigo-800/40 pb-3">
                <span className="font-bold text-indigo-400">Heterarchy Non-Linear Relationship Graph</span>
                <span className="text-[10px] text-slate-400">OOUX Core Mapping</span>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-line leading-relaxed">
                {`[${selectedObject.name}] (Noun Entity)\n  ├── (Attributes: ${selectedObject.attributes.coreContent.join(', ')})\n  ├── (State Values: ${selectedObject.attributes.stateValues.join(' | ')})\n  ├── (Relationships)\n${selectedObject.relationships.map((r) => `  │    └── [${r.cardinality}] ──> ${r.targetObject} (${r.description})`).join('\n')}\n  └── (Calls to Action)\n${selectedObject.callsToAction.map((c) => `       └── [${c.requiredRole}] ──> ${c.action} (${c.impact.toUpperCase()})`).join('\n')}`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
