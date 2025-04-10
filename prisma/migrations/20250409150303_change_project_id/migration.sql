/*
  Warnings:

  - You are about to alter the column `projectId` on the `Assemble` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `projectId` on the `Owner` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Participating_agencies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `projectId` on the `Participating_agencies` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Assemble` DROP FOREIGN KEY `Assemble_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `Owner` DROP FOREIGN KEY `Owner_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `Participating_agencies` DROP FOREIGN KEY `Participating_agencies_projectId_fkey`;

-- AlterTable
ALTER TABLE `Assemble` MODIFY `projectId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Owner` MODIFY `projectId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Participating_agencies` DROP PRIMARY KEY,
    MODIFY `projectId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`projectId`, `agencyId`);

-- AlterTable
ALTER TABLE `Project` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Owner` ADD CONSTRAINT `Owner_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participating_agencies` ADD CONSTRAINT `Participating_agencies_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assemble` ADD CONSTRAINT `Assemble_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
