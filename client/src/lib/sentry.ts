import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Only initializes if VITE_SENTRY_DSN is provided
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  // Skip initialization if no DSN is provided
  if (!dsn || dsn === "placeholder") {
    console.log("[Sentry] Skipping initialization - no DSN provided");
    return;
  }

  Sentry.init({
    dsn,
    
    // Set environment (production, staging, development)
    environment: import.meta.env.MODE,
    
    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Capture 10% of sessions for replay
        sessionSampleRate: 0.1,
        // Capture 100% of sessions with errors
        errorSampleRate: 1.0,
      }),
    ],
    
    // Performance traces sample rate (10% of transactions)
    tracesSampleRate: 0.1,
    
    // Capture unhandled promise rejections
    autoSessionTracking: true,
    
    // Add user context automatically
    beforeSend(event, hint) {
      // Filter out non-error events in development
      if (import.meta.env.DEV && event.level !== "error" && event.level !== "fatal") {
        return null;
      }
      return event;
    },
  });

  console.log("[Sentry] Initialized successfully");
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}
