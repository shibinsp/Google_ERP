import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bot,
  Zap,
  ShieldCheck,
  FileSpreadsheet,
  Database,
  Layers,
  Sparkles,
  Cpu,
  Trash2,
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'agent' | 'condition' | 'action';
  title: string;
  description: string;
  icon: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  config: Record<string, any>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
}

const PRESET_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'procure-to-pay',
    name: 'Procure-to-Pay Autonomous Pipeline',
    description: 'Auto-detect low stock, draft purchase order, audit with Finance Agent, and notify vendor.',
    nodes: [
      {
        id: 'node-1',
        type: 'trigger',
        title: 'Inventory Threshold Trigger',
        description: 'Fires when SKU stock falls below minimum safety level (< 200 units)',
        icon: 'Zap',
        status: 'idle',
        config: { threshold: 200, checkInterval: '5m' },
      },
      {
        id: 'node-2',
        type: 'agent',
        title: 'Supply Chain Forecaster Agent',
        description: 'Calculates optimal reorder batch size factoring lead time and demand seasonality',
        icon: 'Bot',
        status: 'idle',
        config: { model: 'Gemini 2.5 Flash', maxBudget: '$25,000' },
      },
      {
        id: 'node-3',
        type: 'agent',
        title: 'Finance Controller Vault Agent',
        description: 'Validates budget allocation, checks ledger anomaly risk, and signs PO',
        icon: 'ShieldCheck',
        status: 'idle',
        config: { autoApproveLimit: '$15,000', requireDualKey: false },
      },
      {
        id: 'node-4',
        type: 'action',
        title: '2-Way Google Sheets & ERP Ledger Sync',
        description: 'Writes updated PO and expected inventory delivery date into master sheet',
        icon: 'FileSpreadsheet',
        status: 'idle',
        config: { sheetName: 'Procurement_Log_2026', broadcastSlack: true },
      },
    ],
  },
  {
    id: 'attrition-risk',
    name: 'HR Attrition Early-Warning & Retention',
    description: 'Scans engagement signals, triggers 1-on-1 retention plan, and logs compensation adjustment.',
    nodes: [
      {
        id: 'node-1',
        type: 'trigger',
        title: 'Workforce Telemetry Ingestion',
        description: 'Weekly HR review of sentiment, overtime spikes, and project tenure',
        icon: 'Zap',
        status: 'idle',
        config: { frequency: 'Weekly', minDataPoints: 50 },
      },
      {
        id: 'node-2',
        type: 'agent',
        title: 'HR Attrition Predictor Agent',
        description: 'Scores risk percentile and flags flight-risk key contributors',
        icon: 'Bot',
        status: 'idle',
        config: { riskThreshold: 0.75, explainabilityMode: 'SHAP' },
      },
      {
        id: 'node-3',
        type: 'action',
        title: 'Automated Manager Retention Kit',
        description: 'Dispatches confidential retention guidelines and market comp benchmark',
        icon: 'Database',
        status: 'idle',
        config: { recipientRole: 'Department Head', notifyConfidential: true },
      },
    ],
  },
  {
    id: 'invoice-reconcile',
    name: 'Real-time OCR Invoice Reconciliation',
    description: 'Scans supplier PDF invoices, verifies 3-way PO match, and posts journal entries.',
    nodes: [
      {
        id: 'node-1',
        type: 'trigger',
        title: 'Supplier EDI / PDF Inbound',
        description: 'Catches inbound vendor invoice via email gateway or scanner modal',
        icon: 'Zap',
        status: 'idle',
        config: { allowedFormats: ['PDF', 'XML', 'PNG'] },
      },
      {
        id: 'node-2',
        type: 'agent',
        title: 'Multimodal OCR Extractor Agent',
        description: 'Extracts line items, tax IDs, invoice totals, and bank credentials',
        icon: 'Cpu',
        status: 'idle',
        config: { confidenceThreshold: 0.98 },
      },
      {
        id: 'node-3',
        type: 'condition',
        title: '3-Way Match Verification',
        description: 'Checks Invoice vs Purchase Order vs Goods Receipt voucher',
        icon: 'ShieldCheck',
        status: 'idle',
        config: { tolerancePercent: 0.5 },
      },
      {
        id: 'node-4',
        type: 'action',
        title: 'Post to General Ledger & BigQuery',
        description: 'Commits verified debit/credit transaction to PostgreSQL ERP ledger',
        icon: 'Database',
        status: 'idle',
        config: { ledgerCode: '2100-AP', exportBigQuery: true },
      },
    ],
  },
];

