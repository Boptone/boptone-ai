CREATE TABLE `dmca_notices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int,
	`artistId` int NOT NULL,
	`complainantName` varchar(255) NOT NULL,
	`complainantEmail` varchar(320) NOT NULL,
	`complainantCompany` varchar(255),
	`complainantAddress` text,
	`infringementDescription` text NOT NULL,
	`copyrightedWorkDescription` text NOT NULL,
	`evidenceUrl` varchar(500),
	`noticeDate` timestamp NOT NULL DEFAULT (now()),
	`digitalSignature` text,
	`status` enum('pending','takedown','counter_notice','resolved','rejected') NOT NULL DEFAULT 'pending',
	`actionTaken` text,
	`actionDate` timestamp,
	`actionBy` int,
	`counterNoticeSubmitted` boolean NOT NULL DEFAULT false,
	`counterNoticeReason` text,
	`counterNoticeDate` timestamp,
	`counterNoticeSignature` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dmca_notices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ip_screening_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`artistId` int NOT NULL,
	`designUrl` varchar(500) NOT NULL,
	`screeningStatus` enum('pending','approved','rejected','flagged') NOT NULL DEFAULT 'pending',
	`aiConfidenceScore` decimal(5,2),
	`detectedLogos` json,
	`detectedCelebrities` json,
	`detectedText` json,
	`perceptualHashSimilarity` decimal(5,2),
	`matchedCopyrightedImages` json,
	`flaggedReason` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ip_screening_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ip_strikes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`productId` int,
	`strikeNumber` int NOT NULL,
	`strikeReason` text NOT NULL,
	`strikeDate` timestamp NOT NULL DEFAULT (now()),
	`designUrl` varchar(500),
	`evidenceUrl` varchar(500),
	`resolved` boolean NOT NULL DEFAULT false,
	`resolvedBy` int,
	`resolvedAt` timestamp,
	`resolutionNotes` text,
	`appealSubmitted` boolean NOT NULL DEFAULT false,
	`appealReason` text,
	`appealDate` timestamp,
	`appealDecision` enum('pending','approved','rejected'),
	`appealDecisionDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ip_strikes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `known_copyrighted_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`rightsHolder` varchar(255),
	`imageUrl` varchar(500) NOT NULL,
	`perceptualHash` varchar(64) NOT NULL,
	`description` text,
	`tags` json,
	`sourceUrl` varchar(500),
	`addedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `known_copyrighted_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dmca_notices` ADD CONSTRAINT `dmca_notices_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dmca_notices` ADD CONSTRAINT `dmca_notices_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dmca_notices` ADD CONSTRAINT `dmca_notices_actionBy_users_id_fk` FOREIGN KEY (`actionBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ip_screening_results` ADD CONSTRAINT `ip_screening_results_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ip_screening_results` ADD CONSTRAINT `ip_screening_results_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ip_screening_results` ADD CONSTRAINT `ip_screening_results_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ip_strikes` ADD CONSTRAINT `ip_strikes_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ip_strikes` ADD CONSTRAINT `ip_strikes_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ip_strikes` ADD CONSTRAINT `ip_strikes_resolvedBy_users_id_fk` FOREIGN KEY (`resolvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `known_copyrighted_images` ADD CONSTRAINT `known_copyrighted_images_addedBy_users_id_fk` FOREIGN KEY (`addedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `dmca_notices` (`productId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `dmca_notices` (`artistId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `dmca_notices` (`status`);--> statement-breakpoint
CREATE INDEX `notice_date_idx` ON `dmca_notices` (`noticeDate`);--> statement-breakpoint
CREATE INDEX `counter_notice_submitted_idx` ON `dmca_notices` (`counterNoticeSubmitted`);--> statement-breakpoint
CREATE INDEX `complainant_email_idx` ON `dmca_notices` (`complainantEmail`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `ip_screening_results` (`productId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `ip_screening_results` (`artistId`);--> statement-breakpoint
CREATE INDEX `screening_status_idx` ON `ip_screening_results` (`screeningStatus`);--> statement-breakpoint
CREATE INDEX `ai_confidence_score_idx` ON `ip_screening_results` (`aiConfidenceScore`);--> statement-breakpoint
CREATE INDEX `reviewed_by_idx` ON `ip_screening_results` (`reviewedBy`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `ip_screening_results` (`createdAt`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `ip_strikes` (`artistId`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `ip_strikes` (`productId`);--> statement-breakpoint
CREATE INDEX `strike_number_idx` ON `ip_strikes` (`strikeNumber`);--> statement-breakpoint
CREATE INDEX `strike_date_idx` ON `ip_strikes` (`strikeDate`);--> statement-breakpoint
CREATE INDEX `resolved_idx` ON `ip_strikes` (`resolved`);--> statement-breakpoint
CREATE INDEX `appeal_submitted_idx` ON `ip_strikes` (`appealSubmitted`);--> statement-breakpoint
CREATE INDEX `artist_strike_number_idx` ON `ip_strikes` (`artistId`,`strikeNumber`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `known_copyrighted_images` (`name`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `known_copyrighted_images` (`category`);--> statement-breakpoint
CREATE INDEX `rights_holder_idx` ON `known_copyrighted_images` (`rightsHolder`);--> statement-breakpoint
CREATE INDEX `perceptual_hash_idx` ON `known_copyrighted_images` (`perceptualHash`);