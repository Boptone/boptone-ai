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
	`onboardingCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_profiles_id` PRIMARY KEY(`id`)
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
ALTER TABLE `users` MODIFY COLUMN `role` enum('artist','manager','admin') NOT NULL DEFAULT 'artist';--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_snapshots` ADD CONSTRAINT `analytics_snapshots_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD CONSTRAINT `artist_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthcare_plans` ADD CONSTRAINT `healthcare_plans_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `infringements` ADD CONSTRAINT `infringements_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `micro_loans` ADD CONSTRAINT `micro_loans_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `opportunities` ADD CONSTRAINT `opportunities_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `releases` ADD CONSTRAINT `releases_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revenue_records` ADD CONSTRAINT `revenue_records_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `social_media_metrics` ADD CONSTRAINT `social_media_metrics_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streaming_metrics` ADD CONSTRAINT `streaming_metrics_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tours` ADD CONSTRAINT `tours_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `ai_conversations` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_date_idx` ON `analytics_snapshots` (`artistId`,`snapshotDate`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `artist_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `healthcare_plans` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `infringements` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `micro_loans` (`artistId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `opportunities` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `products` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `releases` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `revenue_records` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_date_idx` ON `social_media_metrics` (`artistId`,`date`);--> statement-breakpoint
CREATE INDEX `artist_date_idx` ON `streaming_metrics` (`artistId`,`date`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `tours` (`artistId`);