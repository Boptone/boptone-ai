CREATE INDEX `created_at_idx` ON `orders` (`createdAt`);--> statement-breakpoint
CREATE INDEX `customer_created_at_idx` ON `orders` (`customerId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `products` (`createdAt`);--> statement-breakpoint
CREATE INDEX `featured_idx` ON `products` (`featured`);--> statement-breakpoint
CREATE INDEX `status_created_at_idx` ON `products` (`status`,`createdAt`);