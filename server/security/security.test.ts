import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, verifyPassword, validatePasswordStrength } from './passwordHash';
import { encryptData, decryptData, encryptBankAccount, decryptBankAccount, hashData } from './encryption';

/**
 * Security Utilities Test Suite
 * 
 * Tests password hashing, encryption, and data protection utilities
 */

describe('Password Hashing', () => {
  it('should hash passwords securely', async () => {
    const password = 'SecurePassword123';
    const hash = await hashPassword(password);
    
    // Hash should not equal password
    expect(hash).not.toBe(password);
    
    // Hash should be bcrypt format ($2b$...)
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  it('should verify correct passwords', async () => {
    const password = 'SecurePassword123';
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect passwords', async () => {
    const password = 'SecurePassword123';
    const wrongPassword = 'WrongPassword123';
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  it('should reject passwords under 8 characters', async () => {
    await expect(hashPassword('Short1')).rejects.toThrow();
  });

  it('should validate password strength correctly', () => {
    // Valid password
    const valid = validatePasswordStrength('SecurePass123');
    expect(valid.isValid).toBe(true);
    
    // Too short
    const tooShort = validatePasswordStrength('Short1');
    expect(tooShort.isValid).toBe(false);
    expect(tooShort.error).toContain('8 characters');
    
    // No uppercase
    const noUppercase = validatePasswordStrength('securepass123');
    expect(noUppercase.isValid).toBe(false);
    expect(noUppercase.error).toContain('uppercase');
    
    // No lowercase
    const noLowercase = validatePasswordStrength('SECUREPASS123');
    expect(noLowercase.isValid).toBe(false);
    expect(noLowercase.error).toContain('lowercase');
    
    // No number
    const noNumber = validatePasswordStrength('SecurePassword');
    expect(noNumber.isValid).toBe(false);
    expect(noNumber.error).toContain('number');
  });
});

describe('Data Encryption', () => {
  // Set encryption key for tests
  beforeAll(() => {
    // Generate a test encryption key (32 bytes = 64 hex characters)
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  it('should encrypt and decrypt data correctly', () => {
    const plaintext = '1234567890'; // Bank account number
    
    const encrypted = encryptData(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted).toContain(':'); // IV:encrypted format
    
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for same plaintext', () => {
    const plaintext = '1234567890';
    
    const encrypted1 = encryptData(plaintext);
    const encrypted2 = encryptData(plaintext);
    
    // Different IVs should produce different ciphertexts
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both should decrypt to same plaintext
    expect(decryptData(encrypted1)).toBe(plaintext);
    expect(decryptData(encrypted2)).toBe(plaintext);
  });

  it('should reject empty data', () => {
    expect(() => encryptData('')).toThrow();
  });

  it('should reject invalid ciphertext format', () => {
    expect(() => decryptData('invalid')).toThrow();
    expect(() => decryptData('no:colons:here')).toThrow();
  });
});

describe('Bank Account Encryption', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  it('should encrypt bank account with last 4 digits', () => {
    const accountNumber = '1234567890';
    
    const result = encryptBankAccount(accountNumber);
    
    expect(result.encrypted).toBeDefined();
    expect(result.last4).toBe('7890');
    expect(result.hash).toBeDefined();
    
    // Verify decryption
    const decrypted = decryptBankAccount(result.encrypted);
    expect(decrypted).toBe(accountNumber);
  });

  it('should produce consistent hashes for duplicate detection', () => {
    const accountNumber = '1234567890';
    
    const result1 = encryptBankAccount(accountNumber);
    const result2 = encryptBankAccount(accountNumber);
    
    // Hashes should match (for duplicate detection)
    expect(result1.hash).toBe(result2.hash);
    
    // But encrypted values should differ (different IVs)
    expect(result1.encrypted).not.toBe(result2.encrypted);
  });

  it('should reject invalid account numbers', () => {
    expect(() => encryptBankAccount('')).toThrow();
    expect(() => encryptBankAccount('123')).toThrow(); // Too short
  });
});

describe('Data Hashing', () => {
  it('should produce consistent hashes', () => {
    const data = '1234567890';
    
    const hash1 = hashData(data);
    const hash2 = hashData(data);
    
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different data', () => {
    const hash1 = hashData('1234567890');
    const hash2 = hashData('0987654321');
    
    expect(hash1).not.toBe(hash2);
  });

  it('should produce SHA-256 hashes', () => {
    const hash = hashData('test');
    
    // SHA-256 produces 64 hex characters
    expect(hash.length).toBe(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
