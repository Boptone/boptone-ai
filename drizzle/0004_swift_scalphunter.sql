DROP TABLE `toney_conversations`;--> statement-breakpoint
DROP TABLE `toney_messages`;--> statement-breakpoint
ALTER TABLE `ai_conversations` MODIFY COLUMN `artistId` int;--> statement-breakpoint
ALTER TABLE `ai_conversations` MODIFY COLUMN `context` enum('career_advice','release_strategy','content_ideas','financial_planning','tour_planning','general','search') NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD `conversationType` enum('public','toney') DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD `title` varchar(255);--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `ai_conversations` (`userId`);--> statement-breakpoint
CREATE INDEX `conversation_type_idx` ON `ai_conversations` (`conversationType`);