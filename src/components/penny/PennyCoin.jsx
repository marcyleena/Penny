import React from 'react'

export default function PennyCoin({ size = 40, spinning = false }) {
  const cx = size / 2
  const cy = size / 2
  const outerR = size / 2
  const innerR = size / 2 - size * 0.08
  const fontSize = size * 0.44
  // Accent dot positions — top-right quadrant
  const dot1x = cx + outerR * 0.52
  const dot1y = cy - outerR * 0.52
  const dot2x = cx + outerR * 0.72
  const dot2y = cy - outerR * 0.28

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        flexShrink: 0,
        animation: spinning ? 'spin 1s linear infinite' : 'none',
        display: 'block',
      }}
    >
      {/* Outer gold circle */}
      <circle cx={cx} cy={cy} r={outerR} fill="#FFD166" />

      {/* Subtle drop shadow ring effect */}
      <circle
        cx={cx} cy={cy} r={outerR - 1}
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={1}
      />

      {/* Inner accent ring */}
      <circle
        cx={cx} cy={cy} r={innerR}
        fill="none"
        stroke="#E8B020"
        strokeWidth={1.5}
      />

      {/* Letter P — DM Serif Display, plum */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#2A1D4E"
        fontSize={fontSize}
        fontFamily="'DM Serif Display', Georgia, serif"
        fontWeight="400"
        style={{ userSelect: 'none' }}
      >
        P
      </text>

      {/* Pink accent dot */}
      <circle cx={dot1x} cy={dot1y} r={size * 0.075} fill="#FF6B9D" />

      {/* Violet accent dot */}
      <circle cx={dot2x} cy={dot2y} r={size * 0.05} fill="#A78BFA" />
    </svg>
  )
}
