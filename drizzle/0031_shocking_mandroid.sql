CREATE TABLE `bops_comment_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bops_comment_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `bops_comment_likes_unique` UNIQUE(`commentId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `bops_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`userId` int NOT NULL,
	`body` varchar(300) NOT NULL,
	`parentCommentId` int,
	`likeCount` int NOT NULL DEFAULT 0,
	`replyCount` int NOT NULL DEFAULT 0,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`deletedAt` timestamp,
	`deletedBy` int,
	`isFlagged` boolean NOT NULL DEFAULT false,
	`flagReason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bops_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bops_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoId` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bops_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `bops_likes_unique` UNIQUE(`userId`,`videoId`)
);
--> statement-breakpoint
CREATE TABLE `bops_tips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`fromUserId` int NOT NULL,
	`toArtistId` int NOT NULL,
	`toUserId` int NOT NULL,
	`grossAmountCents` int NOT NULL,
	`stripeFeesCents` int NOT NULL,
	`netAmountCents` int NOT NULL,
	`platformFeeCents` int NOT NULL DEFAULT 0,
	`currency` varchar(3) NOT NULL DEFAULT 'usd',
	`stripePaymentIntentId` varchar(255),
	`stripeChargeId` varchar(255),
	`stripeTransferId` varchar(255),
	`status` enum('pending','completed','failed','refunded','disputed') NOT NULL DEFAULT 'pending',
	`message` varchar(150),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `bops_tips_id` PRIMARY KEY(`id`),
	CONSTRAINT `bops_tips_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `bops_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`userId` int NOT NULL,
	`caption` varchar(150),
	`videoKey` varchar(500) NOT NULL,
	`videoUrl` varchar(500) NOT NULL,
	`rawVideoKey` varchar(500),
	`thumbnailKey` varchar(500),
	`thumbnailUrl` varchar(500),
	`waveformKey` varchar(500),
	`durationMs` int NOT NULL,
	`width` int DEFAULT 1080,
	`height` int DEFAULT 1920,
	`fileSizeBytes` int,
	`mimeType` varchar(50) DEFAULT 'video/mp4',
	`processingStatus` enum('pending','processing','ready','failed') NOT NULL DEFAULT 'pending',
	`processingError` text,
	`processedAt` timestamp,
	`linkedTrackId` int,
	`viewCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`commentCount` int NOT NULL DEFAULT 0,
	`tipCount` int NOT NULL DEFAULT 0,
	`tipTotalCents` int NOT NULL DEFAULT 0,
	`shareCount` int NOT NULL DEFAULT 0,
	`trendingScore` int NOT NULL DEFAULT 0,
	`trendingUpdatedAt` timestamp,
	`moderationStatus` enum('pending','approved','flagged','rejected','appealing') NOT NULL DEFAULT 'pending',
	`moderationNote` text,
	`moderatedAt` timestamp,
	`moderatedBy` int,
	`isPublished` boolean NOT NULL DEFAULT false,
	`isArchived` boolean NOT NULL DEFAULT false,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`deletedAt` timestamp,
	`deletedBy` int,
	`geoRestrictions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	CONSTRAINT `bops_videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bops_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`userId` int,
	`sessionId` varchar(128),
	`watchDurationMs` int,
	`watchPercent` int,
	`completedWatch` boolean NOT NULL DEFAULT false,
	`source` enum('for_you','following','profile','search','share','direct') DEFAULT 'for_you',
	`platform` enum('ios','android','web') DEFAULT 'web',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bops_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bops_comment_likes` ADD CONSTRAINT `bops_comment_likes_commentId_bops_comments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `bops_comments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_comment_likes` ADD CONSTRAINT `bops_comment_likes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_comments` ADD CONSTRAINT `bops_comments_videoId_bops_videos_id_fk` FOREIGN KEY (`videoId`) REFERENCES `bops_videos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_comments` ADD CONSTRAINT `bops_comments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_comments` ADD CONSTRAINT `bops_comments_deletedBy_users_id_fk` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_likes` ADD CONSTRAINT `bops_likes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_likes` ADD CONSTRAINT `bops_likes_videoId_bops_videos_id_fk` FOREIGN KEY (`videoId`) REFERENCES `bops_videos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_tips` ADD CONSTRAINT `bops_tips_videoId_bops_videos_id_fk` FOREIGN KEY (`videoId`) REFERENCES `bops_videos`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_tips` ADD CONSTRAINT `bops_tips_fromUserId_users_id_fk` FOREIGN KEY (`fromUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_tips` ADD CONSTRAINT `bops_tips_toArtistId_artist_profiles_id_fk` FOREIGN KEY (`toArtistId`) REFERENCES `artist_profiles`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_tips` ADD CONSTRAINT `bops_tips_toUserId_users_id_fk` FOREIGN KEY (`toUserId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_videos` ADD CONSTRAINT `bops_videos_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_videos` ADD CONSTRAINT `bops_videos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_videos` ADD CONSTRAINT `bops_videos_linkedTrackId_bap_tracks_id_fk` FOREIGN KEY (`linkedTrackId`) REFERENCES `bap_tracks`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_videos` ADD CONSTRAINT `bops_videos_moderatedBy_users_id_fk` FOREIGN KEY (`moderatedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_videos` ADD CONSTRAINT `bops_videos_deletedBy_users_id_fk` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_views` ADD CONSTRAINT `bops_views_videoId_bops_videos_id_fk` FOREIGN KEY (`videoId`) REFERENCES `bops_videos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_views` ADD CONSTRAINT `bops_views_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `bops_comment_likes_comment_idx` ON `bops_comment_likes` (`commentId`);--> statement-breakpoint
CREATE INDEX `bops_comment_likes_user_idx` ON `bops_comment_likes` (`userId`);--> statement-breakpoint
CREATE INDEX `bops_comments_video_idx` ON `bops_comments` (`videoId`,`isDeleted`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bops_comments_user_idx` ON `bops_comments` (`userId`);--> statement-breakpoint
CREATE INDEX `bops_comments_parent_idx` ON `bops_comments` (`parentCommentId`,`isDeleted`);--> statement-breakpoint
CREATE INDEX `bops_comments_flagged_idx` ON `bops_comments` (`isFlagged`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bops_likes_video_idx` ON `bops_likes` (`videoId`,`isActive`);--> statement-breakpoint
CREATE INDEX `bops_likes_user_idx` ON `bops_likes` (`userId`,`isActive`);--> statement-breakpoint
CREATE INDEX `bops_tips_video_idx` ON `bops_tips` (`videoId`);--> statement-breakpoint
CREATE INDEX `bops_tips_from_user_idx` ON `bops_tips` (`fromUserId`);--> statement-breakpoint
CREATE INDEX `bops_tips_to_artist_idx` ON `bops_tips` (`toArtistId`,`status`);--> statement-breakpoint
CREATE INDEX `bops_tips_status_idx` ON `bops_tips` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bops_tips_artist_earnings_idx` ON `bops_tips` (`toArtistId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bops_artist_id_idx` ON `bops_videos` (`artistId`);--> statement-breakpoint
CREATE INDEX `bops_user_id_idx` ON `bops_videos` (`userId`);--> statement-breakpoint
CREATE INDEX `bops_linked_track_idx` ON `bops_videos` (`linkedTrackId`);--> statement-breakpoint
CREATE INDEX `bops_feed_idx` ON `bops_videos` (`isPublished`,`isDeleted`,`isArchived`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `bops_trending_idx` ON `bops_videos` (`trendingScore`,`isPublished`,`isDeleted`);--> statement-breakpoint
CREATE INDEX `bops_artist_feed_idx` ON `bops_videos` (`artistId`,`isPublished`,`isDeleted`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `bops_processing_idx` ON `bops_videos` (`processingStatus`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bops_moderation_idx` ON `bops_videos` (`moderationStatus`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bops_views_video_idx` ON `bops_views` (`videoId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bops_views_user_idx` ON `bops_views` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bops_views_trending_idx` ON `bops_views` (`videoId`,`completedWatch`,`createdAt`);