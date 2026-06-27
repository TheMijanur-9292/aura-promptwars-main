import { describe, it, expect } from 'vitest';
import { checkCrisisTrigger, analyzeJournal, getChatResponse } from '../services/groq';

describe('Groq AI & Safety Engine Comprehensive Tests', () => {
  describe('Crisis Keywords & Safety Detection', () => {
    it('should detect suicide and self-harm keywords correctly', () => {
      expect(checkCrisisTrigger('I am feeling suicidal today')).toBe(true);
      expect(checkCrisisTrigger('I want to kill myself')).toBe(true);
      expect(checkCrisisTrigger('thinking of self-harm')).toBe(true);
      expect(checkCrisisTrigger('I want to end my life')).toBe(true);
    });

    it('should handle safe student academic queries without false positives', () => {
      expect(checkCrisisTrigger('I am preparing for my JEE physics exam')).toBe(false);
      expect(checkCrisisTrigger('How do I solve mechanics numericals?')).toBe(false);
      expect(checkCrisisTrigger('Mock test scores were lower than expected')).toBe(false);
    });

    it('should handle null, undefined or empty text safely', () => {
      expect(checkCrisisTrigger('')).toBe(false);
      expect(checkCrisisTrigger(null)).toBe(false);
      expect(checkCrisisTrigger(undefined)).toBe(false);
    });
  });

  describe('Journal AI Analysis Service', () => {
    it('should return valid structured wellness analysis on demo mode', async () => {
      const result = await analyzeJournal('I got a low mock score in physics and feel overwhelmed.', 'demo');
      expect(result).toHaveProperty('isCrisis', false);
      expect(result).toHaveProperty('analysis');
      expect(result.analysis).toHaveProperty('moodScore');
      expect(result.analysis.moodScore).toBeGreaterThanOrEqual(1);
      expect(result.analysis.moodScore).toBeLessThanOrEqual(10);
      expect(Array.isArray(result.analysis.primaryStressors)).toBe(true);
      expect(Array.isArray(result.analysis.copingStrategies)).toBe(true);
    });

    it('should trigger crisis state in journal analysis if crisis keywords present', async () => {
      const result = await analyzeJournal('I feel completely hopeless and want to end my life.', 'demo');
      expect(result.isCrisis).toBe(true);
    });
  });

  describe('Chat Companion Engine & Fallbacks', () => {
    it('should return empathetic response for crisis messages', async () => {
      const messages = [{ role: 'user', content: 'I want to end my life' }];
      const response = await getChatResponse(messages, {}, 'demo');
      expect(response.isCrisis).toBe(true);
      expect(response.text).toContain('confidential resources');
    });

    it('should return subject-specific assistance for programming questions in fallback mode', async () => {
      const messages = [{ role: 'user', content: 'What is Java?' }];
      const response = await getChatResponse(messages, { examType: 'Computer Science' }, '');
      expect(response.isCrisis).toBe(false);
      expect(response.text.toLowerCase()).toContain('java');
    });

    it('should handle empty context gracefully', async () => {
      const messages = [{ role: 'user', content: 'How to handle exam stress?' }];
      const response = await getChatResponse(messages, null, '');
      expect(response.isCrisis).toBe(false);
      expect(typeof response.text).toBe('string');
      expect(response.text.length).toBeGreaterThan(20);
    });

    it('should handle multiple message turns in conversation history', async () => {
      const messages = [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello! How can I help?' },
        { role: 'user', content: 'I am nervous about chemistry' }
      ];
      const response = await getChatResponse(messages, { examType: 'NEET' }, '');
      expect(response.isCrisis).toBe(false);
      expect(typeof response.text).toBe('string');
    });
  });
});
