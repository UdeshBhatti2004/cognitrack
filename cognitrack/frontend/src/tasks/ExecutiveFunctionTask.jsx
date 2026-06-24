import { useState, useRef, useCallback } from 'react'

// Pattern matching: shown a row of mixed shapes, must identify if pattern matches rule
// Red = circle (○), Green = square (□) — from notes
// Rule: Does the sequence follow the pattern shown?

const SHAPES_SET = ['○', '□']
const COLORS = { '○': '#ef4444', '□': '#10b981' }

function generateSequence(length = 4) {
  return Array.from({ length }, () => SHAPES_SET[Math.floor(Math.random() * SHAPES_SET.length)])
}

function generateTrial() {
  const target = generateSequence(3) // 3-shape pattern to match
  const isMatch = Math.random() > 0.5

  let stimulus
  if (isMatch) {
    // Start with target sequence then more shapes
    stimulus = [...target, ...generateSequence(2)]
  } else {
    // Generate something different
    stimulus = generateSequence(5)
    // Ensure at least one difference from target
    const diff = Math.floor(Math.random() * 3)
    stimulus[diff] = stimulus[diff] === '○' ? '□' : '○'
  }

  return { target, stimulus, isMatch }
}

const TOTAL_TRIALS = 16

export default function ExecutiveFunctionTask({ onComplete }) {
  const [phase, setPhase] = useState('intro')
  const [trials] = useState(() => Array.from({ length: TOTAL_TRIALS }, generateTrial))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState([])
  const [feedback, setFeedback] = useState(null)
  const startTimeRef = useRef(null)

  const handleAnswer = useCallback((answer) => {
    if (feedback) return
    const rt = Date.now() - startTimeRef.current
    const correct = answer === trials[currentIdx].isMatch
    setFeedback(correct ? 'correct' : 'wrong')
    const newResults = [...results, { correct, responseTime: rt }]
    setResults(newResults)

    setTimeout(() => {
      setFeedback(null)
      if (currentIdx + 1 >= TOTAL_TRIALS) {
        const correctCount = newResults.filter(r => r.correct).length
        const rts = newResults.map(r => r.responseTime)
        const avgRT = Math.round(rts.reduce((a, b) => a + b, 0) / rts.length)
        const accuracy = Math.round((correctCount / TOTAL_TRIALS) * 100)
        const consistency = Math.max(0, Math.round(100 - (rts.reduce((a, b) => a + b, 0) / rts.length) / 20))

        onComplete({
          score: Math.round(accuracy * 0.7 + consistency * 0.3),
          accuracy,
          avgResponseTime: avgRT,
          completionTime: rts.reduce((a, b) => a + b, 0),
          errorRate: 100 - accuracy,
          consistency,
        })
        setPhase('done')
      } else {
        setCurrentIdx(i => i + 1)
        startTimeRef.current = Date.now()
      }
    }, 500)
  }, [currentIdx, feedback, results, trials, onComplete])

  const current = trials[currentIdx]

  const ShapeRow = ({ shapes, size = 'lg' }) => (
    <div style={{ display: 'flex', gap: size === 'lg' ? '1rem' : '0.5rem', alignItems: 'center' }}>
      {shapes.map((s, i) => (
        <span key={i} style={{
          fontSize: size === 'lg' ? '2.5rem' : '1.5rem',
          color: COLORS[s],
          fontFamily: 'DM Mono, monospace',
          lineHeight: 1,
        }}>{s}</span>
      ))}
    </div>
  )

  if (phase === 'intro') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem' }}>
      <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '2rem', maxWidth: '520px', width: '100%' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.3rem' }}>⚙️ Executive Function Task</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
          A <strong style={{ color: '#e2e8f0' }}>target pattern</strong> will be shown at top. Then a longer sequence appears below.
        </p>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
          Judge: does the sequence <em>start with</em> the target pattern? Press <span style={{ color: '#10b981', fontWeight: 700 }}>YES</span> or <span style={{ color: '#ef4444', fontWeight: 700 }}>NO</span>.
        </p>

        <div style={{ background: '#0a0e1a', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Example:</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>Target:</div>
          <ShapeRow shapes={['○', '□', '○']} size="sm" />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>Sequence:</div>
          <ShapeRow shapes={['○', '□', '○', '□', '□']} size="sm" />
          <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.5rem' }}>→ YES (starts with target)</div>
        </div>

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
      <div style={{ color: '#334155', fontSize: '0.85rem', marginBottom: '2rem' }}>
        {currentIdx + 1} / {TOTAL_TRIALS}
      </div>

      <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%', marginBottom: '2rem' }}>
        {/* Target */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Target Pattern
          </div>
          <div style={{ background: '#0a0e1a', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center' }}>
            <ShapeRow shapes={current.target} />
          </div>
        </div>

        {/* Sequence */}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sequence
          </div>
          <div style={{
            background: feedback === 'correct' ? '#0d2b1e' : feedback === 'wrong' ? '#2b0d0d' : '#0a0e1a',
            border: `1px solid ${feedback === 'correct' ? '#10b981' : feedback === 'wrong' ? '#ef4444' : '#1f2d45'}`,
            borderRadius: '10px', padding: '1rem',
            display: 'flex', alignItems: 'center',
            transition: 'all 0.15s'
          }}>
            <ShapeRow shapes={current.stimulus} />
          </div>
        </div>
      </div>

      {/* Answer buttons */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <button
          onClick={() => handleAnswer(true)}
          style={{
            padding: '1rem 2.5rem', borderRadius: '12px', border: 'none',
            background: '#0d2b1e', color: '#10b981', fontWeight: 700, fontSize: '1.1rem',
            cursor: 'pointer', border: '2px solid #10b981'
          }}
        >
          ✓ YES
        </button>
        <button
          onClick={() => handleAnswer(false)}
          style={{
            padding: '1rem 2.5rem', borderRadius: '12px', border: 'none',
            background: '#2b0d0d', color: '#ef4444', fontWeight: 700, fontSize: '1.1rem',
            cursor: 'pointer', border: '2px solid #ef4444'
          }}
        >
          ✗ NO
        </button>
      </div>

      {feedback && (
        <div style={{ marginTop: '1.5rem', color: feedback === 'correct' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
          {feedback === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <p style={{ color: '#64748b' }}>Saving...</p>
    </div>
  )
}
