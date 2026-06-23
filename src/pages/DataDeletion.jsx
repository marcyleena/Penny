import React from 'react'
import { useNavigate } from 'react-router-dom'

const MAILTO = 'mailto:createwithskai@gmail.com?subject=Penny%20Data%20Deletion%20Request'

export default function DataDeletion() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '1.5rem', maxWidth: 760, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={backBtn}>← Back to Penny</button>

      <div style={card}>
        <h1 style={h1}>Data Deletion — Penny Budget Manager</h1>
        <p style={lead}>Your right to delete your data</p>
        <p style={body}>
          You have the right to request deletion of your personal data at any time. Here is exactly what that means for Penny.
        </p>

        <Section title="What data we hold about you">
          <div style={{ ...infoBox, background: 'var(--mint)' }}>
            🔒 The only personal data Create With Skai holds is <strong>your email address</strong>, stored in a secure Google Sheet used to verify your Penny access. We do not have access to your financial data — that lives only on your device.
          </div>
        </Section>

        <Section title="How to request deletion">
          <p style={body}>To request deletion of your email address from our records:</p>

          <div style={optionCard}>
            <div style={optionTitle}>Option 1 — Email us directly</div>
            <p style={body}>
              Send an email to <a href="mailto:createwithskai@gmail.com" style={link}>createwithskai@gmail.com</a> with the subject line:
            </p>
            <div style={codeBlock}>Penny Data Deletion Request</div>
            <p style={{ ...body, margin: '0.75rem 0 0' }}>
              Include the email address you used to purchase Penny. We will process your request within 30 days and confirm deletion by reply email.
            </p>
          </div>

          <div style={optionCard}>
            <div style={optionTitle}>Option 2 — Use the button below</div>
            <a href={MAILTO} style={deleteBtn}>
              🗑️ Request Data Deletion
            </a>
            <p style={{ ...body, margin: '0.75rem 0 0', fontSize: 13 }}>
              This opens a pre-filled email to our team. Just hit send.
            </p>
          </div>
        </Section>

        <Section title="What happens when we delete your data">
          <ul style={ul}>
            <li>Your email address is removed from our verified buyers list</li>
            <li>Your access to Penny is revoked on your next login attempt</li>
            <li>We will send you a confirmation email once deletion is complete</li>
          </ul>
        </Section>

        <Section title="What we cannot delete on your behalf">
          <p style={body}>Your financial data (income, expenses, budgets, debts, savings goals, bills) is stored only on your device and is not accessible to us. To delete it:</p>
          <div style={{ ...infoBox, background: 'var(--lavender)', marginBottom: '1rem' }}>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
              <li>Open Penny</li>
              <li>Go to <strong>Settings</strong></li>
              <li>Click <strong>Clear all data</strong></li>
            </ol>
          </div>
          <p style={body}>
            Your <strong>Anthropic API usage history</strong> is governed by Anthropic's own privacy policy. To manage your Anthropic account data, visit <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={link}>console.anthropic.com</a>.
          </p>
          <p style={body}>
            Your <strong>Stan Store purchase record</strong> is governed by Stan Store's privacy policy. For purchase-related data requests, contact Stan Store directly.
          </p>
        </Section>

        <Section title="Questions?">
          <p style={body}>
            Contact us at <a href="mailto:createwithskai@gmail.com" style={link}>createwithskai@gmail.com</a> — we aim to respond within 2 business days.
          </p>
          <div style={{ ...infoBox, background: 'var(--petal)' }}>
            <strong>Create With Skai</strong><br />
            <a href="mailto:createwithskai@gmail.com" style={link}>createwithskai@gmail.com</a>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={h2}>{title}</h2>
      {children}
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
const card = {
  background: '#fff', borderRadius: 20,
  padding: '2.5rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)',
}
const h1 = {
  fontFamily: "'DM Serif Display', serif", color: 'var(--plum)',
  fontSize: 28, margin: '0 0 0.5rem',
}
const h2 = {
  fontFamily: "'DM Serif Display', serif", color: 'var(--plum)',
  fontSize: 20, margin: '0 0 0.75rem',
  paddingTop: '1.5rem', borderTop: '1px solid var(--border)',
}
const lead = {
  fontFamily: "'DM Serif Display', serif", color: 'var(--violet)',
  fontSize: 20, margin: '0 0 1rem', fontStyle: 'italic',
}
const body = {
  color: 'var(--text-mid)', fontSize: 15, lineHeight: 1.75,
  margin: '0 0 0.75rem',
}
const ul = {
  color: 'var(--text-mid)', fontSize: 15, lineHeight: 1.75,
  paddingLeft: '1.5rem', margin: '0 0 0.75rem',
}
const link = { color: 'var(--violet)', textDecoration: 'none' }
const infoBox = {
  background: 'var(--mint)', borderRadius: 12,
  padding: '1rem 1.25rem', fontSize: 14,
  color: 'var(--plum)', lineHeight: 1.7, marginTop: '0.75rem',
}
const optionCard = {
  background: 'var(--cream)', borderRadius: 14,
  border: '1.5px solid var(--border)', padding: '1.25rem',
  marginBottom: '1rem',
}
const optionTitle = {
  fontFamily: "'DM Serif Display', serif", color: 'var(--plum)',
  fontSize: 17, marginBottom: '0.75rem',
}
const codeBlock = {
  background: 'var(--lavender)', borderRadius: 8,
  padding: '8px 14px', fontFamily: 'monospace',
  fontSize: 14, color: 'var(--plum)', display: 'inline-block',
}
const deleteBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'var(--over)', color: '#fff',
  borderRadius: 10, padding: '11px 22px',
  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
  fontSize: 15, textDecoration: 'none', marginTop: '0.25rem',
}
