import React, { useState } from 'react';
import {
  CloudCog,
  Code2,
  Terminal,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Search,
  Database,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { MCPTool } from '../types';

interface MCPIntegrationViewProps {
  tools: MCPTool[];
  onTestMCPTool: (toolId: string) => void;
}

export const MCPIntegrationView: React.FC<MCPIntegrationViewProps> = ({ tools, onTestMCPTool }) => {
  const [selectedTool, setSelectedTool] = useState<MCPTool>(tools[0] || {} as MCPTool);
  const [testPayload, setTestPayload] = useState<string>('{\n  "jsonrpc": "2.0",\n  "method": "tools/call",\n  "params": {\n    "name": "get_trial_balance_schema",\n    "arguments": {\n      "asOfDate": "2026-09-19"\n    }\n  },\n  "id": 1\n}');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunMCPTest = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setTestResponse(
        JSON.stringify(
          {
            jsonrpc: '2.0',
            result: {
              status: 'success',
              semanticContextEnriched: true,
              zeroDataRetained: true,
              oauthScope: selectedTool.rbacPermission || 'finance_controller',
              payloadData: {
                asOfDate: '2026-09-19',
                totalGeneralLedgerAssetsUSD: 14850000.00,
                cashEquivalentsUSD: 1420000.00,
                accountsReceivableNetUSD: 980000.00,
                trialBalanceStatus: 'balanced',
              },
            },
            id: 1,
          },
          null,
          2
        )
      );
      setIsExecuting(false);
      onTestMCPTool(selectedTool.id);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-blue-700/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2.5 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-400/30">
                <CloudCog className="w-7 h-7 text-blue-300" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Model Context Protocol (MCP) Integration Standard</h1>
                <p className="text-sm text-blue-200/80">
                  Universal "USB-C Port for AI" Architecture & JSON-RPC 2.0 Execution Proxy
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-300/70 max-w-2xl mt-1">
              Replaces brittle custom point-to-point APIs with open-source MCP client-server protocol. Dynamically exposes ERP schemas, enforces zero data retention, and bridges the Context Gap for LLMs.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-blue-950/60 p-3 rounded-xl border border-blue-800/60 backdrop-blur-md">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div className="text-xs">
              <div className="font-bold text-white">OAuth 2.1 & Zero Retention</div>
              <div className="text-blue-300">Stateless Proxy Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* MCP Execution Sequence Infographic */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>MCP 5-Step Execution Flow Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {[
            { step: '1. Capability Discovery', desc: 'Agent queries MCP Client to discover available tools and schemas' },
            { step: '2. Dynamic Tool Gen', desc: 'MCP Server generates JSON Schema directly from live ERP records' },
            { step: '3. Intent Selection', desc: 'LLM maps user prompt goals to discovered tool definitions' },
            { step: '4. JSON-RPC Call', desc: 'Client dispatches structured JSON-RPC 2.0 message payload' },
            { step: '5. Policy & Execution', desc: 'Stateless proxy executes call under RBAC & returns semantic data' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-blue-50/50 dark:bg-slate-800/40 rounded-lg border border-blue-100 dark:border-slate-750 relative">
              <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">{item.step}</div>
              <div className="text-gray-600 dark:text-slate-400 text-[11px] leading-tight">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Tool List & Live Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Available MCP Tools Explorer */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2 text-sm">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Discovered MCP Tools & Schemas</span>
            </h3>
            <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
              {tools.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTool.id === tool.id
                    ? 'bg-blue-50/80 border-blue-500 shadow-md dark:bg-blue-950/40 dark:border-blue-700'
                    : 'bg-gray-50/50 border-gray-200 hover:border-blue-300 dark:bg-slate-800/30 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-blue-900 dark:text-blue-300">{tool.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {tool.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2">{tool.description}</p>
                <div className="flex items-center justify-between mt-3 text-[11px] text-gray-500 dark:text-slate-400">
                  <span className="font-mono text-purple-600 dark:text-purple-400">RBAC: {tool.rbacPermission}</span>
                  <span>{tool.callCount24h.toLocaleString()} calls / 24h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JSON-RPC Inspector & Execution Console */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2 text-sm">
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>MCP Client JSON-RPC 2.0 Live Console</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Tool: <span className="font-mono font-bold text-purple-600">{selectedTool.name}</span></p>
            </div>

            <button
              onClick={handleRunMCPTest}
              disabled={isExecuting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              {isExecuting ? <Zap className="w-4 h-4 animate-spin" /> : <Code2 className="w-4 h-4" />}
              <span>{isExecuting ? 'Executing RPC...' : 'Dispatch MCP Call'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                JSON-RPC 2.0 Payload (Request)
              </label>
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                rows={6}
                className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {testResponse && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>MCP Server Enriched Response (Response)</span>
                  <span className="text-emerald-600 font-mono text-[11px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>200 OK • Zero Retention Verified</span>
                  </span>
                </label>
                <pre className="p-3 font-mono text-xs bg-slate-950 text-blue-300 rounded-xl border border-slate-800 overflow-x-auto max-h-56">
                  {testResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
