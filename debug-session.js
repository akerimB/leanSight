const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Debug session issues by checking if there's a token mismatch or data format issue
    
    // Get existing draft assessment
    const draft = await prisma.assessment.findFirst({
      where: { status: 'DRAFT' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        expertId: true,
        companyId: true,
        expert: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('Latest draft assessment:', draft);
    
    // Check if session format might be causing the issue
    // Session structure in auth.ts vs what might be used in the route handler
    const expectedSessionFormat = {
      user: {
        id: '5ec4f951-3866-4140-97c7-50320617ed51',
        email: 'expert@example.com',
        name: 'Expert User',
        role: 'EXPERT',
        companyId: '6a4d1ddb-d6d2-43b3-82ef-45ec7ed711a6'
      }
    };
    
    // Potential issues with session handling:
    console.log('\nPotential issues:');
    console.log('1. Using session.id instead of session.user.id:', expectedSessionFormat.user.id);
    console.log('2. Using session.user?.id vs session.user.id?:', expectedSessionFormat.user.id);
    
    // Check if user exists and isn't deleted
    const user = await prisma.user.findUnique({
      where: { id: expectedSessionFormat.user.id }
    });
    
    console.log('\nUser details:', user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      deletedAt: user.deletedAt
    } : 'User not found');
    
    if (user?.deletedAt) {
      console.log('WARNING: User is soft-deleted! This would cause foreign key constraint issues.');
    }
    
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 