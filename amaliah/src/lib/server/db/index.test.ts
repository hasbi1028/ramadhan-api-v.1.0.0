/**
 * ═══════════════════════════════════════════════════════
 * Password Functions Tests
 * ═══════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../db';

describe('Password Functions', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'test123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'test123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle special characters in password', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'test123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const password = 'test123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('wrong123', hash);
      
      expect(isValid).toBe(false);
    });

    it('should reject empty password', async () => {
      const password = 'test123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);
      
      expect(isValid).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'Test123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('test123', hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Password Strength', () => {
    it('should hash short passwords', async () => {
      const password = '123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should hash long passwords', async () => {
      const password = 'a'.repeat(100);
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });
  });
});
