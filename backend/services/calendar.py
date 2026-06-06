"""
Cal.com calendar service.
- check_availability: returns free slots for the next N days
- book_meeting: creates a confirmed booking
"""

import os
import httpx
from datetime import datetime, timedelta, timezone
from typing import List, Optional

# ── Timezone handling (Windows-safe) ────────────────────────────────────────
try:
    from zoneinfo import ZoneInfo
    IST = ZoneInfo("Asia/Kolkata")
except Exception:
    # Fallback: use UTC+5:30 offset if tzdata not installed
    IST = timezone(timedelta(hours=5, minutes=30))

CALCOM_API_KEY    = os.getenv("CALCOM_API_KEY", "")
CALCOM_EVENT_TYPE = os.getenv("CALCOM_EVENT_TYPE_ID", "")
CALCOM_USERNAME   = os.getenv("CALCOM_USERNAME", "sweta-sharma")
BASE_URL          = "https://api.cal.com/v1"


def _headers():
    return {"Authorization": f"Bearer {CALCOM_API_KEY}", "Content-Type": "application/json"}


def _now_ist():
    return datetime.now(IST)


async def check_availability(days_ahead: int = 7) -> List[dict]:
    """
    Returns available 30-min slots over the next `days_ahead` days.
    Returns list of {"start": ISO str, "end": ISO str, "label": human str}
    """
    if not CALCOM_API_KEY or not CALCOM_EVENT_TYPE:
        # Return mock slots if Cal.com not configured yet
        now = _now_ist()
        mock = []
        for d in range(1, 4):
            dt = now + timedelta(days=d)
            dt = dt.replace(hour=10, minute=0, second=0, microsecond=0)
            mock.append({
                "start": dt.isoformat(),
                "end":   (dt + timedelta(minutes=30)).isoformat(),
                "label": dt.strftime("%A %d %B, %I:%M %p IST"),
            })
        return mock

    now      = _now_ist()
    date_from = now.strftime("%Y-%m-%dT%H:%M:%S")
    date_to   = (now + timedelta(days=days_ahead)).strftime("%Y-%m-%dT%H:%M:%S")

    params = {
        "apiKey":      CALCOM_API_KEY,
        "eventTypeId": CALCOM_EVENT_TYPE,
        "startTime":   date_from,
        "endTime":     date_to,
        "timeZone":    "Asia/Kolkata",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(f"{BASE_URL}/availability", params=params)

        if r.status_code != 200:
            print(f"❌ Cal.com availability error {r.status_code}: {r.text[:200]}")
            return []

        data   = r.json()
        slots  = data.get("slots", {})
        result = []

        for date_key, day_slots in slots.items():
            for slot in day_slots[:3]:
                start_dt = datetime.fromisoformat(
                    slot["time"].replace("Z", "+00:00")
                ).astimezone(IST)
                end_dt = start_dt + timedelta(minutes=30)
                result.append({
                    "start": slot["time"],
                    "end":   end_dt.isoformat(),
                    "label": start_dt.strftime("%A %d %B, %I:%M %p IST"),
                })

        return result[:9]

    except Exception as e:
        print(f"❌ Cal.com error: {e}")
        return []


async def book_meeting(
    name: str,
    email: str,
    start_time: str,
    notes: Optional[str] = None,
) -> dict:
    """Book a 30-min interview slot on Cal.com."""
    if not CALCOM_API_KEY or not CALCOM_EVENT_TYPE:
        return {
            "success": True,
            "booking_id": "demo-booking-001",
            "message": f"Demo booking confirmed for {start_time}. (Cal.com not configured — set CALCOM_API_KEY to enable real bookings.)",
        }

    payload = {
        "eventTypeId": int(CALCOM_EVENT_TYPE),
        "start":       start_time,
        "responses": {
            "name":  name,
            "email": email,
            "notes": notes or "Booked via Sweta's AI persona",
        },
        "timeZone": "Asia/Kolkata",
        "language": "en",
        "metadata": {"source": "ai-persona"},
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(
                f"{BASE_URL}/bookings",
                json=payload,
                params={"apiKey": CALCOM_API_KEY},
            )

        if r.status_code in (200, 201):
            data = r.json()
            return {
                "success":    True,
                "booking_id": str(data.get("id", "")),
                "message":    f"Confirmed! Your interview is booked. A calendar invite will be sent to {email}.",
            }

        print(f"❌ Cal.com booking error {r.status_code}: {r.text[:300]}")
        return {
            "success": False,
            "message": "I wasn't able to complete the booking. Please try a different slot.",
        }

    except Exception as e:
        print(f"❌ Booking exception: {e}")
        return {"success": False, "message": "Booking service unavailable right now."}


def slots_to_human(slots: List[dict]) -> str:
    if not slots:
        return "I don't see any open slots in the next 7 days."
    lines = [f"{i+1}. {s['label']}" for i, s in enumerate(slots)]
    return "Here are some open slots:\n" + "\n".join(lines)