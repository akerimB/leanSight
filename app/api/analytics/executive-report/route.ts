import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, AssessmentStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

// Helper function to convert stream to buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

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
  const filterSectorId = url.searchParams.get('sectorId');

  try {
    // Determine effective company filter
    let effectiveCompanyId = userCompanyId;
    if (userRole === Role.ADMIN) {
      effectiveCompanyId = filterCompanyId || null;
    }

    // Build date range
    const to = new Date();
    let from: Date;
    let fromPrev: Date;
    let toPrev: Date;

    switch (timeRange) {
      case 'last7days':
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        from = new Date(Date.now() - sevenDays);
        toPrev = new Date(from.getTime() - 1);
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
        fromPrev = new Date(new Date(toPrev).setFullYear(toPrev.getFullYear() - 1));
        fromPrev.setDate(fromPrev.getDate() + 1);
        break;
      default:
        const defaultDays = 30 * 24 * 60 * 60 * 1000;
        from = new Date(Date.now() - defaultDays);
        toPrev = new Date(from.getTime() - 1);
        fromPrev = new Date(toPrev.getTime() - defaultDays + 1);
    }

    // Build assessment where clauses with sector support
    const buildAssessmentWhere = (dateFilter: any) => {
      const where: any = { createdAt: dateFilter };
      
      if (filterSectorId && userRole === Role.ADMIN) {
        where.company = { sectorId: filterSectorId };
      }

      if (effectiveCompanyId) {
        if (where.company) {
          where.company.id = effectiveCompanyId;
        } else {
          where.companyId = effectiveCompanyId;
        }
      } else if (userRole !== Role.ADMIN) {
        where.companyId = '__NO_COMPANY_ACCESS__';
      }

      if (filterDepartmentId) {
        where.departmentId = filterDepartmentId;
      }

      return where;
    };

    const assessmentWhereCurrent = buildAssessmentWhere({ gte: from, lte: to });
    const assessmentWherePrevious = buildAssessmentWhere({ gte: fromPrev, lte: toPrev });

    // Fetch analytics data
    const [
      scoresCurrent,
      scoresPrevious,
      assessmentsCurrent,
      assessmentsPrevious
    ] = await Promise.all([
      prisma.score.findMany({
        where: { assessment: assessmentWhereCurrent },
        select: { level: true, assessment: { select: { createdAt: true, departmentId: true } } }
      }),
      prisma.score.findMany({
        where: { assessment: assessmentWherePrevious },
        select: { level: true }
      }),
      prisma.assessment.findMany({
        where: assessmentWhereCurrent,
        select: { 
          status: true, 
          createdAt: true, 
          updatedAt: true, 
          expertId: true,
          company: { select: { name: true, sector: { select: { name: true } } } },
          department: { select: { name: true } }
        }
      }),
      prisma.assessment.findMany({
        where: assessmentWherePrevious,
        select: { status: true }
      })
    ]);

    // Calculate key metrics
    const overallAvgCurrent = scoresCurrent.length > 0
      ? scoresCurrent.reduce((sum, s) => sum + s.level, 0) / scoresCurrent.length
      : 0;

    const overallAvgPrevious = scoresPrevious.length > 0
      ? scoresPrevious.reduce((sum, s) => sum + s.level, 0) / scoresPrevious.length
      : 0;

    const change = overallAvgCurrent - overallAvgPrevious;
    const changePercent = overallAvgPrevious > 0 ? (change / overallAvgPrevious) * 100 : 0;

    // Assessment metrics
    const totalAssessmentsCurrent = assessmentsCurrent.length;
    const totalAssessmentsPrevious = assessmentsPrevious.length;
    const completedAssessments = assessmentsCurrent.filter(a => a.status === AssessmentStatus.REVIEWED).length;
    const activeUsers = new Set(assessmentsCurrent.map(a => a.expertId)).size;

    // Get organization info
    const orgInfo = await getOrganizationInfo(effectiveCompanyId, filterSectorId || null, userRole);

    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = doc as unknown as Readable;

    // Add content to PDF
    await generateExecutiveSummaryPDF(doc, {
      organizationInfo: orgInfo,
      timeRange,
      reportDate: new Date(),
      metrics: {
        overallScore: {
          current: overallAvgCurrent,
          previous: overallAvgPrevious,
          change,
          changePercent
        },
        assessments: {
          total: totalAssessmentsCurrent,
          completed: completedAssessments,
          previousTotal: totalAssessmentsPrevious,
          activeUsers
        }
      },
      scoresCurrent,
      assessmentsCurrent
    });

    doc.end();
    const buffer = await streamToBuffer(stream);

    const filename = `executive_summary_${orgInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(buffer, { status: 200, headers });

  } catch (error: any) {
    console.error('Error generating executive report:', error);
    return NextResponse.json(
      { error: 'Failed to generate executive report', details: error.message },
      { status: 500 }
    );
  }
}

async function getOrganizationInfo(companyId: string | null | undefined, sectorId: string | null, userRole: Role) {
  if (sectorId && userRole === Role.ADMIN) {
    const sector = await prisma.sector.findUnique({
      where: { id: sectorId },
      select: { name: true }
    });
    return { name: `${sector?.name || 'Unknown Sector'} Sector`, type: 'sector' };
  }

  if (companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, sector: { select: { name: true } } }
    });
    return { 
      name: company?.name || 'Unknown Company', 
      type: 'company',
      sector: company?.sector?.name 
    };
  }

  return { name: 'All Organizations', type: 'global' };
}

async function generateExecutiveSummaryPDF(doc: PDFKit.PDFDocument, data: any) {
  const { organizationInfo, timeRange, reportDate, metrics } = data;

  // Header with logo space and title
  doc.fontSize(24).fillColor('#1976d2').text('LeanSight Executive Summary', { align: 'center' });
  doc.moveDown(0.5);

  // Organization and date info
  doc.fontSize(16).fillColor('#333')
    .text(`Organization: ${organizationInfo.name}`, { align: 'center' });
  
  if (organizationInfo.sector) {
    doc.fontSize(12).fillColor('#666')
      .text(`Sector: ${organizationInfo.sector}`, { align: 'center' });
  }

  doc.fontSize(12).fillColor('#666')
    .text(`Report Period: ${formatTimeRange(timeRange)}`, { align: 'center' })
    .text(`Generated: ${reportDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, { align: 'center' });

  doc.moveDown(2);

  // Key Performance Indicators Section
  doc.fontSize(18).fillColor('#1976d2').text('Key Performance Indicators', { underline: true });
  doc.moveDown(1);

  // Overall Maturity Score with visual indicator
  const scoreColor = getScoreColor(metrics.overallScore.current);
  doc.fontSize(14).fillColor('#333').text('Overall Maturity Score:');
  doc.fontSize(20).fillColor(scoreColor).text(`${metrics.overallScore.current.toFixed(2)}/5.0`, { continued: true });
  
  // Change indicator
  const changeText = metrics.overallScore.change >= 0 
    ? ` ↗ +${metrics.overallScore.change.toFixed(2)} (+${Math.abs(metrics.overallScore.changePercent).toFixed(1)}%)`
    : ` ↘ ${metrics.overallScore.change.toFixed(2)} (-${Math.abs(metrics.overallScore.changePercent).toFixed(1)}%)`;
  
  const changeColor = metrics.overallScore.change >= 0 ? '#4caf50' : '#f44336';
  doc.fontSize(12).fillColor(changeColor).text(changeText);
  doc.moveDown(1);

  // Assessment Activity
  doc.fontSize(14).fillColor('#333').text('Assessment Activity:');
  doc.fontSize(12)
    .text(`• Total Assessments: ${metrics.assessments.total} (Previous: ${metrics.assessments.previousTotal})`)
    .text(`• Completed Reviews: ${metrics.assessments.completed}`)
    .text(`• Active Assessors: ${metrics.assessments.activeUsers}`)
    .text(`• Completion Rate: ${((metrics.assessments.completed / metrics.assessments.total) * 100).toFixed(1)}%`);

  doc.moveDown(2);

  // Maturity Level Breakdown
  doc.fontSize(18).fillColor('#1976d2').text('Maturity Level Distribution', { underline: true });
  doc.moveDown(1);

  const scoreDistribution = calculateScoreDistribution(data.scoresCurrent);
  scoreDistribution.forEach((level, index) => {
    const percentage = data.scoresCurrent.length > 0 
      ? ((level / data.scoresCurrent.length) * 100).toFixed(1)
      : '0.0';
    doc.fontSize(12).fillColor('#333')
      .text(`Level ${index + 1}: ${level} assessments (${percentage}%)`);
  });

  doc.moveDown(2);

  // Recommendations Section
  doc.fontSize(18).fillColor('#1976d2').text('Executive Recommendations', { underline: true });
  doc.moveDown(1);

  const recommendations = generateRecommendations(metrics.overallScore.current, metrics.overallScore.change);
  recommendations.forEach((rec, index) => {
    doc.fontSize(12).fillColor('#333')
      .text(`${index + 1}. ${rec}`, { indent: 20 });
    doc.moveDown(0.5);
  });

  // Add page break if content is long
  if (doc.y > 700) {
    doc.addPage();
  }

  // Footer
  doc.fontSize(10).fillColor('#999')
    .text('This report was automatically generated by LeanSight Analytics Platform', 
      50, doc.page.height - 50, { align: 'center', width: doc.page.width - 100 });
}

