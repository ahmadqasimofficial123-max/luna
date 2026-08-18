CREATE TABLE `notificationActions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationId` int NOT NULL,
	`action` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationActions_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_notification_action` UNIQUE(`userId`,`notificationId`)
);
