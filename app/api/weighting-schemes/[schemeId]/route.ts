import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateWeightingSchemeSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
});

function extractSchemeId(request: Request) {
  const segments = new URL(request.url).pathname.split('/');
  return segments[segments.length - 1];
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const schemeId = extractSchemeId(request);
    const scheme = await prisma.weightingScheme.findUnique({
      where: { id: schemeId },
      include: {
        categoryWeights: {
          include: {
            category: true,
            dimensionWeights: {
              include: {
                dimension: true,
              },
            },
          },
        },
      },
    });

    if (!scheme) {
      return NextResponse.json(
        { message: 'Weighting scheme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scheme);
  } catch (error) {
    console.error('Error fetching weighting scheme:', error);
    return NextResponse.json(
      { message: 'Error fetching weighting scheme' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const schemeId = extractSchemeId(request);
    const body = await request.json();
    const validation = updateWeightingSchemeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.formErrors.fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, isDefault } = validation.data;

    // Check if scheme exists
    const existingScheme = await prisma.weightingScheme.findUnique({
      where: { id: schemeId },
    });

    if (!existingScheme) {
      return NextResponse.json(
        { message: 'Weighting scheme not found' },
        { status: 404 }
      );
    }

    // If name is being changed, check for uniqueness
    if (name && name !== existingScheme.name) {
      const nameExists = await prisma.weightingScheme.findFirst({
        where: {
          name,
          id: { not: schemeId },
          deletedAt: null,
        },
      });

      if (nameExists) {
        return NextResponse.json(
          { message: 'A weighting scheme with this name already exists' },
          { status: 409 }
        );
      }
    }

    // If this is set as default, unset any existing default
    if (isDefault) {
      await prisma.weightingScheme.updateMany({
        where: {
          id: { not: schemeId },
          isDefault: true,
          deletedAt: null,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedScheme = await prisma.weightingScheme.update({
      where: { id: schemeId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json(updatedScheme);
  } catch (error) {
    console.error('Error updating weighting scheme:', error);
    return NextResponse.json(
      { message: 'Error updating weighting scheme' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const schemeId = extractSchemeId(request);

    // Check if scheme exists and is not default
    const scheme = await prisma.weightingScheme.findUnique({
      where: { id: schemeId },
    });

    if (!scheme) {
      return NextResponse.json(
        { message: 'Weighting scheme not found' },
        { status: 404 }
      );
    }

    if (scheme.isDefault) {
      return NextResponse.json(
        { message: 'Cannot delete the default weighting scheme' },
        { status: 400 }
      );
    }

    // Soft delete the scheme
    await prisma.weightingScheme.update({
      where: { id: schemeId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Weighting scheme deleted successfully' });
  } catch (error) {
    console.error('Error deleting weighting scheme:', error);
    return NextResponse.json(
      { message: 'Error deleting weighting scheme' },
      { status: 500 }
    );
  }
} 