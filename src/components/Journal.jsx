import { useState } from 'react';
import { PenTool, Brain, Calendar, Compass, AlertCircle, RefreshCw, Check, Sparkles, Activity } from 'lucide-react';
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
    <div className="scrollable-view" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Side-by-Side Split View Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Student Writing Input */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', textAlign: 'left' }}>
            <PenTool size={20} style={{ color: 'var(--color-purple)' }} /> Expressive Daily Journaling
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'left', lineHeight: 1.5 }}>
            Write freely about your day, mock test scores, doubts, fatigue, or any anxieties. MindEase's GenAI will read it with empathy and generate your live analysis report on the right.
          </p>

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
            <textarea
              className="journal-textarea"
              style={{ flexGrow: 1, minHeight: '260px', resize: 'vertical' }}
              placeholder="Write down what is on your mind today... (e.g. 'I got a 60% on my chem mock test. I feel so dumb and behind. My parents are expecting top 1000 rank and I feel like I am failing them. I couldn't sleep last night because my mind was racing.')"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isAnalyzing}
              aria-label="Journal writing input"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.8rem', color: text.trim().length >= 15 ? 'var(--text-secondary)' : 'var(--color-rose)' }}>
                {text.trim().length} characters (minimum 15 to analyze)
              </span>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={text.trim().length < 15 || isAnalyzing}
                aria-label="Analyze journal entry"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="spin" size={16} style={{ animation: 'spin 2s linear infinite' }} /> Analyzing...
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

        {/* RIGHT COLUMN: AI Analysis Output / Real-time Feedback */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          
          {/* 1. Loading State */}
          {isAnalyzing && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '3rem 1rem', textAlign: 'center', gap: '1.5rem' }}>
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
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Groq AI is mapping text sentiments and identifying stressors...</p>
              </div>
            </div>
          )}

          {/* 2. Live Analysis Report Output */}
          {!isAnalyzing && activeAnalysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
              
              {/* Crisis Banner Trigger */}
              {activeAnalysis.isCrisis && (
                <div className="crisis-banner">
                  <AlertCircle size={24} style={{ color: '#fda4af', flexShrink: 0 }} />
                  <div>
                    <h4 className="crisis-title">We are here with you. Please reach out.</h4>
                    <p className="crisis-desc">
                      It sounds like you are going through an incredibly stressful and heavy time. Your safety and well-being matter most.
                    </p>
                    <div className="crisis-actions">
                      <a href="tel:14416" className="crisis-btn crisis-btn-red">📞 Tele-MANAS: 14416</a>
                      <a href="tel:9820466726" className="crisis-btn crisis-btn-outline">📞 KIRAN: 1800-599-0019</a>
                    </div>
                  </div>
                </div>
              )}

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--color-purple)' }} /> AI Well-being Analysis Report
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                
                {/* Mood Score Card */}
                <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Calculated Mood</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-purple)', margin: '0.2rem 0' }}>
                    {activeAnalysis.analysis.moodScore}/10
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sentiment patterns</span>
                </div>

                {/* Burnout Risk Card */}
                <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Burnout Risk</span>
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-heading)', 
                      fontSize: '1.75rem', 
                      fontWeight: 800, 
                      color: getBurnoutColor(activeAnalysis.analysis.burnoutIndicator),
                      textTransform: 'uppercase',
                      margin: '0.2rem 0'
                    }}
                  >
                    {activeAnalysis.analysis.burnoutIndicator || 'medium'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cognitive overload</span>
                </div>

              </div>

              {/* Identified Stressors */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  🔍 Hidden Stress Triggers:
                </h4>
                <div className="trigger-tags">
                  {activeAnalysis.analysis.primaryStressors?.map((st, i) => (
                    <span key={i} className="trigger-tag" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>{st}</span>
                  )) || <span className="trigger-tag">General Exam Pressure</span>}
                </div>
              </div>

              {/* Actionable Coping Strategies */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  💡 Recommended Coping Strategies:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeAnalysis.analysis.copingStrategies?.map((strat, i) => (
                    <div key={i} className="coping-card" style={{ padding: '0.65rem 0.85rem' }}>
                      <h5 className="coping-title" style={{ fontSize: '0.75rem' }}>Strategy #{i+1}</h5>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>{strat}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive CBT Reflection Box */}
              {activeAnalysis.analysis.reflections && activeAnalysis.analysis.reflections.length > 0 && (
                <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.03)', border: '1px dashed rgba(168, 85, 247, 0.25)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-purple)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Compass size={14} /> Cognitive Reframing Reflection
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                    "{activeAnalysis.analysis.reflections[0]}"
                  </p>

                  {reflectionSaved ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem', background: 'rgba(20, 184, 166, 0.05)', border: '1px solid rgba(20, 184, 166, 0.15)', borderRadius: '6px' }}>
                      <Check size={14} style={{ color: 'var(--color-teal)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reflection saved.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveReflection} style={{ display: 'flex', gap: '0.4rem' }}>
                      <input 
                        type="text" 
                        placeholder="Type your reflection..." 
                        value={reflectionAnswer}
                        onChange={(e) => setReflectionAnswer(e.target.value)}
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                        required
                      />
                      <button type="submit" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                        Save
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>
          )}

          {/* 3. Empty Placeholder State */}
          {!isAnalyzing && !activeAnalysis && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '3rem 1.5rem', textAlign: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-purple)' }}>
                <Activity size={26} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Real-Time Analysis Output</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
                  Write down your thoughts in the left panel and click <strong>"Analyze Journal"</strong> to generate your AI well-being report right here.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

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
