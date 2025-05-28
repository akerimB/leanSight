const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check weighting scheme
  const scheme = await prisma.weightingScheme.findUnique({ 
    where: { id: 'bd81d8d0-9c6c-464b-82a6-ecf9c7a9c01c' } 
  });
  console.log('Default Weighting Scheme Exists:', !!scheme);
  
  // Check counts
  const dimensionCount = await prisma.dimension.count();
  console.log('Dimension Count:', dimensionCount);
  
  // Check template configs for HealthCo
  const templateConfigs = await prisma.templateConfig.count({
    where: { companyId: '6a4d1ddb-d6d2-43b3-82ef-45ec7ed711a6' }
  });
  console.log('HealthCo Template Configs:', templateConfigs);
  
  // Check if there are any dimensions not associated with categories
  const orphanedDimensions = await prisma.dimension.findMany({
    where: { categoryId: null }
  });
  console.log('Dimensions without categories:', orphanedDimensions.length);
  if (orphanedDimensions.length > 0) {
    console.log('Orphaned dimensions:', orphanedDimensions.map(d => d.name));
  }
  
  // Check if dimensions in the weighting scheme actually exist
  if (scheme) {
    const schemeDetails = await prisma.weightingScheme.findUnique({
      where: { id: scheme.id },
      include: {
        categoryWeights: {
          include: {
            dimensionWeights: true
          }
        }
      }
    });
    
    const dimensionIds = new Set();
    schemeDetails.categoryWeights.forEach(cw => {
      cw.dimensionWeights.forEach(dw => {
        dimensionIds.add(dw.dimensionId);
      });
    });
    
    console.log('Number of dimensions in weighting scheme:', dimensionIds.size);
    
    // Check if all these dimensions exist
    const existingDimensions = await prisma.dimension.findMany({
      where: { id: { in: Array.from(dimensionIds) } }
    });
    console.log('Number of existing dimensions from weighting scheme:', existingDimensions.length);
    
    if (existingDimensions.length < dimensionIds.size) {
      console.log('Missing dimensions:', dimensionIds.size - existingDimensions.length);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 