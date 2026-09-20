from fastapi import APIRouter, Depends
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime
import uuid

from database import get_db
from models.agent import AgentMetrics
from models.metrics import MetricsSummary, LeaderboardEntry, BenchmarkResult, AgentMetricsRead
from services.evaluator import evaluate_all_agents

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("/summary", response_model=MetricsSummary)
async def metrics_summary(db: AsyncSession = Depends(get_db)):
    """Aggregate metrics across all agents."""
    result = await db.exec(select(AgentMetrics))
    agents = result.all()

    if not agents:
        return MetricsSummary(
            total_agents=0, active_agents=0, avg_utility_score=0,
            avg_task_success_rate=0, avg_hallucination_rate=0,
            total_cost_usd=0, total_safety_violations=0,
            agents_needing_review=0, best_agent=None, worst_agent=None,
        )

    n = len(agents)
    active = [a for a in agents if a.status == "active"]
    needing_review = [a for a in agents if a.evaluation_grade in ("D", "F")]
    sorted_by_utility = sorted(agents, key=lambda a: a.utility_score, reverse=True)

    return MetricsSummary(
        total_agents=n,
        active_agents=len(active),
        avg_utility_score=round(sum(a.utility_score for a in agents) / n, 2),
        avg_task_success_rate=round(sum(a.task_success_rate for a in agents) / n, 4),
        avg_hallucination_rate=round(sum(a.hallucination_rate for a in agents) / n, 4),
        total_cost_usd=round(sum(a.current_spend_usd for a in agents), 2),
        total_safety_violations=sum(a.safety_violations for a in agents),
        agents_needing_review=len(needing_review),
        best_agent=sorted_by_utility[0].agent_name if sorted_by_utility else None,
        worst_agent=sorted_by_utility[-1].agent_name if sorted_by_utility else None,
    )


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard(db: AsyncSession = Depends(get_db)):
    """Return agents ranked by utility_score descending."""
    result = await db.exec(select(AgentMetrics).order_by(AgentMetrics.utility_score.desc()))
    agents = result.all()
    return [
        LeaderboardEntry(
            rank=i + 1,
            agent_id=a.agent_id,
            agent_name=a.agent_name,
            domain=a.domain,
            runtime=a.runtime,
            utility_score=a.utility_score,
            evaluation_grade=a.evaluation_grade,
            task_success_rate=a.task_success_rate,
            cost_per_task_usd=a.cost_per_task_usd,
            status=a.status,
        )
        for i, a in enumerate(agents)
    ]


@router.post("/benchmark", response_model=BenchmarkResult)
async def run_benchmark(db: AsyncSession = Depends(get_db)):
    """
    Trigger a full re-evaluation benchmark across ALL agents.
    Recomputes all 10 metrics from real execution logs in PostgreSQL.
    """
    updated_agents = await evaluate_all_agents(db)

    n = len(updated_agents)
    if n == 0:
        summary = MetricsSummary(
            total_agents=0, active_agents=0, avg_utility_score=0,
            avg_task_success_rate=0, avg_hallucination_rate=0,
            total_cost_usd=0, total_safety_violations=0,
            agents_needing_review=0, best_agent=None, worst_agent=None,
        )
    else:
        active = [a for a in updated_agents if a.status == "active"]
        needing_review = [a for a in updated_agents if a.evaluation_grade in ("D", "F")]
        sorted_by_utility = sorted(updated_agents, key=lambda a: a.utility_score, reverse=True)
        summary = MetricsSummary(
            total_agents=n,
            active_agents=len(active),
            avg_utility_score=round(sum(a.utility_score for a in updated_agents) / n, 2),
            avg_task_success_rate=round(sum(a.task_success_rate for a in updated_agents) / n, 4),
            avg_hallucination_rate=round(sum(a.hallucination_rate for a in updated_agents) / n, 4),
            total_cost_usd=round(sum(a.current_spend_usd for a in updated_agents), 2),
            total_safety_violations=sum(a.safety_violations for a in updated_agents),
            agents_needing_review=len(needing_review),
            best_agent=sorted_by_utility[0].agent_name,
            worst_agent=sorted_by_utility[-1].agent_name,
        )

    return BenchmarkResult(
        benchmark_id=str(uuid.uuid4()),
        ran_at=datetime.utcnow(),
        agents_evaluated=n,
        results=[AgentMetricsRead.model_validate(a) for a in updated_agents],
        summary=summary,
    )
