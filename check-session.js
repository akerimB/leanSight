const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Simulate session user
    const sessionUser = {
      id: '5ec4f951-3866-4140-97c7-50320617ed51',
      role: 'EXPERT',
      companyId: '6a4d1ddb-d6d2-43b3-82ef-45ec7ed711a6'
    };
    
    console.log('Simulating assessment creation with session user:', sessionUser);
    
    // Create company-wide assessment (simulate draft creation)
    const companyId = '6a4d1ddb-d6d2-43b3-82ef-45ec7ed711a6'; // HealthCo
    const departmentId = null; // Company-wide
    
    try {
      // This simulates what happens in the POST route handler
      const assessment = await prisma.assessment.create({
        data: {
          companyId,
          departmentId,
          expertId: sessionUser.id,
          status: 'DRAFT',
          weightingSchemeId: null,
        },
      });
      
      console.log('Successfully created assessment:', assessment.id);
      
      // Clean up - delete the test assessment
      await prisma.assessment.delete({
        where: { id: assessment.id }
      });
      
      console.log('Cleaned up test assessment');
    } catch (e) {
      console.error('Error creating assessment:', e);
      
      // Additional debugging if it's a foreign key error
      if (e.code === 'P2003' && e.meta?.field_name?.includes('expertId')) {
        // Check user details more carefully
        const user = await prisma.user.findUnique({
          where: { id: sessionUser.id }
        });
        
        console.log('User details from database:', user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: user.deletedAt
        } : 'User not found');
        
        // Check company exists
        const company = await prisma.company.findUnique({
          where: { id: companyId }
        });
        
        console.log('Company exists:', !!company);
      }
    }
  } catch (e) {
    console.error('General error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 