CREATE TABLE `flywheel_boosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`milestoneId` int NOT NULL,
	`artistProfileId` int NOT NULL,
	`boostType` enum('discover_featured','email_blast','social_promotion','playlist_inclusion') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`targetGenres` json,
	`targetAudience` enum('all','genre_fans','similar_artists_fans') NOT NULL DEFAULT 'all',
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`newStreams` int NOT NULL DEFAULT 0,
	`newFollowers` int NOT NULL DEFAULT 0,
	`revenueGenerated` int NOT NULL DEFAULT 0,
	`poolCostCents` int NOT NULL DEFAULT 0,
	`status` enum('scheduled','active','completed','canceled') NOT NULL DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flywheel_boosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flywheel_discovery_bonuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discoveryTrackingId` int NOT NULL,
	`discovererArtistId` int NOT NULL,
	`discoveredArtistId` int NOT NULL,
	`streamId` int NOT NULL,
	`trackId` int NOT NULL,
	`baseRevenue` int NOT NULL,
	`bonusAmount` int NOT NULL,
	`fundedBy` enum('network_pool') NOT NULL DEFAULT 'network_pool',
	`status` enum('pending','paid','expired') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flywheel_discovery_bonuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flywheel_discovery_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discovererArtistId` int NOT NULL,
	`discoveredArtistId` int NOT NULL,
	`fanUserId` int NOT NULL,
	`source` enum('discover_page','artist_profile','playlist','search','recommendation') NOT NULL,
	`firstStreamId` int NOT NULL,
	`bonusActive` boolean NOT NULL DEFAULT true,
	`bonusExpiresAt` timestamp NOT NULL,
	`totalBonusEarned` int NOT NULL DEFAULT 0,
	`discoveredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flywheel_discovery_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flywheel_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistProfileId` int NOT NULL,
	`milestoneType` enum('1k_streams','10k_streams','50k_streams','100k_streams','500k_streams','1m_streams') NOT NULL,
	`streamCount` int NOT NULL,
	`boostTriggered` boolean NOT NULL DEFAULT false,
	`boostType` enum('discover_featured','email_blast','social_promotion','playlist_inclusion'),
	`boostStartDate` timestamp,
	`boostEndDate` timestamp,
	`additionalStreams` int NOT NULL DEFAULT 0,
	`additionalRevenue` int NOT NULL DEFAULT 0,
	`achievedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flywheel_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flywheel_network_pool` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamId` int NOT NULL,
	`trackId` int NOT NULL,
	`contributionAmount` int NOT NULL,
	`allocatedTo` enum('milestone_boost','discovery_bonus','superfan_multiplier','unallocated') NOT NULL DEFAULT 'unallocated',
	`allocationId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flywheel_network_pool_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flywheel_super_fans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`uniqueArtistsStreamed` int NOT NULL DEFAULT 0,
	`totalStreamsLast30Days` int NOT NULL DEFAULT 0,
	`qualifiedAt` timestamp NOT NULL DEFAULT (now()),
	`lastStreamAt` timestamp NOT NULL DEFAULT (now()),
	`multiplierStreams` int NOT NULL DEFAULT 0,
	`totalBonusGenerated` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flywheel_super_fans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `flywheel_boosts` ADD CONSTRAINT `flywheel_boosts_milestoneId_flywheel_milestones_id_fk` FOREIGN KEY (`milestoneId`) REFERENCES `flywheel_milestones`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_boosts` ADD CONSTRAINT `flywheel_boosts_artistProfileId_artist_profiles_id_fk` FOREIGN KEY (`artistProfileId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_discovery_bonuses` ADD CONSTRAINT `flywheel_discovery_bonuses_discoveryTrackingId_flywheel_discovery_tracking_id_fk` FOREIGN KEY (`discoveryTrackingId`) REFERENCES `flywheel_discovery_tracking`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_discovery_bonuses` ADD CONSTRAINT `flywheel_discovery_bonuses_discovererArtistId_artist_profiles_id_fk` FOREIGN KEY (`discovererArtistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_discovery_bonuses` ADD CONSTRAINT `flywheel_discovery_bonuses_discoveredArtistId_artist_profiles_id_fk` FOREIGN KEY (`discoveredArtistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_discovery_bonuses` ADD CONSTRAINT `flywheel_discovery_bonuses_streamId_bap_streams_id_fk` FOREIGN KEY (`streamId`) REFERENCES `bap_streams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_discovery_bonuses` ADD CONSTRAINT `flywheel_discovery_bonuses_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_discovery_tracking` ADD CONSTRAINT `flywheel_discovery_tracking_discovererArtistId_artist_profiles_id_fk` FOREIGN KEY (`discovererArtistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_discovery_tracking` ADD CONSTRAINT `flywheel_discovery_tracking_discoveredArtistId_artist_profiles_id_fk` FOREIGN KEY (`discoveredArtistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_discovery_tracking` ADD CONSTRAINT `flywheel_discovery_tracking_fanUserId_users_id_fk` FOREIGN KEY (`fanUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_discovery_tracking` ADD CONSTRAINT `flywheel_discovery_tracking_firstStreamId_bap_streams_id_fk` FOREIGN KEY (`firstStreamId`) REFERENCES `bap_streams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_milestones` ADD CONSTRAINT `flywheel_milestones_artistProfileId_artist_profiles_id_fk` FOREIGN KEY (`artistProfileId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_network_pool` ADD CONSTRAINT `flywheel_network_pool_streamId_bap_streams_id_fk` FOREIGN KEY (`streamId`) REFERENCES `bap_streams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_network_pool` ADD CONSTRAINT `flywheel_network_pool_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flywheel_super_fans` ADD CONSTRAINT `flywheel_super_fans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `flywheel_boosts` (`artistProfileId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `flywheel_boosts` (`status`);--> statement-breakpoint
CREATE INDEX `start_date_idx` ON `flywheel_boosts` (`startDate`);--> statement-breakpoint
CREATE INDEX `discoverer_idx` ON `flywheel_discovery_bonuses` (`discovererArtistId`);--> statement-breakpoint
CREATE INDEX `discovered_idx` ON `flywheel_discovery_bonuses` (`discoveredArtistId`);--> statement-breakpoint
CREATE INDEX `stream_id_idx` ON `flywheel_discovery_bonuses` (`streamId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `flywheel_discovery_bonuses` (`status`);--> statement-breakpoint
CREATE INDEX `discoverer_idx` ON `flywheel_discovery_tracking` (`discovererArtistId`);--> statement-breakpoint
CREATE INDEX `discovered_idx` ON `flywheel_discovery_tracking` (`discoveredArtistId`);--> statement-breakpoint
CREATE INDEX `fan_idx` ON `flywheel_discovery_tracking` (`fanUserId`);--> statement-breakpoint
CREATE INDEX `bonus_active_idx` ON `flywheel_discovery_tracking` (`bonusActive`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `flywheel_milestones` (`artistProfileId`);--> statement-breakpoint
CREATE INDEX `milestone_type_idx` ON `flywheel_milestones` (`milestoneType`);--> statement-breakpoint
CREATE INDEX `boost_triggered_idx` ON `flywheel_milestones` (`boostTriggered`);--> statement-breakpoint
CREATE INDEX `stream_id_idx` ON `flywheel_network_pool` (`streamId`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `flywheel_network_pool` (`trackId`);--> statement-breakpoint
CREATE INDEX `allocated_to_idx` ON `flywheel_network_pool` (`allocatedTo`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `flywheel_super_fans` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `flywheel_super_fans` (`status`);--> statement-breakpoint
CREATE INDEX `last_stream_idx` ON `flywheel_super_fans` (`lastStreamAt`);