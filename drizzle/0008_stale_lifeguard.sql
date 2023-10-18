ALTER TABLE `exemption` ADD `teacherId` bigint;--> statement-breakpoint
ALTER TABLE `exemption` ADD `lessonId` bigint;--> statement-breakpoint
ALTER TABLE `exemption` ADD `room` varchar(8);--> statement-breakpoint
ALTER TABLE `exemption` ADD `day_od_week` int;--> statement-breakpoint
ALTER TABLE `exemption` ADD `index` int;--> statement-breakpoint
ALTER TABLE `exemption` ADD `type` enum('cancelation','addition','change') NOT NULL;--> statement-breakpoint
ALTER TABLE `exemption` DROP COLUMN `schedule`;