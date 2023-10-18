ALTER TABLE `exemption` MODIFY COLUMN `tableId` bigint;--> statement-breakpoint
ALTER TABLE `exemption` ADD `reason` varchar(255);