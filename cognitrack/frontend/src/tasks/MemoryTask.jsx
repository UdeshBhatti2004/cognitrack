import { useState, useEffect, useRef } from 'react'

const WORD_LISTS = [
  ['APPLE', 'RIVER', 'DOCTOR', 'CHAIR', 'SUNSET'],
  ['BRIDGE', 'CLOUD', 'MUSIC', 'GARDEN', 'STONE'],
  ['CASTLE', 'PHONE', 'FOREST', 'BUTTER', 'WINDOW'],
]

const CARD = { background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '2rem', maxWidth: '560px', margin: '0 auto' }

export default function MemoryTask({ onComplete }) {
  const [phase, setPhase] = useState('study') // study | distractor | recall | delay | delayRecall
  const [words] = useState(WORD_LISTS[Math.floor(Math.random() * WORD_LISTS.length)])
  const [showIdx, setShowIdx] = useState(0)
  const [input, setInput] = useState('')
  const [immediateAnswers, setImmediateAnswers] = useState([])
  const [delayedAnswers, setDelayedAnswers] = useState([])
  const [countdown, setCountdown] = useState(3)
  const [delayTimer, setDelayTimer] = useState(30)
  const startTimeRef = useRef(Date.now())
  const inputRef = useRef()

  // Show words one by one
  useEffect(() => {
    if (phase !== 'study') return
    if (showIdx >= words.length) {
      setTimeout(() => { setPhase('recall'); startTimeRef.current = Date.now() }, 1000)
      return
    }
    const t = setTimeout(() => setShowIdx(i => i + 1), 1500)
    return () => clearTimeout(t)
  }, [phase, showIdx, words.length])

  // Delay countdown
  useEffect(() => {
    if (phase !== 'delay') return
    if (delayTimer <= 0) { setPhase('delayRecall'); setInput(''); return }
    const t = setTimeout(() => setDelayTimer(d => d - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, delayTimer])

  function submitImmediate() {
    const answers = input.toUpperCase().split(/[\s,]+/).filter(Boolean)
    setImmediateAnswers(answers)
    setInput('')
    setPhase('delay')
  }

  function submitDelayed() {
    const answers = input.toUpperCase().split(/[\s,]+/).filter(Boolean)
    setDelayedAnswers(answers)

    const immScore = words.filter(w => immediateAnswers.includes(w)).length
    const delScore = words.filter(w => answers.includes(w)).length
    const recallTime = Date.now() - startTimeRef.current

    onComplete({
      score: Math.round(((immScore + delScore) / (words.length * 2)) * 100),
      accuracy: Math.round((immScore / words.length) * 100),
      immediateRecall: immScore,
      delayedRecall: delScore,
      incorrectWords: words.length - immScore,
      avgResponseTime: recallTime,
      completionTime: recallTime,
      errorRate: Math.round(((words.length - immScore) / words.length) * 100),
      consistency: Math.round((Math.min(immScore, delScore) / words.length) * 100),
    })
  }

  const btnStyle = {
    background: 'linear-gradient(135deg, #4f9cf9, #7c3aed)',
    border: 'none', borderRadius: '8px', color: '#fff',
    padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
  }

  if (phase === 'study') return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <p style={{ color: '#64748b', marginBottom: '2rem', textAlign: 'center' }}>Memorize these 5 words. They will disappear shortly.</p>
      <div style={{ ...CARD, textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {words.map((w, i) => (
            <div key={w} style={{
              padding: '0.75rem 1.25rem', borderRadius: '10px',
              background: i < showIdx ? '#1a2236' : '#0a0e1a',
              border: `1px solid ${i < showIdx ? '#4f9cf9' : '#1f2d45'}`,
              color: i < showIdx ? '#4f9cf9' : '#334155',
              fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em',
              fontFamily: 'DM Mono, monospace', transition: 'all 0.3s'
            }}>
              {i < showIdx ? w : '?????'}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
          Word {Math.min(showIdx, words.length)} of {words.length}
        </div>
      </div>
    </div>
  )

  if (phase === 'recall') return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div style={CARD}>
        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.3rem' }}>🧠 Immediate Recall</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Type all the words you remember, separated by spaces or commas.</p>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          autoFocus
          placeholder="e.g. APPLE RIVER DOCTOR"
          style={{
            width: '100%', minHeight: '100px', background: '#0a0e1a',
            border: '1px solid #1f2d45', borderRadius: '8px', color: '#e2e8f0',
            padding: '0.75rem', fontSize: '1rem', fontFamily: 'DM Mono, monospace',
            resize: 'none', outline: 'none'
          }}
        />
        <button onClick={submitImmediate} style={{ ...btnStyle, width: '100%', marginTop: '1rem' }}>
          Submit →
        </button>
      </div>
    </div>
  )

  if (phase === 'delay') return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div style={{ ...CARD, textAlign: 'center' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>⏳ Short Break</h3>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>Wait before delayed recall test. Count backwards from 20 in your head.</p>
        <div style={{ fontSize: '3rem', fontWeight: 700, color: '#4f9cf9', fontFamily: 'DM Mono, monospace' }}>
          {delayTimer}s
        </div>
        <div style={{ height: '4px', background: '#1f2d45', borderRadius: '2px', marginTop: '1rem' }}>
          <div style={{ height: '100%', width: `${(1 - delayTimer / 30) * 100}%`, background: '#4f9cf9', borderRadius: '2px', transition: 'width 1s' }} />
        </div>
      </div>
    </div>
  )

  if (phase === 'delayRecall') return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div style={CARD}>
        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.3rem' }}>🧠 Delayed Recall</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Now type the same words again from memory.</p>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          autoFocus
          placeholder="e.g. APPLE RIVER DOCTOR"
          style={{
            width: '100%', minHeight: '100px', background: '#0a0e1a',
            border: '1px solid #1f2d45', borderRadius: '8px', color: '#e2e8f0',
            padding: '0.75rem', fontSize: '1rem', fontFamily: 'DM Mono, monospace',
            resize: 'none', outline: 'none'
          }}
        />
        <button onClick={submitDelayed} style={{ ...btnStyle, width: '100%', marginTop: '1rem' }}>
          Submit Final Answer →
        </button>
      </div>
    </div>
  )
}
