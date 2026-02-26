# Webhook Delivery System with Guarantees

**Date:** February 26, 2026  
**Platform:** Boptone - Autonomous Creator OS  
**Status:** Design Complete - Ready for Implementation

---

## Executive Summary

As Boptone integrates with third-party platforms (DSPs, payment processors, analytics tools), a reliable webhook delivery system is critical for real-time event notifications. This document outlines the architecture for guaranteed webhook delivery with automatic retries, exponential backoff, and delivery tracking.

---

## Use Cases

### Internal Webhooks (Boptone → Third Parties)
- **Order fulfillment:** Notify print-on-demand providers when orders are placed
- **Track distribution:** Notify DSPs (Spotify, Apple Music) when tracks are released
- **Payment events:** Notify accounting systems when payouts are processed
- **Analytics events:** Notify analytics platforms when streams occur

### External Webhooks (Third Parties → Boptone)
- **Stripe webhooks:** Payment confirmations, subscription updates
- **Printful webhooks:** Fulfillment status updates
- **Shippo webhooks:** Shipping label creation, tracking updates

---

## Architecture Overview

### Components

1. **Webhook Registry** - Stores webhook endpoints and configuration
2. **Event Queue** - Buffers events for reliable delivery
3. **Delivery Worker** - Processes queue and sends HTTP requests
4. **Retry Scheduler** - Handles failed deliveries with exponential backoff
5. **Delivery Log** - Tracks all delivery attempts and outcomes

### Data Flow

```
Event Occurs → Queue Event → Delivery Worker → HTTP POST → Success/Failure
                                    ↓ (Failure)
                            Retry Scheduler → Queue Event (with delay)
                                    ↓ (Max retries exceeded)
                            Dead Letter Queue → Manual Review
```

---

## Database Schema

### webhook_endpoints Table
```typescript
export const webhookEndpoints = mysqlTable("webhook_endpoints", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id),
  
  // Endpoint configuration
  url: varchar("url", { length: 500 }).notNull(),
  secret: varchar("secret", { length: 64 }).notNull(), // HMAC-SHA256 signing secret
  
  // Event filtering
  events: json("events").$type<string[]>(), // ["order.created", "track.released"]
  
  // Status
  status: mysqlEnum("status", ["active", "paused", "disabled"]).default("active").notNull(),
  failureCount: int("failureCount").default(0).notNull(),
  lastFailureAt: timestamp("lastFailureAt"),
  
  // Metadata
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  artistIdIdx: index("artist_id_idx").on(table.artistId),
  statusIdx: index("status_idx").on(table.status),
}));
```

### webhook_deliveries Table
```typescript
export const webhookDeliveries = mysqlTable("webhook_deliveries", {
  id: int("id").autoincrement().primaryKey(),
  endpointId: int("endpointId").notNull().references(() => webhookEndpoints.id),
  
  // Event data
  eventType: varchar("eventType", { length: 100 }).notNull(), // "order.created"
  eventId: varchar("eventId", { length: 100 }).notNull(), // "order_123"
  payload: json("payload").$type<Record<string, any>>().notNull(),
  
  // Delivery tracking
  status: mysqlEnum("status", ["pending", "delivered", "failed", "dead_letter"]).default("pending").notNull(),
  attempts: int("attempts").default(0).notNull(),
  maxAttempts: int("maxAttempts").default(5).notNull(),
  nextRetryAt: timestamp("nextRetryAt"),
  
  // Response tracking
  httpStatus: int("httpStatus"),
  responseBody: text("responseBody"),
  errorMessage: text("errorMessage"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deliveredAt: timestamp("deliveredAt"),
  failedAt: timestamp("failedAt"),
}, (table) => ({
  endpointIdIdx: index("endpoint_id_idx").on(table.endpointId),
  statusIdx: index("status_idx").on(table.status),
  nextRetryAtIdx: index("next_retry_at_idx").on(table.nextRetryAt),
  eventTypeIdx: index("event_type_idx").on(table.eventType),
}));
```

