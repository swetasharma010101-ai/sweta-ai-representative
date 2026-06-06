import { useState } from 'react'
import { X, Calendar, Loader2, CheckCircle } from 'lucide-react'
import { Slot } from '../api'

interface Props {
  slots: Slot[]
  loading: boolean
  onClose: () => void
  onConfirm: (slot: Slot, name: string, email: string) => Promise<void>
}

type Step = 'pick-slot' | 'details' | 'confirming' | 'done'

export default function BookingModal({ slots, loading, onClose, onConfirm }: Props) {
  const [step, setStep]           = useState<Step>('pick-slot')
  const [selectedSlot, setSlot]   = useState<Slot | null>(null)
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [error, setError]         = useState('')

  const handleConfirm = async () => {
    if (!selectedSlot) return
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setStep('confirming')
    try {
      await onConfirm(selectedSlot, name, email)
      setStep('done')
    } catch {
      setError('Booking failed. Please try again.')
      setStep('details')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm px-4">
      <div className="bg-paper border border-border w-full max-w-md relative animate-fade-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-accent" />
            <span className="font-medium text-sm">Book an Interview with Sweta</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Step: Pick slot */}
          {step === 'pick-slot' && (
            <>
              <p className="text-sm text-muted mb-4">
                {loading ? 'Fetching available slots…' : 'Choose a time that works for you:'}
              </p>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={22} className="animate-spin text-muted" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted text-center py-6">
                  No slots found in the next 7 days. Try emailing directly.
                </p>
              ) : (
                <div className="space-y-2">
                  {slots.map((s) => (
                    <button
                      key={s.start}
                      onClick={() => { setSlot(s); setStep('details') }}
                      className="w-full text-left px-4 py-3 border border-border text-sm
                                 hover:border-ink hover:bg-white transition-colors font-mono"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step: Fill in details */}
          {step === 'details' && selectedSlot && (
            <>
              <div className="bg-white border border-border px-4 py-3 mb-4 font-mono text-xs text-muted">
                📅 {selectedSlot.label}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wide block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wide block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
              </div>
              {error && <p className="text-xs text-accent mt-2">{error}</p>}

              <div className="flex gap-2 mt-5">
                <button onClick={() => setStep('pick-slot')} className="btn-ghost flex-1 text-xs py-2">
                  ← Back
                </button>
                <button onClick={handleConfirm} className="btn-primary flex-1 text-xs py-2">
                  Confirm Booking
                </button>
              </div>
            </>
          )}

          {/* Step: Confirming */}
          {step === 'confirming' && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 size={24} className="animate-spin text-muted" />
              <p className="text-sm text-muted">Booking your slot…</p>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <CheckCircle size={32} className="text-green-600" />
              <p className="font-medium text-ink">Interview Booked! 🎉</p>
              <p className="text-sm text-muted">
                A calendar invite has been sent to <strong>{email}</strong>.
              </p>
              <button onClick={onClose} className="btn-primary text-sm mt-2">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
