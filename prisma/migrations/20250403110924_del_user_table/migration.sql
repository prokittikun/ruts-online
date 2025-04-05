/*
  Warnings:

  - The primary key for the `Personnel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Personnel` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Personnel` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `project_owner` on the `Project` table. All the data in the column will be lost.
  - You are about to alter the column `personnelId` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `Personnel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Project` DROP FOREIGN KEY `Project_personnelId_fkey`;

-- DropForeignKey
ALTER TABLE `Project` DROP FOREIGN KEY `Project_project_owner_fkey`;

-- AlterTable
ALTER TABLE `Personnel` DROP PRIMARY KEY,
    DROP COLUMN `name`,
    ADD COLUMN `first_name` VARCHAR(191) NULL,
    ADD COLUMN `last_name` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` ENUM('PERSONNEL', 'ADMIN') NOT NULL DEFAULT 'PERSONNEL',
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `tel` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Project` DROP COLUMN `project_owner`,
    MODIFY `personnelId` INTEGER NULL;

-- DropTable
DROP TABLE `User`;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_personnelId_fkey` FOREIGN KEY (`personnelId`) REFERENCES `Personnel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
