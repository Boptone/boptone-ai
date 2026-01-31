-- Manual POD Integration Tables Migration
-- Created: 2026-01-31
-- Purpose: Add Print-on-Demand integration tables to Boptone database

-- POD Providers table
CREATE TABLE IF NOT EXISTS `pod_providers` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(50) NOT NULL UNIQUE,
  `displayName` varchar(100) NOT NULL,
  `apiBaseUrl` varchar(255) NOT NULL,
  `webhookSecret` varchar(255),
  `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  `metadata` json,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Artist POD Account Connections table
CREATE TABLE IF NOT EXISTS `artist_pod_accounts` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `artistId` int NOT NULL,
  `providerId` int NOT NULL,
  `apiToken` text NOT NULL,
  `refreshToken` text,
  `tokenExpiresAt` timestamp,
  `providerStoreId` varchar(100),
  `providerAccountId` varchar(100),
  `status` enum('active', 'disconnected', 'expired', 'error') NOT NULL DEFAULT 'active',
  `lastSyncedAt` timestamp,
  `metadata` json,
  `connectedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disconnectedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`),
  FOREIGN KEY (`providerId`) REFERENCES `pod_providers`(`id`),
  INDEX `artist_provider_idx` (`artistId`, `providerId`)
);

-- POD Product Mappings table
CREATE TABLE IF NOT EXISTS `pod_product_mappings` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `productId` int NOT NULL,
  `providerId` int NOT NULL,
  `artistPodAccountId` int NOT NULL,
  `providerProductId` varchar(100) NOT NULL,
  `providerVariantId` varchar(100) NOT NULL,
  `providerSku` varchar(100),
  `wholesaleCost` int NOT NULL,
  `shippingCost` int NOT NULL DEFAULT 0,
  `designFileUrl` varchar(500),
  `designPlacement` varchar(50),
  `mockupUrls` json,
  `syncEnabled` boolean NOT NULL DEFAULT true,
  `autoFulfill` boolean NOT NULL DEFAULT true,
  `providerMetadata` json,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`),
  FOREIGN KEY (`providerId`) REFERENCES `pod_providers`(`id`),
  FOREIGN KEY (`artistPodAccountId`) REFERENCES `artist_pod_accounts`(`id`),
  INDEX `product_id_idx` (`productId`),
  INDEX `provider_product_idx` (`providerId`, `providerProductId`)
);

-- POD Order Fulfillments table
CREATE TABLE IF NOT EXISTS `pod_order_fulfillments` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `orderId` int NOT NULL,
  `orderItemId` int NOT NULL,
  `providerId` int NOT NULL,
  `artistPodAccountId` int NOT NULL,
  `providerOrderId` varchar(100) NOT NULL,
  `providerOrderNumber` varchar(100),
  `status` enum('pending', 'submitted', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled', 'failed') NOT NULL DEFAULT 'pending',
  `trackingNumber` varchar(100),
  `trackingUrl` varchar(500),
  `carrier` varchar(50),
  `providerCost` int NOT NULL,
  `shippingCost` int NOT NULL DEFAULT 0,
  `taxAmount` int NOT NULL DEFAULT 0,
  `totalCost` int NOT NULL,
  `submittedAt` timestamp,
  `confirmedAt` timestamp,
  `printingStartedAt` timestamp,
  `shippedAt` timestamp,
  `deliveredAt` timestamp,
  `cancelledAt` timestamp,
  `errorMessage` text,
  `retryCount` int NOT NULL DEFAULT 0,
  `lastRetryAt` timestamp,
  `providerResponse` json,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`),
  FOREIGN KEY (`orderItemId`) REFERENCES `order_items`(`id`),
  FOREIGN KEY (`providerId`) REFERENCES `pod_providers`(`id`),
  FOREIGN KEY (`artistPodAccountId`) REFERENCES `artist_pod_accounts`(`id`),
  INDEX `order_id_idx` (`orderId`),
  INDEX `provider_order_idx` (`providerId`, `providerOrderId`),
  INDEX `status_idx` (`status`)
);

-- POD Webhook Events table
CREATE TABLE IF NOT EXISTS `pod_webhook_events` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `providerId` int NOT NULL,
  `eventType` varchar(100) NOT NULL,
  `providerOrderId` varchar(100),
  `payload` json NOT NULL,
  `processed` boolean NOT NULL DEFAULT false,
  `processedAt` timestamp,
  `processingError` text,
  `requestId` varchar(100),
  `signature` varchar(255),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`providerId`) REFERENCES `pod_providers`(`id`),
  INDEX `event_type_idx` (`eventType`),
  INDEX `provider_order_idx` (`providerOrderId`),
  INDEX `processed_idx` (`processed`)
);

-- Insert default POD providers
INSERT INTO `pod_providers` (`name`, `displayName`, `apiBaseUrl`, `status`, `metadata`) VALUES
('printful', 'Printful', 'https://api.printful.com', 'active', '{"description": "Printful print-on-demand fulfillment"}'),
('printify', 'Printify', 'https://api.printify.com/v1', 'active', '{"description": "Printify print-on-demand fulfillment"}')
ON DUPLICATE KEY UPDATE `updatedAt` = CURRENT_TIMESTAMP;
