import React from 'react'

export default function PennyAvatar({ size = 40, spinning = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--gold)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55, flexShrink: 0,
      boxShadow: '0 2px 8px rgba(255,209,102,0.4)',
      animation: spinning ? 'spin 1s linear infinite' : 'none',
    }}>
      🪙
    </div>
  )
}
