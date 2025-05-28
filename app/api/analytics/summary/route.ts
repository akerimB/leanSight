import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, AssessmentStatus } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userRole = session.user.role;
  const userCompanyId = session.user.companyId;

  // Parse query params
  const url = new URL(request.url);
  const timeRange = url.searchParams.get('timeRange') || 'last30days';
  const filterCompanyId = url.searchParams.get('companyId');
  const filterDepartmentId = url.searchParams.get('departmentId');

  const to = new Date();
  let from: Date;
  let fromPrev: Date; // Start of the previous period
  let toPrev: Date;   // End of the previous period

  switch (timeRange) {
    case 'last7days':
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      from = new Date(Date.now() - sevenDays);
      toPrev = new Date(from.getTime() - 1); // End of prev period is 1ms before start of current
      fromPrev = new Date(toPrev.getTime() - sevenDays + 1);
      break;
    case 'last30days':
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      from = new Date(Date.now() - thirtyDays);
      toPrev = new Date(from.getTime() - 1);
      fromPrev = new Date(toPrev.getTime() - thirtyDays + 1);
      break;
    case 'last90days':
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      from = new Date(Date.now() - ninetyDays);
      toPrev = new Date(from.getTime() - 1);
      fromPrev = new Date(toPrev.getTime() - ninetyDays + 1);
      break;
    case 'lastYear':
      from = new Date(new Date().setFullYear(to.getFullYear() - 1));
      toPrev = new Date(from.getTime() - 1);
      // For lastYear, the previous period is the year before that.
      fromPrev = new Date(new Date(toPrev).setFullYear(toPrev.getFullYear() - 1));
      fromPrev.setDate(fromPrev.getDate() +1); // Adjust to be start of year typically
      break;
    default: // Default to last30days logic
      const defaultDays = 30 * 24 * 60 * 60 * 1000;
      from = new Date(Date.now() - defaultDays);
      toPrev = new Date(from.getTime() - 1);
      fromPrev = new Date(toPrev.getTime() - defaultDays + 1);
  }

  // Filter assessments by date and company (if not admin)
  const assessmentWhereCurrent: any = { createdAt: { gte: from, lte: to } };
  const assessmentWherePrevious: any = { createdAt: { gte: fromPrev, lte: toPrev } };

  // Apply company filter
  let effectiveCompanyId = userCompanyId; // Default to user's own company for non-admins
  if (userRole === Role.ADMIN) {
    if (filterCompanyId) {
      effectiveCompanyId = filterCompanyId; // Admin can filter by any company
    } else {
      effectiveCompanyId = null; // Admin requesting all companies (no filterCompanyId provided)
    }
  }
  // For non-admins, effectiveCompanyId is already their own. If filterCompanyId is provided but doesn't match, it's ignored.
  // If an admin wants data for a specific company, they must provide filterCompanyId.
  // If an admin wants ALL companies, they provide no filterCompanyId (effectiveCompanyId becomes null).

  if (effectiveCompanyId) { // Apply company filter if an effectiveCompanyId is set
    assessmentWhereCurrent.companyId = effectiveCompanyId;
    assessmentWherePrevious.companyId = effectiveCompanyId;
  } else if (userRole !== Role.ADMIN && !effectiveCompanyId) {
    // This case implies a non-admin user has no companyId, which is problematic.
    // For safety, prevent data leakage by ensuring they can't fetch anything.
    assessmentWhereCurrent.companyId = '__NO_COMPANY_ACCESS__'; 
    assessmentWherePrevious.companyId = '__NO_COMPANY_ACCESS__';
  }
  // If userRole is ADMIN and effectiveCompanyId is null, no companyId filter is applied (all companies).

  // Apply department filter (if provided)
  if (filterDepartmentId) {
    assessmentWhereCurrent.departmentId = filterDepartmentId;
    assessmentWherePrevious.departmentId = filterDepartmentId;
  }

  // 1. Fetch scores for overall avg and trends (CURRENT PERIOD)
  const scoresCurrent = await prisma.score.findMany({
    where: { assessment: assessmentWhereCurrent },
    select: { level: true, assessment: { select: { createdAt: true, departmentId: true } } }
  });

  const overallAvgCurrent = scoresCurrent.length > 0
    ? scoresCurrent.reduce((sum, s) => sum + s.level, 0) / scoresCurrent.length
    : 0;

  // Fetch scores for PREVIOUS PERIOD overall average
  const scoresPrevious = await prisma.score.findMany({
    where: { assessment: assessmentWherePrevious },
    select: { level: true }
  });

  const overallAvgPrevious = scoresPrevious.length > 0
    ? scoresPrevious.reduce((sum, s) => sum + s.level, 0) / scoresPrevious.length
    : 0;

  // Calculate score distribution for histogram (uses scoresCurrent)
  const scoreDistributionData: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  scoresCurrent.forEach(score => {
    if (score.level >= 1 && score.level <= 5) {
      scoreDistributionData[Math.round(score.level)] = (scoreDistributionData[Math.round(score.level)] || 0) + 1;
    }
  });
  const scoreDistribution = Object.entries(scoreDistributionData).map(([level, count]) => ({
    level: parseInt(level, 10),
    count
  }));

  // Trends map uses scoresCurrent
  const trendsMap: Record<string, { total: number; count: number }> = {};
  scoresCurrent.forEach(({ level, assessment }) => {
    const dateKey = assessment.createdAt.toISOString().split('T')[0];
    if (!trendsMap[dateKey]) trendsMap[dateKey] = { total: 0, count: 0 };
    trendsMap[dateKey].total += level;
    trendsMap[dateKey].count += 1;
  });
  const trends = Object.entries(trendsMap).map(([period, v]) => ({ period, avgScore: v.total / v.count }));

  // Dimension breakdown uses assessmentWhereCurrent
  const dimAvgs = await prisma.score.groupBy({
    by: ['dimensionId'],
    where: { assessment: assessmentWhereCurrent },
    _avg: { level: true },
  });
  const dimensionIds = dimAvgs.map((d) => d.dimensionId);
  const dimensions = await prisma.dimension.findMany({
    where: { id: { in: dimensionIds } },
    select: { id: true, name: true },
  });
  const dimensionBreakdown = dimAvgs.map((d) => ({
    dimensionId: d.dimensionId,
    dimensionName: dimensions.find((dm) => dm.id === d.dimensionId)?.name || '',
    avgScore: d._avg.level ?? 0,
  }));

  // Calculate Dimension Breakdown for the PREVIOUS period
  const dimAvgsPrevious = await prisma.score.groupBy({
    by: ['dimensionId'],
    where: { assessment: assessmentWherePrevious }, // Use previous period's assessment filter
    _avg: { level: true },
  });
  const dimensionIdsPrevious = dimAvgsPrevious.map((d) => d.dimensionId);
  const dimensionsPrevious = await prisma.dimension.findMany({
    where: { id: { in: dimensionIdsPrevious } },
    select: { id: true, name: true },
  });
  const dimensionBreakdownPrevious = dimAvgsPrevious.map((d) => ({
    dimensionId: d.dimensionId,
    dimensionName: dimensionsPrevious.find((dm) => dm.id === d.dimensionId)?.name || '',
    avgScore: d._avg.level ?? 0,
  }));

  // Category distribution uses data derived from current period dimensionBreakdown
  const dimsFull = await prisma.dimension.findMany({
    where: { id: { in: dimensionIds } },
    select: {
      id: true,
      category: { select: { id: true, name: true } },
    },
  });
  const catMap: Record<string, { total: number; count: number; categoryName: string }> = {};
  dimensionBreakdown.forEach(({ dimensionId, avgScore }) => {
    const dim = dimsFull.find((d) => d.id === dimensionId);
    if (!dim || !dim.category) return;
    const { id: catId, name: categoryName } = dim.category;
    if (!catMap[catId]) catMap[catId] = { total: 0, count: 0, categoryName };
    catMap[catId].total += avgScore;
    catMap[catId].count += 1;
  });
  const categoryDistribution = Object.entries(catMap).map(([categoryId, v]) => ({
    categoryId,
    categoryName: v.categoryName,
    avgScore: v.total / v.count,
  }));

  // Automated Strengths & Weaknesses (based on Categories)
  const sortedCategories = [...categoryDistribution].sort((a, b) => b.avgScore - a.avgScore);
  const topCategories = sortedCategories.slice(0, 3);
  const weakCategories = sortedCategories.slice(-3).reverse();

  // Automated Strengths & Weaknesses (based on Dimensions)
  const sortedDimensions = [...dimensionBreakdown].sort((a, b) => b.avgScore - a.avgScore);
  const topDimensions = sortedDimensions.slice(0, 3);
  const weakDimensions = sortedDimensions.slice(-3).reverse();

  // Department comparison uses scoresCurrent
  const deptMap: Record<string, { total: number; count: number }> = {};
  scoresCurrent.forEach(({ level, assessment }) => {
    const deptId = assessment.departmentId ?? 'Unassigned';
    if (!deptMap[deptId]) deptMap[deptId] = { total: 0, count: 0 };
    deptMap[deptId].total += level;
    deptMap[deptId].count += 1;
  });
  const deptIds = Object.keys(deptMap).filter((id) => id !== 'Unassigned');
  const depts = await prisma.department.findMany({
    where: { id: { in: deptIds } },
    select: { id: true, name: true },
  });
  const departmentComparison = Object.entries(deptMap).map(([departmentId, v]) => ({
    departmentId,
    departmentName: departmentId === 'Unassigned' ? 'Unassigned' : depts.find((d) => d.id === departmentId)?.name || '',
    avgScore: v.total / v.count,
  }));

  // Completion & adoption uses assessmentWhereCurrent
  const assessments = await prisma.assessment.findMany({
    where: assessmentWhereCurrent,
    select: { status: true, createdAt: true, updatedAt: true, expertId: true },
  });
  const started = assessments.length;
  const submitted = assessments.filter((a) => a.status !== AssessmentStatus.DRAFT).length;
  const reviewed = assessments.filter((a) => a.status === AssessmentStatus.REVIEWED).length;
  const reviewedAss = assessments.filter((a) => a.status === AssessmentStatus.REVIEWED);
  const totalTime = reviewedAss.reduce((sum, a) => sum + (a.updatedAt.getTime() - a.createdAt.getTime()), 0);
  const avgTimeToComplete = reviewedAss.length > 0 ? totalTime / reviewedAss.length : 0;

  // New user engagement metrics
  const distinctExpertIds = new Set(assessments.map(a => a.expertId));
  const numberOfActiveUsers = distinctExpertIds.size;
  const avgAssessmentsPerUser = numberOfActiveUsers > 0 ? assessments.length / numberOfActiveUsers : 0;

  // Assessment Status Distribution
  const statusCounts: { [key in AssessmentStatus]?: number } = {};
  assessments.forEach(assessment => {
    statusCounts[assessment.status] = (statusCounts[assessment.status] || 0) + 1;
  });
  const assessmentStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    name: status, // Recharts PieChart often uses 'name' for labels
    value: count as number // and 'value' for the data point
  }));

  // 6. Benchmarking (global vs. company)
  const globalScores = await prisma.score.findMany({
    where: { assessment: { createdAt: { gte: from, lte: to } } }, // Stays for global current
    select: { level: true },
  });
  const globalAvg = globalScores.length
    ? globalScores.reduce((sum, s) => sum + s.level, 0) / globalScores.length
    : 0;

  // Compute company average (fallback to global if no companyId)
  let companyAvg: number;
  if (effectiveCompanyId) {
    const companyScores = await prisma.score.findMany({
      where: { assessment: { createdAt: { gte: from, lte: to }, companyId: effectiveCompanyId } },
      select: { level: true },
    });
    companyAvg = companyScores.length
      ? companyScores.reduce((sum, s) => sum + s.level, 0) / companyScores.length
      : 0;
  } else {
    companyAvg = globalAvg;
  }
  const benchmark = { globalAvg, companyAvg };

  // 7. Evidence counts use assessmentWhereCurrent
  const evGroup = await prisma.evidence.groupBy({
    by: ['dimensionId'],
    where: { uploadedAt: { gte: from, lte: to }, assessment: assessmentWhereCurrent },
    _count: { id: true },
  });
  const evidenceCounts = evGroup.map((e) => ({
    dimensionId: e.dimensionId,
    dimensionName: dimensions.find((d) => d.id === e.dimensionId)?.name || '',
    count: e._count.id,
  }));

  // 8. Cohort analysis uses assessments from current period for expertFirst identification
  // cohortAssessmentWhere also uses current from, to
  const expertFirst: Record<string, Date> = {};
  assessments.forEach((a) => {
    if (!expertFirst[a.expertId] || a.createdAt < expertFirst[a.expertId]) {
      expertFirst[a.expertId] = a.createdAt;
    }
  });
  const expertIds = Object.keys(expertFirst);
  // Build assessment filter for cohort
  const cohortAssessmentWhere: any = { createdAt: { gte: from, lte: to }, expertId: { in: expertIds } };
  if (effectiveCompanyId) {
    cohortAssessmentWhere.companyId = effectiveCompanyId;
  }
  const cohortScores = await prisma.score.findMany({
    where: { assessment: cohortAssessmentWhere },
    select: { level: true, assessment: { select: { expertId: true } } },
  });
  const getQuarter = (date: Date) => {
    const m = date.getMonth();
    return `${date.getFullYear()}-Q${Math.floor(m / 3) + 1}`;
  };
  const cohortMap: Record<string, { total: number; count: number }> = {};
  cohortScores.forEach(({ level, assessment }) => {
    const q = getQuarter(expertFirst[assessment.expertId]);
    if (!cohortMap[q]) cohortMap[q] = { total: 0, count: 0 };
    cohortMap[q].total += level;
    cohortMap[q].count += 1;
  });
  const cohort = Object.entries(cohortMap).map(([cohort, v]) => ({ cohort, avgScore: v.total / v.count }));

  // 9. Heatmap uses assessmentWhereCurrent
  const heatRaw = await prisma.score.findMany({
    where: { assessment: assessmentWhereCurrent },
    select: {
      level: true,
      assessment: { select: { departmentId: true } },
      dimension: { select: { category: { select: { id: true, name: true } } } },
    },
  });
  const heatMap: Record<string, Record<string, { total: number; count: number }>> = {};
  heatRaw.forEach(({ level, assessment, dimension }) => {
    const deptId = assessment.departmentId || 'Unassigned';
    const cat = dimension.category;
    if (!cat) return;
    heatMap[deptId] = heatMap[deptId] || {};
    heatMap[deptId][cat.id] = heatMap[deptId][cat.id] || { total: 0, count: 0 };
    heatMap[deptId][cat.id].total += level;
    heatMap[deptId][cat.id].count += 1;
  });
  const allCategories = await prisma.category.findMany({ select: { id: true, name: true } });
  const deptIdsHeat = Object.keys(heatMap);
  const deptsHeat = await prisma.department.findMany({
    where: { id: { in: deptIdsHeat.filter((id) => id !== 'Unassigned') } },
    select: { id: true, name: true },
  });
  const heatmap = deptIdsHeat.map((deptId) => {
    const departmentName =
      deptId === 'Unassigned' ? 'Unassigned' : deptsHeat.find((d) => d.id === deptId)?.name || '';
    const categoriesData = allCategories.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      avgScore:
        heatMap[deptId][cat.id] && heatMap[deptId][cat.id].count
          ? heatMap[deptId][cat.id].total / heatMap[deptId][cat.id].count
          : 0,
    }));
    return { departmentId: deptId, departmentName, categories: categoriesData };
  });

  return NextResponse.json({
    overallAvg: { current: overallAvgCurrent, previous: overallAvgPrevious },
    trends,
    scoreDistribution,
    dimensionBreakdown,
    dimensionBreakdownPrevious,
    categoryDistribution,
    departmentComparison,
    completion: {
      started,
      submitted,
      reviewed,
      avgTimeToComplete,
      numberOfActiveUsers,
      avgAssessmentsPerUser
    },
    assessmentStatusDistribution,
    benchmark,
    evidenceCounts,
    cohort,
    heatmap,
    topCategories,
    weakCategories,
    topDimensions,
    weakDimensions,
  });
} 