CREATE TABLE `cohort_revenue_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`cohortMonth` varchar(7) NOT NULL,
	`revenueSource` enum('streaming','shop_sale','tip','subscription','backing','other') NOT NULL,
	`amountCents` bigint NOT NULL,
	`platformFeeCents` bigint NOT NULL DEFAULT 0,
	`netAmountCents` bigint NOT NULL,
	`sourceTable` varchar(64) NOT NULL,
	`sourceId` varchar(64) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cohort_revenue_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `source_dedupe_idx` UNIQUE(`sourceTable`,`sourceId`)
);
--> statement-breakpoint
CREATE TABLE `cohort_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cohortMonth` varchar(7) NOT NULL,
	`periodDays` int NOT NULL,
	`cohortSize` int NOT NULL DEFAULT 0,
	`retainedCount` int NOT NULL DEFAULT 0,
	`totalRevenueCents` bigint NOT NULL DEFAULT 0,
	`avgLtvCents` bigint NOT NULL DEFAULT 0,
	`medianLtvCents` bigint NOT NULL DEFAULT 0,
	`p90LtvCents` bigint NOT NULL DEFAULT 0,
	`retentionRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`streamingRevenueCents` bigint NOT NULL DEFAULT 0,
	`shopRevenueCents` bigint NOT NULL DEFAULT 0,
	`tipsRevenueCents` bigint NOT NULL DEFAULT 0,
	`subscriptionRevenueCents` bigint NOT NULL DEFAULT 0,
	`otherRevenueCents` bigint NOT NULL DEFAULT 0,
	`computedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cohort_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `cohort_period_idx` UNIQUE(`cohortMonth`,`periodDays`)
);
--> statement-breakpoint
ALTER TABLE `cohort_revenue_events` ADD CONSTRAINT `cohort_revenue_events_artistId_users_id_fk` FOREIGN KEY (`artistId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `artist_cohort_idx` ON `cohort_revenue_events` (`artistId`,`cohortMonth`);--> statement-breakpoint
CREATE INDEX `event_date_idx` ON `cohort_revenue_events` (`eventDate`);--> statement-breakpoint
CREATE INDEX `revenue_source_idx` ON `cohort_revenue_events` (`revenueSource`);--> statement-breakpoint
CREATE INDEX `cohort_month_idx` ON `cohort_snapshots` (`cohortMonth`);