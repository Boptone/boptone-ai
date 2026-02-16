import { describe, it, expect } from 'vitest';
import {
  amountSchema,
  currencySchema,
  formatAmount,
  parseDollars,
  isValidMimeType,
  validateMagicBytes,
  isValidFileSize,
  sanitizeFilename,
  generateSafeFilename,
  sanitizeHtml,
  sanitizeText,
  isValidUrl,
  sanitizeUrl,
} from './inputValidation';

/**
 * Input Validation Test Suite
 */

describe('Financial Amount Validation', () => {
  it('should accept valid amounts', () => {
    expect(amountSchema.parse(100)).toBe(100); // $1.00
    expect(amountSchema.parse(12345)).toBe(12345); // $123.45
    expect(amountSchema.parse(1000000000)).toBe(1000000000); // $10M
  });

  it('should reject amounts below $1', () => {
    expect(() => amountSchema.parse(99)).toThrow();
    expect(() => amountSchema.parse(50)).toThrow();
  });

  it('should reject amounts above $10M', () => {
    expect(() => amountSchema.parse(1000000001)).toThrow();
  });

  it('should reject negative amounts', () => {
    expect(() => amountSchema.parse(-100)).toThrow();
  });

  it('should reject decimal amounts', () => {
    expect(() => amountSchema.parse(123.45)).toThrow();
  });

  it('should format amounts correctly', () => {
    expect(formatAmount(100)).toBe('$1.00');
    expect(formatAmount(12345)).toBe('$123.45');
    expect(formatAmount(1000000)).toBe('$10000.00');
  });

  it('should parse dollars to cents', () => {
    expect(parseDollars(1.00)).toBe(100);
    expect(parseDollars(123.45)).toBe(12345);
    expect(parseDollars(10000.00)).toBe(1000000);
  });
});

describe('Currency Validation', () => {
  it('should accept supported currencies', () => {
    expect(currencySchema.parse('USD')).toBe('USD');
    expect(currencySchema.parse('EUR')).toBe('EUR');
    expect(currencySchema.parse('GBP')).toBe('GBP');
  });

  it('should reject unsupported currencies', () => {
    expect(() => currencySchema.parse('JPY')).toThrow();
    expect(() => currencySchema.parse('BTC')).toThrow();
  });
});

describe('MIME Type Validation', () => {
  it('should accept valid image MIME types', () => {
    expect(isValidMimeType('image/jpeg', 'image')).toBe(true);
    expect(isValidMimeType('image/png', 'image')).toBe(true);
    expect(isValidMimeType('image/webp', 'image')).toBe(true);
  });

  it('should reject invalid MIME types', () => {
    expect(isValidMimeType('application/exe', 'image')).toBe(false);
    expect(isValidMimeType('text/html', 'image')).toBe(false);
  });

  it('should accept valid audio MIME types', () => {
    expect(isValidMimeType('audio/mpeg', 'audio')).toBe(true);
    expect(isValidMimeType('audio/wav', 'audio')).toBe(true);
  });
});

describe('Magic Bytes Validation', () => {
  it('should validate JPEG magic bytes', () => {
    const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
    expect(validateMagicBytes(jpegBuffer, 'image/jpeg')).toBe(true);
  });

  it('should validate PNG magic bytes', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A]);
    expect(validateMagicBytes(pngBuffer, 'image/png')).toBe(true);
  });

  it('should reject mismatched magic bytes', () => {
    const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
    expect(validateMagicBytes(jpegBuffer, 'image/png')).toBe(false);
  });

  it('should reject unknown MIME types', () => {
    const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(validateMagicBytes(buffer, 'application/unknown')).toBe(false);
  });
});

