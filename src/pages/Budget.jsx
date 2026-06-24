import React, { useState } from 'react'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import Tooltip from '../components/ui/Tooltip'
import { useStorage } from '../hooks/useStorage'
import { useMonthData } from '../hooks/useMonthData'
import { formatCurrency } from '../utils/formatters'
import { calcStatus, calcBudgetProgress } from '../utils/calculations'
import { categoryColour } from '../utils/colours'
import { DEFAULT_CATEGORIES, FOUR_BUCKETS, BUCKET_COLORS, bucketForCategory } from '../utils/categories'

export default function Budget() {
  const now = new Date()
  const [currency] = useStorage('penny_currency', 'USD')
  const [budgets, setBudgets] = useStorage('penny_budgets', {})
  const [categories, setCategories] = useStorage('penny_categories', DEFAULT_CATEGORIES)
  const [budgetMethod] = useStorage('penny_budget_method', '4buckets')
  const [income] = useStorage('penny_monthly_income', 0)
  const [newCat, setNewCat] = useState('')
  const [collapsed, setCollapsed] = useState({})
  const [savingsTarget, setSavingsTargetLocal] = useState('')

  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const key = `${year}-${String(month).padStart(2,'0')}`
  const monthBudgets = budgets[key] || {}
  const { byCategory, totalSpent } = useMonthData(year, month)

  function setBudget(cat, val) {
    setBudgets(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [cat]: Number(val) || 0 },
    }))
  }

  function addCategory() {
    const t = newCat.trim()
    if (!t || categories.includes(t)) return
    setCategories(prev => [...prev, t])
    setNewCat('')
  }

  function removeCategory(cat) {
    if (!confirm(`Remove "${cat}" category?`)) return
    setCategories(prev => prev.filter(c => c !== cat))
  }

  function renameCategory(oldName) {
    const newName = prompt('Rename category:', oldName)
    if (!newName || newName === oldName) return
    setCategories(prev => prev.map(c => c === oldName ? newName : c))
  }

  const totalBudget = Object.values(monthBudgets).reduce((s, v) => s + (Number(v) || 0), 0)
  const unassigned = (Number(income) || 0) - totalBudget

  // ---------- Zero-based view ----------
  function ZeroBasedView() {
    return (
      <>
        <div style={{
          background: unassigned === 0 ? 'var(--mint)' : unassigned > 0 ? 'var(--sunshine)' : 'var(--petal)',
          borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--plum)', fontSize: 15 }}>
              {unassigned === 0 ? '✓ Every dollar has a job!' : unassigned > 0 ? '💛 Dollars still unassigned' : '🚨 Over-allocated'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 2 }}>
              Income: {formatCurrency(Number(income)||0, currency)} — Assigned: {formatCurrency(totalBudget, currency)}
            </div>
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: unassigned < 0 ? 'var(--over)' : 'var(--plum)' }}>
            {unassigned >= 0 ? '' : '-'}{formatCurrency(Math.abs(unassigned), currency)} {unassigned >= 0 ? 'left' : 'over'}
          </div>
        </div>
        <CategoryTable categories={categories} monthBudgets={monthBudgets} byCategory={byCategory} currency={currency} setBudget={setBudget} renameCategory={renameCategory} removeCategory={removeCategory} />
      </>
    )
  }

  // ---------- Pay yourself first view ----------
  function PayYourselfFirstView() {
    const savings = Number(monthBudgets['__savings_target'] || 0)
    const flexible = Math.max(0, (Number(income) || 0) - savings)
    const flexibleSpent = totalSpent - (byCategory['Savings goals'] || 0) - (byCategory['Emergency fund'] || 0) - (byCategory['Investing'] || 0) - (byCategory['Debt payoff'] || 0)

    return (
      <>
        <div style={{ background: 'var(--mint)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--plum)', fontSize: 15, marginBottom: 8 }}>
            Step 1 — How much do you want to save this month?
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="number"
              value={monthBudgets['__savings_target'] || ''}
              onChange={e => setBudget('__savings_target', e.target.value)}
              placeholder="Savings target"
              style={numInput}
            />
            <span style={{ color: 'var(--text-mid)', fontSize: 13 }}>= {savings > 0 && income > 0 ? Math.round((savings / Number(income)) * 100) : 0}% of income</span>
          </div>
        </div>
        <div style={{ background: 'var(--lavender)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--plum)', fontSize: 15 }}>Flexible spending</div>
              <div style={{ fontSize: 13, color: 'var(--text-mid)' }}>Spend the rest however you want</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--plum)' }}>{formatCurrency(flexible, currency)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>{formatCurrency(flexibleSpent, currency)} spent</div>
            </div>
          </div>
          {flexible > 0 && <ProgressBar pct={Math.min(100, (flexibleSpent / flexible) * 100)} status={calcStatus(flexible, flexibleSpent)} height={10} />}
        </div>
        <details style={{ marginBottom: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--violet)', fontWeight: 600, fontSize: 14, padding: '0.5rem 0' }}>
            Optional: view category breakdown
          </summary>
          <div style={{ marginTop: 8 }}>
            <CategoryTable categories={categories} monthBudgets={monthBudgets} byCategory={byCategory} currency={currency} setBudget={setBudget} renameCategory={renameCategory} removeCategory={removeCategory} />
          </div>
        </details>
      </>
    )
  }

  // ---------- 4 Buckets view ----------
  function FourBucketsView() {
    const bucketNames = Object.keys(FOUR_BUCKETS)
    return (
      <>
        {bucketNames.map(bucket => {
          const bucketCats = [...(FOUR_BUCKETS[bucket] || []), ...categories.filter(c => bucketForCategory(c) === bucket && !FOUR_BUCKETS[bucket].includes(c))]
          const bucketCatsFiltered = bucketCats.filter(c => categories.includes(c))
          const bucketBudget = bucketCatsFiltered.reduce((s, c) => s + (Number(monthBudgets[c]) || 0), 0)
          const bucketSpent = bucketCatsFiltered.reduce((s, c) => s + (byCategory[c] || 0), 0)
          const isCollapsed = collapsed[bucket]
          const color = BUCKET_COLORS[bucket]

          return (
            <div key={bucket} style={{ background: '#fff', borderRadius: 16, marginBottom: '1rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)', overflow: 'hidden' }}>
              <div
                onClick={() => setCollapsed(p => ({ ...p, [bucket]: !p[bucket] }))}
                style={{ padding: '1rem 1.25rem', cursor: 'pointer', borderLeft: `4px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isCollapsed ? '#FAFAF8' : '#fff' }}
              >
                <div>
                  <span style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 18 }}>{bucket}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 10 }}>{bucketCatsFiltered.length} categories</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-mid)' }}>{formatCurrency(bucketSpent, currency)} / {bucketBudget > 0 ? formatCurrency(bucketBudget, currency) : 'no limit'}</div>
                  </div>
                  <span style={{ color: 'var(--text-light)', fontSize: 18 }}>{isCollapsed ? '▸' : '▾'}</span>
                </div>
              </div>
              {!isCollapsed && bucketCatsFiltered.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--lavender)' }}>
                        {['Category', 'Budget', 'Spent', 'Remaining', 'Progress', ''].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bucketCatsFiltered.map((cat, i) => {
                        const budget = monthBudgets[cat] || 0
                        const spent = byCategory[cat] || 0
                        const rem = budget - spent
                        return (
                          <tr key={cat} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : '#FAFAF8' }}>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                                <span style={{ fontWeight: 500, color: 'var(--plum)', fontSize: 13 }}>{cat}</span>
                              </div>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <input type="number" value={budget || ''} onChange={e => setBudget(cat, e.target.value)} placeholder="0" style={{ ...numInput, width: 80 }} />
                            </td>
                            <td style={{ padding: '10px 14px', color: 'var(--pink)', fontWeight: 600, fontSize: 13 }}>{formatCurrency(spent, currency)}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13, color: rem < 0 ? 'var(--over)' : 'var(--ok)' }}>
                              {budget > 0 ? formatCurrency(rem, currency) : '—'}
                            </td>
                            <td style={{ padding: '10px 14px', minWidth: 100 }}>
                              {budget > 0 ? <ProgressBar pct={calcBudgetProgress(budget, spent)} status={calcStatus(budget, spent)} /> : <span style={{ color: 'var(--text-light)', fontSize: 11 }}>No limit</span>}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => renameCategory(cat)} style={iconBtn} title="Rename">✏️</button>
                                <button onClick={() => removeCategory(cat)} style={iconBtn} title="Delete">🗑️</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {!isCollapsed && bucketCatsFiltered.length === 0 && (
                <p style={{ padding: '1rem 1.25rem', color: 'var(--text-light)', fontSize: 13 }}>No categories in this bucket yet. Add one below.</p>
              )}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: 0, fontSize: 28 }}>Budget</h1>
        <div style={{ fontSize: 13, color: 'var(--text-light)', background: 'var(--lavender)', borderRadius: 20, padding: '4px 12px' }}>
          {budgetMethod === 'zerobased' ? 'Zero-based' : budgetMethod === 'payyourselffirst' ? 'Pay yourself first' : '4 Buckets'} — change in Settings
        </div>
      </div>

      {!income && (
        <div style={{ background: 'var(--sunshine)', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '1rem', fontSize: 14, color: 'var(--plum)' }}>
          💡 Add your monthly income in Settings for full budget tracking.
        </div>
      )}

      {budgetMethod === 'zerobased' && (
        <>
          <div style={{ background: 'var(--lavender)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: 13, color: 'var(--plum)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tooltip content="Every dollar of income is assigned to a category until nothing is left unallocated.">
              <strong>Zero-based budgeting</strong>
            </Tooltip>
            — assign every dollar a job until unassigned = $0.
          </div>
          <ZeroBasedView />
        </>
      )}

      {budgetMethod === 'payyourselffirst' && (
        <>
          <div style={{ background: 'var(--mint)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: 13, color: 'var(--plum)' }}>
            💡 Save your target amount first, then spend the rest freely.
          </div>
          <PayYourselfFirstView />
        </>
      )}

      {(budgetMethod === '4buckets' || !budgetMethod) && (
        <>
          <div style={{ background: 'var(--petal)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: 13, color: 'var(--plum)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tooltip content="A budgeting method that groups spending into Fixed Needs, Variable Needs, Goals, and Fun. Simple, flexible, built for real life.">
              <strong>4 Buckets method</strong>
            </Tooltip>
            — click any bucket to expand and set limits by category.
          </div>
          <FourBucketsView />
        </>
      )}

      {/* Add category */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: '1.5rem' }}>
        <input
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCategory()}
          placeholder="Add a new category"
          style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, flex: 1, fontFamily: "'DM Sans', sans-serif", color: 'var(--plum)', outline: 'none' }}
        />
        <Button variant="teal" onClick={addCategory} disabled={!newCat.trim()}>+ Add</Button>
      </div>
    </div>
  )
}

function CategoryTable({ categories, monthBudgets, byCategory, currency, setBudget, renameCategory, removeCategory }) {
  const totalBudget = Object.values(monthBudgets).filter((_, i) => !Object.keys(monthBudgets)[i]?.startsWith('__')).reduce((s, v) => s + (Number(v) || 0), 0)
  const totalSpent = categories.reduce((s, c) => s + (byCategory[c] || 0), 0)
  return (
    <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(61,43,107,0.06)', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--lavender)' }}>
              {['Category', 'Budget', 'Spent', 'Remaining', 'Progress', ''].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => {
              const budget = monthBudgets[cat] || 0
              const spent = byCategory[cat] || 0
              const rem = budget - spent
              return (
                <tr key={cat} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : '#FAFAF8' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: categoryColour(cat), flexShrink: 0 }} />
                      <span style={{ fontWeight: 500, color: 'var(--plum)', fontSize: 14 }}>{cat}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <input type="number" value={budget || ''} onChange={e => setBudget(cat, e.target.value)} placeholder="0" style={numInput} />
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--pink)', fontWeight: 600, fontSize: 14 }}>{formatCurrency(spent, currency)}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 14, color: rem < 0 ? 'var(--over)' : 'var(--ok)' }}>
                    {budget > 0 ? formatCurrency(rem, currency) : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', minWidth: 120 }}>
                    {budget > 0 ? <ProgressBar pct={calcBudgetProgress(budget, spent)} status={calcStatus(budget, spent)} /> : <span style={{ color: 'var(--text-light)', fontSize: 12 }}>No limit</span>}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => renameCategory(cat)} style={iconBtn} title="Rename">✏️</button>
                      <button onClick={() => removeCategory(cat)} style={iconBtn} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--lavender)', fontWeight: 700 }}>
              <td style={{ padding: '12px 14px', color: 'var(--plum)' }}>Total</td>
              <td style={{ padding: '12px 14px', color: 'var(--plum)' }}>{formatCurrency(totalBudget, currency)}</td>
              <td style={{ padding: '12px 14px', color: 'var(--pink)' }}>{formatCurrency(totalSpent, currency)}</td>
              <td style={{ padding: '12px 14px', color: totalBudget - totalSpent < 0 ? 'var(--over)' : 'var(--ok)' }}>{formatCurrency(totalBudget - totalSpent, currency)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

const numInput = {
  border: '1.5px solid var(--border)', borderRadius: 8,
  padding: '6px 10px', width: 90, fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", color: 'var(--plum)', outline: 'none',
}
const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
  padding: 4, borderRadius: 6, lineHeight: 1,
}
