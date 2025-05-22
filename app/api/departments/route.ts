import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!companyId) {
    return new NextResponse(JSON.stringify({ error: 'Company ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Authorization: User must be an Admin or belong to the requested company
  if (session.user.role !== Role.ADMIN && session.user.companyId !== companyId) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const departments = await prisma.department.findMany({
      where: {
        companyId: companyId,
        deletedAt: null, // Exclude soft-deleted departments
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch departments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 