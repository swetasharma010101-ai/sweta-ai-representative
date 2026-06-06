"""
Sweta Sharma — AI Persona Backend
FastAPI application: Voice (Twilio + ElevenLabs) + Chat + RAG + Calendar
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import voice, chat, calendar, health
from rag.pipeline import RAGPipeline

load_dotenv()

# ── Startup / Shutdown ──────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG pipeline once on startup."""
    print("🚀 Starting Sweta AI Persona backend...")
    app.state.rag = RAGPipeline()
    app.state.rag.load()
    print("✅ RAG pipeline ready.")
    yield
    print("👋 Shutting down.")


# ── App ─────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Sweta Sharma — AI Persona API",
    description="Voice + Chat AI persona with RAG grounding and calendar booking.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(voice.router, prefix="/voice", tags=["voice"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(calendar.router, prefix="/calendar", tags=["calendar"])


@app.get("/")
async def root():
    return {
        "persona": "Sweta Sharma AI",
        "status": "live",
        "endpoints": {
            "voice_webhook": "/voice/incoming",
            "chat": "/chat/message",
            "availability": "/calendar/availability",
            "book": "/calendar/book",
            "docs": "/docs",
        },
    }
