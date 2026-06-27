import React from 'react';
import { Activity, Calendar, AlertTriangle, TrendingUp, BarChart2 } from 'lucide-react';

export default function Analytics({ moodHistory }) {
  
  if (moodHistory.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📊</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Analytics Data Yet</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
          Start checking in daily on the Dashboard or analyzing your journal entries to unlock personalized mental wellness trends and stress trigger correlations.
        </p>
      </div>
    );
  }

  // Process data for charts
  const sortedLogs = [...moodHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Keep only the last 7 entries for the weekly view
  const last7Logs = sortedLogs.slice(-7);

  // Count stress trigger frequencies
  const stressorCounts = {};
  moodHistory.forEach(log => {
    if (log.stressors) {
      log.stressors.forEach(st => {
        stressorCounts[st] = (stressorCounts[st] || 0) + 1;
      });
    }
    // Also include stressors analyzed from journals if any
    if (log.analysis && log.analysis.primaryStressors) {
      log.analysis.primaryStressors.forEach(st => {
        // Standardize keys a bit
        const key = st.charAt(0).toUpperCase() + st.slice(1);
        stressorCounts[key] = (stressorCounts[key] || 0) + 1;
      });
    }
  });

  const sortedStressors = Object.entries(stressorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5

  const maxStressorCount = sortedStressors.length > 0 ? Math.max(...sortedStressors.map(s => s[1])) : 1;

  // Average score
  const avgMood = (moodHistory.reduce((sum, log) => sum + log.mood, 0) / moodHistory.length).toFixed(1);
  const avgEnergy = (moodHistory.reduce((sum, log) => sum + log.energy, 0) / moodHistory.length).toFixed(0);

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 30;

  // Map logs to coordinates
  const points = last7Logs.map((log, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (Math.max(1, last7Logs.length - 1));
    // mood is 1 to 10. Map 10 to padding, 1 to chartHeight - padding
    const y = chartHeight - padding - ((log.mood - 1) * (chartHeight - padding * 2)) / 9;
    return { x, y, mood: log.mood, date: log.date };
  });

  // Create SVG path string
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Avg Mood Rating</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-purple)' }}>{avgMood}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 10</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-teal)', display: 'block', marginTop: '0.5rem' }}>
            {avgMood >= 7 ? "✨ Stable wellness baseline" : "⚠️ High stress indicator"}
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Avg Energy & Focus</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-amber)' }}>{avgEnergy}%</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
            Based on active focus checks
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Total Logs Recorded</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-teal)' }}>{moodHistory.length}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>days</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
            Consistency is key to tracking
          </span>
        </div>

      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Mood Trend Chart */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <TrendingUp size={18} style={{ color: 'var(--color-purple)' }} /> Mood Trend (Last 7 Logs)
          </h3>

          <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              style={{ width: '100%', height: 'auto', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-md)' }}
            >
              {/* Grid Lines */}
              {[1, 4, 7, 10].map((level, i) => {
                const y = chartHeight - padding - ((level - 1) * (chartHeight - padding * 2)) / 9;
                return (
                  <g key={i}>
                    <line 
                      x1={padding} 
                      y1={y} 
                      x2={chartWidth - padding} 
                      y2={y} 
                      stroke="var(--glass-border)" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={padding - 10} 
                      y={y + 4} 
                      fill="var(--text-muted)" 
                      fontSize="10" 
                      textAnchor="end"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Chart Line Path */}
              {pathD && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="url(#mood-grad)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Glow Gradient definition */}
              <defs>
                <linearGradient id="mood-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-purple)" />
                  <stop offset="100%" stopColor="var(--color-indigo)" />
                </linearGradient>
              </defs>

              {/* Data Node Circles */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="5" 
                    fill="var(--bg-secondary)" 
                    stroke="var(--color-purple)" 
                    strokeWidth="2.5" 
                  />
                  <text 
                    x={pt.x} 
                    y={chartHeight - 10} 
                    fill="var(--text-secondary)" 
                    fontSize="9" 
                    textAnchor="middle"
                  >
                    {pt.date.split('-')[2]} {/* Day of month */}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Stressor Breakdown Chart */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <BarChart2 size={18} style={{ color: 'var(--color-rose)' }} /> Primary Stress Factors
          </h3>

          {sortedStressors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No stress triggers logged yet. Stressors are identified automatically from your journal entries.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {sortedStressors.map(([stressor, count]) => {
                const percentage = ((count / maxStressorCount) * 100).toFixed(0);
                return (
                  <div key={stressor} style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{stressor}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{count} occurrences</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${percentage}%`, 
                          background: 'var(--grad-stress)', 
                          borderRadius: '4px',
                          transition: 'width 1s ease-out'
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
