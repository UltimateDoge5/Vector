CREATE TABLE `lessonGroup` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`lessonId` bigint NOT NULL,
	`teacherId` bigint NOT NULL,
	`classId` bigint NOT NULL,
	CONSTRAINT `lessonGroup_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `grade` DROP COLUMN `scheduleId`;