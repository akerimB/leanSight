import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Helper to extract sectorId from URL
function extractSectorId(urlString: string) {
  const url = new URL(urlString, 'http://localhost');
  const parts = url.pathname.split('/');
  const idx = parts.findIndex(p => p === 'sectors');
  return parts[idx + 1];
}

// Zod schema for updating a sector
const updateSectorSchema = z.object({
  name: z.string().min(1, { message: 'Sector name is required' }),
});

// GET a specific sector with its descriptors
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  const sectorId = extractSectorId(request.url);
  if (!sectorId) {
    return NextResponse.json({ message: 'Invalid sector ID' }, { status: 400 });
  }
  try {
    const sector = await prisma.sector.findUnique({
      where: {
        id: sectorId,
        deletedAt: null,
      },
      include: {
        descriptors: {
          where: {
            deletedAt: null,
          },
          include: {
            dimension: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [
            { dimension: { name: 'asc' } },
            { level: 'asc' },
          ],
        },
      },
    });

    if (!sector) {
      return NextResponse.json({ message: 'Sector not found' }, { status: 404 });
    }

    // Group descriptors by dimension
    const groupedDescriptors = sector.descriptors.reduce((acc, descriptor) => {
      const dimId = descriptor.dimension.id;
      if (!acc[dimId]) {
        acc[dimId] = {
          dimensionId: dimId,
          dimensionName: descriptor.dimension.name,
          descriptors: [],
        };
      }
      acc[dimId].descriptors.push({
        id: descriptor.id,
        level: descriptor.level,
        description: descriptor.description,
      });
      return acc;
    }, {} as Record<string, { dimensionId: string; dimensionName: string; descriptors: Array<{ id: string; level: number; description: string }> }>);

    return NextResponse.json({
      id: sector.id,
      name: sector.name,
      descriptors: Object.values(groupedDescriptors),
    });
  } catch (error) {
    console.error(`Error fetching sector ${sectorId}:`, error);
    return NextResponse.json(
      { message: 'Error fetching sector' },
      { status: 500 }
    );
  }
}

// PUT to update a sector
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  const sectorId = extractSectorId(request.url);
  if (!sectorId) {
    return NextResponse.json({ message: 'Invalid sector ID' }, { status: 400 });
  }
  try {
    const body = await request.json();
    const validation = updateSectorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.formErrors.fieldErrors },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // Check if the sector exists
    const existingSector = await prisma.sector.findUnique({
      where: {
        id: sectorId,
        deletedAt: null,
      },
    });

    if (!existingSector) {
      return NextResponse.json({ message: 'Sector not found' }, { status: 404 });
    }

    // Check if another sector with this name already exists
    const nameConflict = await prisma.sector.findFirst({
      where: {
        name: name,
        id: { not: sectorId },
        deletedAt: null,
      },
    });

    if (nameConflict) {
      return NextResponse.json(
        { message: 'A sector with this name already exists' },
        { status: 409 }
      );
    }

    const updatedSector = await prisma.sector.update({
      where: {
        id: sectorId,
      },
      data: {
        name: name,
      },
    });

    return NextResponse.json(updatedSector);
  } catch (error) {
    console.error(`Error updating sector ${sectorId}:`, error);
    return NextResponse.json(
      { message: 'Error updating sector' },
      { status: 500 }
    );
  }
}

// DELETE a sector (soft delete)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  const sectorId = extractSectorId(request.url);
  if (!sectorId) {
    return NextResponse.json({ message: 'Invalid sector ID' }, { status: 400 });
  }
  try {
    // Check if the sector exists
    const existingSector = await prisma.sector.findUnique({
      where: {
        id: sectorId,
        deletedAt: null,
      },
    });

    if (!existingSector) {
      return NextResponse.json({ message: 'Sector not found' }, { status: 404 });
    }

    // Soft delete the sector
    await prisma.sector.update({
      where: {
        id: sectorId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Sector deleted successfully' });
  } catch (error) {
    console.error(`Error deleting sector ${sectorId}:`, error);
    return NextResponse.json(
      { message: 'Error deleting sector' },
      { status: 500 }
    );
  }
} 