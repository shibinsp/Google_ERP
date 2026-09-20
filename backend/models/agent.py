from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from typing import Optional
from datetime import datetime
import uuid


class AgentMetrics(SQLModel, table=True):
    """Persisted agent evaluation metrics in PostgreSQL."""
    __tablename__ = "agent_metrics"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    agent_id: str = Field(index=True, nullable=False)
    agent_name: str
    classification: str   # simple_reflex | model_based | goal_based | utility_based
    runtime: str          # LangGraph | CrewAI | Amazon Strands | Custom Serverless
    domain: str           # Finance | Supply Chain | HRMS | Operations | Security
    status: str = "active"

    # ── Core Evaluation Metrics ──────────────────────────────────────────
    utility_score: float = Field(default=0.0, ge=0, le=100)
    task_success_rate: float = Field(default=0.0, ge=0, le=1)
    avg_latency_ms: int = Field(default=0)
    hallucination_rate: float = Field(default=0.0, ge=0, le=1)
    token_efficiency: float = Field(default=0.0)          # tokens / complexity ratio
    cost_per_task_usd: float = Field(default=0.0)
    human_override_rate: float = Field(default=0.0, ge=0, le=1)
    goal_alignment_score: float = Field(default=0.0, ge=0, le=100)
    safety_violations: int = Field(default=0)
    evaluation_grade: str = Field(default="C")            # A B C D F

    # ── Spend Tracking ───────────────────────────────────────────────────
    max_spend_threshold_usd: float = Field(default=5000.0)
    current_spend_usd: float = Field(default=0.0)
    kill_switch_triggered: bool = Field(default=False)
    token_vault_policy: str = Field(default="")

    # ── Execution Log (JSON array) ────────────────────────────────────────
    execution_logs: list = Field(default=[], sa_column=Column(JSON))

    # ── Timestamps ───────────────────────────────────────────────────────
    last_evaluated_at: Optional[datetime] = None
    last_action: str = ""
    last_action_timestamp: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AgentExecutionLog(SQLModel, table=True):
    """Individual task execution log entries for real metric computation."""
    __tablename__ = "agent_execution_logs"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    agent_id: str = Field(index=True, nullable=False)

    # Task context
    task_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_type: str       # e.g. "po_matching" | "payroll_dispatch" | "fraud_check"
    task_input: str = Field(default="", sa_column=Column(JSON))
    task_output: str = Field(default="", sa_column=Column(JSON))

    # Real execution metrics
    success: bool = Field(default=True)
    latency_ms: int = Field(default=0)
    tokens_used: int = Field(default=0)
    task_complexity: float = Field(default=1.0)   # 1.0 = baseline
    cost_usd: float = Field(default=0.0)
    hallucination_flagged: bool = Field(default=False)
    human_override: bool = Field(default=False)
    safety_violation: bool = Field(default=False)
    goal_aligned: bool = Field(default=True)

    executed_at: datetime = Field(default_factory=datetime.utcnow)
