import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, Calendar, RotateCcw, Loader2, Phone } from 'lucide-react'
import { sendMessage, fetchAvailability, bookMeeting, ChatMessage, Slot } from '../api'
import BookingModal from '../components/BookingModal'

const STARTER_PROMPTS = [
  "Why is Sweta the right fit for the AI Engineer role?",
  "Tell me about her most impressive GitHub project",
  "What's her experience with RAG and LLMs?",
  "Check availability and book an interview",
]

export default function ChatPage() {
  const nav = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Sweta Sharma's AI representative. I'm grounded on her actual resume and GitHub repos, so ask me anything — her background, projects, skills, or just book an interview slot with her directly. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const addMessage = (msg: ChatMessage) =>
    setMessages((prev) => [...prev, msg])

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')

    addMessage({ role: 'user', content: msg, timestamp: new Date() })
    setLoading(true)

    try {
      const res = await sendMessage(msg, sessionId)
      if (!sessionId) setSessionId(res.session_id)
      addMessage({
        role: 'assistant',
        content: res.reply,
        timestamp: new Date(),
        latency_ms: res.latency_ms,
      })

      // Auto-open booking if the response mentions availability or slots
      const lower = res.reply.toLowerCase()
      if (lower.includes('slot') || lower.includes('available') || lower.includes('book')) {
        await openBooking()
      }
    } catch {
      addMessage({
        role: 'assistant',
        content: "I'm having a brief connectivity issue — please try again in a moment.",
        timestamp: new Date(),
      })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const openBooking = async () => {
    setSlotsLoading(true)
    setShowBooking(true)
    try {
      const s = await fetchAvailability(7)
      setSlots(s)
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleBookingConfirm = async (
    slot: Slot,
    name: string,
    email: string
  ) => {
    const result = await bookMeeting({ name, email, start_time: slot.start })
    addMessage({
      role: 'assistant',
      content: result.success
        ? `✅ You're all set! ${result.message}`
        : `Sorry, I hit a snag: ${result.message}`,
      timestamp: new Date(),
    })
    setShowBooking(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const resetChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Fresh start! What would you like to know about Sweta?",
      timestamp: new Date(),
    }])
    setSessionId(null)
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-paper z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => nav('/')} className="text-muted hover:text-ink transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="font-medium text-sm text-ink">Sweta Sharma — AI Persona</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot inline-block" />
              <span className="text-xs text-muted">Live · RAG-grounded</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openBooking}
            className="btn-ghost text-xs flex items-center gap-1.5 py-2"
          >
            <Calendar size={13} /> Book Interview
          </button>
          <a
            href={`tel:${import.meta.env.VITE_PHONE_NUMBER || ''}`}
            className="btn-ghost text-xs flex items-center gap-1.5 py-2"
          >
            <Phone size={13} /> Call
          </a>
          <button
            onClick={resetChat}
            className="text-muted hover:text-ink transition-colors p-2"
            title="Reset conversation"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      {/* ── Message list ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-2xl mx-auto py-6 space-y-4">
          {/* Starter prompts — show only at start */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 animate-fade-up">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="text-left text-xs border border-border px-3 py-2.5 text-muted
                             hover:border-ink hover:text-ink transition-colors leading-relaxed"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex animate-fade-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center text-xs font-mono mr-2 mt-1 shrink-0">
                  S
                </div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.latency_ms && (
                  <p className="text-[10px] text-muted mt-1.5 font-mono">
                    {msg.latency_ms}ms
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-up">
              <div className="w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center text-xs font-mono mr-2 mt-1 shrink-0">
                S
              </div>
              <div className="chat-bubble-ai flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-muted" />
                <span className="text-muted text-xs">Thinking…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ──────────────────────────────────────── */}
      <div className="border-t border-border bg-paper sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 md:px-0 py-4 flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Sweta's background, projects, or book an interview…"
            rows={1}
            className="flex-1 resize-none bg-white border border-border px-4 py-3 text-sm
                       focus:outline-none focus:border-ink transition-colors
                       placeholder:text-muted leading-relaxed"
            style={{ minHeight: 46, maxHeight: 160 }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed self-end"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-center text-[11px] text-muted pb-3 font-mono">
          Answers grounded on Sweta's resume + GitHub · Shift+Enter for newline
        </p>
      </div>

      {/* ── Booking modal ──────────────────────────────────── */}
      {showBooking && (
        <BookingModal
          slots={slots}
          loading={slotsLoading}
          onClose={() => setShowBooking(false)}
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  )
}
