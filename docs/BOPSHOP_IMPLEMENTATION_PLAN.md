# BopShop Implementation Plan (Final)
**Shipping Strategy + POD Integration + DIY Options**

---

## 🎯 Confirmed Strategy

### **Shipping (Shippo Integration)**
✅ **Customer pays shipping at checkout** (Shippo real-time rates)  
✅ **Artists can opt-in to DIY shipping** (handle their own fulfillment)  
❌ **Boptone does NOT subsidize shipping**  
🛡️ **Boptone is indemnified from DIY shipping** (artist assumes liability)

### **Print-on-Demand (POD)**
✅ **Integrate Printful first** (premium quality, reliable)  
✅ **Artists can opt-in to DIY manufacturing** (self-fulfill orders)  
❌ **No in-house Boptone POD** (too capital-intensive)  
❌ **No multi-POD provider choice at launch** (keep it simple)  
🛡️ **Boptone is indemnified from DIY manufacturing** (artist assumes liability)

---

## 💰 Final Cost Model

### **Default Flow: Printful POD + Shippo Shipping**

**Example: Artist sells $25 t-shirt**

| Cost Component | Amount | Who Pays |
|----------------|--------|----------|
| Printful base cost | $9.95 | Artist |
| Boptone subscription | $0-$49/mo | Artist |
| Credit card processing | $1.03 (2.9% + $0.30) | Artist |
| Shipping (Shippo) | $4.50 | Customer (at checkout) |
| Platform fee | $0 | N/A |
| **Artist nets** | **$13.97 per sale (55.9%)** | Artist |

**Artist profit:** $13.97 per shirt (after Printful cost)

---

### **DIY Flow: Artist Self-Fulfills**

**Example: Artist bulk-orders 100 t-shirts at $5 each, sells for $25**

