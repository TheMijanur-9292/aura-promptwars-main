import { useState } from 'react';
import { X, Shield, Key, BookOpen, User } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, settings, onSave }) {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [exam, setExam] = useState(settings.exam || 'JEE');
  const [name, setName] = useState(settings.name || 'Aspirant');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ apiKey, exam, name });
    onClose();
  };

  const handleUseDemo = () => {
    setApiKey('demo');
    onSave({ apiKey: 'demo', exam, name });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.4rem' }}>Profile & Settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* User Name */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <User size={14} /> Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Rahul" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>

          {/* Target Exam */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <BookOpen size={14} /> Target Exam / Goal
            </label>
            <select value={exam} onChange={(e) => setExam(e.target.value)}>
              <option value="JEE">JEE (Engineering Entrance)</option>
              <option value="NEET">NEET (Medical Entrance)</option>
              <option value="UPSC">UPSC (Civil Services)</option>
              <option value="CAT">CAT (Management Entrance)</option>
              <option value="GATE">GATE (Postgrad Engineering)</option>
              <option value="CUET">CUET (University Entrance)</option>
              <option value="CBSE/ICSE Boards">Board Exams (10th/12th)</option>
              <option value="General Studies">General Studies & Academics</option>
            </select>
          </div>

          {/* Groq API Key */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <Key size={14} /> Groq API Key
            </label>
            <input 
              type="password" 
              placeholder="gsk_..." 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.4 }}>
              Enter your Groq API key. It is saved in your browser's local storage and is never uploaded anywhere.
            </p>
          </div>

          {/* Security Banner */}
          <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'rgba(20, 184, 166, 0.05)', border: '1px solid rgba(20, 184, 166, 0.15)', borderRadius: 'var(--radius-md)' }}>
            <Shield size={18} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong>Privacy First:</strong> Your key is stored locally in your browser context. Leaving the API Key blank or entering "demo" runs the app in **offline simulation mode**.
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Save Changes
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleUseDemo}>
              Use Demo Mode
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
