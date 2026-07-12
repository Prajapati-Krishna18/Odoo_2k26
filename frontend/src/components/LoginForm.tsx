import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { TextField } from '@/components/ui/TextField'

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Invalid email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 text-sm">
      {errorMsg && (
        <div style={{
          fontSize: '0.75rem',
          color: '#ef4444',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '8px 12px',
          lineHeight: 1.4
        }}>
          {errorMsg}
        </div>
      )}
      <TextField
        id="email"
        label="Email address"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="hello@assetflow.com"
      />

      <TextField
        id="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your password"
        trailing={
          <button
            type="button"
            className="rounded-full px-2.5 py-1 text-[0.75rem] font-semibold text-text-muted transition hover:text-text-primary"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        }
      />

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-11 w-full items-center justify-center rounded-[0.75rem] bg-accent-cyan px-5 text-sm font-semibold text-bg-void transition duration-200 ease-out hover:bg-accent-cyan/95 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
      >
        {isLoading ? 'Logging in…' : 'Login'}
      </button>

      <p className="text-xs leading-6 text-text-muted">
        This is a frontend-only login flow. Any credentials work, and you will be redirected to the dashboard immediately.
      </p>
    </form>
  )
}
