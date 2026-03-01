CREATE TABLE `transcode_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`format` enum('aac_256','ogg_vorbis','flac_16','mp3_320','wav_24_96') NOT NULL,
	`status` enum('queued','processing','done','error','skipped') NOT NULL DEFAULT 'queued',
	`s3Key` varchar(512),
	`s3Url` text,
	`fileSizeBytes` int,
	`attempts` int NOT NULL DEFAULT 0,
	`maxAttempts` int NOT NULL DEFAULT 3,
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transcode_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `transcode_jobs` ADD CONSTRAINT `transcode_jobs_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `transcode_track_id_idx` ON `transcode_jobs` (`trackId`);--> statement-breakpoint
CREATE INDEX `transcode_status_idx` ON `transcode_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `transcode_format_idx` ON `transcode_jobs` (`format`);--> statement-breakpoint
CREATE INDEX `transcode_track_format_idx` ON `transcode_jobs` (`trackId`,`format`);