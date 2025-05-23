import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for individual dimension weight update
const dimensionWeightUpdateSchema = z.object({
  dimensionId: z.string().cuid({ message: "Invalid dimension ID"}),
  weight: z.number().min(0, {message: "Weight cannot be negative"}).max(1, {message: "Weight cannot exceed 1"}), // Assuming weights are 0-1, summing to 1 per level
});

// Schema for individual category weight update
const categoryWeightUpdateSchema = z.object({
  categoryId: z.string().cuid({ message: "Invalid category ID"}),
  weight: z.number().min(0, {message: "Weight cannot be negative"}).max(1, {message: "Weight cannot exceed 1"}),
  dimensionWeights: z.array(dimensionWeightUpdateSchema),
});

// Schema for the main PUT request body
const updateWeightingSchemeWithWeightsSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).optional(),
  description: z.string().optional().nullable(), // Allow null for optional description
  isDefault: z.boolean().optional(),
  categoryWeights: z.array(categoryWeightUpdateSchema).optional(), // Weights update is optional
});

function extractSchemeId(request: Request) {
  const segments = new URL(request.url).pathname.split('/');
  return segments[segments.length - 1];
}

export async function GET(
  request: Request,
  { params }: { params: { schemeId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { schemeId } = params;

  if (!schemeId) {
    return new NextResponse(JSON.stringify({ error: 'Scheme ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const scheme = await prisma.weightingScheme.findUnique({
      where: { id: schemeId, deletedAt: null }, // Ensure not deleted
      include: {
        categoryWeights: {
          where: { category: {deletedAt: null}}, // Ensure category not deleted
          orderBy: { category: { name: 'asc' } }, 
          include: {
            category: { select: { id: true, name: true } },
            dimensionWeights: {
              where: { dimension: {deletedAt: null}}, // Ensure dimension not deleted
              orderBy: { dimension: { name: 'asc' } }, 
              include: {
                dimension: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!scheme) {
      return new NextResponse(JSON.stringify({ error: 'Weighting scheme not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return NextResponse.json(scheme);
  } catch (error) {
    console.error(`Error fetching weighting scheme ${schemeId}:`, error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch weighting scheme' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
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
    const validation = updateWeightingSchemeWithWeightsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, isDefault, categoryWeights } = validation.data;

    const updatedSchemeWithDetails = await prisma.$transaction(async (tx) => {
      const existingScheme = await tx.weightingScheme.findUnique({
        where: { id: schemeId, deletedAt: null },
      });
      if (!existingScheme) {
        throw new Error('Weighting scheme not found');
      }

      if (name && name !== existingScheme.name) {
        const nameExists = await tx.weightingScheme.findFirst({
          where: { name, id: { not: schemeId }, deletedAt: null },
        });
        if (nameExists) {
          throw new Error('A weighting scheme with this name already exists');
        }
      }

      if (isDefault === true && existingScheme.isDefault === false) {
        await tx.weightingScheme.updateMany({
          where: { isDefault: true, deletedAt: null }, // Unset all other defaults
          data: { isDefault: false },
        });
      }
      
      // If isDefault is being set to false, and this scheme *was* the default, 
      // an admin might need to manually set another scheme as default.
      // Or, we could enforce that at least one default scheme must exist if isDefault is false.
      // For now, we allow unsetting default without auto-assigning a new one.

      await tx.weightingScheme.update({
        where: { id: schemeId },
        data: {
          name: name ?? existingScheme.name,
          description: description !== undefined ? description : existingScheme.description,
          isDefault: isDefault !== undefined ? isDefault : existingScheme.isDefault,
        },
      });

      if (categoryWeights) {
        const totalCategoryWeight = categoryWeights.reduce((sum, cw) => sum + cw.weight, 0);
        if (categoryWeights.length > 0 && Math.abs(totalCategoryWeight - 1.0) > 0.001) {
          throw new Error('Sum of category weights must be 1.');
        }

        await tx.dimensionWeight.deleteMany({ where: { categoryWeight: { weightingSchemeId: schemeId } } });
        await tx.categoryWeight.deleteMany({ where: { weightingSchemeId: schemeId } });

        for (const cwData of categoryWeights) {
          const totalDimensionWeight = cwData.dimensionWeights.reduce((sum, dw) => sum + dw.weight, 0);
          if (cwData.dimensionWeights.length > 0 && Math.abs(totalDimensionWeight - 1.0) > 0.001) {
            throw new Error(`Sum of dimension weights for category ID ${cwData.categoryId} must be 1.`);
          }

          const newCategoryWeight = await tx.categoryWeight.create({
            data: {
              weightingSchemeId: schemeId,
              categoryId: cwData.categoryId,
              weight: cwData.weight,
            },
          });
          if (cwData.dimensionWeights.length > 0) { 
            await tx.dimensionWeight.createMany({
                data: cwData.dimensionWeights.map(dwData => ({
                    categoryWeightId: newCategoryWeight.id,
                    dimensionId: dwData.dimensionId,
                    weight: dwData.weight,
                })),
            });
          }
        }
      }
      
      // Refetch within the transaction to ensure data consistency for the response
      return tx.weightingScheme.findUnique({
        where: { id: schemeId },
        include: {
            categoryWeights: {
                orderBy: { category: { name: 'asc' } },
                include: {
                    category: { select: { id: true, name: true } },
                    dimensionWeights: {
                        orderBy: { dimension: { name: 'asc' } },
                        include: {
                            dimension: { select: { id: true, name: true } },
                        },
                    },
                },
            },
        },
      });
    });

    return NextResponse.json(updatedSchemeWithDetails);

  } catch (error: any) {
    console.error('Error updating weighting scheme:', error.message, error.stack);
    if (error.message === 'Weighting scheme not found') {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    if (error.message === 'A weighting scheme with this name already exists') {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    if (error.message.startsWith('Sum of category weights must be 1') || error.message.includes('Sum of dimension weights for category')) {
        return NextResponse.json({ message: error.message, type: 'Validation Error' }, { status: 400 });
    }
    // Catch Zod validation errors specifically if needed, or general Prisma errors
    if (error.name === 'ZodError') {
        return NextResponse.json({ message: "Invalid input based on schema", errors: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Error updating weighting scheme', details: error.message },
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
        { message: 'Cannot delete the default weighting scheme. Please set another scheme as default first.' },
        { status: 400 }
      );
    }

    await prisma.weightingScheme.update({
      where: { id: schemeId },
      data: { deletedAt: new Date() }, // Soft delete
    });

    // Note: Corresponding CategoryWeight and DimensionWeight are not soft-deleted here but will be inaccessible.
    // If hard delete was used, they would need to be cascaded or deleted manually.

    return NextResponse.json({ message: 'Weighting scheme deleted successfully' });
  } catch (error) {
    console.error('Error deleting weighting scheme:', error);
    return NextResponse.json(
      { message: 'Error deleting weighting scheme' },
      { status: 500 }
    );
  }
} 