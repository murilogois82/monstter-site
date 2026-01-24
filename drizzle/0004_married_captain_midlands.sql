ALTER TABLE `clients` ADD `paymentType` enum('fixed','hourly') DEFAULT 'hourly' NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `chargedValue` decimal(12,2);--> statement-breakpoint
ALTER TABLE `partners` ADD `paymentType` enum('fixed','hourly') DEFAULT 'hourly' NOT NULL;--> statement-breakpoint
ALTER TABLE `partners` ADD `paidValue` decimal(12,2);--> statement-breakpoint
ALTER TABLE `partners` ADD `status` enum('active','inactive') DEFAULT 'active' NOT NULL;