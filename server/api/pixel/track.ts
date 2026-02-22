/**
 * BOPixel™ Tracking Endpoint
 * 
 * Receives tracking events from BOPixel JavaScript SDK
 * Validates, enriches, and stores events with privacy compliance
 */

import { Request, Response } from 'express';
import { getDb } from '../../db';
import { pixelEvents, pixelUsers, pixelSessions } from '../../../drizzle/schema';
import {
  detectCountryFromRequest,
  detectRegionFromRequest,
  getPrivacyTier,
  isTrackingAllowed,
  getDefaultConsentStatus,
  anonymizeEventData,
  truncateIP,
  shouldTruncateIP,
  isCaliforniaUser
} from '../../services/privacyCompliance';
import { eq, and } from 'drizzle-orm';

/**
 * Track event endpoint
 * POST /api/pixel/track
 */
export async function trackEvent(req: Request, res: Response) {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    
    // Parse event data
    const eventData = req.body;
    
    // Validate required fields
    if (!eventData.eventId || !eventData.pixelUserId || !eventData.sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Detect country and region
    const country = detectCountryFromRequest(req);
    const region = detectRegionFromRequest(req);
    
    // Determine privacy tier
    let privacyTier = getPrivacyTier(country);
    
    // California users get strict tier (CCPA)
    if (isCaliforniaUser(country, region)) {
      privacyTier = 'strict';
    }
    
    // Get or create pixel user
    let pixelUser = await db
      .select()
      .from(pixelUsers)
      .where(eq(pixelUsers.pixelUserId, eventData.pixelUserId))
      .limit(1);
    
    if (pixelUser.length === 0) {
      // Create new pixel user
      const defaultConsent = getDefaultConsentStatus(privacyTier);
      
      await db.insert(pixelUsers).values({
        pixelUserId: eventData.pixelUserId,
        firstSeen: new Date(),
        lastSeen: new Date(),
        totalEvents: 1,
        totalSessions: 0,
        totalRevenue: eventData.revenue || 0,
        consentStatus: defaultConsent,
        privacyTier: privacyTier,
        country: country || undefined,
      });
      
      pixelUser = await db
        .select()
        .from(pixelUsers)
        .where(eq(pixelUsers.pixelUserId, eventData.pixelUserId))
        .limit(1);
    } else {
      // Update existing pixel user
      await db
        .update(pixelUsers)
        .set({
          lastSeen: new Date(),
          totalEvents: pixelUser[0].totalEvents + 1,
          totalRevenue: Number(pixelUser[0].totalRevenue) + (eventData.revenue || 0),
        })
        .where(eq(pixelUsers.pixelUserId, eventData.pixelUserId));
    }
    
    const user = pixelUser[0];
    
    // Check if tracking is allowed
    const consentType = eventData.eventType === 'purchase' ? 'analytics' : 'marketing';
    if (!isTrackingAllowed(privacyTier, user.consentStatus, consentType)) {
      return res.status(200).json({ 
        success: false, 
        message: 'Tracking not allowed - consent required' 
      });
    }
    
    // Get client IP
    let ipAddress = req.headers['x-forwarded-for'] as string || 
                    req.headers['x-real-ip'] as string ||
                    req.socket.remoteAddress || '';
    
    // Handle multiple IPs in X-Forwarded-For
    if (ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }
    
    // Truncate IP if required by privacy tier
    if (shouldTruncateIP(privacyTier)) {
      ipAddress = truncateIP(ipAddress);
    }
    
    // Build event object
    let event = {
      eventId: eventData.eventId,
      pixelUserId: eventData.pixelUserId,
      sessionId: eventData.sessionId,
      artistId: eventData.artistId || null,
      eventType: eventData.eventType,
      eventName: eventData.eventName || null,
      pageUrl: eventData.pageUrl || null,
      pageTitle: eventData.pageTitle || null,
      referrer: eventData.referrer || null,
      utmSource: eventData.utmSource || null,
      utmMedium: eventData.utmMedium || null,
      utmCampaign: eventData.utmCampaign || null,
      utmContent: eventData.utmContent || null,
      utmTerm: eventData.utmTerm || null,
      deviceType: eventData.deviceType || null,
      browser: eventData.browser || null,
      os: eventData.os || null,
      country: country || null,
      region: region || null,
      city: null, // Would need GeoIP service for city
      ipAddress: ipAddress,
      userAgent: eventData.userAgent || null,
      customData: eventData.customData || null,
      revenue: eventData.revenue || null,
      currency: eventData.currency || null,
      productId: eventData.productId || null,
      createdAt: new Date(),
    };
    
    // Anonymize event data if required
    if (privacyTier === 'strict') {
      event = anonymizeEventData(event, privacyTier);
    }
    
    // Store event
    await db.insert(pixelEvents).values(event);
    
    // Update or create session
    const existingSession = await db
      .select()
      .from(pixelSessions)
      .where(eq(pixelSessions.sessionId, eventData.sessionId))
      .limit(1);
    
    if (existingSession.length === 0) {
      // Create new session
      await db.insert(pixelSessions).values({
        sessionId: eventData.sessionId,
        pixelUserId: eventData.pixelUserId,
        artistId: eventData.artistId || null,
        startedAt: new Date(),
        pageViews: eventData.eventType === 'page_view' ? 1 : 0,
        events: 1,
        converted: eventData.eventType === 'purchase' ? 1 : 0,
        revenue: eventData.revenue || 0,
        landingPage: eventData.pageUrl || null,
        referrer: eventData.referrer || null,
        utmSource: eventData.utmSource || null,
        utmMedium: eventData.utmMedium || null,
        utmCampaign: eventData.utmCampaign || null,
        country: country || null,
        deviceType: eventData.deviceType || null,
      });
      
      // Update user session count
      await db
        .update(pixelUsers)
        .set({
          totalSessions: user.totalSessions + 1,
        })
        .where(eq(pixelUsers.pixelUserId, eventData.pixelUserId));
    } else {
      // Update existing session
      const session = existingSession[0];
      
      await db
        .update(pixelSessions)
        .set({
          endedAt: new Date(),
          pageViews: eventData.eventType === 'page_view' 
            ? session.pageViews + 1 
            : session.pageViews,
          events: session.events + 1,
          converted: eventData.eventType === 'purchase' ? 1 : session.converted,
          revenue: Number(session.revenue) + (eventData.revenue || 0),
          exitPage: eventData.pageUrl || session.exitPage,
        })
        .where(eq(pixelSessions.sessionId, eventData.sessionId));
    }
    
    // Return success
    res.status(200).json({ 
      success: true,
      eventId: eventData.eventId,
      privacyTier: privacyTier
    });
    
  } catch (error) {
    console.error('[BOPixel] Tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
