CREATE TABLE `ai_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`messages` json,
	`context` enum('career_advice','release_strategy','content_ideas','financial_planning','tour_planning','general') NOT NULL,
	`tokensUsed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`snapshotDate` timestamp NOT NULL,
	`totalStreams` int,
	`totalFollowers` int,
	`totalRevenue` int,
	`engagementScore` decimal(5,2),
	`careerPhase` enum('discovery','development','launch','scale') NOT NULL,
	`priorityScore` decimal(3,2),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`method` enum('paypal','venmo','zelle','cashapp','apple_cash') NOT NULL,
	`handle` varchar(255) NOT NULL,
	`displayName` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stageName` varchar(255) NOT NULL,
	`bio` text,
	`genres` json,
	`location` varchar(255),
	`careerPhase` enum('discovery','development','launch','scale') NOT NULL DEFAULT 'discovery',
	`priorityScore` decimal(3,2) DEFAULT '0.00',
	`verifiedStatus` boolean NOT NULL DEFAULT false,
	`avatarUrl` text,
	`coverImageUrl` text,
	`socialLinks` json,
	`themeColor` varchar(7) DEFAULT '#0066ff',
	`accentColor` varchar(7) DEFAULT '#00d4aa',
	`layoutStyle` enum('default','minimal','grid') DEFAULT 'default',
	`fontFamily` varchar(100) DEFAULT 'Inter',
	`onboardingCompleted` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_tax_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`country` varchar(2) NOT NULL,
	`state` varchar(100),
	`taxId` varchar(50),
	`taxIdType` enum('ssn','ein','vat','abn','sin','other'),
	`reportingThreshold` int,
	`currentYearTotal` int NOT NULL DEFAULT 0,
	`w9Submitted` boolean NOT NULL DEFAULT false,
	`w9SubmittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_tax_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `artist_tax_settings_artistId_unique` UNIQUE(`artistId`)
);
--> statement-breakpoint
CREATE TABLE `bap_albums` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`artworkUrl` text,
	`albumType` enum('single','ep','album','compilation') NOT NULL,
	`genre` varchar(100),
	`releaseDate` timestamp NOT NULL,
	`trackCount` int NOT NULL DEFAULT 0,
	`totalDuration` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bap_albums_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bap_follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bap_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`amount` int NOT NULL,
	`streamCount` int NOT NULL,
	`stripePayoutId` varchar(255),
	`status` enum('pending','processing','paid','failed') NOT NULL DEFAULT 'pending',
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bap_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`coverImageUrl` text,
	`isPublic` boolean NOT NULL DEFAULT true,
	`isCurated` boolean NOT NULL DEFAULT false,
	`trackIds` json,
	`trackCount` int NOT NULL DEFAULT 0,
	`followerCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bap_playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_reposts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bap_reposts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_streams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`userId` int,
	`durationPlayed` int NOT NULL,
	`completionRate` int NOT NULL,
	`paymentAmount` int NOT NULL DEFAULT 1,
	`artistShare` int NOT NULL DEFAULT 0,
	`platformShare` int NOT NULL DEFAULT 0,
	`source` enum('feed','playlist','artist_page','search','direct') NOT NULL,
	`deviceType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bap_streams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`artist` varchar(255) NOT NULL,
	`albumId` int,
	`duration` int NOT NULL,
	`bpm` int,
	`musicalKey` varchar(10),
	`genre` varchar(100),
	`mood` varchar(100),
	`audioUrl` text NOT NULL,
	`waveformUrl` text,
	`artworkUrl` text,
	`fileSize` int,
	`audioFormat` varchar(20) DEFAULT 'mp3',
	`did` varchar(255),
	`contentHash` varchar(128),
	`playCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`repostCount` int NOT NULL DEFAULT 0,
	`totalEarnings` int NOT NULL DEFAULT 0,
	`status` enum('draft','processing','live','archived') NOT NULL DEFAULT 'draft',
	`isExplicit` boolean NOT NULL DEFAULT false,
	`releasedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bap_tracks_id` PRIMARY KEY(`id`),
	CONSTRAINT `bap_tracks_did_unique` UNIQUE(`did`)
);
--> statement-breakpoint
CREATE TABLE `healthcare_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`provider` varchar(255) NOT NULL,
	`planType` varchar(100) NOT NULL,
	`monthlyCost` int NOT NULL,
	`coverageDetails` json,
	`enrollmentDate` timestamp NOT NULL,
	`status` enum('active','pending','cancelled','expired') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthcare_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `infringements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`detectedUrl` text NOT NULL,
	`platform` varchar(100) NOT NULL,
	`confidenceScore` decimal(5,2),
	`status` enum('detected','dmca_sent','resolved','disputed','false_positive') NOT NULL DEFAULT 'detected',
	`dmcaNoticeUrl` text,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `infringements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kick_in_tips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`paymentMethod` enum('paypal','venmo','zelle','cashapp','apple_cash') NOT NULL,
	`fanName` varchar(255),
	`fanEmail` varchar(320),
	`message` text,
	`taxYear` int NOT NULL,
	`isReported` boolean NOT NULL DEFAULT false,
	`isVerified` boolean NOT NULL DEFAULT false,
	`verifiedAt` timestamp,
	`tippedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kick_in_tips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `micro_loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`amount` int NOT NULL,
	`interestRate` decimal(5,2) NOT NULL,
	`repaymentTermMonths` int NOT NULL,
	`status` enum('pending','approved','active','paid','defaulted','rejected') NOT NULL DEFAULT 'pending',
	`riskScore` decimal(5,2),
	`collateralType` varchar(100) NOT NULL DEFAULT 'future_royalties',
	`approvedAt` timestamp,
	`disbursedAt` timestamp,
	`paidOffAt` timestamp,
	`monthlyPayment` int,
	`remainingBalance` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `micro_loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('milestone','opportunity','financial','system','alert') NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`opportunityType` enum('playlist','collaboration','venue_booking','brand_deal','label_interest','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`source` varchar(255),
	`status` enum('new','contacted','in_progress','accepted','declined','expired') NOT NULL DEFAULT 'new',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`deadline` timestamp,
	`contactInfo` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`stripeChargeId` varchar(255),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'usd',
	`status` enum('succeeded','pending','failed','refunded') NOT NULL,
	`productType` enum('subscription','merchandise','other') NOT NULL,
	`productId` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`inventoryCount` int NOT NULL DEFAULT 0,
	`images` json,
	`variants` json,
	`productType` enum('physical','digital','experience') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `releases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`releaseType` enum('single','ep','album','compilation') NOT NULL,
	`releaseDate` timestamp NOT NULL,
	`platforms` json,
	`upcCode` varchar(20),
	`isrcCodes` json,
	`artworkUrl` text,
	`status` enum('draft','scheduled','released','cancelled') NOT NULL DEFAULT 'draft',
	`totalTracks` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `releases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revenue_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`source` enum('streaming','merchandise','shows','licensing','brand_deals','youtube_ads','patreon','other') NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`description` text,
	`status` enum('pending','paid','disputed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revenue_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_media_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`platform` enum('instagram','tiktok','twitter','youtube','facebook') NOT NULL,
	`followers` int NOT NULL,
	`engagementRate` decimal(5,2),
	`viralScore` decimal(5,2),
	`totalPosts` int,
	`averageLikes` int,
	`averageComments` int,
	`averageShares` int,
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_media_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streaming_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`platform` enum('spotify','apple_music','youtube_music','amazon_music','tidal','soundcloud') NOT NULL,
	`metricType` enum('streams','followers','monthly_listeners','saves','playlist_adds') NOT NULL,
	`value` int NOT NULL,
	`growthRate` decimal(5,2),
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `streaming_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`stripePriceId` varchar(255),
	`tier` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`status` enum('active','canceled','past_due','trialing','incomplete') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`tourName` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`venues` json,
	`budget` int,
	`revenueProjection` int,
	`actualRevenue` int,
	`status` enum('planning','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'planning',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tours_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('artist','manager','admin') NOT NULL DEFAULT 'artist',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_snapshots` ADD CONSTRAINT `analytics_snapshots_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_payment_methods` ADD CONSTRAINT `artist_payment_methods_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD CONSTRAINT `artist_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_tax_settings` ADD CONSTRAINT `artist_tax_settings_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_albums` ADD CONSTRAINT `bap_albums_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_follows` ADD CONSTRAINT `bap_follows_followerId_users_id_fk` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_follows` ADD CONSTRAINT `bap_follows_followingId_users_id_fk` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_likes` ADD CONSTRAINT `bap_likes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_likes` ADD CONSTRAINT `bap_likes_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_payments` ADD CONSTRAINT `bap_payments_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_playlists` ADD CONSTRAINT `bap_playlists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_reposts` ADD CONSTRAINT `bap_reposts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_reposts` ADD CONSTRAINT `bap_reposts_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_streams` ADD CONSTRAINT `bap_streams_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_streams` ADD CONSTRAINT `bap_streams_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_tracks` ADD CONSTRAINT `bap_tracks_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_tracks` ADD CONSTRAINT `bap_tracks_albumId_bap_albums_id_fk` FOREIGN KEY (`albumId`) REFERENCES `bap_albums`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthcare_plans` ADD CONSTRAINT `healthcare_plans_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `infringements` ADD CONSTRAINT `infringements_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kick_in_tips` ADD CONSTRAINT `kick_in_tips_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `micro_loans` ADD CONSTRAINT `micro_loans_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `opportunities` ADD CONSTRAINT `opportunities_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `releases` ADD CONSTRAINT `releases_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revenue_records` ADD CONSTRAINT `revenue_records_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `social_media_metrics` ADD CONSTRAINT `social_media_metrics_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streaming_metrics` ADD CONSTRAINT `streaming_metrics_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tours` ADD CONSTRAINT `tours_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `ai_conversations` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_date_idx` ON `analytics_snapshots` (`artistId`,`snapshotDate`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `artist_payment_methods` (`artistId`);--> statement-breakpoint
CREATE INDEX `method_idx` ON `artist_payment_methods` (`method`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `artist_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `artist_tax_settings` (`artistId`);--> statement-breakpoint
CREATE INDEX `country_idx` ON `artist_tax_settings` (`country`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `bap_albums` (`artistId`);--> statement-breakpoint
CREATE INDEX `follower_idx` ON `bap_follows` (`followerId`);--> statement-breakpoint
CREATE INDEX `following_idx` ON `bap_follows` (`followingId`);--> statement-breakpoint
CREATE INDEX `unique_follow` ON `bap_follows` (`followerId`,`followingId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `bap_likes` (`userId`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `bap_likes` (`trackId`);--> statement-breakpoint
CREATE INDEX `unique_like` ON `bap_likes` (`userId`,`trackId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `bap_payments` (`artistId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `bap_payments` (`status`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `bap_playlists` (`userId`);--> statement-breakpoint
CREATE INDEX `is_curated_idx` ON `bap_playlists` (`isCurated`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `bap_reposts` (`userId`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `bap_reposts` (`trackId`);--> statement-breakpoint
CREATE INDEX `unique_repost` ON `bap_reposts` (`userId`,`trackId`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `bap_streams` (`trackId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `bap_streams` (`userId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `bap_streams` (`createdAt`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `bap_tracks` (`artistId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `bap_tracks` (`status`);--> statement-breakpoint
CREATE INDEX `released_at_idx` ON `bap_tracks` (`releasedAt`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `healthcare_plans` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `infringements` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `kick_in_tips` (`artistId`);--> statement-breakpoint
CREATE INDEX `tax_year_idx` ON `kick_in_tips` (`taxYear`);--> statement-breakpoint
CREATE INDEX `tipped_at_idx` ON `kick_in_tips` (`tippedAt`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `micro_loans` (`artistId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `opportunities` (`artistId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `payments` (`userId`);--> statement-breakpoint
CREATE INDEX `stripe_payment_intent_idx` ON `payments` (`stripePaymentIntentId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `products` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `releases` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `revenue_records` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_date_idx` ON `social_media_metrics` (`artistId`,`date`);--> statement-breakpoint
CREATE INDEX `artist_date_idx` ON `streaming_metrics` (`artistId`,`date`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `stripe_customer_idx` ON `subscriptions` (`stripeCustomerId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `tours` (`artistId`);