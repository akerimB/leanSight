-- AlterTable
ALTER TABLE "Sector" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "DeletedMaturityDescriptor" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedMaturityDescriptor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeletedMaturityDescriptor_originalId_key" ON "DeletedMaturityDescriptor"("originalId");

-- CreateIndex
CREATE INDEX "DeletedMaturityDescriptor_deletedAt_idx" ON "DeletedMaturityDescriptor"("deletedAt");

-- CreateIndex
CREATE INDEX "DeletedMaturityDescriptor_originalId_idx" ON "DeletedMaturityDescriptor"("originalId");

-- CreateIndex
CREATE INDEX "MaturityDescriptor_deletedAt_idx" ON "MaturityDescriptor"("deletedAt");

-- AddForeignKey
ALTER TABLE "DeletedMaturityDescriptor" ADD CONSTRAINT "DeletedMaturityDescriptor_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "Dimension"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletedMaturityDescriptor" ADD CONSTRAINT "DeletedMaturityDescriptor_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
