import asyncio
import json
import random
from datetime import datetime
from typing import AsyncGenerator
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/streams", tags=["streams"])

AGENTS = [
    {"name": "Finance Controller Vault", "role": "Ledger Audit & Anomaly Detection"},
    {"name": "Supply Chain Demand Forecaster", "role": "Inventory & Logistics Routing"},
    {"name": "HR Attrition Predictor", "role": "Retention & Workforce Analytics"},
    {"name": "CRM Deal Closing Assistant", "role": "Pipeline Velocity & Lead Scoring"},
    {"name": "Manufacturing QA Agent", "role": "Shop Floor Defect Reduction"},
    {"name": "Governance & Compliance Auditor", "role": "SOC2 & GDPR Enforcement"},
]

ACTIONS = [
    "Evaluating semantic embeddings for Q3 ledger variances",
    "Generated dynamic purchase order #PO-8821 for 4,500 units",
    "Detected 0.02% outlier in supplier billing invoice #INV-993",
    "Running multi-agent consensus vote on credit limit increase ($50,000)",
    "Syncing 14 updated inventory records to Google Sheets master ledger",
    "Validated SOC2 compliance policy check against database IAM roles",
    "Predicted 94.2% on-time delivery rate for APAC logistics freight",
    "Triggering automatic defect alert on Manufacturing Line 4B",
]


def generate_agent_event() -> dict:
    agent = random.choice(AGENTS)
    action = random.choice(ACTIONS)
    tokens = random.randint(120, 850)
    latency_ms = random.randint(85, 340)
    confidence = round(random.uniform(0.88, 0.99), 3)

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "agent": agent["name"],
        "role": agent["role"],
        "action": action,
        "tokens_processed": tokens,
        "latency_ms": latency_ms,
        "confidence_score": confidence,
        "status": random.choice(["COMPLETED", "IN_PROGRESS", "OPTIMIZED", "VERIFIED"]),
        "mesh_node": f"node-{random.randint(1, 6)}",
    }


async def event_generator() -> AsyncGenerator[str, None]:
    """Server-Sent Events generator for real-time agent telemetry."""
    while True:
        event = generate_agent_event()
        yield f"data: {json.dumps(event)}\n\n"
        await asyncio.sleep(2.5)


@router.get("/agent-activity")
async def stream_agent_activity():
    """SSE endpoint streaming live multi-agent execution events."""
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.websocket("/agent-mesh")
async def websocket_agent_mesh(websocket: WebSocket):
    """WebSocket endpoint for bidirectional real-time agent mesh streaming."""
    await websocket.accept()
    try:
        while True:
            event = generate_agent_event()
            await websocket.send_text(json.dumps(event))
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        pass
