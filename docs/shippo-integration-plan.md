# Shippo API Integration Plan

**Date:** February 20, 2026  
**Purpose:** Design shipping integration for BopShop using Shippo API

---

## Overview

Shippo provides a unified API to access multiple shipping carriers (USPS, FedEx, UPS, DHL, etc.) for:
- Real-time shipping rate calculation
- Shipping label purchase and printing
- Package tracking
- International shipping support

---

## API Architecture

### Authentication
- **Method:** Bearer token authentication
- **Header:** `Authorization: ShippoToken <API_TOKEN>`
- **Test Mode:** Use test token for development (free API calls)
- **Production:** Generate live API token from Shippo dashboard

### Base URL
```
https://api.goshippo.com/
```

### Key Endpoints

1. **Create Shipment** - Get shipping rates
   ```
   POST /shipments/
   ```

2. **Create Transaction** - Purchase shipping label
   ```
   POST /transactions/
   ```

3. **Track Package** - Get tracking status
   ```
   GET /tracks/{carrier}/{tracking_number}/
   ```

---

## Integration Flow

### Flow 1: Get Shipping Rates (Checkout Page)

**User Action:** Customer enters shipping address at checkout

**API Call:**
```javascript
POST /shipments/
{
  "address_from": {
    "name": "Artist Name",
    "street1": "Artist Address",
    "city": "City",
    "state": "State",
    "zip": "Zip",
    "country": "US"
  },
  "address_to": {
    "name": "Customer Name",
    "street1": "Customer Address",
    "city": "City",
    "state": "State",
    "zip": "Zip",
    "country": "US"
  },
  "parcels": [{
    "length": "10",
    "width": "8",
    "height": "4",
    "distance_unit": "in",
    "weight": "1",
    "mass_unit": "lb"
  }],
  "async": false
}
```

**Response:**
```javascript
{
  "object_id": "shipment_id_123",
  "rates": [
    {
      "object_id": "rate_id_1",
      "provider": "USPS",
      "servicelevel": { "name": "Priority Mail" },
      "amount": "8.50",
      "currency": "USD",
      "estimated_days": 2
    },
    {
      "object_id": "rate_id_2",
      "provider": "FedEx",
      "servicelevel": { "name": "Ground" },
      "amount": "12.30",
      "currency": "USD",
      "estimated_days": 3
    }
  ]
}
```

**UI Display:** Show customer shipping options with prices and delivery estimates

---

### Flow 2: Purchase Shipping Label (Order Fulfillment)

**User Action:** Artist clicks "Print Label" in admin dashboard

**API Call:**
```javascript
POST /transactions/
{
  "rate": "rate_id_1",  // Selected rate from shipment
  "label_file_type": "PDF",
  "async": false
}
```

**Response:**
```javascript
{
  "object_id": "transaction_id_123",
  "status": "SUCCESS",
  "label_url": "https://shippo-delivery.s3.amazonaws.com/label.pdf",
  "tracking_number": "9400111899562537866466",
  "tracking_url_provider": "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899562537866466"
}
```

**Action:** Download PDF label, store tracking number in database

---

### Flow 3: Track Package

**User Action:** Customer clicks "Track Package" or automated tracking update

**API Call:**
```javascript
GET /tracks/usps/9400111899562537866466/
```

**Response:**
```javascript
{
  "carrier": "usps",
  "tracking_number": "9400111899562537866466",
  "tracking_status": {
    "status": "DELIVERED",
    "status_details": "Delivered, In/At Mailbox",
    "status_date": "2026-02-22T14:30:00Z"
  },
  "tracking_history": [
    {
      "status": "TRANSIT",
      "status_details": "In Transit to Next Facility",
      "status_date": "2026-02-21T08:15:00Z",
      "location": { "city": "Oakland", "state": "CA" }
    },
    {
      "status": "DELIVERED",
      "status_details": "Delivered, In/At Mailbox",
      "status_date": "2026-02-22T14:30:00Z",
      "location": { "city": "San Francisco", "state": "CA" }
    }
  ]
}
```

---

## Database Schema

### Table: `shipping_labels`

