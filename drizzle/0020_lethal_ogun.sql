ALTER TABLE `submission` MODIFY COLUMN `sent_at` timestamp NOT NULL DEFAULT (now());
ALTER TABLE `submission` MODIFY COLUMN `attachment` varchar(255);
ALTER TABLE `submission` ADD `graded` boolean DEFAULT false;