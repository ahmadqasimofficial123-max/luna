CREATE TABLE `messageReactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`userId` int NOT NULL,
	`reaction` varchar(16) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messageReactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_message_reaction` UNIQUE(`messageId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `messageReads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`userId` int NOT NULL,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messageReads_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_message_read` UNIQUE(`messageId`,`userId`)
);
