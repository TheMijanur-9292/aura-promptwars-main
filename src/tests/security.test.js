import { describe, it, expect } from 'vitest';
import { checkCrisisTrigger } from '../services/groq';
import { hashPassword } from '../services/db';

describe('Security & XSS / Injection Mitigation Tests', () => {
  describe('Input Sanitization & Protection', () => {
    it('should safely handle malicious script tags in input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      expect(checkCrisisTrigger(maliciousInput)).toBe(false);
    });

    it('should safely handle SQL injection strings', () => {
      const sqlInjection = "' OR '1'='1";
      expect(checkCrisisTrigger(sqlInjection)).toBe(false);
    });

    it('should safely handle large payload inputs without crashing', () => {
      const largeInput = 'A'.repeat(50000);
      expect(checkCrisisTrigger(largeInput)).toBe(false);
    });
  });

  describe('Cryptographic Password Hash Integrity', () => {
    it('should not leak plaintext passwords in hashed strings', async () => {
      const plain = 'MySecretPass2026!';
      const hashed = await hashPassword(plain);
      expect(hashed.includes(plain)).toBe(false);
    });

    it('should ensure hash output format conforms to hex standard', async () => {
      const hashed = await hashPassword('TestPass');
      expect(/^[0-9a-f]{64}$/.test(hashed)).toBe(true);
    });
  });
});