function formatTimeRange(timeRange: string): string {
  switch (timeRange) {
    case 'last7days': return 'Last 7 Days';
    case 'last30days': return 'Last 30 Days';
    case 'last90days': return 'Last 90 Days';
    case 'lastYear': return 'Last Year';
    default: return 'Custom Period';
  }
}

function getScoreColor(score: number): string {
  if (score >= 4.0) return '#4caf50'; // Green
  if (score >= 3.0) return '#ff9800'; // Orange
  if (score >= 2.0) return '#ff5722'; // Red-Orange
  return '#f44336'; // Red
}

function calculateScoreDistribution(scores: any[]): number[] {
  const distribution = [0, 0, 0, 0, 0]; // Levels 1-5
  scores.forEach(score => {
    const level = Math.round(score.level);
    if (level >= 1 && level <= 5) {
      distribution[level - 1]++;
    }
  });
  return distribution;
}

function generateRecommendations(currentScore: number, change: number): string[] {
  const recommendations: string[] = [];

  if (currentScore < 2.0) {
    recommendations.push("Immediate focus needed on establishing basic lean practices and foundational processes.");
    recommendations.push("Consider engaging lean consultants to accelerate initial implementation.");
    recommendations.push("Prioritize leadership training and commitment to lean transformation.");
  } else if (currentScore < 3.0) {
    recommendations.push("Continue building lean capabilities with structured improvement programs.");
    recommendations.push("Implement regular gemba walks and establish standard work processes.");
    recommendations.push("Focus on employee engagement and continuous improvement culture.");
  } else if (currentScore < 4.0) {
    recommendations.push("Advance to sophisticated lean tools and value stream optimization.");
    recommendations.push("Develop internal lean champions and coaching capabilities.");
    recommendations.push("Integrate lean practices across all organizational functions.");
  } else {
    recommendations.push("Maintain excellence through continuous innovation and benchmarking.");
    recommendations.push("Share best practices and mentor other organizations in their lean journey.");
    recommendations.push("Explore advanced digital lean technologies and Industry 4.0 integration.");
  }

  if (change < -0.2) {
    recommendations.push("⚠️ Address declining performance through root cause analysis and corrective action.");
  } else if (change > 0.2) {
    recommendations.push("✅ Maintain current momentum and replicate successful practices across the organization.");
  }

  return recommendations;
} 