import React, { useState } from 'react'
import PennyAvatar from './PennyAvatar'
import Button from '../ui/Button'
import { callPenny, PENNY_SYSTEM } from '../../hooks/usePenny'
import { formatCurrency, formatMonth } from '../../utils/formatters'
import { getStored } from '../../hooks/useStorage'

export default function PennyTake({ year, month, totalIncome, totalSpent, remaining, byCategory, upcomingBills, totalDebt, savingsProgress }) {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const currency = getStored('penny_currency', 'USD')

  const top3 = Object.entries(byCategory || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([cat, amt]) => `${cat}: ${formatCurrency(amt, currency)}`).join(', ')

  async function getInsight() {
    setLoading(true)
    setError('')
    setInsight('')
    const msg = `Month: ${formatMonth(year, month)}
Income: ${formatCurrency(totalIncome, currency)}
Spent: ${formatCurrency(totalSpent, currency)}
Remaining: ${formatCurrency(remaining, currency)}
Top spending: ${top3 || 'none yet'}
Upcoming bills: ${upcomingBills || 'none'}
Total debt: ${formatCurrency(totalDebt || 0, currency)}
Savings progress: ${savingsProgress || 'no goals set'}`
    try {
      await callPenny(PENNY_SYSTEM, msg, (partial) => setInsight(partial))
    } catch (e) {
      setError(e.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--lavender) 0%, var(--mint) 100%)',
      borderRadius: 20, padding: '1.5rem',
      boxShadow: '0 2px 16px rgba(61,43,107,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <PennyAvatar size={44} spinning={loading} />
        <div>
          <h2 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 22 }}>
            Penny's Take
          </h2>
          <p style={{ margin: 0, color: 'var(--text-mid)', fontSize: 14 }}>
            Your personalised money brief for {formatMonth(year, month)}
          </p>
        </div>
      </div>

      {!insight && !loading && (
        <Button variant="violet" onClick={getInsight} style={{ marginTop: 4 }}>
          ✨ Get insight
        </Button>
      )}

      {loading && !insight && (
        <p style={{ color: 'var(--text-mid)', fontStyle: 'italic', fontSize: 14 }}>Penny is thinking…</p>
      )}

      {insight && (
        <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 8, marginBottom: 4 }}>
          AI-generated content &nbsp;|&nbsp; Powered by Anthropic Claude &nbsp;|&nbsp; For informational purposes only, not financial advice
        </div>
      )}

      {insight && (
        <div style={{
          background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '1rem',
          marginTop: 8, color: 'var(--plum)', lineHeight: 1.7, fontSize: 15,
          whiteSpace: 'pre-wrap',
        }}>
          {insight}
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--over)', fontSize: 14, marginTop: 8 }}>
          {error.includes('No API key') ? '🔑 Add your Anthropic API key in Settings to get Penny\'s insights.' : `Hmm, something went wrong. ${error}`}
        </p>
      )}

      {insight && (
        <Button variant="ghost" onClick={getInsight} style={{ marginTop: 10 }} small>
          ↺ Refresh
        </Button>
      )}
    </div>
  )
}
