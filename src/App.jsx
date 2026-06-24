import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useParams, useNavigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import MobileNav from './components/layout/MobileNav'
import AskPenny from './components/penny/AskPenny'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Budget from './pages/Budget'
import Transactions from './pages/Transactions'
import Debts from './pages/Debts'
import Goals from './pages/Goals'
import Circles from './pages/Circles'
import Bills from './pages/Bills'
import Subscriptions from './pages/Subscriptions'
import NetWorth from './pages/NetWorth'
import Annual from './pages/Annual'
import Settings from './pages/Settings'
import PennyCoin from './components/penny/PennyCoin'
import Help from './pages/Help'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import DataDeletion from './pages/DataDeletion'
import { getStored, setStored } from './hooks/useStorage'
import { supabase, isSupabaseConfigured } from './lib/supabase'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

// Join Circle landing page
function JoinCircle() {
  const { circleId } = useParams()
  const navigate = useNavigate()
  const [circle, setCircle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) { setLoading(false); return }
    supabase.from('circles').select('*').eq('id', circleId).single()
      .then(({ data }) => { setCircle(data); setLoading(false) })
  }, [circleId])

  async function joinCircle() {
    if (!isSupabaseConfigured() || !supabase) return
    setJoining(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/'); return }
    await supabase.from('circle_members').update({ user_id: user.id, status: 'active' })
      .eq('circle_id', circleId).eq('email', user.email)
    navigate('/circles')
  }

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading…</div>
  if (!circle) return <div style={{ padding: '3rem', textAlign: 'center' }}>Circle not found.</div>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '2.5rem 2rem', maxWidth: 420, width: '100%', boxShadow: '0 8px 40px rgba(61,43,107,0.12)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: '1rem' }}>⭕</div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--plum)', fontSize: 26, margin: '0 0 0.5rem' }}>
          You're invited to join
        </h1>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--pink)', fontSize: 22, margin: '0 0 1rem' }}>{circle.name}</h2>
        <div style={{ background: 'var(--lavender)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', fontSize: 14, lineHeight: 1.7, color: 'var(--plum)' }}>
          <div><strong>Mode:</strong> {circle.mode === 'rotating' ? 'Rotating savings' : 'Shared goal'}</div>
          <div><strong>Contribution:</strong> ${circle.contribution_amount} / {circle.frequency}</div>
          {circle.goal_name && <div><strong>Goal:</strong> {circle.goal_name}</div>}
        </div>
        <p style={{ color: 'var(--text-light)', fontSize: 12, marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Penny Circles coordinates and tracks your group savings. Money transfers happen directly between members. Penny does not move or hold any money.
        </p>
        <button onClick={joinCircle} disabled={joining} style={{
          width: '100%', padding: '12px', borderRadius: 12, border: 'none',
          background: 'var(--pink)', color: '#fff', fontSize: 16, fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
        }}>
          {joining ? '⏳ Joining…' : 'Join this Circle →'}
        </button>
      </div>
    </div>
  )
}

function AppShell() {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
      {!isMobile && <Sidebar />}

      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 800 }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(61,43,107,0.4)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {isMobile && (
          <div style={{
            background: 'var(--plum)', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 400,
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: 0 }}>☰</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PennyCoin size={28} />
              <span style={{ color: '#fff', fontFamily: "'DM Serif Display', serif", fontSize: 18 }}>Penny</span>
            </div>
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? 80 : 0 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/debts" element={<Debts />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/circles" element={<Circles />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/net-worth" element={<NetWorth />} />
            <Route path="/annual" element={<Annual />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/data-deletion" element={<DataDeletion />} />
          </Routes>
        </main>

        {isMobile && <MobileNav />}
      </div>

      <AskPenny />
    </div>
  )
}

function App() {
  const [authed, setAuthed] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [onboarded, setOnboarded] = useState(() => !!getStored('penny_onboarded'))

  useEffect(() => {
    // Check for /join/ route — allow unauthenticated access
    if (window.location.pathname.startsWith('/join/')) {
      setAuthChecked(true)
      return
    }

    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setStored('penny_email', session.user.email)
          setAuthed(true)
        } else {
          setAuthed(false)
        }
        setAuthChecked(true)
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthed(!!session)
        if (session) setStored('penny_email', session.user.email)
      })
      return () => subscription.unsubscribe()
    } else {
      // Legacy: localStorage email
      setAuthed(!!getStored('penny_email'))
      setAuthChecked(true)
    }
  }, [])

  // Show join page without auth check
  if (window.location.pathname.startsWith('/join/')) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/join/:circleId" element={<JoinCircle />} />
        </Routes>
      </BrowserRouter>
    )
  }

  if (!authChecked) return null

  if (!authed) return <Login onLogin={() => setAuthed(true)} />
  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/join/:circleId" element={<JoinCircle />} />
        <Route path="*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
