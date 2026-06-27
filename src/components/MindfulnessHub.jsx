import React, { useState, useEffect } from 'react';
import { Compass, Play, Pause, RefreshCw, Eye, Hand, Activity } from 'lucide-react';

const TECHNIQUES = {
  box: {
    name: "Box Breathing",
    desc: "Navy SEAL technique to reset the nervous system under high exam stress.",
    steps: [
      { action: "Inhale", duration: 4, instructions: "Breathe in deeply through your nose, expanding your stomach." },
      { action: "Hold", duration: 4, instructions: "Hold the breath gently in your lungs. Keep your shoulders relaxed." },
      { action: "Exhale", duration: 4, instructions: "Release the air slowly through your mouth, letting go of tension." },
      { action: "Hold", duration: 4, instructions: "Rest with empty lungs before the next cycle. Relax your jaw." }
    ]
  },
  calm: {
    name: "4-7-8 Relaxing Breath",
    desc: "Natural tranquilizer for the nervous system. Highly effective before sleep.",
    steps: [
      { action: "Inhale", duration: 4, instructions: "Breathe in quietly through your nose." },
      { action: "Hold", duration: 7, instructions: "Hold your breath, feeling the oxygen calm your body." },
      { action: "Exhale", duration: 8, instructions: "Exhale completely through your mouth with a 'whoosh' sound." }
    ]
  }
};

export default function MindfulnessHub() {
  const [activeTech, setActiveTech] = useState('box');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TECHNIQUES.box.steps[0].duration);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  
  const techData = TECHNIQUES[activeTech];
  const currentStep = techData.steps[currentStepIdx];

  useEffect(() => {
    // Reset state on technique switch
    setIsPlaying(false);
    setCurrentStepIdx(0);
    setTimeLeft(TECHNIQUES[activeTech].steps[0].duration);
    setCyclesCompleted(0);
  }, [activeTech]);

  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next step
            const nextIdx = (currentStepIdx + 1) % techData.steps.length;
            setCurrentStepIdx(nextIdx);
            
            // Increment cycle if we wrapped around
            if (nextIdx === 0) {
              setCyclesCompleted((c) => c + 1);
            }
            return techData.steps[nextIdx].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStepIdx, activeTech]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
    setTimeLeft(techData.steps[0].duration);
    setCyclesCompleted(0);
  };

  // Determine scaling class for breathing circle
  const getCircleClass = () => {
    if (!isPlaying) return '';
    const action = currentStep.action.toLowerCase();
    if (action === 'inhale') return 'expand';
    if (action === 'exhale') return 'contract';
    // for hold, retain size
    return currentStepIdx === 1 ? 'expand' : 'contract';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Interactive Breath Visualizer */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <Activity size={20} style={{ color: 'var(--color-teal)', marginRight: '0.5rem' }} /> Mindful Breathing Guide
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
          Slow down your heart rate and dissolve exam anxiety by matching your breath to the expanding circle.
        </p>

        {/* Technique Selectors */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          {Object.keys(TECHNIQUES).map((key) => (
            <button
              key={key}
              className={`btn ${activeTech === key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTech(key)}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              {TECHNIQUES[key].name}
            </button>
          ))}
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
          {techData.desc}
        </p>

        {/* The Breathing Ring */}
        <div className="breath-container">
          <div className="breath-ring-outer">
            <div className={`breath-ring-inner ${getCircleClass()}`}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {isPlaying ? currentStep.action : "Ready"}
                </span>
                {isPlaying && (
                  <span style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
                    {timeLeft}s
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="breath-instruction">
            {isPlaying ? currentStep.instructions : "Click Play to begin breathing exercise."}
          </p>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Cycles completed: <strong>{cyclesCompleted}</strong>
          </p>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={handleTogglePlay} style={{ width: '120px' }}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? "Pause" : "Start"}
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              <RefreshCw size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* SOS Grounding & Exam Coping Techniques */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          🆘 Crisis / High-Anxiety SOS Grounding
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          {/* 5-4-3-2-1 Grounding */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-amber)' }}>
              <Eye size={16} /> The 5-4-3-2-1 Grounding Method
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              If you feel panic or test anxiety rising, focus on your surroundings to ground your mind:
            </p>
            <ul style={{ fontSize: '0.8rem', paddingLeft: '1.2rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>👁️ <strong>5 things</strong> you can see (your desk, pen, clock, hand, window)</li>
              <li>✋ <strong>4 things</strong> you can feel (the chair beneath you, the paper texture, your clothes)</li>
              <li>👂 <strong>3 things</strong> you can hear (fan humming, traffic outside, your heartbeat)</li>
              <li>👃 <strong>2 things</strong> you can smell (coffee, paper, pencil graphite)</li>
              <li>👅 <strong>1 thing</strong> you can taste (water, toothpaste, mint)</li>
            </ul>
          </div>

          {/* PMR Muscle relaxation */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-teal)' }}>
              <Hand size={16} /> Rapid Muscle Relaxation (PMR)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              Relieve physical fatigue and muscle tension caused by sitting hours at study desks:
            </p>
            <ol style={{ fontSize: '0.8rem', paddingLeft: '1.2rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Shoulders & Neck:</strong> Shrug your shoulders all the way up to your ears, hold tightly for 5 seconds, then let them drop completely. Repeat twice.</li>
              <li><strong>Hands & Arms:</strong> Clench both fists tightly as if squeezing lemons, hold for 5 seconds, then open your palms completely. Feel the relaxation flow.</li>
              <li><strong>Face & Jaw:</strong> Clench your teeth and squeeze your eyes shut for 5 seconds, then completely loosen your facial muscles.</li>
            </ol>
          </div>

        </div>
      </div>

    </div>
  );
}
