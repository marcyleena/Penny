import React from 'react'
import PennyCoin from './PennyCoin'

export default function PennyAvatar({ size = 40, spinning = false }) {
  return (
    <div style={{
      flexShrink: 0,
      filter: 'drop-shadow(0 2px 6px rgba(255,209,102,0.45))',
    }}>
      <PennyCoin size={size} spinning={spinning} />
    </div>
  )
}
