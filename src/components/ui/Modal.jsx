import React, { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(61,43,107,0.3)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="fade-in"
        style={{
          background: '#fff', borderRadius: 20, padding: '1.75rem',
          width: '100%', maxWidth: width,
          boxShadow: '0 8px 40px rgba(61,43,107,0.18)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontFamily: "'DM Serif Display', serif", color: 'var(--plum)' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 22, color: 'var(--text-light)', padding: 4, lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
