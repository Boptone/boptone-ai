CREATE TABLE `fan_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanId` int NOT NULL,
	`artistId` int NOT NULL,
	`eventType` enum('link_click','page_view','email_signup','email_open','email_click','stream','save','follow','share','comment','like','merch_view','merch_purchase','ticket_view','ticket_purchase','tip','referral') NOT NULL,
	`eventSource` varchar(100),
	`eventValue` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fan_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fan_segments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`rules` json,
	`fanCount` int NOT NULL DEFAULT 0,
	`lastComputedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fan_segments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`name` varchar(255),
	`location` varchar(255),
	`country` varchar(2),
	`city` varchar(100),
	`discoverySource` enum('spotify_playlist','spotify_algorithm','spotify_search','apple_music_playlist','apple_music_algorithm','apple_music_search','youtube','tiktok','instagram','twitter','facebook','friend_recommendation','live_show','radio','podcast','blog_press','shazam','bandcamp','soundcloud','other'),
	`discoveryDetail` text,
	`funnelStage` enum('discovered','follower','engaged','customer','superfan') NOT NULL DEFAULT 'discovered',
	`fanScore` int NOT NULL DEFAULT 0,
	`totalInteractions` int NOT NULL DEFAULT 0,
	`lastInteractionAt` timestamp,
	`firstInteractionAt` timestamp,
	`lifetimeValue` int NOT NULL DEFAULT 0,
	`purchaseCount` int NOT NULL DEFAULT 0,
	`spotifyId` varchar(255),
	`appleMusicId` varchar(255),
	`emailOptIn` boolean NOT NULL DEFAULT false,
	`smsOptIn` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnel_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`snapshotDate` timestamp NOT NULL,
	`discoveredCount` int NOT NULL DEFAULT 0,
	`followerCount` int NOT NULL DEFAULT 0,
	`engagedCount` int NOT NULL DEFAULT 0,
	`customerCount` int NOT NULL DEFAULT 0,
	`superfanCount` int NOT NULL DEFAULT 0,
	`discoveredToFollower` int,
	`followerToEngaged` int,
	`engagedToCustomer` int,
	`customerToSuperfan` int,
	`sourceBreakdown` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funnel_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `link_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkId` int NOT NULL,
	`fanId` int,
	`destination` varchar(50),
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`utmContent` varchar(100),
	`referrer` text,
	`device` varchar(50),
	`browser` varchar(50),
	`os` varchar(50),
	`country` varchar(2),
	`city` varchar(100),
	`ipHash` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `link_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smart_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`linkType` enum('release','presave','bio','tour','merch','custom') NOT NULL,
	`destinations` json,
	`defaultUrl` text,
	`imageUrl` text,
	`backgroundColor` varchar(7),
	`collectEmail` boolean NOT NULL DEFAULT false,
	`collectPhone` boolean NOT NULL DEFAULT false,
	`showDiscoverySurvey` boolean NOT NULL DEFAULT false,
	`totalClicks` int NOT NULL DEFAULT 0,
	`uniqueVisitors` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smart_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `fan_events` ADD CONSTRAINT `fan_events_fanId_fans_id_fk` FOREIGN KEY (`fanId`) REFERENCES `fans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fan_events` ADD CONSTRAINT `fan_events_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fan_segments` ADD CONSTRAINT `fan_segments_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fans` ADD CONSTRAINT `fans_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funnel_snapshots` ADD CONSTRAINT `funnel_snapshots_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `link_clicks` ADD CONSTRAINT `link_clicks_linkId_smart_links_id_fk` FOREIGN KEY (`linkId`) REFERENCES `smart_links`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `link_clicks` ADD CONSTRAINT `link_clicks_fanId_fans_id_fk` FOREIGN KEY (`fanId`) REFERENCES `fans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `smart_links` ADD CONSTRAINT `smart_links_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `fan_id_idx` ON `fan_events` (`fanId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `fan_events` (`artistId`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `fan_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `fan_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `fan_segments` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `fans` (`artistId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `fans` (`email`);--> statement-breakpoint
CREATE INDEX `funnel_stage_idx` ON `fans` (`funnelStage`);--> statement-breakpoint
CREATE INDEX `fan_score_idx` ON `fans` (`fanScore`);--> statement-breakpoint
CREATE INDEX `discovery_source_idx` ON `fans` (`discoverySource`);--> statement-breakpoint
CREATE INDEX `artist_date_idx` ON `funnel_snapshots` (`artistId`,`snapshotDate`);--> statement-breakpoint
CREATE INDEX `link_id_idx` ON `link_clicks` (`linkId`);--> statement-breakpoint
CREATE INDEX `fan_id_idx` ON `link_clicks` (`fanId`);--> statement-breakpoint
CREATE INDEX `utm_source_idx` ON `link_clicks` (`utmSource`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `link_clicks` (`createdAt`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `smart_links` (`artistId`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `smart_links` (`slug`);--> statement-breakpoint
CREATE INDEX `link_type_idx` ON `smart_links` (`linkType`);