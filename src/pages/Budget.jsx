import React, { useState } from 'react'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import { useStorage } from '../hooks/useStorage'
import { useMonthData } from '../hooks/useMonthData'
import { formatCurrency } from '../utils/formatters'
import { calcStatus, calcBudgetProgress } from '../utils/calculations'
import { categoryColour } from '../utils/colours'

const DEFAULT_CATEGORIES = [
  'Housing', 'Food & Groceries', 'Transport', 'Utilities',
  'Entertainment', 'Health', 'Clothing', 'Personal Care', 'Savings', 'Other',
]

export default function Budget() {
  const now = new Date()
  const [currency] = useStorage('penny_currency', 'USD')
  const [budgets, setBudgets] = useStorage('penny_budgets', {})
  const [categories, setCategories] = useStorage('penny_categories', DEFAULT_CATEGORIES)
  const [method, setMethod] = useState('custom')
  const [newCat, setNewCat] = useState('')
  const [editingCat, setEditingCat] = useState(null)
  const [income] = useStorage('penny_monthly_income', 0)

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

  function apply5030() {
    const inc = Number(income) || 0
    const needs = ['Housing','Food & Groceries','Transport','Utilities','Health']
    const wants = ['Entertainment','Clothing','Personal Care']
    const newB = {}
    categories.forEach(cat => {
      if (needs.includes(cat)) newB[cat] = Math.round((inc * 0.50) / needs.length)
      else if (wants.includes(cat)) newB[cat] = Math.round((inc * 0.30) / wants.length)
      else if (cat === 'Savings') newB[cat] = Math.round(inc * 0.20)
      else newB[cat] = 0
    })
    setBudgets(prev => ({ ...prev, [key]: newB }))
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

  const totalBudget = Object.values(monthBudgets).reduce((s,v) => s + (Number(v)||0), 0)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: 0, fontSize: 28 }}>Budget</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setMethod('custom')}
            style={{ ...methodBtn, background: method === 'custom' ? 'var(--plum)' : 'var(--border)', color: method === 'custom' ? '#fff' : 'var(--text)' }}
          >Custom</button>
          <button
            onClick={() => { setMethod('503020'); apply5030() }}
            style={{ ...methodBtn, background: method === '503020' ? 'var(--plum)' : 'var(--border)', color: method === '503020' ? '#fff' : 'var(--text)' }}
          >50/30/20</button>
        </div>
      </div>

      {method === '503020' && !income && (
        <div style={{ background: 'var(--sunshine)', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '1rem', fontSize: 14, color: 'var(--plum)' }}>
          💡 Add your monthly income in Settings to use the 50/30/20 rule.
        </div>
      )}

      {/* Budget table */}
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
                const pct = calcBudgetProgress(budget, spent)
                const status = calcStatus(budget, spent)
                return (
                  <tr key={cat} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : '#FAFAF8' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: categoryColour(cat), flexShrink: 0 }} />
                        <span style={{ fontWeight: 500, color: 'var(--plum)', fontSize: 14 }}>{cat}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <input
                        type="number"
                        value={budget || ''}
                        onChange={e => setBudget(cat, e.target.value)}
                        placeholder="0"
                        style={{
                          border: '1.5px solid var(--border)', borderRadius: 8,
                          padding: '6px 10px', width: 90, fontSize: 14,
                          fontFamily: "'DM Sans', sans-serif", color: 'var(--plum)',
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--pink)', fontWeight: 600, fontSize: 14 }}>
                      {formatCurrency(spent, currency)}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 14, color: rem < 0 ? 'var(--over)' : 'var(--ok)' }}>
                      {budget > 0 ? formatCurrency(rem, currency) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', minWidth: 120 }}>
                      {budget > 0 ? <ProgressBar pct={pct} status={status} /> : <span style={{ color: 'var(--text-light)', fontSize: 12 }}>No budget set</span>}
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

      {/* Add category */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCategory()}
          placeholder="New category name"
          style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, flex: 1, fontFamily: "'DM Sans', sans-serif", color: 'var(--plum)' }}
        />
        <Button variant="teal" onClick={addCategory} disabled={!newCat.trim()}>+ Add category</Button>
      </div>
    </div>
  )
}

const methodBtn = {
  padding: '8px 16px', borderRadius: 10, border: 'none',
  cursor: 'pointer', fontSize: 14, fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
}
const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
  padding: 4, borderRadius: 6, lineHeight: 1,
}
