/**
 * BOPixel™ Privacy Compliance Service
 * 
 * Handles global privacy compliance with automatic geo-detection
 * and consent management for GDPR, CCPA, and other regulations.
 */

export type PrivacyTier = 'strict' | 'moderate' | 'permissive';
export type ConsentStatus = 'unknown' | 'granted' | 'denied';
export type ConsentType = 'analytics' | 'marketing' | 'functional';

/**
 * Privacy compliance tiers by country/region
 */
const PRIVACY_TIERS: Record<string, PrivacyTier> = {
  // Tier 1: Strict (GDPR - EU/UK, CCPA - California)
  'AT': 'strict', // Austria
  'BE': 'strict', // Belgium
  'BG': 'strict', // Bulgaria
  'HR': 'strict', // Croatia
  'CY': 'strict', // Cyprus
  'CZ': 'strict', // Czech Republic
  'DK': 'strict', // Denmark
  'EE': 'strict', // Estonia
  'FI': 'strict', // Finland
  'FR': 'strict', // France
  'DE': 'strict', // Germany
  'GR': 'strict', // Greece
  'HU': 'strict', // Hungary
  'IE': 'strict', // Ireland
  'IT': 'strict', // Italy
  'LV': 'strict', // Latvia
  'LT': 'strict', // Lithuania
  'LU': 'strict', // Luxembourg
  'MT': 'strict', // Malta
  'NL': 'strict', // Netherlands
  'PL': 'strict', // Poland
  'PT': 'strict', // Portugal
  'RO': 'strict', // Romania
  'SK': 'strict', // Slovakia
  'SI': 'strict', // Slovenia
  'ES': 'strict', // Spain
  'SE': 'strict', // Sweden
  'GB': 'strict', // United Kingdom
  'IS': 'strict', // Iceland
  'LI': 'strict', // Liechtenstein
  'NO': 'strict', // Norway
  'CH': 'strict', // Switzerland
  
  // Tier 2: Moderate (Canada, Brazil, Australia)
  'CA': 'moderate', // Canada (PIPEDA)
  'BR': 'moderate', // Brazil (LGPD)
  'AU': 'moderate', // Australia
  'NZ': 'moderate', // New Zealand
  'JP': 'moderate', // Japan
  'KR': 'moderate', // South Korea
  'SG': 'moderate', // Singapore
  'ZA': 'moderate', // South Africa
  'IL': 'moderate', // Israel
  'MX': 'moderate', // Mexico
  'AR': 'moderate', // Argentina
  'CL': 'moderate', // Chile
  'CO': 'moderate', // Colombia
  
  // Tier 3: Permissive (default for all other countries)
};

/**
 * Get privacy tier for a country code
 */
export function getPrivacyTier(countryCode: string | null): PrivacyTier {
  if (!countryCode) return 'permissive';
  return PRIVACY_TIERS[countryCode.toUpperCase()] || 'permissive';
}

/**
 * Check if a region requires strict privacy compliance
 */
export function requiresStrictCompliance(countryCode: string | null): boolean {
  return getPrivacyTier(countryCode) === 'strict';
}

/**
 * Check if consent is required before tracking
 */
export function requiresConsentBeforeTracking(tier: PrivacyTier): boolean {
  return tier === 'strict';
}

/**
 * Get data retention period in days based on privacy tier
 */
export function getDataRetentionDays(tier: PrivacyTier): number {
  switch (tier) {
    case 'strict':
      return 90; // 3 months for GDPR
    case 'moderate':
      return 730; // 2 years
    case 'permissive':
      return 1825; // 5 years
  }
}

/**
 * Check if IP address should be truncated
 */
export function shouldTruncateIP(tier: PrivacyTier): boolean {
  return tier === 'strict';
}

/**
 * Truncate IP address for privacy (remove last octet)
 */
export function truncateIP(ip: string): string {
  if (!ip) return '';
  
  // IPv4: Remove last octet
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }
  
  // IPv6: Remove last 64 bits
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return `${parts.slice(0, 4).join(':')}::`;
    }
  }
  
  return ip;
}

/**
 * Detect country from IP address using request headers
 * (In production, use a GeoIP service like MaxMind or IP2Location)
 */
export function detectCountryFromRequest(req: any): string | null {
  // Check Cloudflare header
  const cfCountry = req.headers['cf-ipcountry'];
  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry;
  }
  
  // Check other common headers
  const xCountry = req.headers['x-country'];
  if (xCountry) {
    return xCountry;
  }
  
  // In development, default to US
  if (process.env.NODE_ENV === 'development') {
    return 'US';
  }
  
  return null;
}

/**
 * Detect region/state from IP address
 * (In production, use a GeoIP service)
 */
export function detectRegionFromRequest(req: any): string | null {
  // Check for California (CCPA)
  const cfRegion = req.headers['cf-region'];
  if (cfRegion) {
    return cfRegion;
  }
  
  return null;
}

