import { encryptData, decryptData } from './encryption';

/**
 * Database Encryption Wrapper
 * 
 * Provides automatic encryption/decryption for sensitive database fields.
 * Uses AES-256-GCM encryption from encryption.ts.
 * 
 * Usage:
 * ```ts
 * // Encrypt before INSERT
 * const encryptedAccount = encryptBankAccount(accountNumber);
 * await db.insert(payoutAccounts).values({ ...data, accountNumber: encryptedAccount });
 * 
 * // Decrypt after SELECT
 * const account = await db.select().from(payoutAccounts).where(...);
 * const decryptedAccount = decryptBankAccount(account.accountNumber);
 * ```
 */

/**
 * Encrypt bank account number
 * 
 * @param accountNumber - Plain bank account number
 * @returns Encrypted account number (base64)
 */
export function encryptBankAccount(accountNumber: string): string {
  if (!accountNumber) {
    throw new Error('Bank account number is required');
  }
  
  // Validate account number format (9-17 digits)
  if (!/^\d{9,17}$/.test(accountNumber)) {
    throw new Error('Invalid bank account number format');
  }
  
  return encryptData(accountNumber);
}

/**
 * Decrypt bank account number
 * 
 * @param encryptedAccountNumber - Encrypted account number (base64)
 * @returns Plain bank account number
 */
export function decryptBankAccount(encryptedAccountNumber: string): string {
  if (!encryptedAccountNumber) {
    throw new Error('Encrypted bank account number is required');
  }
  
  return decryptData(encryptedAccountNumber);
}

/**
 * Encrypt routing number
 * 
 * @param routingNumber - Plain routing number
 * @returns Encrypted routing number (base64)
 */
export function encryptRoutingNumber(routingNumber: string): string {
  if (!routingNumber) {
    throw new Error('Routing number is required');
  }
  
  // Validate routing number format (9 digits)
  if (!/^\d{9}$/.test(routingNumber)) {
    throw new Error('Invalid routing number format (must be 9 digits)');
  }
  
  return encryptData(routingNumber);
}

/**
 * Decrypt routing number
 * 
 * @param encryptedRoutingNumber - Encrypted routing number (base64)
 * @returns Plain routing number
 */
export function decryptRoutingNumber(encryptedRoutingNumber: string): string {
  if (!encryptedRoutingNumber) {
    throw new Error('Encrypted routing number is required');
  }
  
  return decryptData(encryptedRoutingNumber);
}

/**
 * Encrypt SSN or Tax ID
 * 
 * @param taxId - Plain SSN or EIN
 * @returns Encrypted tax ID (base64)
 */
export function encryptTaxId(taxId: string): string {
  if (!taxId) {
    throw new Error('Tax ID is required');
  }
  
  // Remove hyphens and spaces
  const cleanedTaxId = taxId.replace(/[-\s]/g, '');
  
  // Validate SSN (9 digits) or EIN (9 digits)
  if (!/^\d{9}$/.test(cleanedTaxId)) {
    throw new Error('Invalid tax ID format (must be 9 digits)');
  }
  
  return encryptData(cleanedTaxId);
}

/**
 * Decrypt SSN or Tax ID
 * 
 * @param encryptedTaxId - Encrypted tax ID (base64)
 * @returns Plain tax ID
 */
export function decryptTaxId(encryptedTaxId: string): string {
  if (!encryptedTaxId) {
    throw new Error('Encrypted tax ID is required');
  }
  
  return decryptData(encryptedTaxId);
}

/**
 * Get last 4 digits of account number (for display)
 * 
 * @param accountNumber - Plain account number
 * @returns Last 4 digits
 */
export function getLast4Digits(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) {
    throw new Error('Account number must be at least 4 digits');
  }
  
  return accountNumber.slice(-4);
}

/**
 * Format account number for display (e.g., "****1234")
 * 
 * @param accountNumber - Plain account number
 * @returns Masked account number
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) {
    return '****';
  }
  
  const last4 = accountNumber.slice(-4);
  return `****${last4}`;
}

/**
 * Format routing number for display (e.g., "****5678")
 * 
 * @param routingNumber - Plain routing number
 * @returns Masked routing number
 */
export function maskRoutingNumber(routingNumber: string): string {
  if (!routingNumber || routingNumber.length !== 9) {
    return '****';
  }
  
  const last4 = routingNumber.slice(-4);
  return `****${last4}`;
}

/**
 * Format SSN for display (e.g., "***-**-1234")
 * 
 * @param ssn - Plain SSN
 * @returns Masked SSN
 */
export function maskSSN(ssn: string): string {
  if (!ssn || ssn.length !== 9) {
    return '***-**-****';
  }
  
  const last4 = ssn.slice(-4);
  return `***-**-${last4}`;
}

/**
 * Validate bank account ownership
 * 
 * Checks if two account numbers match (for duplicate detection)
 * without storing the full account number in plaintext.
 * 
 * @param encryptedAccount1 - First encrypted account number
 * @param encryptedAccount2 - Second encrypted account number
 * @returns true if accounts match
 */
export function accountsMatch(
  encryptedAccount1: string,
  encryptedAccount2: string
): boolean {
  try {
    const account1 = decryptData(encryptedAccount1);
    const account2 = decryptData(encryptedAccount2);
    return account1 === account2;
  } catch (error) {
    console.error('[Encryption] Failed to compare accounts:', error);
    return false;
  }
}

/**
 * Generate account hash for duplicate detection
 * 
 * DEPRECATED: Use encrypted account number instead.
 * This function is kept for backward compatibility only.
 * 
 * @param accountNumber - Plain account number
 * @returns SHA-256 hash (for duplicate detection only, cannot decrypt)
 */
export function generateAccountHash(accountNumber: string): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(accountNumber)
    .digest('hex');
}
