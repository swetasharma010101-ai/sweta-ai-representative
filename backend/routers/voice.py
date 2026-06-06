"""
Voice router — handles Twilio inbound call webhooks.

Flow:
  1. Twilio calls POST /voice/incoming → returns TwiML to gather speech
  2. Twilio sends transcript to POST /voice/respond
  3. We call RAG + Claude + ElevenLabs, stream audio back
  4. If caller wants to book: we handle /voice/book

State is kept per CallSid in a simple in-memory dict (works for demo;
swap for Redis in production).
"""

import os
import base64
import time
from typing import Optional
from fastapi import APIRouter, Request, Form, Response
from fastapi.responses import HTMLResponse

from services.agent import get_response
from services.elevenlabs import text_to_speech
from services.calendar import check_availability, book_meeting, slots_to_human

router = APIRouter()

# In-memory call state: {call_sid: {history, booking_state}}
_call_state: dict = {}

INTRO_MESSAGE = (
    "Hi, I'm Sweta Sharma's AI representative. I can tell you about her background, "
    "skills, and experience as an AI engineer, and I can book an interview slot for you. "
    "What would you like to know?"
)


def _twiml_gather(prompt_audio_url: str, action: str) -> str:
    """Return TwiML that plays audio then gathers speech."""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>{prompt_audio_url}</Play>
  <Gather input="speech" action="{action}" speechTimeout="auto"
          speechModel="phone_call" enhanced="true" language="en-IN">
  </Gather>
  <Redirect>/voice/no-input</Redirect>
</Response>"""


def _twiml_say(text: str, action: Optional[str] = None) -> str:
    """Fallback TwiML using Twilio TTS when ElevenLabs unavailable."""
    gather = ""
    if action:
        gather = f'<Gather input="speech" action="{action}" speechTimeout="auto">'
    close_gather = "</Gather>" if action else ""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  {gather}
  <Say voice="Polly.Aditi" language="en-IN">{text}</Say>
  {close_gather}
</Response>"""


async def _speak(text: str, call_sid: str) -> tuple[str, str]:
    """
    Convert text → ElevenLabs audio → base64 data URI.
    Returns (twiml_xml, plain_text) tuple.
    Falls back to Twilio TTS if ElevenLabs fails.
    """
    audio = await text_to_speech(text)
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")

    if audio:
        # Store audio in call state for streaming
        _call_state.setdefault(call_sid, {})["pending_audio"] = audio
        audio_url = f"{backend_url}/voice/audio/{call_sid}"
        return _twiml_gather(audio_url, f"{backend_url}/voice/respond"), text

    return _twiml_say(text, f"{backend_url}/voice/respond"), text


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/incoming")
async def incoming_call(request: Request, CallSid: str = Form("")):
    """Twilio calls this when someone calls the number."""
    _call_state[CallSid] = {"history": [], "booking": {}}
    twiml, _ = await _speak(INTRO_MESSAGE, CallSid)
    return Response(content=twiml, media_type="application/xml")


@router.post("/respond")
async def respond(
    request: Request,
    CallSid: str = Form(""),
    SpeechResult: str = Form(""),
    Confidence: float = Form(0.0),
):
    """Twilio sends the caller's speech here after STT."""
    t0 = time.time()

    if not SpeechResult:
        twiml, _ = await _speak("I didn't quite catch that — could you say that again?", CallSid)
        return Response(content=twiml, media_type="application/xml")

    state   = _call_state.setdefault(CallSid, {"history": [], "booking": {}})
    history = state["history"]

    # Check if the caller wants to book
    book_keywords = ["book", "schedule", "meeting", "interview", "available", "slot", "calendar", "appointment"]
    wants_booking = any(kw in SpeechResult.lower() for kw in book_keywords)

    rag = request.app.state.rag
    context = rag.retrieve(SpeechResult)

    if wants_booking:
        slots = await check_availability(days_ahead=7)
        slots_text = slots_to_human(slots)
        # Store slots in state for follow-up booking
        state["available_slots"] = slots

        reply_text = (
            f"Great, I'd love to book time with you! {slots_text} "
            "Which one works for you? Just say the number."
        )
    else:
        reply_text = await get_response(
            user_message=SpeechResult,
            conversation_history=history,
            rag_context=context,
            mode="voice",
        )

    latency_ms = int((time.time() - t0) * 1000)
    print(f"[{CallSid}] STT: '{SpeechResult}' | Latency: {latency_ms}ms")

    history.append({"role": "user",      "content": SpeechResult})
    history.append({"role": "assistant", "content": reply_text})

    twiml, _ = await _speak(reply_text, CallSid)
    return Response(content=twiml, media_type="application/xml")


@router.get("/audio/{call_sid}")
async def serve_audio(call_sid: str):
    """Serve the pre-generated ElevenLabs audio for a call."""
    audio = _call_state.get(call_sid, {}).get("pending_audio")
    if not audio:
        return Response(status_code=404)
    return Response(content=audio, media_type="audio/mpeg")


@router.post("/no-input")
async def no_input():
    return Response(
        content="""<?xml version="1.0" encoding="UTF-8"?>
<Response><Say>I didn't hear anything. Feel free to call back anytime. Goodbye!</Say><Hangup/></Response>""",
        media_type="application/xml",
    )
