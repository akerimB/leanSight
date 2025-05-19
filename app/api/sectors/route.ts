import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in to access this resource' },
      { status: 401 }
    );
  }

  try {
    const sectors = await prisma.sector.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            companies: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(sectors);
  } catch (error) {
    console.error('Error fetching sectors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sectors' },
      { status: 500 }
    );
  }
} 