import logging
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.database import get_session
from app.models import UsageLog

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/usage", tags=["Usage"])

@router.get("")
def get_usage_metrics(session: Session = Depends(get_session)):
    """
    Returns aggregated token usage, request counts, estimated total cost,
    and model breakdown.
    """
    statement = select(UsageLog)
    logs = session.exec(statement).all()

    total_requests = len(logs)
    total_input_tokens = sum(log.input_tokens for log in logs)
    total_output_tokens = sum(log.output_tokens for log in logs)
    total_cost = sum(log.estimated_cost_usd for log in logs)

    model_breakdown = {}
    for log in logs:
        m = log.model
        if m not in model_breakdown:
            model_breakdown[m] = {
                "requests": 0,
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0,
                "cost": 0.0
            }
        model_breakdown[m]["requests"] += 1
        model_breakdown[m]["input_tokens"] += log.input_tokens
        model_breakdown[m]["output_tokens"] += log.output_tokens
        model_breakdown[m]["total_tokens"] += log.total_tokens
        model_breakdown[m]["cost"] = round(model_breakdown[m]["cost"] + log.estimated_cost_usd, 6)

    return {
        "summary": {
            "total_requests": total_requests,
            "total_input_tokens": total_input_tokens,
            "total_output_tokens": total_output_tokens,
            "total_tokens": total_input_tokens + total_output_tokens,
            "total_estimated_cost_usd": round(total_cost, 4)
        },
        "model_breakdown": model_breakdown,
        "recent_logs": [
            {
                "id": log.id,
                "model": log.model,
                "action": log.action_type,
                "input_tokens": log.input_tokens,
                "output_tokens": log.output_tokens,
                "cost": log.estimated_cost_usd,
                "timestamp": log.created_at.isoformat()
            }
            for log in logs[-15:] # Last 15 events
        ]
    }
