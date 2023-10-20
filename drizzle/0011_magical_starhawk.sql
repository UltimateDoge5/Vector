ALTER TABLE `class` ADD CONSTRAINT `class_teacherId_unique` UNIQUE(`teacherId`);--> statement-breakpoint
ALTER TABLE `teacher` ADD CONSTRAINT `teacher_classId_unique` UNIQUE(`classId`);