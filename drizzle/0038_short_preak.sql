CREATE TABLE `toney_agent_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artist_profile_id` int NOT NULL,
	`user_id` int NOT NULL,
	`category` enum('streaming_drop','streaming_spike','revenue_milestone','revenue_drop','fan_engagement_spike','release_gap','workflow_suggestion','goal_progress','earnings_available','superfan_detected','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`insight` text NOT NULL,
	`action_payload` json,
	`auto_executed` boolean NOT NULL DEFAULT false,
	`workflow_id` int,
	`dismissed` boolean NOT NULL DEFAULT false,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`snapshot_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `toney_agent_actions_id` PRIMARY KEY(`id`)
);
