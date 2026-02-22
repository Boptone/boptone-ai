CREATE TABLE `cart_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(255) NOT NULL,
	`eventType` enum('cart_viewed','item_added','item_removed','checkout_started','checkout_abandoned','checkout_completed') NOT NULL,
	`productId` int,
	`variantId` int,
	`quantity` int,
	`cartSnapshot` json,
	`userAgent` text,
	`ipAddress` varchar(45),
	`referrer` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cart_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailType` enum('order_confirmation','abandoned_cart','shipping_in_transit','shipping_out_for_delivery','shipping_delivered','review_request') NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`recipientName` varchar(255),
	`subject` varchar(500) NOT NULL,
	`status` enum('queued','sent','failed') NOT NULL,
	`messageId` varchar(255),
	`errorMessage` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`metadata` json,
	`queuedAt` timestamp,
	`sentAt` timestamp,
	`failedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobType` enum('send_order_confirmation','send_abandoned_cart','send_shipping_update','send_review_request') NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`payload` json NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`maxAttempts` int NOT NULL DEFAULT 3,
	`lastAttemptAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `scheduled_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `cart_events` ADD CONSTRAINT `cart_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_events` ADD CONSTRAINT `cart_events_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_events` ADD CONSTRAINT `cart_events_variantId_product_variants_id_fk` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `cart_events` (`userId`);--> statement-breakpoint
CREATE INDEX `session_id_idx` ON `cart_events` (`sessionId`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `cart_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `cart_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `email_type_idx` ON `email_logs` (`emailType`);--> statement-breakpoint
CREATE INDEX `recipient_email_idx` ON `email_logs` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `email_logs` (`status`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `email_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `job_type_idx` ON `scheduled_jobs` (`jobType`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `scheduled_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `scheduled_for_idx` ON `scheduled_jobs` (`scheduledFor`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `scheduled_jobs` (`createdAt`);