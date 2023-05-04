/*
  Warnings:

  - You are about to drop the `testing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `testing`;

-- CreateTable
CREATE TABLE `Users` (
    `id` VARCHAR(32) NOT NULL,
    `username` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Users_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
