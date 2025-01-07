-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NULL,
    `tel` VARCHAR(191) NULL,
    `role` ENUM('PERSONNEL', 'ADMIN') NOT NULL DEFAULT 'PERSONNEL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NOT NULL,
    `date_start_the_project` DATETIME(3) NULL,
    `date_end_the_project` DATETIME(3) NULL,
    `location` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `project_expenses` INTEGER NOT NULL,
    `project_budget` INTEGER NOT NULL,
    `project_owner` VARCHAR(191) NOT NULL,
    `project_status` ENUM('IN_PROGRESS', 'COMPLETED', 'PENDING', 'CANCELED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_project_owner_fkey` FOREIGN KEY (`project_owner`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_type_fkey` FOREIGN KEY (`type`) REFERENCES `ProjectType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
