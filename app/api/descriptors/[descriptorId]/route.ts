import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Zod schema for updating a maturity descriptor
const updateDescriptorSchema = z.object({
  level: z.number().int().min(1).max(5).optional(),
  description: z.string().min(1).optional(),
});

// Helper to extract descriptorId from URL
function extractDescriptorId(urlString: string) {
  const url = new URL(urlString, 'http://localhost');
  const parts = url.pathname.split('/');
  const idx = parts.findIndex(p => p === 'descriptors');
  return parts[idx + 1];
}

// PUT handler to update a specific maturity descriptor
export async function PUT(request: Request) {
  const descriptorId = extractDescriptorId(request.url);
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  if (!descriptorId) {
    return NextResponse.json({ message: 'Invalid descriptor ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = updateDescriptorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.formErrors.fieldErrors }, { status: 400 });
    }

    const { level, description } = validation.data;

    if (level === undefined && description === undefined) {
        return NextResponse.json({ message: 'No fields to update provided' }, { status: 400 });
    }

    // Check if the descriptor exists
    const existingDescriptor = await prisma.maturityDescriptor.findUnique({
      where: { id: descriptorId },
    });

    if (!existingDescriptor) {
      return NextResponse.json({ message: 'Maturity descriptor not found' }, { status: 404 });
    }
    
    // If level is being updated, check for conflicts within the same sector and dimension
    if (level !== undefined && level !== existingDescriptor.level) {
        const conflict = await prisma.maturityDescriptor.findFirst({
            where: {
                sectorId: existingDescriptor.sectorId,
                dimensionId: existingDescriptor.dimensionId,
                level: level,
                id: { not: descriptorId },
            }
        });
        if (conflict) {
            return NextResponse.json({ message: `A descriptor with level ${level} already exists for this sector and dimension.` }, { status: 409 });
        }
    }

    const dataToUpdate: { level?: number; description?: string } = {};
    if (level !== undefined) dataToUpdate.level = level;
    if (description !== undefined) dataToUpdate.description = description;

    const updatedDescriptor = await prisma.maturityDescriptor.update({
      where: { id: descriptorId }, 
      data: dataToUpdate,
    });

    return NextResponse.json(updatedDescriptor);

  } catch (error: any) {
    console.error(`Error updating descriptor ${descriptorId}:`, error);
    if (error.code === 'P2025') { // Record to update not found
      return NextResponse.json({ message: 'Maturity descriptor not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating maturity descriptor' }, { status: 500 });
  }
}

// DELETE handler to soft-delete a specific maturity descriptor
export async function DELETE(request: Request) {
  const descriptorId = extractDescriptorId(request.url);
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  if (!descriptorId) {
    return NextResponse.json({ message: 'Invalid descriptor ID' }, { status: 400 });
  }

  try {
    // Check if the descriptor exists
    const descriptor = await prisma.maturityDescriptor.findUnique({
        where: { id: descriptorId },
    });

    if (!descriptor) {
        return NextResponse.json({ message: 'Maturity descriptor not found' }, { status: 404 });
    }

    // Create a record in the deleted descriptors table
    await prisma.deletedMaturityDescriptor.create({
      data: {
        originalId: descriptor.id,
        dimensionId: descriptor.dimensionId,
        sectorId: descriptor.sectorId,
        level: descriptor.level,
        description: descriptor.description,
      },
    });

    // Delete the original record
    await prisma.maturityDescriptor.delete({
      where: { id: descriptorId },
    });

    return NextResponse.json({ message: 'Maturity descriptor deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error(`Error deleting descriptor ${descriptorId}:`, error);
    if (error.code === 'P2025') { // Record to delete not found
      return NextResponse.json({ message: 'Maturity descriptor not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting maturity descriptor' }, { status: 500 });
  }
}

// POST handler to restore a deleted maturity descriptor
export async function POST(request: Request) {
  const descriptorId = extractDescriptorId(request.url);
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  if (!descriptorId) {
    return NextResponse.json({ message: 'Invalid descriptor ID' }, { status: 400 });
  }

  try {
    // Find the deleted descriptor by originalId
    const deleted = await prisma.deletedMaturityDescriptor.findUnique({
      where: { originalId: descriptorId },
    });
    if (!deleted) {
      return NextResponse.json({ message: 'Deleted descriptor not found' }, { status: 404 });
    }
    // Restore to MaturityDescriptor
    const restored = await prisma.maturityDescriptor.create({
      data: {
        dimensionId: deleted.dimensionId,
        sectorId: deleted.sectorId,
        level: deleted.level,
        description: deleted.description,
      },
    });
    // Remove from deleted table
    await prisma.deletedMaturityDescriptor.delete({
      where: { originalId: descriptorId },
    });
    return NextResponse.json(restored);
  } catch (error: any) {
    console.error(`Error restoring descriptor ${descriptorId}:`, error);
    return NextResponse.json({ message: 'Error restoring descriptor' }, { status: 500 });
  }
} 