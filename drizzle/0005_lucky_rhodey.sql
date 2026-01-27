CREATE TABLE `report_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`frequency` enum('daily','weekly','biweekly','monthly') NOT NULL DEFAULT 'monthly',
	`dayOfWeek` int,
	`dayOfMonth` int,
	`time` varchar(5),
	`reportType` enum('financial','service_orders','payments','all') NOT NULL DEFAULT 'financial',
	`includeCharts` enum('yes','no') NOT NULL DEFAULT 'yes',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`lastSentAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_schedules_id` PRIMARY KEY(`id`)
);
