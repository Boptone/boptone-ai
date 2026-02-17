CREATE TABLE `toney_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `toney_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `toney_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `toney_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `toney_conversations` ADD CONSTRAINT `toney_conversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `toney_messages` ADD CONSTRAINT `toney_messages_conversationId_toney_conversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `toney_conversations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `toney_conversations` (`userId`);--> statement-breakpoint
CREATE INDEX `conversation_id_idx` ON `toney_messages` (`conversationId`);