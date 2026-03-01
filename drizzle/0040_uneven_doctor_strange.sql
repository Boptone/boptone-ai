CREATE TABLE `artist_activation_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`stepKey` varchar(64) NOT NULL,
	`stepTitle` varchar(255) NOT NULL,
	`stepDescription` text,
	`stepOrder` int NOT NULL DEFAULT 0,
	`status` enum('pending','in_progress','completed','skipped') NOT NULL DEFAULT 'pending',
	`personalizedHint` text,
	`ctaLabel` varchar(128),
	`ctaPath` varchar(255),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_activation_steps_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_artist_activation_step` UNIQUE(`artistId`,`stepKey`)
);
--> statement-breakpoint
ALTER TABLE `artist_activation_steps` ADD CONSTRAINT `artist_activation_steps_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `activation_artistId_idx` ON `artist_activation_steps` (`artistId`);