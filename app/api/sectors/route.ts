import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Zod schema for creating a sector
const createSectorSchema = z.object({
  name: z.string().min(1, { message: 'Sector name is required' }),
  description: z.string().optional(),
});

// Zod schema for sector update (all fields optional)
const updateSectorSchema = z.object({
  name: z.string().min(1, { message: "Sector name cannot be empty" }).optional(),
});

// GET all sectors
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sectors = await prisma.sector.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            descriptors: true,
            companies: true
          }
        }
      },
      orderBy: { name: 'asc' }
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

// POST a new sector
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = createSectorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.formErrors.fieldErrors },
        { status: 400 }
      );
    }

    const { name, description } = validation.data;

    // Check if a sector with this name already exists
    const existingSector = await prisma.sector.findFirst({
      where: {
        name: name,
        deletedAt: null,
      },
    });

    if (existingSector) {
      return NextResponse.json(
        { message: 'A sector with this name already exists' },
        { status: 409 }
      );
    }

    const newSector = await prisma.sector.create({
      data: {
        name: name,
        description: description,
      },
    });

    return NextResponse.json(newSector, { status: 201 });
  } catch (error) {
    console.error('Error creating sector:', error);
    return NextResponse.json(
      { message: 'Error creating sector' },
      { status: 500 }
    );
  }
} 