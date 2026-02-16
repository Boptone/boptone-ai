import crypto from 'crypto';
import { TRPCError } from '@trpc/server';

/**
 * CSRF Protection
 * 
 * Prevents Cross-Site Request Forgery attacks by validating tokens
 * on all state-changing operations (mutations).
 * 
 * How it works:
 * 1. Server generates a CSRF token and stores in session
 * 2. Frontend includes token in mutation requests
 * 3. Server validates token before processing mutation
 */

const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a new CSRF token
 * 
 * @returns Random CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Validate CSRF token
 * 
 * @param token - Token from request
 * @param sessionToken - Token stored in session
 * @throws TRPCError if token is invalid
 */
export function validateCsrfToken(token: string | undefined, sessionToken: string | undefined): void {
  if (!sessionToken) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No CSRF token in session',
    });
  }
  
  if (!token) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'CSRF token required',
    });
  }
  
  if (token !== sessionToken) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Invalid CSRF token',
    });
  }
}

/**
 * CSRF middleware for tRPC procedures
 * 
 * Add this to all mutations that change state:
 * - Financial operations
 * - Account changes
 * - Data deletion
 * - Payout requests
 * 
 * @example
 * const protectedMutation = protectedProcedure
 *   .use(csrfMiddleware)
 *   .mutation(async ({ ctx, input }) => {
 *     // Safe to proceed - CSRF token validated
 *   });
 */
export const csrfMiddleware = async ({ ctx, next }: any) => {
  // Get CSRF token from request headers
  const token = ctx.req.headers['x-csrf-token'];
  
  // Get CSRF token from session
  const sessionToken = ctx.req.session?.csrfToken;
  
  // Validate
  validateCsrfToken(token, sessionToken);
  
  return next({ ctx });
};

/**
 * Create CSRF-protected procedure
 * 
 * Use this for all mutations that:
 * - Transfer money
 * - Change account settings
 * - Delete data
 * - Request payouts
 * 
 * @example
 * import { protectedProcedure } from './_core/trpc';
 * import { csrfMiddleware } from './security/csrf';
 * 
 * const csrfProtectedProcedure = protectedProcedure.use(csrfMiddleware);
 * 
 * export const payoutsRouter = router({
 *   requestPayout: csrfProtectedProcedure
 *     .input(z.object({ amount: z.number() }))
 *     .mutation(async ({ ctx, input }) => {
 *       // Process payout - CSRF validated
 *     }),
 * });
 */
