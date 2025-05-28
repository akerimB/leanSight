import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const importDescriptorsSchema = z.object({
  // Expect an array of UUIDs for descriptorIds from the source sector
  descriptorIds: z.array(z.string().uuid({ message: "Each descriptor ID must be a valid UUID." })).min(1, { message: "At least one descriptor ID must be provided." }),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ sectorId: string }> } // sectorId here is the ID of the target sector
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { sectorId } = await context.params;

  // Validate targetSectorId is a UUID (optional, but good practice if not guaranteed by router)
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sectorId)) {
    return NextResponse.json({ message: 'Invalid target sector ID format.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = importDescriptorsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { descriptorIds: sourceDescriptorIds } = validation.data;

    // 1. Fetch the target sector to ensure it exists and is not deleted
    const targetSector = await prisma.sector.findUnique({
      where: { id: sectorId, deletedAt: null },
    });

    if (!targetSector) {
      return NextResponse.json({ message: 'Target sector not found or has been deleted.' }, { status: 404 });
    }

    // 2. Fetch the source descriptors that are not soft-deleted
    const sourceDescriptors = await prisma.maturityDescriptor.findMany({
      where: {
        id: { in: sourceDescriptorIds },
        deletedAt: null, // Important: only copy active descriptors
      },
    });

    if (sourceDescriptors.length === 0) {
      return NextResponse.json({ message: 'No valid source descriptors found for the provided IDs, or they might have been deleted.' }, { status: 404 });
    }
    
    // If the number of found source descriptors doesn't match the input, some IDs were invalid or deleted
    if (sourceDescriptors.length !== sourceDescriptorIds.length) {
        console.warn(`Expected ${sourceDescriptorIds.length} source descriptors, found ${sourceDescriptors.length}. Some IDs might be invalid or refer to deleted descriptors.`);
        // Proceeding with the ones found
    }


    let importedCount = 0;
    let skippedCount = 0;
    const createdDescriptorDetails = [];

    // 3. For each source descriptor, try to create it in the target sector
    for (const sourceDescriptor of sourceDescriptors) {
      // Check if a descriptor with the same dimensionId and level already exists in the target sector
      const existingDescriptor = await prisma.maturityDescriptor.findFirst({
        where: {
          sectorId: sectorId,
          dimensionId: sourceDescriptor.dimensionId,
          level: sourceDescriptor.level,
          deletedAt: null, // Check against active descriptors in the target sector
        },
      });

      if (existingDescriptor) {
        skippedCount++;
      } else {
        // Create the new descriptor for the target sector
        const newDescriptor = await prisma.maturityDescriptor.create({
          data: {
            sectorId: sectorId,
            dimensionId: sourceDescriptor.dimensionId,
            level: sourceDescriptor.level,
            description: sourceDescriptor.description,
            // createdAt and updatedAt will be set by Prisma
            // id will be auto-generated
          },
        });
        createdDescriptorDetails.push({ 
            id: newDescriptor.id, 
            dimensionId: newDescriptor.dimensionId, 
            level: newDescriptor.level 
        });
        importedCount++;
      }
    }

    return NextResponse.json({
      message: `Descriptors import process completed. Successfully imported: ${importedCount}. Skipped due to existing duplicates: ${skippedCount}.`,
      importedCount,
      skippedCount,
      // Optionally return details of created descriptors if useful for frontend
      // createdDescriptors: createdDescriptorDetails 
    }, { status: 200 }); // 200 OK as it's a batch operation with partial success/skips possible

  } catch (error) {
    console.error('Error importing maturity descriptors:', error);
    let errorMessage = 'An unexpected error occurred while importing maturity descriptors.';
    if (error instanceof z.ZodError) { // Should be caught by safeParse, but as a fallback
        return NextResponse.json({ message: 'Invalid request body structure.', errors: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // Consider more specific Prisma error handling if needed
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
} 