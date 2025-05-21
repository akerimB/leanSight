import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for types

// Helper to extract sectorId from URL
function extractSectorId(urlString: string) {
  const url = new URL(urlString, 'http://localhost');
  const parts = url.pathname.split('/');
  const idx = parts.findIndex(p => p === 'sectors');
  return parts[idx + 1];
}

// Zod schema for creating a maturity descriptor
const createDescriptorSchema = z.object({
  dimensionId: z.string().uuid({ message: 'Invalid Dimension ID' }),
  level: z.number().int().min(1).max(5, { message: 'Level must be between 1 and 5' }),
  description: z.string().min(1, { message: 'Description is required' }),
});

// Define an explicit type for the descriptor with its dimension selected
type MaturityDescriptorWithDimension = Prisma.MaturityDescriptorGetPayload<{
  include: {
    dimension: {
      select: { id: true; name: true };
    };
  };
}>;

// GET descriptors for a sector
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
    const descriptors = await prisma.maturityDescriptor.findMany({
      where: { sectorId },
      orderBy: [{ dimensionId: 'asc' }, { level: 'asc' }],
    });
    return NextResponse.json(descriptors);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch descriptors' }, { status: 500 });
  }
}

// POST create a new descriptor for a sector
export async function POST(request: Request) {
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
    const schema = z.object({
      dimensionId: z.string().min(1),
      level: z.number().int().min(1).max(5),
      description: z.string().min(1),
    });
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.formErrors.fieldErrors }, { status: 400 });
    }
    const { dimensionId, level, description } = validation.data;
    // Check for existing descriptor with same sector, dimension, and level
    const existing = await prisma.maturityDescriptor.findFirst({
      where: { sectorId, dimensionId, level },
    });
    if (existing) {
      return NextResponse.json({ message: 'Descriptor with this level already exists for this sector and dimension.' }, { status: 409 });
    }
    const descriptor = await prisma.maturityDescriptor.create({
      data: { sectorId, dimensionId, level, description },
    });
    return NextResponse.json(descriptor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create descriptor' }, { status: 500 });
  }
} 