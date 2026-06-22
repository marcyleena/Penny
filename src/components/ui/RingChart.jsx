import React, { useEffect, useRef } from 'react'

export default function RingChart({ pct = 0, size = 80, stroke = 10, color = 'var(--violet)', bg = 'var(--border)' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (circ * Math.min(pct, 100)) / 100
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}
