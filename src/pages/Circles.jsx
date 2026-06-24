import React, { useState, useEffect } from 'react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ProgressBar from '../components/ui/ProgressBar'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { formatCurrency } from '../utils/formatters'
import { getStored } from '../hooks/useStorage'

const MONEY_DISCLAIMER = "Penny Circles coordinates and tracks your group savings. Money transfers happen directly between members via your preferred payment method (Venmo, CashApp, bank transfer, cash). Penny does not move or hold any money."

function NotConfigured() {
  return (
    <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1rem', fontSize: 28 }}>Penny Circles</h1>
      <div style={{ background: 'var(--sunshine)', borderRadius: 16, padding: '1.5rem', lineHeight: 1.7, color: 'var(--plum)' }}>
        <strong>⚙️ Supabase not configured yet.</strong>
        <p style={{ marginTop: 8 }}>Penny Circles requires a Supabase backend to sync data between members in real time.</p>
        <ol style={{ paddingLeft: '1.25rem' }}>
          <li>Create a free project at <strong>supabase.com</strong></li>
          <li>Copy your project URL and anon key</li>
          <li>Add them to Vercel's environment variables:<br />
            <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>VITE_SUPABASE_URL</code> and{' '}
            <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>VITE_SUPABASE_ANON_KEY</code>
          </li>
          <li>Run the SQL from your Penny setup guide in Supabase's SQL Editor</li>
          <li>Redeploy</li>
        </ol>
      </div>
    </div>
  )
}

