import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sectorId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { sectorId } = await context.params;

  try {
    const sector = await prisma.sector.findUnique({
      where: { id: sectorId },
      include: {
        descriptors: {
          include: {
            dimension: true,
          },
          where: {
            deletedAt: null,
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

    // Format the data for download
    const downloadData = {
      sectorName: sector.name,
      sectorDescription: sector.description,
      dimensions: sector.descriptors.reduce((acc, descriptor) => {
        const dimId = descriptor.dimension.id;
        if (!acc[dimId]) {
          acc[dimId] = {
            dimensionId: dimId,
            dimensionName: descriptor.dimension.name,
            descriptors: [],
          };
        }
        acc[dimId].descriptors.push({
          level: descriptor.level,
          description: descriptor.description,
        });
        return acc;
      }, {} as Record<string, { dimensionId: string; dimensionName: string; descriptors: Array<{ level: number; description: string }> }>),
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(downloadData, null, 2);

    // Create response with appropriate headers
    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${sector.name.toLowerCase().replace(/\s+/g, '-')}-maturity-levels.json"`,
      },
    });
  } catch (error) {
    console.error('Error generating download:', error);
    return NextResponse.json(
      { message: 'Error generating download' },
      { status: 500 }
    );
  }
} 