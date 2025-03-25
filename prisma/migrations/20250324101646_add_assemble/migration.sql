-- CreateTable
CREATE TABLE `Assemble` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `indicatorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Assemble` ADD CONSTRAINT `Assemble_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assemble` ADD CONSTRAINT `Assemble_indicatorId_fkey` FOREIGN KEY (`indicatorId`) REFERENCES `Indicators`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
