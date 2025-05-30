import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = session.user.role;
  const userCompanyId = session.user.companyId;

  // Parse query params
  const url = new URL(request.url);
  const periodType = url.searchParams.get('periodType') || 'monthly'; // monthly, quarterly, yearly
  const periodsBack = parseInt(url.searchParams.get('periodsBack') || '12'); // how many periods back
  const filterCompanyId = url.searchParams.get('companyId');
  const filterDepartmentId = url.searchParams.get('departmentId');
  const filterSectorId = url.searchParams.get('sectorId');

  try {
    // Determine effective company filter
    let effectiveCompanyId = userCompanyId;
    if (userRole === Role.ADMIN) {
      effectiveCompanyId = filterCompanyId || null;
    }

    // Build base assessment filter
    const baseWhere: any = {};
    
    // Apply sector filter first (affects which companies are included)
    if (filterSectorId && userRole === Role.ADMIN) {
      baseWhere.company = {
        sectorId: filterSectorId
      };
    }

    // Apply company filter
    if (effectiveCompanyId) {
      if (baseWhere.company) {
        baseWhere.company.id = effectiveCompanyId;
      } else {
        baseWhere.companyId = effectiveCompanyId;
      }
    } else if (userRole !== Role.ADMIN) {
      baseWhere.companyId = '__NO_COMPANY_ACCESS__';
    }

    // Apply department filter
    if (filterDepartmentId) {
      baseWhere.departmentId = filterDepartmentId;
    }

    // Calculate periods
    const now = new Date();
    const periods: { start: Date; end: Date; label: string }[] = [];

    for (let i = 0; i < periodsBack; i++) {
      let start: Date, end: Date, label: string;

      if (periodType === 'monthly') {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);
        label = targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      } else if (periodType === 'quarterly') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const targetQuarter = currentQuarter - i;
        const targetYear = now.getFullYear() + Math.floor(targetQuarter / 4);
        const quarter = ((targetQuarter % 4) + 4) % 4;
        
        start = new Date(targetYear, quarter * 3, 1);
        end = new Date(targetYear, quarter * 3 + 3, 0, 23, 59, 59);
        label = `Q${quarter + 1} ${targetYear}`;
      } else { // yearly
        const targetYear = now.getFullYear() - i;
        start = new Date(targetYear, 0, 1);
        end = new Date(targetYear, 11, 31, 23, 59, 59);
        label = targetYear.toString();
      }

      periods.unshift({ start, end, label });
    }

    // Fetch data for each period
    const trendData = await Promise.all(
      periods.map(async (period) => {
        const whereClause = {
          ...baseWhere,
          createdAt: {
            gte: period.start,
            lte: period.end
          }
        };

        // Get overall average score for the period
        const scores = await prisma.score.findMany({
          where: { assessment: whereClause },
          select: { level: true }
        });

        const avgScore = scores.length > 0
          ? scores.reduce((sum, s) => sum + s.level, 0) / scores.length
          : 0;

        // Get assessment count
        const assessmentCount = await prisma.assessment.count({
          where: whereClause
        });

        // Get dimension averages
        const dimAvgs = await prisma.score.groupBy({
          by: ['dimensionId'],
          where: { assessment: whereClause },
          _avg: { level: true },
        });

        const dimensionIds = dimAvgs.map(d => d.dimensionId);
        const dimensions = await prisma.dimension.findMany({
          where: { id: { in: dimensionIds } },
          select: { id: true, name: true, categoryId: true }
        });

        const dimensionScores = dimAvgs.map(d => ({
          dimensionId: d.dimensionId,
          dimensionName: dimensions.find(dim => dim.id === d.dimensionId)?.name || 'Unknown',
          categoryId: dimensions.find(dim => dim.id === d.dimensionId)?.categoryId,
          avgScore: d._avg.level ?? 0
        }));

        // Get category averages
        const categoryMap: Record<string, { total: number; count: number; name: string }> = {};
        
        dimensionScores.forEach(({ categoryId, avgScore }) => {
          if (categoryId) {
            if (!categoryMap[categoryId]) {
              categoryMap[categoryId] = { total: 0, count: 0, name: '' };
            }
            categoryMap[categoryId].total += avgScore;
            categoryMap[categoryId].count += 1;
          }
        });

        // Get category names
        const categoryIds = Object.keys(categoryMap);
        if (categoryIds.length > 0) {
          const categories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true }
          });

          categories.forEach(cat => {
            if (categoryMap[cat.id]) {
              categoryMap[cat.id].name = cat.name;
            }
          });
        }

        const categoryScores = Object.entries(categoryMap).map(([categoryId, data]) => ({
          categoryId,
          categoryName: data.name,
          avgScore: data.total / data.count
        }));

        return {
          period: period.label,
          start: period.start,
          end: period.end,
          avgScore: Number(avgScore.toFixed(2)),
          assessmentCount,
          dimensionScores,
          categoryScores
        };
      })
    );

    // Calculate trends (month-over-month, quarter-over-quarter, etc.)
    const trendsWithChange = trendData.map((current, index) => {
      const previous = index > 0 ? trendData[index - 1] : null;
      const change = previous ? Number((current.avgScore - previous.avgScore).toFixed(2)) : 0;
      const changePercent = previous && previous.avgScore > 0 
        ? Number(((change / previous.avgScore) * 100).toFixed(1))
        : 0;

      return {
        ...current,
        change,
        changePercent,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
      };
    });

    // Get dimension trends (top 5 dimensions)
    const allDimensions = new Map<string, { name: string; data: Array<{ period: string; score: number }> }>();
    
    trendData.forEach(periodData => {
      periodData.dimensionScores.forEach(dim => {
        if (!allDimensions.has(dim.dimensionId)) {
          allDimensions.set(dim.dimensionId, {
            name: dim.dimensionName,
            data: []
          });
        }
        allDimensions.get(dim.dimensionId)!.data.push({
          period: periodData.period,
          score: dim.avgScore
        });
      });
    });

    // Sort dimensions by latest score and take top 5
    const dimensionTrends = Array.from(allDimensions.entries())
      .map(([id, data]) => ({
        dimensionId: id,
        dimensionName: data.name,
        data: data.data,
        latestScore: data.data[data.data.length - 1]?.score || 0
      }))
      .sort((a, b) => b.latestScore - a.latestScore)
      .slice(0, 5);

    // Get category trends
    const allCategories = new Map<string, { name: string; data: Array<{ period: string; score: number }> }>();
    
    trendData.forEach(periodData => {
      periodData.categoryScores.forEach(cat => {
        if (!allCategories.has(cat.categoryId)) {
          allCategories.set(cat.categoryId, {
            name: cat.categoryName,
            data: []
          });
        }
        allCategories.get(cat.categoryId)!.data.push({
          period: periodData.period,
          score: cat.avgScore
        });
      });
    });

    const categoryTrends = Array.from(allCategories.entries()).map(([id, data]) => ({
      categoryId: id,
      categoryName: data.name,
      data: data.data,
      latestScore: data.data[data.data.length - 1]?.score || 0
    }));

    return NextResponse.json({
      periodType,
      periodsBack,
      overallTrend: trendsWithChange,
      dimensionTrends,
      categoryTrends,
      summary: {
        totalPeriods: trendData.length,
        avgScoreRange: {
          min: Math.min(...trendData.map(d => d.avgScore)),
          max: Math.max(...trendData.map(d => d.avgScore))
        },
        totalAssessments: trendData.reduce((sum, d) => sum + d.assessmentCount, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching trend data:', error);
    return NextResponse.json({ error: 'Failed to fetch trend data' }, { status: 500 });
  }
} 