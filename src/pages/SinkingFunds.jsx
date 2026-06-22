import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import RingChart from '../components/ui/RingChart'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency, formatDate } from '../utils/formatters'
import { calcSinkingFund } from '../utils/calculations'

export default function SinkingFunds() {
  const [funds, setFunds] = useStorage('penny_sinking_funds', [])
  const [currency] = useStorage('penny_currency', 'USD')
  const [addOpen, setAddOpen] = useState(false)
  const [addFundsId, setAddFundsId] = useState(null)
  const [addAmount, setAddAmount] = useState('')
  const [form, setForm] = useState({ name: '', target: '', current: '', targetDate: '' })

  function addFund() {
    if (!form.name || !form.target) return
    setFunds(prev => [...prev, { ...form, id: Date.now(), target: Number(form.target), current: Number(form.current) || 0 }])
    setForm({ name: '', target: '', current: '', targetDate: '' })
    setAddOpen(false)
  }

  function addContrib(id) {
    const amt = Number(addAmount)
    if (!amt) return
    setFunds(prev => prev.map(f => f.id === id ? { ...f, current: f.current + amt } : f))
    setAddFundsId(null)
    setAddAmount('')
  }

  function deleteFund(id) {
    if (!confirm('Delete this fund?')) return
    setFunds(prev => prev.filter(f => f.id !== id))
  }

  const COLOURS = ['var(--gold)','var(--pink)','#4FC3F7','var(--teal)','var(--violet)']

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: 0, fontSize: 28 }}>Sinking Funds</h1>
        <Button variant="gold" onClick={() => setAddOpen(true)}>+ New Fund</Button>
      </div>

      <p style={{ color: 'var(--text-mid)', fontSize: 15, margin: '0 0 1.5rem', maxWidth: 600 }}>
        Save for specific future expenses — car insurance, holiday, new phone — so they don't sneak up on you.
      </p>

      {funds.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 20, padding: '3rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🪣</div>
          <p style={{ color: 'var(--text-light)' }}>No sinking funds yet. Create one for a planned future expense.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '1rem' }}>
          {funds.map((fund, i) => {
            const pct = fund.target > 0 ? Math.min(100, (fund.current / fund.target) * 100) : 0
            const colour = COLOURS[i % COLOURS.length]
            const monthly = calcSinkingFund(fund.target, fund.current, fund.targetDate)
            return (
              <div key={fund.id} className="fade-in" style={{
                background: '#fff', borderRadius: 20, padding: '1.5rem',
                boxShadow: '0 2px 16px rgba(61,43,107,0.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              }}>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <RingChart pct={pct} size={90} stroke={10} color={colour} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: 'var(--plum)' }}>{Math.round(pct)}%</span>
                  </div>
                </div>
                <h3 style={{ margin: '0 0 4px', fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 18 }}>{fund.name}</h3>
                <div style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: 4 }}>
                  {formatCurrency(fund.current, currency)} of {formatCurrency(fund.target, currency)}
                </div>
                {fund.targetDate && <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>By {formatDate(fund.targetDate)}</div>}
                {monthly > 0 && (
                  <div style={{ background: 'var(--sunshine)', borderRadius: 10, padding: '6px 12px', fontSize: 13, color: 'var(--plum)', fontWeight: 600, marginBottom: 12 }}>
                    Put aside {formatCurrency(monthly, currency)}/mo
                  </div>
                )}
                {addFundsId === fund.id ? (
                  <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                    <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="Amount" style={{ ...inputSt, flex: 1 }} />
                    <Button variant="gold" onClick={() => addContrib(fund.id)} small>Add</Button>
                    <Button variant="ghost" onClick={() => setAddFundsId(null)} small>✕</Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="gold" onClick={() => setAddFundsId(fund.id)} small>+ Add funds</Button>
                    <Button variant="ghost" onClick={() => deleteFund(fund.id)} small>🗑️</Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Sinking Fund">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label:'What are you saving toward?', key:'name', placeholder:'e.g. Car Insurance, Holiday, New Laptop' },
            { label:'Target Amount', key:'target', placeholder:'0.00', type:'number' },
            { label:'Already Saved', key:'current', placeholder:'0.00', type:'number' },
            { label:'Need it by', key:'targetDate', type:'date' },
          ].map(f => (
            <label key={f.key} style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--text-mid)' }}>{f.label}</span>
              <input type={f.type||'text'} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inputSt} />
            </label>
          ))}
          <Button variant="gold" onClick={addFund} disabled={!form.name||!form.target} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>Create Fund</Button>
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