describe('File Size Validation', () => {
  it('should accept files within limits', () => {
    expect(isValidFileSize(5 * 1024 * 1024, 'image')).toBe(true); // 5MB image
    expect(isValidFileSize(25 * 1024 * 1024, 'audio')).toBe(true); // 25MB audio
  });

  it('should reject files exceeding limits', () => {
    expect(isValidFileSize(15 * 1024 * 1024, 'image')).toBe(false); // 15MB image (limit 10MB)
    expect(isValidFileSize(60 * 1024 * 1024, 'audio')).toBe(false); // 60MB audio (limit 50MB)
  });

  it('should reject zero-byte files', () => {
    expect(isValidFileSize(0, 'image')).toBe(false);
  });
});

describe('Filename Sanitization', () => {
  it('should remove path traversal attempts', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('___etc_passwd');
    expect(sanitizeFilename('../../malicious.exe')).toBe('__malicious.exe');
  });

  it('should remove special characters', () => {
    expect(sanitizeFilename('file<>:"|?*.txt')).toBe('file_______.txt');
  });

  it('should remove null bytes', () => {
    expect(sanitizeFilename('file\0name.txt')).toBe('file_name.txt');
  });

  it('should preserve valid filenames', () => {
    expect(sanitizeFilename('my-song_v2.mp3')).toBe('my-song_v2.mp3');
  });

  it('should limit filename length', () => {
    const longName = 'a'.repeat(300) + '.txt';
    const sanitized = sanitizeFilename(longName);
    expect(sanitized.length).toBeLessThanOrEqual(255);
  });
});

describe('Safe Filename Generation', () => {
  it('should generate unique filenames', () => {
    const filename1 = generateSafeFilename('song.mp3', 123);
    const filename2 = generateSafeFilename('song.mp3', 123);
    
    expect(filename1).not.toBe(filename2); // Different hashes
  });

  it('should include user ID', () => {
    const filename = generateSafeFilename('song.mp3', 123);
    expect(filename).toMatch(/^123-/);
  });

  it('should preserve file extension', () => {
    const filename = generateSafeFilename('song.mp3', 123);
    expect(filename).toMatch(/\.mp3$/);
  });

  it('should sanitize original filename', () => {
    const filename = generateSafeFilename('../../../etc/passwd.txt', 123);
    expect(filename).not.toContain('..');
    expect(filename).toMatch(/^123-[0-9a-f]+-___etc_passwd\.txt$/);
  });
});

describe('HTML Sanitization', () => {
  it('should allow safe HTML tags', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('should remove script tags', () => {
    const html = '<p>Hello</p><script>alert("XSS")</script>';
    const sanitized = sanitizeHtml(html);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<p>Hello</p>');
  });

  it('should remove event handlers', () => {
    const html = '<p onclick="alert(\'XSS\')">Click me</p>';
    const sanitized = sanitizeHtml(html);
    expect(sanitized).not.toContain('onclick');
  });

  it('should remove iframe tags', () => {
    const html = '<iframe src="http://evil.com"></iframe>';
    const sanitized = sanitizeHtml(html);
    expect(sanitized).not.toContain('<iframe>');
  });
});

describe('Text Sanitization', () => {
  it('should escape HTML entities', () => {
    expect(sanitizeText('<script>alert("XSS")</script>'))
      .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('should escape ampersands', () => {
    expect(sanitizeText('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape quotes', () => {
    expect(sanitizeText('He said "Hello"')).toBe('He said &quot;Hello&quot;');
    expect(sanitizeText("It's fine")).toBe('It&#x27;s fine');
  });
});

describe('URL Validation', () => {
  it('should accept valid HTTP URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('should reject javascript: URLs', () => {
    expect(isValidUrl('javascript:alert("XSS")')).toBe(false);
  });

  it('should reject data: URLs', () => {
    expect(isValidUrl('data:text/html,<script>alert("XSS")</script>')).toBe(false);
  });

  it('should reject file: URLs', () => {
    expect(isValidUrl('file:///etc/passwd')).toBe(false);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });
});

describe('URL Sanitization', () => {
  it('should preserve valid URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('should remove invalid URLs', () => {
    expect(sanitizeUrl('javascript:alert("XSS")')).toBe('');
    expect(sanitizeUrl('not a url')).toBe('');
  });
});
