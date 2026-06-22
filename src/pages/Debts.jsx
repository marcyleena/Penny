import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ProgressBar from '../components/ui/ProgressBar'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency } from '../utils/formatters'
import { calcDebtPayoff, snowballOrder, avalancheOrder } from '../utils/calculations'
import { callPenny, PENNY_SYSTEM } from '../hooks/usePenny'

function payoffDateStr(d) {
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function Debts() {
  const [debts, setDebts] = useStorage('penny_debts', [])
  const [currency] = useStorage('penny_currency', 'USD')
  const [strategy, setStrategy] = useState('snowball')
  const [addOpen, setAddOpen] = useState(false)
  const [extra, setExtra] = useState('')
  const [whatIfResult, setWhatIfResult] = useState('')
  const [whatIfLoading, setWhatIfLoading] = useState(false)
  const [form, setForm] = useState({ name: '', balance: '', rate: '', minPayment: '', originalBalance: '' })

  function addDebt() {
    if (!form.name || !form.balance) return
    const d = {
      ...form,
      id: Date.now(),
      balance: Number(form.balance),
      rate: Number(form.rate),
      minPayment: Number(form.minPayment),
      originalBalance: Number(form.originalBalance || form.balance),
    }
    setDebts(prev => [...prev, d])
    setForm({ name: '', balance: '', rate: '', minPayment: '', originalBalance: '' })
    setAddOpen(false)
  }

  function deleteDebt(id) {
    if (!confirm('Remove this debt?')) return
    setDebts(prev => prev.filter(d => d.id !== id))
  }

  function updateBalance(id, bal) {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, balance: Number(bal) } : d))
  }

  const ordered = strategy === 'snowball' ? snowballOrder(debts) : avalancheOrder(debts)
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0)
  const totalMin = debts.reduce((s, d) => s + d.minPayment, 0)

  const latestPayoff = debts.length > 0
    ? debts.map(d => calcDebtPayoff(d.balance, d.rate, d.minPayment).payoffDate).filter(Boolean).sort((a, b) => b - a)[0]
    : null

  const totalInterest = debts.reduce((s, d) => s + calcDebtPayoff(d.balance, d.rate, d.minPayment).totalInterest, 0)

  async function runWhatIf() {
    const extraAmt = Number(extra)
    if (!extraAmt || debts.length === 0) return
    setWhatIfLoading(true)
    setWhatIfResult('')
    const debtSummary = debts.map(d => `${d.name}: $${d.balance} at ${d.rate}% APR, $${d.minPayment}/mo min`).join('\n')
    const msg = `My debts:\n${debtSummary}\n\nWhat happens if I pay an extra ${formatCurrency(extraAmt, currency)} per month? Strategy: ${strategy}. Show updated payoff timeline and total interest saved.`
    try {
      await callPenny(PENNY_SYSTEM, msg, (p) => setWhatIfResult(p))
    } catch (e) {
      setWhatIfResult(e.message?.includes('No API key') ? '🔑 Add your API key in Settings to use this feature.' : 'Hmm, something went wrong.')
    }
    setWhatIfLoading(false)
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: 0, fontSize: 28 }}>Debt Tracker</h1>
        <Button variant="pink" onClick={() => setAddOpen(true)}>+ Add Debt</Button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--petal)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Total Debt</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--over)' }}>{formatCurrency(totalDebt, currency)}</div>
        </div>
        <div style={{ background: 'var(--sunshine)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Debts</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--plum)' }}>{debts.length}</div>
        </div>
        <div style={{ background: 'var(--mint)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Debt-Free Date</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--teal)' }}>{payoffDateStr(latestPayoff)}</div>
        </div>
        <div style={{ background: 'var(--lavender)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Total Interest</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: 'var(--violet)' }}>{formatCurrency(totalInterest, currency)}</div>
        </div>
      </div>

      {/* Strategy */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {[['snowball','❄️ Snowball'],['avalanche','🌊 Avalanche']].map(([v,l]) => (
          <button key={v} onClick={() => setStrategy(v)} style={{
            padding: '8px 18px', borderRadius: 10, border: '2px solid',
            borderColor: strategy===v ? 'var(--violet)' : 'var(--border)',
            background: strategy===v ? 'var(--lavender)' : '#fff',
            cursor: 'pointer', fontWeight: 600, fontSize: 14,
            color: strategy===v ? 'var(--violet)' : 'var(--text-mid)',
            fontFamily: "'DM Sans',sans-serif",
          }}>{l}</button>
        ))}
      </div>

      {/* Debt cards */}
      {debts.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 20, padding: '3rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💪</div>
          <p style={{ color: 'var(--text-light)' }}>No debts tracked — lucky you! Or add one to build your payoff plan.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {ordered.map((debt, i) => {
            const { months, totalInterest: ti, payoffDate } = calcDebtPayoff(debt.balance, debt.rate, debt.minPayment)
            const pct = debt.originalBalance > 0 ? Math.max(0, ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100) : 0
            return (
              <div key={debt.id} style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--plum)', fontSize: 16 }}>
                      {strategy === 'snowball' ? `#${i+1} · ` : ''}{debt.name}
                    </div>
                    <div style={{ color: 'var(--text-mid)', fontSize: 13 }}>{debt.rate}% APR · Min ${debt.minPayment}/mo</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--over)' }}>
                      {formatCurrency(debt.balance, currency)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Payoff: {payoffDateStr(payoffDate)}</div>
                  </div>
                </div>
                <ProgressBar pct={pct} status="ok" height={8} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-mid)' }}>
                  <span>{Math.round(pct)}% paid off</span>
                  <span>Interest: {formatCurrency(ti, currency)}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input
                    type="number"
                    placeholder="Update balance"
                    style={{ ...inputSt, flex:1 }}
                    onBlur={e => { if (e.target.value) updateBalance(debt.id, e.target.value); e.target.value = '' }}
                  />
                  <Button variant="ghost" onClick={() => deleteDebt(debt.id)} small>🗑️ Remove</Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* What if calculator */}
      {debts.length > 0 && (
        <div style={{ background: 'var(--lavender)', borderRadius: 20, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1rem' }}>What if I pay extra? 🤔</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--plum)', fontWeight: 600 }}>What if I pay an extra</span>
            <input type="number" value={extra} onChange={e => setExtra(e.target.value)} placeholder="e.g. 200" style={{ ...inputSt, width: 120 }} />
            <span style={{ color: 'var(--plum)', fontWeight: 600 }}>per month?</span>
            <Button variant="violet" onClick={runWhatIf} disabled={!extra || whatIfLoading} small>
              {whatIfLoading ? '⏳' : 'Ask Penny'}
            </Button>
          </div>
          {whatIfResult && (
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '1rem', fontSize: 14, color: 'var(--plum)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {whatIfResult}
            </div>
          )}
        </div>
      )}

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Debt">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label:'Debt Name', key:'name', placeholder:'e.g. Credit Card, Student Loan' },
            { label:'Current Balance', key:'balance', placeholder:'0.00', type:'number' },
            { label:'Original Balance (optional)', key:'originalBalance', placeholder:'0.00', type:'number' },
            { label:'Interest Rate (% APR)', key:'rate', placeholder:'e.g. 19.9', type:'number' },
            { label:'Minimum Monthly Payment', key:'minPayment', placeholder:'0.00', type:'number' },
          ].map(f => (
            <label key={f.key} style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--text-mid)' }}>{f.label}</span>
              <input type={f.type||'text'} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inputSt} />
            </label>
          ))}
          <Button variant="pink" onClick={addDebt} disabled={!form.name||!form.balance} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>Add Debt</Button>
        </div>
      </Modal>
    </div>
  )
}

const inputSt = {
  border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 14px',
  fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'var(--plum)',
  outline:'none', width:'100%', boxSizing:'border-box', background:'#fff',
}
