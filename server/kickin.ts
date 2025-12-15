import { eq, and, sql, desc } from "drizzle-orm";
import { getDb } from "./db";
import { 
  artistPaymentMethods, 
  kickInTips, 
  artistTaxSettings,
  artistProfiles,
  InsertArtistPaymentMethod,
  InsertKickInTip,
  InsertArtistTaxSettings
} from "../drizzle/schema";

// Tax thresholds by country (in cents)
const TAX_THRESHOLDS: Record<string, { threshold: number; description: string }> = {
  US: { threshold: 60000, description: "1099-K reporting threshold ($600)" },
  UK: { threshold: 100000, description: "Self-assessment threshold (£1,000)" },
  CA: { threshold: 50000, description: "T4A reporting threshold ($500 CAD)" },
  AU: { threshold: 0, description: "All income reportable with ABN" },
  DE: { threshold: 0, description: "All income reportable (VAT if over €22k)" },
  FR: { threshold: 0, description: "All income reportable (micro-entrepreneur)" },
};

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export async function getArtistPaymentMethods(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(artistPaymentMethods)
    .where(and(
      eq(artistPaymentMethods.artistId, artistId),
      eq(artistPaymentMethods.isActive, true)
    ))
    .orderBy(desc(artistPaymentMethods.isPrimary));
}

export async function addPaymentMethod(data: InsertArtistPaymentMethod) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // If this is set as primary, unset other primaries first
  if (data.isPrimary) {
    await db
      .update(artistPaymentMethods)
      .set({ isPrimary: false })
      .where(eq(artistPaymentMethods.artistId, data.artistId));
  }
  
  const result = await db.insert(artistPaymentMethods).values(data);
  return result[0].insertId;
}

export async function updatePaymentMethod(
  id: number, 
  artistId: number, 
  data: Partial<InsertArtistPaymentMethod>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // If setting as primary, unset others first
  if (data.isPrimary) {
    await db
      .update(artistPaymentMethods)
      .set({ isPrimary: false })
      .where(eq(artistPaymentMethods.artistId, artistId));
  }
  
  await db
    .update(artistPaymentMethods)
    .set(data)
    .where(and(
      eq(artistPaymentMethods.id, id),
      eq(artistPaymentMethods.artistId, artistId)
    ));
}

export async function deletePaymentMethod(id: number, artistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Soft delete by setting isActive to false
  await db
    .update(artistPaymentMethods)
    .set({ isActive: false })
    .where(and(
      eq(artistPaymentMethods.id, id),
      eq(artistPaymentMethods.artistId, artistId)
    ));
}

// ============================================================================
// TIPS
// ============================================================================

export async function recordTip(data: Omit<InsertKickInTip, 'taxYear'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const taxYear = new Date().getFullYear();
  
  const result = await db.insert(kickInTips).values({
    ...data,
    taxYear,
  });
  
  // Update artist's current year total for tax tracking
  await updateTaxYearTotal(data.artistId, data.amount);
  
  return result[0].insertId;
}

export async function getArtistTips(artistId: number, options?: {
  year?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(kickInTips.artistId, artistId)];
  
  if (options?.year) {
    conditions.push(eq(kickInTips.taxYear, options.year));
  }
  
  let query = db
    .select()
    .from(kickInTips)
    .where(and(...conditions))
    .orderBy(desc(kickInTips.tippedAt));
  
  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }
  
  if (options?.offset) {
    query = query.offset(options.offset) as typeof query;
  }
  
  return query;
}

export async function verifyTip(tipId: number, artistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(kickInTips)
    .set({ 
      isVerified: true, 
      verifiedAt: new Date() 
    })
    .where(and(
      eq(kickInTips.id, tipId),
      eq(kickInTips.artistId, artistId)
    ));
}

export async function getTipStats(artistId: number, year?: number) {
  const db = await getDb();
  if (!db) return null;
  
  const targetYear = year || new Date().getFullYear();
  
  const result = await db
    .select({
      totalAmount: sql<number>`SUM(amount)`,
      tipCount: sql<number>`COUNT(*)`,
      verifiedAmount: sql<number>`SUM(CASE WHEN isVerified = true THEN amount ELSE 0 END)`,
      verifiedCount: sql<number>`SUM(CASE WHEN isVerified = true THEN 1 ELSE 0 END)`,
    })
    .from(kickInTips)
    .where(and(
      eq(kickInTips.artistId, artistId),
      eq(kickInTips.taxYear, targetYear)
    ));
  
  return result[0];
}

