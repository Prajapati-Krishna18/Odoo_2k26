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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      login()
      navigate('/dashboard')
    }, 500)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 text-sm">
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
