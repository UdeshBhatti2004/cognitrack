import { useState, useRef, useEffect } from 'react'

// Generate a 3x3 grid puzzle with scrambled pieces
const GRID_SIZE = 3
const PIECE_SIZE = 100

function generatePuzzle() {
  const pieces = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
    id: i,
    correctPos: i,
    currentPos: i,
  }))
  // Shuffle
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pieces[i].currentPos, pieces[j].currentPos] = [pieces[j].currentPos, pieces[i].currentPos]
  }
  return pieces
}

// SVG shapes for each cell position
const SHAPES = [
  { shape: 'circle', color: '#4f9cf9', x: 30, y: 30, r: 25 },
  { shape: 'rect', color: '#7c3aed', x: 10, y: 10, w: 60, h: 60 },
  { shape: 'triangle', color: '#10b981', points: '50,5 95,90 5,90' },
  { shape: 'star', color: '#f59e0b', cx: 50, cy: 50, outerR: 35, innerR: 15 },
  { shape: 'cross', color: '#ef4444' },
  { shape: 'diamond', color: '#06b6d4', points: '50,5 95,50 50,95 5,50' },
  { shape: 'hexagon', color: '#8b5cf6', cx: 50, cy: 50, r: 40 },
  { shape: 'circle', color: '#f97316', x: 30, y: 30, r: 25 },
  { shape: 'rect', color: '#84cc16', x: 10, y: 10, w: 60, h: 60 },
]

function ShapeSVG({ shapeData, size = 100 }) {
  const s = shapeData
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#0a0e1a" />
      {s.shape === 'circle' && <circle cx="50" cy="50" r={s.r} fill={s.color} />}
      {s.shape === 'rect' && <rect x={s.x} y={s.y} width={s.w} height={s.h} fill={s.color} />}
      {s.shape === 'triangle' && <polygon points={s.points} fill={s.color} />}
      {s.shape === 'diamond' && <polygon points={s.points} fill={s.color} />}
      {s.shape === 'star' && (
        <polygon
          points={Array.from({ length: 10 }, (_, i) => {
            const angle = (i * 36 - 90) * Math.PI / 180
            const r = i % 2 === 0 ? s.outerR : s.innerR
            return `${s.cx + r * Math.cos(angle)},${s.cy + r * Math.sin(angle)}`
          }).join(' ')}
          fill={s.color}
        />
      )}
      {s.shape === 'cross' && (
        <>
          <rect x="35" y="10" width="30" height="80" fill={s.color} />
          <rect x="10" y="35" width="80" height="30" fill={s.color} />
        </>
      )}
      {s.shape === 'hexagon' && (
        <polygon
          points={Array.from({ length: 6 }, (_, i) => {
            const angle = (i * 60 - 30) * Math.PI / 180
            return `${s.cx + s.r * Math.cos(angle)},${s.cy + s.r * Math.sin(angle)}`
          }).join(' ')}
          fill={s.color}
        />
      )}
    </svg>
  )
}

export default function VisuospatialTask({ onComplete }) {
  const [phase, setPhase] = useState('study') // study | scrambled | done
  const [pieces, setPieces] = useState(() => generatePuzzle())
  const [selected, setSelected] = useState(null)
  const [moves, setMoves] = useState(0)
  const [studyTimer, setStudyTimer] = useState(5)
  const startTimeRef = useRef(null)
  const correctOrderRef = useRef(SHAPES)

  // Study phase countdown
  useEffect(() => {
    if (phase !== 'study') return
    if (studyTimer <= 0) { setPhase('scrambled'); startTimeRef.current = Date.now(); return }
    const t = setTimeout(() => setStudyTimer(d => d - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, studyTimer])

  function handlePieceClick(pos) {
    if (selected === null) {
      setSelected(pos)
    } else {
      if (selected === pos) { setSelected(null); return }
      // Swap
      const newPieces = [...pieces]
      const a = newPieces.findIndex(p => p.currentPos === selected)
      const b = newPieces.findIndex(p => p.currentPos === pos)
      ;[newPieces[a].currentPos, newPieces[b].currentPos] = [newPieces[b].currentPos, newPieces[a].currentPos]
      setPieces(newPieces)
      setSelected(null)
      setMoves(m => m + 1)
    }
  }

  function checkComplete() {
    const correct = pieces.every(p => p.currentPos === p.correctPos)
    const completionTime = Date.now() - startTimeRef.current
    const maxMoves = GRID_SIZE * GRID_SIZE * 2
    const movesScore = Math.max(0, 100 - Math.max(0, moves - (GRID_SIZE * GRID_SIZE - 1)) * 5)

    onComplete({
      score: correct ? Math.round(movesScore * 0.7 + (Math.max(0, 1 - completionTime / 120000)) * 30) : Math.round(movesScore * 0.4),
      accuracy: correct ? 100 : Math.round((pieces.filter(p => p.currentPos === p.correctPos).length / pieces.length) * 100),
      completionTime,
      avgResponseTime: Math.round(completionTime / Math.max(moves, 1)),
      errorRate: Math.round((moves / maxMoves) * 100),
      consistency: correct ? 100 : 50,
    })
    setPhase('done')
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${GRID_SIZE}, ${PIECE_SIZE}px)`,
    gap: '3px',
    background: '#1f2d45',
    padding: '3px',
    borderRadius: '8px',
  }

  if (phase === 'study') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem' }}>
      <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center' }}>
        Study this pattern. You'll need to reconstruct it after it's scrambled.
      </p>
      <div style={{ ...gridStyle, marginBottom: '1rem' }}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
          <ShapeSVG key={i} shapeData={SHAPES[i]} size={PIECE_SIZE} />
        ))}
      </div>
      <div style={{ color: '#4f9cf9', fontFamily: 'DM Mono, monospace', fontSize: '1.5rem', fontWeight: 700 }}>
        {studyTimer}s
      </div>
    </div>
  )

  if (phase === 'scrambled') {
    const sortedByPosition = [...pieces].sort((a, b) => a.currentPos - b.currentPos)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem' }}>
        <p style={{ color: '#64748b', marginBottom: '0.5rem', textAlign: 'center' }}>
          Tap two pieces to swap them. Reconstruct the original pattern.
        </p>
        <p style={{ color: '#334155', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Moves: {moves}</p>
        <div style={gridStyle}>
          {sortedByPosition.map((piece, displayPos) => (
            <div
              key={piece.id}
              onClick={() => handlePieceClick(displayPos)}
              style={{
                cursor: 'pointer',
                outline: selected === displayPos ? '3px solid #4f9cf9' : 'none',
                opacity: piece.currentPos === piece.correctPos ? 1 : 0.85,
                transition: 'all 0.2s',
              }}
            >
              <ShapeSVG shapeData={SHAPES[piece.id]} size={PIECE_SIZE} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={checkComplete} style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none', borderRadius: '8px', color: '#fff',
            padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer'
          }}>
            Done ✓
          </button>
          <button onClick={checkComplete} style={{
            background: '#1f2d45', border: '1px solid #2d3f58',
            borderRadius: '8px', color: '#64748b',
            padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer'
          }}>
            Give Up
          </button>
        </div>
        {selected !== null && <p style={{ marginTop: '1rem', color: '#4f9cf9', fontSize: '0.85rem' }}>Piece selected — tap another to swap</p>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <p style={{ color: '#64748b' }}>Saving results...</p>
    </div>
  )
}