| Cost Component | Amount | Who Pays |
|----------------|--------|----------|
| Bulk t-shirt cost | $5.00 | Artist (upfront) |
| Boptone subscription | $0-$49/mo | Artist |
| Credit card processing | $1.03 (2.9% + $0.30) | Artist |
| Shipping (artist's choice) | $4.50 | Customer or Artist |
| Platform fee | $0 | N/A |
| **Artist nets** | **$18.97 per sale (75.9%)** | Artist |

**Artist profit:** $18.97 - $5.00 (COGS) = **$13.97 per shirt (55.9% margin)**

**Note:** DIY gives artists higher margins but requires upfront capital + inventory management.

---

## 🛡️ Liability & Indemnification

### **Boptone-Managed Flow (Printful + Shippo)**
- ✅ Boptone liable for product quality (Printful's responsibility)
- ✅ Boptone liable for shipping delays (Shippo's responsibility)
- ✅ Boptone provides customer support
- ✅ Boptone handles refunds/returns

### **DIY Flow (Artist Self-Fulfills)**
- ❌ Boptone NOT liable for product quality
- ❌ Boptone NOT liable for shipping delays
- ❌ Boptone NOT liable for lost/damaged packages
- ❌ Boptone NOT liable for refunds/returns
- ✅ Artist assumes ALL liability
- ✅ Artist provides own customer support

**Legal requirement:** Artists must agree to Terms of Service waiving Boptone liability for DIY orders.

---

## 📋 Implementation Roadmap

### **Phase 1: Printful + Shippo Integration (MVP)**
**Timeline: 4-6 weeks**

#### **Week 1-2: Printful Integration**
- [ ] Set up Printful API credentials
- [ ] Build product sync (import Printful catalog to BopShop)
- [ ] Build order forwarding (auto-send orders to Printful)
- [ ] Build fulfillment tracking (sync Printful status to Boptone)
- [ ] Add Printful cost calculator to product creation flow
- [ ] Test end-to-end order flow (order → Printful → ship → track)

#### **Week 3-4: Shippo Integration**
- [ ] Set up Shippo API credentials
- [ ] Build real-time shipping rate calculator
- [ ] Add shipping options to checkout (USPS, UPS, FedEx)
- [ ] Auto-generate shipping labels on order confirmation
- [ ] Add tracking number to customer emails
- [ ] Build shipping label download for artists (if needed)

#### **Week 5-6: Testing & Launch**
- [ ] End-to-end testing (order → payment → Printful → ship → deliver)
- [ ] Load testing (100 concurrent orders)
- [ ] Customer support training (refunds, returns, quality issues)
- [ ] Launch to beta artists (10-20 artists)
- [ ] Collect feedback and iterate

---

### **Phase 2: DIY Options (Post-MVP)**
**Timeline: 2-3 weeks after Phase 1**

#### **DIY Manufacturing**
- [ ] Add "Self-Fulfill Orders" toggle in artist settings
- [ ] Build order notification system (email/SMS when order placed)
- [ ] Build manual fulfillment workflow (artist marks order as shipped)
- [ ] Add shipping label upload (if artist uses own carrier)
- [ ] Add Terms of Service agreement (artist assumes liability)
- [ ] Build customer support handoff (DIY orders go to artist, not Boptone)

#### **DIY Shipping**
- [ ] Add "Manage My Own Shipping" toggle in artist settings
- [ ] Let artist set flat-rate shipping or free shipping
- [ ] Disable Shippo for DIY shipping artists
- [ ] Add Terms of Service agreement (artist assumes liability)
- [ ] Build shipping cost calculator for artists (estimate profitability)

---

## 🔧 Technical Implementation Details

### **Printful API Integration**

**Key Endpoints:**
- `GET /products` - Fetch Printful product catalog
- `POST /orders` - Create new order
- `GET /orders/{id}` - Get order status
- `GET /orders/{id}/shipments` - Get tracking info

**Order Flow:**
1. Customer places order on BopShop
2. Boptone charges customer via Stripe
3. Boptone forwards order to Printful via API
4. Printful manufactures + ships product
5. Printful sends tracking number to Boptone
6. Boptone emails tracking number to customer
7. Boptone pays Printful (base cost + shipping)

**Cost Calculation:**
```typescript
const printfulCost = product.baseCost; // e.g., $9.95 for t-shirt
const shippingCost = shippo.getRealTimeRate(); // e.g., $4.50
const processingFee = (retailPrice * 0.029) + 0.30; // 2.9% + $0.30
const artistNets = retailPrice - printfulCost - processingFee;
```

---

### **Shippo API Integration**

**Key Endpoints:**
- `POST /shipments` - Create shipment + get rates
- `POST /transactions` - Purchase shipping label
- `GET /tracks/{carrier}/{tracking_number}` - Get tracking status

**Checkout Flow:**
1. Customer adds product to cart
2. Customer enters shipping address
3. Boptone calls Shippo API to get real-time rates
4. Customer selects shipping option (USPS $4.50, UPS $7.50, etc.)
5. Shipping cost added to order total
6. Customer pays (product + shipping + tax)
7. Boptone purchases shipping label via Shippo
8. Printful uses Shippo label to ship product

**Shipping Rate Calculation:**
```typescript
const shipment = await shippo.shipments.create({
  address_from: printfulWarehouse,
  address_to: customerAddress,
  parcels: [{
    length: "10",
    width: "8",
    height: "2",
    distance_unit: "in",
    weight: "8",
    mass_unit: "oz"
  }]
});

const rates = shipment.rates; // Array of carrier options
const cheapestRate = rates.sort((a, b) => a.amount - b.amount)[0];
```

---

### **DIY Fulfillment Workflow**

**Artist Settings:**
```typescript
{
  fulfillmentMode: "printful" | "diy",
  shippingMode: "shippo" | "diy",
  diyShippingRate: 500, // $5.00 flat rate (in cents)
  acceptedLiability: true, // Must agree to ToS
  acceptedLiabilityDate: "2026-02-25T00:00:00Z"
}
```

**Order Notification (DIY):**
```
Subject: New Order #12345 - Action Required

Hi {artistName},

You have a new order that requires fulfillment:

Order #12345
Customer: John Doe
Address: 123 Main St, Los Angeles, CA 90001
Product: Black T-Shirt (Size L)
Quantity: 1
Customer Paid: $25.00 (including $5.00 shipping)

Action Required:
1. Manufacture/package the product
2. Ship to customer using your preferred carrier
3. Mark order as "Shipped" in your dashboard
4. Add tracking number (optional)

You are responsible for product quality, shipping, and customer support for this order.

View Order: https://boptone.com/dashboard/orders/12345
```

---

## 📊 Database Schema Updates

### **New Tables**

```sql
-- Product fulfillment settings
CREATE TABLE product_fulfillment_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  fulfillment_mode ENUM('printful', 'diy') DEFAULT 'printful',
  printful_product_id VARCHAR(255), -- Printful catalog ID
  printful_variant_id VARCHAR(255), -- Printful variant ID
  diy_instructions TEXT, -- Artist's fulfillment notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Shipping settings
CREATE TABLE artist_shipping_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  artist_id INT NOT NULL,
  shipping_mode ENUM('shippo', 'diy') DEFAULT 'shippo',
  diy_shipping_type ENUM('flat_rate', 'free', 'calculated') DEFAULT 'flat_rate',
  diy_flat_rate INT, -- In cents
  accepted_liability BOOLEAN DEFAULT FALSE,
  accepted_liability_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artist_profiles(id)
);

-- Printful orders
CREATE TABLE printful_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  printful_order_id VARCHAR(255) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'failed') DEFAULT 'pending',
  tracking_number VARCHAR(255),
  tracking_url VARCHAR(500),
  estimated_delivery_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Shippo shipments
CREATE TABLE shippo_shipments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  shippo_shipment_id VARCHAR(255) NOT NULL,
  shippo_transaction_id VARCHAR(255), -- After label purchase
  carrier VARCHAR(50), -- USPS, UPS, FedEx
  service_level VARCHAR(100), -- Priority Mail, Ground, etc.
  tracking_number VARCHAR(255),
  tracking_url VARCHAR(500),
  label_url VARCHAR(500),
  cost INT NOT NULL, -- In cents
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## 🎯 Success Metrics

### **Phase 1 (Printful + Shippo)**
- [ ] 100% order success rate (order → Printful → ship → deliver)
- [ ] < 5% customer support tickets per order
- [ ] < 2% refund rate
- [ ] Average delivery time: 7-10 days (Printful standard)
- [ ] 10-20 beta artists onboarded
- [ ] $10k-$50k in monthly BopShop sales

### **Phase 2 (DIY Options)**
- [ ] 20% of artists opt-in to DIY fulfillment
- [ ] 0 liability claims against Boptone for DIY orders
- [ ] < 10% customer support tickets for DIY orders (artist handles)
- [ ] DIY artists report 20-30% higher margins vs. Printful

---

## 💡 Marketing Messaging

### **For Printful Users**
**"Sell merch with zero upfront costs. We handle printing, shipping, and customer support."**

**The pitch:**
- No inventory risk
- No manufacturing equipment
- No shipping logistics
- Just upload designs, set prices, and sell

### **For DIY Artists**
**"Already have inventory? Sell on BopShop and keep 75% margins."**

**The pitch:**
- Use your existing merch
- Higher profit margins (75% vs. 56%)
- You control quality
- You handle fulfillment

---

## ✅ Final Checklist

### **Legal & Compliance**
- [ ] Draft Terms of Service for DIY fulfillment
- [ ] Add liability waiver to artist settings
- [ ] Add "Fulfilled by Artist" badge on DIY products
- [ ] Add customer support handoff for DIY orders

### **Customer Experience**
- [ ] Add estimated delivery date to checkout
- [ ] Add tracking number to order confirmation email
- [ ] Add "Where's my order?" self-service page
- [ ] Add refund/return policy page

### **Artist Dashboard**
- [ ] Add "Fulfillment Mode" toggle (Printful vs. DIY)
- [ ] Add "Shipping Mode" toggle (Shippo vs. DIY)
- [ ] Add Printful cost calculator
- [ ] Add profit margin calculator
- [ ] Add order notification settings (email/SMS)

---

**Document Version:** 1.0 (Final)  
**Last Updated:** February 25, 2026  
**Author:** Boptone Product Team  
**Status:** Ready for Implementation
