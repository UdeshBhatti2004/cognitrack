import { useState } from 'react'
import axios from 'axios'
import MemoryTask from '../tasks/MemoryTask'
import AttentionTask from '../tasks/AttentionTask'
import VisuospatialTask from '../tasks/VisuospatialTask'
import ProcessingSpeedTask from '../tasks/ProcessingSpeedTask'
import ExecutiveFunctionTask from '../tasks/ExecutiveFunctionTask'

const API = import.meta.env.VITE_API_URL + '/api'

const TASKS = [
  { id: 'memory', label: 'Memory', icon: '🧠', component: MemoryTask },
  { id: 'attention', label: 'Attention', icon: '⚡', component: AttentionTask },
  { id: 'visuospatial', label: 'Visuospatial', icon: '🧩', component: VisuospatialTask },
  { id: 'processingSpeed', label: 'Processing Speed', icon: '🔷', component: ProcessingSpeedTask },
  { id: 'executiveFunction', label: 'Executive Function', icon: '⚙️', component: ExecutiveFunctionTask },
]

export default function AssessmentPage({ user, onComplete, onCancel }) {
  const [currentIdx, setCurrentIdx] = useState(-1) // -1 = intro
  const [results, setResults] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [totalScore, setTotalScore] = useState(0)

  function handleTaskComplete(taskId, data) {
    const newResults = { ...results, [taskId]: data }
    setResults(newResults)

    if (currentIdx < TASKS.length - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      submitAssessment(newResults)
    }
  }

  async function submitAssessment(domains) {
    setSubmitting(true)
    const token = localStorage.getItem('cognitrack_token')
    try {
      const sessionId = 'session_' + Date.now()
      const { data } = await axios.post(
        API + '/assessment/submit',
        { sessionId, domains },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTotalScore(data.assessment.totalScore)
      setDone(true)
    } catch (err) {
      console.error('Submit failed:', err)
      setDone(true)
      setTotalScore(Math.round(Object.values(domains).reduce((a, d) => a + (d.score || 0), 0) / Object.keys(domains).length))
    } finally {
      setSubmitting(false)
    }
  }

  // Done screen
  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Assessment Complete!</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your cognitive profile has been saved.</p>

        <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', fontWeight: 700, color: totalScore >= 70 ? '#10b981' : totalScore >= 50 ? '#f59e0b' : '#ef4444' }}>
            {totalScore}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>out of 100</div>
          <div style={{ marginTop: '1rem', color: totalScore >= 70 ? '#10b981' : totalScore >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
            {totalScore >= 70 ? 'Good Performance' : totalScore >= 50 ? 'Moderate Performance' : 'Needs Attention'}
          </div>
        </div>

        <button onClick={onComplete} style={{
          background: 'linear-gradient(135deg, #4f9cf9, #7c3aed)',
          border: 'none', borderRadius: '12px', color: '#fff',
          padding: '1rem 2rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%'
        }}>
          View Dashboard →
        </button>
      </div>
    </div>
  )

  // Intro screen
  if (currentIdx === -1) return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '3rem' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.9rem' }}>
          ← Cancel
        </button>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Cognitive Assessment</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Complete 5 tasks in sequence. Each takes 1–3 minutes. Don't close the tab during assessment.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {TASKS.map((t, i) => (
            <div key={t.id} style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{t.label}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Task {i + 1} of {TASKS.length}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setCurrentIdx(0)} style={{
          background: 'linear-gradient(135deg, #4f9cf9, #7c3aed)',
          border: 'none', borderRadius: '12px', color: '#fff',
          padding: '1rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%'
        }}>
          Start Assessment →
        </button>
      </div>
    </div>
  )

  // Active task
  if (submitting) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#64748b' }}>Analyzing your results...</p>
      </div>
    </div>
  )

  const CurrentTask = TASKS[currentIdx].component
  const progress = ((currentIdx) / TASKS.length) * 100

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a' }}>
      {/* Progress bar */}
      <div style={{ height: '3px', background: '#1f2d45' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #4f9cf9, #7c3aed)', transition: 'width 0.5s' }} />
      </div>

      {/* Header */}
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #1f2d45', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{TASKS[currentIdx].icon}</span>
          <span style={{ fontWeight: 600 }}>{TASKS[currentIdx].label}</span>
        </div>
        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Task {currentIdx + 1} / {TASKS.length}</span>
      </div>

      <CurrentTask onComplete={(data) => handleTaskComplete(TASKS[currentIdx].id, data)} />
    </div>
  )
}
