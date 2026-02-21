ALTER TABLE `users` ADD `stripe_connect_account_id` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_connect_onboarding_complete` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_connect_charges_enabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_connect_payouts_enabled` int DEFAULT 0 NOT NULL;