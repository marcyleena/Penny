import React from 'react'
import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Home', icon: '📊' },
  { to: '/budget', label: 'Budget', icon: '🎯' },
  { to: '/transactions', label: 'Wallet', icon: '💳' },
  { to: '/savings', label: 'Goals', icon: '🌱' },
  { to: '/debts', label: 'More', icon: '⚙️' },
]

export default function MobileNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid var(--border)',
      display: 'flex', zIndex: 500,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '8px 4px', textDecoration: 'none',
            color: isActive ? 'var(--plum)' : 'var(--text-light)',
            fontSize: 10, gap: 2, fontWeight: isActive ? 600 : 400,
            minHeight: 56,
          })}
        >
          <span style={{ fontSize: 22 }}>{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
