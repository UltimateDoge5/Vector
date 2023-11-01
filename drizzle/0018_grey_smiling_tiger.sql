RENAME TABLE `sentAssignment` TO `submission`;--> statement-breakpoint
ALTER TABLE `submission` ADD `sent_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `submission` ADD `file` varchar(255) NOT NULL;