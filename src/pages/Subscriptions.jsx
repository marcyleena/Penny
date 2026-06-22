import React, { useState } from 'react'
import Button from '../components/ui/Button'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency } from '../utils/formatters'
import { callPenny } from '../hooks/usePenny'

export default function Subscriptions() {
  const [transactions] = useStorage('penny_transactions', [])
  const [currency] = useStorage('penny_currency', 'USD')
  const [subs, setSubs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function scan() {
    if (transactions.length === 0) {
      setError('Add some transactions first so Penny can scan them.')
      return
    }
    setLoading(true)
    setError('')
    setSubs(null)
    const txList = transactions.slice(0, 100).map(t => `${t.date} | ${t.description} | $${t.amount}`).join('\n')
    try {
      const result = await callPenny(
        'You are a financial data analyser. Return only valid JSON arrays, no other text.',
        `Analyse these transactions and identify likely recurring subscriptions or memberships. For each return: name, monthlyAmount (number), annualCost (number), category (streaming/software/fitness/food/other), possiblyUnused (boolean - true if not seen in last 30 days). Return as JSON array only.\n\nTransactions:\n${txList}`
      )
      const parsed = JSON.parse(result.trim().replace(/```json|```/g,''))
      setSubs(parsed)
    } catch (e) {
      setError(e.message?.includes('No API key') ? '🔑 Add your API key in Settings to use this feature.' : 'Could not parse subscriptions. Try again.')
    }
    setLoading(false)
  }

  const totalAnnual = subs ? subs.reduce((s, sub) => s + (sub.annualCost || 0), 0) : 0
  const catIcon = (c) => ({ streaming:'📺', software:'💻', fitness:'💪', food:'🍔' }[c] || '📦')

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 4px', fontSize: 28 }}>
          Subscription Detective 🔍
        </h1>
        <p style={{ color: 'var(--text-mid)', margin: 0, fontSize: 15 }}>
          Penny spots your recurring charges and calculates what they're costing you annually.
        </p>
      </div>

      <Button variant="violet" onClick={scan} disabled={loading} style={{ marginBottom: '1.5rem' }}>
        {loading ? '⏳ Scanning…' : '🔍 Scan my transactions for subscriptions'}
      </Button>

      {error && <p style={{ color: 'var(--over)', fontSize: 14, marginBottom: '1rem' }}>{error}</p>}

      {subs && (
        <>
          <div style={{ background: 'var(--lavender)', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 14, color: 'var(--text-mid)', fontWeight: 600 }}>Total Annual Subscription Spend</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: 'var(--plum)' }}>{formatCurrency(totalAnnual, currency)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 2 }}>That's {formatCurrency(totalAnnual/12, currency)}/month</div>
          </div>

          {subs.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>No recurring subscriptions detected.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px,1fr))', gap: '1rem' }}>
              {subs.map((sub, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 16, padding: '1.25rem',
                  boxShadow: '0 2px 16px rgba(61,43,107,0.06)',
                  border: sub.possiblyUnused ? '2px solid var(--near)' : '2px solid transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>{catIcon(sub.category)}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--plum)', fontSize: 15 }}>{sub.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-mid)', textTransform: 'capitalize' }}>{sub.category}</div>
                    </div>
                    {sub.possiblyUnused && (
                      <div style={{ marginLeft: 'auto', background: 'var(--sunshine)', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: 'var(--near)' }}>
                        POSSIBLY UNUSED
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>Monthly</div>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--plum)' }}>{formatCurrency(sub.monthlyAmount, currency)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>Annual</div>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--violet)' }}>{formatCurrency(sub.annualCost, currency)}</div>
                    </div>
                  </div>
                  {sub.possiblyUnused && (
                    <div style={{ background: 'var(--sunshine)', borderRadius: 10, padding: '6px 10px', fontSize: 13, color: 'var(--plum)' }}>
                      💰 Cancel this? You'd save {formatCurrency(sub.annualCost, currency)}/yr
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!subs && !loading && (
        <div style={{ background: '#fff', borderRadius: 20, padding: '3rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔍</div>
          <p style={{ color: 'var(--text-light)' }}>Import some transactions, then let Penny hunt for your hidden subscriptions.</p>
        </div>
      )}
    </div>
  )
}
