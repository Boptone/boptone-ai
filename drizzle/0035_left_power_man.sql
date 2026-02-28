CREATE TABLE `user_deletion_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reason` varchar(64) NOT NULL DEFAULT 'user_request',
	`reasonDetail` varchar(500),
	`scheduledAt` timestamp NOT NULL,
	`status` enum('pending','processing','completed','cancelled','failed') NOT NULL DEFAULT 'pending',
	`jobId` varchar(128),
	`deletionSummary` text,
	`errorMessage` text,
	`cancelledAt` timestamp,
	`completedAt` timestamp,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_deletion_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_deletion_requests` ADD CONSTRAINT `user_deletion_requests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `udr_user_idx` ON `user_deletion_requests` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `udr_scheduled_idx` ON `user_deletion_requests` (`scheduledAt`,`status`);