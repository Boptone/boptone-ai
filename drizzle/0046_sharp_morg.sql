CREATE TABLE `distribution_submission_tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`trackId` int NOT NULL,
	`trackOrder` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `distribution_submission_tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `distribution_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`status` enum('draft','submitted','processing','live','partial','failed','cancelled','takedown') NOT NULL DEFAULT 'draft',
	`trackIds` json NOT NULL DEFAULT ('[]'),
	`selectedDsps` json NOT NULL DEFAULT ('[]'),
	`territories` json NOT NULL DEFAULT ('{"mode":"worldwide"}'),
	`pricingTier` enum('free','standard','premium') NOT NULL DEFAULT 'standard',
	`boptoneSharePercent` decimal(5,2) NOT NULL DEFAULT '10.00',
	`releaseDate` timestamp,
	`preSaveEnabled` boolean NOT NULL DEFAULT false,
	`exclusiveWindowDays` int NOT NULL DEFAULT 0,
	`upc` varchar(20),
	`isrc` varchar(20),
	`artistNotes` text,
	`submittedAt` timestamp,
	`processedAt` timestamp,
	`liveAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `distribution_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `distribution_submission_tracks` ADD CONSTRAINT `distribution_submission_tracks_submissionId_distribution_submissions_id_fk` FOREIGN KEY (`submissionId`) REFERENCES `distribution_submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `distribution_submission_tracks` ADD CONSTRAINT `distribution_submission_tracks_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `distribution_submissions` ADD CONSTRAINT `distribution_submissions_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `dist_sub_track_idx` ON `distribution_submission_tracks` (`submissionId`,`trackId`);--> statement-breakpoint
CREATE INDEX `dist_sub_artist_idx` ON `distribution_submissions` (`artistId`);--> statement-breakpoint
CREATE INDEX `dist_sub_status_idx` ON `distribution_submissions` (`status`);--> statement-breakpoint
CREATE INDEX `dist_sub_release_date_idx` ON `distribution_submissions` (`releaseDate`);