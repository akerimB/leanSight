import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized - Please sign in to access this resource' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    if (!session.user?.role) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid session - Missing user role' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Support fetching a single company by id
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      // Only allow admins or the owner company
      if (session.user.role !== Role.ADMIN && session.user.companyId !== id) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          sector: { select: { id: true, name: true } },
          departments: {
            select: {
              id: true,
              name: true,
              _count: { select: { assessments: true } },
            },
          },
          _count: { select: { users: true, assessments: true, departments: true } },
        },
      });
      if (!company) {
        return new NextResponse(JSON.stringify({ error: 'Company not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return NextResponse.json(company);
    }

    // For non-admin users, only return their company
    const where = session.user.role === Role.ADMIN 
      ? undefined
      : session.user.companyId 
        ? { id: session.user.companyId }
        : undefined;

    try {
      const companies = await prisma.company.findMany({
        where,
        include: {
          sector: {
            select: {
              id: true,
              name: true
            }
          },
          departments: {
            select: {
              id: true,
              name: true,
              _count: {
                select: {
                  assessments: true
                }
              }
            }
          },
          _count: {
            select: {
              users: true,
              assessments: true,
              departments: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return NextResponse.json(companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch companies - Database error' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error) {
    console.error('Session validation error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Authentication error' }),
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== Role.ADMIN) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    try {
      const body = await request.json();
      const { name, sectorId } = body;

      if (!name || !sectorId) {
        return new NextResponse(
          JSON.stringify({ error: 'Missing required fields: name and sectorId are required' }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      // Check if sector exists
      const sector = await prisma.sector.findUnique({
        where: { id: sectorId }
      });

      if (!sector) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid sector ID' }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      const company = await prisma.company.create({
        data: {
          name,
          sectorId,
        },
        include: {
          sector: true,
          departments: true,
          _count: {
            select: {
              users: true,
              assessments: true
            }
          }
        },
      });

      return NextResponse.json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create company - Database error' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error) {
    console.error('Session validation error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Authentication error' }),
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

// Add update (PUT) for company
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized - Admin access required' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  try {
    const body = await request.json();
    const { id, name, sectorId } = body;
    if (!id || !name || !sectorId) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: id, name, sectorId are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const company = await prisma.company.update({
      where: { id },
      data: { name, sectorId },
      include: {
        sector: true,
        departments: true,
        _count: { select: { users: true, assessments: true } },
      },
    });
    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update company - Database error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== Role.ADMIN) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return new NextResponse(
          JSON.stringify({ error: 'Company ID is required' }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      // Check if company exists and has no dependencies
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              departments: true,
              users: true,
              assessments: true
            }
          }
        }
      });

      if (!company) {
        return new NextResponse(
          JSON.stringify({ error: 'Company not found' }),
          { 
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      if (company._count.departments > 0 || company._count.users > 0 || company._count.assessments > 0) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Cannot delete company with existing departments, users, or assessments' 
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      await prisma.company.delete({
        where: { id },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting company:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to delete company - Database error' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error) {
    console.error('Session validation error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Authentication error' }),
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 