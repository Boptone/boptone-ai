CREATE TABLE `review_helpfulness_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`userId` int NOT NULL,
	`voteType` enum('helpful','unhelpful') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_helpfulness_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`photoUrl` varchar(500) NOT NULL,
	`thumbnailUrl` varchar(500),
	`altText` text NOT NULL,
	`altTextConfidence` decimal(3,2),
	`displayOrder` int NOT NULL DEFAULT 0,
	`fileSize` int,
	`mimeType` varchar(50),
	`width` int,
	`height` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `product_reviews` MODIFY COLUMN `content` text NOT NULL;--> statement-breakpoint
ALTER TABLE `product_reviews` MODIFY COLUMN `status` enum('pending','approved','rejected','flagged') NOT NULL DEFAULT 'approved';--> statement-breakpoint
ALTER TABLE `product_reviews` ADD `verifiedPurchase` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD `helpfulVotes` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD `unhelpfulVotes` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD `moderationNotes` text;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD `reviewerName` varchar(255);--> statement-breakpoint
ALTER TABLE `product_reviews` ADD `reviewerLocation` varchar(255);--> statement-breakpoint
ALTER TABLE `review_helpfulness_votes` ADD CONSTRAINT `review_helpfulness_votes_reviewId_product_reviews_id_fk` FOREIGN KEY (`reviewId`) REFERENCES `product_reviews`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_helpfulness_votes` ADD CONSTRAINT `review_helpfulness_votes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_photos` ADD CONSTRAINT `review_photos_reviewId_product_reviews_id_fk` FOREIGN KEY (`reviewId`) REFERENCES `product_reviews`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `review_id_idx` ON `review_helpfulness_votes` (`reviewId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `review_helpfulness_votes` (`userId`);--> statement-breakpoint
CREATE INDEX `unique_user_review` ON `review_helpfulness_votes` (`userId`,`reviewId`);--> statement-breakpoint
CREATE INDEX `review_id_idx` ON `review_photos` (`reviewId`);--> statement-breakpoint
CREATE INDEX `display_order_idx` ON `review_photos` (`displayOrder`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `product_reviews` (`status`);--> statement-breakpoint
CREATE INDEX `rating_idx` ON `product_reviews` (`rating`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `product_reviews` (`createdAt`);--> statement-breakpoint
ALTER TABLE `product_reviews` DROP COLUMN `helpfulCount`;