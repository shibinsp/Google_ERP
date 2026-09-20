import pytest
import httpx
from main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert "Enterprise ERP" in data["service"]


@pytest.mark.asyncio
async def test_metrics_summary():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/metrics/summary")
        assert res.status_code == 200
        data = res.json()
        assert "total_agents" in data
        assert "avg_utility_score" in data


@pytest.mark.asyncio
async def test_copilot_chat():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/copilot/chat",
            json={"message": "Draft a purchase order for Acme Corp"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "response" in data
        assert len(data["tool_calls"]) > 0
        assert data["tool_calls"][0]["tool_name"] == "create_purchase_order"


@pytest.mark.asyncio
async def test_bi_export():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/bi/export")
        assert res.status_code == 200
        data = res.json()
        assert data["dataset_name"] == "enterprise_erp_bi_warehouse"
        assert len(data["data"]) > 0
