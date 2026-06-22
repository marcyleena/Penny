import React from 'react'

export default function StatCard({ label, value, icon, bg, color, sub }) {
  return (
    <div className="fade-in" style={{
      background: bg || 'var(--white)',
      borderRadius: 16,
      padding: '1.25rem 1.5rem',
      boxShadow: '0 2px 16px rgba(61,43,107,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
        <span style={{ color: 'var(--text-mid)', fontSize: 13, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 28,
        color: color || 'var(--plum)',
        lineHeight: 1.1,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}
