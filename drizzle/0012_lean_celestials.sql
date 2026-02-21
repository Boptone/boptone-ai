CREATE TABLE `review_reminder_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`emailStatus` enum('sent','failed','bounced') NOT NULL DEFAULT 'sent',
	CONSTRAINT `review_reminder_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `review_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `review_reminder_log` ADD CONSTRAINT `review_reminder_log_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_reminder_log` ADD CONSTRAINT `review_reminder_log_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_reminder_log` ADD CONSTRAINT `review_reminder_log_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_responses` ADD CONSTRAINT `review_responses_reviewId_product_reviews_id_fk` FOREIGN KEY (`reviewId`) REFERENCES `product_reviews`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_responses` ADD CONSTRAINT `review_responses_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `order_id_idx` ON `review_reminder_log` (`orderId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `review_reminder_log` (`userId`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `review_reminder_log` (`productId`);--> statement-breakpoint
CREATE INDEX `review_id_idx` ON `review_responses` (`reviewId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `review_responses` (`userId`);