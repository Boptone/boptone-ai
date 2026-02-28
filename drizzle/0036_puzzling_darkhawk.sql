CREATE TABLE `artist_toney_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artist_profile_id` int NOT NULL,
	`user_id` int NOT NULL,
	`career_stage` enum('emerging','developing','established','legacy') DEFAULT 'emerging',
	`primary_genre` varchar(100),
	`sub_genre` varchar(100),
	`team_structure` enum('solo','managed','label_affiliated','collective') DEFAULT 'solo',
	`geographic_base` varchar(100),
	`release_history_summary` text,
	`financial_patterns_summary` text,
	`primary_income_source` varchar(100),
	`seasonal_patterns` text,
	`active_goals` text,
	`implicit_priorities` text,
	`prefers_brief_responses` boolean DEFAULT false,
	`prefers_data_heavy` boolean DEFAULT false,
	`communication_notes` text,
	`sensitivities` text,
	`protected_topics` text,
	`conversation_summary` text,
	`summary_updated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_toney_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `artist_toney_profiles_artist_profile_id_unique` UNIQUE(`artist_profile_id`)
);
--> statement-breakpoint
CREATE TABLE `toney_conversation_turns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`artist_profile_id` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`register` varchar(50),
	`topics` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `toney_conversation_turns_id` PRIMARY KEY(`id`)
);
