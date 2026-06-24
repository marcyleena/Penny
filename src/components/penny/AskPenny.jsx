import React, { useState, useRef, useEffect } from 'react'
import PennyAvatar from './PennyAvatar'
import PennyCoin from './PennyCoin'
import Button from '../ui/Button'
import { callPenny, PENNY_CHAT_SYSTEM } from '../../hooks/usePenny'
import { formatCurrency } from '../../utils/formatters'
import { getStored } from '../../hooks/useStorage'

const CHIPS = [
  "Can I afford a $500 purchase?",
  "When will I be debt free?",
  "Where am I overspending?",
  "What should I focus on this month?",
]

function buildContext() {
  const currency = getStored('penny_currency', 'USD')
  const transactions = getStored('penny_transactions', [])
  const debts = getStored('penny_debts', [])
  const goals = getStored('penny_goals', [])
  const bills = getStored('penny_bills', [])
  const now = new Date()
  const key = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const monthTx = transactions.filter(t => t.date?.startsWith(key))
  const spent = monthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)
  const income = monthTx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const totalDebt = debts.reduce((s,d)=>s+d.balance,0)
  return `User's financial context:
Currency: ${currency}
This month income: ${formatCurrency(income, currency)}
This month spent: ${formatCurrency(spent, currency)}
Remaining: ${formatCurrency(income - spent, currency)}
Total debt: ${formatCurrency(totalDebt, currency)}
Active savings goals: ${goals.length}
Upcoming bills: ${bills.filter(b=>!b.paid).length} unpaid`
}

export default function AskPenny() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    let reply = ''
    try {
      const system = PENNY_CHAT_SYSTEM + '\n\n' + buildContext()
      reply = await callPenny(system, msg, (partial) => {
        setMessages(prev => {
          const next = [...prev]
          if (next[next.length - 1]?.role === 'assistant') {
            next[next.length - 1] = { role: 'assistant', content: partial }
          } else {
            next.push({ role: 'assistant', content: partial })
          }
          return next
        })
      })
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: e.message?.includes('No API key')
          ? '🔑 I need your Anthropic API key to chat! Add it in Settings.'
          : `Hmm, something went wrong. Try again?`
      }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: 'none', border: 'none', cursor: 'pointer',
          display: open ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center',
          filter: 'drop-shadow(0 4px 16px rgba(255,209,102,0.55))',
          zIndex: 900, padding: 0,
        }}
        title="Ask Penny"
      >
        <PennyCoin size={56} />
      </button>

      {/* Drawer */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 950,
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <div onClick={() => setOpen(false)} style={{ flex: 1 }} />
          <div className="fade-in" style={{
            width: '100%', maxWidth: 420,
            background: '#fff',
            boxShadow: '-4px 0 40px rgba(61,43,107,0.15)',
            display: 'flex', flexDirection: 'column',
            height: '100%',
          }}>
            {/* Header */}
            <div style={{
              background: 'var(--plum)', padding: '1.25rem 1rem',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <PennyAvatar size={40} />
              <div>
                <div style={{ color: '#fff', fontFamily: "'DM Serif Display', serif", fontSize: 20 }}>Ask Penny</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Your financial best friend</div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: '#fff', fontSize: 22, cursor: 'pointer',
              }}>×</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.length === 0 && (
                <>
                  <p style={{ color: 'var(--text-mid)', fontSize: 14, textAlign: 'center' }}>
                    Hi! I'm Penny 🪙 Ask me anything about your finances.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {CHIPS.map(c => (
                      <button key={c} onClick={() => send(c)} style={{
                        background: 'var(--lavender)', border: 'none', borderRadius: 20,
                        padding: '6px 12px', fontSize: 12, cursor: 'pointer',
                        color: 'var(--plum)', fontFamily: "'DM Sans', sans-serif",
                      }}>{c}</button>
                    ))}
                  </div>
                </>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  {m.role === 'assistant' && (
                    <div style={{ fontSize: 10, color: 'var(--text-light)', marginBottom: 3, paddingLeft: 2 }}>
                      AI-generated &nbsp;|&nbsp; Anthropic Claude &nbsp;|&nbsp; Not financial advice
                    </div>
                  )}
                  <div style={{
                    background: m.role === 'user' ? 'var(--plum)' : 'var(--lavender)',
                    color: m.role === 'user' ? '#fff' : 'var(--plum)',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '0.75rem 1rem', fontSize: 14, lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length-1]?.role === 'user' && (
                <div style={{ color: 'var(--text-light)', fontSize: 13 }}>Penny is thinking…</div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask Penny anything…"
                style={{
                  flex: 1, border: '1.5px solid var(--border)', borderRadius: 10,
                  padding: '10px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  outline: 'none', color: 'var(--plum)',
                }}
              />
              <Button onClick={() => send()} disabled={!input.trim() || loading} variant="gold">→</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
