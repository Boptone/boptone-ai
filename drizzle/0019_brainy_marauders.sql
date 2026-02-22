CREATE TABLE `pixel_audiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`rules` json NOT NULL,
	`userCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pixel_audiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pixel_consent` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`pixelUserId` varchar(64) NOT NULL,
	`consentType` enum('analytics','marketing','functional') NOT NULL,
	`consentStatus` enum('granted','denied') NOT NULL,
	`consentMethod` varchar(50),
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pixel_consent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pixel_events` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`eventId` varchar(64) NOT NULL,
	`pixelUserId` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`artistId` int,
	`eventType` varchar(50) NOT NULL,
	`eventName` varchar(100),
	`pageUrl` text,
	`pageTitle` varchar(255),
	`referrer` text,
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`utmContent` varchar(100),
	`utmTerm` varchar(100),
	`deviceType` varchar(20),
	`browser` varchar(50),
	`os` varchar(50),
	`country` varchar(2),
	`region` varchar(100),
	`city` varchar(100),
	`ipAddress` varchar(45),
	`userAgent` text,
	`customData` json,
	`revenue` decimal(10,2),
	`currency` varchar(3),
	`productId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pixel_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `pixel_events_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE TABLE `pixel_sessions` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`pixelUserId` varchar(64) NOT NULL,
	`artistId` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	`durationSeconds` int,
	`pageViews` int NOT NULL DEFAULT 0,
	`events` int NOT NULL DEFAULT 0,
	`converted` int NOT NULL DEFAULT 0,
	`revenue` decimal(10,2) NOT NULL DEFAULT '0.00',
	`landingPage` text,
	`exitPage` text,
	`referrer` text,
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`country` varchar(2),
	`deviceType` varchar(20),
	CONSTRAINT `pixel_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `pixel_sessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `pixel_users` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`pixelUserId` varchar(64) NOT NULL,
	`userId` int,
	`firstSeen` timestamp NOT NULL DEFAULT (now()),
	`lastSeen` timestamp NOT NULL DEFAULT (now()),
	`totalEvents` int NOT NULL DEFAULT 0,
	`totalSessions` int NOT NULL DEFAULT 0,
	`totalRevenue` decimal(10,2) NOT NULL DEFAULT '0.00',
	`deviceFingerprint` varchar(255),
	`consentStatus` enum('unknown','granted','denied') NOT NULL DEFAULT 'unknown',
	`consentTimestamp` timestamp,
	`privacyTier` enum('strict','moderate','permissive') NOT NULL DEFAULT 'permissive',
	`country` varchar(2),
	CONSTRAINT `pixel_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `pixel_users_pixelUserId_unique` UNIQUE(`pixelUserId`)
);
--> statement-breakpoint
ALTER TABLE `pixel_audiences` ADD CONSTRAINT `pixel_audiences_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pixel_events` ADD CONSTRAINT `pixel_events_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pixel_events` ADD CONSTRAINT `pixel_events_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pixel_sessions` ADD CONSTRAINT `pixel_sessions_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pixel_users` ADD CONSTRAINT `pixel_users_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `artist_idx` ON `pixel_audiences` (`artistId`);--> statement-breakpoint
CREATE INDEX `pixel_user_idx` ON `pixel_consent` (`pixelUserId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `pixel_consent` (`createdAt`);--> statement-breakpoint
CREATE INDEX `pixel_user_idx` ON `pixel_events` (`pixelUserId`);--> statement-breakpoint
CREATE INDEX `session_idx` ON `pixel_events` (`sessionId`);--> statement-breakpoint
CREATE INDEX `artist_idx` ON `pixel_events` (`artistId`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `pixel_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `pixel_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `product_idx` ON `pixel_events` (`productId`);--> statement-breakpoint
CREATE INDEX `pixel_user_idx` ON `pixel_sessions` (`pixelUserId`);--> statement-breakpoint
CREATE INDEX `artist_idx` ON `pixel_sessions` (`artistId`);--> statement-breakpoint
CREATE INDEX `started_at_idx` ON `pixel_sessions` (`startedAt`);--> statement-breakpoint
CREATE INDEX `converted_idx` ON `pixel_sessions` (`converted`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `pixel_users` (`userId`);--> statement-breakpoint
CREATE INDEX `consent_idx` ON `pixel_users` (`consentStatus`);--> statement-breakpoint
CREATE INDEX `country_idx` ON `pixel_users` (`country`);