export const WorkflowBuilderView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate>(PRESET_TEMPLATES[0]);
  const [nodes, setNodes] = useState<WorkflowNode[]>(PRESET_TEMPLATES[0].nodes);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(-1);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  const handleSelectTemplate = (tpl: WorkflowTemplate) => {
    setSelectedTemplate(tpl);
    setNodes(tpl.nodes.map((n) => ({ ...n, status: 'idle' })));
    setSimulationStep(-1);
    setSimulationLogs([]);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationLogs(['🚀 Initializing autonomous pipeline execution...']);
    setSimulationStep(0);

    for (let i = 0; i < nodes.length; i++) {
      setSimulationStep(i);
      setNodes((prev) =>
        prev.map((n, idx) => ({
          ...n,
          status: idx === i ? 'running' : idx < i ? 'success' : 'idle',
        }))
      );
      setSimulationLogs((prev) => [
        ...prev,
        `⚡ [${new Date().toLocaleTimeString()}] Executing Step ${i + 1}: ${nodes[i].title}...`,
      ]);

      await new Promise((r) => setTimeout(r, 1400));

      setSimulationLogs((prev) => [
        ...prev,
        `✅ [${new Date().toLocaleTimeString()}] Completed: ${nodes[i].title} with 0 errors.`,
      ]);
    }

    setNodes((prev) => prev.map((n) => ({ ...n, status: 'success' })));
    setSimulationLogs((prev) => [
      ...prev,
      `🎉 Pipeline completed successfully in ${(nodes.length * 1.4).toFixed(1)}s! All database records synchronized.`,
    ]);
    setIsSimulating(false);
    setSimulationStep(-1);
  };

  const getNodeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-indigo-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-cyan-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      default:
        return <Database className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Agentic Workflow & Pipeline Canvas
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                  BPMN 2.0 Engine
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Visually compose and orchestrate autonomous multi-agent pipelines with zero-code triggers and live simulation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Simulating Pipeline...' : 'Test Run Pipeline'}
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESET_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => handleSelectTemplate(tpl)}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              selectedTemplate.id === tpl.id
                ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                {tpl.nodes.length} Connected Nodes
              </span>
              {selectedTemplate.id === tpl.id && (
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              )}
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{tpl.name}</h3>
            <p className="text-xs text-slate-400 line-clamp-2">{tpl.description}</p>
          </button>
        ))}
      </div>

      {/* Canvas Area */}
      <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Active Execution Pipeline: {selectedTemplate.name}
            </h3>
            <span className="text-xs text-slate-400">
              Drag or click nodes to inspect execution schema
            </span>
          </div>

          {/* Connected Flow */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <div
                  className={`flex-1 p-5 rounded-xl border transition-all duration-300 relative ${
                    node.status === 'running'
                      ? 'bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-500/20'
                      : node.status === 'success'
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700/60">
                        {getNodeIcon(node.icon)}
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Step {idx + 1} • {node.type}
                      </span>
                    </div>

                    {node.status === 'running' && (
                      <span className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-semibold animate-pulse">
                        <Sparkles className="w-3 h-3" /> Running
                      </span>
                    )}
                    {node.status === 'success' && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5">{node.title}</h4>
                  <p className="text-xs text-slate-400 mb-3">{node.description}</p>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Config</span>
                    <span className="text-indigo-400 truncate max-w-[140px]">
                      {JSON.stringify(node.config)}
                    </span>
                  </div>
                </div>

                {/* Arrow connector */}
                {idx < nodes.length - 1 && (
                  <div className="flex justify-center items-center py-2 lg:py-0">
                    <div className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Live Simulation Terminal Console */}
      {simulationLogs.length > 0 && (
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              BPMN Simulation Output Stream
            </span>
            <span className="text-slate-500 text-[11px]">JSON-RPC 2.0 Protocol</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
            {simulationLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.startsWith('✅')
                    ? 'text-emerald-400'
                    : log.startsWith('⚡')
                    ? 'text-indigo-300'
                    : log.startsWith('🎉')
                    ? 'text-cyan-300 font-bold'
                    : 'text-slate-400'
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
