import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AssessmentStatus, Role } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
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

    // Check if user has necessary permissions
    if (!Object.values(Role).includes(session.user.role as Role)) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden - Insufficient permissions to access this resource' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    try {
      // Fetch assessment count
      const assessmentCount = await prisma.assessment.count({
        where: session.user.role === Role.ADMIN 
          ? undefined 
          : { companyId: session.user.companyId as string }
      });

      // Fetch active companies count
      const activeCompaniesCount = await prisma.company.count({
        where: session.user.role === Role.ADMIN 
          ? undefined 
          : { id: session.user.companyId as string }
      });

      // Fetch total users count
      const totalUsersCount = await prisma.user.count({
        where: session.user.role === Role.ADMIN 
          ? undefined 
          : { companyId: session.user.companyId as string }
      });

      // Fetch departments count
      const departmentsCount = await prisma.department.count({
        where: session.user.role === Role.ADMIN 
          ? undefined 
          : { companyId: session.user.companyId as string }
      });

      // Fetch recent activities
      const recentActivities = await prisma.assessment.findMany({
        where: session.user.role === Role.ADMIN 
          ? undefined 
          : { companyId: session.user.companyId as string },
        take: 10,
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          department: {
            include: {
              company: {
                include: {
                  sector: true
                }
              }
            }
          },
          expert: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              scores: true,
              evidence: true
            }
          }
        }
      });

      // Transform the data into the expected format
      const dashboardData = {
        quickStats: {
          totalAssessments: assessmentCount,
          activeCompanies: activeCompaniesCount,
          totalUsers: totalUsersCount,
          departments: departmentsCount
        },
        recentActivity: recentActivities.map(activity => ({
          id: activity.id,
          type: 'Assessment',
          title: `Assessment for ${activity.department?.company.name || 'Unknown Company'}`,
          subtitle: `${activity.department?.name || 'Company-wide'} - ${activity.department?.company.sector.name || 'Unknown Sector'}`,
          status: activity.status,
          date: activity.updatedAt.toISOString(),
          expert: activity.expert?.name,
          progress: {
            scores: activity._count.scores,
            evidence: activity._count.evidence
          },
          metadata: {
            companyId: activity.department?.company.id,
            departmentId: activity.department?.id,
            assessmentId: activity.id
          }
        }))
      };

      return NextResponse.json(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch dashboard data - Database error' }),
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