import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, registerUser, loginUser, fetchUserData, saveMoodLogToDb, saveJournalEntryToDb } from '../services/db';

// In-memory mock for localStorage for Node test runner
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = localStorageMock;
}

describe('Security & Database Storage Services', () => {
  const createTestUser = () => ({
    email: `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@mindease.edu`,
    password: 'SecurePassword123!',
    name: 'Test Aspirant',
    exam: 'JEE Advanced'
  });

  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  describe('Password Hashing & Cryptography', () => {
    it('should generate deterministic SHA-256 hashes', async () => {
      const pwd = 'StudentPassword123!';
      const hash1 = await hashPassword(pwd);
      const hash2 = await hashPassword(pwd);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // SHA-256 hex string length
      expect(hash1).not.toBe(pwd);
    });

    it('should generate distinct hashes for different passwords', async () => {
      const hashA = await hashPassword('PasswordA');
      const hashB = await hashPassword('PasswordB');
      expect(hashA).not.toBe(hashB);
    });
  });

  describe('User Registration & Local Authentication', () => {
    it('should register a new user successfully in fallback store', async () => {
      const user = createTestUser();
      const res = await registerUser(user);
      expect(res).toHaveProperty('email', user.email);
      expect(res).toHaveProperty('name', user.name);
      expect(res).toHaveProperty('exam', user.exam);
    });

    it('should reject duplicate registration with clear error', async () => {
      const user = createTestUser();
      await registerUser(user);
      await expect(registerUser(user)).rejects.toThrow('already exists');
    });

    it('should authenticate registered user with correct credentials', async () => {
      const user = createTestUser();
      await registerUser(user);
      const authenticatedUser = await loginUser({ email: user.email, password: user.password });
      expect(authenticatedUser).toHaveProperty('email', user.email);
      expect(authenticatedUser.name).toBe(user.name);
    });

    it('should reject login attempt with incorrect password', async () => {
      const user = createTestUser();
      await registerUser(user);
      await expect(loginUser({ email: user.email, password: 'WrongPassword!' })).rejects.toThrow('Invalid email or password');
    });

    it('should reject login attempt for non-existent user email', async () => {
      await expect(loginUser({ email: 'nonexistent@mindease.edu', password: 'AnyPassword' })).rejects.toThrow('Invalid email or password');
    });
  });

  describe('UserData & Wellness Logs Persistence', () => {
    it('should fetch empty initial wellness data for newly registered user', async () => {
      const user = createTestUser();
      await registerUser(user);
      const data = await fetchUserData(user.email);
      expect(data).toHaveProperty('moodHistory');
      expect(data).toHaveProperty('journalHistory');
      expect(Array.isArray(data.moodHistory)).toBe(true);
      expect(Array.isArray(data.journalHistory)).toBe(true);
    });

    it('should save and retrieve mood logs accurately', async () => {
      const user = createTestUser();
      await registerUser(user);
      const moodLog = {
        date: '2026-06-27',
        mood: 7,
        energy: 8,
        stressors: ['Mock Test', 'Time Management']
      };
      await saveMoodLogToDb(user.email, moodLog);
      const updatedData = await fetchUserData(user.email);
      expect(updatedData.moodHistory.length).toBeGreaterThan(0);
      expect(updatedData.moodHistory[0].mood).toBe(7);
    });

    it('should save and retrieve journal entries accurately', async () => {
      const user = createTestUser();
      await registerUser(user);
      const journalEntry = {
        date: '2026-06-27',
        entryText: 'Today was productive. Solved 20 physics numericals.',
        analysis: { moodScore: 8, primaryStressors: ['Study Focus'] },
        isCrisis: false
      };
      await saveJournalEntryToDb(user.email, journalEntry);
      const updatedData = await fetchUserData(user.email);
      expect(updatedData.journalHistory.length).toBeGreaterThan(0);
      expect(updatedData.journalHistory[0].entryText || updatedData.journalHistory[0].entry_text).toContain('productive');
    });
  });
});
