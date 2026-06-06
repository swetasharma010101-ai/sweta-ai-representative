"""
Calendar router — exposes Cal.com availability and booking endpoints.

GET  /calendar/availability?days=7  → list of free slots
POST /calendar/book                 → create a confirmed booking
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import Optional

from services.calendar import check_availability, book_meeting

router = APIRouter()


class BookingRequest(BaseModel):
    name: str
    email: str
    start_time: str        # ISO 8601 e.g. "2025-08-01T10:00:00+05:30"
    notes: Optional[str] = None


@router.get("/availability")
async def get_availability(days: int = Query(7, ge=1, le=30)):
    """Return available interview slots for the next N days."""
    slots = await check_availability(days_ahead=days)
    return {"slots": slots, "count": len(slots)}


@router.post("/book")
async def book(body: BookingRequest):
    """Book a 30-min interview slot."""
    if not body.name.strip() or not body.email.strip():
        raise HTTPException(status_code=422, detail="Name and email are required.")

    result = await book_meeting(
        name=body.name,
        email=body.email,
        start_time=body.start_time,
        notes=body.notes,
    )

    if not result["success"]:
        raise HTTPException(status_code=503, detail=result["message"])

    return result
