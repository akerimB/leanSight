import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

// GET audit logs with pagination and filtering
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const userId = searchParams.get('userId');
  const action = searchParams.get('action');
  const entityType = searchParams.get('entityType');
  const startDate = searchParams.get('startDate'); // Expected format: YYYY-MM-DD
  const endDate = searchParams.get('endDate');     // Expected format: YYYY-MM-DD

  const skip = (page - 1) * limit;

  const where: any = {};
  if (userId) where.userId = userId;
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (entityType) where.entityType = entityType;
  if (startDate) {
    where.timestamp = { ...where.timestamp, gte: new Date(startDate) };
  }
  if (endDate) {
    // Add 1 day to endDate to include the whole day
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    where.timestamp = { ...where.timestamp, lt: endOfDay };
  }

  try {
    const logs = await prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { email: true, name: true } }, // Include user email and name
      },
    });

    const totalLogs = await prisma.auditLog.count({ where });

    return NextResponse.json({
      logs,
      totalPages: Math.ceil(totalLogs / limit),
      currentPage: page,
      totalLogs,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ message: 'Error fetching audit logs' }, { status: 500 });
  }
} 