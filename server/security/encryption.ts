import crypto from 'crypto';

/**
 * Encryption Utilities for Sensitive Data
 * 
 * Uses AES-256-CBC for encrypting sensitive information like:
 * - Bank account numbers
 * - Social Security Numbers
 * - Tax IDs
 * - Other PII that needs to be recoverable
 * 
 * DO NOT use for passwords - use passwordHash.ts instead
 */

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Get encryption key from environment
 * Key must be 32 bytes (64 hex characters)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }
  
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt sensitive data
 * 
 * @param plaintext - Data to encrypt (e.g., bank account number)
 * @returns Encrypted string in format "iv:encryptedData"
 * 
 * @example
 * const encrypted = encryptData('1234567890'); // Bank account number
 * // Store encrypted in database
 */
export function encryptData(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty data');
  }
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data (both needed for decryption)
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 * 
 * @param ciphertext - Encrypted string in format "iv:encryptedData"
 * @returns Decrypted plaintext
 * 
 * @example
 * const accountNumber = decryptData(storedEncryptedValue);
 * // Use accountNumber for payout processing
 */
export function decryptData(ciphertext: string): string {
  if (!ciphertext || !ciphertext.includes(':')) {
    throw new Error('Invalid encrypted data format');
  }
  
  const key = getEncryptionKey();
  const parts = ciphertext.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Hash data one-way (for duplicate detection)
 * 
 * Use this when you need to check if data exists but don't need to recover it.
 * Example: Checking if a bank account is already registered without storing the full number.
 * 
 * @param data - Data to hash
 * @returns SHA-256 hash
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a new encryption key
 * 
 * Run this ONCE during initial setup to generate ENCRYPTION_KEY.
 * Store the key securely in environment variables.
 * 
 * @returns 32-byte key as hex string
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Encrypt bank account number
 * 
 * Stores encrypted full number + last 4 digits for display
 * 
 * @param accountNumber - Full bank account number
 * @returns Object with encrypted full number and last 4 digits
 */
export function encryptBankAccount(accountNumber: string): {
  encrypted: string;
  last4: string;
  hash: string;
} {
  if (!accountNumber || accountNumber.length < 4) {
    throw new Error('Invalid account number');
  }
  
  return {
    encrypted: encryptData(accountNumber),
    last4: accountNumber.slice(-4),
    hash: hashData(accountNumber), // For duplicate detection
  };
}

/**
 * Decrypt bank account number
 * 
 * @param encrypted - Encrypted account number from database
 * @returns Full decrypted account number
 */
export function decryptBankAccount(encrypted: string): string {
  return decryptData(encrypted);
}
