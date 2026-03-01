CREATE TABLE `counter_notices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`noticeId` int NOT NULL,
	`artistUserId` int NOT NULL,
	`identificationOfRemovedContent` text NOT NULL,
	`goodFaithBelief` text NOT NULL,
	`consentToJurisdiction` boolean NOT NULL,
	`consentToServiceOfProcess` boolean NOT NULL,
	`electronicSignature` varchar(500) NOT NULL,
	`artistAddress` text,
	`fairUseJustification` text,
	`licenseEvidence` text,
	`originalWorkEvidence` text,
	`status` enum('submitted','claimant_notified','waiting_period','content_reinstated','lawsuit_filed','withdrawn') NOT NULL DEFAULT 'submitted',
	`reinstateAfter` timestamp,
	`reinstatedAt` timestamp,
	`claimantNotifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `counter_notices_id` PRIMARY KEY(`id`),
	CONSTRAINT `counter_notices_noticeId_unique` UNIQUE(`noticeId`)
);
--> statement-breakpoint
CREATE TABLE `fingerprint_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('track','bop','product') NOT NULL,
	`contentId` int,
	`contentUrl` varchar(1000),
	`uploadedByUserId` int,
	`provider` enum('acrcloud','audd','audible_magic','internal') NOT NULL,
	`providerRequestId` varchar(255),
	`scanStatus` enum('pending','scanning','clean','match_found','partial_match','error') NOT NULL DEFAULT 'pending',
	`matchedTitle` varchar(500),
	`matchedArtist` varchar(500),
	`matchedAlbum` varchar(500),
	`matchedIsrc` varchar(20),
	`matchedUpc` varchar(20),
	`matchConfidence` decimal(5,2),
	`matchedDurationMs` int,
	`matchedOffsetMs` int,
	`rightsHolder` varchar(500),
	`licenseStatus` enum('unknown','licensed','unlicensed','restricted','public_domain') DEFAULT 'unknown',
	`providerResponse` json,
	`actionTaken` enum('none','upload_blocked','upload_flagged','notice_auto_filed') NOT NULL DEFAULT 'none',
	`scannedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fingerprint_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jurisdiction_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jurisdiction` enum('US','EU','UK','CA','AU','WW') NOT NULL,
	`receiptConfirmationSlaHours` int NOT NULL DEFAULT 24,
	`triageSlaHours` int NOT NULL DEFAULT 48,
	`actionSlaHours` int NOT NULL DEFAULT 72,
	`decisionNotificationSlaHours` int NOT NULL DEFAULT 24,
	`counterNoticeWindowDays` int NOT NULL DEFAULT 10,
	`counterNoticeWindowMaxDays` int NOT NULL DEFAULT 14,
	`requiresContentRemoval` boolean NOT NULL DEFAULT true,
	`requiresForwarding` boolean NOT NULL DEFAULT false,
	`requiresRedressInfo` boolean NOT NULL DEFAULT false,
	`requiresAutomationDisclosure` boolean NOT NULL DEFAULT false,
	`requiresTrustedFlaggerSupport` boolean NOT NULL DEFAULT false,
	`legalCitation` varchar(500),
	`designatedAgentRequired` boolean NOT NULL DEFAULT false,
	`designatedAgentInfo` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastReviewedAt` timestamp,
	`lastReviewedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jurisdiction_rules_id` PRIMARY KEY(`id`),
	CONSTRAINT `jurisdiction_rules_jurisdiction_unique` UNIQUE(`jurisdiction`)
);
--> statement-breakpoint
CREATE TABLE `repeat_infringers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`strikeNumber` int NOT NULL,
	`noticeId` int,
	`contentType` enum('track','bop','product','profile','other') NOT NULL,
	`contentId` int,
	`contentUrl` varchar(1000),
	`infringementType` varchar(100) NOT NULL,
	`claimantName` varchar(255),
	`strikeStatus` enum('active','expired','reversed','pardoned') NOT NULL DEFAULT 'active',
	`accountAction` enum('warning','content_removed','upload_restricted','account_suspended','account_terminated'),
	`issuedBy` int,
	`expiresAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repeat_infringers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `takedown_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`noticeId` int NOT NULL,
	`actionType` enum('notice_received','intake_validated','intake_rejected','auto_scan_started','auto_scan_completed','triage_assigned','review_started','content_removed','content_disabled','content_geo_blocked','content_reinstated','account_suspended','account_reinstated','strike_issued','receipt_sent_to_claimant','takedown_notice_sent_to_artist','counter_notice_window_opened','claimant_notified_of_counter','decision_sent_to_claimant','counter_notice_received','appeal_received','appeal_decision_made','notice_withdrawn','notice_resolved','notice_forwarded','admin_note_added','priority_changed','reassigned') NOT NULL,
	`performedBy` int,
	`isAutomated` boolean NOT NULL DEFAULT false,
	`notes` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `takedown_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `takedown_appeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`noticeId` int NOT NULL,
	`filedBy` int NOT NULL,
	`appealType` enum('artist_appeal','claimant_appeal') NOT NULL,
	`appealReason` text NOT NULL,
	`supportingEvidence` text,
	`requestedOutcome` text,
	`status` enum('submitted','under_review','approved','denied','escalated') NOT NULL DEFAULT 'submitted',
	`reviewedBy` int,
	`reviewNotes` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `takedown_appeals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `takedown_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`noticeId` int NOT NULL,
	`evidenceType` enum('screenshot','audio_file','video_file','document','url','fingerprint_report','registration_certificate','other') NOT NULL,
	`fileUrl` varchar(1000),
	`fileKey` varchar(500),
	`fileName` varchar(255),
	`fileMimeType` varchar(100),
	`fileSizeBytes` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `takedown_evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `takedown_notices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` varchar(32) NOT NULL,
	`jurisdiction` enum('US','EU','UK','CA','AU','WW') NOT NULL DEFAULT 'US',
	`legalFramework` enum('DMCA_512','DSA_ART16','CDPA_1988','CA_NOTICE','AU_COPYRIGHT','WIPO_GLOBAL') NOT NULL DEFAULT 'DMCA_512',
	`contentType` enum('track','bop','product','profile','other') NOT NULL,
	`infringingContentUrl` varchar(1000) NOT NULL,
	`infringingContentId` int,
	`additionalUrls` json,
	`claimantName` varchar(255) NOT NULL,
	`claimantEmail` varchar(320) NOT NULL,
	`claimantPhone` varchar(50),
	`claimantAddress` text,
	`claimantCompany` varchar(255),
	`claimantWebsite` varchar(500),
	`claimantIsRightsHolder` boolean NOT NULL DEFAULT true,
	`authorizedAgentFor` varchar(255),
	`copyrightedWorkTitle` varchar(500) NOT NULL,
	`copyrightedWorkDescription` text NOT NULL,
	`copyrightedWorkUrl` varchar(1000),
	`copyrightRegistrationNumber` varchar(100),
	`isrc` varchar(20),
	`upc` varchar(20),
	`infringementDescription` text NOT NULL,
	`infringementType` enum('reproduction','distribution','public_performance','derivative_work','synchronization','cover_song','sampling','trademark','other') NOT NULL,
	`goodFaithStatement` boolean NOT NULL,
	`accuracyStatement` boolean NOT NULL,
	`perjuryStatement` boolean NOT NULL,
	`electronicSignature` varchar(500) NOT NULL,
	`trustedFlaggerId` int,
	`isTrustedFlagger` boolean NOT NULL DEFAULT false,
	`status` enum('submitted','intake_validation','invalid','auto_scan_pending','triage','action_taken','notified','counter_notice_window','counter_notice_received','reinstated','appeal_pending','resolved_upheld','resolved_reversed','withdrawn','forwarded') NOT NULL DEFAULT 'submitted',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`slaDeadline` timestamp,
	`counterNoticeDeadline` timestamp,
	`actionType` enum('content_removed','content_disabled','geo_blocked','account_suspended','notice_forwarded','no_action'),
	`actionTakenAt` timestamp,
	`actionTakenBy` int,
	`actionNotes` text,
	`autoProcessed` boolean NOT NULL DEFAULT false,
	`fingerprintScanId` int,
	`aiConfidenceScore` decimal(5,2),
	`receiptSentAt` timestamp,
	`decisionSentAt` timestamp,
	`claimantNotifiedOfCounterAt` timestamp,
	`assignedTo` int,
	`reviewStartedAt` timestamp,
	`reviewCompletedAt` timestamp,
	`submitterIp` varchar(45),
	`submitterUserAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `takedown_notices_id` PRIMARY KEY(`id`),
	CONSTRAINT `takedown_notices_ticketId_unique` UNIQUE(`ticketId`)
);
--> statement-breakpoint
CREATE TABLE `trusted_flaggers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationName` varchar(255) NOT NULL,
	`organizationType` enum('record_label','pro','publisher','distributor','law_firm','dsa_trusted_flagger','government','other') NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`contactName` varchar(255),
	`website` varchar(500),
	`dsaCertified` boolean NOT NULL DEFAULT false,
	`dsaCertificationDate` timestamp,
	`dsaCertificationBody` varchar(255),
	`trustLevel` enum('standard','elevated','premium') NOT NULL DEFAULT 'standard',
	`isActive` boolean NOT NULL DEFAULT true,
	`verifiedAt` timestamp,
	`verifiedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trusted_flaggers_id` PRIMARY KEY(`id`),
	CONSTRAINT `trusted_flaggers_contactEmail_unique` UNIQUE(`contactEmail`)
);
--> statement-breakpoint
ALTER TABLE `counter_notices` ADD CONSTRAINT `counter_notices_noticeId_takedown_notices_id_fk` FOREIGN KEY (`noticeId`) REFERENCES `takedown_notices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `counter_notices` ADD CONSTRAINT `counter_notices_artistUserId_users_id_fk` FOREIGN KEY (`artistUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fingerprint_scans` ADD CONSTRAINT `fingerprint_scans_uploadedByUserId_users_id_fk` FOREIGN KEY (`uploadedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jurisdiction_rules` ADD CONSTRAINT `jurisdiction_rules_lastReviewedBy_users_id_fk` FOREIGN KEY (`lastReviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repeat_infringers` ADD CONSTRAINT `repeat_infringers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repeat_infringers` ADD CONSTRAINT `repeat_infringers_noticeId_takedown_notices_id_fk` FOREIGN KEY (`noticeId`) REFERENCES `takedown_notices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repeat_infringers` ADD CONSTRAINT `repeat_infringers_issuedBy_users_id_fk` FOREIGN KEY (`issuedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedown_actions` ADD CONSTRAINT `takedown_actions_noticeId_takedown_notices_id_fk` FOREIGN KEY (`noticeId`) REFERENCES `takedown_notices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedown_actions` ADD CONSTRAINT `takedown_actions_performedBy_users_id_fk` FOREIGN KEY (`performedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedown_appeals` ADD CONSTRAINT `takedown_appeals_noticeId_takedown_notices_id_fk` FOREIGN KEY (`noticeId`) REFERENCES `takedown_notices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedown_appeals` ADD CONSTRAINT `takedown_appeals_filedBy_users_id_fk` FOREIGN KEY (`filedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedown_appeals` ADD CONSTRAINT `takedown_appeals_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedown_evidence` ADD CONSTRAINT `takedown_evidence_noticeId_takedown_notices_id_fk` FOREIGN KEY (`noticeId`) REFERENCES `takedown_notices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedown_notices` ADD CONSTRAINT `takedown_notices_trustedFlaggerId_trusted_flaggers_id_fk` FOREIGN KEY (`trustedFlaggerId`) REFERENCES `trusted_flaggers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedown_notices` ADD CONSTRAINT `takedown_notices_actionTakenBy_users_id_fk` FOREIGN KEY (`actionTakenBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedown_notices` ADD CONSTRAINT `takedown_notices_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trusted_flaggers` ADD CONSTRAINT `trusted_flaggers_verifiedBy_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `cn_notice_id_idx` ON `counter_notices` (`noticeId`);--> statement-breakpoint
CREATE INDEX `cn_artist_user_id_idx` ON `counter_notices` (`artistUserId`);--> statement-breakpoint
CREATE INDEX `cn_status_idx` ON `counter_notices` (`status`);--> statement-breakpoint
CREATE INDEX `cn_reinstate_after_idx` ON `counter_notices` (`reinstateAfter`);--> statement-breakpoint
CREATE INDEX `fs_content_type_id_idx` ON `fingerprint_scans` (`contentType`,`contentId`);--> statement-breakpoint
CREATE INDEX `fs_scan_status_idx` ON `fingerprint_scans` (`scanStatus`);--> statement-breakpoint
CREATE INDEX `fs_uploaded_by_idx` ON `fingerprint_scans` (`uploadedByUserId`);--> statement-breakpoint
CREATE INDEX `fs_provider_idx` ON `fingerprint_scans` (`provider`);--> statement-breakpoint
CREATE INDEX `fs_matched_isrc_idx` ON `fingerprint_scans` (`matchedIsrc`);--> statement-breakpoint
CREATE INDEX `ri_user_id_idx` ON `repeat_infringers` (`userId`);--> statement-breakpoint
CREATE INDEX `ri_strike_status_idx` ON `repeat_infringers` (`strikeStatus`);--> statement-breakpoint
CREATE INDEX `ri_user_strike_idx` ON `repeat_infringers` (`userId`,`strikeStatus`);--> statement-breakpoint
CREATE INDEX `ri_notice_id_idx` ON `repeat_infringers` (`noticeId`);--> statement-breakpoint
CREATE INDEX `ri_expires_at_idx` ON `repeat_infringers` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `ta_notice_id_idx` ON `takedown_actions` (`noticeId`);--> statement-breakpoint
CREATE INDEX `ta_action_type_idx` ON `takedown_actions` (`actionType`);--> statement-breakpoint
CREATE INDEX `ta_created_at_idx` ON `takedown_actions` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ta_performed_by_idx` ON `takedown_actions` (`performedBy`);--> statement-breakpoint
CREATE INDEX `tapp_notice_id_idx` ON `takedown_appeals` (`noticeId`);--> statement-breakpoint
CREATE INDEX `tapp_filed_by_idx` ON `takedown_appeals` (`filedBy`);--> statement-breakpoint
CREATE INDEX `tapp_status_idx` ON `takedown_appeals` (`status`);--> statement-breakpoint
CREATE INDEX `te_notice_id_idx` ON `takedown_evidence` (`noticeId`);--> statement-breakpoint
CREATE INDEX `tn_ticket_id_idx` ON `takedown_notices` (`ticketId`);--> statement-breakpoint
CREATE INDEX `tn_status_idx` ON `takedown_notices` (`status`);--> statement-breakpoint
CREATE INDEX `tn_jurisdiction_idx` ON `takedown_notices` (`jurisdiction`);--> statement-breakpoint
CREATE INDEX `tn_claimant_email_idx` ON `takedown_notices` (`claimantEmail`);--> statement-breakpoint
CREATE INDEX `tn_content_type_idx` ON `takedown_notices` (`contentType`);--> statement-breakpoint
CREATE INDEX `tn_priority_status_idx` ON `takedown_notices` (`priority`,`status`);--> statement-breakpoint
CREATE INDEX `tn_sla_deadline_idx` ON `takedown_notices` (`slaDeadline`);--> statement-breakpoint
CREATE INDEX `tn_created_at_idx` ON `takedown_notices` (`createdAt`);--> statement-breakpoint
CREATE INDEX `tn_trusted_flagger_idx` ON `takedown_notices` (`trustedFlaggerId`);--> statement-breakpoint
CREATE INDEX `tn_assigned_to_idx` ON `takedown_notices` (`assignedTo`);--> statement-breakpoint
CREATE INDEX `tf_contact_email_idx` ON `trusted_flaggers` (`contactEmail`);--> statement-breakpoint
CREATE INDEX `tf_org_type_idx` ON `trusted_flaggers` (`organizationType`);--> statement-breakpoint
CREATE INDEX `tf_trust_level_idx` ON `trusted_flaggers` (`trustLevel`);--> statement-breakpoint
CREATE INDEX `tf_is_active_idx` ON `trusted_flaggers` (`isActive`);