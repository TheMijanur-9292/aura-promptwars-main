import { Heart, Sparkles, Brain, Compass, Activity, Shield, CheckCircle, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function LandingPage({ onOpenAuth }) {
  return (
    <div style={{ width: '100%', height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative' }}>
      
      {/* Top Navbar */}
      <nav style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', borderBottom: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10, 11, 18, 0.85)', boxSizing: 'border-box' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}>
            <Heart size={22} fill="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 30%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            MindEase
          </span>
        </div>

        {/* Center Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="nav-links-desktop">
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'var(--transition-fast)' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>
            Features
          </a>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'var(--transition-fast)' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>
            How It Works
          </a>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => onOpenAuth('signin')}
            style={{ padding: '0.65rem 1.35rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => onOpenAuth('signup')}
            style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
          >
            <UserPlus size={15} /> Sign Up Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '5rem 3rem 4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', color: '#c084fc', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.75rem' }}>
          <Sparkles size={14} /> Your 24/7 Digital Student Wellness Companion
        </div>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #ffffff 30%, #a855f7 70%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1.5px' }}>
          Transform High-Stakes Exam Stress <br /> into Focused Success
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '950px', marginBottom: '2.5rem' }}>
          A hyper-personalized digital wellness companion engineered specifically for JEE, NEET, UPSC, and competitive exam aspirants. Track moods, analyze hidden stress triggers, and practice guided mindfulness.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => onOpenAuth('signup')} style={{ padding: '1rem 2.25rem', fontSize: '1.05rem' }}>
            Get Started Free <ArrowRight size={18} />
          </button>
        </div>

        {/* Value badges */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '3.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={16} style={{ color: 'var(--color-teal)' }} /> 100% Private & Encrypted</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={16} style={{ color: 'var(--color-teal)' }} /> Exam-Tailored AI Coping</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={16} style={{ color: 'var(--color-teal)' }} /> Built for Competitive Aspirants</span>
        </div>

      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '4rem 3rem 6rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Designed for Academic Excellence & Mental Balance
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Standard habit trackers miss emotional nuances. MindEase decodes them.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
          
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-purple)', marginBottom: '1.25rem' }}>
              <Brain size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Open-Ended AI Journaling</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>Write down test anxiety, syllabus backlogs, or fatigue. GenAI analyzes sentiment patterns and uncovers hidden stress triggers.</p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-indigo)', marginBottom: '1.25rem' }}>
              <Heart size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Empathetic Companion "MindEase"</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>An active-listening AI counselor trained to support exam aspirants with real-time cognitive reframing and study-break prompts.</p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-teal)', marginBottom: '1.25rem' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Interactive Mindfulness Hub</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>Visual Box Breathing and 4-7-8 breathing timers paired with SOS 5-4-3-2-1 panic grounding sheets to soothe panic before exams.</p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-amber)', marginBottom: '1.25rem' }}>
              <Compass size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Wellness Analytics & Trends</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>Custom SVG charts mapping weekly mood indexes and stress factor frequency breakdowns to prevent burnout early.</p>
          </div>

        </div>
      </section>

      {/* Helpline banner section */}
      <section id="helpline" style={{ padding: '3rem 2rem', background: 'rgba(244, 63, 94, 0.05)', borderTop: '1px solid rgba(244, 63, 94, 0.2)', borderBottom: '1px solid rgba(244, 63, 94, 0.2)', textAlign: 'center' }}>
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#fda4af', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Shield size={20} /> Immediate Support & Helplines
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            MindEase is designed for emotional self-care and stress reduction. If you or someone you know is in severe distress, immediate professional help is available 24/7 in India.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:14416" style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📞 Tele-MANAS: 14416
            </a>
            <a href="tel:9820466726" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📞 KIRAN Helpline: 1800-599-0019
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', padding: '2rem 3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'rgba(10, 11, 16, 0.9)' }}>
        <p>© 2026 MindEase Mental Wellness Companion. Crafted with care for students everywhere.</p>
      </footer>

    </div>
  );
}
