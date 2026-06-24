import { useState, useRef, useCallback } from 'react'

// Symbol → number mapping (from notes: □=1, △=2, ○=3, ★=4, +=5)
const SYMBOL_MAP = [
  { symbol: '□', label: 'Square', key: '1' },
  { symbol: '△', label: 'Triangle', key: '2' },
  { symbol: '○', label: 'Circle', key: '3' },
  { symbol: '★', label: 'Star', key: '4' },
  { symbol: '+', label: 'Plus', key: '5' },
]

const TOTAL_TRIALS = 20

function generateTrial() {
  return SYMBOL_MAP[Math.floor(Math.random() * SYMBOL_MAP.length)]
}

export default function ProcessingSpeedTask({ onComplete }) {
  const [phase, setPhase] = useState('intro') // intro | running | done
  const [trials] = useState(() => Array.from({ length: TOTAL_TRIALS }, generateTrial))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState([]) // { correct, responseTime }
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong'
  const startTimeRef = useRef(null)

  const handleAnswer = useCallback((key) => {
    if (feedback) return
    const rt = Date.now() - startTimeRef.current
    const correct = key === trials[currentIdx].key
    setFeedback(correct ? 'correct' : 'wrong')
    const newResults = [...results, { correct, responseTime: rt }]
    setResults(newResults)

    setTimeout(() => {
      setFeedback(null)
      if (currentIdx + 1 >= TOTAL_TRIALS) {
        // Compute scores
        const correct_count = newResults.filter(r => r.correct).length
        const rts = newResults.map(r => r.responseTime)
        const avgRT = Math.round(rts.reduce((a, b) => a + b, 0) / rts.length)
        const variance = rts.reduce((acc, rt) => acc + Math.pow(rt - avgRT, 2), 0) / rts.length
        const consistency = Math.max(0, Math.round(100 - Math.sqrt(variance) / 15))
        const accuracy = Math.round((correct_count / TOTAL_TRIALS) * 100)
        const itemsPerMinute = Math.round((TOTAL_TRIALS / (rts.reduce((a, b) => a + b, 0) / 1000)) * 60)

        onComplete({
          score: Math.round(accuracy * 0.6 + consistency * 0.4),
          accuracy,
          avgResponseTime: avgRT,
          completionTime: rts.reduce((a, b) => a + b, 0),
          errorRate: 100 - accuracy,
          consistency,
          itemsPerMinute,
        })
        setPhase('done')
      } else {
        setCurrentIdx(i => i + 1)
        startTimeRef.current = Date.now()
      }
    }, 400)
  }, [currentIdx, feedback, results, trials, onComplete])

  const current = trials[currentIdx]

  if (phase === 'intro') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem' }}>
      <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.3rem' }}>🔷 Processing Speed Task</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>A symbol will appear. Press the matching number as fast as you can.</p>

        <div style={{ background: '#0a0e1a', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {SYMBOL_MAP.map(s => (
              <div key={s.key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#4f9cf9', fontFamily: 'DM Mono, monospace' }}>{s.symbol}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Press {s.key}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {TOTAL_TRIALS} trials. Be as fast and accurate as possible.
        </p>

        <button onClick={() => { setPhase('running'); startTimeRef.current = Date.now() }} style={{
          background: 'linear-gradient(135deg, #4f9cf9, #7c3aed)',
          border: 'none', borderRadius: '8px', color: '#fff',
          padding: '0.875rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', width: '100%'
        }}>
          Start →
        </button>
      </div>
    </div>
  )

  if (phase === 'running') return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {/* Reference bar */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', background: '#111827', borderRadius: '10px', padding: '0.75rem 1.5rem' }}>
        {SYMBOL_MAP.map(s => (
          <div key={s.key} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', color: '#64748b', fontFamily: 'DM Mono, monospace' }}>{s.symbol}</div>
            <div style={{ fontSize: '0.7rem', color: '#334155' }}>{s.key}</div>
          </div>
        ))}
      </div>

      {/* Current symbol */}
      <div style={{
        width: '160px', height: '160px', borderRadius: '50%',
        background: feedback === 'correct' ? '#0d2b1e' : feedback === 'wrong' ? '#2b0d0d' : '#111827',
        border: `3px solid ${feedback === 'correct' ? '#10b981' : feedback === 'wrong' ? '#ef4444' : '#1f2d45'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '5rem', color: '#e2e8f0', fontFamily: 'DM Mono, monospace',
        transition: 'all 0.15s',
        marginBottom: '2rem',
      }}>
        {current.symbol}
      </div>

      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        {currentIdx + 1} / {TOTAL_TRIALS}
      </p>

      {/* Answer buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {SYMBOL_MAP.map(s => (
          <button
            key={s.key}
            onClick={() => handleAnswer(s.key)}
            style={{
              width: '60px', height: '60px', borderRadius: '10px',
              background: '#111827', border: '1px solid #1f2d45',
              color: '#e2e8f0', fontSize: '1.4rem',
              cursor: 'pointer', fontFamily: 'DM Mono, monospace',
              transition: 'background 0.1s',
            }}
          >
            {s.key}
          </button>
        ))}
      </div>

      {feedback && (
        <div style={{ marginTop: '1rem', color: feedback === 'correct' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
          {feedback === 'correct' ? '✓ Correct' : '✗ Wrong'}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <p style={{ color: '#64748b' }}>Processing...</p>
    </div>
  )
}
