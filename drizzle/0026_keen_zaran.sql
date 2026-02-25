ALTER TABLE `bap_tracks` MODIFY COLUMN `pricePerStream` int NOT NULL DEFAULT 200;--> statement-breakpoint
ALTER TABLE `bap_tracks` MODIFY COLUMN `artistShare` int NOT NULL DEFAULT 95;--> statement-breakpoint
ALTER TABLE `bap_tracks` MODIFY COLUMN `platformFee` int NOT NULL DEFAULT 5;