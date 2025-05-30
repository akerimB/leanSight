import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dimensions = await prisma.dimension.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(dimensions);

  } catch (error) {
    console.error('Error fetching dimensions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dimensions' },
      { status: 500 }
    );
  }
} 