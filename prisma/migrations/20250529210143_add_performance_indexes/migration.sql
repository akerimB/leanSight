/*
  Warnings:

  - Added the required column `updatedAt` to the `Evidence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "EvidenceHistory" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvidenceHistory_evidenceId_idx" ON "EvidenceHistory"("evidenceId");

-- CreateIndex
CREATE INDEX "EvidenceHistory_uploadedById_idx" ON "EvidenceHistory"("uploadedById");

-- CreateIndex
CREATE INDEX "Assessment_createdAt_idx" ON "Assessment"("createdAt");

-- CreateIndex
CREATE INDEX "Assessment_companyId_status_idx" ON "Assessment"("companyId", "status");

-- CreateIndex
CREATE INDEX "Assessment_companyId_createdAt_idx" ON "Assessment"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Assessment_status_createdAt_idx" ON "Assessment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Assessment_companyId_departmentId_status_idx" ON "Assessment"("companyId", "departmentId", "status");

-- CreateIndex
CREATE INDEX "Evidence_assessmentId_idx" ON "Evidence"("assessmentId");

-- CreateIndex
CREATE INDEX "Evidence_dimensionId_idx" ON "Evidence"("dimensionId");

-- CreateIndex
CREATE INDEX "Evidence_uploadedById_idx" ON "Evidence"("uploadedById");

-- CreateIndex
CREATE INDEX "Evidence_deletedAt_idx" ON "Evidence"("deletedAt");

-- CreateIndex
CREATE INDEX "Score_assessmentId_idx" ON "Score"("assessmentId");

-- CreateIndex
CREATE INDEX "Score_dimensionId_idx" ON "Score"("dimensionId");

-- CreateIndex
CREATE INDEX "Score_level_idx" ON "Score"("level");

-- CreateIndex
CREATE INDEX "Score_deletedAt_idx" ON "Score"("deletedAt");

-- CreateIndex
CREATE INDEX "Score_assessmentId_dimensionId_idx" ON "Score"("assessmentId", "dimensionId");

-- CreateIndex
CREATE INDEX "Score_dimensionId_level_idx" ON "Score"("dimensionId", "level");

-- AddForeignKey
ALTER TABLE "EvidenceHistory" ADD CONSTRAINT "EvidenceHistory_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceHistory" ADD CONSTRAINT "EvidenceHistory_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