export default function Circles() {
  if (!isSupabaseConfigured()) return <NotConfigured />

  const [circles, setCircles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCircle, setSelectedCircle] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [contributions, setContributions] = useState([])
  const [members, setMembers] = useState([])
  const [payouts, setPayouts] = useState([])
  const currency = getStored('penny_currency', 'USD')

  useEffect(() => {
    loadCircles()
  }, [])

  useEffect(() => {
    if (!selectedCircle) return
    loadCircleData(selectedCircle.id)

    // Real-time subscription
    const channel = supabase
      .channel(`circle-${selectedCircle.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'contributions',
        filter: `circle_id=eq.${selectedCircle.id}`,
      }, () => loadCircleData(selectedCircle.id))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [selectedCircle?.id])

  async function loadCircles() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('circle_members')
      .select('circle_id, circles(*)')
      .eq('user_id', user.id)
      .in('status', ['active'])

    const userCircles = (data || []).map(d => d.circles).filter(Boolean)
    setCircles(userCircles)
    setLoading(false)
  }

  async function loadCircleData(circleId) {
    const [{ data: mems }, { data: contribs }, { data: pays }] = await Promise.all([
      supabase.from('circle_members').select('*').eq('circle_id', circleId).order('rotation_order'),
      supabase.from('contributions').select('*, circle_members(email)').eq('circle_id', circleId).order('created_at', { ascending: false }),
      supabase.from('payouts').select('*, circle_members(email)').eq('circle_id', circleId).order('period'),
    ])
    setMembers(mems || [])
    setContributions(contribs || [])
    setPayouts(pays || [])
  }

  async function markAsPaid(contributionId) {
    await supabase.from('contributions').update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    }).eq('id', contributionId)
    loadCircleData(selectedCircle.id)
  }

  const currentPeriod = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const period = currentPeriod()
  const myEmail = getStored('penny_email', '')
  const myMember = members.find(m => m.email === myEmail)
  const myContribution = contributions.find(c => c.member_id === myMember?.id && c.period === period)

  if (loading) return (
    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-light)', paddingTop: '4rem' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⭕</div>
      Loading your circles…
    </div>
  )

  if (!selectedCircle) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 0.5rem', fontSize: 32 }}>
          Penny Circles
        </h1>
        <p style={{ color: 'var(--text-mid)', fontSize: 16, margin: '0 0 2rem', fontStyle: 'italic' }}>
          Save together. Stay accountable. Win together.
        </p>

        {/* Disclaimer */}
        <div style={{ background: 'var(--lavender)', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: 13, color: 'var(--plum)', lineHeight: 1.6 }}>
          ℹ️ {MONEY_DISCLAIMER}
        </div>

        {circles.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 24, padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(61,43,107,0.06)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 48, marginBottom: '1rem' }}>⭕</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 22, margin: '0 0 0.75rem' }}>
              No circles yet
            </h2>
            <p style={{ color: 'var(--text-mid)', fontSize: 15, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 1.5rem' }}>
              A Penny Circle is a group savings club. Each member contributes a set amount regularly. In rotating mode, the full pot goes to one member each period — everyone gets a turn. In shared goal mode, the group saves toward one goal together. Penny keeps everyone accountable.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="pink" onClick={() => setCreateOpen(true)} style={{ fontSize: 15, padding: '12px 24px' }}>
                + Create a Circle
              </Button>
              <Button variant="violet" onClick={() => alert('Ask the circle creator for your invite link. It will look like: pennysaves.com/join/[circle-id]')} style={{ fontSize: 15, padding: '12px 24px' }}>
                Join a Circle
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {circles.map(circle => (
                <div
                  key={circle.id}
                  onClick={() => { setSelectedCircle(circle); loadCircleData(circle.id) }}
                  style={{
                    background: '#fff', borderRadius: 16, padding: '1.25rem',
                    boxShadow: '0 2px 16px rgba(61,43,107,0.06)', cursor: 'pointer',
                    borderLeft: '4px solid var(--pink)', transition: 'transform 0.15s',
                  }}
                >
                  <div style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 20, marginBottom: 6 }}>{circle.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--petal)', color: 'var(--pink)', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                      {circle.mode === 'rotating' ? '🔄 Rotating' : '🎯 Shared Goal'}
                    </span>
                    <span style={{ background: 'var(--lavender)', color: 'var(--violet)', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                      {circle.frequency}
                    </span>
                  </div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: 'var(--plum)' }}>
                    {formatCurrency(circle.contribution_amount, currency)} / member
                  </div>
                </div>
              ))}
            </div>
            <Button variant="pink" onClick={() => setCreateOpen(true)}>+ Create another Circle</Button>
          </>
        )}

        <CreateCircleModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); loadCircles() }} currency={currency} />
      </div>
    )
  }

  // Circle dashboard
  const potTotal = selectedCircle.contribution_amount * members.filter(m => m.status === 'active').length
  const currentRecipient = payouts.find(p => p.period === period && p.status === 'upcoming')
  const progressPct = selectedCircle.mode === 'shared_goal' && selectedCircle.goal_amount
    ? Math.min(100, (contributions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0) / selectedCircle.goal_amount) * 100)
    : 0
  const totalContributed = contributions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)

  const thisperiodContribs = contributions.filter(c => c.period === period)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Back */}
      <button onClick={() => setSelectedCircle(null)} style={{ background: 'none', border: 'none', color: 'var(--violet)', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: '1rem', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← All Circles
      </button>

      {/* Header card */}
      <div style={{ background: '#fff', borderRadius: 20, padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)', borderLeft: '4px solid var(--pink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 8px', fontSize: 28 }}>{selectedCircle.name}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--petal)', color: 'var(--pink)', borderRadius: 99, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                {selectedCircle.mode === 'rotating' ? '🔄 Rotating savings' : '🎯 Shared goal'}
              </span>
              <span style={{ background: 'var(--lavender)', color: 'var(--violet)', borderRadius: 99, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                {formatCurrency(selectedCircle.contribution_amount, currency)} / {selectedCircle.frequency}
              </span>
            </div>
          </div>
          {selectedCircle.mode === 'rotating' && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: 'var(--text-mid)' }}>This period's pot</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: 'var(--plum)' }}>{formatCurrency(potTotal, currency)}</div>
              {currentRecipient && (
                <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>🎉 Goes to: {currentRecipient.circle_members?.email}</div>
              )}
            </div>
          )}
        </div>
        {selectedCircle.mode === 'shared_goal' && selectedCircle.goal_amount && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, color: 'var(--plum)' }}>{selectedCircle.goal_name || 'Shared goal'}</span>
              <span style={{ color: 'var(--text-mid)', fontSize: 14 }}>{formatCurrency(totalContributed, currency)} of {formatCurrency(selectedCircle.goal_amount, currency)}</span>
            </div>
            <ProgressBar pct={progressPct} status="ok" height={12} />
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{ background: 'var(--lavender)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 12, color: 'var(--plum)' }}>
        ℹ️ {MONEY_DISCLAIMER}
      </div>

      {/* My contribution this period */}
      {myContribution && myContribution.status === 'pending' && (
        <div style={{ background: 'var(--sunshine)', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--plum)' }}>Your contribution this period</div>
            <div style={{ color: 'var(--text-mid)', fontSize: 14 }}>{formatCurrency(selectedCircle.contribution_amount, currency)} due — transfer directly to your circle members</div>
          </div>
          <Button variant="teal" onClick={() => markAsPaid(myContribution.id)}>✓ Mark as paid</Button>
        </div>
      )}
      {myContribution?.status === 'paid' && (
        <div style={{ background: 'var(--mint)', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '1.25rem', fontWeight: 600, color: 'var(--teal)' }}>
          ✓ Your contribution this period is paid!
        </div>
      )}

      {/* Members */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
        <h3 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1rem', fontSize: 18 }}>Members</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((member, i) => {
            const contrib = thisperiodContribs.find(c => c.member_id === member.id)
            const statusColor = contrib?.status === 'paid' ? 'var(--ok)' : contrib?.status === 'late' ? 'var(--over)' : 'var(--gold)'
            const statusBg = contrib?.status === 'paid' ? 'var(--mint)' : contrib?.status === 'late' ? 'var(--petal)' : 'var(--sunshine)'
            const statusLabel = contrib?.status === 'paid' ? '✓ Paid' : contrib?.status === 'late' ? '⚠ Late' : '⏳ Pending'
            return (
              <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#FAFAF8', borderRadius: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {selectedCircle.mode === 'rotating' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--plum)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {member.rotation_order || i + 1}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--plum)', fontSize: 14 }}>{member.email}</div>
                    {member.email === myEmail && <div style={{ fontSize: 11, color: 'var(--violet)' }}>You</div>}
                  </div>
                </div>
                <span style={{ background: statusBg, color: statusColor, borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                  {statusLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payout schedule — rotating only */}
      {selectedCircle.mode === 'rotating' && payouts.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1rem', fontSize: 18 }}>Payout Schedule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {payouts.map((payout, i) => (
              <div key={payout.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem',
                background: payout.period === period ? 'var(--lavender)' : '#FAFAF8',
                borderRadius: 12, flexWrap: 'wrap', gap: 8,
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--plum)', fontSize: 14 }}>
                    {payout.period} {payout.period === period && '← Current'}
                  </div>
                  <div style={{ color: 'var(--text-mid)', fontSize: 13 }}>{payout.circle_members?.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 18 }}>{formatCurrency(payout.amount, currency)}</div>
                  <span style={{
                    background: payout.status === 'paid' ? 'var(--mint)' : 'var(--sunshine)',
                    color: payout.status === 'paid' ? 'var(--ok)' : 'var(--gold)',
                    borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                  }}>{payout.status === 'paid' ? '✓ Paid' : 'Upcoming'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contribution history */}
      {contributions.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1rem', fontSize: 18 }}>Contribution History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--lavender)' }}>
                  {['Period', 'Member', 'Amount', 'Status', 'Paid'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contributions.slice(0, 20).map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : '#FAFAF8' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--plum)' }}>{c.period}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-mid)' }}>{c.circle_members?.email}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--plum)' }}>{formatCurrency(c.amount, currency)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: c.status === 'paid' ? 'var(--mint)' : c.status === 'late' ? 'var(--petal)' : 'var(--sunshine)',
                        color: c.status === 'paid' ? 'var(--ok)' : c.status === 'late' ? 'var(--over)' : 'var(--gold)',
                        borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                      }}>{c.status}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-light)', fontSize: 12 }}>
                      {c.paid_at ? new Date(c.paid_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Create Circle Modal ─────────────────────────────────────────────────────

function CreateCircleModal({ open, onClose, onCreated, currency }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', mode: 'rotating',
    goalName: '', goalAmount: '',
    amount: '', frequency: 'monthly', startDate: '',
    emails: [],
  })
  const [emailInput, setEmailInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function addEmail() {
    const e = emailInput.trim().toLowerCase()
    if (!e || form.emails.includes(e) || form.emails.length >= 12) return
    set('emails', [...form.emails, e])
    setEmailInput('')
  }

  function removeEmail(e) { set('emails', form.emails.filter(x => x !== e)) }

  async function launch() {
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: circle, error } = await supabase.from('circles').insert({
        name: form.name,
        created_by: user.id,
        mode: form.mode,
        contribution_amount: Number(form.amount),
        frequency: form.frequency,
        goal_amount: form.mode === 'shared_goal' ? Number(form.goalAmount) : null,
        goal_name: form.mode === 'shared_goal' ? form.goalName : null,
        start_date: form.startDate || null,
        status: 'active',
      }).select().single()

      if (error) throw error

      // Add creator as active member
      await supabase.from('circle_members').insert({
        circle_id: circle.id,
        user_id: user.id,
        email: user.email,
        rotation_order: 1,
        status: 'active',
      })

      // Add invited members
      for (let i = 0; i < form.emails.length; i++) {
        await supabase.from('circle_members').insert({
          circle_id: circle.id,
          email: form.emails[i],
          rotation_order: i + 2,
          status: 'invited',
        })
      }

      setInviteLink(`${window.location.origin}/join/${circle.id}`)
      setStep(5)
    } catch (e) {
      alert('Failed to create circle: ' + e.message)
    }
    setCreating(false)
  }

  function reset() {
    setStep(1)
    setForm({ name: '', mode: 'rotating', goalName: '', goalAmount: '', amount: '', frequency: 'monthly', startDate: '', emails: [] })
    setEmailInput('')
    setInviteLink('')
  }

  const dots = (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: '1.25rem' }}>
      {[1, 2, 3, 4].map(n => (
        <div key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: n <= step ? 'var(--pink)' : 'var(--border)', transition: 'background 0.2s' }} />
      ))}
    </div>
  )

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }} title={step < 5 ? 'Create a Circle' : 'Circle created!'} width={480}>
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {dots}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={lbl}>Circle name</span>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Girls' Savings Club" style={inp} />
          </label>
          <span style={lbl}>Mode</span>
          {[['rotating', '🔄 Rotating savings (Susu)', 'The full pot rotates to one member each period until everyone has received it.'], ['shared_goal', '🎯 Shared goal', 'Everyone saves toward a single goal together.']].map(([v, l, d]) => (
            <div key={v} onClick={() => set('mode', v)} style={{
              border: `2px solid ${form.mode === v ? 'var(--pink)' : 'var(--border)'}`,
              background: form.mode === v ? 'var(--petal)' : '#fff',
              borderRadius: 12, padding: '0.875rem 1rem', cursor: 'pointer',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--plum)', fontSize: 14 }}>{l}</div>
              <div style={{ color: 'var(--text-mid)', fontSize: 12, marginTop: 3 }}>{d}</div>
            </div>
          ))}
          {form.mode === 'shared_goal' && (
            <>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={lbl}>Goal name</span>
                <input value={form.goalName} onChange={e => set('goalName', e.target.value)} placeholder="e.g. Group vacation" style={inp} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={lbl}>Target amount</span>
                <input type="number" value={form.goalAmount} onChange={e => set('goalAmount', e.target.value)} placeholder="0.00" style={inp} />
              </label>
            </>
          )}
          <Button variant="pink" onClick={() => setStep(2)} disabled={!form.name} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>Next →</Button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {dots}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={lbl}>Contribution amount per member</span>
            <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="e.g. 100" style={inp} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={lbl}>Frequency</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {['weekly', 'monthly'].map(f => (
                <button key={f} onClick={() => set('frequency', f)} style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${form.frequency === f ? 'var(--pink)' : 'var(--border)'}`,
                  background: form.frequency === f ? 'var(--petal)' : '#fff', cursor: 'pointer',
                  fontWeight: 600, color: form.frequency === f ? 'var(--pink)' : 'var(--text-mid)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, textTransform: 'capitalize',
                }}>{f}</button>
              ))}
            </div>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={lbl}>Start date</span>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={inp} />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>← Back</Button>
            <Button variant="pink" onClick={() => setStep(3)} disabled={!form.amount} style={{ flex: 1, justifyContent: 'center' }}>Next →</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {dots}
          <p style={{ margin: 0, color: 'var(--text-mid)', fontSize: 14 }}>Add up to 12 members by email. They'll receive an invite link.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEmail()} placeholder="member@email.com" style={{ ...inp, flex: 1 }} />
            <Button variant="teal" onClick={addEmail} disabled={!emailInput.trim() || form.emails.length >= 12} small>+ Add</Button>
          </div>
          {form.emails.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {form.emails.map(e => (
                <div key={e} style={{ background: 'var(--lavender)', borderRadius: 99, padding: '4px 10px', fontSize: 13, color: 'var(--plum)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {e}
                  <button onClick={() => removeEmail(e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-light)', padding: 0, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center' }}>← Back</Button>
            <Button variant="pink" onClick={() => setStep(4)} style={{ flex: 1, justifyContent: 'center' }}>Next →</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {dots}
          <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", color: 'var(--plum)' }}>Confirm your Circle</h3>
          <div style={{ background: '#FAFAF8', borderRadius: 14, padding: '1rem', fontSize: 14, lineHeight: 2, color: 'var(--plum)' }}>
            <div><strong>Name:</strong> {form.name}</div>
            <div><strong>Mode:</strong> {form.mode === 'rotating' ? 'Rotating savings' : 'Shared goal'}</div>
            {form.mode === 'shared_goal' && <div><strong>Goal:</strong> {form.goalName} — {formatCurrency(Number(form.goalAmount), currency)}</div>}
            <div><strong>Contribution:</strong> {formatCurrency(Number(form.amount), currency)} / {form.frequency}</div>
            <div><strong>Members invited:</strong> {form.emails.length > 0 ? form.emails.join(', ') : 'None yet'}</div>
          </div>
          <div style={{ background: 'var(--lavender)', borderRadius: 12, padding: '0.875rem 1rem', fontSize: 13, color: 'var(--plum)' }}>
            ℹ️ {MONEY_DISCLAIMER}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: 'center' }}>← Back</Button>
            <Button variant="pink" onClick={launch} disabled={creating} style={{ flex: 1, justifyContent: 'center' }}>
              {creating ? '⏳ Creating…' : '🚀 Launch Circle'}
            </Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 0.75rem' }}>Your circle is live!</h3>
          <p style={{ color: 'var(--text-mid)', marginBottom: '1rem' }}>Share this invite link with your members:</p>
          <div style={{ background: 'var(--lavender)', borderRadius: 12, padding: '0.875rem 1rem', fontSize: 13, color: 'var(--plum)', wordBreak: 'break-all', marginBottom: '1rem' }}>
            {inviteLink}
          </div>
          <Button variant="teal" onClick={() => { navigator.clipboard.writeText(inviteLink); alert('Copied!') }} style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
            📋 Copy invite link
          </Button>
          <Button variant="pink" onClick={() => { reset(); onCreated() }} style={{ width: '100%', justifyContent: 'center' }}>
            View my circle →
          </Button>
        </div>
      )}
    </Modal>
  )
}

const lbl = { fontSize: 13, fontWeight: 600, color: 'var(--text-mid)' }
const inp = {
  border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px',
  fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: 'var(--plum)',
  outline: 'none', width: '100%', boxSizing: 'border-box',
}
