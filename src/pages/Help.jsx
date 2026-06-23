import React from 'react'
import { useNavigate } from 'react-router-dom'

const CARDS = [
  {
    color: 'var(--pink)',
    bg: 'var(--petal)',
    title: 'Logging in',
    body: 'Use the email address you purchased Penny with on Stan Store. If you get an error, double-check you are using the same email from your purchase receipt.',
  },
  {
    color: 'var(--violet)',
    bg: 'var(--lavender)',
    title: 'Setting up your API key',
    body: 'Go to console.anthropic.com, create a free account, click API Keys, create a new key, copy it, and paste it into Penny\'s Settings page. Typical cost: under $0.50/month.',
  },
  {
    color: 'var(--teal)',
    bg: 'var(--mint)',
    title: 'Importing bank transactions',
    body: 'Go to Transactions, click Import from CSV, paste your bank\'s exported CSV text, review the AI-suggested categories, and click Confirm import.',
  },
  {
    color: 'var(--gold)',
    bg: 'var(--sunshine)',
    title: "Penny's AI features",
    body: "Penny's Take, Ask Penny, CSV import, and Subscription scanner all require your Anthropic API key. Add it in Settings to unlock them.",
  },
  {
    color: 'var(--pink)',
    bg: 'var(--petal)',
    title: 'Lost your access link?',
    body: (
      <>
        Check your Stan Store purchase confirmation email. If you cannot find it, email{' '}
        <a href="mailto:createwithskai@gmail.com" style={link}>createwithskai@gmail.com</a>{' '}
        with your purchase email.
      </>
    ),
  },
  {
    color: 'var(--violet)',
    bg: 'var(--lavender)',
    title: 'API key not working?',
    body: 'Go to Settings, find the API Key section, and click Test connection. Make sure you copied the full key including the sk-ant- prefix.',
  },
  {
    color: 'var(--teal)',
    bg: 'var(--mint)',
    title: 'Deleting your data',
    body: (
      <>
        To clear financial data: Settings, then Clear all data. To remove your email from our records: Settings, then Delete my data, or email{' '}
        <a href="mailto:createwithskai@gmail.com?subject=Penny%20Data%20Deletion%20Request" style={link}>createwithskai@gmail.com</a>{' '}
        with subject <em>Penny Data Deletion Request</em>.
      </>
    ),
  },
  {
    color: 'var(--gold)',
    bg: 'var(--sunshine)',
    title: 'Need more help?',
    body: (
      <>
        Email{' '}
        <a href="mailto:createwithskai@gmail.com?subject=Penny%20Support" style={link}>createwithskai@gmail.com</a>{' '}
        with the subject <em>Penny Support</em>. We respond within 2 business days.
      </>
    ),
  },
]

export default function Help() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '1.5rem', maxWidth: 760, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={backBtn}>← Back to Penny</button>

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={h1}>Help & Support</h1>
        <p style={sub}>Everything you need to get the most out of Penny.</p>
      </div>

      <h2 style={h2}>Quick Start Guide</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {CARDS.map((card, i) => (
          <div key={i} style={{
            background: card.bg,
            borderRadius: 16,
            borderLeft: `4px solid ${card.color}`,
            padding: '1rem 1.25rem',
            boxShadow: '0 2px 12px rgba(61,43,107,0.05)',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--plum)', fontSize: 15, marginBottom: 4 }}>
              {card.title}
            </div>
            <div style={{ color: 'var(--text-mid)', fontSize: 14, lineHeight: 1.7 }}>
              {card.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const backBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'none', border: '1.5px solid var(--border)',
  borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
  color: 'var(--plum)', fontFamily: "'DM Sans', sans-serif",
  fontSize: 14, fontWeight: 600, marginBottom: '1.5rem',
}
const h1 = {
  fontFamily: "'DM Serif Display', serif", color: 'var(--plum)',
  fontSize: 28, margin: '0 0 0.5rem',
}
const h2 = {
  fontFamily: "'DM Serif Display', serif", color: 'var(--plum)',
  fontSize: 20, margin: '0 0 1rem',
}
const sub = {
  color: 'var(--text-mid)', fontSize: 15, margin: 0,
}
const link = { color: 'var(--violet)', textDecoration: 'none' }
