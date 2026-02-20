ALTER TABLE `bap_tracks` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `cart_items` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `products` ADD `deletedAt` timestamp;--> statement-breakpoint
CREATE INDEX `deleted_at_idx` ON `bap_tracks` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `deleted_at_idx` ON `cart_items` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `deleted_at_idx` ON `orders` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `deleted_at_idx` ON `products` (`deletedAt`);