CREATE TABLE `appSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appName` varchar(80) NOT NULL DEFAULT 'Luna Social',
	`tagline` varchar(180) NOT NULL DEFAULT 'Find your people under the same sky.',
	`theme` enum('dark','light','system') NOT NULL DEFAULT 'dark',
	`accentColor` varchar(7) NOT NULL DEFAULT '#a98cff',
	`updatedBy` int,
	CONSTRAINT `appSettings_id` PRIMARY KEY(`id`)
);
