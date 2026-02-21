CREATE TABLE `ai_detection_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`isAiGenerated` boolean,
	`confidenceScore` decimal(5,2),
	`detectedEngine` varchar(100),
	`musicIsAi` boolean,
	`musicConfidence` decimal(5,2),
	`vocalsAreAi` boolean,
	`vocalsConfidence` decimal(5,2),
	`apiProvider` varchar(50) NOT NULL DEFAULT 'hive',
	`rawResponse` json,
	`analyzedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_detection_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_strike_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`strikeNumber` int NOT NULL,
	`reason` text NOT NULL,
	`trackId` int,
	`moderationQueueId` int,
	`penalty` enum('warning','suspension','permanent_ban') NOT NULL,
	`suspensionEndsAt` timestamp,
	`issuedBy` int NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`appealStatus` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
	`appealReason` text,
	`appealedAt` timestamp,
	`appealReviewedBy` int,
	`appealReviewedAt` timestamp,
	`appealNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_strike_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_moderation_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`artistId` int NOT NULL,
	`flagReason` enum('ai_detection_high_confidence','ai_detection_medium_confidence','prohibited_tool_disclosed','manual_report','copyright_claim','other') NOT NULL,
	`flagDetails` text,
	`aiDetectionId` int,
	`status` enum('pending','under_review','approved','removed','appealed','appeal_approved','appeal_rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewNotes` text,
	`reviewedAt` timestamp,
	`strikeIssued` boolean NOT NULL DEFAULT false,
	`strikeNumber` int,
	`flaggedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_moderation_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ai_detection_results` ADD CONSTRAINT `ai_detection_results_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_strike_history` ADD CONSTRAINT `artist_strike_history_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_strike_history` ADD CONSTRAINT `artist_strike_history_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_strike_history` ADD CONSTRAINT `artist_strike_history_moderationQueueId_content_moderation_queue_id_fk` FOREIGN KEY (`moderationQueueId`) REFERENCES `content_moderation_queue`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_strike_history` ADD CONSTRAINT `artist_strike_history_issuedBy_users_id_fk` FOREIGN KEY (`issuedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_strike_history` ADD CONSTRAINT `artist_strike_history_appealReviewedBy_users_id_fk` FOREIGN KEY (`appealReviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_moderation_queue` ADD CONSTRAINT `content_moderation_queue_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_moderation_queue` ADD CONSTRAINT `content_moderation_queue_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_moderation_queue` ADD CONSTRAINT `content_moderation_queue_aiDetectionId_ai_detection_results_id_fk` FOREIGN KEY (`aiDetectionId`) REFERENCES `ai_detection_results`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_moderation_queue` ADD CONSTRAINT `content_moderation_queue_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `ai_detection_results` (`trackId`);--> statement-breakpoint
CREATE INDEX `is_ai_generated_idx` ON `ai_detection_results` (`isAiGenerated`);--> statement-breakpoint
CREATE INDEX `analyzed_at_idx` ON `ai_detection_results` (`analyzedAt`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `artist_strike_history` (`artistId`);--> statement-breakpoint
CREATE INDEX `strike_number_idx` ON `artist_strike_history` (`strikeNumber`);--> statement-breakpoint
CREATE INDEX `issued_at_idx` ON `artist_strike_history` (`issuedAt`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `content_moderation_queue` (`trackId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `content_moderation_queue` (`artistId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `content_moderation_queue` (`status`);--> statement-breakpoint
CREATE INDEX `flagged_at_idx` ON `content_moderation_queue` (`flaggedAt`);