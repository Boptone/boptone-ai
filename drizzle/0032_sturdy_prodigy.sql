CREATE TABLE `bops_artist_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`artistId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bops_artist_follows_id` PRIMARY KEY(`id`),
	CONSTRAINT `bops_artist_follows_unique` UNIQUE(`followerId`,`artistId`)
);
--> statement-breakpoint
ALTER TABLE `bops_artist_follows` ADD CONSTRAINT `bops_artist_follows_followerId_users_id_fk` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bops_artist_follows` ADD CONSTRAINT `bops_artist_follows_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `bops_artist_follows_follower_idx` ON `bops_artist_follows` (`followerId`);--> statement-breakpoint
CREATE INDEX `bops_artist_follows_artist_idx` ON `bops_artist_follows` (`artistId`);