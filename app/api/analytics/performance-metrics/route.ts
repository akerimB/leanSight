import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'last30days';
    const companyId = searchParams.get('companyId');
    const departmentId = searchParams.get('departmentId');
    const sectorId = searchParams.get('sectorId');

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'last7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'lastyear':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Build filters based on user role and selections
    const isAdmin = session.user.role === 'ADMIN';
    let assessmentFilter: any = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    };

    if (!isAdmin) {
      assessmentFilter.companyId = session.user.companyId;
    } else if (companyId) {
      assessmentFilter.companyId = companyId;
    } else if (sectorId) {
      assessmentFilter.company = {
        sectorId: sectorId
      };
    }

    if (departmentId) {
      assessmentFilter.departmentId = departmentId;
    }

    // Get assessments for the period
    const assessments = await prisma.assessment.findMany({
      where: assessmentFilter,
      include: {
        company: {
          include: {
            sector: true
          }
        },
        department: true,
        scores: {
          include: {
            dimension: true
          }
        }
      }
    });

    // Get previous period for comparison
    const previousStartDate = new Date(startDate);
    const timeDiff = now.getTime() - startDate.getTime();
    previousStartDate.setTime(startDate.getTime() - timeDiff);

    const previousAssessments = await prisma.assessment.findMany({
      where: {
        ...assessmentFilter,
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      },
      include: {
        scores: {
          include: {
            dimension: true
          }
        }
      }
    });

    // Calculate overall scores
    const calculateOverallScore = (assessmentList: any[]) => {
      if (assessmentList.length === 0) return 0;
      const totalScore = assessmentList.reduce((sum, assessment) => {
        const avgScore = assessment.scores.reduce((scoreSum: number, score: any) => 
          scoreSum + score.level, 0) / assessment.scores.length;
        return sum + avgScore;
      }, 0);
      return totalScore / assessmentList.length;
    };

    const currentOverallScore = calculateOverallScore(assessments);
    const previousOverallScore = calculateOverallScore(previousAssessments);
    const scoreChange = currentOverallScore - previousOverallScore;
    const scoreChangePercent = previousOverallScore > 0 ? 
      ((currentOverallScore - previousOverallScore) / previousOverallScore) * 100 : 0;

    // Assessment counts - using correct enum values
    const totalAssessments = assessments.length;
    const completedAssessments = assessments.filter(a => a.status === 'REVIEWED').length;
    const inProgressAssessments = assessments.filter(a => a.status === 'SUBMITTED').length;
    const draftAssessments = assessments.filter(a => a.status === 'DRAFT').length;
    const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;

    // Dimension performance
    const dimensionMap = new Map();
    assessments.forEach(assessment => {
      assessment.scores.forEach((score: any) => {
        const dimId = score.dimension.id;
        if (!dimensionMap.has(dimId)) {
          dimensionMap.set(dimId, {
            id: dimId,
            name: score.dimension.name,
            scores: [],
            totalScore: 0,
            count: 0
          });
        }
        const dim = dimensionMap.get(dimId);
        dim.scores.push(score.level);
        dim.totalScore += score.level;
        dim.count += 1;
      });
    });

    const dimensionPerformance = Array.from(dimensionMap.values())
      .map((dim: any) => ({
        id: dim.id,
        name: dim.name,
        score: dim.count > 0 ? dim.totalScore / dim.count : 0,
        change: 0, // Calculate from previous period if needed
        rank: 0,
        isTopPerformer: false,
        isRiskArea: false
      }))
      .sort((a, b) => b.score - a.score)
      .map((dim, index) => ({
        ...dim,
        rank: index + 1,
        isTopPerformer: index < 2,
        isRiskArea: dim.score < 2.5
      }));

    // Sector benchmark (simplified)
    const sectorAverage = currentOverallScore; // Would need actual sector data
    const userScore = currentOverallScore;
    const percentile = Math.min(95, Math.max(5, (userScore / 5) * 100));
    const rank = Math.ceil((100 - percentile) / 10);

    // Time to completion analysis
    const completedAssessmentsWithTime = assessments.filter(a => 
      a.status === 'REVIEWED' && a.createdAt && a.updatedAt
    );
    
    const completionTimes = completedAssessmentsWithTime.map(a => {
      const timeDiff = new Date(a.updatedAt).getTime() - new Date(a.createdAt).getTime();
      return timeDiff / (1000 * 60 * 60 * 24); // days
    });

    const averageCompletionTime = completionTimes.length > 0 ? 
      completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length : 0;
    const fastestTime = completionTimes.length > 0 ? Math.min(...completionTimes) : 0;
    const slowestTime = completionTimes.length > 0 ? Math.max(...completionTimes) : 0;

    // User engagement (simplified) - using expertId instead of createdBy
    const uniqueUsers = new Set(assessments.map(a => a.expertId)).size;
    const totalUsers = 10; // Would need actual user count
    const engagementRate = totalUsers > 0 ? (uniqueUsers / totalUsers) * 100 : 0;
    const lastActivity = assessments.length > 0 ? 
      Math.max(...assessments.map(a => new Date(a.updatedAt).getTime())) : Date.now();

    const performanceMetrics = {
      overallScore: {
        current: currentOverallScore,
        previous: previousOverallScore,
        change: scoreChange,
        changePercent: scoreChangePercent,
        trend: scoreChange > 0.1 ? 'up' : scoreChange < -0.1 ? 'down' : 'flat',
        target: 4.0
      },
      assessmentCount: {
        total: totalAssessments,
        completed: completedAssessments,
        inProgress: inProgressAssessments,
        draft: draftAssessments,
        completionRate: completionRate
      },
      dimensionPerformance: dimensionPerformance.slice(0, 10),
      sectorBenchmark: {
        userScore: userScore,
        sectorAverage: sectorAverage,
        percentile: percentile,
        rank: rank,
        totalCompanies: 50 // Would need actual count
      },
      timeToCompletion: {
        average: averageCompletionTime,
        fastest: fastestTime,
        slowest: slowestTime,
        unit: 'days' as const
      },
      engagement: {
        activeUsers: uniqueUsers,
        totalUsers: totalUsers,
        engagementRate: engagementRate,
        lastActivity: new Date(lastActivity).toISOString()
      }
    };

    return NextResponse.json(performanceMetrics);

  } catch (error) {
    console.error('Performance metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
} 