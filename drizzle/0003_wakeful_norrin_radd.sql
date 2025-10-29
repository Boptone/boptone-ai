ALTER TABLE `artist_profiles` ADD `themeColor` varchar(7) DEFAULT '#0066ff';--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD `accentColor` varchar(7) DEFAULT '#00d4aa';--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD `layoutStyle` enum('default','minimal','grid') DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD `fontFamily` varchar(100) DEFAULT 'Inter';