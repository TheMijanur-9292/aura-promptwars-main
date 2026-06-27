import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, AlertCircle, Compass, HelpCircle, Heart } from 'lucide-react';
import { getChatResponse } from '../services/groq';

const CHAT_SUGGESTIONS = [
  "I'm feeling overwhelmed by my physics backlog.",
  "I got a low score on my mock test and feel like quitting.",
  "I can't sleep because of exam anxiety.",
  "Give me a quick motivational boost.",
  "How do I manage my study time better?"
];

export default function ChatCompanion({ apiKey, studentName, examType, latestMoodLog }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${studentName || 'Aspirant'}, I'm Aura, your digital study companion. Whether you're feeling burned out by ${examType || 'exams'}, anxious about mock tests, or just need to vent, I'm here. How is your preparation feeling today?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

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

      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having a small connection hiccup, but I'm still here. Take a deep breath. What's on your mind?" 
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
          <span className="chat-name">Aura — Study Companion</span>
          <span className="chat-status-text">Active & Listening Empathically</span>
        </div>
      </div>

      {/* Messages Window */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.role}`}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', textAlign: 'left' }}>{msg.content}</p>
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble assistant" style={{ display: 'flex', gap: '0.35rem', padding: '0.75rem 1rem' }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0s' }} />
            <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0.2s' }} />
            <span style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
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

      {/* Suggestion Chips */}
      <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Quick suggestions:</span>
        <div className="suggestion-chips" style={{ marginTop: 0 }}>
          {CHAT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => handleSendMessage(sug)}
              disabled={isTyping}
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

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
