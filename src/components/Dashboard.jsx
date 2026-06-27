import React, { useState } from 'react';
import { Smile, Zap, Frown, Award, Flame, Brain, BookOpen, Compass, ArrowRight } from 'lucide-react';

const MOODS = [
  { value: 2, emoji: '😭', label: 'Overwhelmed', desc: 'Feeling burned out' },
  { value: 4, emoji: '😟', label: 'Anxious', desc: 'Exam stress is high' },
  { value: 6, emoji: '😐', label: 'Neutral', desc: 'Tired but getting through' },
  { value: 8, emoji: '🙂', label: 'Focused', desc: 'Making solid progress' },
  { value: 10, emoji: '😁', label: 'Confident', desc: 'Ready for any challenge' }
];

const STRESS_TAGS = [
  "Mock Test Scores",
  "Syllabus Backlogs",
  "Time Management",
  "Family Expectations",
  "Peer Competition",
  "Lack of Sleep",
  "Subject Difficulty",
  "Self-Doubt"
];

const WELLNESS_QUOTES = [
  { text: "Your worth is not defined by a exam score. You are learning, growing, and doing your best.", author: "MindEase" },
  { text: "It is okay to rest. A rested mind solves physics equations and remembers historical dates far better than an exhausted one.", author: "MindEase" },
  { text: "Do not compare your Chapter 1 to someone else's Chapter 20. Focus on your own path.", author: "MindEase" },
  { text: "Success in entrance exams is a marathon of consistency, not a sprint of burnout. Take care of your mental fuel.", author: "MindEase" },
  { text: "One bad mock test is just data. It tells you what to review, not who you are.", author: "MindEase" }
];

export default function Dashboard({ userName, targetExam, moodHistory, onLogMood, onViewChange }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(60);
  const [selectedStressors, setSelectedStressors] = useState([]);
  const [isLoggedToday, setIsLoggedToday] = useState(false);

  // Pick a quote based on the current day
  const dailyQuote = WELLNESS_QUOTES[new Date().getDate() % WELLNESS_QUOTES.length];

  const handleStressorToggle = (tag) => {
    setSelectedStressors(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!selectedMood) return;

    onLogMood({
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      energy: energyLevel,
      stressors: selectedStressors
    });
    
    setIsLoggedToday(true);
    // Reset mood input state
    setSelectedMood(null);
    setSelectedStressors([]);
  };

  // Calculate statistics
  const currentStreak = () => {
    if (moodHistory.length === 0) return 0;
    
    // Simple streak calculation (consecutive days of logs)
    let streak = 0;
    const sortedDates = [...new Set(moodHistory.map(log => log.date))].sort().reverse();
    const todayStr = new Date().toISOString().split('T')[0];
    
    let expectedDate = new Date();
    
    // Check if the most recent log is today or yesterday
    if (sortedDates[0] !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (sortedDates[0] !== yesterdayStr) {
        return 0;
      }
    }

    for (let i = 0; i < sortedDates.length; i++) {
      const logDateStr = sortedDates[i];
      const expectedStr = expectedDate.toISOString().split('T')[0];
      
      if (logDateStr === expectedStr) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const averageMood = () => {
    if (moodHistory.length === 0) return 0;
    const total = moodHistory.reduce((sum, item) => sum + item.mood, 0);
    return (total / moodHistory.length).toFixed(1);
  };

  const mainStressor = () => {
    if (moodHistory.length === 0) return "None";
    const counts = {};
    moodHistory.forEach(log => {
      if (log.stressors) {
        log.stressors.forEach(st => {
          counts[st] = (counts[st] || 0) + 1;
        });
      }
    });
    
    let maxSt = "None";
    let maxCount = 0;
    Object.keys(counts).forEach(st => {
      if (counts[st] > maxCount) {
        maxCount = counts[st];
        maxSt = st;
      }
    });
    return maxSt;
  };

  return (
    <div className="scrollable-view" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, margin: 0, textAlign: 'left', background: 'linear-gradient(135deg, #fff 40%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hello, {userName}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem', textAlign: 'left' }}>
            Deep breaths. You are preparing for {targetExam} - let's protect your wellness along the way.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="streak-counter">
            <Flame size={16} fill="#fbbf24" />
            <span>{currentStreak()} Day Streak</span>
          </div>
          <div className="streak-counter" style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.2)', color: '#14b8a6' }}>
            <Award size={16} />
            <span>Mood Index: {averageMood()}/10</span>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="daily-quote">
        <p style={{ margin: 0, textAlign: 'left', lineHeight: 1.5 }}>"{dailyQuote.text}"</p>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem', textAlign: 'right', fontWeight: 600 }}>— {dailyQuote.author}</span>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* Left Side: Daily Mood Log */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Smile size={20} style={{ color: 'var(--color-purple)' }} /> How are you feeling today?
          </h2>

          {isLoggedToday ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Mood Logged Successfully!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Thank you for taking a moment for yourself. You can view your mood progress on the Analytics tab.</p>
              <button className="btn btn-secondary" onClick={() => setIsLoggedToday(false)}>
                Log Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Mood Selectors */}
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Select your emotional state:</p>
                <div className="mood-picker-box">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      className={`mood-emoji-btn ${selectedMood === m.value ? 'active' : ''}`}
                      onClick={() => setSelectedMood(m.value)}
                    >
                      <span className="mood-emoji">{m.emoji}</span>
                      <span className="mood-label">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Zap size={14} style={{ color: 'var(--color-amber)' }} /> Energy & Focus Level</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{energyLevel}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={energyLevel} 
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  style={{ accentColor: 'var(--color-purple)' }}
                />
              </div>

              {/* Stress Factors Checkboxes */}
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Select any current stress triggers (multi-select):</p>
                <div className="suggestion-chips">
                  {STRESS_TAGS.map((tag) => {
                    const isSelected = selectedStressors.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        className="suggestion-chip"
                        style={{
                          background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          borderColor: isSelected ? 'var(--color-purple)' : 'var(--glass-border)',
                          color: isSelected ? 'white' : 'var(--text-secondary)'
                        }}
                        onClick={() => handleStressorToggle(tag)}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!selectedMood}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Save Mood Check-In
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Quick Exercises & Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Insights Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Brain size={16} style={{ color: 'var(--color-teal)' }} /> Weekly Insights
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dominant Stressor</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-rose)' }}>{mainStressor()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Log Consistency</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {moodHistory.length > 0 ? `${Math.min(100, (moodHistory.length / 7 * 100).toFixed(0))}%` : "0%"}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Average Energy</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-amber)' }}>
                  {moodHistory.length > 0 ? `${(moodHistory.reduce((sum, item) => sum + item.energy, 0) / moodHistory.length).toFixed(0)}%` : "0%"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Coping Shortcuts */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Compass size={16} style={{ color: 'var(--color-amber)' }} /> Mind Care Exercises
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              <div className="glass-card" style={{ padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => onViewChange('mindfulness')}>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Box Breathing</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Soothe exam anxiety in 2 mins</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--color-purple)' }} />
              </div>

              <div className="glass-card" style={{ padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => onViewChange('journal')}>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Mental Venting</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Write down stress and analyze triggers</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--color-purple)' }} />
              </div>

              <div className="glass-card" style={{ padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => onViewChange('chat')}>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Chat with MindEase</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Empathetic counselor on-call</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--color-purple)' }} />
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
