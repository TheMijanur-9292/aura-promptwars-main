import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, AlertCircle, Compass, HelpCircle, Heart, Sparkles } from 'lucide-react';
import { getChatResponse } from '../services/groq';

const CHAT_SUGGESTIONS = [
  "I'm feeling overwhelmed by my physics backlog.",
  "I got a low score on my mock test and feel like quitting.",
  "I can't sleep because of exam anxiety.",
  "Give me a quick motivational boost."
];

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

// Typewriter component to animate incoming messages
function TypewriterText({ text, speed = 8, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    if (!text) return;
    
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

export default function ChatCompanion({ apiKey, studentName, examType, latestMoodLog }) {
  const displayName = formatDisplayName(studentName);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${displayName}, I'm MindEase, your digital study companion. Whether you're feeling burned out by ${examType || 'exams'}, anxious about mock tests, or just need to vent, I'm here. How is your preparation feeling today?`,
      typewrite: false
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  
  const chatMessagesRef = useRef(null);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (hasSentMessage) {
      scrollToBottom();
    }
  }, [messages, isTyping, hasSentMessage]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    setHasSentMessage(true);
    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setShowCrisisBanner(false);

    // Prepare context for the prompt
    const context = {
      examType: examType,
      currentMood: latestMoodLog?.mood,
      activeStressors: latestMoodLog?.stressors
    };

    try {
      const response = await getChatResponse(
        [...messages, userMessage],
        context,
        apiKey
      );

      if (response.isCrisis) {
        setShowCrisisBanner(true);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response.text, typewrite: true }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having a small connection hiccup, but I'm still here. Take a deep breath. What's on your mind?",
        typewrite: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="glass-panel chat-container" style={{ padding: '1.5rem' }}>
      
      {/* Chat Companion Header */}
      <div className="chat-header">
        <div className="chat-avatar">
          <Heart size={20} fill="white" />
        </div>
        <div className="chat-status" style={{ textAlign: 'left' }}>
          <span className="chat-name">MindEase — Study Companion</span>
          <span className="chat-status-text">Active & Listening Empathically</span>
        </div>
      </div>

      {/* Messages Window */}
      <div className="chat-messages" ref={chatMessagesRef}>
        {!hasSentMessage ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}>
              <Sparkles size={30} color="white" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff 40%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              How can I support you today, {displayName}?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', marginBottom: '2rem', lineHeight: 1.5 }}>
              I'm your empathetic study companion. Click any topic below or type your thoughts in the input box to begin.
            </p>

            {/* Interactive Prompt Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '650px', textAlign: 'left' }}>
              {CHAT_SUGGESTIONS.map((sug, i) => (
                <div 
                  key={i}
                  className="glass-card"
                  style={{ 
                    padding: '1.1rem 1.25rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justify: 'space-between',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'var(--transition-normal)'
                  }}
                  onClick={() => handleSendMessage(sug)}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>{sug}</span>
                  <Compass size={18} style={{ color: 'var(--color-purple)', flexShrink: 0, marginLeft: '0.75rem' }} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.role}`}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                {msg.role === 'assistant' && msg.typewrite ? (
                  <TypewriterText 
                    text={msg.content} 
                    onComplete={() => {
                      msg.typewrite = false;
                    }} 
                  />
                ) : (
                  msg.content
                )}
              </p>
            </div>
          ))
        )}
        {isTyping && (
          <div className="chat-bubble assistant" style={{ display: 'flex', gap: '0.35rem', padding: '0.75rem 1rem' }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0s' }} />
            <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0.2s' }} />
            <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0.4s' }} />
          </div>
        )}
        {/* End marker */}
      </div>

      {/* Safety Alert Banner */}
      {showCrisisBanner && (
        <div className="crisis-banner" style={{ margin: '0.5rem 0' }}>
          <AlertCircle size={20} style={{ color: '#fda4af', flexShrink: 0 }} />
          <div style={{ textAlign: 'left' }}>
            <h5 className="crisis-title" style={{ fontSize: '0.9rem' }}>Please reach out for help</h5>
            <p className="crisis-desc" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
              Your safety is the most important thing. If you are struggling, please connect with someone who can support you.
            </p>
            <div className="crisis-actions">
              <a href="tel:14416" className="crisis-btn crisis-btn-red" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}>📞 Call Tele-MANAS: 14416</a>
              <a href="tel:9820466726" className="crisis-btn crisis-btn-outline" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}>📞 Helpline: 91-9820466726</a>
            </div>
          </div>
        </div>
      )}

      {/* Chat Input Field */}
      <form onSubmit={handleSubmit} className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder="Share your concerns, doubts, or anxieties..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!inputText.trim() || isTyping}
          style={{ width: '48px', height: '44px', padding: 0 }}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Extra bounce keyframes injection in inline style for simplicity */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
