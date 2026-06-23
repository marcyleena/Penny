import React, { useState } from 'react'
import Button from '../components/ui/Button'
import { setStored } from '../hooks/useStorage'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIgotaPkBpHcYJmp1amQU4bphwzUdz8JYaVaxesZQpU0Z9iX2YqcKszRFhEGBuMIOPdA/exec'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const url = `${SCRIPT_URL}?action=verify&email=${encodeURIComponent(email.trim())}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.verified) {
        setStored('penny_email', email.trim())
        onLogin(email.trim())
      } else {
        setError("That email isn't in our system. Please use the email you purchased with.")
      }
    } catch {
      // Dev mode fallback — allow any email if script not configured
      if (false) {
        setStored('penny_email', email.trim())
        onLogin(email.trim())
      } else {
        setError("Couldn't verify your email. Check your connection and try again.")
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--cream)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div className="fade-in" style={{
        background: '#fff', borderRadius: 24,
        padding: '3rem 2.5rem', width: '100%', maxWidth: 420,
        boxShadow: '0 8px 40px rgba(61,43,107,0.12)',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 1.25rem',
          boxShadow: '0 4px 20px rgba(255,209,102,0.4)',
        }}>🪙</div>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 32, color: 'var(--plum)',
          margin: '0 0 0.5rem',
        }}>Meet Penny</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: 16, margin: '0 0 2rem' }}>
          Your AI-powered money manager
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{
              border: '1.5px solid var(--border)', borderRadius: 12,
              padding: '12px 16px', fontSize: 15,
              fontFamily: "'DM Sans', sans-serif", color: 'var(--plum)',
              outline: 'none', width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <Button type="submit" variant="plum" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? '⏳ Checking…' : 'Access Penny →'}
          </Button>
        </form>

        {error && (
          <p style={{ color: 'var(--over)', fontSize: 14, marginTop: 12 }}>{error}</p>
        )}

        <p style={{ color: 'var(--text-light)', fontSize: 12, marginTop: 16, lineHeight: 1.6 }}>
          By accessing Penny you agree to our{' '}
          <a href="/privacy" style={{ color: 'var(--violet)' }}>Privacy Policy</a> and{' '}
          <a href="/terms" style={{ color: 'var(--violet)' }}>Terms of Service</a>.
          Penny uses Claude AI for certain features. You will always be informed when AI is generating content.
        </p>

        <p style={{ color: 'var(--text-light)', fontSize: 13, marginTop: 24 }}>
          Purchased Penny? Use the email you bought with.
        </p>

        {/* Privacy */}
        <div style={{
          marginTop: 24, padding: '1rem', background: 'var(--mint)',
          borderRadius: 12, fontSize: 13, color: 'var(--text-mid)',
          lineHeight: 1.5,
        }}>
          🔒 <strong>Your data never leaves your device.</strong><br />
          No bank login. No credentials. Your financial data stays yours.
        </div>
      </div>
    </div>
  )
}
