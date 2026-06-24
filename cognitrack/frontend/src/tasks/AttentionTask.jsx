import { useState, useEffect, useRef, useCallback } from 'react'

const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWXYZ'.split('')
const TARGET = 'G'
const TOTAL_STIMULI = 20
const STIMULUS_DURATION = 800  // ms visible
const ISI = 700  // inter-stimulus interval

function randomLetter() {
  // Target appears ~30% of time
  if (Math.random() < 0.3) return TARGET
  const others = LETTERS.filter(l => l !== TARGET)
  return others[Math.floor(Math.random() * others.length)]
}

export default function AttentionTask({ onComplete }) {
  const [phase, setPhase] = useState('intro') // intro | running | done
  const [current, setCurrent] = useState(null)
  const [visible, setVisible] = useState(false)
  const [idx, setIdx] = useState(0)
  const [stimuli] = useState(() => Array.from({ length: TOTAL_STIMULI }, randomLetter))

  const responsesRef = useRef([]) // { stimulusIdx, letter, isTarget, reacted, reactionTime, timestamp }
  const stimulusStartRef = useRef(null)
  const hasRespondedRef = useRef(false)

  const runStimulus = useCallback((i) => {
    if (i >= TOTAL_STIMULI) {
      // Compute results
      const responses = responsesRef.current
      const targets = stimuli.filter(s => s === TARGET).length
      const hits = responses.filter(r => r.isTarget && r.reacted).length
      const falseClicks = responses.filter(r => !r.isTarget && r.reacted).length
      const missedTargets = targets - hits
      const reactionTimes = responses.filter(r => r.reacted && r.reactionTime > 0).map(r => r.reactionTime)
      const avgRT = reactionTimes.length ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 800
      const accuracy = targets > 0 ? Math.round((hits / targets) * 100) : 0

      // Consistency: variance in reaction times
      const variance = reactionTimes.length > 1
        ? reactionTimes.reduce((acc, rt) => acc + Math.pow(rt - avgRT, 2), 0) / reactionTimes.length
        : 0
      const consistency = Math.max(0, Math.round(100 - Math.sqrt(variance) / 10))

      onComplete({
        score: Math.round((accuracy * 0.5) + (Math.max(0, 100 - falseClicks * 10) * 0.3) + (consistency * 0.2)),
        accuracy,
        avgResponseTime: avgRT,
        completionTime: TOTAL_STIMULI * (STIMULUS_DURATION + ISI),
        errorRate: Math.round((missedTargets / Math.max(targets, 1)) * 100),
        consistency,
        missedTargets,
        falseClicks,
      })
      setPhase('done')
      return
    }

    hasRespondedRef.current = false
    setCurrent(stimuli[i])
    setIdx(i)
    setVisible(true)
    stimulusStartRef.current = Date.now()

    setTimeout(() => {
      setVisible(false)
      // Record missed target if no response
      if (!hasRespondedRef.current && stimuli[i] === TARGET) {
        responsesRef.current.push({ stimulusIdx: i, letter: stimuli[i], isTarget: true, reacted: false, reactionTime: 0 })
      }
      setTimeout(() => runStimulus(i + 1), ISI)
    }, STIMULUS_DURATION)
  }, [stimuli, onComplete])

  function handleResponse() {
    if (!visible || hasRespondedRef.current) return
    hasRespondedRef.current = true
    const rt = Date.now() - stimulusStartRef.current
    responsesRef.current.push({
      stimulusIdx: idx,
      letter: current,
      isTarget: current === TARGET,
      reacted: true,
      reactionTime: rt,
    })
  }

  useEffect(() => {
    if (phase !== 'running') return
    runStimulus(0)
  }, [phase, runStimulus])

  const btnStyle = {
    background: 'linear-gradient(135deg, #4f9cf9, #7c3aed)',
    border: 'none', borderRadius: '8px', color: '#fff',
    padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
  }

  if (phase === 'intro') return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.3rem' }}>⚡ Attention Task</h3>
        <div style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.8 }}>
          <p>Letters will flash on screen one at a time.</p>
          <p style={{ marginTop: '0.5rem' }}>
            Press <span style={{ color: '#4f9cf9', fontWeight: 700 }}>SPACE or tap the button</span> only when you see the letter <span style={{ color: '#4f9cf9', fontWeight: 700, fontFamily: 'DM Mono, monospace', fontSize: '1.2rem' }}>G</span>.
          </p>
          <p style={{ marginTop: '0.5rem' }}>Do NOT press for any other letter. Be as fast and accurate as possible.</p>
        </div>
        <button onClick={() => setPhase('running')} style={{ ...btnStyle, width: '100%' }}>
          Start Task →
        </button>
      </div>
    </div>
  )

  if (phase === 'running') return (
    <div
      style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      onClick={handleResponse}
      onKeyDown={e => e.code === 'Space' && handleResponse()}
      tabIndex={0}
    >
      <div style={{ marginBottom: '2rem', color: '#334155', fontSize: '0.85rem' }}>
        {idx + 1} / {TOTAL_STIMULI}
      </div>

      <div style={{
        width: '160px', height: '160px', borderRadius: '50%',
        background: visible ? '#1a2236' : '#0d1525',
        border: `3px solid ${visible ? '#4f9cf9' : '#1f2d45'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '5rem', fontWeight: 700, color: '#e2e8f0',
        fontFamily: 'DM Mono, monospace',
        transition: 'all 0.1s',
        boxShadow: visible ? '0 0 40px rgba(79,156,249,0.2)' : 'none'
      }}>
        {visible ? current : ''}
      </div>

      <button
        onClick={handleResponse}
        style={{ ...btnStyle, marginTop: '2.5rem', padding: '1rem 3rem', fontSize: '1.1rem' }}
      >
        TAP (or Space) when you see G
      </button>

      <p style={{ marginTop: '1rem', color: '#334155', fontSize: '0.8rem' }}>Click anywhere or press Space</p>
    </div>
  )

  if (phase === 'done') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <p style={{ color: '#64748b' }}>Processing results...</p>
    </div>
  )
}
