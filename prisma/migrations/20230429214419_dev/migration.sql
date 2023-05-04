-- CreateTable
CREATE TABLE `Testing` (
    `id` VARCHAR(32) NOT NULL,
    `username` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Testing_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
