-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "calculationUsed" TEXT,
ADD COLUMN     "weightedAverageScore" DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Assessment_companyId_idx" ON "Assessment"("companyId");

-- CreateIndex
CREATE INDEX "Assessment_departmentId_idx" ON "Assessment"("departmentId");

-- CreateIndex
CREATE INDEX "Assessment_expertId_idx" ON "Assessment"("expertId");

-- CreateIndex
CREATE INDEX "Assessment_weightingSchemeId_idx" ON "Assessment"("weightingSchemeId");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- CreateIndex
CREATE INDEX "Assessment_deletedAt_idx" ON "Assessment"("deletedAt");
