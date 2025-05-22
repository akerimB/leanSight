import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Define the expected structure for a dimension object in the JSON array
const dimensionJsonSchema = z.object({
  dimensionName: z.string().min(1, { message: "Dimension name is required." }),
  weight: z.number().min(0).max(1).optional(), // Weight is now for DimensionWeightInSector
  description: z.string().optional(), // Optional global description for the dimension
  categoryId: z.string().uuid({ message: "Invalid Category ID format."}).optional(), // Expecting UUID for categoryId, if provided
  levels: z.array(z.string()).length(5, { message: "Each dimension must have exactly 5 level descriptions." }),
});

// Define the overall schema for the JSON file (an array of dimension objects)
const importJsonSchema = z.array(dimensionJsonSchema).min(1, { message: "JSON file must contain at least one dimension." });

export async function POST(
  request: Request,
  { params }: { params: { sectorId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const targetSectorId = params.sectorId;

  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(targetSectorId)) {
    return NextResponse.json({ message: 'Invalid target sector ID format.' }, { status: 400 });
  }

  try {
    const targetSector = await prisma.sector.findUnique({
      where: { id: targetSectorId, deletedAt: null },
    });
    if (!targetSector) {
      return NextResponse.json({ message: 'Target sector not found or has been deleted.' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }
    if (file.type !== 'application/json') {
      return NextResponse.json({ message: 'Invalid file type. Please upload a JSON file.' }, { status: 400 });
    }

    const fileText = await file.text();
    let jsonData;
    try {
      jsonData = JSON.parse(fileText);
    } catch (e) {
      return NextResponse.json({ message: 'Invalid JSON format in the uploaded file.' }, { status: 400 });
    }

    const validation = importJsonSchema.safeParse(jsonData);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid JSON structure or content.', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const dimensionsToImport = validation.data;
    let dimensionsProcessed = 0, descriptorsCreated = 0, descriptorsUpdated = 0, weightsSet = 0;
    const operationDetails: string[] = [];

    // User MUST ensure their schema.prisma reflects the following for Dimension model:
    // model Dimension {
    //   name        String  @unique
    //   description String? // Made optional
    //   categoryName String? // Changed to simple optional string
    //   // NO 'weight' field here
    //   dimensionWeightings DimensionWeightInSector[]
    // }
    // And run `npx prisma generate` after schema changes.

    await prisma.$transaction(async (tx) => {
      for (const dimJson of dimensionsToImport) {
        // Prepare payload for Dimension upsert
        const dimensionCreateData: any = {
          name: dimJson.dimensionName,
          description: dimJson.description, // Will be undefined if not in JSON, schema handles optionality
        };
        if (dimJson.categoryId) { // Only connect if categoryId is provided
          // Basic check: Ensure the category exists before trying to connect.
          // More robust: You might want to ensure categoryId is valid or handle errors if it doesn't exist.
          const categoryExists = await tx.category.findUnique({ where: { id: dimJson.categoryId }});
          if (categoryExists) {
            dimensionCreateData.categoryId = dimJson.categoryId;
          } else {
            operationDetails.push(`Warning: Category ID "${dimJson.categoryId}" for dimension "${dimJson.dimensionName}" not found. Dimension will be created without category linkage.`);
            // Optionally, you could choose to skip this dimension or handle error differently
          }
        }

        const dimensionUpdateData: any = {
            description: dimJson.description,
        };
        if (dimJson.categoryId !== undefined) { // Allow unsetting categoryId if explicitly null or a new ID
            const categoryExists = dimJson.categoryId ? await tx.category.findUnique({ where: { id: dimJson.categoryId }}) : null;
            if (dimJson.categoryId && categoryExists) {
                dimensionUpdateData.categoryId = dimJson.categoryId;
            } else if (dimJson.categoryId) { // categoryId provided but does not exist
                operationDetails.push(`Warning: Category ID "${dimJson.categoryId}" for dimension "${dimJson.dimensionName}" not found. Category linkage not updated.`);
            } else { // categoryId is null or undefined in JSON, so disconnect/unset
                dimensionUpdateData.categoryId = null;
            }
        }
        
        const dimension = await tx.dimension.upsert({
          where: { name: dimJson.dimensionName }, 
          create: dimensionCreateData,
          update: dimensionUpdateData,
        });
        dimensionsProcessed++;
        operationDetails.push(`Processed dimension: "${dimension.name}".`);

        // Upsert Sector-Specific Weight if provided in JSON
        if (dimJson.weight !== undefined) {
          await tx.dimensionWeightInSector.upsert({
            where: {
              dimensionId_sectorId: { // Uses the @@unique([dimensionId, sectorId]) compound key
                dimensionId: dimension.id,
                sectorId: targetSectorId,
              }
            },
            create: {
              dimensionId: dimension.id,
              sectorId: targetSectorId,
              weight: dimJson.weight,
            },
            update: {
              weight: dimJson.weight,
            },
          });
          weightsSet++;
          operationDetails.push(`  - Weight for "${dimension.name}" in sector "${targetSector.name}" set to ${(dimJson.weight * 100).toFixed(0)}%.`);
        }

        // Upsert/Create Maturity Descriptors
        for (let i = 0; i < dimJson.levels.length; i++) {
          const level = i + 1;
          const description = dimJson.levels[i];
          const existingDescriptor = await tx.maturityDescriptor.findFirst({
            where: { dimensionId: dimension.id, sectorId: targetSectorId, level: level }
          });
          if (existingDescriptor) {
            await tx.maturityDescriptor.update({ where: { id: existingDescriptor.id }, data: { description, deletedAt: null } });
            descriptorsUpdated++;
          } else {
            await tx.maturityDescriptor.create({ data: { dimensionId: dimension.id, sectorId: targetSectorId, level, description } });
            descriptorsCreated++;
          }
        }
      }
    });
    
    return NextResponse.json({
      message: `Import successful. Dims processed: ${dimensionsProcessed}. Weights set/updated: ${weightsSet}. Descs created: ${descriptorsCreated}. Descs updated: ${descriptorsUpdated}.`,
      details: operationDetails,
    }, { status: 200 });

  } catch (error) {
    console.error('Error importing descriptors from JSON:', error);
    let errorMessage = 'An unexpected error occurred during JSON import.';
    if (error instanceof z.ZodError) { 
        errorMessage = 'Invalid data structure after parsing.'; 
        return NextResponse.json({ message: errorMessage, errors: error.flatten().fieldErrors }, { status: 400 });
    }
    // Add more specific error handling for Prisma errors if needed
    // Example: if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { ... }
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
} 