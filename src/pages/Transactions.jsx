import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency, formatDate, todayISO } from '../utils/formatters'
import { categoryColour, categoryBg } from '../utils/colours'
import { callPenny } from '../hooks/usePenny'

const DEFAULT_CATEGORIES = [
  'Housing','Food & Groceries','Transport','Utilities','Entertainment',
  'Health','Clothing','Personal Care','Savings','Other','Income',
]

export default function Transactions() {
  const [transactions, setTransactions] = useStorage('penny_transactions', [])
  const [categories] = useStorage('penny_categories', DEFAULT_CATEGORIES)
  const [currency] = useStorage('penny_currency', 'USD')
  const [tab, setTab] = useState('expenses')
  const [addOpen, setAddOpen] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [csvParsed, setCsvParsed] = useState(null)
  const [csvLoading, setCsvLoading] = useState(false)
  const [form, setForm] = useState({ date: todayISO(), description: '', amount: '', category: categories[0], notes: '', type: 'expense' })

  function addTransaction() {
    if (!form.description || !form.amount) return
    const tx = { ...form, amount: Math.abs(Number(form.amount)), id: Date.now() }
    setTransactions(prev => [tx, ...prev])
    setForm({ date: todayISO(), description: '', amount: '', category: categories[0], notes: '', type: 'expense' })
    setAddOpen(false)
  }

  function deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  async function parseCSV() {
    if (!csvText.trim()) return
    setCsvLoading(true)
    try {
      const catList = categories.join(', ')
      const result = await callPenny(
        'You are a financial data parser. Return only valid JSON arrays, no other text.',
        `Parse this bank statement CSV and extract transactions. For each transaction return: date (YYYY-MM-DD), description, amount (positive=income, negative=expense), and suggested category from this list: ${catList}. Return as JSON array only.\n\nCSV:\n${csvText.slice(0, 4000)}`
      )
      const parsed = JSON.parse(result.trim().replace(/```json|```/g,''))
      setCsvParsed(parsed.map((t, i) => ({
        ...t,
        id: Date.now() + i,
        type: t.amount < 0 ? 'expense' : 'income',
        amount: Math.abs(t.amount),
        selected: true,
      })))
    } catch (e) {
      alert('Could not parse CSV. Make sure your API key is configured in Settings.')
    }
    setCsvLoading(false)
  }

  function confirmImport() {
    const toAdd = csvParsed.filter(t => t.selected).map(({ selected, ...t }) => t)
    setTransactions(prev => [...toAdd, ...prev])
    setCsvParsed(null)
    setCsvText('')
    setCsvOpen(false)
  }

  const filtered = transactions.filter(t =>
    tab === 'all' ? true :
    tab === 'expenses' ? t.type === 'expense' :
    t.type === 'income'
  ).sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalIncome = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const totalExpense = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: 0, fontSize: 28 }}>Transactions</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={() => setCsvOpen(true)} small>📤 Import CSV</Button>
          <Button variant="pink" onClick={() => setAddOpen(true)}>+ Add</Button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--mint)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Total Income</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: 'var(--teal)' }}>{formatCurrency(totalIncome, currency)}</div>
        </div>
        <div style={{ background: 'var(--petal)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Total Expenses</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: 'var(--pink)' }}>{formatCurrency(totalExpense, currency)}</div>
        </div>
        <div style={{ background: 'var(--lavender)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Net</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: totalIncome-totalExpense >= 0 ? 'var(--ok)' : 'var(--over)' }}>{formatCurrency(totalIncome-totalExpense, currency)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', background: 'var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[['all','All'],['expenses','Expenses'],['income','Income']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === v ? '#fff' : 'transparent',
            color: tab === v ? 'var(--plum)' : 'var(--text-mid)',
            fontWeight: tab === v ? 600 : 400, fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
          }}>{l}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(61,43,107,0.06)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💳</div>
            <p>No transactions yet. Add one or import a CSV!</p>
          </div>
        ) : filtered.map((tx, i) => (
          <div key={tx.id || i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              background: categoryBg(tx.category), borderRadius: 10,
              padding: '4px 10px', fontSize: 12, fontWeight: 600,
              color: categoryColour(tx.category), whiteSpace: 'nowrap', flexShrink: 0,
            }}>{tx.category}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--plum)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
              <div style={{ color: 'var(--text-light)', fontSize: 12 }}>{formatDate(tx.date)}{tx.notes ? ` · ${tx.notes}` : ''}</div>
            </div>
            <div style={{
              fontFamily: "'DM Serif Display', serif", fontSize: 18,
              color: tx.type === 'income' ? 'var(--teal)' : 'var(--pink)',
              flexShrink: 0,
            }}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
            </div>
            <button onClick={() => deleteTransaction(tx.id || i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 18, padding: 4 }}>×</button>
          </div>
        ))}
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Transaction">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['expense','income'].map(t => (
              <button key={t} onClick={() => setForm(f=>({...f,type:t}))} style={{
                flex:1, padding: '8px', borderRadius: 10, border: '2px solid',
                borderColor: form.type===t ? (t==='expense'?'var(--pink)':'var(--teal)') : 'var(--border)',
                background: form.type===t ? (t==='expense'?'var(--petal)':'var(--mint)') : '#fff',
                cursor:'pointer', fontWeight:600, fontSize:14,
                color: form.type===t ? (t==='expense'?'var(--pink)':'var(--teal)') : 'var(--text-mid)',
                fontFamily:"'DM Sans',sans-serif",
              }}>{t === 'expense' ? '💸 Expense' : '💚 Income'}</button>
            ))}
          </div>
          {[
            { label:'Date', key:'date', type:'date' },
            { label:'Description', key:'description', type:'text', placeholder:'e.g. Coffee at Starbucks' },
            { label:'Amount', key:'amount', type:'number', placeholder:'0.00' },
          ].map(f => (
            <label key={f.key} style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={labelStyle}>{f.label}</span>
              <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inputStyle} />
            </label>
          ))}
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={labelStyle}>Category</span>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={inputStyle}>
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>
          </label>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={labelStyle}>Notes (optional)</span>
            <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Any extra details" style={inputStyle} />
          </label>
          <Button variant="plum" onClick={addTransaction} disabled={!form.description||!form.amount} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>Add Transaction</Button>
        </div>
      </Modal>

      {/* CSV modal */}
      <Modal open={csvOpen} onClose={() => { setCsvOpen(false); setCsvParsed(null); setCsvText('') }} title="Import from CSV" width={560}>
        {!csvParsed ? (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ margin:0, color:'var(--text-mid)', fontSize:14 }}>Paste your bank statement CSV below. Penny will detect and categorise your transactions.</p>
            <textarea
              value={csvText}
              onChange={e=>setCsvText(e.target.value)}
              placeholder="Paste CSV data here…"
              style={{ ...inputStyle, height: 180, resize:'vertical', fontFamily:'monospace', fontSize:12 }}
            />
            <Button variant="violet" onClick={parseCSV} disabled={!csvText.trim() || csvLoading} style={{ width:'100%', justifyContent:'center' }}>
              {csvLoading ? '⏳ Parsing…' : '✨ Parse with AI'}
            </Button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <p style={{ margin:0, color:'var(--text-mid)', fontSize:14 }}>Review and confirm {csvParsed.length} transactions:</p>
            <div style={{ maxHeight:320, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
              {csvParsed.map((tx, i) => (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'0.75rem', background:'var(--border)', borderRadius:10 }}>
                  <input type="checkbox" checked={tx.selected} onChange={e => setCsvParsed(p=>p.map((t,j)=>j===i?{...t,selected:e.target.checked}:t))} style={{ width:18, height:18 }} />
                  <div style={{ flex:1, fontSize:13 }}>
                    <div style={{ fontWeight:600, color:'var(--plum)' }}>{tx.description}</div>
                    <div style={{ color:'var(--text-mid)' }}>{tx.date} · {tx.category}</div>
                  </div>
                  <div style={{ color: tx.type==='income'?'var(--teal)':'var(--pink)', fontWeight:600, fontSize:14 }}>
                    {tx.type==='income'?'+':'-'}{formatCurrency(tx.amount, currency)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Button variant="teal" onClick={confirmImport} style={{ flex:1, justifyContent:'center' }}>Confirm Import</Button>
              <Button variant="ghost" onClick={() => setCsvParsed(null)} style={{ flex:1, justifyContent:'center' }}>Back</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

const labelStyle = { fontSize:14, fontWeight:600, color:'var(--text-mid)' }
const inputStyle = {
  border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 14px',
  fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'var(--plum)',
  outline:'none', width:'100%', boxSizing:'border-box',
}
