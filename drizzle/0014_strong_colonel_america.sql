CREATE TABLE `gradeDefinition` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`lessonId` bigint NOT NULL,
	`name` varchar(255),
	`weight` int NOT NULL,
	CONSTRAINT `gradeDefinition_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `grade` ADD `definitionId` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `lessonGroup` ADD CONSTRAINT `lessonGroup_lessonId_lesson_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lesson`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lessonGroup` ADD CONSTRAINT `lessonGroup_teacherId_teacher_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `teacher`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lessonGroup` ADD CONSTRAINT `lessonGroup_classId_class_id_fk` FOREIGN KEY (`classId`) REFERENCES `class`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grade` DROP COLUMN `lessonId`;--> statement-breakpoint
ALTER TABLE `grade` DROP COLUMN `weight`;