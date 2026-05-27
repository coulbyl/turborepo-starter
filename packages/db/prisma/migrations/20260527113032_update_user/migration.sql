/*
  Warnings:

  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "bio",
DROP COLUMN "username",
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "sector" "FormSector";
