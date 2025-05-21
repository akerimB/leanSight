import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Protected route - adjust role as needed, or just check for session
  if (!session || session.user.role !== 'ADMIN') { // Assuming only admins can access raw dimension list
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const dimensions = await prisma.dimension.findMany({
      where: {
        deletedAt: null, // Optionally, only fetch non-deleted dimensions
      },
      orderBy: {
        name: 'asc', // Order by name for consistent listing
      },
    });
    return NextResponse.json(dimensions);
  } catch (error) {
    console.error('Error fetching dimensions:', error);
    return NextResponse.json({ message: 'Error fetching dimensions' }, { status: 500 });
  }
} 