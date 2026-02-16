CREATE TABLE `verification_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('email','phone','password_reset') NOT NULL,
	`identifier` varchar(320) NOT NULL,
	`code` varchar(6) NOT NULL,
	`userId` int,
	`expiresAt` timestamp NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `verification_codes` ADD CONSTRAINT `verification_codes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `identifier_idx` ON `verification_codes` (`identifier`);--> statement-breakpoint
CREATE INDEX `expires_at_idx` ON `verification_codes` (`expiresAt`);