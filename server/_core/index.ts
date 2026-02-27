import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startJobScheduler } from "../services/jobScheduler";

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
  
  // Cookie parser for session management
  app.use(cookieParser());
  
  // Modern CSRF Protection Middleware (Origin + Referer validation)
  // This replaces deprecated token-based CSRF protection
  app.use((req, res, next) => {
    // Skip CSRF check for GET, HEAD, OPTIONS (safe methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    // Skip CSRF check for webhooks (verified by signature) and BOPixel (CORS-enabled)
    if (req.path === '/api/webhooks/stripe' || req.path === '/api/webhooks/shippo' || req.path === '/api/pixel/track') {
      return next();
    }
    
    const origin = req.get('origin');
    const referer = req.get('referer');
    const host = req.get('host');
    
    // In production, validate origin/referer matches our domain
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        `https://${host}`,
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      
      const isValidOrigin = origin && allowedOrigins.some(allowed => allowed && origin.startsWith(allowed));
      const isValidReferer = referer && allowedOrigins.some(allowed => allowed && referer.startsWith(allowed));
      
      if (!isValidOrigin && !isValidReferer) {
        console.warn('[CSRF] Blocked request with invalid origin/referer:', { origin, referer, host });
        return res.status(403).json({ error: 'Invalid request origin' });
      }
    }
    
    next();
  });
  
  // Rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Stricter rate limiting for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 auth requests per 15 minutes (prevents brute force)
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Rate limiting for cart and checkout operations
  const checkoutLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many checkout attempts, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Apply rate limiting
  app.use('/api/trpc', apiLimiter);
  app.use('/api/oauth', authLimiter);
  
  // Apply stricter limits to sensitive ecommerce endpoints
  app.use('/api/trpc/ecommerce.cart', checkoutLimiter);
  app.use('/api/trpc/ecommerce.orders', checkoutLimiter);
  
  // Stripe webhook needs raw body for signature verification
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const { handleStripeWebhook } = await import("../webhooks/stripe");
      return handleStripeWebhook(req, res);
    }
  );
  
  // Shippo webhook for tracking updates
  app.post(
    "/api/webhooks/shippo",
    express.json(),
    async (req, res) => {
      const { handleShippoWebhook } = await import("../api/webhooks/shippo");
      return handleShippoWebhook(req, res);
    }
  );
  
  // BOPixel tracking endpoint (with CORS for external domains)
  app.post(
    "/api/pixel/track",
    (req, res, next) => {
      // Allow tracking from any domain (artists' external websites)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }
      
      next();
    },
    express.json(),
    async (req, res) => {
      const { trackEvent } = await import("../api/pixel/track");
      return trackEvent(req, res);
    }
  );
  
  // Bops video upload endpoint — must be registered BEFORE body parsers
  // Uses multer for multipart/form-data, handles up to 200MB video files
  app.post(
    "/api/bops/upload",
    async (req, res) => {
      const { handleBopsUpload } = await import("../api/bops-upload");
      return handleBopsUpload(req, res);
    }
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // CORS configuration for production
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        `https://${req.get('host')}`,
      ].filter(Boolean);
      
      const origin = req.get('origin');
      if (origin && allowedOrigins.some(allowed => allowed && origin.startsWith(allowed))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }
      
      next();
    });
  }
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Sitemap and robots.txt routes
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
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
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
    
    // Start background job scheduler for post-purchase automation
    startJobScheduler();
  });
}

startServer().catch(console.error);
