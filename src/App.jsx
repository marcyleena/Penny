import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import MobileNav from './components/layout/MobileNav'
import AskPenny from './components/penny/AskPenny'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Budget from './pages/Budget'
import Transactions from './pages/Transactions'
import Debts from './pages/Debts'
import Savings from './pages/Savings'
import SinkingFunds from './pages/SinkingFunds'
import Bills from './pages/Bills'
import Subscriptions from './pages/Subscriptions'
import NetWorth from './pages/NetWorth'
import Annual from './pages/Annual'
import Settings from './pages/Settings'
import { getStored, setStored } from './hooks/useStorage'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

function AppShell() {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 800 }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(61,43,107,0.4)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile topbar */}
        {isMobile && (
          <div style={{
            background: 'var(--plum)', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 400,
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: 0 }}>☰</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🪙</div>
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
            <Route path="/savings" element={<Savings />} />
            <Route path="/sinking-funds" element={<SinkingFunds />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/net-worth" element={<NetWorth />} />
            <Route path="/annual" element={<Annual />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {isMobile && <MobileNav />}
      </div>

      <AskPenny />
    </div>
  )
}

function App() {
  const [authed, setAuthed] = useState(() => !!getStored('penny_email'))
  const [onboarded, setOnboarded] = useState(() => !!getStored('penny_onboarded'))

  if (!authed) return <Login onLogin={() => setAuthed(true)} />
  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} />

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
