import { describe, it, expect } from 'vitest';
import { hashPassword } from '../services/db';

describe('Security & Database Service Tests', () => {
  it('should generate deterministic SHA-256 password hashes', async () => {
    const pwd = 'StudentPassword123!';
    const hash1 = await hashPassword(pwd);
    const hash2 = await hashPassword(pwd);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex string length
    expect(hash1).not.toBe(pwd);
  });
});
