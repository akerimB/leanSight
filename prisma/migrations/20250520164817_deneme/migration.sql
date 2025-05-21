-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "weightingSchemeId" TEXT;

-- CreateTable
CREATE TABLE "WeightingScheme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightingScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryWeight" (
    "id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "categoryId" TEXT NOT NULL,
    "weightingSchemeId" TEXT NOT NULL,

    CONSTRAINT "CategoryWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DimensionWeight" (
    "id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "categoryWeightId" TEXT NOT NULL,

    CONSTRAINT "DimensionWeight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeightingScheme_name_key" ON "WeightingScheme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryWeight_categoryId_weightingSchemeId_key" ON "CategoryWeight"("categoryId", "weightingSchemeId");

-- CreateIndex
CREATE UNIQUE INDEX "DimensionWeight_dimensionId_categoryWeightId_key" ON "DimensionWeight"("dimensionId", "categoryWeightId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_weightingSchemeId_fkey" FOREIGN KEY ("weightingSchemeId") REFERENCES "WeightingScheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryWeight" ADD CONSTRAINT "CategoryWeight_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryWeight" ADD CONSTRAINT "CategoryWeight_weightingSchemeId_fkey" FOREIGN KEY ("weightingSchemeId") REFERENCES "WeightingScheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DimensionWeight" ADD CONSTRAINT "DimensionWeight_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "Dimension"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DimensionWeight" ADD CONSTRAINT "DimensionWeight_categoryWeightId_fkey" FOREIGN KEY ("categoryWeightId") REFERENCES "CategoryWeight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
