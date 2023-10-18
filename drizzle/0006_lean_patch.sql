ALTER TABLE `exemption` MODIFY COLUMN `id` bigint AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `exemption` ADD `tableId` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `exemption` ADD `schedule` json;