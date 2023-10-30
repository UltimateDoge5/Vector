CREATE TABLE `announcement` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`json` json,
	CONSTRAINT `announcement_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `presence` MODIFY COLUMN `status` enum('present','absent','late','excused','released','releasedBySchool') NOT NULL;