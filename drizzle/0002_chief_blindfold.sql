ALTER TABLE `teacher` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `teacher` MODIFY COLUMN `classId` bigint;--> statement-breakpoint
ALTER TABLE `student` DROP COLUMN `email`;