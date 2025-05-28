-- Add tags, version, and updatedAt fields to Evidence table
ALTER TABLE "Evidence" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';
ALTER TABLE "Evidence" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Evidence" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create EvidenceHistory table
CREATE TABLE IF NOT EXISTS "EvidenceHistory" (
  "id" TEXT NOT NULL,
  "evidenceId" TEXT NOT NULL,
  "fileUrl" TEXT,
  "fileType" TEXT,
  "notes" TEXT,
  "tags" TEXT[] DEFAULT '{}',
  "version" INTEGER NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "EvidenceHistory_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX IF NOT EXISTS "Evidence_assessmentId_idx" ON "Evidence"("assessmentId");
CREATE INDEX IF NOT EXISTS "Evidence_dimensionId_idx" ON "Evidence"("dimensionId");
CREATE INDEX IF NOT EXISTS "Evidence_uploadedById_idx" ON "Evidence"("uploadedById");
CREATE INDEX IF NOT EXISTS "Evidence_deletedAt_idx" ON "Evidence"("deletedAt");

CREATE INDEX IF NOT EXISTS "EvidenceHistory_evidenceId_idx" ON "EvidenceHistory"("evidenceId");
CREATE INDEX IF NOT EXISTS "EvidenceHistory_uploadedById_idx" ON "EvidenceHistory"("uploadedById");

-- Add foreign key constraints
ALTER TABLE "EvidenceHistory" ADD CONSTRAINT "EvidenceHistory_evidenceId_fkey" 
  FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EvidenceHistory" ADD CONSTRAINT "EvidenceHistory_uploadedById_fkey" 
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 