"""
Enterprise ERP Suite — FastAPI Backend
Entry point: uvicorn main:app --reload --port 8000
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database import init_db, AsyncSessionLocal
from routers import health, agents, metrics
from models.agent import AgentMetrics
from data.agents_seed import AGENTS_SEED
from services.evaluator import _compute_utility_score, _compute_grade

load_dotenv()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────
    await init_db()
    await _seed_agents()
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────


async def _seed_agents():
    """Seed the DB with 6 EAAFAgents if table is empty."""
    async with AsyncSessionLocal() as db:
        result = await db.exec(select(AgentMetrics))
        existing = result.first()
        if existing:
            return  # Already seeded

        for data in AGENTS_SEED:
            # Compute initial utility score + grade from seed values
            utility = _compute_utility_score(
                task_success_rate=data["task_success_rate"],
                hallucination_rate=data["hallucination_rate"],
                human_override_rate=data["human_override_rate"],
                goal_alignment_score=data["goal_alignment_score"],
                token_efficiency=min(data["token_efficiency"] / 1000, 1.0),
                safety_violations=data["safety_violations"],
            )
            grade = _compute_grade(utility)
            agent = AgentMetrics(
                **data,
                utility_score=utility,
                evaluation_grade=grade,
                execution_logs=[],
            )
            db.add(agent)

        await db.commit()
        print(f"✅ Seeded {len(AGENTS_SEED)} agents into PostgreSQL")


app = FastAPI(
    title="Enterprise ERP Suite — Agent Metrics API",
    description="FastAPI backend providing real agent evaluation metrics, leaderboard, and execution log ingestion.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(agents.router)
app.include_router(metrics.router)


@app.get("/")
async def root():
    return {
        "service": "Enterprise ERP Suite — FastAPI Backend",
        "docs": "/docs",
        "health": "/api/health",
        "agents": "/api/agents",
        "metrics_summary": "/api/metrics/summary",
        "leaderboard": "/api/metrics/leaderboard",
        "benchmark": "/api/metrics/benchmark (POST)",
    }
