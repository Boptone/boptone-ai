import { describe, it, expect, beforeAll } from 'vitest';
import {
  encryptBankAccount,
  decryptBankAccount,
  encryptRoutingNumber,
  decryptRoutingNumber,
  encryptTaxId,
  decryptTaxId,
  getLast4Digits,
  maskAccountNumber,
  maskRoutingNumber,
  maskSSN,
  accountsMatch,
} from './dbEncryption';

/**
 * Database Encryption Test Suite
 */

// Set encryption key for testing
beforeAll(() => {
  if (!process.env.ENCRYPTION_KEY) {
    // Generate a test key (32 bytes = 64 hex characters)
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  }
});

describe('Bank Account Encryption', () => {
  it('should encrypt and decrypt bank account numbers', () => {
    const accountNumber = '1234567890';
    const encrypted = encryptBankAccount(accountNumber);
    const decrypted = decryptBankAccount(encrypted);
    
    expect(encrypted).not.toBe(accountNumber);
    expect(decrypted).toBe(accountNumber);
  });

  it('should reject invalid account numbers', () => {
    expect(() => encryptBankAccount('12345')).toThrow('Invalid bank account number format');
    expect(() => encryptBankAccount('abc123')).toThrow('Invalid bank account number format');
    expect(() => encryptBankAccount('')).toThrow('Bank account number is required');
  });

  it('should handle different account number lengths', () => {
    const short = '123456789'; // 9 digits (minimum)
    const long = '12345678901234567'; // 17 digits (maximum)
    
    expect(decryptBankAccount(encryptBankAccount(short))).toBe(short);
    expect(decryptBankAccount(encryptBankAccount(long))).toBe(long);
  });
});

describe('Routing Number Encryption', () => {
  it('should encrypt and decrypt routing numbers', () => {
    const routingNumber = '123456789';
    const encrypted = encryptRoutingNumber(routingNumber);
    const decrypted = decryptRoutingNumber(encrypted);
    
    expect(encrypted).not.toBe(routingNumber);
    expect(decrypted).toBe(routingNumber);
  });

  it('should reject invalid routing numbers', () => {
    expect(() => encryptRoutingNumber('12345')).toThrow('Invalid routing number format');
    expect(() => encryptRoutingNumber('1234567890')).toThrow('Invalid routing number format');
    expect(() => encryptRoutingNumber('')).toThrow('Routing number is required');
  });

  it('should only accept 9-digit routing numbers', () => {
    const valid = '021000021'; // Chase Bank routing number
    expect(decryptRoutingNumber(encryptRoutingNumber(valid))).toBe(valid);
  });
});

describe('Tax ID Encryption', () => {
  it('should encrypt and decrypt SSN', () => {
    const ssn = '123456789';
    const encrypted = encryptTaxId(ssn);
    const decrypted = decryptTaxId(encrypted);
    
    expect(encrypted).not.toBe(ssn);
    expect(decrypted).toBe(ssn);
  });

  it('should handle SSN with hyphens', () => {
    const ssnWithHyphens = '123-45-6789';
    const encrypted = encryptTaxId(ssnWithHyphens);
    const decrypted = decryptTaxId(encrypted);
    
    expect(decrypted).toBe('123456789'); // Hyphens removed
  });

  it('should reject invalid tax IDs', () => {
    expect(() => encryptTaxId('12345')).toThrow('Invalid tax ID format');
    expect(() => encryptTaxId('abc123456')).toThrow('Invalid tax ID format');
    expect(() => encryptTaxId('')).toThrow('Tax ID is required');
  });
});

describe('Account Masking', () => {
  it('should get last 4 digits of account number', () => {
    expect(getLast4Digits('1234567890')).toBe('7890');
    expect(getLast4Digits('123456789')).toBe('6789');
  });

  it('should mask account numbers', () => {
    expect(maskAccountNumber('1234567890')).toBe('****7890');
    expect(maskAccountNumber('123456789')).toBe('****6789');
  });

  it('should mask routing numbers', () => {
    expect(maskRoutingNumber('123456789')).toBe('****6789');
  });

  it('should mask SSN', () => {
    expect(maskSSN('123456789')).toBe('***-**-6789');
  });

  it('should handle short account numbers gracefully', () => {
    expect(() => getLast4Digits('123')).toThrow('Account number must be at least 4 digits');
    expect(maskAccountNumber('123')).toBe('****');
  });
});

describe('Account Comparison', () => {
  it('should detect matching accounts', () => {
    const accountNumber = '1234567890';
    const encrypted1 = encryptBankAccount(accountNumber);
    const encrypted2 = encryptBankAccount(accountNumber);
    
    expect(accountsMatch(encrypted1, encrypted2)).toBe(true);
  });

  it('should detect different accounts', () => {
    const account1 = '1234567890';
    const account2 = '0987654321';
    const encrypted1 = encryptBankAccount(account1);
    const encrypted2 = encryptBankAccount(account2);
    
    expect(accountsMatch(encrypted1, encrypted2)).toBe(false);
  });

  it('should handle invalid encrypted data', () => {
    expect(accountsMatch('invalid1', 'invalid2')).toBe(false);
  });
});

describe('Encryption Security', () => {
  it('should produce different ciphertext for same plaintext (IV randomization)', () => {
    const accountNumber = '1234567890';
    const encrypted1 = encryptBankAccount(accountNumber);
    const encrypted2 = encryptBankAccount(accountNumber);
    
    // Different ciphertext due to random IV
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both decrypt to same value
    expect(decryptBankAccount(encrypted1)).toBe(accountNumber);
    expect(decryptBankAccount(encrypted2)).toBe(accountNumber);
  });

  it('should not expose plaintext in encrypted data', () => {
    const accountNumber = '1234567890';
    const encrypted = encryptBankAccount(accountNumber);
    
    // Encrypted data should not contain plaintext
    expect(encrypted).not.toContain('1234567890');
    expect(encrypted).not.toContain('1234');
    expect(encrypted).not.toContain('7890');
  });

  it('should fail decryption with wrong key', () => {
    const accountNumber = '1234567890';
    const encrypted = encryptBankAccount(accountNumber);
    
    // Change encryption key
    const originalKey = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';
    
    // Decryption should fail
    expect(() => decryptBankAccount(encrypted)).toThrow();
    
    // Restore key
    process.env.ENCRYPTION_KEY = originalKey;
  });
});
