CREATE TABLE `contract_audit_log` (
	`id` varchar(255) NOT NULL,
	`contractId` varchar(255) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`fromAgentId` varchar(255) NOT NULL,
	`toAgentId` varchar(255) NOT NULL,
	`action` varchar(255) NOT NULL,
	`validationResult` text,
	`metadata` text,
	CONSTRAINT `contract_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_contracts` (
	`id` varchar(255) NOT NULL,
	`goal` text NOT NULL,
	`acceptedOutputs` text NOT NULL,
	`knownRisks` text NOT NULL,
	`nextAction` text NOT NULL,
	`constraints` text NOT NULL,
	`priority` enum('critical','high','medium','low') NOT NULL,
	`status` enum('pending','accepted','completed','failed','rejected') NOT NULL,
	`createdBy` varchar(255) NOT NULL,
	`acceptedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`completedAt` timestamp,
	`actualOutputs` text,
	`failureReason` text,
	`rejectionReason` text,
	`context` text,
	`parentContractId` varchar(255),
	`childContractIds` text,
	CONSTRAINT `task_contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `contract_id_idx` ON `contract_audit_log` (`contractId`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `contract_audit_log` (`timestamp`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `contract_audit_log` (`action`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `task_contracts` (`status`);--> statement-breakpoint
CREATE INDEX `created_by_idx` ON `task_contracts` (`createdBy`);--> statement-breakpoint
CREATE INDEX `accepted_by_idx` ON `task_contracts` (`acceptedBy`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `task_contracts` (`createdAt`);