import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { doubleCsrf } from "csrf-csrf";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startJobScheduler } from "../services/jobScheduler";
import { startVideoProcessorWorker } from "../workers/videoProcessor";
import { startAutoPayoutScheduler } from "../workers/autoPayoutScheduler";
import { startAccountDeletionWorker } from "../workers/accountDeletionWorker";
import { startWorkflowCronRunner } from "../services/workflowCronRunner";
import { startToneyAgentRunner } from "../agents/toneyAgentRunner";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Trust proxy for accurate IP detection behind load balancers
  app.set('trust proxy', 1);

  // ─── HELMET: Security Headers ────────────────────────────────────────────────
  // Sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  // Permissions-Policy, and more. Must be first middleware.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Required for Vite HMR in dev
            "https://js.stripe.com",
            "https://cdn.jsdelivr.net",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'", // Required for Tailwind/shadcn
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
          mediaSrc: ["'self'", "blob:", "https:"],
          connectSrc: [
            "'self'",
            "https://api.stripe.com",
            "https://*.manus.space",
            "wss:", // WebSocket for Vite HMR
            "ws:",
          ],
          frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
          frameAncestors: ["'self'", "https://*.manus.space", "https://*.manusvm.computer"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
        },
      },
      // HSTS: enforce HTTPS for 1 year in production
      strictTransportSecurity:
        process.env.NODE_ENV === "production"
          ? { maxAge: 31536000, includeSubDomains: true, preload: true }
          : false,
      // Allow framing only from Manus preview pane (frame-ancestors in CSP takes precedence)
      frameguard: false,
      // Prevent MIME sniffing
      noSniff: true,
      // Disable X-Powered-By
      hidePoweredBy: true,
      // Referrer policy
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      // Permissions policy — disable sensitive browser APIs
      permittedCrossDomainPolicies: false,
    })
  );

  // ─── COOKIE PARSER ───────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ─── RATE LIMITING ───────────────────────────────────────────────────────────
  // Global API limiter: 200 req / 15 min per IP (generous for normal use)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: "draft-7", // RateLimit-* headers (RFC draft)
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later.", retryAfter: "15 minutes" },
    handler: (req, res, _next, options) => {
      res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
      res.status(429).json(options.message);
    },
  });

  // Auth limiter: 10 req / 15 min per IP (brute-force protection)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many authentication attempts. Please try again in 15 minutes.", retryAfter: "15 minutes" },
    handler: (req, res, _next, options) => {
      res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
      res.status(429).json(options.message);
    },
  });

  // Checkout/payment limiter: 10 req / 1 min per IP
  const checkoutLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many payment requests. Please slow down.", retryAfter: "1 minute" },
    handler: (req, res, _next, options) => {
      res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
      res.status(429).json(options.message);
    },
  });

  // Upload limiter: 5 uploads / 10 min per IP
  const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Upload limit reached. Please wait before uploading again.", retryAfter: "10 minutes" },
    handler: (req, res, _next, options) => {
      res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
      res.status(429).json(options.message);
    },
  });

  // Apply rate limiters
  app.use("/api/trpc", apiLimiter);
  app.use("/api/oauth", authLimiter);
  app.use("/api/trpc/ecommerce.cart", checkoutLimiter);
  app.use("/api/trpc/ecommerce.orders", checkoutLimiter);
  app.use("/api/trpc/ecommerce.createCheckoutSession", checkoutLimiter);
  app.use("/api/bops/upload", uploadLimiter);

  // ─── CSRF PROTECTION (Double-Submit Cookie Pattern via csrf-csrf) ────────────
  // Uses HMAC-signed tokens. GET /api/csrf-token issues a token + cookie.
  // All non-safe mutations must send the token in the x-csrf-token header.
  // Webhooks and pixel use their own signature-based verification — excluded.
  const isProduction = process.env.NODE_ENV === "production";
  const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => ENV.cookieSecret || "boptone-csrf-secret-fallback",
    getSessionIdentifier: (req) => {
      // Use the session cookie value as the unique identifier, or IP as fallback
      const sessionCookie = req.cookies?.[COOKIE_NAME];
      return sessionCookie || req.ip || "anonymous";
    },
    // Use __Host- prefix in production (requires HTTPS + no Domain attribute + Path=/)
    // In dev, use a plain name since we're on HTTP
    cookieName: isProduction ? "__Host-boptone.csrf" : "boptone.csrf",
    cookieOptions: {
      sameSite: "strict",
      path: "/",
      secure: isProduction,
      httpOnly: true,
    },
    // Skip CSRF for webhooks and pixel (they use signature-based auth)
    skipCsrfProtection: (req) => {
      const excluded = [
        "/api/webhooks/stripe",
        "/api/webhooks/shippo",
        "/api/pixel/track",
        "/api/oauth/callback",
      ];
      return excluded.some(path => req.path.startsWith(path));
    },
  });

  // CSRF token endpoint — client fetches this on app init to get a token
  app.get("/api/csrf-token", (req, res) => {
    const token = generateCsrfToken(req, res);
    res.json({ csrfToken: token });
  });

  // Apply CSRF protection to all non-safe methods
  // In development, we skip enforcement to avoid breaking local dev with curl/tools
  // but the token flow is still active so it can be tested
  if (isProduction) {
    app.use(doubleCsrfProtection);
  } else {
    // In dev: run the middleware but don't block on failure — just warn
    app.use((req, res, next) => {
      if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
      }
      const excluded = [
        "/api/webhooks/stripe",
        "/api/webhooks/shippo",
        "/api/pixel/track",
        "/api/oauth/callback",
      ];
      if (excluded.some(path => req.path.startsWith(path))) {
        return next();
      }
      // Also keep the origin/referer check as a secondary layer in dev
      const origin = req.get("origin");
      const referer = req.get("referer");
      const host = req.get("host");
      const allowedOrigins = [
        `https://${host}`,
        `http://${host}`,
        process.env.FRONTEND_URL,
      ].filter(Boolean) as string[];
      const isValidOrigin = origin && allowedOrigins.some(allowed => origin.startsWith(allowed));
      const isValidReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed));
      if (!isValidOrigin && !isValidReferer) {
        console.warn("[CSRF] Dev warning — no valid origin/referer:", { origin, referer, host, path: req.path });
      }
      next();
    });
  }

  // ─── HEALTH CHECK ────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
    });
  });

  // ─── STRIPE WEBHOOK (raw body required for signature verification) ───────────
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const { handleStripeWebhook } = await import("../webhooks/stripe");
      return handleStripeWebhook(req, res);
    }
  );

  // ─── SHIPPO WEBHOOK (raw body required for HMAC signature verification) ────────
  app.post(
    "/api/webhooks/shippo",
    express.raw({ type: "*/*" }), // Must come before signature middleware
    async (req, res, next) => {
      const { shippoSignatureMiddleware } = await import("../webhooks/shippoVerify");
      return shippoSignatureMiddleware(req, res, next);
    },
    async (req, res) => {
      const { handleShippoWebhook } = await import("../api/webhooks/shippo");
      return handleShippoWebhook(req, res);
    }
  );

  // ─── BOPIXEL TRACKING (CORS-open for external artist sites) ─────────────────
  app.post(
    "/api/pixel/track",
    (req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") return res.sendStatus(204);
      next();
    },
    express.json(),
    async (req, res) => {
      const { trackEvent } = await import("../api/pixel/track");
      return trackEvent(req, res);
    }
  );

  // ─── BOPS VIDEO UPLOAD (registered before body parsers) ─────────────────────
  app.post(
    "/api/bops/upload",
    async (req, res) => {
      const { handleBopsUpload } = await import("../api/bops-upload");
      return handleBopsUpload(req, res);
    }
  );

  // ─── BODY PARSERS ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ─── CORS (production only — Vite handles dev CORS) ─────────────────────────
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        `https://${req.get("host")}`,
      ].filter(Boolean) as string[];

      const origin = req.get("origin");
      if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-csrf-token");
      }

      if (req.method === "OPTIONS") return res.sendStatus(204);
      next();
    });
  }

  // ─── OAUTH ROUTES ────────────────────────────────────────────────────────────
  registerOAuthRoutes(app);

  // ─── SITEMAP & ROBOTS ────────────────────────────────────────────────────────
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const caller = appRouter.createCaller({ req, res, user: null });
      const { urls } = await caller.sitemap.generateSitemap();
      res.setHeader("Content-Type", "application/xml");
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${url.loc}</loc>
${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>\n` : ""}${url.changefreq ? `    <changefreq>${url.changefreq}</changefreq>\n` : ""}${url.priority ? `    <priority>${url.priority}</priority>\n` : ""}  </url>`).join("\n")}
</urlset>`);
    } catch (error) {
      console.error("[Sitemap] Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", async (req, res) => {
    try {
      const caller = appRouter.createCaller({ req, res, user: null });
      const { content } = await caller.sitemap.generateRobotsTxt();
      res.setHeader("Content-Type", "text/plain");
      res.send(content);
    } catch (error) {
      console.error("[Robots.txt] Error generating robots.txt:", error);
      res.status(500).send("Error generating robots.txt");
    }
  });

  // ─── tRPC API ────────────────────────────────────────────────────────────────
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // ─── STATIC / VITE ───────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    startJobScheduler();
    // Start the BullMQ video transcoding worker (requires Redis)
    try {
      startVideoProcessorWorker();
    } catch (err) {
      console.warn("[VideoProcessor] Worker failed to start (Redis may not be available):", err instanceof Error ? err.message : err);
    }
    // Start the auto-payout scheduler (runs every hour, processes daily/weekly/monthly payouts)
    try {
      startAutoPayoutScheduler();
    } catch (err) {
      console.warn("[AutoPayout] Scheduler failed to start (Redis may not be available):", err instanceof Error ? err.message : err);
    }
    // Start the GDPR account deletion worker (processes 30-day delayed deletion jobs)
    try {
      startAccountDeletionWorker();
    } catch (err) {
      console.warn("[AccountDeletion] Worker failed to start (Redis may not be available):", err instanceof Error ? err.message : err);
    }
    // Start the workflow schedule cron runner (PRO tier — executes schedule-triggered automations)
    startWorkflowCronRunner().catch((err) => {
      console.warn("[WorkflowCron] Runner failed to start:", err instanceof Error ? err.message : err);
    });
    // Start the Toney autonomous agent runner (monitors metrics, creates proactive insights every 6h)
    try {
      startToneyAgentRunner();
    } catch (err) {
      console.warn("[ToneyAgent] Runner failed to start:", err instanceof Error ? err.message : err);
    }
  });
}

startServer().catch(console.error);
