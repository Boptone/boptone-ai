import { TRPCError } from '@trpc/server';
import {
  validateSessionSecurity,
  requireRecentAuth,
  updateSessionActivity,
  SessionData,
} from './sessionSecurity';

/**
 * tRPC Middleware for Session Security
 * 
 * Validates session security on every authenticated request
 */

/**
 * Session validation middleware
 * 
 * Add this to protectedProcedure to validate:
 * - Session not expired
 * - Device fingerprint matches
 * - No session hijacking
 * 
 * @example
 * const secureProtectedProcedure = protectedProcedure.use(sessionSecurityMiddleware);
 */
export const sessionSecurityMiddleware = async ({ ctx, next }: any) => {
  // Skip if no user (public procedure)
  if (!ctx.user) {
    return next({ ctx });
  }
  
  // Get session data from context
  // TODO: Retrieve from database or session store
  const sessionData: SessionData | null = ctx.req.session?.sessionData || null;
  
  if (!sessionData) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No session data found. Please log in again.',
    });
  }
  
  // Validate session security
  validateSessionSecurity(sessionData, ctx.req);
  
  // Update session activity timestamp
  const updatedSession = updateSessionActivity(sessionData);
  
  // Store updated session back
  if (ctx.req.session) {
    ctx.req.session.sessionData = updatedSession;
  }
  
  return next({
    ctx: {
      ...ctx,
      session: updatedSession,
    },
  });
};

/**
 * Re-authentication middleware for sensitive operations
 * 
 * Use this for:
 * - Payout requests
 * - Bank account changes
 * - Email/phone changes
 * - Password changes
 * - Account deletion
 * 
 * @example
 * const sensitiveOperation = protectedProcedure
 *   .use(sessionSecurityMiddleware)
 *   .use(requireReauthMiddleware)
 *   .mutation(async ({ ctx, input }) => {
 *     // Safe to proceed - user recently authenticated
 *   });
 */
export const requireReauthMiddleware = async ({ ctx, next }: any) => {
  const sessionData: SessionData | null = ctx.session || ctx.req.session?.sessionData || null;
  
  if (!sessionData) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No session found. Please log in again.',
    });
  }
  
  // Check if re-authentication required
  requireRecentAuth(sessionData);
  
  return next({ ctx });
};

/**
 * Create secure protected procedure with session validation
 * 
 * Use this instead of regular protectedProcedure for sensitive operations
 * 
 * @example
 * import { protectedProcedure } from './_core/trpc';
 * import { sessionSecurityMiddleware } from './security/sessionMiddleware';
 * 
 * const secureProtectedProcedure = protectedProcedure.use(sessionSecurityMiddleware);
 * 
 * export const payoutsRouter = router({
 *   requestPayout: secureProtectedProcedure
 *     .use(requireReauthMiddleware)
 *     .input(z.object({ amount: z.number() }))
 *     .mutation(async ({ ctx, input }) => {
 *       // Process payout - session validated & re-auth confirmed
 *     }),
 * });
 */
