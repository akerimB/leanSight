import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get total assessments
    const totalAssessments = await prisma.assessment.count({
      where: { status: { in: ['SUBMITTED', 'REVIEWED'] } }
    });

    // Get active companies
    const activeCompanies = await prisma.company.count({
      where: {
        assessments: {
          some: {}
        }
      }
    });

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get departments
    const departments = await prisma.department.count();

    // Calculate average score
    const scoreData = await prisma.assessment.findMany({
      where: { status: { in: ['SUBMITTED', 'REVIEWED'] } },
      select: {
        weightedAverageScore: true,
      }
    });

    let averageScore = 0;
    if (scoreData.length > 0) {
      const sum = scoreData.reduce((acc, curr) => {
        // Use weighted score if available
        const score = curr.weightedAverageScore || 0;
        return acc + score;
      }, 0);
      averageScore = sum / scoreData.length;
    }

    // Calculate completion rate
    // This is the % of dimensions that have answers in all assessments
    const assessmentsWithScores = await prisma.assessment.findMany({
      where: { status: { in: ['SUBMITTED', 'REVIEWED'] } },
      include: {
        scores: true,
        _count: {
          select: {
            scores: true
          }
        }
      }
    });

    // Dummy calculation for completion rate (would need to be refined based on your data model)
    // Here we assume each assessment should ideally have 20 dimensions answered
    const targetDimensions = 20;
    let completionRate = 0;
    
    if (assessmentsWithScores.length > 0) {
      const totalCompletion = assessmentsWithScores.reduce((acc, curr) => {
        const completion = Math.min(1, curr._count.scores / targetDimensions);
        return acc + completion;
      }, 0);
      completionRate = Math.round((totalCompletion / assessmentsWithScores.length) * 100);
    }

    return NextResponse.json({
      totalAssessments,
      activeCompanies,
      totalUsers,
      departments,
      averageScore,
      completionRate
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
} 