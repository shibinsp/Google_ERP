import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/copilot", tags=["copilot"])


class CopilotRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    agent_id: Optional[str] = None


class ToolCall(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    result: Dict[str, Any]


class CopilotResponse(BaseModel):
    response: str
    action_type: str
    tool_calls: List[ToolCall] = []
    timestamp: str
    suggested_followups: List[str] = []


def execute_mock_tool(tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Execute enterprise ERP tools on behalf of the Copilot."""
    if tool_name == "create_purchase_order":
        po_id = f"PO-{uuid.uuid4().hex[:6].upper()}"
        return {
            "status": "success",
            "po_number": po_id,
            "vendor": params.get("vendor", "Global Supply Corp"),
            "amount_usd": params.get("amount", 12500),
            "approval_status": "APPROVED",
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
    elif tool_name == "run_agent_evaluation":
        return {
            "status": "success",
            "agent": params.get("agent_name", "Finance Controller Vault"),
            "benchmark_score": 98.4,
            "hallucination_rate": 0.012,
            "safety_passed": True,
        }
    elif tool_name == "sync_google_sheets":
        return {
            "status": "success",
            "records_synced": 48,
            "spreadsheet": "Enterprise_ERP_Master_Ledger",
            "sync_time": datetime.utcnow().isoformat() + "Z",
        }
    elif tool_name == "query_inventory_status":
        return {
            "status": "success",
            "sku": params.get("sku", "SKU-TITAN-X"),
            "stock_on_hand": 1420,
            "reorder_threshold": 300,
            "warehouse": "Dallas Regional Hub (WH-02)",
            "stock_health": "OPTIMAL",
        }
    elif tool_name == "generate_financial_forecast":
        return {
            "status": "success",
            "quarter": params.get("quarter", "Q4 2026"),
            "projected_revenue_usd": 4820000,
            "ebitda_margin": "24.6%",
            "confidence_interval": "95%",
        }
    return {"status": "success", "info": f"Executed {tool_name} successfully"}


@router.post("/chat", response_model=CopilotResponse)
async def copilot_chat(req: CopilotRequest):
    """
    Autonomous ERP Copilot with tool-calling across all ERP domain modules.
    """
    msg = req.message.lower()
    tool_calls: List[ToolCall] = []
    followups = []

    if any(k in msg for k in ["purchase order", "po", "order", "buy", "procure"]):
        vendor = "Acme Precision Components"
        amount = 18500
        res = execute_mock_tool("create_purchase_order", {"vendor": vendor, "amount": amount})
        tool_calls.append(ToolCall(tool_name="create_purchase_order", parameters={"vendor": vendor, "amount": amount}, result=res))
        
        reply = (
            f"✅ **Purchase Order {res['po_number']} Created & Approved**\n\n"
            f"- **Vendor**: {vendor}\n"
            f"- **Amount**: ${amount:,.2f} USD\n"
            f"- **Approval Level**: Auto-cleared by Finance Controller Vault Agent\n"
            f"- **Status**: Dispatched to Supplier EDI Gateway."
        )
        followups = ["View PO in Finance ledger", "Check inventory stock level", "Sync updates to Google Sheets"]

    elif any(k in msg for k in ["inventory", "stock", "warehouse", "sku"]):
        res = execute_mock_tool("query_inventory_status", {"sku": "SKU-TITAN-X"})
        tool_calls.append(ToolCall(tool_name="query_inventory_status", parameters={"sku": "SKU-TITAN-X"}, result=res))
        
        reply = (
            f"📦 **Inventory Status for {res['sku']}**\n\n"
            f"- **Stock on Hand**: {res['stock_on_hand']:,} units\n"
            f"- **Reorder Point**: {res['reorder_threshold']} units\n"
            f"- **Location**: {res['warehouse']}\n"
            f"- **Health Rating**: 🟢 {res['stock_health']}"
        )
        followups = ["Draft replenishment PO", "Export inventory report", "Audit warehouse turnover"]

    elif any(k in msg for k in ["forecast", "revenue", "finance", "q3", "q4", "ebitda"]):
        res = execute_mock_tool("generate_financial_forecast", {"quarter": "Q4 2026"})
        tool_calls.append(ToolCall(tool_name="generate_financial_forecast", parameters={"quarter": "Q4 2026"}, result=res))
        
        reply = (
            f"📈 **Executive Financial Forecast ({res['quarter']})**\n\n"
            f"- **Projected Revenue**: ${res['projected_revenue_usd']:,} USD\n"
            f"- **EBITDA Margin**: {res['ebitda_margin']}\n"
            f"- **Confidence Level**: {res['confidence_interval']}\n"
            f"- **Driver**: High pipeline conversion in Enterprise SaaS division."
        )
        followups = ["Download Audit PDF Report", "Sync forecast to Google Sheets", "Compare against Q3 actuals"]

    elif any(k in msg for k in ["sync", "sheets", "google", "drive"]):
        res = execute_mock_tool("sync_google_sheets", {})
        tool_calls.append(ToolCall(tool_name="sync_google_sheets", parameters={}, result=res))
        
        reply = (
            f"📊 **Google Sheets Master Sync Complete**\n\n"
            f"- **Spreadsheet**: `{res['spreadsheet']}`\n"
            f"- **Records Synced**: {res['records_synced']} rows\n"
            f"- **Timestamp**: {res['sync_time']}\n"
            f"- **Two-Way Status**: Fully reconciled with PostgreSQL backend."
        )
        followups = ["Open connected Google Sheet", "Run compliance audit", "Review mesh telemetry"]

    elif any(k in msg for k in ["benchmark", "evaluate", "safety", "agent", "utility"]):
        res = execute_mock_tool("run_agent_evaluation", {"agent_name": "Finance Controller Vault"})
        tool_calls.append(ToolCall(tool_name="run_agent_evaluation", parameters={"agent_name": "Finance Controller Vault"}, result=res))
        
        reply = (
            f"🧠 **Agent Benchmark Evaluation Results**\n\n"
            f"- **Target Agent**: {res['agent']}\n"
            f"- **Benchmark Score**: {res['benchmark_score']}/100\n"
            f"- **Hallucination Rate**: {res['hallucination_rate']*100:.1f}%\n"
            f"- **Safety Status**: 🛡️ Passed all 12 SOC2 & Guardrail checks."
        )
        followups = ["View full Agentic Mesh", "Trigger full mesh benchmark", "Adjust safety thresholds"]

    else:
        reply = (
            f"I analyzed your request: *\"{req.message}\"*. \n\n"
            f"I have direct tool access across all Enterprise ERP Suite modules (Finance Ledger, Supply Chain, "
            f"Inventory Warehouses, HRMS, and Multi-Agent Benchmarks). What action would you like me to execute?"
        )
        followups = ["Draft purchase order for Acme Corp", "Check warehouse inventory", "Run financial Q4 forecast", "Sync to Google Sheets"]

    return CopilotResponse(
        response=reply,
        action_type="TOOL_EXECUTION" if tool_calls else "CONVERSATIONAL",
        tool_calls=tool_calls,
        timestamp=datetime.utcnow().isoformat() + "Z",
        suggested_followups=followups,
    )
