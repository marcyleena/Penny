import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency, formatDate, todayISO } from '../utils/formatters'

export default function Bills() {
  const [bills, setBills] = useStorage('penny_bills', [])
  const [currency] = useStorage('penny_currency', 'USD')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', dueDate: '', recurring: false })

  function addBill() {
    if (!form.name || !form.amount) return
    setBills(prev => [...prev, { ...form, id: Date.now(), amount: Number(form.amount), paid: false }])
    setForm({ name: '', amount: '', dueDate: '', recurring: false })
    setAddOpen(false)
  }

  function togglePaid(id) {
    setBills(prev => prev.map(b => b.id === id ? { ...b, paid: !b.paid } : b))
  }

  function deleteBill(id) {
    if (!confirm('Delete this bill?')) return
    setBills(prev => prev.filter(b => b.id !== id))
  }

  const sorted = [...bills].sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })

  const totalDue = bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0)
  const paid = bills.filter(b => b.paid).length
  const unpaid = bills.filter(b => !b.paid).length

  function isOverdue(bill) {
    if (bill.paid || !bill.dueDate) return false
    return new Date(bill.dueDate) < new Date(todayISO())
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: 0, fontSize: 28 }}>Bills</h1>
        <Button variant="plum" onClick={() => setAddOpen(true)}>+ Add Bill</Button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--sunshine)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Due This Month</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--plum)' }}>{formatCurrency(totalDue, currency)}</div>
        </div>
        <div style={{ background: 'var(--mint)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Paid</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--teal)' }}>{paid}</div>
        </div>
        <div style={{ background: 'var(--petal)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Unpaid</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--pink)' }}>{unpaid}</div>
        </div>
      </div>

      {/* Bills list */}
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(61,43,107,0.06)', overflow: 'hidden' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🧾</div>
            <p>No bills added yet. Add your recurring bills to track them.</p>
          </div>
        ) : sorted.map((bill) => (
          <div key={bill.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)',
            background: isOverdue(bill) ? 'var(--petal)' : bill.paid ? '#f9f9f9' : '#fff',
            opacity: bill.paid ? 0.7 : 1,
          }}>
            <button
              onClick={() => togglePaid(bill.id)}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                border: `2px solid ${bill.paid ? 'var(--teal)' : 'var(--border)'}`,
                background: bill.paid ? 'var(--teal)' : '#fff',
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14,
              }}
            >{bill.paid ? '✓' : ''}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--plum)', fontSize: 14, textDecoration: bill.paid ? 'line-through' : 'none' }}>
                {bill.name}
                {bill.recurring && <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--lavender)', borderRadius: 6, padding: '2px 6px', color: 'var(--violet)', fontWeight: 600 }}>RECURRING</span>}
                {isOverdue(bill) && <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--petal)', borderRadius: 6, padding: '2px 6px', color: 'var(--pink)', fontWeight: 600 }}>OVERDUE</span>}
              </div>
              {bill.dueDate && <div style={{ color: 'var(--text-light)', fontSize: 12 }}>Due {formatDate(bill.dueDate)}</div>}
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: bill.paid ? 'var(--teal)' : 'var(--plum)', flexShrink: 0 }}>
              {formatCurrency(bill.amount, currency)}
            </div>
            <button onClick={() => deleteBill(bill.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 18, padding: 4 }}>×</button>
          </div>
        ))}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Bill">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label:'Bill Name', key:'name', placeholder:'e.g. Netflix, Rent, Insurance' },
            { label:'Amount', key:'amount', type:'number', placeholder:'0.00' },
            { label:'Due Date', key:'dueDate', type:'date' },
          ].map(f => (
            <label key={f.key} style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--text-mid)' }}>{f.label}</span>
              <input type={f.type||'text'} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inputSt} />
            </label>
          ))}
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <input type="checkbox" checked={form.recurring} onChange={e=>setForm(p=>({...p,recurring:e.target.checked}))} style={{ width:18, height:18 }} />
            <span style={{ fontSize:14, color:'var(--plum)' }}>Recurring bill</span>
          </label>
          <Button variant="plum" onClick={addBill} disabled={!form.name||!form.amount} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>Add Bill</Button>
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
