const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get HealthCo's sector ID
  const company = await prisma.company.findUnique({
    where: { id: '6a4d1ddb-d6d2-43b3-82ef-45ec7ed711a6' },
    select: { sectorId: true, name: true }
  });
  
  console.log(`Checking maturity descriptors for ${company.name} (Sector ID: ${company.sectorId})`);
  
  // Get all dimensions
  const dimensions = await prisma.dimension.findMany({
    where: { deletedAt: null }
  });
  
  console.log(`Total dimensions: ${dimensions.length}`);
  
  // Check each dimension for descriptors in HealthCo's sector
  let missingDescriptors = 0;
  let dimensionsWithMissingDescriptors = [];
  
  for (const dimension of dimensions) {
    const descriptorsCount = await prisma.maturityDescriptor.count({
      where: { 
        dimensionId: dimension.id,
        sectorId: company.sectorId,
        deletedAt: null
      }
    });
    
    if (descriptorsCount === 0) {
      missingDescriptors++;
      dimensionsWithMissingDescriptors.push(dimension.name);
    }
  }
  
  console.log(`Dimensions without descriptors for ${company.name}'s sector: ${missingDescriptors}`);
  
  if (dimensionsWithMissingDescriptors.length > 0) {
    console.log('Affected dimensions:');
    dimensionsWithMissingDescriptors.forEach(name => console.log(`- ${name}`));
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