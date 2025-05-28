const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check recent draft assessments
    console.log('--- CHECKING RECENT DRAFT ASSESSMENTS ---');
    const drafts = await prisma.assessment.findMany({
      where: { status: 'DRAFT' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        companyId: true,
        departmentId: true,
        expertId: true,
        weightingSchemeId: true,
        createdAt: true
      }
    });
    console.log('Recent draft assessments:', JSON.stringify(drafts, null, 2));

    // Check if assessment creation fails when using HealthCo department ID
    console.log('\n--- CHECKING HEALTH CO DIMENSIONS WITH SECTOR ---');
    const company = await prisma.company.findUnique({
      where: { id: '6a4d1ddb-d6d2-43b3-82ef-45ec7ed711a6' }, // HealthCo
      select: { sectorId: true, name: true }
    });
    
    // Find dimensions that don't have descriptors for this sector
    const dimensionsWithoutDescriptors = await prisma.dimension.findMany({
      where: {
        descriptors: {
          none: {
            sectorId: company.sectorId,
            deletedAt: null
          }
        },
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        categoryId: true
      }
    });
    
    console.log(`Dimensions without descriptors for ${company.name}'s sector:`, dimensionsWithoutDescriptors.length);
    
    // Check missing dimensions in any weight schemes used
    console.log('\n--- CHECKING WEIGHTING SCHEME DIMENSIONS ---');
    const weightingSchemes = await prisma.weightingScheme.findMany({
      include: {
        categoryWeights: {
          include: {
            dimensionWeights: true
          }
        }
      }
    });
    
    for (const scheme of weightingSchemes) {
      const dimensionIds = new Set();
      scheme.categoryWeights.forEach(cw => {
        cw.dimensionWeights.forEach(dw => {
          dimensionIds.add(dw.dimensionId);
        });
      });
      
      console.log(`Scheme ${scheme.name} references ${dimensionIds.size} dimensions`);
      
      // Check which dimensions in the scheme don't have descriptors for HealthCo's sector
      const problematicDimensions = [];
      for (const dimId of dimensionIds) {
        const hasDescriptors = await prisma.maturityDescriptor.findFirst({
          where: { 
            dimensionId: dimId,
            sectorId: company.sectorId,
            deletedAt: null
          }
        });
        
        if (!hasDescriptors) {
          const dim = await prisma.dimension.findUnique({
            where: { id: dimId },
            select: { id: true, name: true }
          });
          problematicDimensions.push(dim);
        }
      }
      
      if (problematicDimensions.length > 0) {
        console.log(`Found ${problematicDimensions.length} dimensions in scheme ${scheme.name} without descriptors for ${company.name}'s sector:`);
        console.log(JSON.stringify(problematicDimensions, null, 2));
      }
    }
  } catch (e) {
    console.error('Error during debugging:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 