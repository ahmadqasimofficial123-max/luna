CREATE TABLE `notificationHides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificationHides_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_notification_hide` UNIQUE(`userId`,`notificationId`)
);
--> statement-breakpoint
CREATE TABLE `notificationMutes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationType` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificationMutes_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_notification_mute` UNIQUE(`userId`,`notificationType`)
);
