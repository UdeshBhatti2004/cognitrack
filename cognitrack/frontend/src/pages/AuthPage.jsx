import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem',
  background: '#111827', border: '1px solid #1f2d45', borderRadius: '8px',
  color: '#e2e8f0', fontSize: '0.95rem', outline: 'none',
  transition: 'border-color 0.2s'
}

const labelStyle = { fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '0.4rem', display: 'block' }

export default function AuthPage({ onLogin, onBack }) {
  const [mode, setMode] = useState('login') // login | register
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, age: parseInt(form.age) }

      const { data } = await axios.post(API + endpoint, payload)
      onLogin(data.user, data.token)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: '#0a0e1a' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.9rem' }}>
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <svg width="32" height="32" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="36" fill="#111827" />
            <path d="M12 36 Q18 24 24 36 Q30 48 36 36 Q42 24 48 36 Q54 48 60 36" stroke="#4f9cf9" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <circle cx="36" cy="36" r="4" fill="#7c3aed" />
          </svg>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>CogniTrack</h2>
        </div>

        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' }}>
          {mode === 'login' ? 'Welcome back. Sign in to continue.' : 'Create your account to start tracking.'}
        </p>

        <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '2rem' }}>
          {/* Toggle */}
          <div style={{ display: 'flex', background: '#0a0e1a', borderRadius: '8px', padding: '4px', marginBottom: '1.5rem' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '0.5rem', border: 'none', borderRadius: '6px',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                background: mode === m ? '#4f9cf9' : 'transparent',
                color: mode === m ? '#fff' : '#64748b'
              }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
            )}

            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>

            {mode === 'register' && (
              <div>
                <label style={labelStyle}>Age</label>
                <input style={inputStyle} type="number" placeholder="e.g. 45" min="18" max="100" value={form.age} onChange={e => set('age', e.target.value)} required />
              </div>
            )}

            {error && (
              <div style={{ background: '#1a0a0a', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.75rem', color: '#ef4444', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: loading ? '#1f2d45' : 'linear-gradient(135deg, #4f9cf9, #7c3aed)',
              border: 'none', borderRadius: '8px', color: '#fff',
              padding: '0.875rem', fontSize: '1rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem'
            }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#334155', fontSize: '0.8rem' }}>
          This platform is for awareness only. Not a medical diagnostic tool.
        </p>
      </div>
    </div>
  )
}
