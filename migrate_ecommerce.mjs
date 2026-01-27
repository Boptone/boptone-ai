import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('Dropping old e-commerce tables...');
await connection.query('SET FOREIGN_KEY_CHECKS=0');
await connection.query('DROP TABLE IF EXISTS `product_reviews`');
await connection.query('DROP TABLE IF EXISTS `discount_codes`');
await connection.query('DROP TABLE IF EXISTS `shipping_rates`');
await connection.query('DROP TABLE IF EXISTS `order_items`');
await connection.query('DROP TABLE IF EXISTS `orders`');
await connection.query('DROP TABLE IF EXISTS `cart_items`');
await connection.query('DROP TABLE IF EXISTS `product_variants`');
await connection.query('DROP TABLE IF EXISTS `products`');
await connection.query('SET FOREIGN_KEY_CHECKS=1');

console.log('Creating new e-commerce tables...');

// Products
await connection.query(`
CREATE TABLE products (
  id int AUTO_INCREMENT PRIMARY KEY,
  artistId int NOT NULL,
  type enum('physical', 'digital', 'experience') NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  price int NOT NULL,
  compareAtPrice int,
  currency varchar(3) NOT NULL DEFAULT 'USD',
  sku varchar(100),
  inventoryQuantity int NOT NULL DEFAULT 0,
  trackInventory boolean NOT NULL DEFAULT true,
  allowBackorder boolean NOT NULL DEFAULT false,
  digitalFileUrl varchar(500),
  digitalFileSize int,
  downloadLimit int,
  eventDate timestamp NULL,
  eventLocation varchar(255),
  maxAttendees int,
  images json,
  primaryImageUrl varchar(500),
  slug varchar(255) NOT NULL UNIQUE,
  tags json,
  category varchar(100),
  requiresShipping boolean NOT NULL DEFAULT false,
  weight decimal(8,2),
  weightUnit varchar(10) DEFAULT 'lb',
  status enum('draft', 'active', 'archived') NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artistId) REFERENCES artist_profiles(id),
  INDEX artist_id_idx (artistId),
  INDEX status_idx (status),
  INDEX type_idx (type),
  INDEX slug_idx (slug)
)`);

// Product Variants
await connection.query(`
CREATE TABLE product_variants (
  id int AUTO_INCREMENT PRIMARY KEY,
  productId int NOT NULL,
  name varchar(255) NOT NULL,
  sku varchar(100),
  price int,
  compareAtPrice int,
  option1 varchar(100),
  option2 varchar(100),
  option3 varchar(100),
  inventoryQuantity int NOT NULL DEFAULT 0,
  imageUrl varchar(500),
  available boolean NOT NULL DEFAULT true,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id),
  INDEX product_id_idx (productId)
)`);

// Cart Items
await connection.query(`
CREATE TABLE cart_items (
  id int AUTO_INCREMENT PRIMARY KEY,
  userId int NOT NULL,
  productId int NOT NULL,
  variantId int,
  quantity int NOT NULL DEFAULT 1,
  priceAtAdd int NOT NULL,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (variantId) REFERENCES product_variants(id),
  INDEX user_id_idx (userId)
)`);

// Orders
await connection.query(`
CREATE TABLE orders (
  id int AUTO_INCREMENT PRIMARY KEY,
  orderNumber varchar(50) NOT NULL UNIQUE,
  customerId int NOT NULL,
  artistId int NOT NULL,
  subtotal int NOT NULL,
  taxAmount int NOT NULL DEFAULT 0,
  shippingAmount int NOT NULL DEFAULT 0,
  discountAmount int NOT NULL DEFAULT 0,
  total int NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'USD',
  paymentStatus enum('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
  paymentMethod varchar(50),
  paymentIntentId varchar(255),
  paidAt timestamp NULL,
  fulfillmentStatus enum('unfulfilled', 'partial', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'unfulfilled',
  shippingMethod varchar(100),
  trackingNumber varchar(255),
  trackingUrl varchar(500),
  shippedAt timestamp NULL,
  deliveredAt timestamp NULL,
  shippingAddress json,
  billingAddress json,
  customerEmail varchar(320) NOT NULL,
  customerPhone varchar(50),
  customerNote text,
  internalNote text,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cancelledAt timestamp NULL,
  cancellationReason text,
  FOREIGN KEY (customerId) REFERENCES users(id),
  FOREIGN KEY (artistId) REFERENCES artist_profiles(id),
  INDEX customer_id_idx (customerId),
  INDEX artist_id_idx (artistId),
  INDEX order_number_idx (orderNumber),
  INDEX payment_status_idx (paymentStatus),
  INDEX fulfillment_status_idx (fulfillmentStatus)
)`);

// Order Items
await connection.query(`
CREATE TABLE order_items (
  id int AUTO_INCREMENT PRIMARY KEY,
  orderId int NOT NULL,
  productId int NOT NULL,
  variantId int,
  productName varchar(255) NOT NULL,
  variantName varchar(255),
  productType enum('physical', 'digital', 'experience') NOT NULL,
  sku varchar(100),
  quantity int NOT NULL,
  pricePerUnit int NOT NULL,
  subtotal int NOT NULL,
  taxAmount int NOT NULL DEFAULT 0,
  total int NOT NULL,
  digitalFileUrl varchar(500),
  downloadCount int NOT NULL DEFAULT 0,
  downloadLimit int,
  fulfillmentStatus enum('unfulfilled', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'unfulfilled',
  fulfilledAt timestamp NULL,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (variantId) REFERENCES product_variants(id),
  INDEX order_id_idx (orderId)
)`);

// Shipping Rates
await connection.query(`
CREATE TABLE shipping_rates (
  id int AUTO_INCREMENT PRIMARY KEY,
  artistId int NOT NULL,
  name varchar(100) NOT NULL,
  description text,
  price int NOT NULL,
  freeShippingThreshold int,
  minOrderAmount int,
  maxOrderAmount int,
  countries json,
  minDeliveryDays int,
  maxDeliveryDays int,
  active boolean NOT NULL DEFAULT true,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artistId) REFERENCES artist_profiles(id),
  INDEX artist_id_idx (artistId)
)`);

// Discount Codes
await connection.query(`
CREATE TABLE discount_codes (
  id int AUTO_INCREMENT PRIMARY KEY,
  artistId int NOT NULL,
  code varchar(50) NOT NULL UNIQUE,
  type enum('percentage', 'fixed_amount', 'free_shipping') NOT NULL,
  value int NOT NULL,
  minPurchaseAmount int,
  maxUses int,
  maxUsesPerCustomer int NOT NULL DEFAULT 1,
  usageCount int NOT NULL DEFAULT 0,
  startsAt timestamp NULL,
  expiresAt timestamp NULL,
  active boolean NOT NULL DEFAULT true,
  appliesToAllProducts boolean NOT NULL DEFAULT true,
  productIds json,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artistId) REFERENCES artist_profiles(id),
  INDEX artist_id_idx (artistId),
  INDEX code_idx (code)
)`);

// Product Reviews
await connection.query(`
CREATE TABLE product_reviews (
  id int AUTO_INCREMENT PRIMARY KEY,
  productId int NOT NULL,
  userId int NOT NULL,
  orderId int,
  rating int NOT NULL,
  title varchar(255),
  content text,
  status enum('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  helpfulCount int NOT NULL DEFAULT 0,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (orderId) REFERENCES orders(id),
  INDEX product_id_idx (productId),
  INDEX user_id_idx (userId)
)`);

console.log('✓ E-commerce tables created successfully!');
await connection.end();
