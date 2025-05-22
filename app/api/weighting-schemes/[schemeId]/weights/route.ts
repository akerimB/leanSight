import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const weightSchema = z.object({
  weights: z.record(z.object({
    weight: z.number().min(0).max(1),
    dimensions: z.record(z.number().min(0).max(1)),
  })),
});

function extractSchemeId(request: Request) {
  const segments = new URL(request.url).pathname.split('/');
  return segments[segments.length - 2]; // -2 because the last segment is 'weights'
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const schemeId = extractSchemeId(request);
    const body = await request.json();
    const validation = weightSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.formErrors.fieldErrors },
        { status: 400 }
      );
    }

    const { weights } = validation.data;

    // Validate that category weights sum to 1
    const categorySum = Object.values(weights).reduce((sum, cat) => sum + cat.weight, 0);
    if (Math.abs(categorySum - 1) > 0.01) {
      return NextResponse.json(
        { message: 'Category weights must sum to 1' },
        { status: 400 }
      );
    }

    // Validate that dimension weights within each category sum to 1
    for (const categoryId in weights) {
      const dimensionSum = Object.values(weights[categoryId].dimensions).reduce((sum, weight) => sum + weight, 0);
      if (Math.abs(dimensionSum - 1) > 0.01) {
        return NextResponse.json(
          { message: `Dimension weights in category must sum to 1` },
          { status: 400 }
        );
      }
    }

    // Update all weights in a transaction
    await prisma.$transaction(async (tx) => {
      // Update category weights
      for (const categoryId in weights) {
        const categoryWeight = await tx.categoryWeight.upsert({
          where: {
            categoryId_weightingSchemeId: {
              categoryId,
              weightingSchemeId: schemeId,
            },
          },
          create: {
            categoryId,
            weightingSchemeId: schemeId,
            weight: weights[categoryId].weight,
          },
          update: {
            weight: weights[categoryId].weight,
          },
        });

        // Update dimension weights
        for (const dimensionId in weights[categoryId].dimensions) {
          await tx.dimensionWeight.upsert({
            where: {
              dimensionId_categoryWeightId: {
                dimensionId,
                categoryWeightId: categoryWeight.id,
              },
            },
            create: {
              dimensionId,
              categoryWeightId: categoryWeight.id,
              weight: weights[categoryId].dimensions[dimensionId],
            },
            update: {
              weight: weights[categoryId].dimensions[dimensionId],
            },
          });
        }
      }
    });

    return NextResponse.json({ message: 'Weights updated successfully' });
  } catch (error) {
    console.error('Error updating weights:', error);
    return NextResponse.json(
      { message: 'Error updating weights' },
      { status: 500 }
    );
  }
} 