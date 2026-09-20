import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot, Zap, ShieldAlert, Play, Pause, AlertTriangle, Cpu, Layers,
  Activity, CheckCircle2, DollarSign, Lock, Workflow, Sparkles,
  RefreshCw, Trophy, Target, Brain, TrendingUp, TrendingDown,
  BarChart3, Gauge, AlertOctagon, ChevronUp, ChevronDown,
} from 'lucide-react';
import { EAAFAgent } from '../types';
import { erpApi, AgentMetricsAPI, MetricsSummary, LeaderboardEntry } from '../services/api';

interface AgenticMeshViewProps {
  agents: EAAFAgent[];
  onToggleAgentStatus: (agentId: string) => void;
  onTriggerKillSwitch: (agentId: string) => void;
  onExecuteWorkflowSimulation: () => void;
}

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-amber-100 text-amber-800 border-amber-300',
  D: 'bg-orange-100 text-orange-800 border-orange-300',
  F: 'bg-red-100 text-red-800 border-red-300',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500',
  evaluating: 'bg-amber-400 animate-pulse',
  paused: 'bg-slate-400',
  kill_switched: 'bg-red-500',
};

function MetricBar({ label, value, max = 100, color = 'bg-indigo-500', format = (v: number) => `${v}` }: {
  label: string; value: number; max?: number; color?: string; format?: (v: number) => string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
        <span>{label}</span>
        <span className="font-semibold text-slate-700">{format(value)}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export const AgenticMeshView: React.FC<AgenticMeshViewProps> = ({
  agents,
  onToggleAgentStatus,
  onTriggerKillSwitch,
  onExecuteWorkflowSimulation,
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'metrics' | 'leaderboard'>('agents');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [liveAgents, setLiveAgents] = useState<AgentMetricsAPI[]>([]);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [benchmarking, setBenchmarking] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [simulationLog, setSimulationLog] = useState<Array<{
    timestamp: string; source: string; target: string; message: string; status: string;
  }>>([
    { timestamp: '11:14:02', source: 'Inventory Reflex Agent', target: 'Procurement Utility Agent', message: 'Stock Alert: SKU MCU-8842 below reorder buffer (45/150). Requesting replenishment.', status: 'success' },
    { timestamp: '11:14:08', source: 'Procurement Utility Agent', target: 'Finance Controller Vault', message: 'Evaluated 3 supplier bids. Selected Global Semi ($14,200, 2-day SLA, 94% ESG).', status: 'success' },
    { timestamp: '11:14:15', source: 'Logistics Strands Agent', target: 'Customer Service Bot', message: 'Rerouted shipment #SH-402. Updated delivery commitment to Friday 09:00 AM.', status: 'success' },
  ]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [agentsData, summaryData, lbData] = await Promise.all([
        erpApi.listAgents(),
        erpApi.summary(),
        erpApi.leaderboard(),
      ]);
      setLiveAgents(agentsData);
      setSummary(summaryData);
      setLeaderboard(lbData);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleEvaluate = async (agentId: string) => {
    setEvaluatingId(agentId);
    try {
      const updated = await erpApi.evaluateAgent(agentId);
      setLiveAgents(prev => prev.map(a => a.agent_id === agentId ? updated : a));
    } catch { /* ignore */ }
    setEvaluatingId(null);
  };

  const handleToggleStatus = async (agent: AgentMetricsAPI) => {
    const next = agent.status === 'active' ? 'paused' : 'active';
    try {
      const updated = await erpApi.updateStatus(agent.agent_id, next);
      setLiveAgents(prev => prev.map(a => a.agent_id === agent.agent_id ? updated : a));
    } catch { onToggleAgentStatus(agent.agent_id); }
  };

  const handleKillSwitch = async (agent: AgentMetricsAPI) => {
    try {
      const updated = await erpApi.updateStatus(agent.agent_id, 'kill_switched');
      setLiveAgents(prev => prev.map(a => a.agent_id === agent.agent_id ? updated : a));
    } catch { onTriggerKillSwitch(agent.agent_id); }
  };

  const handleBenchmark = async () => {
    setBenchmarking(true);
    try {
      const result = await erpApi.benchmark();
      setLiveAgents(result.results);
      setSummary(result.summary);
      await erpApi.leaderboard().then(setLeaderboard);
      const now = new Date().toTimeString().slice(0, 8);
      setSimulationLog(prev => [{
        timestamp: now,
        source: 'FastAPI Benchmark Engine',
        target: `${result.agents_evaluated} Agents`,
        message: `Full benchmark complete. Avg utility: ${result.summary.avg_utility_score.toFixed(1)}. Best: ${result.summary.best_agent}`,
        status: 'success',
      }, ...prev]);
    } catch { /* ignore */ }
    setBenchmarking(false);
  };

  const displayAgents = liveAgents.length > 0 ? liveAgents : [];
  const filtered = selectedFilter === 'all' ? displayAgents : displayAgents.filter(a => a.classification === selectedFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-indigo-600" />
            EAAF Agentic Mesh
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Live agent evaluation metrics from PostgreSQL via FastAPI
            {apiOnline === true && <span className="ml-2 text-emerald-600 font-semibold">● API Online</span>}
            {apiOnline === false && <span className="ml-2 text-red-500 font-semibold">● API Offline — showing cached data</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={handleBenchmark} disabled={benchmarking}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow transition-colors disabled:opacity-50">
            {benchmarking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {benchmarking ? 'Benchmarking...' : 'Run Benchmark'}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Avg Utility Score', value: `${summary.avg_utility_score.toFixed(1)}`, icon: Gauge, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Avg Task Success', value: `${(summary.avg_task_success_rate * 100).toFixed(1)}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Spend', value: `$${summary.total_cost_usd.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Needs Review', value: `${summary.agents_needing_review}`, icon: AlertOctagon, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(card => (
            <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-xl font-bold text-slate-900">{card.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium w-fit">
        {([['agents', 'Agents', Bot], ['metrics', 'Metrics Dashboard', BarChart3], ['leaderboard', 'Leaderboard', Trophy]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${activeTab === id ? 'bg-white text-indigo-700 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: AGENTS ─────────────────────────────────────────────── */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 text-xs">
            {['all', 'simple_reflex', 'model_based', 'goal_based', 'utility_based'].map(f => (
              <button key={f} onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1.5 rounded-full border font-medium transition-colors ${selectedFilter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                {f === 'all' ? 'All Classifications' : f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Agent Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(agent => (
              <div key={agent.agent_id} className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${agent.kill_switch_triggered ? 'border-red-300 bg-red-50/30' : 'border-slate-200 hover:shadow-md'}`}>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_COLORS[agent.status] || 'bg-slate-400'}`} />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{agent.agent_name}</p>
                      <p className="text-[11px] text-slate-500">{agent.runtime} · {agent.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${GRADE_COLORS[agent.evaluation_grade] || 'bg-slate-100'}`}>
                      Grade {agent.evaluation_grade}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100">
                      {agent.utility_score.toFixed(1)} pts
                    </span>
                  </div>
                </div>

                {/* Metric Bars */}
                <div className="space-y-1.5 mb-3">
                  <MetricBar label="Task Success Rate" value={agent.task_success_rate * 100} color="bg-emerald-500" format={v => `${v.toFixed(1)}%`} />
                  <MetricBar label="Goal Alignment" value={agent.goal_alignment_score} color="bg-blue-500" format={v => `${v.toFixed(1)}%`} />
                  <MetricBar label="Hallucination Rate" value={agent.hallucination_rate * 100} max={20} color="bg-red-400" format={v => `${v.toFixed(1)}%`} />
                  <MetricBar label="Human Override Rate" value={agent.human_override_rate * 100} max={30} color="bg-amber-400" format={v => `${v.toFixed(1)}%`} />
                </div>

                {/* Detail Row */}
                <div className="grid grid-cols-3 gap-2 text-[10px] mb-3">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-slate-500">Avg Latency</p>
                    <p className="font-bold text-slate-900">{agent.avg_latency_ms}ms</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-slate-500">Cost/Task</p>
                    <p className="font-bold text-slate-900">${agent.cost_per_task_usd.toFixed(4)}</p>
                  </div>
                  <div className={`rounded-lg p-2 text-center ${agent.safety_violations > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
                    <p className="text-slate-500">Safety Violations</p>
                    <p className={`font-bold ${agent.safety_violations > 0 ? 'text-red-600' : 'text-slate-900'}`}>{agent.safety_violations}</p>
                  </div>
                </div>

                {/* Spend Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>Spend Utilization</span>
                    <span className="font-semibold">${agent.current_spend_usd.toLocaleString()} / ${agent.max_spend_threshold_usd.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${(agent.current_spend_usd / agent.max_spend_threshold_usd) > 0.8 ? 'bg-red-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min((agent.current_spend_usd / agent.max_spend_threshold_usd) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Last Action */}
                <p className="text-[10px] text-slate-400 italic mb-3 truncate">↳ {agent.last_action}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => handleToggleStatus(agent)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${agent.status === 'active' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}>
                    {agent.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {agent.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => handleEvaluate(agent.agent_id)} disabled={evaluatingId === agent.agent_id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors disabled:opacity-50">
                    {evaluatingId === agent.agent_id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
                    Evaluate
                  </button>
                  {!agent.kill_switch_triggered && (
                    <button onClick={() => handleKillSwitch(agent)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition-colors ml-auto">
                      <ShieldAlert className="w-3 h-3" />
                      Kill Switch
                    </button>
                  )}
                  {agent.kill_switch_triggered && (
                    <span className="flex items-center gap-1 px-3 py-1.5 ml-auto text-[11px] font-semibold text-red-700">
                      <AlertOctagon className="w-3 h-3" /> KILLED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Simulation Log */}
          <div className="bg-slate-900 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-emerald-400" />Live Agentic Mesh Event Stream</p>
              <button onClick={() => { onExecuteWorkflowSimulation(); const now = new Date().toTimeString().slice(0,8); setSimulationLog(prev => [{ timestamp: now, source: 'EAAF Coordinator', target: 'LangGraph Mesh', message: 'Autonomous workflow: PO-match → O2C Cash Application → Fleet Rerouting.', status: 'success' }, ...prev]); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors">
                <Zap className="w-3 h-3" />Simulate Workflow
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {simulationLog.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className="text-slate-500 font-mono shrink-0">{log.timestamp}</span>
                  <span className="text-emerald-400 font-semibold shrink-0">{log.source}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-blue-400 shrink-0">{log.target}</span>
                  <span className="text-slate-400 truncate">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: METRICS DASHBOARD ──────────────────────────────────── */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayAgents.map(agent => (
              <div key={agent.agent_id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{agent.agent_name}</p>
                    <p className="text-[11px] text-slate-500">{agent.classification.replace('_', ' ')} · {agent.runtime}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${GRADE_COLORS[agent.evaluation_grade]}`}>
                    Grade {agent.evaluation_grade}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <MetricBar label="Utility Score" value={agent.utility_score} color="bg-indigo-500" format={v => `${v.toFixed(1)}/100`} />
                  <MetricBar label="Goal Alignment" value={agent.goal_alignment_score} color="bg-blue-500" format={v => `${v.toFixed(1)}%`} />
                  <MetricBar label="Task Success" value={agent.task_success_rate * 100} color="bg-emerald-500" format={v => `${v.toFixed(1)}%`} />
                  <MetricBar label="Hallucination" value={agent.hallucination_rate * 100} max={20} color="bg-red-400" format={v => `${v.toFixed(2)}%`} />
                  <MetricBar label="Human Override" value={agent.human_override_rate * 100} max={30} color="bg-amber-400" format={v => `${v.toFixed(1)}%`} />
                  <MetricBar label="Token Efficiency" value={Math.min(agent.token_efficiency / 15, 100)} color="bg-violet-500" format={() => `${agent.token_efficiency.toFixed(0)} t/task`} />
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[10px] text-center">
                  <div><p className="text-slate-400">Latency</p><p className="font-bold text-slate-800">{agent.avg_latency_ms}ms</p></div>
                  <div><p className="text-slate-400">Cost/Task</p><p className="font-bold text-slate-800">${agent.cost_per_task_usd.toFixed(4)}</p></div>
                  <div><p className="text-slate-400">Violations</p><p className={`font-bold ${agent.safety_violations > 0 ? 'text-red-600' : 'text-slate-800'}`}>{agent.safety_violations}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: LEADERBOARD ───────────────────────────────────────── */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <p className="font-bold text-slate-900">Agent Utility Leaderboard</p>
            <span className="text-[11px] text-slate-400 ml-auto">Ranked by utility score (PostgreSQL · FastAPI)</span>
          </div>
          <div className="divide-y divide-slate-100">
            {leaderboard.map(entry => (
              <div key={entry.agent_id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${entry.rank === 1 ? 'bg-amber-400 text-white' : entry.rank === 2 ? 'bg-slate-300 text-slate-700' : entry.rank === 3 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {entry.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{entry.agent_name}</p>
                  <p className="text-[11px] text-slate-500">{entry.domain} · {entry.runtime}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900">{entry.utility_score.toFixed(1)}</p>
                  <p className="text-[10px] text-slate-400">utility pts</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold shrink-0 ${GRADE_COLORS[entry.evaluation_grade]}`}>
                  {entry.evaluation_grade}
                </span>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="font-semibold text-slate-700 text-xs">{(entry.task_success_rate * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-slate-400">success</p>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">
                {apiOnline === false ? '⚠️ FastAPI backend offline — start it with: uvicorn main:app --reload' : 'Run a benchmark to populate the leaderboard'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
