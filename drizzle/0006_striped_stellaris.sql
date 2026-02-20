CREATE INDEX `user_product_idx` ON `cart_items` (`userId`,`productId`);--> statement-breakpoint
CREATE INDEX `artist_payment_status_idx` ON `orders` (`artistId`,`paymentStatus`);--> statement-breakpoint
CREATE INDEX `artist_status_idx` ON `products` (`artistId`,`status`);--> statement-breakpoint
CREATE INDEX `artist_source_idx` ON `revenue_records` (`artistId`,`source`);--> statement-breakpoint
CREATE INDEX `artist_platform_date_idx` ON `streaming_metrics` (`artistId`,`platform`,`date`);