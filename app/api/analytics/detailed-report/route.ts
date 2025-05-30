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

    // Build assessment where clauses
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

    const assessmentWhere = buildAssessmentWhere({ gte: from, lte: to });

    // Fetch comprehensive analytics data
    const [
      scores,
      assessments,
      dimensionBreakdown,
      categoryBreakdown,
      departmentData,
      evidenceData
    ] = await Promise.all([
      // Overall scores
      prisma.score.findMany({
        where: { assessment: assessmentWhere },
        select: { 
          level: true, 
          assessment: { 
            select: { 
              createdAt: true, 
              departmentId: true,
              expert: { select: { name: true, email: true } },
              company: { select: { name: true } },
              department: { select: { name: true } }
            } 
          } 
        }
      }),

      // Assessment details
      prisma.assessment.findMany({
        where: assessmentWhere,
        select: { 
          id: true,
          status: true, 
          createdAt: true, 
          updatedAt: true, 
          expert: { select: { name: true, email: true } },
          company: { select: { name: true, sector: { select: { name: true } } } },
          department: { select: { name: true } }
        }
      }),

      // Dimension performance
      prisma.score.groupBy({
        by: ['dimensionId'],
        where: { assessment: assessmentWhere },
        _avg: { level: true },
        _count: { level: true }
      }),

      // Category performance
      prisma.score.findMany({
        where: { assessment: assessmentWhere },
        select: {
          level: true,
          dimension: {
            select: {
              category: { select: { id: true, name: true } }
            }
          }
        }
      }),

      // Department performance
      prisma.score.findMany({
        where: { assessment: assessmentWhere },
        select: {
          level: true,
          assessment: {
            select: {
              departmentId: true,
              department: { select: { name: true } }
            }
          }
        }
      }),

      // Evidence data
      prisma.evidence.findMany({
        where: { 
          uploadedAt: { gte: from, lte: to },
          assessment: assessmentWhere 
        },
        select: {
          dimensionId: true,
          dimension: { select: { name: true } },
          assessment: {
            select: {
              department: { select: { name: true } }
            }
          }
        }
      })
    ]);

    // Get organization info
    const orgInfo = await getOrganizationInfo(effectiveCompanyId, filterSectorId || null, userRole);

    // Process data for report
    const reportData = {
      organizationInfo: orgInfo,
      timeRange,
      reportDate: new Date(),
      summary: {
        totalScores: scores.length,
        totalAssessments: assessments.length,
        avgScore: scores.length > 0 ? scores.reduce((sum, s) => sum + s.level, 0) / scores.length : 0,
        completedAssessments: assessments.filter(a => a.status === AssessmentStatus.REVIEWED).length
      },
      scores,
      assessments,
      dimensions: await processDimensionData(dimensionBreakdown),
      categories: processCategoryData(categoryBreakdown),
      departments: processDepartmentData(departmentData),
      evidence: processEvidenceData(evidenceData)
    };

    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = doc as unknown as Readable;

    await generateDetailedReportPDF(doc, reportData);

    doc.end();
    const buffer = await streamToBuffer(stream);

    const filename = `detailed_analytics_${orgInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(buffer, { status: 200, headers });

  } catch (error: any) {
    console.error('Error generating detailed report:', error);
    return NextResponse.json(
      { error: 'Failed to generate detailed report', details: error.message },
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

async function processDimensionData(dimensionBreakdown: any[]) {
  const dimensionIds = dimensionBreakdown.map(d => d.dimensionId);
  const dimensions = await prisma.dimension.findMany({
    where: { id: { in: dimensionIds } },
    select: { id: true, name: true, category: { select: { name: true } } }
  });

  return dimensionBreakdown.map(d => ({
    ...d,
    name: dimensions.find(dim => dim.id === d.dimensionId)?.name || 'Unknown',
    categoryName: dimensions.find(dim => dim.id === d.dimensionId)?.category?.name || 'Unknown',
    avgScore: d._avg.level || 0,
    count: d._count.level || 0
  }));
}

function processCategoryData(categoryBreakdown: any[]) {
  const categoryMap: Record<string, { total: number; count: number; name: string }> = {};
  
  categoryBreakdown.forEach(score => {
    const category = score.dimension.category;
    if (category) {
      if (!categoryMap[category.id]) {
        categoryMap[category.id] = { total: 0, count: 0, name: category.name };
      }
      categoryMap[category.id].total += score.level;
      categoryMap[category.id].count += 1;
    }
  });

  return Object.entries(categoryMap).map(([id, data]) => ({
    id,
    name: data.name,
    avgScore: data.count > 0 ? data.total / data.count : 0,
    count: data.count
  }));
}

function processDepartmentData(departmentData: any[]) {
  const deptMap: Record<string, { total: number; count: number; name: string }> = {};
  
  departmentData.forEach(score => {
    const deptId = score.assessment.departmentId || 'unassigned';
    const deptName = score.assessment.department?.name || 'Unassigned';
    
    if (!deptMap[deptId]) {
      deptMap[deptId] = { total: 0, count: 0, name: deptName };
    }
    deptMap[deptId].total += score.level;
    deptMap[deptId].count += 1;
  });

  return Object.entries(deptMap).map(([id, data]) => ({
    id,
    name: data.name,
    avgScore: data.count > 0 ? data.total / data.count : 0,
    count: data.count
  }));
}

function processEvidenceData(evidenceData: any[]) {
  const evidenceMap: Record<string, { count: number; dimensionName: string }> = {};
  
  evidenceData.forEach(evidence => {
    const dimId = evidence.dimensionId;
    if (!evidenceMap[dimId]) {
      evidenceMap[dimId] = { count: 0, dimensionName: evidence.dimension.name };
    }
    evidenceMap[dimId].count += 1;
  });

  return Object.entries(evidenceMap).map(([id, data]) => ({
    dimensionId: id,
    dimensionName: data.dimensionName,
    count: data.count
  }));
}

async function generateDetailedReportPDF(doc: PDFKit.PDFDocument, data: any) {
  const { organizationInfo, timeRange, reportDate, summary } = data;

  // Header
  doc.fontSize(24).fillColor('#1976d2').text('LeanSight Detailed Analytics Report', { align: 'center' });
  doc.moveDown(0.5);

  // Organization info
  doc.fontSize(16).fillColor('#333').text(`Organization: ${organizationInfo.name}`, { align: 'center' });
  if (organizationInfo.sector) {
    doc.fontSize(12).fillColor('#666').text(`Sector: ${organizationInfo.sector}`, { align: 'center' });
  }
  doc.fontSize(12).fillColor('#666')
    .text(`Report Period: ${formatTimeRange(timeRange)}`, { align: 'center' })
    .text(`Generated: ${reportDate.toLocaleDateString()}`, { align: 'center' });

  doc.moveDown(2);

  // Executive Summary
  doc.fontSize(18).fillColor('#1976d2').text('Executive Summary', { underline: true });
  doc.moveDown(1);
  doc.fontSize(12).fillColor('#333')
    .text(`• Total Assessments: ${summary.totalAssessments}`)
    .text(`• Completed Assessments: ${summary.completedAssessments}`)
    .text(`• Total Scores Recorded: ${summary.totalScores}`)
    .text(`• Average Maturity Score: ${summary.avgScore.toFixed(2)}/5.0`)
    .text(`• Completion Rate: ${((summary.completedAssessments / summary.totalAssessments) * 100).toFixed(1)}%`);

  doc.moveDown(2);

  // Category Performance
  if (data.categories.length > 0) {
    doc.fontSize(18).fillColor('#1976d2').text('Category Performance', { underline: true });
    doc.moveDown(1);
    
    data.categories
      .sort((a: any, b: any) => b.avgScore - a.avgScore)
      .forEach((cat: any) => {
        doc.fontSize(12).fillColor('#333')
          .text(`${cat.name}: ${cat.avgScore.toFixed(2)}/5.0 (${cat.count} assessments)`);
      });
    
    doc.moveDown(2);
  }

  // Department Performance
  if (data.departments.length > 0) {
    doc.fontSize(18).fillColor('#1976d2').text('Department Performance', { underline: true });
    doc.moveDown(1);
    
    data.departments
      .sort((a: any, b: any) => b.avgScore - a.avgScore)
      .forEach((dept: any) => {
        doc.fontSize(12).fillColor('#333')
          .text(`${dept.name}: ${dept.avgScore.toFixed(2)}/5.0 (${dept.count} assessments)`);
      });
    
    doc.moveDown(2);
  }

  // Top/Bottom Performing Dimensions
  if (data.dimensions.length > 0) {
    const sortedDimensions = data.dimensions.sort((a: any, b: any) => b.avgScore - a.avgScore);
    
    doc.fontSize(18).fillColor('#1976d2').text('Dimension Performance Analysis', { underline: true });
    doc.moveDown(1);
    
    // Top 5 performing
    doc.fontSize(14).fillColor('#4caf50').text('Top Performing Dimensions:');
    sortedDimensions.slice(0, 5).forEach((dim: any, index: number) => {
      doc.fontSize(12).fillColor('#333')
        .text(`${index + 1}. ${dim.name}: ${dim.avgScore.toFixed(2)}/5.0`);
    });
    
    doc.moveDown(1);
    
    // Bottom 5 performing
    doc.fontSize(14).fillColor('#f44336').text('Areas for Improvement:');
    sortedDimensions.slice(-5).reverse().forEach((dim: any, index: number) => {
      doc.fontSize(12).fillColor('#333')
        .text(`${index + 1}. ${dim.name}: ${dim.avgScore.toFixed(2)}/5.0`);
    });
  }

  // Add new page for evidence analysis
  doc.addPage();
  
  // Evidence Analysis
  if (data.evidence.length > 0) {
    doc.fontSize(18).fillColor('#1976d2').text('Evidence Analysis', { underline: true });
    doc.moveDown(1);
    
    const totalEvidence = data.evidence.reduce((sum: number, e: any) => sum + e.count, 0);
    doc.fontSize(12).fillColor('#333')
      .text(`Total Evidence Uploads: ${totalEvidence}`)
      .text(`Dimensions with Evidence: ${data.evidence.length}`);
    
    doc.moveDown(1);
    
    data.evidence
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10)
      .forEach((evidence: any) => {
        doc.fontSize(12).fillColor('#333')
          .text(`${evidence.dimensionName}: ${evidence.count} uploads`);
      });
  }

  // Footer
  doc.fontSize(10).fillColor('#999')
    .text('This detailed report was automatically generated by LeanSight Analytics Platform', 
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