// ============================================================================
// TAX SETTINGS
// ============================================================================

export async function getArtistTaxSettings(artistId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(artistTaxSettings)
    .where(eq(artistTaxSettings.artistId, artistId))
    .limit(1);
  
  return result[0] || null;
}

export async function upsertTaxSettings(artistId: number, data: Partial<InsertArtistTaxSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getArtistTaxSettings(artistId);
  
  // Set default threshold based on country
  const country = data.country || existing?.country || 'US';
  const defaultThreshold = TAX_THRESHOLDS[country]?.threshold || 0;
  
  if (existing) {
    await db
      .update(artistTaxSettings)
      .set({
        ...data,
        reportingThreshold: data.reportingThreshold ?? defaultThreshold,
      })
      .where(eq(artistTaxSettings.artistId, artistId));
  } else {
    await db.insert(artistTaxSettings).values({
      artistId,
      country: country,
      reportingThreshold: defaultThreshold,
      ...data,
    });
  }
}

async function updateTaxYearTotal(artistId: number, additionalAmount: number) {
  const db = await getDb();
  if (!db) return;
  
  const settings = await getArtistTaxSettings(artistId);
  
  if (settings) {
    await db
      .update(artistTaxSettings)
      .set({
        currentYearTotal: settings.currentYearTotal + additionalAmount,
      })
      .where(eq(artistTaxSettings.artistId, artistId));
  }
}

export async function getTaxComplianceStatus(artistId: number) {
  const settings = await getArtistTaxSettings(artistId);
  const stats = await getTipStats(artistId);
  
  if (!settings) {
    return {
      configured: false,
      country: null,
      threshold: null,
      currentTotal: stats?.totalAmount || 0,
      thresholdReached: false,
      requiresAction: true,
      message: "Please configure your tax settings to receive tips.",
    };
  }
  
  const threshold = settings.reportingThreshold || 0;
  const currentTotal = settings.currentYearTotal || 0;
  const thresholdReached = threshold > 0 && currentTotal >= threshold;
  
  const countryInfo = TAX_THRESHOLDS[settings.country] || { description: "Check local tax requirements" };
  
  return {
    configured: true,
    country: settings.country,
    threshold,
    currentTotal,
    thresholdReached,
    requiresAction: thresholdReached && !settings.w9Submitted,
    message: thresholdReached 
      ? `You've reached the ${countryInfo.description}. Please ensure tax documentation is complete.`
      : `${countryInfo.description}. Current year total: $${(currentTotal / 100).toFixed(2)}`,
    w9Required: settings.country === 'US' && thresholdReached,
    w9Submitted: settings.w9Submitted,
  };
}

// ============================================================================
// PUBLIC ARTIST DATA (for fan-facing pages)
// ============================================================================

export async function getPublicPaymentMethods(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const methods = await db
    .select({
      method: artistPaymentMethods.method,
      handle: artistPaymentMethods.handle,
      displayName: artistPaymentMethods.displayName,
      isPrimary: artistPaymentMethods.isPrimary,
    })
    .from(artistPaymentMethods)
    .where(and(
      eq(artistPaymentMethods.artistId, artistId),
      eq(artistPaymentMethods.isActive, true)
    ))
    .orderBy(desc(artistPaymentMethods.isPrimary));
  
  return methods;
}

export async function getArtistIdByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Look up artist profile by stage name (used as username)
  const result = await db
    .select({ id: artistProfiles.id })
    .from(artistProfiles)
    .where(eq(artistProfiles.stageName, username))
    .limit(1);
  
  return result[0]?.id || null;
}

// Payment method display info
export const PAYMENT_METHOD_INFO = {
  paypal: {
    name: "PayPal",
    icon: "paypal",
    color: "#003087",
    urlPrefix: "https://paypal.me/",
    handleType: "username or email",
  },
  venmo: {
    name: "Venmo",
    icon: "venmo",
    color: "#3D95CE",
    urlPrefix: "https://venmo.com/",
    handleType: "username",
  },
  zelle: {
    name: "Zelle",
    icon: "zelle",
    color: "#6D1ED4",
    urlPrefix: null, // No direct URL, show phone/email
    handleType: "phone or email",
  },
  cashapp: {
    name: "Cash App",
    icon: "cashapp",
    color: "#00D632",
    urlPrefix: "https://cash.app/$",
    handleType: "$cashtag",
  },
  apple_cash: {
    name: "Apple Cash",
    icon: "apple",
    color: "#000000",
    urlPrefix: null, // No direct URL
    handleType: "phone number",
  },
};
