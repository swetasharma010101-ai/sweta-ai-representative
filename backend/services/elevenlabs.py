"""
ElevenLabs TTS service — converts text to speech audio bytes.
Uses Turbo v2.5 for lowest latency on voice calls.
"""

import os
import httpx
from typing import Optional

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
VOICE_ID           = os.getenv("ELEVENLABS_VOICE_ID", "")
MODEL_ID           = os.getenv("ELEVENLABS_MODEL_ID", "eleven_turbo_v2_5")

TTS_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

VOICE_SETTINGS = {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": True,
}


async def text_to_speech(text: str, output_format: str = "mp3_44100_128") -> Optional[bytes]:
    """
    Convert text to speech audio bytes using ElevenLabs.

    Args:
        text: The text to convert.
        output_format: ElevenLabs output format string.

    Returns:
        Raw audio bytes, or None on failure.
    """
    if not ELEVENLABS_API_KEY or not VOICE_ID:
        print("⚠️  ElevenLabs API key or Voice ID not configured.")
        return None

    payload = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": VOICE_SETTINGS,
        "output_format": output_format,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            TTS_URL,
            json=payload,
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
        )

    if response.status_code != 200:
        print(f"❌ ElevenLabs TTS error {response.status_code}: {response.text[:200]}")
        return None

    return response.content


async def get_voices() -> list:
    """List available voices for debugging / voice ID lookup."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(
            "https://api.elevenlabs.io/v1/voices",
            headers={"xi-api-key": ELEVENLABS_API_KEY},
        )
    return r.json().get("voices", [])
