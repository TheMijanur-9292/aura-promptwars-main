import React, { useState } from 'react';
import { PenTool, Brain, Calendar, Compass, AlertCircle, RefreshCw, Send, Check } from 'lucide-react';
import { analyzeJournal } from '../services/groq';

export default function Journal({ apiKey, journalHistory, onAddJournal }) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (text.trim().length < 15) return;

    setIsAnalyzing(true);
    setActiveAnalysis(null);
    setReflectionAnswer('');
    setReflectionSaved(false);

    try {
      const response = await analyzeJournal(text, apiKey);
      setActiveAnalysis(response);
      
      // Save to journal history via parent function
      onAddJournal({
        date: new Date().toISOString().split('T')[0],
        entryText: text,
        analysis: response.analysis,
        isCrisis: response.isCrisis
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveReflection = (e) => {
    e.preventDefault();
    setReflectionSaved(true);
  };

  const getBurnoutColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return '#f43f5e';
      case 'medium': return '#f59e0b';
      case 'low': return '#14b8a6';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <PenTool size={20} style={{ color: 'var(--color-purple)' }} /> Expressive Daily Journaling
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          Write freely about your day, mock test scores, doubts, fatigue, or any anxieties. Aura's GenAI will read it with empathy, analyze hidden stress triggers, and outline actionable coping strategies.
        </p>

        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea
            className="journal-textarea"
            placeholder="Write down what is on your mind today... (e.g. 'I got a 60% on my chem mock test. I feel so dumb and behind. My parents are expecting top 1000 rank and I feel like I am failing them. I couldn't sleep last night because my mind was racing.')"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isAnalyzing}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: text.trim().length >= 15 ? 'var(--text-secondary)' : 'var(--color-rose)' }}>
              {text.trim().length} characters (minimum 15 to analyze)
            </span>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={text.trim().length < 15 || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="spin" size={16} style={{ animation: 'spin 2s linear infinite' }} /> Analyzing stress patterns...
                </>
              ) : (
                <>
                  <Brain size={16} /> Analyze Journal
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading state visual indicator */}
      {isAnalyzing && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '3px solid rgba(168, 85, 247, 0.1)',
            borderTopColor: 'var(--color-purple)',
            animation: 'spin 1s linear infinite'
          }} />
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>De-constructing Emotional Nuances</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Groq is mapping text sentiments and identifying stressors...</p>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {activeAnalysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Crisis Banner Trigger */}
          {activeAnalysis.isCrisis && (
            <div className="crisis-banner">
              <AlertCircle size={24} style={{ color: '#fda4af', flexShrink: 0 }} />
              <div style={{ textAlign: 'left' }}>
                <h4 className="crisis-title">We are here with you. Please reach out.</h4>
                <p className="crisis-desc">
                  It sounds like you are going through an incredibly stressful and heavy time. Your safety and well-being are what matter most. Please consider speaking to a professional or a trusted support line immediately:
                </p>
                <div className="crisis-actions">
                  <a href="tel:9152987821" className="crisis-btn crisis-btn-red">📞 Tele-MANAS (Govt India): 14416 / 1800 891 4416</a>
                  <a href="tel:9820466726" className="crisis-btn crisis-btn-outline">📞 Vandrevala Foundation: +91 9999 666 555</a>
                </div>
              </div>
            </div>
          )}

          {/* Core Analysis Breakdown */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              📝 Well-being Analysis Report
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              
              {/* Mood & Burnout Indexes */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calculated Journal Mood</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-purple)', margin: '0.25rem 0' }}>
                  {activeAnalysis.analysis.moodScore}/10
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on word sentiment patterns</span>
              </div>

              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Burnout Risk Assessment</span>
                <span 
                  style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: '2.0rem', 
                    fontWeight: 800, 
                    color: getBurnoutColor(activeAnalysis.analysis.burnoutIndicator),
                    textTransform: 'uppercase',
                    margin: '0.25rem 0'
                  }}
                >
                  {activeAnalysis.analysis.burnoutIndicator || 'medium'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evaluation of cognitive overload</span>
              </div>

            </div>

            {/* Identified Stressors */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                🔍 Identified Hidden Stress Triggers:
              </h4>
              <div className="trigger-tags">
                {activeAnalysis.analysis.primaryStressors?.map((st, i) => (
                  <span key={i} className="trigger-tag">{st}</span>
                )) || <span className="trigger-tag">General Exam Pressure</span>}
              </div>
            </div>

            {/* Actionable Coping Strategies */}
            <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                💡 Recommended Coping Strategies:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeAnalysis.analysis.copingStrategies?.map((strat, i) => (
                  <div key={i} className="coping-card">
                    <h5 className="coping-title">Strategy #{i+1}</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>{strat}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive CBT Reflection Box */}
            {activeAnalysis.analysis.reflections && activeAnalysis.analysis.reflections.length > 0 && (
              <div style={{ padding: '1.5rem', background: 'rgba(168, 85, 247, 0.03)', border: '1px dashed rgba(168, 85, 247, 0.25)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Compass size={16} /> Cognitive Reframing Reflection
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem', fontStyle: 'italic' }}>
                  "{activeAnalysis.analysis.reflections[0]}"
                </p>

                {reflectionSaved ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(20, 184, 166, 0.05)', border: '1px solid rgba(20, 184, 166, 0.15)', borderRadius: '6px' }}>
                    <Check size={16} style={{ color: 'var(--color-teal)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reflection answer saved. Writing down thoughts helps release mental weight.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveReflection} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Type your reflection here..." 
                      value={reflectionAnswer}
                      onChange={(e) => setReflectionAnswer(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      Save
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* History Log */}
      {journalHistory.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem', textAlign: 'left' }}>
            📅 Past Journal Entries & Analysis
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {journalHistory.map((item, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Calendar size={14} />
                    <span>{item.date}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '4px', color: 'var(--color-purple)', fontWeight: 600 }}>
                    Mood: {item.analysis?.moodScore || 'N/A'}/10
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
                  {item.entryText}
                </p>
                {item.analysis?.primaryStressors && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {item.analysis.primaryStressors.map((st, sidx) => (
                      <span key={sidx} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                        {st}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
