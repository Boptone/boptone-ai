import { rateLimit } from 'express-rate-limit';
import { Request } from 'express';

/**
 * Enhanced Rate Limiting Configuration
 * 
 * Protects against:
 * - Brute force attacks
 * - SMS/email spam
 * - Account enumeration
 * - Financial operation abuse
 */

/**
 * Verification code rate limiter
 * 
 * Limits: 3 requests per hour per email/phone
 * Prevents SMS/email spam and cost abuse
 */
export const verificationCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many verification code requests. Please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  // Key by email or phone from request body
  keyGenerator: (req: Request) => {
    const body = req.body as any;
    return body.email || body.phone || req.ip || 'unknown';
  },
  // Skip successful requests (only count failures)
  skipSuccessfulRequests: false,
});

/**
 * Password reset rate limiter
 * 
 * Limits: 5 requests per hour per IP
 * Prevents account enumeration and spam
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many password reset requests. Please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login attempt rate limiter
 * 
 * Limits: 10 attempts per 15 minutes per IP
 * Prevents brute force attacks
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed logins
});

/**
 * Financial operation rate limiter
 * 
 * Limits: 10 requests per hour per user
 * Prevents automated payout abuse
 */
export const financialOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many financial operations. Please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  // Key by user ID (requires authentication)
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user?.id?.toString() || req.ip || 'unknown';
  },
});

/**
 * Payout request rate limiter
 * 
 * Limits: 5 payout requests per day per user
 * Prevents abuse and excessive processing
 */
export const payoutRequestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  message: 'Too many payout requests. Please try again tomorrow.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user?.id?.toString() || req.ip || 'unknown';
  },
});

/**
 * File upload rate limiter
 * 
 * Limits: 20 uploads per hour per user
 * Prevents storage abuse
 */
export const fileUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many file uploads. Please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user?.id?.toString() || req.ip || 'unknown';
  },
});

/**
 * API general rate limiter
 * 
 * Limits: 100 requests per 15 minutes per IP
 * General protection for all API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive operations
 * 
 * Limits: 3 requests per hour per IP
 * For extremely sensitive operations like:
 * - Account deletion
 * - Email/phone changes
 * - Payment method changes
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many requests for this sensitive operation. Please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});
