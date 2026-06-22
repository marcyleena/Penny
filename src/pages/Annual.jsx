import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency, formatMonth } from '../utils/formatters'
import { callPenny, PENNY_SYSTEM } from '../hooks/usePenny'

export default function Annual() {
  const navigate = useNavigate()
  const [transactions] = useStorage('penny_transactions', [])
  const [currency] = useStorage('penny_currency', 'USD')
  const [year] = useState(new Date().getFullYear())
  const [reviewText, setReviewText] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  function monthData(m) {
    const key = `${year}-${String(m).padStart(2,'0')}`
    const monthTx = transactions.filter(t => t.date?.startsWith(key))
    const income = monthTx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
    const expenses = monthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)
    return { income, expenses, net: income - expenses }
  }

  const months = Array.from({length:12}, (_, i) => {
    const m = i+1
    const data = monthData(m)
    return { m, ...data, label: new Date(year, i, 1).toLocaleString('en-US', { month: 'short' }) }
  })

  const yearIncome = months.reduce((s,m) => s + m.income, 0)
  const yearExpenses = months.reduce((s,m) => s + m.expenses, 0)
  const yearNet = yearIncome - yearExpenses

  const bestMonth = months.filter(m=>m.income>0).sort((a,b)=>b.net-a.net)[0]
  const toughMonth = months.filter(m=>m.expenses>0).sort((a,b)=>a.net-b.net)[0]

  async function yearReview() {
    setReviewLoading(true)
    setReviewText('')
    const summary = months.map(m => `${m.label}: income ${formatCurrency(m.income, currency)}, expenses ${formatCurrency(m.expenses, currency)}, net ${formatCurrency(m.net, currency)}`).join('\n')
    try {
      await callPenny(PENNY_SYSTEM, `Generate a warm, honest year-in-review for ${year}. Month data:\n${summary}`)
      setReviewText(await callPenny(PENNY_SYSTEM, `Generate a warm, encouraging year-in-review for ${year}. Include highlights, achievements and one key thing to focus on next year. Month data:\n${summary}`))
    } catch (e) {
      setReviewText(e.message?.includes('No API key') ? '🔑 Add your API key in Settings.' : 'Could not generate review.')
    }
    setReviewLoading(false)
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: 0, fontSize: 28 }}>Annual Overview {year}</h1>
        <Button variant="violet" onClick={yearReview} disabled={reviewLoading}>
          {reviewLoading ? '⏳ Writing…' : '✨ Ask Penny for year review'}
        </Button>
      </div>

      {/* Year totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--mint)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Total Income</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: 'var(--teal)' }}>{formatCurrency(yearIncome, currency)}</div>
        </div>
        <div style={{ background: 'var(--petal)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Total Spent</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: 'var(--pink)' }}>{formatCurrency(yearExpenses, currency)}</div>
        </div>
        <div style={{ background: 'var(--lavender)', borderRadius: 14, padding: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Net Saved</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: yearNet>=0?'var(--ok)':'var(--over)' }}>{formatCurrency(yearNet, currency)}</div>
        </div>
        {bestMonth && (
          <div style={{ background: 'var(--sunshine)', borderRadius: 14, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>Best Month</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: 'var(--plum)' }}>{bestMonth.label}</div>
          </div>
        )}
      </div>

      {/* Month grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {months.map(({ m, label, income, expenses, net }) => {
          const hasData = income > 0 || expenses > 0
          const positive = net >= 0
          return (
            <div
              key={m}
              onClick={() => navigate('/', { state: { month: m, year } })}
              style={{
                background: !hasData ? '#f9f9f9' : positive ? 'var(--mint)' : 'var(--petal)',
                borderRadius: 14, padding: '1rem', cursor: 'pointer',
                border: `2px solid ${!hasData ? 'transparent' : positive ? 'var(--ok)' : 'var(--pink)'}`,
                transition: 'transform 0.15s',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--plum)', marginBottom: 6 }}>{label}</div>
              {hasData ? (
                <>
                  <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>In: {formatCurrency(income, currency)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>Out: {formatCurrency(expenses, currency)}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: positive ? 'var(--ok)' : 'var(--over)', marginTop: 4 }}>
                    {positive ? '+' : ''}{formatCurrency(net, currency)}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>No data</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Highlights */}
      {(bestMonth || toughMonth) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {bestMonth && bestMonth.net > 0 && (
            <div style={{ background: 'var(--mint)', borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>🏆</div>
              <div style={{ fontWeight: 700, color: 'var(--plum)' }}>Best Month: {bestMonth.label}</div>
              <div style={{ color: 'var(--teal)', fontWeight: 700 }}>{formatCurrency(bestMonth.net, currency)} saved</div>
            </div>
          )}
          {toughMonth && toughMonth.net < 0 && (
            <div style={{ background: 'var(--petal)', borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>💪</div>
              <div style={{ fontWeight: 700, color: 'var(--plum)' }}>Toughest Month: {toughMonth.label}</div>
              <div style={{ color: 'var(--over)', fontWeight: 700 }}>{formatCurrency(Math.abs(toughMonth.net), currency)} over</div>
            </div>
          )}
        </div>
      )}

      {reviewText && (
        <div style={{ background: 'linear-gradient(135deg, var(--lavender), var(--mint))', borderRadius: 20, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1rem', fontSize: 20 }}>
            🪙 Penny's Year in Review
          </h3>
          <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '1rem', color: 'var(--plum)', lineHeight: 1.7, fontSize: 15, whiteSpace: 'pre-wrap' }}>
            {reviewText}
          </div>
        </div>
      )}
    </div>
  )
}
