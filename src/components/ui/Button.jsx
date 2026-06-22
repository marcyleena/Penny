import React from 'react'

const variants = {
  primary: { background: 'var(--pink)', color: '#fff', border: 'none' },
  teal: { background: 'var(--teal)', color: '#fff', border: 'none' },
  violet: { background: 'var(--violet)', color: '#fff', border: 'none' },
  gold: { background: 'var(--gold)', color: 'var(--plum)', border: 'none' },
  plum: { background: 'var(--plum)', color: '#fff', border: 'none' },
  ghost: { background: 'transparent', color: 'var(--plum)', border: '1.5px solid var(--border)' },
  danger: { background: 'var(--over)', color: '#fff', border: 'none' },
}

export default function Button({ children, variant = 'primary', onClick, disabled, style, type = 'button', small }) {
  const v = variants[variant] || variants.primary
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v,
        padding: small ? '6px 14px' : '10px 20px',
        borderRadius: 10,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: small ? 13 : 15,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.2s, transform 0.1s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        minHeight: 44,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