```sql
CREATE TABLE shipping_labels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  shipmentId VARCHAR(255) NOT NULL,  -- Shippo shipment object_id
  rateId VARCHAR(255) NOT NULL,      -- Selected rate object_id
  transactionId VARCHAR(255),        -- Shippo transaction object_id (after purchase)
  carrier VARCHAR(100),               -- USPS, FedEx, UPS, DHL
  service VARCHAR(100),               -- Priority Mail, Ground, etc.
  trackingNumber VARCHAR(255),
  trackingUrl TEXT,
  labelUrl TEXT,                      -- URL to PDF label
  cost DECIMAL(10, 2),                -- Shipping cost
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'purchased', 'printed', 'shipped', 'delivered', 'failed') DEFAULT 'pending',
  addressFrom JSON,                   -- Store full address for reference
  addressTo JSON,
  parcel JSON,                        -- Package dimensions and weight
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orderId (orderId),
  INDEX idx_trackingNumber (trackingNumber),
  INDEX idx_status (status),
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
);
```

### Table: `tracking_events`

```sql
CREATE TABLE tracking_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shippingLabelId INT NOT NULL,
  status VARCHAR(50),                 -- TRANSIT, OUT_FOR_DELIVERY, DELIVERED, etc.
  statusDetails TEXT,
  location JSON,                      -- { city, state, country }
  eventDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_shippingLabelId (shippingLabelId),
  INDEX idx_status (status),
  FOREIGN KEY (shippingLabelId) REFERENCES shipping_labels(id) ON DELETE CASCADE
);
```

---

## tRPC Router: `shippingRouter`

### Procedures

#### 1. `calculateRates`
**Input:**
```typescript
{
  orderId: number;
  addressTo: {
    name: string;
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  parcel: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}
```

**Output:**
```typescript
{
  shipmentId: string;
  rates: Array<{
    rateId: string;
    carrier: string;
    service: string;
    amount: number;
    currency: string;
    estimatedDays: number;
  }>;
}
```

**Logic:**
1. Get order details from database (artist address, products)
2. Calculate total package weight from products
3. Call Shippo `/shipments/` endpoint
4. Store shipment ID in database
5. Return rates to frontend

---

#### 2. `purchaseLabel`
**Input:**
```typescript
{
  orderId: number;
  rateId: string;
}
```

**Output:**
```typescript
{
  labelUrl: string;
  trackingNumber: string;
  trackingUrl: string;
}
```

**Logic:**
1. Call Shippo `/transactions/` endpoint with rate ID
2. Store transaction ID, tracking number, label URL in `shipping_labels` table
3. Update order status to 'shipped'
4. Send tracking email to customer
5. Return label URL for printing

---

#### 3. `trackShipment`
**Input:**
```typescript
{
  trackingNumber: string;
  carrier: string;
}
```

**Output:**
```typescript
{
  status: string;
  statusDetails: string;
  estimatedDelivery: string;
  trackingHistory: Array<{
    status: string;
    statusDetails: string;
    location: { city: string; state: string };
    eventDate: string;
  }>;
}
```

**Logic:**
1. Call Shippo `/tracks/{carrier}/{tracking_number}/` endpoint
2. Store tracking events in `tracking_events` table
3. Return tracking status to frontend

---

#### 4. `getShippingLabel`
**Input:**
```typescript
{
  orderId: number;
}
```

**Output:**
```typescript
{
  labelUrl: string;
  trackingNumber: string;
  carrier: string;
  service: string;
  status: string;
}
```

**Logic:**
1. Query `shipping_labels` table by order ID
2. Return label details

---

#### 5. `bulkPrintLabels`
**Input:**
```typescript
{
  orderIds: number[];
}
```

**Output:**
```typescript
{
  labels: Array<{
    orderId: number;
    labelUrl: string;
    trackingNumber: string;
  }>;
}
```

**Logic:**
1. Get all shipping labels for order IDs
2. Return array of label URLs for bulk printing

---

## Frontend Components

### 1. Checkout Page - Shipping Rate Selector

**Location:** `client/src/pages/Checkout.tsx`

