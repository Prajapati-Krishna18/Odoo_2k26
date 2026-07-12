import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Layers } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function SignupPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login()
      navigate('/dashboard', { replace: true })
    }, 600)
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)', padding: '24px 16px' }}>
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>AssetFlow</span>
      </div>

      {/* Panel */}
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Create account</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Accounts start as Employee. Roles are assigned by an admin after sign-up.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label htmlFor="signup-name" style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Full Name</label>
            <input id="signup-name" type="text" required autoComplete="name"
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Priya Sharma"
              className="af-input" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label htmlFor="signup-email" style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Email</label>
            <input id="signup-email" type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="af-input" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label htmlFor="signup-pw" style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input id="signup-pw" type={showPw ? 'text' : 'password'} required autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="af-input" style={{ width: '100%', paddingRight: 38 }} />
              <button type="button" onClick={() => setShowPw(s => !s)} tabIndex={-1}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex', alignItems: 'center' }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: '7px 10px', lineHeight: 1.5 }}>
            Role selection is not available during sign-up. An Admin or Department Head will assign your role from the Employee Directory.
          </p>

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '9px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s', marginTop: 4 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
          Already have an account?{' '}
          <Link to="/" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </main>
  )
}