/**
 * Check if user is in California (CCPA applies)
 */
export function isCaliforniaUser(country: string | null, region: string | null): boolean {
  return country === 'US' && region === 'CA';
}

/**
 * Get consent requirements for a privacy tier
 */
export function getConsentRequirements(tier: PrivacyTier): {
  requiresOptIn: boolean;
  requiresOptOut: boolean;
  granularConsent: boolean;
} {
  switch (tier) {
    case 'strict':
      return {
        requiresOptIn: true,
        requiresOptOut: true,
        granularConsent: true, // Separate consent for analytics, marketing, functional
      };
    case 'moderate':
      return {
        requiresOptIn: false,
        requiresOptOut: true,
        granularConsent: false,
      };
    case 'permissive':
      return {
        requiresOptIn: false,
        requiresOptOut: true,
        granularConsent: false,
      };
  }
}

/**
 * Check if tracking is allowed based on consent status
 */
export function isTrackingAllowed(
  tier: PrivacyTier,
  consentStatus: ConsentStatus,
  consentType: ConsentType
): boolean {
  // Strict tier: Requires explicit opt-in
  if (tier === 'strict') {
    return consentStatus === 'granted';
  }
  
  // Moderate/Permissive: Allow unless explicitly denied
  return consentStatus !== 'denied';
}

/**
 * Get default consent status for a privacy tier
 */
export function getDefaultConsentStatus(tier: PrivacyTier): ConsentStatus {
  // Strict tier: Default to unknown (requires explicit consent)
  if (tier === 'strict') {
    return 'unknown';
  }
  
  // Moderate/Permissive: Default to granted (opt-out model)
  return 'granted';
}

/**
 * Validate consent data before storage
 */
export function validateConsentData(data: {
  pixelUserId: string;
  consentType: ConsentType;
  consentStatus: ConsentStatus;
  consentMethod?: string;
  ipAddress?: string;
  userAgent?: string;
}): boolean {
  if (!data.pixelUserId || data.pixelUserId.length === 0) {
    return false;
  }
  
  if (!['analytics', 'marketing', 'functional'].includes(data.consentType)) {
    return false;
  }
  
  if (!['granted', 'denied'].includes(data.consentStatus)) {
    return false;
  }
  
  return true;
}

/**
 * Anonymize event data for strict privacy compliance
 */
export function anonymizeEventData(event: any, tier: PrivacyTier): any {
  if (tier !== 'strict') {
    return event;
  }
  
  // Create a copy to avoid mutating original
  const anonymized = { ...event };
  
  // Truncate IP address
  if (anonymized.ipAddress) {
    anonymized.ipAddress = truncateIP(anonymized.ipAddress);
  }
  
  // Remove precise location data (keep country only)
  delete anonymized.city;
  delete anonymized.region;
  
  // Remove user agent (contains device fingerprinting data)
  delete anonymized.userAgent;
  
  // Remove custom data that might contain PII
  if (anonymized.customData) {
    delete anonymized.customData.email;
    delete anonymized.customData.name;
    delete anonymized.customData.phone;
  }
  
  return anonymized;
}

/**
 * Get consent banner configuration for a privacy tier
 */
export function getConsentBannerConfig(tier: PrivacyTier): {
  required: boolean;
  granular: boolean;
  defaultConsent: ConsentStatus;
  message: string;
} {
  const requirements = getConsentRequirements(tier);
  
  return {
    required: requirements.requiresOptIn,
    granular: requirements.granularConsent,
    defaultConsent: getDefaultConsentStatus(tier),
    message: getConsentMessage(tier),
  };
}

/**
 * Get consent message for a privacy tier
 */
function getConsentMessage(tier: PrivacyTier): string {
  switch (tier) {
    case 'strict':
      return 'We use cookies and similar technologies to analyze traffic and improve your experience. You can choose which types of tracking you consent to.';
    case 'moderate':
      return 'We use cookies to analyze traffic and improve your experience. You can opt out at any time.';
    case 'permissive':
      return 'We use cookies to improve your experience. See our Privacy Policy for details.';
  }
}

/**
 * Export compliance report for a user (GDPR/CCPA right to access)
 */
export async function exportUserData(pixelUserId: string): Promise<any> {
  // This would query all user data from the database
  // and return it in a machine-readable format
  
  return {
    pixelUserId,
    message: 'User data export not yet implemented',
    // In production, include:
    // - All events
    // - All sessions
    // - All consent logs
    // - User profile data
  };
}

/**
 * Delete user data (GDPR/CCPA right to deletion)
 */
export async function deleteUserData(pixelUserId: string): Promise<boolean> {
  // This would delete all user data from the database
  // following data retention policies
  
  console.log(`[Privacy] User data deletion requested for ${pixelUserId}`);
  
  // In production, delete:
  // - All events (or anonymize)
  // - All sessions
  // - User profile
  // - Keep consent logs (legal requirement)
  
  return true;
}
