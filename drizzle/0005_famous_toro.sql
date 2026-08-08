CREATE TABLE `postHides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`postId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postHides_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_post_hide` UNIQUE(`userId`,`postId`)
);
--> statement-breakpoint
CREATE TABLE `postShares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`postId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postShares_id` PRIMARY KEY(`id`)
);