---

## Retry Strategy

### Exponential Backoff Schedule
```
Attempt 1: Immediate
Attempt 2: 1 minute later
Attempt 3: 5 minutes later
Attempt 4: 15 minutes later
Attempt 5: 1 hour later
Attempt 6: 6 hours later (Dead Letter Queue)
```

### Retry Logic
```typescript
function calculateNextRetryAt(attempts: number): Date {
  const delays = [0, 60, 300, 900, 3600, 21600]; // seconds
  const delay = delays[Math.min(attempts, delays.length - 1)];
  return new Date(Date.now() + delay * 1000);
}

function shouldRetry(delivery: WebhookDelivery): boolean {
  return delivery.attempts < delivery.maxAttempts;
}
```

### Retry Conditions
**Retry on:**
- HTTP 5xx errors (server errors)
- Network timeouts
- Connection refused
- DNS resolution failures

**Don't retry on:**
- HTTP 4xx errors (client errors, except 429 Rate Limit)
- HTTP 410 Gone (endpoint permanently removed)
- Invalid URL format

---

## Signature Verification

### HMAC-SHA256 Signing
```typescript
import crypto from 'crypto';

function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Request Headers
```
POST /webhooks/boptone HTTP/1.1
Host: example.com
Content-Type: application/json
X-Boptone-Signature: sha256=abc123...
X-Boptone-Event: order.created
X-Boptone-Delivery-ID: delivery_123
X-Boptone-Timestamp: 1234567890

{
  "event": "order.created",
  "data": { ... }
}
```

---

## Implementation

### 1. Webhook Service
```typescript
// server/services/webhookService.ts
import { db } from '../db';
import { webhookEndpoints, webhookDeliveries } from '../../drizzle/schema';
import crypto from 'crypto';

export async function queueWebhook(params: {
  eventType: string;
  eventId: string;
  payload: Record<string, any>;
  artistId?: number;
}) {
  // Find matching webhook endpoints
  const endpoints = await db.query.webhookEndpoints.findMany({
    where: (table, { eq, and, inArray }) =>
      and(
        eq(table.status, 'active'),
        params.artistId ? eq(table.artistId, params.artistId) : undefined,
        // Filter by event type if endpoint has event filters
      ),
  });

  // Queue delivery for each endpoint
  for (const endpoint of endpoints) {
    await db.insert(webhookDeliveries).values({
      endpointId: endpoint.id,
      eventType: params.eventType,
      eventId: params.eventId,
      payload: params.payload,
      status: 'pending',
      nextRetryAt: new Date(), // Immediate delivery
    });
  }
}

