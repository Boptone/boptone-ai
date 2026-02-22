/**
 * Job Scheduler
 * Background worker that processes scheduled jobs (timed emails, automation tasks)
 * Runs every 30 seconds to check for pending jobs
 */

import { getDb } from '../db';
import { scheduledJobs, orders, orderItems, products, artistProfiles, users } from '../../drizzle/schema';
import { eq, and, lte } from 'drizzle-orm';
import {
  sendOrderConfirmationEmail,
  sendAbandonedCartEmail,
  sendShippingUpdateEmail,
  sendReviewRequestEmail,
} from './emailService';

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

/**
 * Start the job scheduler
 */
export function startJobScheduler() {
  if (intervalId) {
    console.log('[JobScheduler] Already running');
    return;
  }

  console.log('[JobScheduler] Starting background worker...');
  
  // Run immediately on start
  processJobs().catch(err => {
    console.error('[JobScheduler] Initial run error:', err);
  });

  // Then run every 30 seconds
  intervalId = setInterval(() => {
    processJobs().catch(err => {
      console.error('[JobScheduler] Interval run error:', err);
    });
  }, 30000); // 30 seconds

  console.log('[JobScheduler] Background worker started (polling every 30s)');
}

/**
 * Stop the job scheduler
 */
export function stopJobScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[JobScheduler] Background worker stopped');
  }
}

/**
 * Process pending jobs
 */
