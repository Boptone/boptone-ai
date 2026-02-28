import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import "./i18n/config";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { initSentry } from "./lib/sentry";
import { HelmetProvider } from "react-helmet-async";
import { toast } from "sonner";

// Initialize Sentry for error tracking
initSentry();

// ─── CSRF Token Manager ──────────────────────────────────────────────────────
// Fetches a CSRF token from the server on app init and caches it in memory.
// The token is injected into every tRPC POST request via x-csrf-token header.
let csrfToken: string | null = null;
let csrfFetchPromise: Promise<string | null> | null = null;

async function fetchCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  if (csrfFetchPromise) return csrfFetchPromise;

  csrfFetchPromise = (async () => {
    try {
      const res = await fetch("/api/csrf-token", { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();
      csrfToken = data.csrfToken ?? null;
      return csrfToken;
    } catch {
      return null;
    } finally {
      csrfFetchPromise = null;
    }
  })();

  return csrfFetchPromise;
}

// Pre-fetch CSRF token on app load
fetchCsrfToken();

// ─── Query Client ────────────────────────────────────────────────────────────
const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Redirect to /login page where user can choose "Remember me" option
  window.location.href = "/login";
};

const showRateLimitToast = (error: unknown) => {
  // Show a user-friendly toast when the server returns 429 Too Many Requests
  if (!(error instanceof TRPCClientError)) return;
  const httpStatus = (error as any)?.data?.httpStatus;
  if (httpStatus === 429) {
    toast.error("You're going too fast", {
      description: "Too many requests. Please wait a moment and try again.",
      duration: 6000,
    });
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    showRateLimitToast(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    showRateLimitToast(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async fetch(input, init) {
        // Inject CSRF token on all requests (server only enforces on mutations)
        const token = await fetchCsrfToken();
        const headers = new Headers(init?.headers);
        if (token) {
          headers.set("x-csrf-token", token);
        }
        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </HelmetProvider>
);
