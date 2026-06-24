import React, { useState } from 'react'
import Button from '../components/ui/Button'
import PennyCoin from '../components/penny/PennyCoin'
import { setStored } from '../hooks/useStorage'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIgotaPkBpHcYJmp1amQU4bphwzUdz8JYaVaxesZQpU0Z9iX2YqcKszRFhEGBuMIOPdA/exec'

async function verifyPurchase(email) {
  const url = `${SCRIPT_URL}?action=verify&email=${encodeURIComponent(email.trim())}`
  const res = await fetch(url)
  const data = await res.json()
  return !!data.verified
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const useSupabase = isSupabaseConfigured()

  async function handleSignIn(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')

    if (useSupabase) {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (err) {
        setError(err.message || 'Sign-in failed. Check your email and password.')
        setLoading(false)
        return
      }
      setStored('penny_email', email.trim())
      onLogin(email.trim())
    } else {
      // Legacy: Google Sheet verification only
      try {
        const verified = await verifyPurchase(email)
        if (verified) {
          setStored('penny_email', email.trim())
          onLogin(email.trim())
        } else {
          setError("That email isn't in our system. Please use the email you purchased with.")
        }
      } catch {
        setError("Couldn't verify your email. Check your connection and try again.")
      }
    }
    setLoading(false)
  }

  async function handleSignUp(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')

    // Step 1: verify purchase via Google Sheet
    try {
      const verified = await verifyPurchase(email)
      if (!verified) {
        setError("That email isn't in our purchase records. Use the email you bought Penny with.")
        setLoading(false)
        return
      }
    } catch {
      setError("Couldn't verify your purchase. Check your connection and try again.")
      setLoading(false)
      return
    }

    // Step 2: create Supabase account
    if (useSupabase) {
      const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password })
      if (err) {
        setError(err.message || 'Account creation failed. Try again.')
        setLoading(false)
        return
      }
      if (data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email.trim(),
          currency: 'USD',
          budget_method: '4buckets',
        }).catch(() => {})
      }
      setStored('penny_email', email.trim())
      onLogin(email.trim())
    } else {
      // No Supabase — just grant access after purchase verification
      setStored('penny_email', email.trim())
      onLogin(email.trim())
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', filter: 'drop-shadow(0 4px 12px rgba(255,209,102,0.45))' }}>
          <PennyCoin size={72} />
        </div>

        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: 'var(--plum)', margin: '0 0 0.5rem' }}>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p style={{ color: 'var(--text-mid)', fontSize: 15, margin: '0 0 1.5rem' }}>
          {mode === 'signin' ? 'Sign in to your Penny account' : 'Use the email you purchased Penny with'}
        </p>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--border)', borderRadius: 10, padding: 4, marginBottom: '1.5rem' }}>
          {[['signin', 'Sign in'], ['signup', 'Create account']].map(([v, l]) => (
            <button key={v} onClick={() => { setMode(v); setError('') }} style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: mode === v ? '#fff' : 'transparent',
              color: mode === v ? 'var(--plum)' : 'var(--text-mid)',
              fontWeight: mode === v ? 600 : 400, fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
            }}>{l}</button>
          ))}
        </div>

        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={fieldStyle}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Choose a password (8+ chars)' : 'Your password'}
              required
              style={{ ...fieldStyle, paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowPw(v => !v)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0,
            }}>{showPw ? '🙈' : '👁️'}</button>
          </div>

          <Button type="submit" variant="plum" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? '⏳ Please wait…' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
          </Button>
        </form>

        {error && (
          <p style={{ color: 'var(--over)', fontSize: 14, marginTop: 12 }}>{error}</p>
        )}

        {mode === 'signup' && (
          <div style={{ marginTop: 16, background: 'var(--lavender)', borderRadius: 12, padding: '0.875rem 1rem', fontSize: 13, color: 'var(--plum)', textAlign: 'left', lineHeight: 1.6 }}>
            🔑 <strong>Purchase required.</strong> Penny is a one-time purchase. Your account is linked to the email you bought with. <a href="https://stan.store" target="_blank" rel="noreferrer" style={{ color: 'var(--violet)' }}>Get Penny →</a>
          </div>
        )}

        <p style={{ color: 'var(--text-light)', fontSize: 12, marginTop: 16, lineHeight: 1.6 }}>
          By accessing Penny you agree to our{' '}
          <a href="/privacy" style={{ color: 'var(--violet)' }}>Privacy Policy</a> and{' '}
          <a href="/terms" style={{ color: 'var(--violet)' }}>Terms of Service</a>.
          Penny uses Claude AI for certain features. You will always be informed when AI is generating content.
        </p>

        <div style={{ marginTop: 20, padding: '1rem', background: 'var(--mint)', borderRadius: 12, fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5 }}>
          🔒 <strong>Your data never leaves your device.</strong><br />
          No bank login. No credentials. Your financial data stays yours.
        </div>
      </div>
    </div>
  )
}

const fieldStyle = {
  border: '1.5px solid var(--border)', borderRadius: 12,
  padding: '12px 16px', fontSize: 15,
  fontFamily: "'DM Sans', sans-serif", color: 'var(--plum)',
  outline: 'none', width: '100%', boxSizing: 'border-box',
}
