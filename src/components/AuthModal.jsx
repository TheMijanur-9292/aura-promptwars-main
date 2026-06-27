import React, { useState } from 'react';
import { X, Lock, Mail, User, BookOpen, LogIn, UserPlus, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { registerUser, loginUser } from '../services/db';

export default function AuthModal({ isOpen, onClose, initialTab = 'signin', onAuthSuccess }) {
  const [tab, setTab] = useState(initialTab); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [exam, setExam] = useState('JEE');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (tab === 'signup') {
        if (!name.trim()) throw new Error("Please enter your full name.");
        await registerUser({ email, password, name, exam });
        
        // Show designed success popup message
        setSuccessMsg("🎉 Account created successfully! Redirecting to Sign In...");
        setTimeout(() => {
          setSuccessMsg('');
          setPassword('');
          setTab('signin');
        }, 1600);
      } else {
        const user = await loginUser({ email, password });
        onAuthSuccess(user);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', position: 'relative' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', flexGrow: 1, paddingBottom: '0.75rem' }}>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: tab === 'signin' ? 'var(--color-purple)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderBottom: tab === 'signin' ? '2px solid var(--color-purple)' : 'none',
                paddingBottom: '0.25rem'
              }}
              onClick={() => { setTab('signin'); setError(''); setSuccessMsg(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: tab === 'signup' ? 'var(--color-purple)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderBottom: tab === 'signup' ? '2px solid var(--color-purple)' : 'none',
                paddingBottom: '0.25rem'
              }}
              onClick={() => { setTab('signup'); setError(''); setSuccessMsg(''); }}
            >
              Sign Up
            </button>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal" style={{ marginLeft: '1rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Designed Success Popup Banner */}
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.35)', borderRadius: 'var(--radius-md)', color: 'var(--color-teal)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', animation: 'fade-in-up 0.3s ease-out' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: 'var(--radius-md)', color: '#fda4af', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', textAlign: 'left' }}>
          
          {tab === 'signup' && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <User size={14} /> Full Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Mijanur Rahman" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <Mail size={14} /> Email Address
            </label>
            <input 
              type="email" 
              placeholder="student@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <Lock size={14} /> Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {tab === 'signup' && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <BookOpen size={14} /> Target Entrance Exam
              </label>
              <select value={exam} onChange={(e) => setExam(e.target.value)}>
                <option value="JEE">JEE (Engineering Entrance)</option>
                <option value="NEET">NEET (Medical Entrance)</option>
                <option value="UPSC">UPSC (Civil Services)</option>
                <option value="CAT">CAT (Management Entrance)</option>
                <option value="GATE">GATE (Postgrad Engineering)</option>
                <option value="CUET">CUET (University Entrance)</option>
                <option value="Board Exams">Board Exams (10th/12th)</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading || !!successMsg}
            style={{ width: '100%', marginTop: '0.75rem', height: '46px' }}
          >
            {isLoading ? (
              <>
                <RefreshCw className="spin" size={16} style={{ animation: 'spin 1.5s linear infinite' }} />
                {tab === 'signup' ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {tab === 'signup' ? <UserPlus size={16} /> : <LogIn size={16} />}
                {tab === 'signup' ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>

        </form>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
          {tab === 'signup' ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button 
            type="button" 
            onClick={() => { setTab(tab === 'signup' ? 'signin' : 'signup'); setError(''); setSuccessMsg(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-purple)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {tab === 'signup' ? 'Sign In' : 'Sign Up Free'}
          </button>
        </p>

      </div>
    </div>
  );
}
