/*
  Warnings:

  - You are about to drop the column `sector` on the `form_template` table. All the data in the column will be lost.
  - You are about to drop the column `sector` on the `workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "form_template" DROP COLUMN "sector",
ADD COLUMN     "sectorId" UUID;

-- AlterTable
ALTER TABLE "workspace" DROP COLUMN "sector",
ADD COLUMN     "sectorId" UUID;

-- DropEnum
DROP TYPE "FormSector";

-- CreateTable
CREATE TABLE "sector" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "label" TEXT NOT NULL,
    "builtIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sector_label_key" ON "sector"("label");

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;
