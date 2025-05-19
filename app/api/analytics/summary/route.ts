import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { Role, AssessmentStatus } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userRole = session.user.role;
  const userCompanyId = session.user.companyId;

  // Parse timeRange param
  const url = new URL(request.url);
  const timeRange = url.searchParams.get('timeRange') || 'last30days';
  const to = new Date();
  let from: Date;
  switch (timeRange) {
    case 'last7days':
      from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'last30days':
      from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'last90days':
      from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'lastYear':
      from = new Date(new Date().setFullYear(to.getFullYear() - 1));
      break;
    default:
      from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  // Filter assessments by date and company (if not admin)
  const assessmentWhere: any = { createdAt: { gte: from, lte: to } };
  if (userRole !== Role.ADMIN) {
    assessmentWhere.companyId = userCompanyId;
  }

  // 1. Fetch scores for overall avg and trends
  const scores = await prisma.score.findMany({
    where: { assessment: assessmentWhere },
    select: { level: true, assessment: { select: { createdAt: true, departmentId: true } } }
  });

  const overallAvg = scores.length > 0
    ? scores.reduce((sum, s) => sum + s.level, 0) / scores.length
    : 0;

  const trendsMap: Record<string, { total: number; count: number }> = {};
  scores.forEach(({ level, assessment }) => {
    const dateKey = assessment.createdAt.toISOString().split('T')[0];
    if (!trendsMap[dateKey]) trendsMap[dateKey] = { total: 0, count: 0 };
    trendsMap[dateKey].total += level;
    trendsMap[dateKey].count += 1;
  });
  const trends = Object.entries(trendsMap).map(([period, v]) => ({ period, avgScore: v.total / v.count }));

  // 2. Dimension breakdown
  const dimAvgs = await prisma.score.groupBy({
    by: ['dimensionId'],
    where: { assessment: assessmentWhere },
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

  // 3. Category distribution
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
    if (!dim) return;
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

  // 4. Department comparison
  const deptMap: Record<string, { total: number; count: number }> = {};
  scores.forEach(({ level, assessment }) => {
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

  // 5. Completion & adoption
  const assessments = await prisma.assessment.findMany({
    where: assessmentWhere,
    select: { status: true, createdAt: true, updatedAt: true, expertId: true },
  });
  const started = assessments.length;
  const submitted = assessments.filter((a) => a.status !== AssessmentStatus.DRAFT).length;
  const reviewed = assessments.filter((a) => a.status === AssessmentStatus.REVIEWED).length;
  const reviewedAss = assessments.filter((a) => a.status === AssessmentStatus.REVIEWED);
  const totalTime = reviewedAss.reduce((sum, a) => sum + (a.updatedAt.getTime() - a.createdAt.getTime()), 0);
  const avgTimeToComplete = reviewedAss.length > 0 ? totalTime / reviewedAss.length : 0;
  const activeUsersMap: Record<string, Set<string>> = {};
  assessments.forEach((a) => {
    const dateKey = a.createdAt.toISOString().split('T')[0];
    if (!activeUsersMap[dateKey]) activeUsersMap[dateKey] = new Set();
    activeUsersMap[dateKey].add(a.expertId);
  });
  const activeUsers = Object.entries(activeUsersMap).map(([period, set]) => ({ period, count: set.size }));

  // Stub advanced metrics
  const cohort: any[] = [];
  const benchmark: any[] = [];
  const heatmap: any[] = [];
  const evidence: any[] = [];

  return NextResponse.json({
    overallAvg,
    trends,
    dimensionBreakdown,
    categoryDistribution,
    departmentComparison,
    completion: { started, submitted, reviewed, avgTimeToComplete },
    activeUsers,
    cohort,
    benchmark,
    heatmap,
    evidence,
  });
} 