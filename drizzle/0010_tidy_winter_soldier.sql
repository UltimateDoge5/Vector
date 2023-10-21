ALTER TABLE `exemption` MODIFY COLUMN `teacherId` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `presence` MODIFY COLUMN `tableId` bigint;--> statement-breakpoint
ALTER TABLE `presence` ADD `exemptionId` bigint;