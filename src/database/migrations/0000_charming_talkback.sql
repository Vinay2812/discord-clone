CREATE TABLE `DiscordChannel` (
	`id` varchar(32) NOT NULL,
	`name` varchar(255) NOT NULL,
	`DiscordChannelType` enum('TEXT','AUDIO','VIDEO') NOT NULL DEFAULT 'TEXT',
	`profile_id` varchar(32) NOT NULL,
	`server_id` varchar(32) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `DiscordChannel_id` PRIMARY KEY(`id`),
	CONSTRAINT `id_idx` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `DiscordMember` (
	`id` varchar(32) NOT NULL,
	`DiscordMemberRole` enum('ADMIN','MODERATOR','GUEST') NOT NULL DEFAULT 'GUEST',
	`profile_id` varchar(32) NOT NULL,
	`server_id` varchar(32) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `DiscordMember_id` PRIMARY KEY(`id`),
	CONSTRAINT `id_idx` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `DiscordProfile` (
	`id` varchar(32) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`name` text NOT NULL,
	`image_url` text NOT NULL,
	`email` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `DiscordProfile_id` PRIMARY KEY(`id`),
	CONSTRAINT `DiscordProfile_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `id_idx` UNIQUE(`id`),
	CONSTRAINT `user_id_idx` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `DiscordServer` (
	`id` varchar(32) NOT NULL,
	`name` text NOT NULL,
	`image_url` text NOT NULL,
	`invite_code` text NOT NULL,
	`profile_id` varchar(32) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `DiscordServer_id` PRIMARY KEY(`id`),
	CONSTRAINT `id_idx` UNIQUE(`id`)
);
