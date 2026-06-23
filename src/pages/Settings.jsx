import React, { useState } from 'react'
import Button from '../components/ui/Button'
import { useStorage, getStored, setStored } from '../hooks/useStorage'
import { callPenny } from '../hooks/usePenny'

const DEFAULT_CATEGORIES = [
  'Housing','Food & Groceries','Transport','Utilities','Entertainment',
  'Health','Clothing','Personal Care','Savings','Other',
]

export default function Settings() {
  const [name, setName] = useStorage('penny_name', '')
  const [currency, setCurrency] = useStorage('penny_currency', 'USD')
  const [apiKey, setApiKey] = useState(getStored('penny_api_key', ''))
  const [showKey, setShowKey] = useState(false)
  const [keyStatus, setKeyStatus] = useState('')
  const [keyTesting, setKeyTesting] = useState(false)
  const [categories, setCategories] = useStorage('penny_categories', DEFAULT_CATEGORIES)
  const [newCat, setNewCat] = useState('')
  const email = getStored('penny_email', '')
  const [income, setIncome] = useStorage('penny_monthly_income', 0)

  async function testKey() {
    if (!apiKey.trim()) return
    setKeyTesting(true)
    setKeyStatus('')
    setStored('penny_api_key', apiKey.trim())
    try {
      await callPenny('Respond with exactly: connected', 'ping')
      setKeyStatus('connected')
    } catch {
      setKeyStatus('error')
    }
    setKeyTesting(false)
  }

  function saveKey() {
    setStored('penny_api_key', apiKey.trim())
    alert('API key saved!')
  }

  function exportData() {
    const keys = ['penny_transactions','penny_budgets','penny_categories','penny_debts','penny_goals','penny_sinking_funds','penny_bills','penny_assets','penny_liabilities','penny_name','penny_currency','penny_monthly_income']
    const data = {}
    keys.forEach(k => { data[k] = getStored(k) })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'penny-data.json'; a.click()
    URL.revokeObjectURL(url)
  }

  function clearData() {
    if (!confirm('This will delete ALL your Penny data permanently. Are you sure?')) return
    if (!confirm('Last chance — this cannot be undone. Clear everything?')) return
    const keys = ['penny_transactions','penny_budgets','penny_categories','penny_debts','penny_goals','penny_sinking_funds','penny_bills','penny_assets','penny_liabilities','penny_monthly_income','penny_api_key']
    keys.forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  function addCategory() {
    const t = newCat.trim()
    if (!t || categories.includes(t)) return
    setCategories(prev => [...prev, t])
    setNewCat('')
  }

  function removeCategory(cat) {
    if (!confirm(`Remove "${cat}"?`)) return
    setCategories(prev => prev.filter(c => c !== cat))
  }

  const CURRENCIES = ['USD','GBP','EUR','CAD','AUD','ZAR','NGN','JPY','CHF','SEK','NZD','SGD','HKD','INR','BRL']

  return (
    <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1.5rem', fontSize: 28 }}>Settings</h1>

      {/* Profile */}
      <Section title="Profile 👤">
        <Row label="Your Name">
          <input value={name} onChange={e=>setName(e.target.value)} style={inputSt} placeholder="First name" />
        </Row>
        <Row label="Email">
          <span style={{ color: 'var(--text-mid)', fontSize: 14 }}>{email}</span>
        </Row>
        <Row label="Currency">
          <select value={currency} onChange={e=>setCurrency(e.target.value)} style={inputSt}>
            {CURRENCIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </Row>
        <Row label="Monthly Income">
          <input type="number" value={income||''} onChange={e=>setIncome(Number(e.target.value)||0)} style={{...inputSt,width:160}} placeholder="0.00" />
        </Row>
      </Section>

      {/* API Key */}
      <Section title="Anthropic API Key 🧠">
        <p style={{ color: 'var(--text-mid)', fontSize: 14, margin: '0 0 1rem' }}>
          Your API key is stored only on this device and used directly to talk to Anthropic. Penny never sees it.
        </p>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            style={{ ...inputSt, paddingRight: 50, width: '100%' }}
          />
          <button onClick={() => setShowKey(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18 }}>
            {showKey ? '🙈' : '👁️'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="plum" onClick={saveKey} disabled={!apiKey.trim()}>Save Key</Button>
          <Button variant="ghost" onClick={testKey} disabled={!apiKey.trim() || keyTesting}>
            {keyTesting ? '⏳ Testing…' : 'Test Connection'}
          </Button>
        </div>
        {keyStatus === 'connected' && <p style={{ color: 'var(--ok)', fontWeight: 600, marginTop: 8 }}>✓ Connected</p>}
        {keyStatus === 'error' && <p style={{ color: 'var(--over)', fontWeight: 600, marginTop: 8 }}>✗ Not connected — check your key</p>}
      </Section>

      {/* Categories */}
      <Section title="Budget Categories 🗂️">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
          {categories.map(cat => (
            <div key={cat} style={{
              background: 'var(--lavender)', borderRadius: 20, padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--plum)', fontWeight: 500,
            }}>
              {cat}
              <button onClick={() => removeCategory(cat)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--text-light)', padding:0, lineHeight:1 }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCategory()} placeholder="New category…" style={{ ...inputSt, flex:1 }} />
          <Button variant="teal" onClick={addCategory} disabled={!newCat.trim()} small>+ Add</Button>
        </div>
      </Section>

      {/* Data */}
      <Section title="Data & Privacy 🔒">
        <div style={{ background: 'var(--mint)', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '1rem', fontSize: 14, color: 'var(--plum)', lineHeight: 1.6 }}>
          🔒 <strong>Your data never leaves your device.</strong> All data is stored in your browser's localStorage. No bank login. No credentials. Your financial data stays yours.
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={exportData}>📥 Export All Data</Button>
          <Button variant="danger" onClick={clearData}>🗑️ Clear All Data</Button>
        </div>
      </Section>

      {/* Legal */}
      <Section title="Legal ⚖️">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a href="/privacy" style={legalLink}>
            📄 Privacy Policy
          </a>
          <a href="/terms" style={legalLink}>
            📋 Terms of Service
          </a>
          <a
            href="mailto:createwithskai@gmail.com?subject=Penny%20Data%20Deletion%20Request"
            style={{ ...legalLink, color: 'var(--over)' }}
          >
            🗑️ Delete my data
          </a>
          <p style={{ fontSize: 12, color: 'var(--text-light)', margin: '4px 0 0', lineHeight: 1.5 }}>
            To request deletion of your data, email us and we'll process your request within 30 days. Note: all app data is stored locally on your device — you can also clear it instantly via the Data section above.
          </p>
        </div>
      </Section>

      {/* About */}
      <Section title="About Penny">
        <div style={{ color: 'var(--text-mid)', fontSize: 14, lineHeight: 1.8 }}>
          <div>Version 1.0.0</div>
          <div>Built with ❤️ for women who want to own their money.</div>
          <div>Support: <a href="mailto:support@penny.app" style={{ color: 'var(--violet)' }}>support@penny.app</a></div>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1.25rem', fontSize: 20 }}>{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-mid)', width: 140, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  )
}

const inputSt = {
  border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 14px',
  fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'var(--plum)',
  outline:'none', boxSizing:'border-box', background:'#fff',
}

const legalLink = {
  color: 'var(--violet)', fontSize: 14, fontWeight: 600,
  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
}
