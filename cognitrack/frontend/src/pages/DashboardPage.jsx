import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const API = 'http://localhost:5000/api'

const DOMAIN_CONFIG = {
  memory: { label: 'Memory', icon: '🧠', color: '#4f9cf9' },
  attention: { label: 'Attention', icon: '⚡', color: '#7c3aed' },
  processingSpeed: { label: 'Processing Speed', icon: '🔷', color: '#10b981' },
  visuospatial: { label: 'Visuospatial', icon: '🧩', color: '#f59e0b' },
  executiveFunction: { label: 'Executive Function', icon: '⚙️', color: '#ef4444' },
}

function scoreColor(score) {
  if (score >= 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function scoreLabel(score) {
  if (score >= 75) return 'Good'
  if (score >= 50) return 'Moderate'
  return 'Needs Attention'
}

function StatCard({ label, value, unit = '', sub, color = '#4f9cf9' }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
      <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color, fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>
        {value}<span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#64748b', marginLeft: '3px' }}>{unit}</span>
      </div>
      {sub && <div style={{ color: '#334155', fontSize: '0.78rem', marginTop: '0.4rem' }}>{sub}</div>}
    </div>
  )
}

function DomainCard({ domainKey, data, score }) {
  const cfg = DOMAIN_CONFIG[domainKey]
  if (!cfg || !data) return null
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span>{cfg.icon}</span>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cfg.label}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: scoreColor(score) }}>{scoreLabel(score)}</div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: scoreColor(score), fontFamily: 'DM Mono, monospace' }}>{score}</div>
      </div>

      {/* Score bar */}
      <div style={{ height: '4px', background: '#1f2d45', borderRadius: '2px', marginBottom: '1rem' }}>
        <div style={{ height: '100%', width: `${score}%`, background: cfg.color, borderRadius: '2px', transition: 'width 1s' }} />
      </div>

      {/* Biomarkers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {data.accuracy != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>Accuracy</span>
            <span style={{ color: '#e2e8f0', fontFamily: 'DM Mono, monospace' }}>{data.accuracy}%</span>
          </div>
        )}
        {data.avgResponseTime != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>Avg Response Time</span>
            <span style={{ color: '#e2e8f0', fontFamily: 'DM Mono, monospace' }}>{data.avgResponseTime}ms</span>
          </div>
        )}
        {data.errorRate != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>Error Rate</span>
            <span style={{ color: data.errorRate > 30 ? '#ef4444' : '#e2e8f0', fontFamily: 'DM Mono, monospace' }}>{data.errorRate}%</span>
          </div>
        )}
        {data.consistency != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>Consistency</span>
            <span style={{ color: '#e2e8f0', fontFamily: 'DM Mono, monospace' }}>{data.consistency}</span>
          </div>
        )}
        {data.immediateRecall != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>Immediate Recall</span>
            <span style={{ color: '#e2e8f0', fontFamily: 'DM Mono, monospace' }}>{data.immediateRecall}/5</span>
          </div>
        )}
        {data.delayedRecall != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>Delayed Recall</span>
            <span style={{ color: '#e2e8f0', fontFamily: 'DM Mono, monospace' }}>{data.delayedRecall}/5</span>
          </div>
        )}
        {data.missedTargets != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>Missed Targets</span>
            <span style={{ color: data.missedTargets > 3 ? '#ef4444' : '#e2e8f0', fontFamily: 'DM Mono, monospace' }}>{data.missedTargets}</span>
          </div>
        )}
        {data.falseClicks != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>False Clicks</span>
            <span style={{ color: data.falseClicks > 3 ? '#ef4444' : '#e2e8f0', fontFamily: 'DM Mono, monospace' }}>{data.falseClicks}</span>
          </div>
        )}
        {data.itemsPerMinute != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748b' }}>Items / min</span>
            <span style={{ color: '#e2e8f0', fontFamily: 'DM Mono, monospace' }}>{data.itemsPerMinute}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage({ user, onStartAssessment, onLogout }) {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview') // overview | biomarkers | trend | history

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const token = localStorage.getItem('cognitrack_token')
    try {
      const [statsRes, histRes] = await Promise.all([
        axios.get(API + '/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API + '/assessment/history', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setStats(statsRes.data)
      setHistory(histRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sidebarStyle = {
    width: '220px', flexShrink: 0,
    background: '#111827', borderRight: '1px solid #1f2d45',
    display: 'flex', flexDirection: 'column', padding: '1.5rem 0',
    minHeight: '100vh'
  }

  const navItem = (id, icon, label) => (
    <button key={id} onClick={() => setTab(id)} style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1.5rem', background: tab === id ? '#1a2236' : 'none',
      border: 'none', borderLeft: tab === id ? '3px solid #4f9cf9' : '3px solid transparent',
      color: tab === id ? '#e2e8f0' : '#64748b', cursor: 'pointer',
      width: '100%', textAlign: 'left', fontWeight: 500, fontSize: '0.9rem',
      transition: 'all 0.15s'
    }}>
      <span>{icon}</span> {label}
    </button>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #1f2d45', borderTopColor: '#4f9cf9', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: '#64748b' }}>Loading your data...</p>
      </div>
    </div>
  )

  // Empty state
  if (!stats || stats.isEmpty) return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex' }}>
      <div style={sidebarStyle}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #1f2d45', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>CogniTrack</div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{user?.name}</div>
        </div>
        {navItem('overview', '📊', 'Overview')}
        {navItem('biomarkers', '🔬', 'Biomarkers')}
        {navItem('trend', '📈', 'Trend')}
        {navItem('history', '📋', 'History')}
        <div style={{ flex: 1 }} />
        <button onClick={onLogout} style={{ margin: '0 1rem', padding: '0.6rem', background: 'none', border: '1px solid #1f2d45', borderRadius: '8px', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}>
          Sign Out
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ fontSize: '3rem' }}>🧠</div>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem' }}>No assessments yet</h2>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '360px' }}>
          Take your first cognitive assessment to see your scores, domain breakdown, and behavioral biomarkers.
        </p>
        <button onClick={onStartAssessment} style={{
          background: 'linear-gradient(135deg, #4f9cf9, #7c3aed)',
          border: 'none', borderRadius: '12px', color: '#fff',
          padding: '1rem 2rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
        }}>
          Start First Assessment →
        </button>
      </div>
    </div>
  )

  const domains = stats.latestDomains || {}
  const biomarkers = stats.latestBiomarkers || {}

  // Build radar data
  const radarData = Object.entries(DOMAIN_CONFIG).map(([key, cfg]) => ({
    domain: cfg.label.split(' ')[0],
    score: domains[key]?.score || 0,
    fullMark: 100,
  }))

  // Trend chart data
  const trendData = (stats.trend || []).map((t, i) => ({
    session: `S${i + 1}`,
    Total: t.totalScore,
    Memory: t.memory,
    Attention: t.attention,
    Processing: t.processingSpeed,
  }))

  const mainContent = () => {
    if (tab === 'overview') return (
      <div>
        {/* Score summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '1.5rem', gridColumn: 'span 1' }}>
            <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Overall Score</div>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: scoreColor(stats.latestScore), fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>{stats.latestScore}</div>
            <div style={{ color: scoreColor(stats.latestScore), fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 600 }}>{scoreLabel(stats.latestScore)}</div>
            {stats.scoreDelta !== 0 && (
              <div style={{ color: stats.scoreDelta > 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                {stats.scoreDelta > 0 ? '▲' : '▼'} {Math.abs(stats.scoreDelta)} from last
              </div>
            )}
          </div>
          <StatCard label="Total Sessions" value={stats.totalSessions} sub="assessments completed" />
          <StatCard label="Reaction Time" value={Math.round(biomarkers.reactionTime || 0)} unit="ms" sub="avg response speed" color="#7c3aed" />
          <StatCard label="Error Rate" value={Math.round(biomarkers.errorRate || 0)} unit="%" sub="across all tasks" color={biomarkers.errorRate > 30 ? '#ef4444' : '#10b981'} />
        </div>

        {/* Radar + Domains grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Radar */}
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '1.5rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>COGNITIVE PROFILE</div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1f2d45" />
                <PolarAngleAxis dataKey="domain" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="#4f9cf9" fill="#4f9cf9" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Last assessment date + quick stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(DOMAIN_CONFIG).slice(0, 3).map(([key, cfg]) => (
              <div key={key} style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.4rem' }}>{cfg.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cfg.label}</div>
                  <div style={{ height: '4px', background: '#1f2d45', borderRadius: '2px', marginTop: '0.4rem' }}>
                    <div style={{ height: '100%', width: `${domains[key]?.score || 0}%`, background: cfg.color, borderRadius: '2px' }} />
                  </div>
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: scoreColor(domains[key]?.score || 0), minWidth: '32px', textAlign: 'right' }}>
                  {domains[key]?.score || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All 5 domain cards */}
        <div style={{ fontWeight: 600, marginBottom: '1rem', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Domain Breakdown</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {Object.entries(DOMAIN_CONFIG).map(([key]) => (
            <DomainCard key={key} domainKey={key} data={domains[key]} score={domains[key]?.score || 0} />
          ))}
        </div>
      </div>
    )

    if (tab === 'biomarkers') return (
      <div>
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Behavioral Biomarkers</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>Measurable patterns in your task performance — beyond raw scores.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Reaction Time" value={Math.round(biomarkers.reactionTime || 0)} unit="ms" sub="Avg across tasks" color="#4f9cf9" />
          <StatCard label="Error Rate" value={Math.round(biomarkers.errorRate || 0)} unit="%" sub="Across all tasks" color={biomarkers.errorRate > 30 ? '#ef4444' : '#10b981'} />
          <StatCard label="Consistency" value={Math.round(biomarkers.consistencyScore || 0)} unit="/100" sub="Response stability" color="#7c3aed" />
          <StatCard label="Variability" value={Math.round(biomarkers.responseVariability || 0)} unit="pts" sub="RT variance index" color="#f59e0b" />
        </div>

        {/* Detailed per-domain biomarkers */}
        <div style={{ fontWeight: 600, marginBottom: '1rem', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Per Domain</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Memory */}
          {domains.memory && (
            <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>🧠 Memory</div>
              {[
                ['Immediate Recall Score', `${domains.memory.immediateRecall || 0}/5`],
                ['Delayed Recall Score', `${domains.memory.delayedRecall || 0}/5`],
                ['Time Taken to Recall', `${domains.memory.avgResponseTime || 0}ms`],
                ['Incorrect Words', `${domains.memory.incorrectWords || 0}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #1a2236', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', color: '#e2e8f0' }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Attention */}
          {domains.attention && (
            <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>⚡ Attention</div>
              {[
                ['Reaction Time', `${domains.attention.avgResponseTime || 0}ms`],
                ['Missed Targets', `${domains.attention.missedTargets || 0}`],
                ['False Clicks', `${domains.attention.falseClicks || 0}`],
                ['Consistency', `${domains.attention.consistency || 0}/100`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #1a2236', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', color: '#e2e8f0' }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Processing Speed */}
          {domains.processingSpeed && (
            <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>🔷 Processing Speed</div>
              {[
                ['Avg Response Time', `${domains.processingSpeed.avgResponseTime || 0}ms`],
                ['Items Completed/min', `${domains.processingSpeed.itemsPerMinute || 0}`],
                ['Speed Consistency', `${domains.processingSpeed.consistency || 0}/100`],
                ['Accuracy', `${domains.processingSpeed.accuracy || 0}%`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #1a2236', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', color: '#e2e8f0' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )

    if (tab === 'trend') return (
      <div>
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Longitudinal Trend</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {trendData.length < 2 ? 'Complete more assessments to see trends over time.' : 'Performance changes across your last assessments.'}
        </p>

        {trendData.length >= 2 ? (
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '1.5rem' }}>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid stroke="#1f2d45" strokeDasharray="3 3" />
                <XAxis dataKey="session" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '8px', color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ color: '#64748b', fontSize: '0.8rem' }} />
                <Line type="monotone" dataKey="Total" stroke="#4f9cf9" strokeWidth={2.5} dot={{ fill: '#4f9cf9' }} />
                <Line type="monotone" dataKey="Memory" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="Attention" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="Processing" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '14px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
            <p style={{ color: '#64748b' }}>Take at least 2 assessments to see your trend line.</p>
          </div>
        )}
      </div>
    )

    if (tab === 'history') return (
      <div>
        <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Assessment History</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>Your last {history.length} assessment sessions.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.map((a, i) => (
            <div key={a._id} style={{ background: '#111827', border: '1px solid #1f2d45', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.75rem', fontWeight: 700, color: scoreColor(a.totalScore), minWidth: '48px' }}>
                {a.totalScore}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Session {history.length - i}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {new Date(a.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {Object.entries(DOMAIN_CONFIG).map(([key, cfg]) => (
                  a.domains?.[key] && (
                    <span key={key} style={{
                      background: '#0a0e1a', border: '1px solid #1f2d45',
                      borderRadius: '6px', padding: '0.2rem 0.6rem',
                      fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'DM Mono, monospace'
                    }}>
                      {cfg.icon} {a.domains[key].score}
                    </span>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #1f2d45', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <svg width="20" height="20" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="36" fill="#1a2236" />
              <path d="M12 36 Q18 24 24 36 Q30 48 36 36 Q42 24 48 36 Q54 48 60 36" stroke="#4f9cf9" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 700 }}>CogniTrack</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{user?.name}</div>
        </div>

        {navItem('overview', '📊', 'Overview')}
        {navItem('biomarkers', '🔬', 'Biomarkers')}
        {navItem('trend', '📈', 'Trend')}
        {navItem('history', '📋', 'History')}

        <div style={{ flex: 1 }} />

        <div style={{ padding: '0 1rem' }}>
          <button onClick={onStartAssessment} style={{
            width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #4f9cf9, #7c3aed)',
            color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.75rem'
          }}>
            + New Assessment
          </button>
          <button onClick={onLogout} style={{
            width: '100%', padding: '0.6rem', background: 'none',
            border: '1px solid #1f2d45', borderRadius: '8px', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem'
          }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                {tab === 'overview' ? 'Dashboard' : tab === 'biomarkers' ? 'Biomarkers' : tab === 'trend' ? 'Trend Analysis' : 'History'}
              </h1>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Last assessed: {stats.lastAssessment ? new Date(stats.lastAssessment).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
              </div>
            </div>
          </div>

          {mainContent()}
        </div>
      </div>
    </div>
  )
}
