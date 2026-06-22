import React from 'react'

const STYLES = {
  over: { bg: 'var(--petal)', border: 'var(--pink)', icon: '⚠️' },
  near: { bg: 'var(--sunshine)', border: 'var(--near)', icon: '👀' },
  ok:   { bg: 'var(--mint)', border: 'var(--ok)', icon: '✓' },
}

export default function AlertCard({ status = 'ok', title, body }) {
  const s = STYLES[status] || STYLES.ok
  return (
    <div style={{
      background: s.bg,
      border: `1.5px solid ${s.border}`,
      borderRadius: 14,
      padding: '0.875rem 1rem',
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--plum)', fontSize: 14 }}>{title}</div>
        {body && <div style={{ color: 'var(--text-mid)', fontSize: 13, marginTop: 2 }}>{body}</div>}
      </div>
    </div>
  )
}
