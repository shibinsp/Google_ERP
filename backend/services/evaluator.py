"""
Agent Evaluator Service
-----------------------
Computes 10 evaluation metrics from REAL execution logs stored in PostgreSQL.
When logs exist: metrics are computed from actual LangGraph/CrewAI task runs.
When no logs yet: sensible defaults based on agent classification.
"""

from datetime import datetime
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from models.agent import AgentMetrics, AgentExecutionLog


GRADE_THRESHOLDS = [
    (90, "A"),
    (75, "B"),
    (60, "C"),
    (45, "D"),
    (0,  "F"),
]


def _compute_grade(utility_score: float) -> str:
    for threshold, grade in GRADE_THRESHOLDS:
        if utility_score >= threshold:
            return grade
    return "F"


def _compute_utility_score(
    task_success_rate: float,
    hallucination_rate: float,
    human_override_rate: float,
    goal_alignment_score: float,
    token_efficiency: float,
    safety_violations: int,
) -> float:
    """
    Weighted utility function (0–100):
      40% task success rate
      20% goal alignment
      15% hallucination penalty
      10% human override penalty
      10% token efficiency (normalised to 0-1 range, capped at 100)
       5% safety penalty (each violation costs 5 pts, max -25)
    """
    score = (
        task_success_rate * 40
        + (goal_alignment_score / 100) * 20
        + (1 - hallucination_rate) * 15
        + (1 - human_override_rate) * 10
        + min(token_efficiency, 1.0) * 10
        - min(safety_violations * 5, 25)
    )
    return round(max(0.0, min(100.0, score)), 2)


async def evaluate_agent(agent_id: str, db: AsyncSession) -> AgentMetrics | None:
    """
    Recompute all 10 metrics for an agent from its real execution logs.
    Persists updated metrics back to PostgreSQL.
    """
    result = await db.exec(select(AgentMetrics).where(AgentMetrics.agent_id == agent_id))
    agent = result.first()
    if not agent:
        return None

    # Pull all execution logs for this agent
    logs_result = await db.exec(
        select(AgentExecutionLog)
        .where(AgentExecutionLog.agent_id == agent_id)
        .order_by(AgentExecutionLog.executed_at.desc())
    )
    logs = logs_result.all()

    if logs:
        n = len(logs)
        successes       = sum(1 for l in logs if l.success)
        total_latency   = sum(l.latency_ms for l in logs)
        total_tokens    = sum(l.tokens_used for l in logs)
        total_complexity = sum(l.task_complexity for l in logs)
        total_cost      = sum(l.cost_usd for l in logs)
        hallucinations  = sum(1 for l in logs if l.hallucination_flagged)
        overrides       = sum(1 for l in logs if l.human_override)
        violations      = sum(1 for l in logs if l.safety_violation)
        goal_aligned    = sum(1 for l in logs if l.goal_aligned)

        agent.task_success_rate  = round(successes / n, 4)
        agent.avg_latency_ms     = int(total_latency / n)
        agent.token_efficiency   = round(total_tokens / max(total_complexity, 1), 4)
        agent.cost_per_task_usd  = round(total_cost / n, 6)
        agent.hallucination_rate = round(hallucinations / n, 4)
        agent.human_override_rate = round(overrides / n, 4)
        agent.goal_alignment_score = round((goal_aligned / n) * 100, 2)
        agent.safety_violations  = violations
        agent.current_spend_usd  = round(total_cost, 4)

    else:
        # No logs yet — keep existing values or defaults
        pass

    agent.utility_score = _compute_utility_score(
        task_success_rate=agent.task_success_rate,
        hallucination_rate=agent.hallucination_rate,
        human_override_rate=agent.human_override_rate,
        goal_alignment_score=agent.goal_alignment_score,
        token_efficiency=min(agent.token_efficiency / 1000, 1.0),  # normalise
        safety_violations=agent.safety_violations,
    )
    agent.evaluation_grade = _compute_grade(agent.utility_score)
    agent.last_evaluated_at = datetime.utcnow()
    agent.updated_at = datetime.utcnow()

    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return agent


async def evaluate_all_agents(db: AsyncSession) -> list[AgentMetrics]:
    """Run evaluation for every agent and return updated list."""
    result = await db.exec(select(AgentMetrics))
    agents = result.all()
    updated = []
    for agent in agents:
        refreshed = await evaluate_agent(agent.agent_id, db)
        if refreshed:
            updated.append(refreshed)
    return updated


async def ingest_execution_log(log_data: dict, db: AsyncSession) -> AgentExecutionLog:
    """
    Persist a real execution log from LangGraph/CrewAI callback,
    then trigger a metric re-evaluation for that agent.
    """
    log = AgentExecutionLog(**log_data)
    db.add(log)
    await db.commit()

    # Re-evaluate metrics immediately after new log arrives
    await evaluate_agent(log.agent_id, db)
    return log
