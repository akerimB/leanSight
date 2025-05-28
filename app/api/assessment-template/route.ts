import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized - Please sign in to access this resource' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get('departmentId');
  const companyId = searchParams.get('companyId');
  if (!departmentId && !companyId) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing required parameter: departmentId or companyId' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let sectorId: string;
  try {
    // Validate parameters are valid UUIDs
    const validateUUID = (id: string | null, name: string) => {
      if (!id) return;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new Error(`Invalid ${name} ID format: ${id}`);
      }
    };

    validateUUID(departmentId, 'department');
    validateUUID(companyId, 'company');

    if (departmentId) {
      // Fetch department to get sector and check permissions
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
        include: { company: { select: { id: true, sectorId: true } } },
      });

      if (!department) {
        console.error(`Department not found with ID: ${departmentId}`);
        return new NextResponse(
          JSON.stringify({ error: `Department with ID ${departmentId} not found` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!department.company) {
        console.error(`Department ${departmentId} has no associated company`);
        return new NextResponse(
          JSON.stringify({ error: `Department has no associated company. Please contact your administrator.` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!department.company.sectorId) {
        console.error(`Company ${department.company.id} has no associated sector`);
        return new NextResponse(
          JSON.stringify({ error: `Company has no associated sector. Please contact your administrator.` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (session.user.role !== Role.ADMIN && session.user.companyId !== department.company.id) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - You do not have access to this department' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      sectorId = department.company.sectorId;
    } else {
      // Company-wide: fetch company to get sector
      const company = await prisma.company.findUnique({
        where: { id: companyId! },
        select: { id: true, sectorId: true },
      });
      
      if (!company) {
        console.error(`Company not found with ID: ${companyId}`);
        return new NextResponse(
          JSON.stringify({ error: `Company with ID ${companyId} not found` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!company.sectorId) {
        console.error(`Company ${companyId} has no associated sector`);
        return new NextResponse(
          JSON.stringify({ error: `Company has no associated sector. Please contact your administrator.` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (session.user.role !== Role.ADMIN && session.user.companyId !== company.id) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - You do not have access to this company' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      sectorId = company.sectorId;
    }

    // Verify the sector exists
    const sectorExists = await prisma.sector.findUnique({
      where: { id: sectorId },
      select: { id: true }
    });

    if (!sectorExists) {
      console.error(`Sector not found with ID: ${sectorId}`);
      return new NextResponse(
        JSON.stringify({ error: `The sector associated with this company is not found. Please contact your administrator.` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch categories, dimensions, and maturity descriptors filtered by sector
    const categories = await prisma.category.findMany({
      include: {
        dimensions: {
          where: {
            descriptors: {
              some: {
                sectorId,
                deletedAt: null
              }
            }
          },
          include: {
            descriptors: {
              where: { sectorId, deletedAt: null },
              orderBy: { level: 'asc' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Check if we have any categories with dimensions
    if (!categories.length) {
      console.error(`No categories found for sector: ${sectorId}`);
      return new NextResponse(
        JSON.stringify({ 
          error: `No assessment template found for this company/department. Please contact your administrator to set up a template.`,
          details: "No categories available"
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if we have dimensions with descriptors
    const hasDimensions = categories.some(category => 
      category.dimensions && category.dimensions.length > 0 && 
      category.dimensions.some(dim => dim.descriptors && dim.descriptors.length > 0)
    );

    if (!hasDimensions) {
      console.error(`No dimensions with descriptors found for sector: ${sectorId}`);
      return new NextResponse(
        JSON.stringify({ 
          error: `No dimensions with maturity levels found for this company/department. Please contact your administrator to set up maturity descriptors.`,
          details: "Missing dimensions or descriptors"
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(JSON.stringify(categories), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching assessment template:', error);
    const errorMessage = error.message || 'Failed to fetch assessment template';
    return new NextResponse(
      JSON.stringify({ 
        error: errorMessage,
        details: error.stack
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 