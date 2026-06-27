import React from 'react';
import { Heart, Sparkles, Brain, Compass, Activity, Shield, CheckCircle, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function LandingPage({ onOpenAuth, onExploreDemo }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      
      {/* Top Navbar */}
      <nav style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', borderBottom: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10, 11, 16, 0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)' }}>
            <Heart size={20} fill="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, background: 'linear-gradient(135deg, #fff 30%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            AURA
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => onOpenAuth('signin')}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => onOpenAuth('signup')}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            <UserPlus size={15} /> Sign Up Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '5rem 2rem 4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', color: '#c084fc', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.75rem' }}>
          <Sparkles size={14} /> Powered by GenAI & Groq Llama 3.3
        </div>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #ffffff 30%, #a855f7 70%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1.5px' }}>
          Transform High-Stakes Exam Stress into Focused Success
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '720px', marginBottom: '2.5rem' }}>
          A hyper-personalized digital wellness companion engineered specifically for JEE, NEET, UPSC, and competitive exam aspirants. Track moods, analyze hidden stress triggers, and practice guided mindfulness.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => onOpenAuth('signup')} style={{ padding: '1rem 2.25rem', fontSize: '1.05rem' }}>
            Get Started Free <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary" onClick={onExploreDemo} style={{ padding: '1rem 2.25rem', fontSize: '1.05rem' }}>
            Explore Instant Demo
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
      <section style={{ padding: '4rem 3rem 6rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Designed for Academic Excellence & Mental Balance
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Standard habit trackers miss emotional nuances. Aura decodes them.</p>
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Empathetic Companion "Aura"</h3>
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

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', padding: '2rem 3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>© 2026 Aura Mental Wellness Companion. Crafted with care for students everywhere.</p>
      </footer>

    </div>
  );
}
