export default function LandingPage({ onStart }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1e35 50%, #0a0e1a 100%)' }}>

      {/* Brain wave SVG */}
      <div style={{ marginBottom: '2rem' }}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="36" fill="#111827" />
          <path d="M12 36 Q18 24 24 36 Q30 48 36 36 Q42 24 48 36 Q54 48 60 36" stroke="#4f9cf9" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <circle cx="36" cy="36" r="4" fill="#7c3aed" />
        </svg>
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: '0.5rem' }}>
        Cogni<span style={{ color: '#4f9cf9' }}>Track</span>
      </h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', textAlign: 'center', maxWidth: '480px', marginBottom: '3rem', lineHeight: 1.7 }}>
        Early cognitive health monitoring through interactive assessments. Track memory, attention, processing speed and more — over time.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
        {[
          { icon: '🧠', label: 'Memory' },
          { icon: '⚡', label: 'Attention' },
          { icon: '🔷', label: 'Processing' },
          { icon: '🧩', label: 'Visuospatial' },
          { icon: '⚙️', label: 'Executive' },
        ].map(d => (
          <div key={d.label} style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>{d.icon}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{d.label}</div>
          </div>
        ))}
      </div>

      <button onClick={onStart} style={{
        background: 'linear-gradient(135deg, #4f9cf9, #7c3aed)',
        border: 'none', borderRadius: '12px', color: '#fff',
        padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 600,
        cursor: 'pointer', letterSpacing: '0.01em',
        boxShadow: '0 0 30px rgba(79,156,249,0.3)'
      }}>
        Get Started →
      </button>

      <p style={{ marginTop: '1.5rem', color: '#334155', fontSize: '0.85rem' }}>
        Free · No medical advice · For research & awareness
      </p>
    </div>
  )
}
