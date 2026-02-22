CREATE TABLE `user_cookie_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`analyticsCookies` int NOT NULL DEFAULT 0,
	`marketingCookies` int NOT NULL DEFAULT 0,
	`consentGivenAt` timestamp NOT NULL DEFAULT (now()),
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`userAgent` text,
	`ipAddress` varchar(45),
	CONSTRAINT `user_cookie_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_cookie_preferences` ADD CONSTRAINT `user_cookie_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_cookie_preferences` (`userId`);