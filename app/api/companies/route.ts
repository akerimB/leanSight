import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    if (session.user.role === Role.ADMIN) {
      // Admin: Fetch all companies
      const companies = await prisma.company.findMany({
        where: { deletedAt: null }, // Exclude soft-deleted companies
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      });
      return NextResponse.json(companies);
    } else if (session.user.companyId) {
      // Non-Admin: Fetch only their own company
      const company = await prisma.company.findUnique({
        where: { id: session.user.companyId, deletedAt: null },
        select: { id: true, name: true },
      });
      if (!company) {
        // This case should ideally not happen if user has a companyId
        return NextResponse.json([]); // Return empty array or appropriate error
      }
      return NextResponse.json([company]); // Return as an array for consistency
    } else {
      // Non-Admin with no companyId - should not have access to any company data
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching companies:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch companies' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 