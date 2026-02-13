CREATE TABLE `bap_stream_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`userId` int,
	`amount` int NOT NULL,
	`artistShare` int NOT NULL,
	`platformShare` int NOT NULL,
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`stripeCustomerId` varchar(255),
	`status` enum('pending','succeeded','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`currency` varchar(3) NOT NULL DEFAULT 'usd',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bap_stream_payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `bap_stream_payments_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `paid_stream_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`paymentId` int NOT NULL,
	`sessionToken` varchar(255) NOT NULL,
	`userId` int,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paid_stream_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `paid_stream_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
ALTER TABLE `bap_stream_payments` ADD CONSTRAINT `bap_stream_payments_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_stream_payments` ADD CONSTRAINT `bap_stream_payments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paid_stream_sessions` ADD CONSTRAINT `paid_stream_sessions_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paid_stream_sessions` ADD CONSTRAINT `paid_stream_sessions_paymentId_bap_stream_payments_id_fk` FOREIGN KEY (`paymentId`) REFERENCES `bap_stream_payments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paid_stream_sessions` ADD CONSTRAINT `paid_stream_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `bap_stream_payments` (`trackId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `bap_stream_payments` (`userId`);--> statement-breakpoint
CREATE INDEX `stripe_payment_intent_idx` ON `bap_stream_payments` (`stripePaymentIntentId`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `paid_stream_sessions` (`trackId`);--> statement-breakpoint
CREATE INDEX `session_token_idx` ON `paid_stream_sessions` (`sessionToken`);--> statement-breakpoint
CREATE INDEX `expires_at_idx` ON `paid_stream_sessions` (`expiresAt`);