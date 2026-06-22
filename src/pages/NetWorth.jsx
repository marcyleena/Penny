import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useStorage } from '../hooks/useStorage'
import { formatCurrency } from '../utils/formatters'

export default function NetWorth() {
  const [debts] = useStorage('penny_debts', [])
  const [goals] = useStorage('penny_goals', [])
  const [currency] = useStorage('penny_currency', 'USD')
  const [assets, setAssets] = useStorage('penny_assets', { investments: 0, property: 0, other: 0 })
  const [liabilities, setLiabilities] = useStorage('penny_liabilities', { other: 0 })
  const [history] = useStorage('penny_networth_history', [])

  const savings = goals.reduce((s, g) => s + (g.current || 0), 0)
  const totalDebts = debts.reduce((s, d) => s + (d.balance || 0), 0)
  const totalAssets = savings + (assets.investments || 0) + (assets.property || 0) + (assets.other || 0)
  const totalLiabilities = totalDebts + (liabilities.other || 0)
  const netWorth = totalAssets - totalLiabilities

  const chartData = history.length > 0 ? history : [
    { month: 'Now', value: netWorth }
  ]

  function updateAsset(key, val) {
    setAssets(prev => ({ ...prev, [key]: Number(val) || 0 }))
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1.5rem', fontSize: 28 }}>Net Worth</h1>

      {/* Net worth display */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', background: '#fff', borderRadius: 20, padding: '2rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
        <div style={{ fontSize: 14, color: 'var(--text-mid)', fontWeight: 600, marginBottom: 8 }}>YOUR NET WORTH</div>
        <div style={{
          fontFamily: "'DM Serif Display', serif", fontSize: 52,
          color: netWorth >= 0 ? 'var(--teal)' : 'var(--over)',
          lineHeight: 1,
        }}>{formatCurrency(netWorth, currency)}</div>
        <div style={{ marginTop: 16, fontSize: 15, color: 'var(--text-mid)' }}>
          Assets <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{formatCurrency(totalAssets, currency)}</span>
          {' '} − Liabilities <span style={{ color: 'var(--over)', fontWeight: 700 }}>{formatCurrency(totalLiabilities, currency)}</span>
          {' '} = Net Worth
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Assets */}
        <div style={{ background: 'var(--mint)', borderRadius: 20, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1rem', fontSize: 20 }}>Assets 💚</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--plum)', fontWeight: 600 }}>Savings (from goals)</span>
              <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{formatCurrency(savings, currency)}</span>
            </div>
            {[
              { key: 'investments', label: 'Investments' },
              { key: 'property', label: 'Property' },
              { key: 'other', label: 'Other Assets' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <label style={{ color: 'var(--plum)', fontWeight: 600, flex: 1 }}>{label}</label>
                <input
                  type="number"
                  value={assets[key] || ''}
                  onChange={e => updateAsset(key, e.target.value)}
                  placeholder="0.00"
                  style={{ ...inputSt, width: 130 }}
                />
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(61,43,107,0.1)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span style={{ color: 'var(--plum)' }}>Total Assets</span>
              <span style={{ color: 'var(--teal)' }}>{formatCurrency(totalAssets, currency)}</span>
            </div>
          </div>
        </div>

        {/* Liabilities */}
        <div style={{ background: 'var(--petal)', borderRadius: 20, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1rem', fontSize: 20 }}>Liabilities ❤️</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {debts.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--plum)', fontWeight: 600 }}>{d.name}</span>
                <span style={{ color: 'var(--over)', fontWeight: 700 }}>{formatCurrency(d.balance, currency)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <label style={{ color: 'var(--plum)', fontWeight: 600, flex: 1 }}>Other Liabilities</label>
              <input
                type="number"
                value={liabilities.other || ''}
                onChange={e => setLiabilities(prev => ({ ...prev, other: Number(e.target.value) || 0 }))}
                placeholder="0.00"
                style={{ ...inputSt, width: 130 }}
              />
            </div>
            <div style={{ borderTop: '1px solid rgba(61,43,107,0.1)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span style={{ color: 'var(--plum)' }}>Total Liabilities</span>
              <span style={{ color: 'var(--over)' }}>{formatCurrency(totalLiabilities, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div style={{ background: '#fff', borderRadius: 20, padding: '1.5rem', boxShadow: '0 2px 16px rgba(61,43,107,0.06)' }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', margin: '0 0 1rem', fontSize: 18 }}>Net Worth Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" style={{ fontSize: 12 }} />
              <YAxis style={{ fontSize: 12 }} />
              <Tooltip formatter={v => formatCurrency(v, currency)} />
              <Line type="monotone" dataKey="value" stroke="var(--violet)" strokeWidth={2.5} dot={{ fill: 'var(--violet)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

const inputSt = {
  border:'1.5px solid rgba(61,43,107,0.15)', borderRadius:10, padding:'8px 12px',
  fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'var(--plum)',
  outline:'none', boxSizing:'border-box', background:'rgba(255,255,255,0.7)',
}
