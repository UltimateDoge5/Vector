ALTER TABLE `submission` RENAME COLUMN `file` TO `attachment`;
ALTER TABLE `submission` MODIFY COLUMN `attachment` boolean;
ALTER TABLE `submission` MODIFY COLUMN `attachment` boolean DEFAULT false;
ALTER TABLE `assignment` ADD `file_required` boolean DEFAULT false;
ALTER TABLE `submission` ADD `content` varchar(255);