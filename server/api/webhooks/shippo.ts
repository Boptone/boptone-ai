/**
 * Shippo Webhook Handler
 * Receives real-time tracking updates from Shippo and triggers appropriate emails
 */

import { Request, Response } from 'express';
import { getDb } from '../../db';
import { orders } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { scheduleJob } from '../../services/jobScheduler';

/**
 * Map Shippo tracking status to email type
 */
function mapShippoStatusToEmailType(status: string): 'shipping_in_transit' | 'shipping_out_for_delivery' | 'shipping_delivered' | null {
  const statusLower = status.toLowerCase();
  
  // In transit
  if (statusLower.includes('transit') || statusLower.includes('picked_up')) {
    return 'shipping_in_transit';
  }
  
  // Out for delivery
  if (statusLower.includes('out_for_delivery') || statusLower.includes('out for delivery')) {
    return 'shipping_out_for_delivery';
  }
  
  // Delivered
  if (statusLower.includes('delivered')) {
    return 'shipping_delivered';
  }
  
  return null;
}

/**
 * Check if status should trigger an email
 */
function shouldSendEmail(status: string): boolean {
  const emailType = mapShippoStatusToEmailType(status);
  return emailType !== null;
}

/**
 * Handle Shippo webhook
 */
export async function handleShippoWebhook(req: Request, res: Response) {
  try {
    const event = req.body;
    
    console.log('[ShippoWebhook] Received event:', event.event);
    
    // Only process tracking status updates
    if (event.event !== 'track_updated') {
      console.log('[ShippoWebhook] Ignoring non-tracking event:', event.event);
      return res.status(200).json({ received: true });
    }
    
    const trackingData = event.data;
    const trackingNumber = trackingData.tracking_number;
    const trackingStatus = trackingData.tracking_status?.status;
    
    if (!trackingNumber || !trackingStatus) {
      console.warn('[ShippoWebhook] Missing tracking number or status');
      return res.status(400).json({ error: 'Missing tracking data' });
    }
    
    console.log(`[ShippoWebhook] Tracking update: ${trackingNumber} -> ${trackingStatus}`);
    
    // Find order by tracking number
    const db = await getDb();
    if (!db) {
      console.error('[ShippoWebhook] Database not available');
      return res.status(500).json({ error: 'Database unavailable' });
    }
    
    const orderData = await db
      .select()
      .from(orders)
      .where(eq(orders.trackingNumber, trackingNumber))
      .limit(1);
    
    if (orderData.length === 0) {
      console.warn(`[ShippoWebhook] Order not found for tracking number: ${trackingNumber}`);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderData[0];
    
    // Update order status
    await db
      .update(orders)
      .set({
        fulfillmentStatus: trackingStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));
    
    console.log(`[ShippoWebhook] Updated order ${order.orderNumber} status to: ${trackingStatus}`);
    
    // Check if we should send an email
    if (!shouldSendEmail(trackingStatus)) {
      console.log(`[ShippoWebhook] Status ${trackingStatus} does not trigger an email`);
      return res.status(200).json({ received: true, emailTriggered: false });
    }
    
    const emailType = mapShippoStatusToEmailType(trackingStatus);
    if (!emailType) {
      return res.status(200).json({ received: true, emailTriggered: false });
    }
    
    // Schedule shipping update email (send immediately)
    const jobId = await scheduleJob({
      jobType: 'send_shipping_update',
      scheduledFor: new Date(), // Send immediately
      payload: {
        orderId: order.id,
        emailType,
      },
    });
    
    console.log(`[ShippoWebhook] Scheduled ${emailType} email (job ${jobId}) for order ${order.orderNumber}`);
    
    // If delivered, schedule review request for 14 days later
    if (emailType === 'shipping_delivered') {
      const reviewRequestDate = new Date();
      reviewRequestDate.setDate(reviewRequestDate.getDate() + 14); // 14 days from now
      
      const reviewJobId = await scheduleJob({
        jobType: 'send_review_request',
        scheduledFor: reviewRequestDate,
        payload: {
          orderId: order.id,
        },
      });
      
      console.log(`[ShippoWebhook] Scheduled review request (job ${reviewJobId}) for ${reviewRequestDate.toISOString()}`);
    }
    
    return res.status(200).json({ 
      received: true, 
      emailTriggered: true,
      emailType,
      orderNumber: order.orderNumber,
    });
    
  } catch (error) {
    console.error('[ShippoWebhook] Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
