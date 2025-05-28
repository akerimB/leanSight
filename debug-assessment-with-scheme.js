const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get HealthCo info
    const companyId = '6a4d1ddb-d6d2-43b3-82ef-45ec7ed711a6'; // HealthCo
    const departmentId = '37ad0b48-f3c1-45b0-a43c-e87ea92a8318'; // Clinical Operations
    const weightingSchemeId = 'bd81d8d0-9c6c-464b-82a6-ecf9c7a9c01c'; // Default scheme
    
    // Get company's sector
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, sectorId: true }
    });
    
    console.log(`Company: ${company.name}, Sector ID: ${company.sectorId}`);
    
    // Get department
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true, name: true }
    });
    
    console.log(`Department: ${department.name}`);
    
    // Get weighting scheme
    const weightingScheme = await prisma.weightingScheme.findUnique({
      where: { id: weightingSchemeId },
      include: {
        categoryWeights: {
          include: {
            category: true,
            dimensionWeights: {
              include: {
                dimension: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Weighting Scheme: ${weightingScheme.name}`);
    
    // Get template (dimensions that have descriptors for this sector)
    console.log('\nFetching template (dimensions with descriptors)...');
    const categories = await prisma.category.findMany({
      include: {
        dimensions: {
          where: {
            descriptors: {
              some: {
                sectorId: company.sectorId,
                deletedAt: null
              }
            }
          }
        }
      }
    });
    
    // Create a set of valid dimension IDs that have descriptors
    const validDimensionIds = new Set();
    categories.forEach(cat => {
      cat.dimensions.forEach(dim => {
        validDimensionIds.add(dim.id);
      });
    });
    
    console.log(`Template has ${validDimensionIds.size} valid dimensions with descriptors`);
    
    // Analyze the weighting scheme against valid dimensions
    let totalDimensionWeights = 0;
    let invalidDimensionWeights = 0;
    
    weightingScheme.categoryWeights.forEach(cw => {
      cw.dimensionWeights.forEach(dw => {
        totalDimensionWeights++;
        if (!validDimensionIds.has(dw.dimensionId)) {
          invalidDimensionWeights++;
          console.log(`Dimension "${dw.dimension.name}" in weighting scheme has no descriptors for this sector`);
        }
      });
    });
    
    console.log(`\nWeighting scheme has ${totalDimensionWeights} dimension weights`);
    console.log(`${invalidDimensionWeights} dimension weights reference dimensions without descriptors`);
    
    if (invalidDimensionWeights > 0) {
      console.log('\nThis is what causes the "Invalid reference" error when creating an assessment.');
      console.log('The weighting scheme is trying to reference dimensions that are not part of the assessment template.');
    }
    
  } catch (e) {
    console.error('Error during debugging:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 