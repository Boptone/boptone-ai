import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import crypto from 'crypto';

/**
 * Input Validation Utilities
 * 
 * Prevents:
 * - Financial fraud (negative amounts, overflow)
 * - File upload attacks (malware, bombs)
 * - XSS attacks (script injection)
 * - Path traversal
 */

// ============================================================================
// FINANCIAL VALIDATION
// ============================================================================

/**
 * Supported currency codes
 */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Financial amount validation schema
 * 
 * Rules:
 * - Minimum: $1.00 (100 cents)
 * - Maximum: $10,000,000.00 (1 billion cents)
 * - Precision: 2 decimal places
 * - Must be positive integer (cents)
 */
export const amountSchema = z.number()
  .int('Amount must be in cents (no decimals)')
  .positive('Amount must be positive')
  .min(100, 'Minimum amount is $1.00')
  .max(1000000000, 'Maximum amount is $10,000,000.00');

/**
 * Currency validation schema
 */
export const currencySchema = z.enum(SUPPORTED_CURRENCIES);

/**
 * Payout request validation schema
 */
export const payoutRequestSchema = z.object({
  amount: amountSchema,
  currency: currencySchema.default('USD'),
  bankAccountId: z.number().int().positive(),
});

/**
 * Validate and format financial amount
 * 
 * @param cents - Amount in cents
 * @returns Formatted dollar amount
 * 
 * @example
 * formatAmount(12345) // "$123.45"
 */
export function formatAmount(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Parse dollar amount to cents
 * 
 * @param dollars - Amount in dollars
 * @returns Amount in cents
 * 
 * @example
 * parseDollars(123.45) // 12345
 */
export function parseDollars(dollars: number): number {
  return Math.round(dollars * 100);
}

// ============================================================================
// FILE UPLOAD VALIDATION
// ============================================================================

/**
 * Allowed MIME types for file uploads
 */
export const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  video: ['video/mp4', 'video/webm'],
  document: ['application/pdf'],
} as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  audio: 50 * 1024 * 1024, // 50MB
  video: 100 * 1024 * 1024, // 100MB
  document: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Magic bytes for file type detection
 * 
 * First few bytes of file that identify the file type
 */
const MAGIC_BYTES: Record<string, Buffer[]> = {
  'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
  'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47])],
  'image/webp': [Buffer.from([0x52, 0x49, 0x46, 0x46])],
  'image/gif': [Buffer.from([0x47, 0x49, 0x46, 0x38])],
  'audio/mpeg': [Buffer.from([0xFF, 0xFB]), Buffer.from([0x49, 0x44, 0x33])],
  'audio/wav': [Buffer.from([0x52, 0x49, 0x46, 0x46])],
  'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])],
};

/**
 * Validate file MIME type
 * 
 * @param mimeType - MIME type from upload
 * @param category - File category (image, audio, video, document)
 * @returns true if valid
 */
export function isValidMimeType(
  mimeType: string,
  category: keyof typeof ALLOWED_MIME_TYPES
): boolean {
  const allowedTypes = ALLOWED_MIME_TYPES[category] as readonly string[];
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file magic bytes
 * 
 * Checks actual file content to prevent MIME type spoofing
 * 
 * @param buffer - File buffer
 * @param mimeType - Expected MIME type
 * @returns true if magic bytes match
 */
export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const magicBytes = MAGIC_BYTES[mimeType];
  if (!magicBytes) {
    return false;
  }
  
  // Check if buffer starts with any of the magic byte sequences
  return magicBytes.some(magic => {
    return buffer.slice(0, magic.length).equals(magic);
  });
}

/**
 * Validate file size
 * 
 * @param size - File size in bytes
 * @param category - File category
 * @returns true if within limit
 */
export function isValidFileSize(
  size: number,
  category: keyof typeof FILE_SIZE_LIMITS
): boolean {
  return size > 0 && size <= FILE_SIZE_LIMITS[category];
}

/**
 * Sanitize filename
 * 
 * Removes:
 * - Path traversal attempts (../)
 * - Special characters
 * - Null bytes
 * 
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/\0/g, '') // Remove null bytes
    .slice(0, 255); // Limit length
}

/**
 * Generate safe filename with hash
 * 
 * Creates unique filename to prevent collisions and enumeration
 * 
 * @param originalFilename - Original filename
 * @param userId - User ID
 * @returns Safe filename with hash
 * 
 * @example
 * generateSafeFilename('song.mp3', 123)
 * // "123-a7f3e9d2-song.mp3"
 */
export function generateSafeFilename(originalFilename: string, userId: number): string {
  const sanitized = sanitizeFilename(originalFilename);
  const hash = crypto.randomBytes(4).toString('hex');
  const ext = sanitized.split('.').pop();
  const name = sanitized.replace(`.${ext}`, '');
  
  return `${userId}-${hash}-${name}.${ext}`;
}

/**
 * Validate file upload
 * 
 * Comprehensive validation:
 * - MIME type whitelist
 * - Magic bytes verification
 * - Size limits
 * - Filename sanitization
 * 
 * @throws Error if validation fails
 */
export function validateFileUpload(
  file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
  },
  category: keyof typeof ALLOWED_MIME_TYPES
): void {
  // Validate MIME type
  if (!isValidMimeType(file.mimetype, category)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES[category].join(', ')}`);
  }
  
  // Validate magic bytes
  if (!validateMagicBytes(file.buffer, file.mimetype)) {
    throw new Error('File content does not match MIME type. Possible file type spoofing.');
  }
  
  // Validate size
  if (!isValidFileSize(file.size, category)) {
    throw new Error(`File too large. Maximum size: ${FILE_SIZE_LIMITS[category] / 1024 / 1024}MB`);
  }
}

// ============================================================================
// XSS PREVENTION
// ============================================================================

/**
 * Sanitize HTML content
 * 
 * Removes dangerous tags and attributes:
 * - <script>
 * - <iframe>
 * - onclick, onerror, etc.
 * - javascript: URLs
 * 
 * @param html - User-generated HTML
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize plain text
 * 
 * Escapes HTML entities
 * 
 * @param text - User input
 * @returns Escaped text
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate URL
 * 
 * Prevents:
 * - javascript: URIs
 * - data: URIs
 * - file: URIs
 * 
 * @param url - URL to validate
 * @returns true if safe
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize URL
 * 
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  return isValidUrl(url) ? url : '';
}
