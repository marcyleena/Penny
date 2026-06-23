import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import RingChart from '../components/ui/RingChart'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency, formatDate } from '../utils/formatters'
import { calcSinkingFund } from '../utils/calculations'

const COLOURS = ['var(--violet)', 'var(--teal)', 'var(--pink)', 'var(--gold)', '#4FC3F7', '#FF8A65', '#81C784']

const TYPE_SAVING = 'saving'   // open goal — no deadline required
const TYPE_UPCOMING = 'upcoming' // fixed expense — requires target date

const TYPE_META = {
  [TYPE_SAVING]: {
    label: "I'm saving for this",
    tag: 'Saving',
    tagBg: 'var(--lavender)',
    tagColor: 'var(--violet)',
    icon: '🌱',
  },
  [TYPE_UPCOMING]: {
    label: "This is coming up",
    tag: 'Coming up',
    tagBg: 'var(--sunshine)',
    tagColor: '#B8860B',
    icon: '📅',
  },
}

const EMPTY_FORM = { name: '', target: '', current: '', targetDate: '', type: TYPE_SAVING }

export default function Goals() {
  const [goals, setGoals] = useStorage('penny_goals', [])
  const [currency] = useStorage('penny_currency', 'USD')
  const [addOpen, setAddOpen] = useState(false)
  const [addFundsId, setAddFundsId] = useState(null)
  const [addAmount, setAddAmount] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  function openAdd() {
    setForm(EMPTY_FORM)
    setAddOpen(true)
  }

  function addGoal() {
    if (!form.name || !form.target) return
    if (form.type === TYPE_UPCOMING && !form.targetDate) return
    setGoals(prev => [
      ...prev,
      {
        ...form,
        id: Date.now(),
        target: Number(form.target),
        current: Number(form.current) || 0,
      },
    ])
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

  function changeType(id, newType) {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, type: newType } : g))
  }

  function monthlyNeeded(goal) {
    if (goal.type !== TYPE_UPCOMING || !goal.targetDate) return null
    const amt = calcSinkingFund(goal.target, goal.current, goal.targetDate)
    return amt > 0 ? amt : null
  }

  function estCompletion(goal) {
    if (goal.type !== TYPE_SAVING) return null
    const remaining = goal.target - goal.current
    if (remaining <= 0) return null
    return null // open goal — no calculation without knowing contribution rate
  }

  const savingGoals = goals.filter(g => !g.type || g.type === TYPE_SAVING)
  const upcomingGoals = goals.filter(g => g.type === TYPE_UPCOMING)
  const totalSaved = goals.reduce((s, g) => s + (g.current || 0), 0)
  const totalTargets = goals.reduce((s, g) => s + (g.target || 0), 0)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: 0, fontSize: 28 }}>Goals</h1>
        <Button variant="teal" onClick={openAdd}>+ New Goal</Button>
      </div>
      <p style={{ color: 'var(--text-mid)', fontSize: 15, margin: '0 0 1.5rem' }}>
        Track everything you're saving toward — whether it's a dream or a deadline.
      </p>

      {/* Summary bar */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{ background: 'var(--lavender)', borderRadius: 14, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Total Goals</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: 'var(--plum)' }}>{goals.length}</div>
          </div>
          <div style={{ background: 'var(--mint)', borderRadius: 14, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Total Saved</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--teal)' }}>{formatCurrency(totalSaved, currency)}</div>
          </div>
          <div style={{ background: 'var(--sunshine)', borderRadius: 14, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Still to Go</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--plum)' }}>{formatCurrency(Math.max(0, totalTargets - totalSaved), currency)}</div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {goals.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 20, padding: '3rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🌱</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 8px' }}>What are you saving for?</h2>
          <p style={{ color: 'var(--text-light)', margin: '0 0 1.5rem' }}>Add your first goal and watch Penny help you get there.</p>
          <Button variant="teal" onClick={openAdd}>Create my first goal</Button>
        </div>
      )}

      {/* Goal cards — all in one grid */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>
          {goals.map((goal, i) => {
            const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0
            const colour = COLOURS[i % COLOURS.length]
            const done = goal.current >= goal.target
            const meta = TYPE_META[goal.type || TYPE_SAVING]
            const monthly = monthlyNeeded(goal)

            return (
              <div key={goal.id} className="fade-in" style={{
                background: '#fff', borderRadius: 20, padding: '1.5rem',
                boxShadow: '0 2px 16px rgba(61,43,107,0.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              }}>
                {/* Type tag + toggle */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignSelf: 'stretch', justifyContent: 'center' }}>
                  {[TYPE_SAVING, TYPE_UPCOMING].map(t => {
                    const m = TYPE_META[t]
                    const active = (goal.type || TYPE_SAVING) === t
                    return (
                      <button
                        key={t}
                        onClick={() => changeType(goal.id, t)}
                        style={{
                          padding: '4px 10px', borderRadius: 20, border: '1.5px solid',
                          borderColor: active ? colour : 'var(--border)',
                          background: active ? m.tagBg : 'transparent',
                          color: active ? m.tagColor : 'var(--text-light)',
                          fontSize: 11, fontWeight: active ? 700 : 400,
                          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          transition: 'all 0.15s',
                        }}
                      >
                        {m.icon} {m.tag}
                      </button>
                    )
                  })}
                </div>

                {/* Ring chart */}
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <RingChart pct={pct} size={96} stroke={10} color={colour} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: 'var(--plum)' }}>
                      {done ? '🎉' : `${Math.round(pct)}%`}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <h3 style={{ margin: '0 0 4px', fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 18 }}>
                  {goal.name}
                </h3>

                {/* Progress amounts */}
                {done ? (
                  <div style={{ color: 'var(--teal)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Goal reached! 🎉</div>
                ) : (
                  <div style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: 4 }}>
                    {formatCurrency(goal.current, currency)} <span style={{ color: 'var(--text-light)' }}>of</span> {formatCurrency(goal.target, currency)}
                  </div>
                )}

                {/* Target date (upcoming only) */}
                {goal.type === TYPE_UPCOMING && goal.targetDate && (
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>
                    Due {formatDate(goal.targetDate)}
                  </div>
                )}

                {/* Monthly needed (upcoming) or no-deadline note (saving) */}
                {goal.type === TYPE_UPCOMING && monthly && !done && (
                  <div style={{ background: 'var(--sunshine)', borderRadius: 10, padding: '5px 12px', fontSize: 13, color: 'var(--plum)', fontWeight: 600, marginBottom: 12 }}>
                    Put aside {formatCurrency(monthly, currency)}/mo
                  </div>
                )}
                {(goal.type === TYPE_SAVING || !goal.type) && !done && (
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12 }}>
                    No deadline — save at your own pace
                  </div>
                )}
                {done && <div style={{ marginBottom: 12 }} />}

                {/* Add funds / delete */}
                {addFundsId === goal.id ? (
                  <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                    <input
                      type="number"
                      value={addAmount}
                      onChange={e => setAddAmount(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addFunds(goal.id)}
                      placeholder="Amount"
                      autoFocus
                      style={{ ...inputSt, flex: 1 }}
                    />
                    <Button variant="teal" onClick={() => addFunds(goal.id)} small>Add</Button>
                    <Button variant="ghost" onClick={() => { setAddFundsId(null); setAddAmount('') }} small>✕</Button>
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

      {/* Add goal modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Goal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Type toggle */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 8 }}>What kind of goal is this?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[TYPE_SAVING, TYPE_UPCOMING].map(t => {
                const m = TYPE_META[t]
                const active = form.type === t
                return (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, type: t, targetDate: t === TYPE_SAVING ? '' : f.targetDate }))}
                    style={{
                      padding: '10px 14px', borderRadius: 12, border: '2px solid',
                      borderColor: active ? 'var(--violet)' : 'var(--border)',
                      background: active ? 'var(--lavender)' : '#fff',
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: active ? 'var(--violet)' : 'var(--plum)', fontSize: 14 }}>
                      {m.icon} {m.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 2 }}>
                      {t === TYPE_SAVING
                        ? 'Save toward a target with no fixed deadline'
                        : 'You need a set amount by a specific date — Penny calculates your monthly target'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fields */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={labelSt}>Goal Name</span>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={form.type === TYPE_SAVING ? 'e.g. Emergency Fund, Holiday, New Car' : 'e.g. Car Insurance, New Laptop, Wedding'}
              style={inputSt}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={labelSt}>Target Amount</span>
            <input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="0.00" style={inputSt} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={labelSt}>Already Saved</span>
            <input type="number" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} placeholder="0.00" style={inputSt} />
          </label>

          {form.type === TYPE_UPCOMING && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={labelSt}>Date you need it by <span style={{ color: 'var(--over)' }}>*</span></span>
              <input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} style={inputSt} />
            </label>
          )}

          {form.type === TYPE_SAVING && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={labelSt}>Target Date (optional)</span>
              <input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} style={inputSt} />
            </label>
          )}

          <Button
            variant="teal"
            onClick={addGoal}
            disabled={!form.name || !form.target || (form.type === TYPE_UPCOMING && !form.targetDate)}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            Create Goal
          </Button>
        </div>
      </Modal>
    </div>
  )
}

const inputSt = {
  border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px',
  fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: 'var(--plum)',
  outline: 'none', width: '100%', boxSizing: 'border-box', background: '#fff',
}

const labelSt = { fontSize: 14, fontWeight: 600, color: 'var(--text-mid)' }
