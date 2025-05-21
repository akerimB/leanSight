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
    if (departmentId) {
      // Fetch department to get sector and check permissions
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
        include: { company: { select: { id: true, sectorId: true } } },
      });
      if (!department) {
        return new NextResponse(
          JSON.stringify({ error: 'Department not found' }),
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
        return new NextResponse(
          JSON.stringify({ error: 'Company not found' }),
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
    // Fetch categories, dimensions, and maturity descriptors filtered by sector
    const categories = await prisma.category.findMany({
      include: {
        dimensions: {
          include: {
            descriptors: {
              where: { sectorId },
              orderBy: { level: 'asc' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return new NextResponse(JSON.stringify(categories), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching assessment template:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch assessment template' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 