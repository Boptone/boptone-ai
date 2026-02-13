CREATE TABLE `ai_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`messages` json,
	`context` enum('career_advice','release_strategy','content_ideas','financial_planning','tour_planning','general') NOT NULL,
	`tokensUsed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistProfileId` int NOT NULL,
	`type` enum('release_timing','marketing_strategy','pricing','collaboration','content','career_move','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`reasoning` text NOT NULL,
	`confidenceScore` int NOT NULL,
	`dataSources` json NOT NULL,
	`status` enum('pending','accepted','overridden','dismissed') NOT NULL DEFAULT 'pending',
	`artistResponse` text,
	`respondedAt` timestamp,
	`priority` int NOT NULL DEFAULT 5,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`snapshotDate` timestamp NOT NULL,
	`totalStreams` int,
	`totalFollowers` int,
	`totalRevenue` int,
	`engagementScore` decimal(5,2),
	`careerPhase` enum('discovery','development','launch','scale') NOT NULL,
	`priorityScore` decimal(3,2),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_backing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanUserId` int NOT NULL,
	`artistProfileId` int NOT NULL,
	`monthlyAmount` decimal(10,2) NOT NULL,
	`tier` enum('backer','patron','investor') NOT NULL DEFAULT 'backer',
	`revenueSharePercent` decimal(5,4) DEFAULT '0.0000',
	`status` enum('active','paused','canceled') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`nextBillingDate` timestamp,
	`totalContributed` decimal(12,2) DEFAULT '0.00',
	`stripeSubscriptionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_backing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_dividends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistProfileId` int NOT NULL,
	`year` int NOT NULL,
	`totalEarnings` decimal(12,2) NOT NULL,
	`dividendRate` decimal(5,4) NOT NULL,
	`dividendAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','calculated','paid') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`stripePayoutId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_dividends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistProfileId` int NOT NULL,
	`userId` int NOT NULL,
	`requestedAmount` decimal(10,2) NOT NULL,
	`approvedAmount` decimal(10,2),
	`purpose` enum('emergency','production','marketing','equipment','other') NOT NULL,
	`purposeDescription` text,
	`originationFee` decimal(10,2) DEFAULT '0.00',
	`interestRate` decimal(5,4) DEFAULT '0.0000',
	`repaymentPercent` decimal(5,2) DEFAULT '15.00',
	`status` enum('pending','approved','rejected','active','repaid','defaulted') NOT NULL DEFAULT 'pending',
	`totalOwed` decimal(10,2),
	`totalRepaid` decimal(10,2) DEFAULT '0.00',
	`remainingBalance` decimal(10,2),
	`monthlyEarningsAvg` decimal(10,2),
	`accountAgeMonths` int,
	`riskScore` int,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`approvedAt` timestamp,
	`disbursedAt` timestamp,
	`expectedRepaymentDate` timestamp,
	`actualRepaidAt` timestamp,
	`reviewedBy` int,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_pod_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`providerId` int NOT NULL,
	`apiToken` text NOT NULL,
	`refreshToken` text,
	`tokenExpiresAt` timestamp,
	`providerStoreId` varchar(100),
	`providerAccountId` varchar(100),
	`status` enum('active','disconnected','expired','error') NOT NULL DEFAULT 'active',
	`lastSyncedAt` timestamp,
	`metadata` json,
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`disconnectedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_pod_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stageName` varchar(255) NOT NULL,
	`bio` text,
	`genres` json,
	`location` varchar(255),
	`careerPhase` enum('discovery','development','launch','scale') NOT NULL DEFAULT 'discovery',
	`priorityScore` decimal(3,2) DEFAULT '0.00',
	`verifiedStatus` boolean NOT NULL DEFAULT false,
	`avatarUrl` text,
	`coverImageUrl` text,
	`socialLinks` json,
	`themeColor` varchar(7) DEFAULT '#0066ff',
	`accentColor` varchar(7) DEFAULT '#00d4aa',
	`layoutStyle` enum('default','minimal','grid') DEFAULT 'default',
	`fontFamily` varchar(100) DEFAULT 'Inter',
	`onboardingCompleted` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artist_values` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistProfileId` int NOT NULL,
	`mission` text,
	`nonNegotiables` json,
	`explicitContentAllowed` boolean DEFAULT true,
	`politicalContentAllowed` boolean DEFAULT true,
	`brandDealsAllowed` boolean DEFAULT true,
	`brandDealCategories` json,
	`collaborationOpenness` enum('closed','selective','open') DEFAULT 'selective',
	`preferredGenres` json,
	`aiAutomationLevel` enum('manual','assisted','automated') DEFAULT 'assisted',
	`requireApprovalFor` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artist_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backing_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanUserId` int NOT NULL,
	`artistProfileId` int,
	`type` enum('backing','merch','kickin','tickets','exclusive_content','other') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`artistShare` decimal(10,2) NOT NULL,
	`platformShare` decimal(10,2) NOT NULL,
	`cashbackEligible` boolean NOT NULL DEFAULT true,
	`cashbackAmount` decimal(10,2) DEFAULT '0.00',
	`description` text,
	`stripePaymentId` varchar(255),
	`year` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backing_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_albums` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`artworkUrl` text,
	`albumType` enum('single','ep','album','compilation') NOT NULL,
	`genre` varchar(100),
	`releaseDate` timestamp NOT NULL,
	`trackCount` int NOT NULL DEFAULT 0,
	`totalDuration` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bap_albums_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bap_follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bap_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`amount` int NOT NULL,
	`streamCount` int NOT NULL,
	`stripePayoutId` varchar(255),
	`status` enum('pending','processing','paid','failed') NOT NULL DEFAULT 'pending',
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bap_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`coverImageUrl` text,
	`isPublic` boolean NOT NULL DEFAULT true,
	`isCurated` boolean NOT NULL DEFAULT false,
	`trackIds` json,
	`trackCount` int NOT NULL DEFAULT 0,
	`followerCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bap_playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_reposts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bap_reposts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_streams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`userId` int,
	`durationPlayed` int NOT NULL,
	`completionRate` int NOT NULL,
	`paymentAmount` int NOT NULL DEFAULT 1,
	`artistShare` int NOT NULL DEFAULT 0,
	`platformShare` int NOT NULL DEFAULT 0,
	`source` enum('feed','playlist','artist_page','search','direct') NOT NULL,
	`deviceType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bap_streams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bap_tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`artist` varchar(255) NOT NULL,
	`albumId` int,
	`duration` int NOT NULL,
	`bpm` int,
	`musicalKey` varchar(10),
	`genre` varchar(100),
	`mood` varchar(100),
	`audioUrl` text NOT NULL,
	`waveformUrl` text,
	`artworkUrl` text,
	`fileSize` int,
	`audioFormat` varchar(20) DEFAULT 'mp3',
	`did` varchar(255),
	`contentHash` varchar(128),
	`isrcCode` varchar(12),
	`upcCode` varchar(12),
	`songwriterSplits` json,
	`publishingData` json,
	`aiDisclosure` json,
	`playCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`repostCount` int NOT NULL DEFAULT 0,
	`pricePerStream` int NOT NULL DEFAULT 100,
	`artistShare` int NOT NULL DEFAULT 90,
	`platformFee` int NOT NULL DEFAULT 10,
	`totalEarnings` int NOT NULL DEFAULT 0,
	`status` enum('draft','processing','live','archived') NOT NULL DEFAULT 'draft',
	`isExplicit` boolean NOT NULL DEFAULT false,
	`releasedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bap_tracks_id` PRIMARY KEY(`id`),
	CONSTRAINT `bap_tracks_did_unique` UNIQUE(`did`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`variantId` int,
	`quantity` int NOT NULL DEFAULT 1,
	`priceAtAdd` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashback_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanUserId` int NOT NULL,
	`year` int NOT NULL,
	`totalEligibleSpending` decimal(12,2) NOT NULL,
	`cashbackRate` decimal(5,4) NOT NULL,
	`cashbackAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','calculated','paid','expired') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`stripePayoutId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cashback_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`type` enum('genre','location','career_phase','interest','private') NOT NULL,
	`visibility` enum('public','private','invite_only') NOT NULL DEFAULT 'public',
	`createdBy` int NOT NULL,
	`moderators` json,
	`memberCount` int NOT NULL DEFAULT 0,
	`postCount` int NOT NULL DEFAULT 0,
	`allowPosts` boolean DEFAULT true,
	`requireApproval` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communities_id` PRIMARY KEY(`id`),
	CONSTRAINT `communities_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `discount_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`type` enum('percentage','fixed_amount','free_shipping') NOT NULL,
	`value` int NOT NULL,
	`minPurchaseAmount` int,
	`maxUses` int,
	`maxUsesPerCustomer` int NOT NULL DEFAULT 1,
	`usageCount` int NOT NULL DEFAULT 0,
	`startsAt` timestamp,
	`expiresAt` timestamp,
	`active` boolean NOT NULL DEFAULT true,
	`appliesToAllProducts` boolean NOT NULL DEFAULT true,
	`productIds` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discount_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `discount_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `distribution_platforms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`logoUrl` text,
	`apiEndpoint` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`requiresIsrc` boolean NOT NULL DEFAULT true,
	`requiresUpc` boolean NOT NULL DEFAULT false,
	`supportsPrerelease` boolean NOT NULL DEFAULT true,
	`description` text,
	`websiteUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `distribution_platforms_id` PRIMARY KEY(`id`),
	CONSTRAINT `distribution_platforms_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `distribution_revenue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackDistributionId` int NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`streams` int NOT NULL,
	`grossRevenue` int NOT NULL,
	`platformFee` int NOT NULL,
	`boptoneFee` int NOT NULL,
	`artistRevenue` int NOT NULL,
	`boptoneSharePercent` decimal(5,2) NOT NULL,
	`payoutStatus` enum('pending','processing','paid','failed') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `distribution_revenue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `earnings_balance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`totalEarnings` int NOT NULL DEFAULT 0,
	`availableBalance` int NOT NULL DEFAULT 0,
	`pendingBalance` int NOT NULL DEFAULT 0,
	`withdrawnBalance` int NOT NULL DEFAULT 0,
	`payoutSchedule` enum('daily','weekly','monthly','manual') NOT NULL DEFAULT 'manual',
	`autoPayoutEnabled` boolean NOT NULL DEFAULT false,
	`autoPayoutThreshold` int NOT NULL DEFAULT 2000,
	`isOnHold` boolean NOT NULL DEFAULT false,
	`holdReason` text,
	`holdUntil` timestamp,
	`lastPayoutAt` timestamp,
	`lastPayoutAmount` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `earnings_balance_id` PRIMARY KEY(`id`),
	CONSTRAINT `earnings_balance_artistId_unique` UNIQUE(`artistId`)
);
--> statement-breakpoint
CREATE TABLE `fan_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('basic','member','executive') NOT NULL DEFAULT 'basic',
	`annualFee` decimal(10,2) DEFAULT '0.00',
	`cashbackRate` decimal(5,4) DEFAULT '0.0000',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`renewalDate` timestamp,
	`status` enum('active','expired','canceled') NOT NULL DEFAULT 'active',
	`stripeSubscriptionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fan_memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`communityId` int NOT NULL,
	`authorId` int NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`type` enum('discussion','question','resource','announcement') NOT NULL DEFAULT 'discussion',
	`likeCount` int NOT NULL DEFAULT 0,
	`replyCount` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`isPinned` boolean DEFAULT false,
	`isLocked` boolean DEFAULT false,
	`isDeleted` boolean DEFAULT false,
	`parentPostId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forum_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthcare_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`provider` varchar(255) NOT NULL,
	`planType` varchar(100) NOT NULL,
	`monthlyCost` int NOT NULL,
	`coverageDetails` json,
	`enrollmentDate` timestamp NOT NULL,
	`status` enum('active','pending','cancelled','expired') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthcare_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `infringements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`detectedUrl` text NOT NULL,
	`platform` varchar(100) NOT NULL,
	`confidenceScore` decimal(5,2),
	`status` enum('detected','dmca_sent','resolved','disputed','false_positive') NOT NULL DEFAULT 'detected',
	`dmcaNoticeUrl` text,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `infringements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investor_revenue_share` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backingId` int NOT NULL,
	`fanUserId` int NOT NULL,
	`artistProfileId` int NOT NULL,
	`year` int NOT NULL,
	`artistTotalEarnings` decimal(12,2) NOT NULL,
	`sharePercent` decimal(5,4) NOT NULL,
	`shareAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','calculated','paid') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investor_revenue_share_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loan_repayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loanId` int NOT NULL,
	`artistProfileId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`source` enum('bap_streams','kick_in','backing','merch','manual') NOT NULL,
	`sourceTransactionId` varchar(255),
	`balanceBefore` decimal(10,2) NOT NULL,
	`balanceAfter` decimal(10,2) NOT NULL,
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loan_repayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `micro_loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`amount` int NOT NULL,
	`interestRate` decimal(5,2) NOT NULL,
	`repaymentTermMonths` int NOT NULL,
	`status` enum('pending','approved','active','paid','defaulted','rejected') NOT NULL DEFAULT 'pending',
	`riskScore` decimal(5,2),
	`collateralType` varchar(100) NOT NULL DEFAULT 'future_royalties',
	`approvedAt` timestamp,
	`disbursedAt` timestamp,
	`paidOffAt` timestamp,
	`monthlyPayment` int,
	`remainingBalance` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `micro_loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('milestone','opportunity','financial','system','alert') NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`opportunityType` enum('playlist','collaboration','venue_booking','brand_deal','label_interest','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`source` varchar(255),
	`status` enum('new','contacted','in_progress','accepted','declined','expired') NOT NULL DEFAULT 'new',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`deadline` timestamp,
	`contactInfo` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`variantId` int,
	`productName` varchar(255) NOT NULL,
	`variantName` varchar(255),
	`productType` enum('physical','digital','experience') NOT NULL,
	`sku` varchar(100),
	`quantity` int NOT NULL,
	`pricePerUnit` int NOT NULL,
	`subtotal` int NOT NULL,
	`taxAmount` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`digitalFileUrl` varchar(500),
	`downloadCount` int NOT NULL DEFAULT 0,
	`downloadLimit` int,
	`fulfillmentStatus` enum('unfulfilled','fulfilled','cancelled') NOT NULL DEFAULT 'unfulfilled',
	`fulfilledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`customerId` int NOT NULL,
	`artistId` int NOT NULL,
	`subtotal` int NOT NULL,
	`taxAmount` int NOT NULL DEFAULT 0,
	`shippingAmount` int NOT NULL DEFAULT 0,
	`discountAmount` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`paymentStatus` enum('pending','paid','failed','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`paymentIntentId` varchar(255),
	`paidAt` timestamp,
	`fulfillmentStatus` enum('unfulfilled','partial','fulfilled','cancelled') NOT NULL DEFAULT 'unfulfilled',
	`shippingMethod` varchar(100),
	`trackingNumber` varchar(255),
	`trackingUrl` varchar(500),
	`shippedAt` timestamp,
	`deliveredAt` timestamp,
	`shippingAddress` json,
	`billingAddress` json,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(50),
	`customerNote` text,
	`internalNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`cancelledAt` timestamp,
	`cancellationReason` text,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`type` enum('credit_card','debit_card','apple_pay','venmo','zelle','cryptocurrency','bank_account') NOT NULL,
	`provider` varchar(50),
	`last4` varchar(4),
	`expiryMonth` int,
	`expiryYear` int,
	`brand` varchar(50),
	`cryptoAddress` varchar(255),
	`cryptoNetwork` varchar(50),
	`accountIdentifier` varchar(255),
	`status` enum('active','inactive','expired','failed_verification') NOT NULL DEFAULT 'active',
	`isDefault` boolean NOT NULL DEFAULT false,
	`verified` boolean NOT NULL DEFAULT false,
	`externalId` varchar(255),
	`externalCustomerId` varchar(255),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`stripeChargeId` varchar(255),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'usd',
	`status` enum('succeeded','pending','failed','refunded') NOT NULL,
	`productType` enum('subscription','merchandise','other') NOT NULL,
	`productId` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payout_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`accountHolderName` varchar(255) NOT NULL,
	`accountType` enum('checking','savings') NOT NULL DEFAULT 'checking',
	`routingNumber` varchar(20) NOT NULL,
	`accountNumberLast4` varchar(4) NOT NULL,
	`accountNumberHash` varchar(255) NOT NULL,
	`bankName` varchar(255),
	`verificationStatus` enum('pending','verified','failed') NOT NULL DEFAULT 'pending',
	`verifiedAt` timestamp,
	`verificationMethod` varchar(50),
	`isDefault` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payout_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`payoutAccountId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`payoutType` enum('standard','instant') NOT NULL DEFAULT 'standard',
	`fee` int NOT NULL DEFAULT 0,
	`netAmount` int NOT NULL,
	`status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentProcessor` varchar(50) DEFAULT 'stripe',
	`externalPayoutId` varchar(255),
	`failureReason` text,
	`failureCode` varchar(50),
	`retryCount` int NOT NULL DEFAULT 0,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`scheduledFor` timestamp,
	`processedAt` timestamp,
	`completedAt` timestamp,
	`estimatedArrival` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pod_order_fulfillments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`orderItemId` int NOT NULL,
	`providerId` int NOT NULL,
	`artistPodAccountId` int NOT NULL,
	`providerOrderId` varchar(100) NOT NULL,
	`providerOrderNumber` varchar(100),
	`status` enum('pending','submitted','confirmed','printing','shipped','delivered','cancelled','failed') NOT NULL DEFAULT 'pending',
	`trackingNumber` varchar(100),
	`trackingUrl` varchar(500),
	`carrier` varchar(50),
	`providerCost` int NOT NULL,
	`shippingCost` int NOT NULL DEFAULT 0,
	`taxAmount` int NOT NULL DEFAULT 0,
	`totalCost` int NOT NULL,
	`submittedAt` timestamp,
	`confirmedAt` timestamp,
	`printingStartedAt` timestamp,
	`shippedAt` timestamp,
	`deliveredAt` timestamp,
	`cancelledAt` timestamp,
	`errorMessage` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`lastRetryAt` timestamp,
	`providerResponse` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pod_order_fulfillments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pod_product_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`providerId` int NOT NULL,
	`artistPodAccountId` int NOT NULL,
	`providerProductId` varchar(100) NOT NULL,
	`providerVariantId` varchar(100) NOT NULL,
	`providerSku` varchar(100),
	`wholesaleCost` int NOT NULL,
	`shippingCost` int NOT NULL DEFAULT 0,
	`designFileUrl` varchar(500),
	`designPlacement` varchar(50),
	`mockupUrls` json,
	`syncEnabled` boolean NOT NULL DEFAULT true,
	`autoFulfill` boolean NOT NULL DEFAULT true,
	`providerMetadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pod_product_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pod_providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`apiBaseUrl` varchar(255) NOT NULL,
	`webhookSecret` varchar(255),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pod_providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `pod_providers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `pod_webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`providerOrderId` varchar(100),
	`payload` json NOT NULL,
	`processed` boolean NOT NULL DEFAULT false,
	`processedAt` timestamp,
	`processingError` text,
	`requestId` varchar(100),
	`signature` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pod_webhook_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`rating` int NOT NULL,
	`title` varchar(255),
	`content` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`helpfulCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(100),
	`price` int,
	`compareAtPrice` int,
	`option1` varchar(100),
	`option2` varchar(100),
	`option3` varchar(100),
	`inventoryQuantity` int NOT NULL DEFAULT 0,
	`imageUrl` varchar(500),
	`available` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`type` enum('physical','digital','experience') NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`compareAtPrice` int,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`sku` varchar(100),
	`inventoryQuantity` int NOT NULL DEFAULT 0,
	`trackInventory` boolean NOT NULL DEFAULT true,
	`allowBackorder` boolean NOT NULL DEFAULT false,
	`digitalFileUrl` varchar(500),
	`digitalFileSize` int,
	`downloadLimit` int,
	`eventDate` timestamp,
	`eventLocation` varchar(255),
	`maxAttendees` int,
	`images` json,
	`primaryImageUrl` varchar(500),
	`slug` varchar(255) NOT NULL,
	`tags` json,
	`category` varchar(100),
	`requiresShipping` boolean NOT NULL DEFAULT false,
	`weight` decimal(8,2),
	`weightUnit` varchar(10) DEFAULT 'lb',
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `releases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`releaseType` enum('single','ep','album','compilation') NOT NULL,
	`releaseDate` timestamp NOT NULL,
	`platforms` json,
	`upcCode` varchar(20),
	`isrcCodes` json,
	`artworkUrl` text,
	`status` enum('draft','scheduled','released','cancelled') NOT NULL DEFAULT 'draft',
	`totalTracks` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `releases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revenue_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`source` enum('streaming','merchandise','shows','licensing','brand_deals','youtube_ads','patreon','other') NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`description` text,
	`status` enum('pending','paid','disputed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revenue_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shipping_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`freeShippingThreshold` int,
	`minOrderAmount` int,
	`maxOrderAmount` int,
	`countries` json,
	`minDeliveryDays` int,
	`maxDeliveryDays` int,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipping_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_media_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`platform` enum('instagram','tiktok','twitter','youtube','facebook') NOT NULL,
	`followers` int NOT NULL,
	`engagementRate` decimal(5,2),
	`viralScore` decimal(5,2),
	`totalPosts` int,
	`averageLikes` int,
	`averageComments` int,
	`averageShares` int,
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_media_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streaming_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`platform` enum('spotify','apple_music','youtube_music','amazon_music','tidal','soundcloud') NOT NULL,
	`metricType` enum('streams','followers','monthly_listeners','saves','playlist_adds') NOT NULL,
	`value` int NOT NULL,
	`growthRate` decimal(5,2),
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `streaming_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_changes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriptionId` int NOT NULL,
	`fromPlan` enum('free','pro','enterprise') NOT NULL,
	`toPlan` enum('free','pro','enterprise') NOT NULL,
	`fromBillingCycle` enum('monthly','annual') NOT NULL,
	`toBillingCycle` enum('monthly','annual') NOT NULL,
	`proratedCredit` decimal(10,2) DEFAULT '0.00',
	`effectiveDate` timestamp NOT NULL,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_changes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`stripePriceId` varchar(255),
	`tier` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`plan` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`billingCycle` enum('monthly','annual') NOT NULL DEFAULT 'monthly',
	`status` enum('active','canceled','past_due','trialing','incomplete') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`trialEndsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` int NOT NULL,
	`fromUserId` int NOT NULL,
	`toArtistId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`message` text,
	`isAnonymous` boolean NOT NULL DEFAULT false,
	`paymentMethodId` int,
	`paymentType` varchar(50) NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`platformFee` int NOT NULL DEFAULT 0,
	`processingFee` int NOT NULL DEFAULT 0,
	`netAmount` int NOT NULL,
	`completedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tips_id` PRIMARY KEY(`id`),
	CONSTRAINT `tips_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `tours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`tourName` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`venues` json,
	`budget` int,
	`revenueProjection` int,
	`actualRevenue` int,
	`status` enum('planning','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'planning',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tours_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `track_distributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`platformId` int NOT NULL,
	`status` enum('pending','processing','live','failed','takedown') NOT NULL DEFAULT 'pending',
	`platformTrackId` varchar(255),
	`platformUrl` text,
	`releaseDate` timestamp,
	`publishedAt` timestamp,
	`totalStreams` int NOT NULL DEFAULT 0,
	`totalEarnings` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`lastAttemptAt` timestamp,
	`distributionMetadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `track_distributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`type` enum('payment','tip','withdrawal','refund','payout','fee','adjustment') NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('pending','processing','completed','failed','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethodId` int,
	`fromUserId` int,
	`toUserId` int,
	`orderId` int,
	`platformFee` int NOT NULL DEFAULT 0,
	`processingFee` int NOT NULL DEFAULT 0,
	`netAmount` int NOT NULL,
	`description` text,
	`internalNotes` text,
	`externalId` varchar(255),
	`externalStatus` varchar(50),
	`processedAt` timestamp,
	`completedAt` timestamp,
	`failedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('artist','manager','admin') NOT NULL DEFAULT 'artist',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`pendingBalance` int NOT NULL DEFAULT 0,
	`lifetimeEarnings` int NOT NULL DEFAULT 0,
	`status` enum('active','suspended','closed') NOT NULL DEFAULT 'active',
	`verificationStatus` enum('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallets_artistId_unique` UNIQUE(`artistId`)
);
--> statement-breakpoint
CREATE TABLE `workflow_execution_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`executionId` int NOT NULL,
	`nodeId` varchar(50) NOT NULL,
	`nodeType` varchar(50) NOT NULL,
	`nodeSubtype` varchar(50) NOT NULL,
	`status` enum('success','failed','skipped') NOT NULL,
	`input` json,
	`output` json,
	`errorMessage` text,
	`errorStack` text,
	`executedAt` timestamp NOT NULL,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_execution_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`status` enum('pending','running','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`triggeredBy` enum('webhook','schedule','event','manual','ai') NOT NULL,
	`triggerData` json,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`duration` int,
	`errorMessage` text,
	`errorCode` varchar(50),
	`retryCount` int NOT NULL DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`version` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`definition` json NOT NULL,
	`status` varchar(50) NOT NULL,
	`changeDescription` text,
	`changedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` enum('fan_engagement','release_automation','revenue_tracking','marketing','collaboration','custom') NOT NULL,
	`definition` json NOT NULL,
	`tags` json,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`isOfficial` boolean NOT NULL DEFAULT false,
	`createdBy` varchar(255),
	`usageCount` int NOT NULL DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0.00',
	`ratingCount` int NOT NULL DEFAULT 0,
	`thumbnailUrl` text,
	`demoVideoUrl` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflow_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_triggers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`type` enum('webhook','schedule','event','manual') NOT NULL,
	`config` json NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`triggerCount` int NOT NULL DEFAULT 0,
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflow_triggers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`artistId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','paused','draft') NOT NULL DEFAULT 'draft',
	`definition` json NOT NULL,
	`category` enum('fan_engagement','release_automation','revenue_tracking','marketing','collaboration','custom') NOT NULL,
	`tags` json,
	`isTemplate` boolean NOT NULL DEFAULT false,
	`templateSourceId` int,
	`version` int NOT NULL DEFAULT 1,
	`totalRuns` int NOT NULL DEFAULT 0,
	`successfulRuns` int NOT NULL DEFAULT 0,
	`failedRuns` int NOT NULL DEFAULT 0,
	`lastRunAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `writer_earnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`writerProfileId` int NOT NULL,
	`trackId` int NOT NULL,
	`splitPercentage` decimal(5,2) NOT NULL,
	`totalEarned` int NOT NULL DEFAULT 0,
	`pendingPayout` int NOT NULL DEFAULT 0,
	`totalPaidOut` int NOT NULL DEFAULT 0,
	`lastPayoutAt` timestamp,
	`lastPayoutAmount` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `writer_earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `writer_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`invitedByArtistId` int NOT NULL,
	`trackId` int,
	`splitPercentage` decimal(5,2) NOT NULL,
	`inviteToken` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`status` enum('pending','accepted','expired','cancelled') NOT NULL DEFAULT 'pending',
	`acceptedAt` timestamp,
	`writerProfileId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `writer_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `writer_invitations_inviteToken_unique` UNIQUE(`inviteToken`)
);
--> statement-breakpoint
CREATE TABLE `writer_payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`writerProfileId` int NOT NULL,
	`type` enum('bank_account','paypal','venmo','zelle','crypto') NOT NULL,
	`bankName` varchar(255),
	`bankAccountType` enum('checking','savings'),
	`bankRoutingNumber` varchar(20),
	`bankAccountNumber` varchar(50),
	`paypalEmail` varchar(320),
	`venmoHandle` varchar(100),
	`zelleEmail` varchar(320),
	`cryptoWalletAddress` varchar(255),
	`cryptoCurrency` varchar(20),
	`isVerified` boolean NOT NULL DEFAULT false,
	`verifiedAt` timestamp,
	`isDefault` boolean NOT NULL DEFAULT false,
	`status` enum('pending','active','failed','disabled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `writer_payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `writer_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`writerProfileId` int NOT NULL,
	`paymentMethodId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`trackIds` json,
	`status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentProcessor` varchar(50),
	`externalPaymentId` varchar(255),
	`failureReason` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`scheduledFor` timestamp,
	`processedAt` timestamp,
	`completedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `writer_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `writer_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`ipiNumber` varchar(20),
	`proAffiliation` varchar(100),
	`taxCountry` varchar(2),
	`taxId` varchar(50),
	`taxFormType` enum('w9','w8ben','none') DEFAULT 'none',
	`taxFormUrl` text,
	`taxFormSubmittedAt` timestamp,
	`status` enum('invited','pending_verification','active','suspended') NOT NULL DEFAULT 'invited',
	`verifiedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `writer_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `writer_profiles_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_recommendations` ADD CONSTRAINT `ai_recommendations_artistProfileId_artist_profiles_id_fk` FOREIGN KEY (`artistProfileId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_snapshots` ADD CONSTRAINT `analytics_snapshots_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_backing` ADD CONSTRAINT `artist_backing_fanUserId_users_id_fk` FOREIGN KEY (`fanUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_backing` ADD CONSTRAINT `artist_backing_artistProfileId_artist_profiles_id_fk` FOREIGN KEY (`artistProfileId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_dividends` ADD CONSTRAINT `artist_dividends_artistProfileId_artist_profiles_id_fk` FOREIGN KEY (`artistProfileId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_loans` ADD CONSTRAINT `artist_loans_artistProfileId_artist_profiles_id_fk` FOREIGN KEY (`artistProfileId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_loans` ADD CONSTRAINT `artist_loans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_loans` ADD CONSTRAINT `artist_loans_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_pod_accounts` ADD CONSTRAINT `artist_pod_accounts_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_pod_accounts` ADD CONSTRAINT `artist_pod_accounts_providerId_pod_providers_id_fk` FOREIGN KEY (`providerId`) REFERENCES `pod_providers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_profiles` ADD CONSTRAINT `artist_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `artist_values` ADD CONSTRAINT `artist_values_artistProfileId_artist_profiles_id_fk` FOREIGN KEY (`artistProfileId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `backing_transactions` ADD CONSTRAINT `backing_transactions_fanUserId_users_id_fk` FOREIGN KEY (`fanUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `backing_transactions` ADD CONSTRAINT `backing_transactions_artistProfileId_artist_profiles_id_fk` FOREIGN KEY (`artistProfileId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_albums` ADD CONSTRAINT `bap_albums_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_follows` ADD CONSTRAINT `bap_follows_followerId_users_id_fk` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_follows` ADD CONSTRAINT `bap_follows_followingId_users_id_fk` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_likes` ADD CONSTRAINT `bap_likes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_likes` ADD CONSTRAINT `bap_likes_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_payments` ADD CONSTRAINT `bap_payments_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_playlists` ADD CONSTRAINT `bap_playlists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_reposts` ADD CONSTRAINT `bap_reposts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_reposts` ADD CONSTRAINT `bap_reposts_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_streams` ADD CONSTRAINT `bap_streams_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_streams` ADD CONSTRAINT `bap_streams_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_tracks` ADD CONSTRAINT `bap_tracks_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bap_tracks` ADD CONSTRAINT `bap_tracks_albumId_bap_albums_id_fk` FOREIGN KEY (`albumId`) REFERENCES `bap_albums`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_variantId_product_variants_id_fk` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cashback_rewards` ADD CONSTRAINT `cashback_rewards_fanUserId_users_id_fk` FOREIGN KEY (`fanUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `communities` ADD CONSTRAINT `communities_createdBy_artist_profiles_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discount_codes` ADD CONSTRAINT `discount_codes_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `distribution_revenue` ADD CONSTRAINT `distribution_revenue_trackDistributionId_track_distributions_id_fk` FOREIGN KEY (`trackDistributionId`) REFERENCES `track_distributions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `earnings_balance` ADD CONSTRAINT `earnings_balance_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fan_memberships` ADD CONSTRAINT `fan_memberships_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forum_posts` ADD CONSTRAINT `forum_posts_communityId_communities_id_fk` FOREIGN KEY (`communityId`) REFERENCES `communities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forum_posts` ADD CONSTRAINT `forum_posts_authorId_artist_profiles_id_fk` FOREIGN KEY (`authorId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthcare_plans` ADD CONSTRAINT `healthcare_plans_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `infringements` ADD CONSTRAINT `infringements_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `investor_revenue_share` ADD CONSTRAINT `investor_revenue_share_backingId_artist_backing_id_fk` FOREIGN KEY (`backingId`) REFERENCES `artist_backing`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `investor_revenue_share` ADD CONSTRAINT `investor_revenue_share_fanUserId_users_id_fk` FOREIGN KEY (`fanUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `investor_revenue_share` ADD CONSTRAINT `investor_revenue_share_artistProfileId_artist_profiles_id_fk` FOREIGN KEY (`artistProfileId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `loan_repayments` ADD CONSTRAINT `loan_repayments_loanId_artist_loans_id_fk` FOREIGN KEY (`loanId`) REFERENCES `artist_loans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `loan_repayments` ADD CONSTRAINT `loan_repayments_artistProfileId_artist_profiles_id_fk` FOREIGN KEY (`artistProfileId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `micro_loans` ADD CONSTRAINT `micro_loans_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `opportunities` ADD CONSTRAINT `opportunities_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variantId_product_variants_id_fk` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_methods` ADD CONSTRAINT `payment_methods_walletId_wallets_id_fk` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payout_accounts` ADD CONSTRAINT `payout_accounts_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payouts` ADD CONSTRAINT `payouts_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payouts` ADD CONSTRAINT `payouts_payoutAccountId_payout_accounts_id_fk` FOREIGN KEY (`payoutAccountId`) REFERENCES `payout_accounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pod_order_fulfillments` ADD CONSTRAINT `pod_order_fulfillments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pod_order_fulfillments` ADD CONSTRAINT `pod_order_fulfillments_orderItemId_order_items_id_fk` FOREIGN KEY (`orderItemId`) REFERENCES `order_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pod_order_fulfillments` ADD CONSTRAINT `pod_order_fulfillments_providerId_pod_providers_id_fk` FOREIGN KEY (`providerId`) REFERENCES `pod_providers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pod_order_fulfillments` ADD CONSTRAINT `pod_order_fulfillments_artistPodAccountId_artist_pod_accounts_id_fk` FOREIGN KEY (`artistPodAccountId`) REFERENCES `artist_pod_accounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pod_product_mappings` ADD CONSTRAINT `pod_product_mappings_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pod_product_mappings` ADD CONSTRAINT `pod_product_mappings_providerId_pod_providers_id_fk` FOREIGN KEY (`providerId`) REFERENCES `pod_providers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pod_product_mappings` ADD CONSTRAINT `pod_product_mappings_artistPodAccountId_artist_pod_accounts_id_fk` FOREIGN KEY (`artistPodAccountId`) REFERENCES `artist_pod_accounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pod_webhook_events` ADD CONSTRAINT `pod_webhook_events_providerId_pod_providers_id_fk` FOREIGN KEY (`providerId`) REFERENCES `pod_providers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `releases` ADD CONSTRAINT `releases_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revenue_records` ADD CONSTRAINT `revenue_records_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipping_rates` ADD CONSTRAINT `shipping_rates_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `social_media_metrics` ADD CONSTRAINT `social_media_metrics_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streaming_metrics` ADD CONSTRAINT `streaming_metrics_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription_changes` ADD CONSTRAINT `subscription_changes_subscriptionId_subscriptions_id_fk` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tips` ADD CONSTRAINT `tips_transactionId_transactions_id_fk` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tips` ADD CONSTRAINT `tips_fromUserId_users_id_fk` FOREIGN KEY (`fromUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tips` ADD CONSTRAINT `tips_toArtistId_artist_profiles_id_fk` FOREIGN KEY (`toArtistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tips` ADD CONSTRAINT `tips_paymentMethodId_payment_methods_id_fk` FOREIGN KEY (`paymentMethodId`) REFERENCES `payment_methods`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tours` ADD CONSTRAINT `tours_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `track_distributions` ADD CONSTRAINT `track_distributions_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `track_distributions` ADD CONSTRAINT `track_distributions_platformId_distribution_platforms_id_fk` FOREIGN KEY (`platformId`) REFERENCES `distribution_platforms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_walletId_wallets_id_fk` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_paymentMethodId_payment_methods_id_fk` FOREIGN KEY (`paymentMethodId`) REFERENCES `payment_methods`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_fromUserId_users_id_fk` FOREIGN KEY (`fromUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_toUserId_users_id_fk` FOREIGN KEY (`toUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_execution_logs` ADD CONSTRAINT `workflow_execution_logs_executionId_workflow_executions_id_fk` FOREIGN KEY (`executionId`) REFERENCES `workflow_executions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_executions` ADD CONSTRAINT `workflow_executions_workflowId_workflows_id_fk` FOREIGN KEY (`workflowId`) REFERENCES `workflows`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_history` ADD CONSTRAINT `workflow_history_workflowId_workflows_id_fk` FOREIGN KEY (`workflowId`) REFERENCES `workflows`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_triggers` ADD CONSTRAINT `workflow_triggers_workflowId_workflows_id_fk` FOREIGN KEY (`workflowId`) REFERENCES `workflows`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflows` ADD CONSTRAINT `workflows_artistId_artist_profiles_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writer_earnings` ADD CONSTRAINT `writer_earnings_writerProfileId_writer_profiles_id_fk` FOREIGN KEY (`writerProfileId`) REFERENCES `writer_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writer_earnings` ADD CONSTRAINT `writer_earnings_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writer_invitations` ADD CONSTRAINT `writer_invitations_invitedByArtistId_artist_profiles_id_fk` FOREIGN KEY (`invitedByArtistId`) REFERENCES `artist_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writer_invitations` ADD CONSTRAINT `writer_invitations_trackId_bap_tracks_id_fk` FOREIGN KEY (`trackId`) REFERENCES `bap_tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writer_invitations` ADD CONSTRAINT `writer_invitations_writerProfileId_writer_profiles_id_fk` FOREIGN KEY (`writerProfileId`) REFERENCES `writer_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writer_payment_methods` ADD CONSTRAINT `writer_payment_methods_writerProfileId_writer_profiles_id_fk` FOREIGN KEY (`writerProfileId`) REFERENCES `writer_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writer_payouts` ADD CONSTRAINT `writer_payouts_writerProfileId_writer_profiles_id_fk` FOREIGN KEY (`writerProfileId`) REFERENCES `writer_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writer_payouts` ADD CONSTRAINT `writer_payouts_paymentMethodId_writer_payment_methods_id_fk` FOREIGN KEY (`paymentMethodId`) REFERENCES `writer_payment_methods`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writer_profiles` ADD CONSTRAINT `writer_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `ai_conversations` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_date_idx` ON `analytics_snapshots` (`artistId`,`snapshotDate`);--> statement-breakpoint
CREATE INDEX `artist_provider_idx` ON `artist_pod_accounts` (`artistId`,`providerId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `artist_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `bap_albums` (`artistId`);--> statement-breakpoint
CREATE INDEX `follower_idx` ON `bap_follows` (`followerId`);--> statement-breakpoint
CREATE INDEX `following_idx` ON `bap_follows` (`followingId`);--> statement-breakpoint
CREATE INDEX `unique_follow` ON `bap_follows` (`followerId`,`followingId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `bap_likes` (`userId`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `bap_likes` (`trackId`);--> statement-breakpoint
CREATE INDEX `unique_like` ON `bap_likes` (`userId`,`trackId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `bap_payments` (`artistId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `bap_payments` (`status`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `bap_playlists` (`userId`);--> statement-breakpoint
CREATE INDEX `is_curated_idx` ON `bap_playlists` (`isCurated`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `bap_reposts` (`userId`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `bap_reposts` (`trackId`);--> statement-breakpoint
CREATE INDEX `unique_repost` ON `bap_reposts` (`userId`,`trackId`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `bap_streams` (`trackId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `bap_streams` (`userId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `bap_streams` (`createdAt`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `bap_tracks` (`artistId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `bap_tracks` (`status`);--> statement-breakpoint
CREATE INDEX `released_at_idx` ON `bap_tracks` (`releasedAt`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `cart_items` (`userId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `discount_codes` (`artistId`);--> statement-breakpoint
CREATE INDEX `code_idx` ON `discount_codes` (`code`);--> statement-breakpoint
CREATE INDEX `track_distribution_id_idx` ON `distribution_revenue` (`trackDistributionId`);--> statement-breakpoint
CREATE INDEX `period_idx` ON `distribution_revenue` (`periodStart`,`periodEnd`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `earnings_balance` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `healthcare_plans` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `infringements` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `micro_loans` (`artistId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `opportunities` (`artistId`);--> statement-breakpoint
CREATE INDEX `order_id_idx` ON `order_items` (`orderId`);--> statement-breakpoint
CREATE INDEX `customer_id_idx` ON `orders` (`customerId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `orders` (`artistId`);--> statement-breakpoint
CREATE INDEX `order_number_idx` ON `orders` (`orderNumber`);--> statement-breakpoint
CREATE INDEX `payment_status_idx` ON `orders` (`paymentStatus`);--> statement-breakpoint
CREATE INDEX `fulfillment_status_idx` ON `orders` (`fulfillmentStatus`);--> statement-breakpoint
CREATE INDEX `wallet_id_idx` ON `payment_methods` (`walletId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `payment_methods` (`type`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `payments` (`userId`);--> statement-breakpoint
CREATE INDEX `stripe_payment_intent_idx` ON `payments` (`stripePaymentIntentId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `payout_accounts` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `payouts` (`artistId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `payouts` (`status`);--> statement-breakpoint
CREATE INDEX `requested_at_idx` ON `payouts` (`requestedAt`);--> statement-breakpoint
CREATE INDEX `order_id_idx` ON `pod_order_fulfillments` (`orderId`);--> statement-breakpoint
CREATE INDEX `provider_order_idx` ON `pod_order_fulfillments` (`providerId`,`providerOrderId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `pod_order_fulfillments` (`status`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `pod_product_mappings` (`productId`);--> statement-breakpoint
CREATE INDEX `provider_product_idx` ON `pod_product_mappings` (`providerId`,`providerProductId`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `pod_webhook_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `provider_order_idx` ON `pod_webhook_events` (`providerOrderId`);--> statement-breakpoint
CREATE INDEX `processed_idx` ON `pod_webhook_events` (`processed`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `product_reviews` (`productId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `product_reviews` (`userId`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `product_variants` (`productId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `products` (`artistId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `products` (`type`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `releases` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `revenue_records` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `shipping_rates` (`artistId`);--> statement-breakpoint
CREATE INDEX `artist_date_idx` ON `social_media_metrics` (`artistId`,`date`);--> statement-breakpoint
CREATE INDEX `artist_date_idx` ON `streaming_metrics` (`artistId`,`date`);--> statement-breakpoint
CREATE INDEX `subscription_change_subscriptionId_idx` ON `subscription_changes` (`subscriptionId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `stripe_customer_idx` ON `subscriptions` (`stripeCustomerId`);--> statement-breakpoint
CREATE INDEX `from_user_idx` ON `tips` (`fromUserId`);--> statement-breakpoint
CREATE INDEX `to_artist_idx` ON `tips` (`toArtistId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tips` (`status`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `tours` (`artistId`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `track_distributions` (`trackId`);--> statement-breakpoint
CREATE INDEX `platform_id_idx` ON `track_distributions` (`platformId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `track_distributions` (`status`);--> statement-breakpoint
CREATE INDEX `unique_track_platform` ON `track_distributions` (`trackId`,`platformId`);--> statement-breakpoint
CREATE INDEX `wallet_id_idx` ON `transactions` (`walletId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `transactions` (`type`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `transactions` (`status`);--> statement-breakpoint
CREATE INDEX `from_user_idx` ON `transactions` (`fromUserId`);--> statement-breakpoint
CREATE INDEX `to_user_idx` ON `transactions` (`toUserId`);--> statement-breakpoint
CREATE INDEX `artist_id_idx` ON `wallets` (`artistId`);--> statement-breakpoint
CREATE INDEX `writer_track_idx` ON `writer_earnings` (`writerProfileId`,`trackId`);--> statement-breakpoint
CREATE INDEX `writer_profile_idx` ON `writer_earnings` (`writerProfileId`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `writer_earnings` (`trackId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `writer_invitations` (`email`);--> statement-breakpoint
CREATE INDEX `invite_token_idx` ON `writer_invitations` (`inviteToken`);--> statement-breakpoint
CREATE INDEX `track_id_idx` ON `writer_invitations` (`trackId`);--> statement-breakpoint
CREATE INDEX `writer_profile_idx` ON `writer_payment_methods` (`writerProfileId`);--> statement-breakpoint
CREATE INDEX `writer_profile_idx` ON `writer_payouts` (`writerProfileId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `writer_payouts` (`status`);--> statement-breakpoint
CREATE INDEX `scheduled_for_idx` ON `writer_payouts` (`scheduledFor`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `writer_profiles` (`email`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `writer_profiles` (`userId`);