import React, { useState } from 'react'
import Button from '../components/ui/Button'
import PennyCoin from '../components/penny/PennyCoin'
import { setStored } from '../hooks/useStorage'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const CURRENCIES = ['USD','GBP','EUR','CAD','AUD','ZAR','NGN','JPY','CHF','SEK','NZD','SGD','HKD','INR','BRL']

const BUDGET_METHODS = [
  {
    id: 'zerobased',
    label: 'I want to know where every dollar goes',
    description: 'Every dollar gets assigned a job. Income minus all assigned expenses equals zero. Total control, total visibility.',
    tooltip: 'Best for: women who want to track every dollar and leave nothing unaccounted for.',
    border: 'var(--violet)',
    bg: 'var(--lavender)',
  },
  {
    id: 'payyourselffirst',
    label: 'I want to save automatically and not stress about the rest',
    description: 'Decide your savings amount first, automate it, then spend the rest however you want.',
    tooltip: 'Best for: busy women who want to build wealth without tracking every purchase.',
    border: 'var(--teal)',
    bg: 'var(--mint)',
  },
  {
    id: '4buckets',
    label: 'I want a simple system that fits my real life',
    description: 'Four buckets: Fixed Needs, Variable Needs, Goals, and Fun. Simple, flexible, built for real life.',
    tooltip: 'Best for: women with variable income, side hustles, or anyone who wants structure without rigidity.',
    border: 'var(--pink)',
    bg: 'var(--petal)',
    recommended: true,
  },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [budgetMethod, setBudgetMethod] = useState('4buckets')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  function nextStep() { setStep(s => s + 1) }

  async function finish() {
    setStored('penny_name', name)
    setStored('penny_currency', currency)
    setStored('penny_budget_method', budgetMethod)
    if (apiKey.trim()) setStored('penny_api_key', apiKey.trim())
    setStored('penny_onboarded', true)

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            first_name: name,
            currency,
            budget_method: budgetMethod,
          })
        }
      } catch {}
    }

    onComplete()
  }

  const wrapStyle = {
    minHeight: '100vh', background: 'var(--cream)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem 1rem',
  }
  const cardStyle = {
    background: '#fff', borderRadius: 24,
    padding: '2.5rem 2rem', width: '100%', maxWidth: 520,
    boxShadow: '0 8px 40px rgba(61,43,107,0.12)',
  }
  const totalSteps = 5
  const progressDots = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: '1.75rem' }}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map(n => (
        <div key={n} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: n <= step ? 'var(--violet)' : 'var(--border)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  )

  if (step === 1) return (
    <div style={wrapStyle}>
      <div className="fade-in" style={{ ...cardStyle, textAlign: 'center' }}>
        {progressDots}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 12px rgba(255,209,102,0.4))' }}>
          <PennyCoin size={72} />
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: 'var(--plum)', margin: '0 0 1rem' }}>
          Hi, I'm Penny
        </h1>
        <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '1rem' }}>
          Your AI-powered money manager. I'll help you track spending, crush debt, hit savings goals, and tell you exactly what your money is doing.
        </p>
        <p style={{ color: 'var(--text-mid)', fontSize: 15, marginBottom: '2rem' }}>
          Let's get you set up in 4 steps.
        </p>
        <Button variant="plum" onClick={nextStep} style={{ width: '100%', justifyContent: 'center' }}>
          Let's go →
        </Button>
      </div>
    </div>
  )

  if (step === 2) return (
    <div style={wrapStyle}>
      <div className="fade-in" style={cardStyle}>
        {progressDots}
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: 'var(--plum)', margin: '0 0 1.5rem' }}>
          A little about you
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-mid)' }}>What should I call you?</span>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your first name"
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-mid)' }}>What currency do you use?</span>
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <Button variant="plum" onClick={nextStep} disabled={!name.trim()}
          style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>
          Continue →
        </Button>
      </div>
    </div>
  )

  if (step === 3) return (
    <div style={wrapStyle}>
      <div className="fade-in" style={cardStyle}>
        {progressDots}
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--plum)', margin: '0 0 0.5rem' }}>
          How do you want to manage your money?
        </h2>
        <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: '1.25rem' }}>
          Pick the style that sounds most like you. You can always change this in Settings.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
          {BUDGET_METHODS.map(m => (
            <div
              key={m.id}
              onClick={() => setBudgetMethod(m.id)}
              style={{
                borderRadius: 14, padding: '1rem 1.25rem',
                border: `2px solid ${budgetMethod === m.id ? m.border : 'var(--border)'}`,
                background: budgetMethod === m.id ? m.bg : '#fff',
                cursor: 'pointer', transition: 'all 0.2s',
                borderLeft: `4px solid ${m.border}`,
                position: 'relative',
              }}
            >
              {m.recommended && (
                <div style={{
                  position: 'absolute', top: -10, right: 12,
                  background: 'var(--pink)', color: '#fff',
                  fontSize: 10, fontWeight: 700, borderRadius: 99,
                  padding: '2px 8px', letterSpacing: '0.05em',
                }}>PENNY RECOMMENDS</div>
              )}
              <div style={{ fontWeight: 600, color: 'var(--plum)', fontSize: 14, marginBottom: 4 }}>{m.label}</div>
              <div style={{ color: 'var(--text-mid)', fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{m.description}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)', fontStyle: 'italic' }}>{m.tooltip}</div>
            </div>
          ))}
        </div>
        <Button variant="plum" onClick={nextStep} style={{ width: '100%', justifyContent: 'center' }}>
          Continue →
        </Button>
      </div>
    </div>
  )

  if (step === 4) return (
    <div style={wrapStyle}>
      <div className="fade-in" style={cardStyle}>
        {progressDots}
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--plum)', margin: '0 0 0.5rem' }}>
          Set up Penny's AI brain
        </h2>
        <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: '1.25rem' }}>
          Optional but magical ✨ Penny uses Claude AI to give you personalised money insights. You'll need a free Anthropic API key — it takes 3 minutes and costs less than $1/month at typical usage.
        </p>
        <div style={{
          background: 'var(--lavender)', borderRadius: 12, padding: '1rem',
          marginBottom: '1.25rem', fontSize: 14, color: 'var(--plum)',
        }}>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
            <li>Go to <strong>console.anthropic.com</strong></li>
            <li>Create a free account</li>
            <li>Click <strong>"API Keys" → "Create Key"</strong></li>
            <li>Copy your key and paste it below</li>
          </ol>
        </div>
        <div style={{
          background: 'var(--sky)', borderRadius: 12, padding: '0.875rem 1rem',
          marginBottom: '1.25rem', fontSize: 13, color: 'var(--plum)', lineHeight: 1.6,
          border: '1px solid #C7E3FF',
        }}>
          ℹ️ When you use AI features, your financial queries are sent directly from your browser to Anthropic using your API key. Penny never stores or transmits your API key. <a href="https://www.anthropic.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--violet)' }}>Anthropic's Privacy Policy</a> governs how they handle your queries.
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            style={{ ...inputStyle, paddingRight: 50 }}
          />
          <button onClick={() => setShowKey(v => !v)} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
          }}>{showKey ? '🙈' : '👁️'}</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-light)', margin: '8px 0 1.25rem' }}>
          🔒 Your API key is stored only on your device. Penny never sees it.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="plum" onClick={nextStep} style={{ width: '100%', justifyContent: 'center' }}>
            Save key & continue →
          </Button>
          <Button variant="ghost" onClick={nextStep} style={{ width: '100%', justifyContent: 'center' }}>
            Skip for now — I'll add this later in Settings
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={wrapStyle}>
      <div className="fade-in" style={{ ...cardStyle, textAlign: 'center' }}>
        {progressDots}
        <div style={{ fontSize: 56, marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: 'var(--plum)', margin: '0 0 1rem' }}>
          You're all set, {name}!
        </h1>
        <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Penny is ready to help you take control of your money.
        </p>
        <Button variant="gold" onClick={finish} style={{ width: '100%', justifyContent: 'center', fontSize: 16 }}>
          Let's go →
        </Button>
      </div>
    </div>
  )
}

const inputStyle = {
  border: '1.5px solid var(--border)', borderRadius: 10,
  padding: '11px 14px', fontSize: 15,
  fontFamily: "'DM Sans', sans-serif", color: 'var(--plum)',
  outline: 'none', width: '100%', boxSizing: 'border-box',
  background: '#fff',
}
