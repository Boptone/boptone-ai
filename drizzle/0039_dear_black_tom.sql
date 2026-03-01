CREATE TABLE `product_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`note` varchar(280),
	`source` enum('quick_rate','post_purchase','review_flow') NOT NULL DEFAULT 'quick_rate',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_ratings_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_user_product_rating` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
ALTER TABLE `product_ratings` ADD CONSTRAINT `product_ratings_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_ratings` ADD CONSTRAINT `product_ratings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `pr_product_id_idx` ON `product_ratings` (`productId`);--> statement-breakpoint
CREATE INDEX `pr_user_id_idx` ON `product_ratings` (`userId`);--> statement-breakpoint
CREATE INDEX `pr_rating_idx` ON `product_ratings` (`rating`);