from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AgentMetricsRead(BaseModel):
    """Response schema returned to frontend."""
    id: str
    agent_id: str
    agent_name: str
    classification: str
    runtime: str
    domain: str
    status: str

    utility_score: float
    task_success_rate: float
    avg_latency_ms: int
    hallucination_rate: float
    token_efficiency: float
    cost_per_task_usd: float
    human_override_rate: float
    goal_alignment_score: float
    safety_violations: int
    evaluation_grade: str

    max_spend_threshold_usd: float
    current_spend_usd: float
    kill_switch_triggered: bool
    token_vault_policy: str

    last_evaluated_at: Optional[datetime]
    last_action: str
    last_action_timestamp: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AgentStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(active|paused|evaluating|kill_switched)$")


class ExecutionLogCreate(BaseModel):
    """Payload from a real LangGraph/CrewAI task run."""
    agent_id: str
    task_type: str
    task_input: dict = {}
    task_output: dict = {}
    success: bool = True
    latency_ms: int = 0
    tokens_used: int = 0
    task_complexity: float = 1.0
    cost_usd: float = 0.0
    hallucination_flagged: bool = False
    human_override: bool = False
    safety_violation: bool = False
    goal_aligned: bool = True


class MetricsSummary(BaseModel):
    total_agents: int
    active_agents: int
    avg_utility_score: float
    avg_task_success_rate: float
    avg_hallucination_rate: float
    total_cost_usd: float
    total_safety_violations: int
    agents_needing_review: int   # grade D or F
    best_agent: Optional[str]
    worst_agent: Optional[str]


class LeaderboardEntry(BaseModel):
    rank: int
    agent_id: str
    agent_name: str
    domain: str
    runtime: str
    utility_score: float
    evaluation_grade: str
    task_success_rate: float
    cost_per_task_usd: float
    status: str


class BenchmarkResult(BaseModel):
    benchmark_id: str
    ran_at: datetime
    agents_evaluated: int
    results: list[AgentMetricsRead]
    summary: MetricsSummary
