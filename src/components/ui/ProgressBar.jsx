import React from 'react'

export default function ProgressBar({ pct = 0, status = 'ok', height = 8, animate = true }) {
  const color = status === 'over' ? 'var(--over)' : status === 'near' ? 'var(--near)' : 'var(--ok)'
  const clamped = Math.min(100, Math.max(0, pct))
  return (
    <div style={{
      background: 'var(--border)',
      borderRadius: 99,
      height,
      overflow: 'hidden',
      width: '100%',
    }}>
      <div style={{
        width: `${clamped}%`,
        height: '100%',
        background: color,
        borderRadius: 99,
        transition: animate ? 'width 0.6s ease' : 'none',
      }} />
    </div>
  )
}
