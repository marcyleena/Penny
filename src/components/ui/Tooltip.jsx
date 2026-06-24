import React, { useState, useRef, useEffect } from 'react'

export default function Tooltip({ content, children }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setVisible(false)
    }
    if (visible) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [visible])

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <button
        onClick={() => setVisible(v => !v)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          background: 'var(--lavender)', border: 'none', borderRadius: '50%',
          width: 16, height: 16, fontSize: 10, fontWeight: 700,
          color: 'var(--violet)', cursor: 'pointer', marginLeft: 5,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1, flexShrink: 0,
        }}
        title={content}
      >i</button>
      {visible && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 6, zIndex: 999,
          background: 'var(--lavender)',
          color: 'var(--plum)',
          borderRadius: 10, padding: '8px 12px',
          fontSize: 12, lineHeight: 1.55,
          maxWidth: 240, minWidth: 160,
          boxShadow: '0 4px 16px rgba(61,43,107,0.15)',
          pointerEvents: 'none',
          whiteSpace: 'normal',
        }}>
          {content}
          <div style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            border: '5px solid transparent',
            borderTopColor: 'var(--lavender)',
          }} />
        </div>
      )}
    </span>
  )
}
