import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Role } from '@prisma/client';

const createWeightingSchemeSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const weightingSchemes = await prisma.weightingScheme.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        isDefault: true,
      },
    });
    return NextResponse.json(weightingSchemes);
  } catch (error) {
    console.error('Error fetching weighting schemes:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch weighting schemes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = createWeightingSchemeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, isDefault } = validation.data;

    const newSchemeWithWeights = await prisma.$transaction(async (tx) => {
      // Check if a scheme with this name already exists (within transaction)
      const existingScheme = await tx.weightingScheme.findFirst({
        where: {
          name: name,
          deletedAt: null,
        },
      });

      if (existingScheme) {
        // Throw an error to rollback the transaction, then catch it outside
        throw new Error('A weighting scheme with this name already exists');
      }

      // If this is set as default, unset any existing default (within transaction)
      if (isDefault) {
        await tx.weightingScheme.updateMany({
          where: {
            isDefault: true,
            deletedAt: null,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Create the new weighting scheme
      const newScheme = await tx.weightingScheme.create({
        data: {
          name,
          description: description ?? null, // Ensure null if empty string or undefined
          isDefault: isDefault || false,
        },
      });

      // Fetch all active categories
      const activeCategories = await tx.category.findMany({
        where: { deletedAt: null },
        include: {
          dimensions: { // Include dimensions to avoid N+1 queries later
            where: { deletedAt: null }
          }
        }
      });

      if (activeCategories.length > 0) {
        const categoryWeightValue = 1 / activeCategories.length;

        for (const category of activeCategories) {
          const createdCategoryWeight = await tx.categoryWeight.create({
            data: {
              weightingSchemeId: newScheme.id,
              categoryId: category.id,
              weight: categoryWeightValue,
            },
          });

          // Fetch active dimensions for this category (already fetched if include worked as expected)
          const activeDimensionsInCategory = category.dimensions;
          
          if (activeDimensionsInCategory.length > 0) {
            const dimensionWeightValue = 1 / activeDimensionsInCategory.length;
            for (const dimension of activeDimensionsInCategory) {
              await tx.dimensionWeight.create({
                data: {
                  categoryWeightId: createdCategoryWeight.id,
                  dimensionId: dimension.id,
                  weight: dimensionWeightValue,
                },
              });
            }
          }
        }
      }
      // Return the newly created scheme (weights are associated but not directly part of this object)
      return newScheme;
    });

    return NextResponse.json(newSchemeWithWeights, { status: 201 });

  } catch (error: any) {
    console.error('Error creating weighting scheme:', error);
    // Specific check for the unique constraint error thrown from the transaction
    if (error.message === 'A weighting scheme with this name already exists') {
      return NextResponse.json(
        { message: error.message },
        { status: 409 } // Conflict status code
      );
    }
    return NextResponse.json(
      { message: 'Error creating weighting scheme' },
      { status: 500 }
    );
  }
} 