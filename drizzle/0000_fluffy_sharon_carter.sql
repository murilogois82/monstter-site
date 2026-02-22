CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`company` varchar(255),
	`document` varchar(50),
	`address` text,
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(20),
	`paymentType` enum('fixed','hourly') NOT NULL DEFAULT 'hourly',
	`chargedValue` decimal(12,2),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`company` varchar(255),
	`message` text NOT NULL,
	`status` enum('pending','read','replied') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
	`cpf` varchar(14),
	`bankName` varchar(100),
	`bankAccount` varchar(50),
	`bankRoutingNumber` varchar(20),
	`paymentType` enum('fixed','hourly') NOT NULL DEFAULT 'hourly',
	`paidValue` decimal(12,2),
	`role` enum('partner','manager','admin') NOT NULL DEFAULT 'partner',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `service_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`osNumber` varchar(50) NOT NULL,
	`status` enum('draft','sent','in_progress','completed','closed') NOT NULL DEFAULT 'draft',
	`partnerId` int NOT NULL,
	`clientId` int,
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
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64),
	`username` varchar(100),
	`passwordHash` varchar(255),
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','partner','manager') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