export async function deliverWebhook(deliveryId: number) {
  const delivery = await db.query.webhookDeliveries.findFirst({
    where: (table, { eq }) => eq(table.id, deliveryId),
    with: { endpoint: true },
  });

  if (!delivery) throw new Error('Delivery not found');

  const payload = JSON.stringify(delivery.payload);
  const signature = generateSignature(payload, delivery.endpoint.secret);

  try {
    const response = await fetch(delivery.endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Boptone-Signature': `sha256=${signature}`,
        'X-Boptone-Event': delivery.eventType,
        'X-Boptone-Delivery-ID': delivery.id.toString(),
        'X-Boptone-Timestamp': Date.now().toString(),
      },
      body: payload,
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (response.ok) {
      // Success
      await db.update(webhookDeliveries)
        .set({
          status: 'delivered',
          httpStatus: response.status,
          responseBody: await response.text(),
          deliveredAt: new Date(),
        })
        .where(eq(webhookDeliveries.id, deliveryId));
    } else {
      // HTTP error
      await handleDeliveryFailure(deliveryId, {
        httpStatus: response.status,
        errorMessage: `HTTP ${response.status}: ${await response.text()}`,
      });
    }
  } catch (error) {
    // Network error
    await handleDeliveryFailure(deliveryId, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleDeliveryFailure(deliveryId: number, error: {
  httpStatus?: number;
  errorMessage: string;
}) {
  const delivery = await db.query.webhookDeliveries.findFirst({
    where: (table, { eq }) => eq(table.id, deliveryId),
  });

  if (!delivery) return;

  const newAttempts = delivery.attempts + 1;
  const shouldRetry = newAttempts < delivery.maxAttempts;

  await db.update(webhookDeliveries)
    .set({
      status: shouldRetry ? 'pending' : 'dead_letter',
      attempts: newAttempts,
      nextRetryAt: shouldRetry ? calculateNextRetryAt(newAttempts) : null,
      httpStatus: error.httpStatus,
      errorMessage: error.errorMessage,
      failedAt: shouldRetry ? null : new Date(),
    })
    .where(eq(webhookDeliveries.id, deliveryId));

  // Update endpoint failure count
  if (!shouldRetry) {
    await db.update(webhookEndpoints)
      .set({
        failureCount: sql`${webhookEndpoints.failureCount} + 1`,
        lastFailureAt: new Date(),
      })
      .where(eq(webhookEndpoints.id, delivery.endpointId));
  }
}

function calculateNextRetryAt(attempts: number): Date {
  const delays = [0, 60, 300, 900, 3600, 21600]; // seconds
  const delay = delays[Math.min(attempts, delays.length - 1)];
  return new Date(Date.now() + delay * 1000);
}

function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
```

### 2. Delivery Worker (Background Job)
```typescript
// server/workers/webhookWorker.ts
import { db } from '../db';
import { webhookDeliveries } from '../../drizzle/schema';
import { deliverWebhook } from '../services/webhookService';
import { lte, eq } from 'drizzle-orm';

export async function processWebhookQueue() {
  // Find deliveries ready to send
  const pendingDeliveries = await db.query.webhookDeliveries.findMany({
    where: (table, { and, lte, eq }) =>
      and(
        eq(table.status, 'pending'),
        lte(table.nextRetryAt, new Date())
      ),
    limit: 100, // Process 100 at a time
  });

  console.log(`[WebhookWorker] Processing ${pendingDeliveries.length} webhooks`);

  // Deliver webhooks in parallel (with concurrency limit)
  const promises = pendingDeliveries.map(delivery =>
    deliverWebhook(delivery.id).catch(err =>
      console.error(`[WebhookWorker] Failed to deliver webhook ${delivery.id}:`, err)
    )
  );

  await Promise.all(promises);
}

// Run worker every 30 seconds
setInterval(processWebhookQueue, 30000);
```

### 3. Event Emission Helper
```typescript
// server/services/eventEmitter.ts
import { queueWebhook } from './webhookService';

export async function emitEvent(params: {
  eventType: string;
  eventId: string;
  payload: Record<string, any>;
  artistId?: number;
}) {
  console.log(`[Event] ${params.eventType} - ${params.eventId}`);
  
  // Queue webhook delivery
  await queueWebhook(params);
  
  // Could also emit to internal event bus here
}

// Usage example:
// await emitEvent({
//   eventType: 'order.created',
//   eventId: `order_${order.id}`,
//   payload: { order },
//   artistId: order.artistId,
// });
```

---

## Event Types

### Order Events
- `order.created` - New order placed
- `order.paid` - Payment confirmed
- `order.fulfilled` - Order shipped
- `order.cancelled` - Order cancelled

### Track Events
- `track.uploaded` - New track uploaded
- `track.released` - Track published
- `track.distributed` - Track sent to DSPs

### Payment Events
- `payout.created` - Payout initiated
- `payout.completed` - Payout sent to artist
- `payout.failed` - Payout failed

### Stream Events
- `stream.completed` - Track streamed (>30s)
- `stream.paid` - Stream payment processed

---

## Testing

### Test Webhook Endpoint
```typescript
// server/routers/webhooks.ts
export const webhooksRouter = router({
  test: protectedProcedure
    .input(z.object({ endpointId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const endpoint = await db.query.webhookEndpoints.findFirst({
        where: (table, { eq }) => eq(table.id, input.endpointId),
      });

      if (!endpoint) throw new TRPCError({ code: 'NOT_FOUND' });

      // Queue test delivery
      await queueWebhook({
        eventType: 'test.ping',
        eventId: `test_${Date.now()}`,
        payload: {
          message: 'Test webhook from Boptone',
          timestamp: new Date().toISOString(),
        },
        artistId: endpoint.artistId,
      });

      return { success: true };
    }),
});
```

### Webhook Receiver (For Testing)
```typescript
// Example third-party webhook receiver
app.post('/webhooks/boptone', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-boptone-signature'] as string;
  const payload = req.body.toString();
  
  // Verify signature
  const secret = process.env.BOPTONE_WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
  const event = JSON.parse(payload);
  console.log('Received webhook:', event);
  
  res.json({ received: true });
});
```

---

## Monitoring & Alerts

### Metrics to Track
- **Delivery success rate:** % of webhooks delivered on first attempt
- **Average delivery time:** Time from event to successful delivery
- **Retry rate:** % of webhooks requiring retries
- **Dead letter queue size:** Number of permanently failed deliveries
- **Endpoint health:** Per-endpoint success rates

### Alerts
- **High failure rate:** Alert if >10% of deliveries fail
- **Dead letter queue growing:** Alert if DLQ size > 100
- **Endpoint disabled:** Alert if endpoint auto-disabled due to failures
- **Delivery lag:** Alert if pending deliveries > 1000

---

## Security Best Practices

### DO:
- Always use HMAC-SHA256 signature verification
- Use HTTPS for all webhook endpoints
- Rotate webhook secrets periodically
- Rate limit webhook endpoints (prevent abuse)
- Log all delivery attempts for audit trail
- Implement IP allowlisting for sensitive webhooks

### DON'T:
- Send sensitive data (passwords, API keys) in webhooks
- Retry 4xx errors (client errors indicate bad config)
- Store webhook secrets in plaintext
- Allow webhook URLs without HTTPS
- Send webhooks synchronously (always queue)

---

## Dead Letter Queue Management

### Manual Review Process
1. Admin views failed deliveries in dashboard
2. Inspect error message and HTTP response
3. Determine root cause:
   - Invalid endpoint URL → Update endpoint
   - Endpoint down → Wait for recovery, then retry
   - Invalid payload → Fix event emitter
   - Authentication issue → Update secret
4. Manually retry or discard delivery

### Auto-Disable Policy
- If endpoint fails 10 consecutive deliveries, auto-disable
- Send notification to artist/admin
- Require manual re-enable after fixing issue

---

## Implementation Checklist

- [ ] Create `webhook_endpoints` table
- [ ] Create `webhook_deliveries` table
- [ ] Implement `webhookService.ts` (queue, deliver, retry logic)
- [ ] Implement `webhookWorker.ts` (background job)
- [ ] Add HMAC-SHA256 signature generation/verification
- [ ] Create webhook management UI (add/edit/delete endpoints)
- [ ] Add webhook testing endpoint
- [ ] Implement delivery tracking dashboard
- [ ] Add dead letter queue management UI
- [ ] Set up monitoring and alerts
- [ ] Write webhook integration guide for third parties
- [ ] Add webhook delivery logs to admin panel

---

## Next Steps

1. **Immediate:** Create database schema and run migration
2. **Short-term:** Implement core webhook service and delivery worker
3. **Medium-term:** Build webhook management UI for artists
4. **Long-term:** Add advanced features (webhook replay, batch delivery)

---

**Status:** DESIGN COMPLETE - Ready for implementation  
**Next Action:** Create database schema and implement webhook service
