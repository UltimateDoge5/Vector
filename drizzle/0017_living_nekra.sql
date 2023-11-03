CREATE TABLE `sentAssignment` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`assignmentId` bigint NOT NULL,
	`studentId` bigint NOT NULL,
	CONSTRAINT `sentAssignment_id` PRIMARY KEY(`id`)
);

ALTER TABLE `assignment` ADD `allow_late` boolean DEFAULT false;