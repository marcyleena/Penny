import React from 'react'
import { NavLink } from 'react-router-dom'
import { getStored } from '../../hooks/useStorage'
import PennyCoin from '../penny/PennyCoin'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/budget', label: 'Budget', icon: '🎯' },
  { to: '/transactions', label: 'Transactions', icon: '💳' },
  { to: '/debts', label: 'Debt Tracker', icon: '📉' },
  { to: '/goals', label: 'Goals', icon: '🌱' },
  { to: '/circles', label: 'Circles', icon: '⭕' },
  { to: '/bills', label: 'Bills', icon: '🧾' },
  { to: '/subscriptions', label: 'Subscriptions', icon: '🔍' },
  { to: '/net-worth', label: 'Net Worth', icon: '💎' },
  { to: '/annual', label: 'Annual Overview', icon: '📅' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
  { to: '/help', label: 'Help & Support', icon: '💬' },
]

export default function Sidebar({ onClose }) {
  const name = getStored('penny_name', '')
  const email = getStored('penny_email', '')

  return (
    <div style={{
      background: 'var(--plum)',
      width: 240, minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      padding: '0 0 1.5rem',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <PennyCoin size={36} />
        <span style={{ fontFamily: "'DM Serif Display', serif", color: '#fff', fontSize: 22 }}>Penny</span>
        {onClose && (
          <button onClick={onClose} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.6)', fontSize: 20, cursor: 'pointer',
          }}>×</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 1.25rem',
              color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.75)',
              textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
              background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{name || 'Friend'}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>{email}</div>
      </div>
    </div>
  )
}
