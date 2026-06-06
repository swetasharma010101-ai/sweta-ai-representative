"""
Chat router — REST API for the web chat interface.

POST /chat/message   → send a message, get a response
POST /chat/reset     → clear conversation history
"""

import time
import uuid
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from services.agent import get_response

router = APIRouter()

# In-memory sessions: {session_id: [{"role": ..., "content": ...}]}
_sessions: dict = {}


class MessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class MessageResponse(BaseModel):
    reply: str
    session_id: str
    latency_ms: int


class ResetRequest(BaseModel):
    session_id: str


@router.post("/message", response_model=MessageResponse)
async def chat_message(body: MessageRequest, request: Request):
    """
    Send a message to Sweta's AI persona and receive a grounded reply.
    Creates a new session if session_id is not provided.
    """
    session_id = body.session_id or str(uuid.uuid4())
    history    = _sessions.setdefault(session_id, [])

    t0 = time.time()

    # RAG retrieval
    rag     = request.app.state.rag
    context = rag.retrieve(body.message)

    # Generate response
    reply = await get_response(
        user_message=body.message,
        conversation_history=history,
        rag_context=context,
        mode="chat",
    )

    latency_ms = int((time.time() - t0) * 1000)

    # Update history (keep last 20 turns)
    history.append({"role": "user",      "content": body.message})
    history.append({"role": "assistant", "content": reply})
    _sessions[session_id] = history[-20:]

    return MessageResponse(reply=reply, session_id=session_id, latency_ms=latency_ms)


@router.post("/reset")
async def reset_session(body: ResetRequest):
    """Clear the conversation history for a session."""
    _sessions.pop(body.session_id, None)
    return {"message": "Session cleared.", "session_id": body.session_id}


@router.get("/history/{session_id}")
async def get_history(session_id: str):
    """Return conversation history for a session (for debugging)."""
    history = _sessions.get(session_id, [])
    return {"session_id": session_id, "history": history, "turns": len(history) // 2}
