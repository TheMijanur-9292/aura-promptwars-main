import { describe, it, expect } from 'vitest';
import { checkCrisisTrigger, analyzeJournal, getChatResponse } from '../services/groq';

describe('Groq Service & Safety Engine Tests', () => {
  it('should detect crisis triggers accurately', () => {
    expect(checkCrisisTrigger('I am feeling suicidal')).toBe(true);
    expect(checkCrisisTrigger('I want to kill myself')).toBe(true);
    expect(checkCrisisTrigger('I am preparing for JEE physics')).toBe(false);
  });

  it('should return mock journal analysis when demo key is provided', async () => {
    const result = await analyzeJournal('I got a low mock score in physics and feel overwhelmed.', 'demo');
    expect(result).toHaveProperty('isCrisis');
    expect(result).toHaveProperty('analysis');
    expect(result.analysis.moodScore).toBeGreaterThanOrEqual(1);
    expect(result.analysis.moodScore).toBeLessThanOrEqual(10);
    expect(Array.isArray(result.analysis.primaryStressors)).toBe(true);
  });

  it('should provide supportive chat response on demo mode', async () => {
    const messages = [{ role: 'user', content: 'I am stressed about my chemistry backlog' }];
    const context = { examType: 'JEE', currentMood: 5, activeStressors: ['Backlogs'] };
    const response = await getChatResponse(messages, context, 'demo');
    
    expect(response).toHaveProperty('isCrisis', false);
    expect(typeof response.text).toBe('string');
    expect(response.text.length).toBeGreaterThan(10);
  });
});
