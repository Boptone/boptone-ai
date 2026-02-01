/**
 * Development mode utility for bypassing authentication during development.
 * This allows seamless navigation across all pages without sign-in roadblocks.
 * 
 * IMPORTANT: Only active in development environment (import.meta.env.DEV).
 * Production builds will always require authentication.
 */

export const DEV_MODE = import.meta.env.DEV;

/**
 * Check if user should be allowed access (either authenticated or in dev mode)
 */
export function hasAccess(isAuthenticated: boolean): boolean {
  return DEV_MODE || isAuthenticated;
}

/**
 * Check if user should be redirected to login
 */
export function shouldRedirectToLogin(isAuthenticated: boolean, authLoading: boolean): boolean {
  if (DEV_MODE) return false;
  if (authLoading) return false;
  return !isAuthenticated;
}
