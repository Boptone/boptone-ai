CREATE TABLE `ai_context` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contextData` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastEnriched` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_context_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_context_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `ai_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`eventData` json NOT NULL,
	`processed` boolean NOT NULL DEFAULT false,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ai_context` ADD CONSTRAINT `ai_context_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_events` ADD CONSTRAINT `ai_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `ai_context` (`userId`);--> statement-breakpoint
CREATE INDEX `last_enriched_idx` ON `ai_context` (`lastEnriched`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `ai_events` (`userId`);--> statement-breakpoint
CREATE INDEX `processed_idx` ON `ai_events` (`processed`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `ai_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_processed_idx` ON `ai_events` (`userId`,`processed`);