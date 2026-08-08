CREATE TABLE `accountSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`discoverable` boolean NOT NULL DEFAULT true,
	`allowMessages` enum('everyone','followers','none') NOT NULL DEFAULT 'everyone',
	`emailNotifications` boolean NOT NULL DEFAULT true,
	`pushNotifications` boolean NOT NULL DEFAULT true,
	`theme` enum('dark','light','system') NOT NULL DEFAULT 'dark',
	`twoFactorEnabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accountSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountSettings_userId_unique` UNIQUE(`userId`)
);
