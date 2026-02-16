import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

/**
 * Session timeout constants
 */
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
const REMEMBER_ME_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function getSessionCookieOptions(
  req: Request,
  rememberMe: boolean = false
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure" | "maxAge"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  const isSecure = isSecureRequest(req);
  const maxAge = rememberMe ? REMEMBER_ME_TIMEOUT_MS : SESSION_TIMEOUT_MS;

  return {
    httpOnly: true, // Prevent JavaScript access (XSS protection)
    path: "/",
    // Use 'strict' for production security, 'none' for development cross-origin
    sameSite: isSecure ? "strict" : "none",
    secure: isSecure, // HTTPS only in production
    maxAge, // Session timeout (24 hours or 30 days)
  };
}
