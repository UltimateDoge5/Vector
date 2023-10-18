ALTER TABLE `exemption` RENAME COLUMN `tableId` TO `scheduleId`;--> statement-breakpoint
ALTER TABLE `exemption` ADD `classId` bigint;