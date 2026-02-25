ALTER TABLE `artist_profiles` ADD `sellerType` enum('music_artist','visual_artist','general_creator') DEFAULT 'music_artist' NOT NULL;--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD `platformFeePercentage` decimal(4,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD `subscriptionTier` enum('free','pro','premium') DEFAULT 'free' NOT NULL;