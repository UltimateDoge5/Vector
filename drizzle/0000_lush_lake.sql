CREATE TABLE `assignment` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`classId` bigint NOT NULL,
	`teacherId` bigint NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`due_date` timestamp NOT NULL,
	`creation_date` timestamp DEFAULT (now()),
	CONSTRAINT `assignment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`teacherId` bigint NOT NULL,
	`name` varchar(255),
	CONSTRAINT `class_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exemption` (
	`id` bigint NOT NULL,
	`date` timestamp NOT NULL,
	CONSTRAINT `exemption_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grade` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`studentId` bigint NOT NULL,
	`lessonId` bigint NOT NULL,
	`grade` int NOT NULL,
	`weight` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`description` varchar(255),
	CONSTRAINT `grade_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson` (
	`id` bigint NOT NULL,
	`name` varchar(255),
	CONSTRAINT `lesson_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `presence` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`tableId` bigint NOT NULL,
	`studentId` bigint NOT NULL,
	`date` timestamp NOT NULL,
	`status` enum('present','absent','late','released','releasedBySchool') NOT NULL,
	CONSTRAINT `presence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedule` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`classId` bigint NOT NULL,
	`teacherId` bigint NOT NULL,
	`lessonId` bigint NOT NULL,
	`day_od_week` int NOT NULL,
	`index` int NOT NULL,
	CONSTRAINT `schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` bigint NOT NULL,
	`name` varchar(255),
	`classId` bigint NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone_number` varchar(255) NOT NULL,
	CONSTRAINT `student_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teacher` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` bigint NOT NULL,
	`name` varchar(255),
	`classId` bigint NOT NULL,
	`admin` boolean DEFAULT false,
	CONSTRAINT `teacher_id` PRIMARY KEY(`id`)
);
