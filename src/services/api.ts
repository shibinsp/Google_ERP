/**
 * FastAPI backend client
 * All agent evaluation metrics come from http://localhost:8000
 */

const BASE_URL = "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types matching backend Pydantic schemas ───────────────────────────────

export interface AgentMetricsAPI {
  id: string;
  agent_id: string;
  agent_name: string;
  classification: string;
  runtime: string;
  domain: string;
  status: string;
  utility_score: number;
  task_success_rate: number;
  avg_latency_ms: number;
  hallucination_rate: number;
  token_efficiency: number;
  cost_per_task_usd: number;
  human_override_rate: number;
  goal_alignment_score: number;
  safety_violations: number;
  evaluation_grade: string;
  max_spend_threshold_usd: number;
  current_spend_usd: number;
  kill_switch_triggered: boolean;
  token_vault_policy: string;
  last_action: string;
  last_action_timestamp: string;
  last_evaluated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetricsSummary {
  total_agents: number;
  active_agents: number;
  avg_utility_score: number;
  avg_task_success_rate: number;
  avg_hallucination_rate: number;
  total_cost_usd: number;
  total_safety_violations: number;
  agents_needing_review: number;
  best_agent: string | null;
  worst_agent: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  agent_id: string;
  agent_name: string;
  domain: string;
  runtime: string;
  utility_score: number;
  evaluation_grade: string;
  task_success_rate: number;
  cost_per_task_usd: number;
  status: string;
}

export interface BenchmarkResult {
  benchmark_id: string;
  ran_at: string;
  agents_evaluated: number;
  results: AgentMetricsAPI[];
  summary: MetricsSummary;
}

export interface ExecutionLogPayload {
  task_type: string;
  task_input?: Record<string, unknown>;
  task_output?: Record<string, unknown>;
  success: boolean;
  latency_ms: number;
  tokens_used: number;
  task_complexity?: number;
  cost_usd?: number;
  hallucination_flagged?: boolean;
  human_override?: boolean;
  safety_violation?: boolean;
  goal_aligned?: boolean;
}

// ── API Functions ─────────────────────────────────────────────────────────

export const erpApi = {
  health: () => apiFetch<{ status: string }>("/api/health"),

  // Agents
  listAgents: () => apiFetch<AgentMetricsAPI[]>("/api/agents"),
  getAgent: (id: string) => apiFetch<AgentMetricsAPI>(`/api/agents/${id}`),
  updateStatus: (id: string, status: string) =>
    apiFetch<AgentMetricsAPI>(`/api/agents/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  evaluateAgent: (id: string) =>
    apiFetch<AgentMetricsAPI>(`/api/agents/${id}/evaluate`, { method: "POST" }),
  ingestLog: (id: string, log: ExecutionLogPayload) =>
    apiFetch<{ status: string; task_id: string }>(`/api/agents/${id}/logs`, {
      method: "POST",
      body: JSON.stringify(log),
    }),

  // Metrics
  summary: () => apiFetch<MetricsSummary>("/api/metrics/summary"),
  leaderboard: () => apiFetch<LeaderboardEntry[]>("/api/metrics/leaderboard"),
  benchmark: () =>
    apiFetch<BenchmarkResult>("/api/metrics/benchmark", { method: "POST" }),
};
