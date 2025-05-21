import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized - Admins only' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  if (!companyId) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing companyId' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // load default categories and dimensions
    const categories = await prisma.category.findMany({
      include: {
        dimensions: {
          select: { id: true, name: true },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    // load existing configs
    const configs = await prisma.templateConfig.findMany({ where: { companyId } });
    const result = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      dimensions: cat.dimensions.map(dim => {
        const cfg = configs.find(c => c.dimensionId === dim.id);
        return { id: dim.id, name: dim.name, enabled: cfg ? cfg.enabled : true };
      })
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET templates error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch template configs' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized - Admins only' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { companyId, configs } = await request.json();
    if (!companyId || !Array.isArray(configs)) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: companyId, configs array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // upsert each config
    const ops = configs.map((c: { dimensionId: string; enabled: boolean }) =>
      prisma.templateConfig.upsert({
        where: { companyId_dimensionId: { companyId, dimensionId: c.dimensionId } },
        create: { companyId, dimensionId: c.dimensionId, enabled: c.enabled },
        update: { enabled: c.enabled }
      })
    );
    await prisma.$transaction(ops);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST templates error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to save template configs' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 