import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Types ────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  latency_ms?: number
}

export interface Slot {
  start: string
  end: string
  label: string
}

export interface BookingRequest {
  name: string
  email: string
  start_time: string
  notes?: string
}

export interface BookingResult {
  success: boolean
  booking_id: string
  message: string
}

// ── API Calls ────────────────────────────────────────────────────────────

export async function sendMessage(
  message: string,
  sessionId: string | null
): Promise<{ reply: string; session_id: string; latency_ms: number }> {
  const { data } = await api.post('/chat/message', {
    message,
    session_id: sessionId,
  })
  return data
}

export async function fetchAvailability(days = 7): Promise<Slot[]> {
  const { data } = await api.get('/calendar/availability', { params: { days } })
  return data.slots
}

export async function bookMeeting(req: BookingRequest): Promise<BookingResult> {
  const { data } = await api.post('/calendar/book', req)
  return data
}
