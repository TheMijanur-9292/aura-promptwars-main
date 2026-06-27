import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, MessageSquare, Heart, BarChart3, Settings, Flame, AlertCircle, LogOut, Sparkles } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import ChatCompanion from './components/ChatCompanion';
import MindfulnessHub from './components/MindfulnessHub';
import Analytics from './components/Analytics';
import SettingsModal from './components/SettingsModal';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import { fetchUserData, saveMoodLog, saveJournalEntry } from './services/api';
import './App.css';

// Helper to format email or messy username strings into clean display names
function formatDisplayName(name) {
  if (!name) return 'Aspirant';
  let clean = name;
  if (clean.includes('@')) {
    clean = clean.split('@')[0];
  }
  clean = clean.replace(/[._]/g, ' ');
  return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('signin');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aura_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null;
  });

  // Settings state (hydrates from currentUser or localStorage)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('aura_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return { name: 'Aspirant', exam: 'JEE', apiKey: import.meta.env.VITE_GROQ_API_KEY || '' };
  });

  // Mood logs history
  const [moodHistory, setMoodHistory] = useState(() => {
    const saved = localStorage.getItem('aura_mood_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return DEFAULT_MOOD_HISTORY;
  });

  // Journal entries history
  const [journalHistory, setJournalHistory] = useState(() => {
    const saved = localStorage.getItem('aura_journal_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Sync user details when currentUser updates
  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      localStorage.setItem('aura_current_user', JSON.stringify(currentUser));
      
      // Fetch cloud data from Neon DB
      fetchUserData(currentUser.email).then(data => {
        if (!isMounted) return;
        if (data) {
          setMoodHistory(data.moodHistory || []);
          setJournalHistory(data.journalHistory || []);
        } else {
          setMoodHistory([]);
          setJournalHistory([]);
        }
      });
    } else {
      localStorage.removeItem('aura_current_user');
    }
    return () => { isMounted = false; };
  }, [currentUser]);

  // Save state updates to local storage
  useEffect(() => {
    localStorage.setItem('aura_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`mindease_mood_${currentUser.email}`, JSON.stringify(moodHistory));
    }
  }, [moodHistory, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`mindease_journal_${currentUser.email}`, JSON.stringify(journalHistory));
    }
  }, [journalHistory, currentUser]);

  const [welcomeNotification, setWelcomeNotification] = useState('');

  const handleOpenAuth = (tabName = 'signin') => {
    setAuthTab(tabName);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (user.name || user.exam) {
      setSettings(prev => ({
        ...prev,
        name: user.name || prev.name,
        exam: user.exam || prev.exam
      }));
    }
    setIsDemoMode(false);
    const userDisplayName = formatDisplayName(user.name);
    setWelcomeNotification(`🎉 Welcome back, ${userDisplayName}! Ready for focused success today.`);
    setTimeout(() => {
      setWelcomeNotification('');
    }, 4500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsDemoMode(false);
    setMoodHistory([]);
    setJournalHistory([]);
    localStorage.removeItem('aura_current_user');
    localStorage.removeItem('aura_mood_history');
    localStorage.removeItem('aura_journal_history');
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    if (currentUser) {
      setCurrentUser(prev => ({ ...prev, name: newSettings.name, exam: newSettings.exam }));
    }
  };

  const handleAddMoodLog = (newLog) => {
    setMoodHistory(prev => {
      const filtered = prev.filter(log => log.date !== newLog.date);
      return [...filtered, newLog];
    });
    if (currentUser) {
      saveMoodLog(currentUser.email, newLog);
    }
  };

  const handleAddJournalLog = (newJournal) => {
    setJournalHistory(prev => [newJournal, ...prev]);
    if (currentUser) {
      saveJournalEntry(currentUser.email, newJournal);
    }
    
    if (newJournal.analysis && newJournal.analysis.moodScore) {
      handleAddMoodLog({
        date: newJournal.date,
        mood: newJournal.analysis.moodScore,
        energy: 50,
        stressors: newJournal.analysis.primaryStressors || []
      });
    }
  };

  const cleanName = formatDisplayName(currentUser ? currentUser.name : settings.name);

  // Unauthenticated view: Render Landing Page
  if (!currentUser) {
    return (
      <>
        <LandingPage 
          onOpenAuth={handleOpenAuth} 
        />
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)}
          initialTab={authTab}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Helper to render current active view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            userName={cleanName} 
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
            studentName={cleanName}
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
      default: return 'MindEase Wellness';
    }
  };

  // Calculate streak to display in header
  const getHeaderStreak = () => {
    if (moodHistory.length === 0) return 0;
    const sortedDates = [...new Set(moodHistory.map(log => log.date))].sort().reverse();
    const todayStr = new Date().toISOString().split('T')[0];
    
    let expectedDate = new Date();
    
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

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Heart size={20} fill="white" />
          </div>
          <span className="brand-name">MindEase</span>
        </div>

        <nav style={{ flexGrow: 1 }} aria-label="Main Navigation">
          <ul className="nav-menu">
            <li className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('dashboard')} aria-label="Navigate to Dashboard" aria-current={activeView === 'dashboard' ? 'page' : undefined}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            </li>
            <li className={`nav-item ${activeView === 'journal' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('journal')} aria-label="Navigate to Daily Journal" aria-current={activeView === 'journal' ? 'page' : undefined}>
                <BookOpen size={18} />
                <span>Daily Journal</span>
              </button>
            </li>
            <li className={`nav-item ${activeView === 'chat' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('chat')} aria-label="Navigate to Chat with MindEase" aria-current={activeView === 'chat' ? 'page' : undefined}>
                <MessageSquare size={18} />
                <span>Chat with MindEase</span>
              </button>
            </li>
            <li className={`nav-item ${activeView === 'mindfulness' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('mindfulness')} aria-label="Navigate to Mindfulness Hub" aria-current={activeView === 'mindfulness' ? 'page' : undefined}>
                <Heart size={18} />
                <span>Mindfulness Hub</span>
              </button>
            </li>
            <li className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}>
              <button onClick={() => setActiveView('analytics')} aria-label="Navigate to Analytics" aria-current={activeView === 'analytics' ? 'page' : undefined}>
                <BarChart3 size={18} />
                <span>Analytics</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer: User details and settings trigger */}
        <div className="sidebar-footer">
          
          {/* Demo Mode warning or Auth status in sidebar */}
          {isDemoMode && !currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.6rem 0.75rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-md)', color: '#fbbf24', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><AlertCircle size={14} /> Demo Mode</span>
              <button onClick={() => handleOpenAuth('signin')} style={{ background: 'none', border: 'none', color: '#fbbf24', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Sign In</button>
            </div>
          )}

          <div className="user-badge">
            <div className="avatar">
              {cleanName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info" style={{ textAlign: 'left' }}>
              <span className="user-name">{cleanName}</span>
              <span className="user-exam">{settings.exam} aspirant</span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem' }}>
              <button 
                className="icon-btn" 
                style={{ width: '32px', height: '32px' }}
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Open settings"
              >
                <Settings size={14} />
              </button>
              {currentUser && (
                <button 
                  className="icon-btn" 
                  style={{ width: '32px', height: '32px', color: 'var(--color-rose)' }}
                  onClick={handleLogout}
                  aria-label="Log out"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
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

      {/* Designed Welcome Notification Toast */}
      {welcomeNotification && (
        <div style={{ position: 'fixed', top: '90px', right: '30px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.5)', borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'fade-in-up 0.4s ease-out' }}>
          <Sparkles size={22} style={{ color: '#c084fc', flexShrink: 0 }} />
          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{welcomeNotification}</span>
        </div>
      )}

      {/* Settings Modal Component */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
