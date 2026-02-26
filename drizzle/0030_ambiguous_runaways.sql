CREATE INDEX `is_read_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_read_idx` ON `notifications` (`userId`,`isRead`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `order_items` (`productId`);--> statement-breakpoint
CREATE INDEX `variant_id_idx` ON `order_items` (`variantId`);--> statement-breakpoint
CREATE INDEX `fulfillment_status_idx` ON `order_items` (`fulfillmentStatus`);