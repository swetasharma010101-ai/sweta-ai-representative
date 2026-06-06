import { useNavigate } from 'react-router-dom'
import { Phone, MessageSquare, Calendar, Github } from 'lucide-react'

const PHONE_NUMBER = import.meta.env.VITE_PHONE_NUMBER || '+1 (800) 000-0000'

export default function LandingPage() {
  const nav = useNavigate()

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <span className="font-mono text-xs text-muted tracking-widest uppercase">
          Scaler × Sweta Sharma
        </span>
        <a
          href="https://github.com/swetasharma/ai-persona"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
        >
          <Github size={14} /> GitHub
        </a>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <p className="font-mono text-xs text-accent tracking-widest uppercase mb-6 animate-fade-up">
          AI Engineer Screening — Live Demo
        </p>

        <h1 className="serif text-5xl md:text-7xl text-ink leading-[1.05] mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          Hi, I'm Sweta's<br />
          <em>AI Persona.</em>
        </h1>

        <p className="text-muted text-lg max-w-md leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Ask me anything about Sweta's background, projects, and fit for the
          AI Engineer role — or book an interview right here, no humans needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={() => nav('/chat')}
            className="btn-primary flex items-center gap-2"
          >
            <MessageSquare size={16} />
            Chat with me
          </button>
          <a href={`tel:${PHONE_NUMBER}`} className="btn-ghost flex items-center gap-2">
            <Phone size={16} />
            Call me
          </a>
        </div>

        {/* Phone number callout */}
        <div className="mt-6 font-mono text-sm text-muted animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <span className="text-xs uppercase tracking-widest mr-2">Phone:</span>
          {PHONE_NUMBER}
        </div>
      </section>

      {/* ── Feature grid ───────────────────────────────────── */}
      <section className="border-t border-border grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {[
          {
            icon: <MessageSquare size={18} />,
            title: 'RAG-Grounded Chat',
            body: 'Every answer is retrieved from Sweta\'s actual resume and GitHub repos. No hallucinations, no hardcoded strings.',
          },
          {
            icon: <Phone size={18} />,
            title: 'Live Voice Agent',
            body: 'ElevenLabs voice + Twilio telephony. Sub-2s first response, handles barge-in and interruptions gracefully.',
          },
          {
            icon: <Calendar size={18} />,
            title: 'Real Calendar Booking',
            body: 'Cal.com integration books a confirmed interview slot with a calendar invite — entirely without human intervention.',
          },
        ].map((f) => (
          <div key={f.title} className="px-8 py-10">
            <div className="text-accent mb-4">{f.icon}</div>
            <h3 className="font-semibold text-ink mb-2">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border px-8 py-4 flex items-center justify-between">
        <span className="text-xs text-muted">Built for Scaler AI Engineer Screening</span>
        <span className="text-xs text-muted font-mono">Sweta Sharma © 2025</span>
      </footer>
    </main>
  )
}
