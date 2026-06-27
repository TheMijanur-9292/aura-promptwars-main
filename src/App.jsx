import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, MessageSquare, Heart, BarChart3, Settings, Flame, AlertCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import ChatCompanion from './components/ChatCompanion';
import MindfulnessHub from './components/MindfulnessHub';
import Analytics from './components/Analytics';
import SettingsModal from './components/SettingsModal';
import './App.css';

// Initial default logs to provide sample context for hackathon evaluators
const DEFAULT_MOOD_HISTORY = [
  { date: '2026-06-21', mood: 6, energy: 50, stressors: ['Lack of Sleep'] },
  { date: '2026-06-22', mood: 7, energy: 60, stressors: ['Subject Difficulty'] },
  { date: '2026-06-23', mood: 5, energy: 40, stressors: ['Time Management', 'Lack of Sleep'] },
  { date: '2026-06-24', mood: 4, energy: 30, stressors: ['Mock Test Scores', 'Self-Doubt'] },
  { date: '2026-06-25', mood: 6, energy: 70, stressors: ['Syllabus Backlogs'] },
  { date: '2026-06-26', mood: 8, energy: 80, stressors: [] }
];

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Settings state (hydrates from localStorage or env default)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('aura_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Aspirant',
      exam: 'JEE',
      apiKey: ''
    };
  });

  // Mood logs history (hydrates from localStorage or provides default mock logs)
  const [moodHistory, setMoodHistory] = useState(() => {
    const saved = localStorage.getItem('aura_mood_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_MOOD_HISTORY;
  });

  // Journal entries history
  const [journalHistory, setJournalHistory] = useState(() => {
    const saved = localStorage.getItem('aura_journal_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Save state updates to local storage
  useEffect(() => {
    localStorage.setItem('aura_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('aura_mood_history', JSON.stringify(moodHistory));
  }, [moodHistory]);

  useEffect(() => {
    localStorage.setItem('aura_journal_history', JSON.stringify(journalHistory));
  }, [journalHistory]);

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const handleAddMoodLog = (newLog) => {
    // Prevent duplicate entries for the same day if re-logged, replace existing or add
    setMoodHistory(prev => {
      const filtered = prev.filter(log => log.date !== newLog.date);
      return [...filtered, newLog];
    });
  };

  const handleAddJournalLog = (newJournal) => {
    setJournalHistory(prev => [newJournal, ...prev]);
    
    // Also automatically log mood in mood history if mood score is returned
    if (newJournal.analysis && newJournal.analysis.moodScore) {
      handleAddMoodLog({
        date: newJournal.date,
        mood: newJournal.analysis.moodScore,
        energy: 50, // default placeholder
        stressors: newJournal.analysis.primaryStressors || []
      });
    }
  };

  // Helper to render current active view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            userName={settings.name} 
            targetExam={settings.exam}
            moodHistory={moodHistory}
            onLogMood={handleAddMoodLog}
            onViewChange={setActiveView}
          />
        );
      case 'journal':
        return (
          <Journal 
            apiKey={settings.apiKey}
            journalHistory={journalHistory}
            onAddJournal={handleAddJournalLog}
          />
        );
      case 'chat':
        return (
          <ChatCompanion 
            apiKey={settings.apiKey}
            studentName={settings.name}
            examType={settings.exam}
            latestMoodLog={moodHistory[moodHistory.length - 1]}
          />
        );
      case 'mindfulness':
        return <MindfulnessHub />;
      case 'analytics':
        return <Analytics moodHistory={moodHistory} />;
      default:
        return <Dashboard />;
    }
  };

  // Helper for title header
  const getHeaderTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'journal': return 'Daily Journal';
      case 'chat': return 'Empathetic Chat';
      case 'mindfulness': return 'Mindfulness Hub';
      case 'analytics': return 'Wellness Analytics';
      default: return 'Aura Wellness';
    }
  };

  // Calculate streak to display in header
  const getHeaderStreak = () => {
    if (moodHistory.length === 0) return 0;
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

    let streak = 0;
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

  const isDemoMode = !settings.apiKey || settings.apiKey === 'demo';

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Heart size={20} fill="white" />
          </div>
          <span className="brand-name">AURA</span>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-menu">
            <li className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('dashboard')}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            </li>
            <li className={`nav-item ${activeView === 'journal' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('journal')}>
                <BookOpen size={18} />
                <span>Daily Journal</span>
              </button>
            </li>
            <li className={`nav-item ${activeView === 'chat' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('chat')}>
                <MessageSquare size={18} />
                <span>Chat with Aura</span>
              </button>
            </li>
            <li className={`nav-item ${activeView === 'mindfulness' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('mindfulness')}>
                <Heart size={18} />
                <span>Mindfulness Hub</span>
              </button>
            </li>
            <li className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('analytics')}>
                <BarChart3 size={18} />
                <span>Analytics</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer: User details and settings trigger */}
        <div className="sidebar-footer">
          
          {/* Demo Mode warning in sidebar */}
          {isDemoMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-md)', color: '#fbbf24', fontSize: '0.75rem' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>Offline Demo Mode active</span>
            </div>
          )}

          <div className="user-badge">
            <div className="avatar">
              {settings.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info" style={{ textAlign: 'left' }}>
              <span className="user-name">{settings.name}</span>
              <span className="user-exam">{settings.exam} aspirant</span>
            </div>
            <button 
              className="icon-btn" 
              style={{ marginLeft: 'auto', width: '32px', height: '32px' }}
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Open settings"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        
        {/* Header bar */}
        <header className="top-header">
          <h2 className="page-title">{getHeaderTitle()}</h2>
          
          <div className="header-actions">
            <div className="streak-counter">
              <Flame size={16} fill="#fbbf24" />
              <span>{getHeaderStreak()} Day Streak</span>
            </div>
            <button 
              className="icon-btn" 
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Open settings panel"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic View Injection */}
        <div className="view-container">
          {renderView()}
        </div>

      </main>

      {/* Settings Modal Component */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

    </div>
  );
}
