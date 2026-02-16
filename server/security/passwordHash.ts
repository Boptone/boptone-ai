import bcrypt from 'bcrypt';

/**
 * Password Hashing Utilities
 * 
 * Uses bcrypt with 12 salt rounds for secure password storage.
 * NEVER store passwords in plaintext.
 */

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * 
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 * 
 * @example
 * const hashedPassword = await hashPassword('mySecurePassword123');
 * // Store hashedPassword in database
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a stored hash
 * 
 * @param password - Plain text password to verify
 * @param hash - Stored password hash from database
 * @returns Promise resolving to true if password matches, false otherwise
 * 
 * @example
 * const isValid = await verifyPassword(inputPassword, storedHash);
 * if (isValid) {
 *   // Password correct, log user in
 * } else {
 *   // Password incorrect, reject login
 * }
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hash);
  } catch (error) {
    console.error('[Security] Password verification failed:', error);
    return false;
  }
}

/**
 * Check if a password meets minimum security requirements
 * 
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * 
 * @param password - Password to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
}
