/*
  Warnings:

  - You are about to drop the column `address` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `tel` on the `Department` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Department` DROP COLUMN `address`,
    DROP COLUMN `tel`;
