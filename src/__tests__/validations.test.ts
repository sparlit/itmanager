import { describe, it, expect } from 'vitest';
import { 
  loginSchema, 
  staffSchema, 
  assetSchema, 
  vendorSchema,
  paginationSchema 
} from '../lib/validations';

describe('validations', () => {
  describe('loginSchema', () => {
    it('should validate correct credentials', () => {
      const result = loginSchema.safeParse({ username: 'admin', password: 'pass123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty username', () => {
      const result = loginSchema.safeParse({ username: '', password: 'pass123' });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({ username: 'admin', password: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('staffSchema', () => {
    it('should validate correct staff data', () => {
      const result = staffSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = staffSchema.safeParse({
        name: 'John Doe',
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const result = staffSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('assetSchema', () => {
    it('should validate correct asset data', () => {
      const result = assetSchema.safeParse({
        name: 'MacBook Pro',
        serialNumber: 'SN123456',
        category: 'Laptop',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = assetSchema.safeParse({
        name: 'MacBook Pro',
        serialNumber: 'SN123456',
        category: 'Laptop',
        status: 'InvalidStatus',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('vendorSchema', () => {
    it('should validate correct vendor data', () => {
      const result = vendorSchema.safeParse({
        name: 'Acme Corp',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = vendorSchema.safeParse({
        name: 'Acme Corp',
        email: 'not-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should use defaults', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should coerce string to number', () => {
      const result = paginationSchema.parse({ page: '2', limit: '10' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('should handle large limit gracefully', () => {
      const result = paginationSchema.safeParse({ limit: '200' });
      expect(result.success).toBe(false); // Zod throws instead of clamping
    });
  });
});