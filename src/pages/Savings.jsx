import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import RingChart from '../components/ui/RingChart'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function Savings() {
  const [goals, setGoals] = useStorage('penny_goals', [])
  const [currency] = useStorage('penny_currency', 'USD')
  const [addOpen, setAddOpen] = useState(false)
  const [addFundsId, setAddFundsId] = useState(null)
  const [addAmount, setAddAmount] = useState('')
  const [form, setForm] = useState({ name: '', target: '', current: '', targetDate: '' })

  function addGoal() {
    if (!form.name || !form.target) return
    setGoals(prev => [...prev, { ...form, id: Date.now(), target: Number(form.target), current: Number(form.current) || 0 }])
    setForm({ name: '', target: '', current: '', targetDate: '' })
    setAddOpen(false)
  }

  function addFunds(id) {
    const amt = Number(addAmount)
    if (!amt) return
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: g.current + amt } : g))
    setAddFundsId(null)
    setAddAmount('')
  }

  function deleteGoal(id) {
    if (!confirm('Delete this goal?')) return
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  function estCompletion(goal) {
    const remaining = goal.target - goal.current
    if (remaining <= 0) return 'Reached! 🎉'
    if (!goal.targetDate) return '—'
    const now = new Date()
    const end = new Date(goal.targetDate)
    const months = Math.max(1, (end.getFullYear()-now.getFullYear())*12 + (end.getMonth()-now.getMonth()))
    const monthly = remaining / months
    return `Save ${formatCurrency(monthly, currency)}/mo`
  }

  const COLOURS = ['var(--violet)','var(--teal)','var(--pink)','var(--gold)','#4FC3F7']

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: 0, fontSize: 28 }}>Savings Goals</h1>
        <Button variant="teal" onClick={() => setAddOpen(true)}>+ New Goal</Button>
      </div>

      {goals.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 20, padding: '3rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌱</div>
          <p style={{ color: 'var(--text-light)' }}>What are you saving for? Add your first goal and watch Penny help you get there.</p>
          <Button variant="teal" onClick={() => setAddOpen(true)} style={{ marginTop: 8 }}>Create my first goal</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '1rem' }}>
          {goals.map((goal, i) => {
            const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0
            const colour = COLOURS[i % COLOURS.length]
            const done = goal.current >= goal.target
            return (
              <div key={goal.id} className="fade-in" style={{
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
                <h3 style={{ margin: '0 0 4px', fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 18 }}>{goal.name}</h3>
                {done ? (
                  <div style={{ color: 'var(--teal)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Goal reached! 🎉</div>
                ) : (
                  <div style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: 4 }}>
                    {formatCurrency(goal.current, currency)} of {formatCurrency(goal.target, currency)}
                  </div>
                )}
                {goal.targetDate && <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Target: {formatDate(goal.targetDate)}</div>}
                <div style={{ fontSize: 13, color: colour, fontWeight: 600, marginBottom: 12 }}>{estCompletion(goal)}</div>

                {addFundsId === goal.id ? (
                  <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                    <input type="number" value={addAmount} onChange={e=>setAddAmount(e.target.value)} placeholder="Amount" style={{ ...inputSt, flex:1 }} />
                    <Button variant="teal" onClick={() => addFunds(goal.id)} small>Add</Button>
                    <Button variant="ghost" onClick={() => setAddFundsId(null)} small>✕</Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="teal" onClick={() => setAddFundsId(goal.id)} small>+ Add funds</Button>
                    <Button variant="ghost" onClick={() => deleteGoal(goal.id)} small>🗑️</Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Savings Goal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label:'Goal Name', key:'name', placeholder:'e.g. Emergency Fund, Holiday' },
            { label:'Target Amount', key:'target', placeholder:'0.00', type:'number' },
            { label:'Already Saved', key:'current', placeholder:'0.00', type:'number' },
            { label:'Target Date (optional)', key:'targetDate', type:'date' },
          ].map(f => (
            <label key={f.key} style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--text-mid)' }}>{f.label}</span>
              <input type={f.type||'text'} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inputSt} />
            </label>
          ))}
          <Button variant="teal" onClick={addGoal} disabled={!form.name||!form.target} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>Create Goal</Button>
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
