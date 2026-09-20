from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime

from database import get_db
from models.agent import AgentMetrics, AgentExecutionLog
from models.metrics import AgentMetricsRead, AgentStatusUpdate, ExecutionLogCreate
from services.evaluator import evaluate_agent

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("", response_model=list[AgentMetricsRead])
async def list_agents(db: AsyncSession = Depends(get_db)):
    """Return all agents with their latest computed metrics."""
    result = await db.exec(select(AgentMetrics).order_by(AgentMetrics.utility_score.desc()))
    return result.all()


@router.get("/{agent_id}", response_model=AgentMetricsRead)
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.exec(select(AgentMetrics).where(AgentMetrics.agent_id == agent_id))
    agent = result.first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    return agent


@router.put("/{agent_id}/status", response_model=AgentMetricsRead)
async def update_agent_status(
    agent_id: str,
    body: AgentStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.exec(select(AgentMetrics).where(AgentMetrics.agent_id == agent_id))
    agent = result.first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    agent.status = body.status
    if body.status == "kill_switched":
        agent.kill_switch_triggered = True
    elif body.status == "active":
        agent.kill_switch_triggered = False

    agent.updated_at = datetime.utcnow()
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return agent


@router.post("/{agent_id}/evaluate", response_model=AgentMetricsRead)
async def trigger_evaluation(agent_id: str, db: AsyncSession = Depends(get_db)):
    """Re-compute all 10 metrics from real execution logs."""
    agent = await evaluate_agent(agent_id, db)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    return agent


@router.post("/{agent_id}/logs", response_model=dict)
async def ingest_log(
    agent_id: str,
    body: ExecutionLogCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Ingest a real execution log from LangGraph/CrewAI task callback.
    Automatically re-evaluates agent metrics after ingestion.
    """
    body.agent_id = agent_id
    log = AgentExecutionLog(**body.model_dump())
    db.add(log)
    await db.commit()
    # Re-evaluate metrics with the new log
    await evaluate_agent(agent_id, db)
    return {"status": "ingested", "task_id": log.task_id}
