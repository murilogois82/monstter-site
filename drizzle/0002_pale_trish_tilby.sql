CREATE TABLE `os_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`osId` int NOT NULL,
	`partnerId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`paymentStatus` enum('pending','scheduled','completed') NOT NULL DEFAULT 'pending',
	`paymentDate` datetime,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`role` enum('partner','manager','admin') NOT NULL DEFAULT 'partner',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`osNumber` varchar(50) NOT NULL,
	`status` enum('draft','sent','in_progress','completed','closed') NOT NULL DEFAULT 'draft',
	`partnerId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`serviceType` varchar(255) NOT NULL,
	`startDateTime` datetime NOT NULL,
	`interval` int,
	`endDateTime` datetime,
	`totalHours` decimal(10,2),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `service_orders_osNumber_unique` UNIQUE(`osNumber`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','partner','manager') NOT NULL DEFAULT 'user';