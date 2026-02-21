CREATE TABLE `shipping_labels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`shipmentId` varchar(255) NOT NULL,
	`rateId` varchar(255) NOT NULL,
	`transactionId` varchar(255),
	`carrier` varchar(100),
	`service` varchar(100),
	`trackingNumber` varchar(255),
	`trackingUrl` text,
	`labelUrl` text,
	`cost` decimal(10,2),
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('pending','purchased','printed','shipped','delivered','failed') NOT NULL DEFAULT 'pending',
	`addressFrom` json,
	`addressTo` json,
	`parcel` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipping_labels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracking_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shippingLabelId` int NOT NULL,
	`status` varchar(50),
	`statusDetails` text,
	`location` json,
	`eventDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tracking_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `shipping_labels` ADD CONSTRAINT `shipping_labels_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tracking_events` ADD CONSTRAINT `tracking_events_shippingLabelId_shipping_labels_id_fk` FOREIGN KEY (`shippingLabelId`) REFERENCES `shipping_labels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `order_id_idx` ON `shipping_labels` (`orderId`);--> statement-breakpoint
CREATE INDEX `tracking_number_idx` ON `shipping_labels` (`trackingNumber`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `shipping_labels` (`status`);--> statement-breakpoint
CREATE INDEX `shipping_label_id_idx` ON `tracking_events` (`shippingLabelId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tracking_events` (`status`);