from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from backend.app.agent.investigator import run_investigation_agent

router = APIRouter(prefix="/investigator", tags=["AI Risk Investigator Agent"])


class ChatMessageRequest(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    query: str
    tools_executed: List[str]
    response: str
    evidence: Optional[Dict[str, Any]] = None
    disclaimer: str


@router.post("/chat", response_model=ChatMessageResponse)
def chat_with_investigator(payload: ChatMessageRequest):
    """
    Interact with the autonomous CreditLens AI Investigation Agent.
    Executes deterministic Python analytical tools to inspect profiles, calculate SHAP drivers,
    compare borrowers, and identify financial anomalies.
    """
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Investigation query message cannot be empty."
        )

    result = run_investigation_agent(payload.message)
    return ChatMessageResponse(
        query=result["query"],
        tools_executed=result["tools_executed"],
        response=result["response"],
        evidence=result["evidence"],
        disclaimer=result["disclaimer"]
    )