async function processJobs() {
  if (isRunning) {
    console.log('[JobScheduler] Already processing jobs, skipping this cycle');
    return;
  }

  isRunning = true;

  try {
    const db = await getDb();
    if (!db) {
      console.warn('[JobScheduler] Database not available');
      return;
    }

    // Find pending jobs that are due
    const now = new Date();
    const pendingJobs = await db
      .select()
      .from(scheduledJobs)
      .where(
        and(
          eq(scheduledJobs.status, 'pending'),
          lte(scheduledJobs.scheduledFor, now)
        )
      )
      .limit(5); // Process up to 5 jobs per cycle

    if (pendingJobs.length === 0) {
      return;
    }

    console.log(`[JobScheduler] Processing ${pendingJobs.length} pending jobs`);

    // Process each job
    for (const job of pendingJobs) {
      try {
        // Mark as processing
        await db
          .update(scheduledJobs)
          .set({
            status: 'processing',
            lastAttemptAt: new Date(),
            attempts: job.attempts + 1,
          })
          .where(eq(scheduledJobs.id, job.id));

        // Execute job based on type
        await executeJob(job);

        // Mark as completed
        await db
          .update(scheduledJobs)
          .set({
            status: 'completed',
            completedAt: new Date(),
          })
          .where(eq(scheduledJobs.id, job.id));

        console.log(`[JobScheduler] Job ${job.id} (${job.jobType}) completed successfully`);
      } catch (error) {
        console.error(`[JobScheduler] Job ${job.id} (${job.jobType}) failed:`, error);

        // Check if we should retry
        const shouldRetry = job.attempts < job.maxAttempts;
        
        if (shouldRetry) {
          // Calculate exponential backoff: 5min, 15min, 45min
          const backoffMinutes = 5 * Math.pow(3, job.attempts);
          const nextAttempt = new Date(Date.now() + backoffMinutes * 60 * 1000);

          await db
            .update(scheduledJobs)
            .set({
              status: 'pending',
              scheduledFor: nextAttempt,
              errorMessage: String(error),
            })
            .where(eq(scheduledJobs.id, job.id));

          console.log(`[JobScheduler] Job ${job.id} will retry in ${backoffMinutes} minutes`);
        } else {
          // Max attempts reached, mark as failed
          await db
            .update(scheduledJobs)
            .set({
              status: 'failed',
              errorMessage: String(error),
            })
            .where(eq(scheduledJobs.id, job.id));

          console.error(`[JobScheduler] Job ${job.id} failed permanently after ${job.attempts} attempts`);
        }
      }
    }
  } catch (error) {
    console.error('[JobScheduler] Error processing jobs:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Execute a specific job
 */
async function executeJob(job: any) {
  const payload = job.payload;

  switch (job.jobType) {
    case 'send_order_confirmation':
      await handleOrderConfirmation(payload);
      break;

    case 'send_abandoned_cart':
      await handleAbandonedCart(payload);
      break;

    case 'send_shipping_update':
      await handleShippingUpdate(payload);
      break;

    case 'send_review_request':
      await handleReviewRequest(payload);
      break;

    default:
      throw new Error(`Unknown job type: ${job.jobType}`);
  }
}

/**
 * Handle order confirmation email (1 minute after purchase)
 */
async function handleOrderConfirmation(payload: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Fetch order details with customer info
  const orderData = await db
    .select({
      orderNumber: orders.orderNumber,
      customerEmail: users.email,
      customerName: users.name,
      subtotal: orders.subtotal,
      shippingAmount: orders.shippingAmount,
      taxAmount: orders.taxAmount,
      total: orders.total,
      currency: orders.currency,
      shippingAddress: orders.shippingAddress,
    })
    .from(orders)
    .innerJoin(users, eq(orders.customerId, users.id))
    .where(eq(orders.id, payload.orderId))
    .limit(1);

  if (orderData.length === 0) {
    throw new Error(`Order ${payload.orderId} not found`);
  }

  const order = orderData[0];

  // Fetch order items with product details
  const items = await db
    .select({
      name: products.name,
      artistName: artistProfiles.stageName,
      imageUrl: products.primaryImageUrl,
      quantity: orderItems.quantity,
      price: orderItems.pricePerUnit,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(artistProfiles, eq(products.artistId, artistProfiles.id))
    .where(eq(orderItems.orderId, payload.orderId));

  // Send email
  await sendOrderConfirmationEmail({
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    items: items.map(item => ({
      name: item.name,
      artistName: item.artistName,
      imageUrl: item.imageUrl ?? undefined,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: order.subtotal,
    shippingAmount: order.shippingAmount,
    taxAmount: order.taxAmount,
    total: order.total,
    currency: order.currency,
    shippingAddress: order.shippingAddress ? {
      name: order.shippingAddress.name,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      zip: order.shippingAddress.zip,
      country: order.shippingAddress.country,
    } : undefined,
  });
}

/**
 * Handle abandoned cart email (24 hours after checkout started)
 */
async function handleAbandonedCart(payload: any) {
  await sendAbandonedCartEmail({
    cartEventId: payload.cartEventId,
    customerEmail: payload.customerEmail,
    customerName: payload.customerName,
    userId: payload.userId,
    items: payload.items.map((item: any) => ({
      ...item,
      artistName: item.artistName || 'Unknown Artist',
    })),
    subtotal: payload.subtotal,
    currency: payload.currency,
    checkoutUrl: payload.checkoutUrl,
  });
}

/**
 * Handle shipping update email (in-transit, out-for-delivery, delivered)
 */
async function handleShippingUpdate(payload: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Fetch order details with customer info
  const orderData = await db
    .select({
      orderNumber: orders.orderNumber,
      customerEmail: users.email,
      customerName: users.name,
      trackingNumber: orders.trackingNumber,
      trackingUrl: orders.trackingUrl,
      carrier: orders.shippingMethod,
      serviceLevel: orders.shippingMethod,
      estimatedDeliveryDate: orders.deliveredAt,
      shippingAddress: orders.shippingAddress,
    })
    .from(orders)
    .innerJoin(users, eq(orders.customerId, users.id))
    .where(eq(orders.id, payload.orderId))
    .limit(1);

  if (orderData.length === 0) {
    throw new Error(`Order ${payload.orderId} not found`);
  }

  const order = orderData[0];

  // Send email
  await sendShippingUpdateEmail({
    emailType: payload.emailType,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    trackingNumber: order.trackingNumber ?? undefined,
    trackingUrl: order.trackingUrl ?? undefined,
    carrier: order.carrier ?? undefined,
    serviceLevel: order.serviceLevel ?? undefined,
    estimatedDeliveryDate: order.estimatedDeliveryDate?.toISOString(),
    shippingAddress: order.shippingAddress ? {
      name: order.shippingAddress.name,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      zip: order.shippingAddress.zip,
    } : undefined,
  });
}

/**
 * Handle review request email (14 days after delivery)
 */
async function handleReviewRequest(payload: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Fetch order details with customer info
  const orderData = await db
    .select({
      orderNumber: orders.orderNumber,
      customerEmail: users.email,
      customerName: users.name,
    })
    .from(orders)
    .innerJoin(users, eq(orders.customerId, users.id))
    .where(eq(orders.id, payload.orderId))
    .limit(1);

  if (orderData.length === 0) {
    throw new Error(`Order ${payload.orderId} not found`);
  }

  const order = orderData[0];

  // Fetch order items with product details
  const items = await db
    .select({
      productId: products.id,
      name: products.name,
      artistName: artistProfiles.stageName,
      imageUrl: products.primaryImageUrl,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(artistProfiles, eq(products.artistId, artistProfiles.id))
    .where(eq(orderItems.orderId, payload.orderId));

  // Send email
  await sendReviewRequestEmail({
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    items: items.map(item => ({
      productId: item.productId,
      name: item.name,
      artistName: item.artistName,
      imageUrl: item.imageUrl ?? undefined,
    })),
  });
}

/**
 * Schedule a job
 */
export async function scheduleJob(params: {
  jobType: 'send_order_confirmation' | 'send_abandoned_cart' | 'send_shipping_update' | 'send_review_request';
  scheduledFor: Date;
  payload: Record<string, any>;
  maxAttempts?: number;
}): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn('[JobScheduler] Cannot schedule job: database not available');
    return 0;
  }

  const result = await db.insert(scheduledJobs).values({
    jobType: params.jobType,
    scheduledFor: params.scheduledFor,
    payload: params.payload,
    maxAttempts: params.maxAttempts ?? 3,
    status: 'pending',
    attempts: 0,
  });

  const jobId = Number((result as any)[0]?.insertId) || 0;
  console.log(`[JobScheduler] Scheduled job ${jobId} (${params.jobType}) for ${params.scheduledFor.toISOString()}`);
  
  return jobId;
}
