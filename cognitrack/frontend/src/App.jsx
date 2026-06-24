import { useState, useEffect } from 'react'
import AuthPage from './pages/AuthPage'
import AssessmentPage from './pages/AssessmentPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('landing')

  useEffect(() => {
    const stored = localStorage.getItem('cognitrack_user')
    const token = localStorage.getItem('cognitrack_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      setPage('dashboard')
    }
  }, [])

  function handleLogin(userData, token) {
    localStorage.setItem('cognitrack_user', JSON.stringify(userData))
    localStorage.setItem('cognitrack_token', token)
    setUser(userData)
    setPage('dashboard')
  }

  function handleLogout() {
    localStorage.removeItem('cognitrack_user')
    localStorage.removeItem('cognitrack_token')
    setUser(null)
    setPage('landing')
  }

  if (page === 'landing') return <LandingPage onStart={() => setPage('auth')} />
  if (page === 'auth') return <AuthPage onLogin={handleLogin} onBack={() => setPage('landing')} />
  if (page === 'assessment') return (
    <AssessmentPage user={user} onComplete={() => setPage('dashboard')} onCancel={() => setPage('dashboard')} />
  )
  if (page === 'dashboard') return (
    <DashboardPage user={user} onStartAssessment={() => setPage('assessment')} onLogout={handleLogout} />
  )
}
