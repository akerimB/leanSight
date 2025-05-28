const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // ID from session (replace with actual ID from session if known)
    const userId = '5ec4f951-3866-4140-97c7-50320617ed51';  // This appears in draft assessments
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    console.log('User exists:', !!user);
    
    if (user) {
      console.log('User details:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      });
    } else {
      // List all users
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      console.log('Available users:', allUsers);
    }
  } catch (e) {
    console.error('Error checking user:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 