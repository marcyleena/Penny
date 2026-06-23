import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Terms() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '1.5rem', maxWidth: 760, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={backBtn}>← Back to Penny</button>

      <div style={card}>
        <h1 style={h1}>Terms of Service — Penny Budget Manager</h1>
        <p style={effectiveDate}>Effective date: June 2026</p>
        <p style={body}>
          These Terms of Service govern your use of Penny, a personal budget management application operated by Create With Skai (<a href="mailto:createwithskai@gmail.com" style={link}>createwithskai@gmail.com</a>). By accessing or using Penny, you agree to these terms.
        </p>

        <Section title="1. License">
          <p style={body}>Upon purchase, Create With Skai grants you a personal, non-transferable, non-exclusive license to use Penny for your own personal budgeting purposes. You may not resell, sublicense, share access, or redistribute Penny or any part of it.</p>
        </Section>

        <Section title="2. AI features and third-party services">
          <p style={body}>Penny's AI features require an Anthropic API key that you obtain and pay for directly from Anthropic. By using Penny's AI features, you agree to <a href="https://www.anthropic.com/legal/terms" target="_blank" rel="noreferrer" style={link}>Anthropic's terms of service</a> and usage policies. Create With Skai is not responsible for the availability, accuracy, or cost of Anthropic's services.</p>
          <p style={body}>The AI features in Penny provide financial analysis and suggestions for informational purposes only. They do not constitute financial advice. Always consult a qualified financial professional before making significant financial decisions.</p>
        </Section>

        <Section title="3. Not financial advice">
          <div style={{ ...infoBox, background: 'var(--sunshine)', marginBottom: '0.75rem' }}>
            ⚠️ <strong>Important:</strong> Penny is a budgeting tool, not a financial advisor. Nothing in Penny, including AI-generated content, constitutes financial, investment, legal, or tax advice.
          </div>
          <p style={body}>Create With Skai is not a registered financial advisor. Use Penny's outputs as a starting point for your own research and decision-making.</p>
        </Section>

        <Section title="4. Your data">
          <p style={body}>Your financial data is stored locally on your device. You are solely responsible for backing up and securing your data. Create With Skai has no access to your financial data and accepts no responsibility for data loss.</p>
        </Section>

        <Section title="5. Refund policy">
          <p style={body}>Due to the digital nature of Penny, all sales are final. If you experience a technical issue that prevents you from accessing Penny, contact us at <a href="mailto:createwithskai@gmail.com" style={link}>createwithskai@gmail.com</a> and we will work to resolve it within 5 business days.</p>
        </Section>

        <Section title="6. Limitation of liability">
          <p style={body}>To the maximum extent permitted by applicable law, Create With Skai shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of Penny, including but not limited to financial losses resulting from decisions made based on Penny's outputs.</p>
        </Section>

        <Section title="7. Changes to these terms">
          <p style={body}>We may update these Terms of Service from time to time. Continued use of Penny after changes constitutes your acceptance of the updated terms.</p>
        </Section>

        <Section title="8. Contact">
          <p style={body}>For any questions about these terms, contact us at:</p>
          <div style={{ ...infoBox, background: 'var(--lavender)' }}>
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
const effectiveDate = {
  color: 'var(--text-light)', fontSize: 13, margin: '0 0 1.5rem',
}
const body = {
  color: 'var(--text-mid)', fontSize: 15, lineHeight: 1.75,
  margin: '0 0 0.75rem',
}
const link = { color: 'var(--violet)', textDecoration: 'none' }
const infoBox = {
  background: 'var(--mint)', borderRadius: 12,
  padding: '1rem 1.25rem', fontSize: 14,
  color: 'var(--plum)', lineHeight: 1.7, marginTop: '0.75rem',
}
