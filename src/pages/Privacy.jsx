import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Privacy() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '1.5rem', maxWidth: 760, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={backBtn}>← Back to Penny</button>

      <div style={card}>
        <h1 style={h1}>Privacy Policy — Penny Budget Manager</h1>
        <p style={effectiveDate}>Effective date: June 2026</p>
        <p style={body}>
          Penny is a product of Create With Skai, operated by DEFGRAV Solutions LLC (<a href="mailto:createwithskai@gmail.com" style={link}>createwithskai@gmail.com</a>). This Privacy Policy explains what information we collect, how we use it, and your rights regarding that information.
        </p>

        <Section title="1. What information we collect">
          <p style={body}>We collect the minimum information necessary to operate Penny.</p>
          <p style={subhead}>Information you provide directly:</p>
          <ul style={ul}>
            <li>Your email address, collected at the time of purchase via Stan Store and used solely to verify your access to Penny.</li>
            <li>Your financial data, including income, expenses, budgets, debts, savings goals, and bills. This data is entered by you and stored locally on your device using your browser's localStorage. We do not transmit, store, or access this data on any server.</li>
          </ul>
          <p style={subhead}>Information collected automatically:</p>
          <ul style={ul}>
            <li>We do not collect analytics, usage data, cookies, or tracking information of any kind.</li>
          </ul>
          <p style={subhead}>Information you choose to share with third parties:</p>
          <ul style={ul}>
            <li>If you choose to use Penny's AI features, you will provide your own Anthropic API key. When you submit queries through Penny's AI features (such as Penny's Take or Ask Penny), the text of those queries, including any financial data you include, is sent directly from your browser to Anthropic's API. This data is governed by <a href="https://www.anthropic.com/privacy" target="_blank" rel="noreferrer" style={link}>Anthropic's Privacy Policy</a>. Penny does not store, transmit, or have access to your API key or your Anthropic query history.</li>
          </ul>
        </Section>

        <Section title="2. How we use your information">
          <ul style={ul}>
            <li>Your email address is used only to verify that you are an authorized purchaser of Penny. It is stored in a Google Sheet accessible only to Create With Skai and is never sold, shared, or used for marketing without your explicit consent.</li>
            <li>Your financial data never leaves your device. It is stored locally in your browser and is not accessible to us or any third party.</li>
          </ul>
        </Section>

        <Section title="3. Third parties that may touch your data">
          <p style={body}>We use a small number of third-party services to operate Penny:</p>
          <ul style={ul}>
            <li><strong>Stan Store (storelink.ai)</strong> processes your purchase and delivers your access email. Their privacy policy governs your purchase transaction.</li>
            <li><strong>Google (google.com)</strong> — we use Google Apps Script and Google Sheets to store your verified purchase email and process access requests. Your email address is stored on Google's servers under Google's terms of service and privacy policy.</li>
            <li><strong>Anthropic (anthropic.com)</strong> — if you use Penny's AI features, queries are sent directly from your browser to Anthropic's API using your own API key. Anthropic's privacy policy governs how they handle these requests.</li>
            <li><strong>Vercel (vercel.com)</strong> — Penny is hosted on Vercel. Vercel may collect standard server logs (such as IP addresses and request timestamps) as part of hosting. We do not control or access these logs.</li>
          </ul>
          <p style={body}>We do not use advertising networks, analytics platforms, or any other third-party data processors beyond those listed above.</p>
        </Section>

        <Section title="4. Data retention">
          <ul style={ul}>
            <li>Your email address is retained in our Google Sheet for as long as you hold a valid Penny license. You may request deletion at any time (see Section 6).</li>
            <li>Your financial data exists only on your device. You can delete it at any time from Penny's Settings page using the <strong>Clear all data</strong> function.</li>
          </ul>
        </Section>

        <Section title="5. Your rights">
          <p style={body}>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul style={ul}>
            <li><strong>Right to access:</strong> You may request a copy of the personal data we hold about you (your email address).</li>
            <li><strong>Right to deletion:</strong> You may request that we delete your email address from our verified buyers list. See Section 6 for how to submit this request.</li>
            <li><strong>Right to correction:</strong> You may request that we correct your email address in our records.</li>
            <li><strong>Right to object:</strong> You may object to our processing of your personal data.</li>
          </ul>
          <p style={body}>EU and UK residents have these rights under the General Data Protection Regulation (GDPR) and UK GDPR. California residents have rights under the California Consumer Privacy Act (CCPA).</p>
        </Section>

        <Section title="6. How to request data deletion">
          <p style={body}>To request deletion of your personal data (your email address from our verified buyers list):</p>
          <ul style={ul}>
            <li>Email <a href="mailto:createwithskai@gmail.com" style={link}>createwithskai@gmail.com</a> with the subject line: <strong>Penny Data Deletion Request</strong></li>
            <li>Include the email address you used to purchase Penny</li>
            <li>We will process your request within 30 days and confirm deletion by email</li>
          </ul>
          <div style={infoBox}>
            ℹ️ Deleting your email from our records will remove your access to Penny. Your financial data stored locally on your device is not accessible to us and must be deleted by you using the <strong>Clear all data</strong> function in Penny's Settings.
          </div>
        </Section>

        <Section title="7. AI and automated decision-making">
          <p style={body}>Penny uses artificial intelligence features powered by Anthropic's Claude AI model. These features include:</p>
          <ul style={ul}>
            <li><strong>Penny's Take:</strong> An AI-generated summary and analysis of your monthly financial data</li>
            <li><strong>Ask Penny:</strong> A conversational AI assistant that responds to questions about your finances</li>
            <li><strong>CSV import categorization:</strong> AI-assisted categorization of imported bank transactions</li>
            <li><strong>Subscription scanner:</strong> AI detection of recurring charges in your transaction history</li>
          </ul>
          <p style={body}>These AI features are clearly labeled within the Penny application. They provide analysis and suggestions only and do not make any decisions on your behalf. All financial decisions remain yours. The AI features require your own Anthropic API key and are governed by Anthropic's usage policies.</p>
          <p style={body}>In compliance with the EU AI Act (effective August 2024), Penny discloses that it uses AI-generated content in the features listed above. Users are always informed when they are interacting with or receiving output from an AI system.</p>
        </Section>

        <Section title="8. Children's privacy">
          <p style={body}>Penny is not intended for use by anyone under the age of 18. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us at <a href="mailto:createwithskai@gmail.com" style={link}>createwithskai@gmail.com</a>.</p>
        </Section>

        <Section title="9. Changes to this policy">
          <p style={body}>We may update this Privacy Policy from time to time. We will notify you of material changes by updating the effective date at the top of this document. Continued use of Penny after any changes constitutes your acceptance of the updated policy.</p>
        </Section>

        <Section title="10. Contact">
          <p style={body}>For any privacy-related questions or requests, contact us at:</p>
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
const subhead = {
  color: 'var(--plum)', fontSize: 14, fontWeight: 700,
  margin: '1rem 0 0.5rem',
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
