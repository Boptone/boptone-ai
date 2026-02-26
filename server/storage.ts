// Preconfigured storage helpers for Manus WebDev templates
// Uses the Biz-provided storage proxy (Authorization: Bearer <token>)

import { ENV } from './_core/env';
import crypto from 'crypto';

type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string, cacheControl?: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  if (cacheControl) {
    url.searchParams.set("cacheControl", cacheControl);
  }
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

/**
 * Determine optimal Cache-Control header based on file type and naming pattern.
 * 
 * Strategy:
 * - Immutable assets (content-hash in filename): 1 year cache
 * - Audio files: 30 days cache (rarely change)
 * - Images: 7 days cache (may be updated)
 * - Other assets: 1 day cache (default)
 */
function getCacheControlHeader(key: string): string {
  // Immutable assets with content hash (e.g., avatar-a1b2c3d4.jpg)
  if (key.match(/\.[a-f0-9]{8,}\.(jpg|jpeg|png|webp|mp3|wav|flac)$/i)) {
    return 'public, max-age=31536000, immutable'; // 1 year
  }
  
  // Audio files (tracks, uploads)
  if (key.match(/\.(mp3|wav|flac|ogg|m4a)$/i)) {
    return 'public, max-age=2592000'; // 30 days
  }
  
  // Images (artwork, avatars, product photos)
  if (key.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
    return 'public, max-age=604800'; // 7 days
  }
  
  // Waveform data
  if (key.includes('waveform') || key.endsWith('.json')) {
    return 'public, max-age=2592000'; // 30 days
  }
  
  // Default: short cache for other assets
  return 'public, max-age=86400'; // 1 day
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const cacheControl = getCacheControlHeader(key);
  const uploadUrl = buildUploadUrl(baseUrl, key, cacheControl);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}

/**
 * Generate a content-hash filename for immutable asset caching.
 * 
 * This function creates a filename with a content hash, enabling aggressive
 * browser caching (1 year) since the filename changes when content changes.
 * 
 * @param originalFilename - Original filename (e.g., "avatar.jpg")
 * @param data - File data to hash
 * @returns Filename with content hash (e.g., "avatar-a1b2c3d4.jpg")
 * 
 * @example
 * const hashedFilename = generateHashedFilename("avatar.jpg", imageBuffer);
 * // Returns: "avatar-a1b2c3d4.jpg"
 */
export function generateHashedFilename(
  originalFilename: string,
  data: Buffer | Uint8Array | string
): string {
  
  // Convert data to Buffer for hashing
  const buffer = typeof data === 'string' 
    ? Buffer.from(data) 
    : Buffer.from(data);
  
  // Generate 8-character hash from content
  const hash = crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex')
    .substring(0, 8);
  
  // Split filename into name and extension
  const lastDotIndex = originalFilename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // No extension, append hash
    return `${originalFilename}-${hash}`;
  }
  
  const name = originalFilename.substring(0, lastDotIndex);
  const ext = originalFilename.substring(lastDotIndex);
  
  return `${name}-${hash}${ext}`;
}

/**
 * Generate a random suffix for non-enumerable file paths.
 * 
 * Adds security by preventing sequential file enumeration attacks.
 * 
 * @returns 8-character random hex string
 * 
 * @example
 * const key = `${userId}/files/${filename}-${randomSuffix()}.png`;
 * // Returns: "user123/files/avatar-7f3a9b2c.png"
 */
export function randomSuffix(): string {
  return crypto.randomBytes(4).toString('hex');
}
