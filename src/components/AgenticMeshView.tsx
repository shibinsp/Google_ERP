import React, { useState } from 'react';
import {
  Bot,
  Zap,
  ShieldAlert,
  Play,
  Pause,
  AlertTriangle,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  DollarSign,
  Lock,
  Workflow,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { EAAFAgent } from '../types';

interface AgenticMeshViewProps {
  agents: EAAFAgent[];
  onToggleAgentStatus: (agentId: string) => void;
  onTriggerKillSwitch: (agentId: string) => void;
  onExecuteWorkflowSimulation: () => void;
}

export const AgenticMeshView: React.FC<AgenticMeshViewProps> = ({
  agents,
  onToggleAgentStatus,
  onTriggerKillSwitch,
  onExecuteWorkflowSimulation,
}) => {
  const [selectedClassificationFilter, setSelectedClassificationFilter] = useState<string>('all');
  const [simulationLog, setSimulationLog] = useState<Array<{ timestamp: string; source: string; target: string; message: string; status: string }>>([
    {
      timestamp: '11:14:02',
      source: 'Inventory Reflex Agent',
      target: 'Procurement Utility Agent',
      message: 'Stock Alert: SKU MCU-8842 dropped below reorder buffer (45/150). Requesting replenishment bid evaluation.',
      status: 'success',
    },
    {
      timestamp: '11:14:08',
      source: 'Procurement Utility Agent',
      target: 'Finance Controller Vault',
      message: 'Evaluated 3 supplier bids. Selected Global Semi ($14,200, 2-day SLA, 94% ESG). Token vault verified scope po.create.',
      status: 'success',
    },
    {
      timestamp: '11:14:15',
      source: 'Logistics Strands Agent',
      target: 'Customer Service Bot',
      message: 'Rerouted shipment #SH-402 to bypass canal delay. Updated customer delivery commitment to Friday 09:00 AM.',
      status: 'success',
    },
  ]);

  const [isSimulating, setIsSimulating] = useState(false);

  const filteredAgents = agents.filter((a) => {
    if (selectedClassificationFilter === 'all') return true;
    return a.classification === selectedClassificationFilter;
  });

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const nowStr = new Date().toTimeString().split(' ')[0];
      setSimulationLog((prev) => [
        {
          timestamp: nowStr,
          source: 'EAAF Agentic Coordinator',
          target: 'LangGraph & CrewAI Mesh',
          message: 'Autonomous workflow simulation triggered: Automated 3-way PO matching -> O2C Cash Application -> Fleet Rerouting.',
          status: 'success',
        },
        ...prev,
      ]);
      setIsSimulating(false);
      onExecuteWorkflowSimulation();
    }, 1200);
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'simple_reflex':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">Simple Reflex</span>;
      case 'model_based':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">Model-Based</span>;
      case 'goal_based':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">Goal-Based</span>;
      case 'utility_based':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800">Utility-Based</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Autonomous</span>;
    }
  };

  const activeCount = agents.filter((a) => a.status === 'active' && !a.killSwitchTriggered).length;
  const killSwitchedCount = agents.filter((a) => a.killSwitchTriggered || a.status === 'kill_switched').length;
  const avgUtility = Math.round(agents.reduce((acc, a) => acc + a.utilityScore, 0) / (agents.length || 1));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-purple-700/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2.5 bg-purple-500/20 backdrop-blur-md rounded-xl border border-purple-400/30">
                <Bot className="w-7 h-7 text-purple-300" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Enterprise Agentic Architecture Framework (EAAF)</h1>
                <p className="text-sm text-purple-200/80">
                  Agentic Mesh Orchestration & Multi-Model Serverless Runtime Control Center
                </p>
              </div>
            </div>
            <p className="text-xs text-purple-300/70 max-w-2xl mt-1">
              Manages autonomous goal-directed agents across LangGraph, CrewAI, and Amazon Strands runtimes with OAuth 2.1 RBAC scope isolation, token vaults, and safety kill-switches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium shadow-lg transition-all disabled:opacity-50 text-sm"
            >
              {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isSimulating ? 'Simulating Mesh...' : 'Simulate Autonomous Mesh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Active Agent Mesh</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeCount} / {agents.length}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">100% Isolation Enabled</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 border border-emerald-200 dark:border-emerald-800">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mean Utility Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{avgUtility}%</p>
            <p className="text-xs text-purple-600 font-medium mt-1">Goal Satisfaction Rating</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 border border-purple-200 dark:border-purple-800">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Guardrail Kill-Switches</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{killSwitchedCount} Triggered</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Spend Boundary Enforced</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 border border-amber-200 dark:border-amber-800">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Agent Runtimes</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">3 Frameworks</p>
            <p className="text-xs text-indigo-600 font-medium mt-1">LangGraph, CrewAI, Strands</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 border border-indigo-200 dark:border-indigo-800">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Agent Types' },
            { id: 'simple_reflex', label: 'Simple Reflex' },
            { id: 'model_based', label: 'Model-Based' },
            { id: 'goal_based', label: 'Goal-Based' },
            { id: 'utility_based', label: 'Utility-Based' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedClassificationFilter(f.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedClassificationFilter === f.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Active Autonomous Agents Matrix</h3>
          </div>
          <span className="text-xs font-mono text-gray-500">Showing {filteredAgents.length} Agents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Agent & Domain</th>
                <th className="px-6 py-3.5">Classification & Runtime</th>
                <th className="px-6 py-3.5">Spend Boundary</th>
                <th className="px-6 py-3.5">Last Autonomous Action</th>
                <th className="px-6 py-3.5">Utility Score</th>
                <th className="px-6 py-3.5 text-right">Emergency Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{agent.name}</div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-slate-400">{agent.domain}</span>
                      <span className="text-gray-300 dark:text-slate-600">•</span>
                      <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">{agent.tokenVaultPolicy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div>{getClassificationBadge(agent.classification)}</div>
                      <div className="text-[11px] font-mono text-gray-500">Runtime: {agent.runtime}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs">
                      <span className="font-bold text-gray-900 dark:text-white">${agent.currentSpendUSD.toLocaleString()}</span>
                      <span className="text-gray-400"> / ${agent.maxSpendThresholdUSD.toLocaleString()}</span>
                    </div>
                    <div className="w-24 bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full ${
                          (agent.currentSpendUSD / agent.maxSpendThresholdUSD) > 0.8 ? 'bg-amber-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${Math.min(100, (agent.currentSpendUSD / agent.maxSpendThresholdUSD) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-gray-900 dark:text-slate-200 truncate" title={agent.lastAction}>
                      {agent.lastAction}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{agent.lastActionTimestamp}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="font-bold text-sm text-gray-900 dark:text-white">{agent.utilityScore}%</div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${agent.utilityScore > 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {agent.utilityScore > 90 ? 'Optimal' : 'Standard'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onToggleAgentStatus(agent.id)}
                        className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${
                          agent.status === 'active'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800'
                        }`}
                        title={agent.status === 'active' ? 'Pause Agent' : 'Resume Agent'}
                      >
                        {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => onTriggerKillSwitch(agent.id)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          agent.killSwitchTriggered
                            ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                            : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800'
                        }`}
                      >
                        <span className="flex items-center space-x-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{agent.killSwitchTriggered ? 'KILL-SWITCHED' : 'Kill Switch'}</span>
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inter-Agent Communication Fabric Stream */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Workflow className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Inter-Agent Event Communication Fabric</h3>
          </div>
          <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Event Bus Listening (JSON-RPC)</span>
          </span>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {simulationLog.map((log, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200/60 dark:border-slate-750 flex items-start space-x-3 text-xs">
              <span className="p-1.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg mt-0.5">
                <Activity className="w-4 h-4" />
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900 dark:text-white space-x-2">
                    <span>{log.source}</span>
                    <span className="text-gray-400">➔</span>
                    <span className="text-purple-600 dark:text-purple-400">{log.target}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{log.timestamp}</span>
                </div>
                <p className="text-gray-600 dark:text-slate-300 text-xs">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
