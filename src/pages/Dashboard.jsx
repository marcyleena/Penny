import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import StatCard from '../components/ui/StatCard'
import ProgressBar from '../components/ui/ProgressBar'
import AlertCard from '../components/ui/AlertCard'
import PennyTake from '../components/penny/PennyTake'
import { useMonthData } from '../hooks/useMonthData'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency, formatMonth, formatShortDate } from '../utils/formatters'
import { categoryColour, categoryBg } from '../utils/colours'
import { calcStatus } from '../utils/calculations'

export default function Dashboard() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [currency] = useStorage('penny_currency', 'USD')
  const [debts] = useStorage('penny_debts', [])
  const [goals] = useStorage('penny_goals', [])
  const [bills] = useStorage('penny_bills', [])
  const [budgets] = useStorage('penny_budgets', {})

  const { totalIncome, totalSpent, remaining, byCategory, monthBudgets } = useMonthData(year, month)

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalBudget = Object.values(monthBudgets).reduce((s, v) => s + (Number(v) || 0), 0)
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const overallStatus = calcStatus(totalBudget, totalSpent)

  const categoryData = Object.entries(byCategory).map(([cat, amt]) => ({
    cat, amt, budget: monthBudgets[cat] || 0,
  })).sort((a, b) => b.amt - a.amt)

  const upcomingBills = [...bills]
    .filter(b => !b.paid)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3)

  const totalDebt = debts.reduce((s, d) => s + (d.balance || 0), 0)
  const totalSaved = goals.reduce((s, g) => s + (g.current || 0), 0)
  const totalBillsDue = bills.filter(b => !b.paid).reduce((s, b) => s + (b.amount || 0), 0)

  const alerts = Object.entries(byCategory)
    .filter(([cat]) => monthBudgets[cat])
    .map(([cat, amt]) => {
      const status = calcStatus(monthBudgets[cat], amt)
      if (status === 'ok') return null
      return { cat, amt, budget: monthBudgets[cat], status }
    }).filter(Boolean)

  const onTrack = Object.entries(monthBudgets).filter(([cat]) => {
    const s = calcStatus(monthBudgets[cat], byCategory[cat] || 0)
    return s === 'ok'
  })

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Month selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: 0, fontSize: 28 }}>
          Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 12, padding: '8px 16px', boxShadow: '0 2px 8px rgba(61,43,107,0.06)' }}>
          <button onClick={prevMonth} style={navBtn}>←</button>
          <span style={{ fontWeight: 600, color: 'var(--plum)', minWidth: 140, textAlign: 'center' }}>
            {formatMonth(year, month)}
          </span>
          <button onClick={nextMonth} style={navBtn}>→</button>
        </div>
      </div>

      {/* Penny's Take */}
      <div style={{ marginBottom: '1.5rem' }}>
        <PennyTake
          year={year} month={month}
          totalIncome={totalIncome} totalSpent={totalSpent} remaining={remaining}
          byCategory={byCategory}
          upcomingBills={upcomingBills.map(b => `${b.name} $${b.amount}`).join(', ')}
          totalDebt={totalDebt}
          savingsProgress={`${goals.length} goals, $${totalSaved} saved`}
        />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Income" value={formatCurrency(totalIncome, currency)} icon="💚" bg="var(--mint)" color="var(--teal)" />
        <StatCard label="Total Spent" value={formatCurrency(totalSpent, currency)} icon="💸" bg="var(--petal)" color="var(--pink)" />
        <StatCard label="Remaining" value={formatCurrency(remaining, currency)} icon="✨" bg="var(--lavender)" color="var(--violet)" />
        <StatCard label="Bills Due" value={formatCurrency(totalBillsDue, currency)} icon="🧾" bg="var(--sunshine)" color="var(--gold)" sub={`${bills.filter(b=>!b.paid).length} unpaid`} />
      </div>

      {/* Overall budget bar */}
      {totalBudget > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: 'var(--plum)' }}>Overall Budget</span>
            <span style={{ color: 'var(--text-mid)', fontSize: 14 }}>{formatCurrency(totalSpent, currency)} of {formatCurrency(totalBudget, currency)}</span>
          </div>
          <ProgressBar pct={overallPct} status={overallStatus} height={12} />
        </div>
      )}

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Spending by category */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <h3 style={{ margin: '0 0 1rem', fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 18 }}>
            Spending by Category
          </h3>
          {categoryData.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No transactions yet this month.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categoryData.slice(0, 8).map(({ cat, amt }) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--plum)' }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--plum)' }}>{formatCurrency(amt, currency)}</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 99, height: 6 }}>
                    <div style={{
                      width: `${Math.min(100, (amt / totalSpent) * 100)}%`,
                      height: '100%', borderRadius: 99,
                      background: categoryColour(cat),
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming bills */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <h3 style={{ margin: '0 0 1rem', fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 18 }}>
            Upcoming Bills
          </h3>
          {upcomingBills.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No upcoming bills. Nice! 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingBills.map((bill, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', background: 'var(--sunshine)', borderRadius: 12,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--plum)', fontSize: 14 }}>{bill.name}</div>
                    <div style={{ color: 'var(--text-mid)', fontSize: 12 }}>Due {formatShortDate(bill.dueDate)}</div>
                  </div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 18 }}>
                    {formatCurrency(bill.amount, currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alerts.map(({ cat, amt, budget, status }) => (
          <AlertCard key={cat} status={status}
            title={status === 'over' ? `Over budget on ${cat}` : `Approaching limit on ${cat}`}
            body={`Spent ${formatCurrency(amt, currency)} of ${formatCurrency(budget, currency)} budget`}
          />
        ))}
        {onTrack.length > 0 && Object.keys(monthBudgets).length > 0 && (
          <AlertCard status="ok"
            title={`${onTrack.length} categor${onTrack.length === 1 ? 'y' : 'ies'} on track`}
            body="You're spending within your planned budget. Keep it up! 💪"
          />
        )}
      </div>
    </div>
  )
}

const navBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 18, color: 'var(--plum)', padding: '4px 8px',
}