**UI:**
```tsx
<div className="shipping-options">
  <h3>Shipping Method</h3>
  {rates.map(rate => (
    <div key={rate.rateId} className="shipping-option">
      <input
        type="radio"
        name="shipping"
        value={rate.rateId}
        checked={selectedRate === rate.rateId}
        onChange={() => setSelectedRate(rate.rateId)}
      />
      <div>
        <strong>{rate.carrier} - {rate.service}</strong>
        <p>Estimated delivery: {rate.estimatedDays} days</p>
      </div>
      <span className="price">${rate.amount}</span>
    </div>
  ))}
</div>
```

**Logic:**
- Call `trpc.shipping.calculateRates.useQuery()` when address is entered
- Display loading state while fetching rates
- Allow customer to select shipping method
- Add selected rate cost to order total

---

### 2. Admin Dashboard - Order Fulfillment

**Location:** `client/src/pages/admin/AdminOrders.tsx`

**UI:**
```tsx
<div className="order-actions">
  {order.shippingLabel ? (
    <>
      <a href={order.shippingLabel.labelUrl} target="_blank">
        Download Label
      </a>
      <button onClick={() => trackShipment(order.shippingLabel.trackingNumber)}>
        Track Package
      </button>
    </>
  ) : (
    <button onClick={() => purchaseLabel(order.id)}>
      Print Shipping Label
    </button>
  )}
</div>
```

**Logic:**
- Show "Print Shipping Label" button for orders without labels
- Call `trpc.shipping.purchaseLabel.useMutation()` when clicked
- Download PDF label automatically
- Update order status to 'shipped'
- Show tracking number and "Track Package" button

---

### 3. Customer Order Tracking

**Location:** `client/src/pages/OrderTracking.tsx`

**UI:**
```tsx
<div className="tracking-timeline">
  <h3>Package Tracking</h3>
  <p>Tracking Number: {trackingNumber}</p>
  <div className="timeline">
    {trackingHistory.map((event, index) => (
      <div key={index} className="timeline-event">
        <div className="timeline-marker" />
        <div className="timeline-content">
          <strong>{event.status}</strong>
          <p>{event.statusDetails}</p>
          <small>{event.location.city}, {event.location.state}</small>
          <small>{new Date(event.eventDate).toLocaleString()}</small>
        </div>
      </div>
    ))}
  </div>
</div>
```

**Logic:**
- Call `trpc.shipping.trackShipment.useQuery()` on page load
- Display tracking timeline with events
- Auto-refresh every 5 minutes
- Show estimated delivery date

---

## Implementation Steps

### Phase 1: Database Setup (Day 1)
1. Create `shipping_labels` table
2. Create `tracking_events` table
3. Run migrations

### Phase 2: Backend API (Days 2-3)
1. Install Shippo Node.js SDK: `npm install shippo`
2. Add Shippo API key to environment variables
3. Create `server/shipping.ts` helper functions
4. Build `shippingRouter` with 5 procedures
5. Test API calls with Shippo test token

### Phase 3: Frontend Integration (Days 4-5)
1. Update Checkout.tsx with shipping rate selector
2. Update AdminOrders.tsx with label printing
3. Create OrderTracking.tsx page
4. Add tracking email notifications

### Phase 4: Testing (Day 6)
1. Test rate calculation with various addresses
2. Test label purchase and PDF download
3. Test tracking updates
4. Test bulk label printing
5. Test international shipping

---

## Cost Considerations

**Shippo Pricing:**
- **Free tier:** First 500 labels per month
- **Pay-as-you-go:** $0.05 per label after free tier
- **Carrier rates:** Discounted rates (20-40% off retail)

**Example:**
- USPS Priority Mail: $8.50 (retail: $12.00)
- FedEx Ground: $12.30 (retail: $18.50)
- Shippo fee: $0.05 per label

**BopShop Strategy:**
- Pass carrier costs to artists (Shopify model)
- Absorb Shippo API fees ($0.05 per label)
- Artists save 20-40% vs. retail shipping rates

---

## Success Metrics

**Phase 1 Targets:**
- 90% of orders use integrated shipping
- Average label purchase time < 30 seconds
- 95% tracking accuracy
- Zero shipping calculation errors
- 100% label printing success rate

---

## Next Steps

1. Add Shippo API key to environment variables
2. Install Shippo Node.js SDK
3. Create database migrations
4. Build shipping helper functions
5. Implement tRPC procedures
6. Update frontend components
7. Test end-to-end flow
