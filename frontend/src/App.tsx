import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Placeholder — pages will be built in subsequent steps
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div
              style={{
                minHeight: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <h1
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                }}
              >
                Ecosphere
              </h1>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                }}
              >
                ESG Intelligence Platform — scaffold ready ✓
              </p>
              <span
                className="chip chip-env"
                style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px' }}
              >
                v0.1.0 · tokens loaded
              </span>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
