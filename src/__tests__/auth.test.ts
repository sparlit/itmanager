import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, createToken, verifyToken } from '../lib/auth';
import { loginSchema } from '../lib/validations';

describe('auth', () => {
  describe('hashPassword & verifyPassword', () => {
    it('should hash and verify password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const hash = await hashPassword('correctPassword');
      
      const isValid = await verifyPassword('wrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT token', () => {
    it('should create and verify token', async () => {
      const payload = { userId: 'user123', username: 'testuser', role: 'Staff' };
      const token = await createToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const verified = await verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe('user123');
      expect(verified?.username).toBe('testuser');
    });

    it('should return null for invalid token', async () => {
      const verified = await verifyToken('invalid-token');
      expect(verified).toBeNull();
    });
  });
});

describe('login validation', () => {
  it('should validate login schema properly', () => {
    const valid = loginSchema.safeParse({ username: 'admin', password: 'admin123' });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({ username: '', password: '' });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0].message).toContain('required');
    }
  });
});