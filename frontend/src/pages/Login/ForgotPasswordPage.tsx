import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, ArrowLeft } from 'lucide-react'

type Step = 'email' | 'sent'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<Step>('email')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('sent')
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)', padding: '24px 16px' }}>
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>AssetFlow</span>
      </div>

      <div style={{ width: '100%', maxWidth: 360, background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {step === 'email' ? (
          <>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Reset password</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Enter your email and we'll send a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor="fp-email" style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Email</label>
                <input id="fp-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" className="af-input" />
              </div>
              <button type="submit"
                style={{ width: '100%', padding: '9px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(47,166,107,0.12)', border: '1px solid var(--status-available)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} style={{ color: 'var(--status-available)' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Check your email</h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              If <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> is registered, you'll receive a reset link shortly.
            </p>
          </div>
        )}

        <Link to="/" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
          <ArrowLeft size={12} /> Back to sign in
        </Link>
      </div>
    </main>
  )
}
