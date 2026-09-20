import React, { useState } from 'react';
import {
  Bot,
  Sliders,
  Eye,
  ShieldCheck,
  AlertTriangle,
  History,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { AgenticUXState } from '../types';

interface AgenticUXStudioViewProps {
  patterns: AgenticUXState[];
  onTriggerRollback: (agentId: string, timestamp: string) => void;
}

export const AgenticUXStudioView: React.FC<AgenticUXStudioViewProps> = ({ patterns, onTriggerRollback }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(patterns[0]?.id || 'ag-ux-01');
  const agent = patterns.find((p) => p.id === selectedAgentId) || patterns[0];
  const [autonomyLevel, setAutonomyLevel] = useState<number>(agent?.autonomyLevel || 75);
  const [showIntentModal, setShowIntentModal] = useState(false);
  const [generativeUiPayload, setGenerativeUiPayload] = useState<string | null>(null);
  const [isGeneratingUi, setIsGeneratingUi] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-600" />
            <span>Agentic UX & Generative UI (A2UI / AG-UI) Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Implementation of the 6 Agentic UX Patterns for trust cultivation and dynamic Generative UI rendering.
          </p>
        </div>

        <button
          onClick={() => {
            setIsGeneratingUi(true);
            setTimeout(() => {
              setGenerativeUiPayload(
                `{\n  "protocol": "A2UI/1.0",\n  "type": "DeclarativeComponentStream",\n  "components": [\n    {\n      "component": "InteractiveDataGrid",\n      "title": "Air Freight Re-routed Shipments (PO-9941 to PO-9945)",\n      "props": { "carrier": "Singapore Airlines Cargo", "surchargeUSD": 18400, "eta": "2026-09-22" }\n    }\n  ]\n}`
              );
              setIsGeneratingUi(false);
            }, 800);
          }}
          disabled={isGeneratingUi}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGeneratingUi ? 'Streaming A2UI Payload...' : 'Simulate Generative UI Stream'}</span>
        </button>
      </div>

      {/* 6 Patterns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pattern 1: Autonomy Dial */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>1. Autonomy Dial</span>
            </h3>
            <span className="text-xs font-mono font-bold text-indigo-600">{autonomyLevel}%</span>
          </div>

          <p className="text-xs text-slate-500">
            Control agent independence from Draft Mode (0%) to Full Autonomous Execution (100%).
          </p>

          <input
            type="range"
            min="0"
            max="100"
            value={autonomyLevel}
            onChange={(e) => setAutonomyLevel(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 font-mono">
            <span>0% Draft</span>
            <span>50% Human Oversight</span>
            <span>100% Autonomous</span>
          </div>
        </div>

        {/* Pattern 2: Intent Preview */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>2. Intent Preview</span>
            </h3>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
              {agent.intentPreview.riskTier} RISK
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Non-destructive preview of planned steps before committing changes.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-900">{agent.intentPreview.actionName}</div>
            <div className="text-slate-600 text-[11px]">{agent.intentPreview.targetResource}</div>
          </div>

          <button
            onClick={() => setShowIntentModal(true)}
            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Review & Approve Intent Steps
          </button>
        </div>

        {/* Pattern 3: Explainable Rationale */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>3. Explainable Rationale</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {(agent.confidenceSignal.score * 100).toFixed(0)}% Certainty
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Transparent exposition of rules, knowledge base citations, and reasoning.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-2">
            <div className="text-slate-700 font-medium">{agent.explainableRationale.algorithmReasoning}</div>
            <div className="text-slate-500 font-mono text-[10px]">
              Source: {agent.explainableRationale.sourceKnowledgeBase}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log & Generative UI Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pattern 5 & 6: Action Audit & Escalation */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <History className="w-4 h-4 text-indigo-600" />
            <span>5. Action Audit & 1-Click Rollback Timeline</span>
          </h3>

          <div className="space-y-2 text-xs">
            {agent.actionAuditLog.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>
                {log.rollbackAvailable && (
                  <button
                    onClick={() => onTriggerRollback(agent.id, log.timestamp)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[10px] transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Rollback</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generative UI Payload Stream (A2UI / AG-UI) */}
        <div className="p-5 bg-slate-950 text-white rounded-2xl border border-indigo-900/50 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-indigo-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>A2UI Protocol Stream - Declarative Generative UI</span>
            </span>
          </div>

          {generativeUiPayload ? (
            <pre className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 text-[11px] overflow-x-auto">
              {generativeUiPayload}
            </pre>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Click &quot;Simulate Generative UI Stream&quot; above to stream declarative components.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
