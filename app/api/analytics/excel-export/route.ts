import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, AssessmentStatus } from '@prisma/client';
import ExcelJS from 'exceljs';

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
  const exportType = url.searchParams.get('type') || 'comprehensive';
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

    // Build assessment where clause
    const buildAssessmentWhere = () => {
      const where: any = { createdAt: { gte: from, lte: to } };
      
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

    const assessmentWhere = buildAssessmentWhere();

    // Get organization info for filename
    const orgInfo = await getOrganizationInfo(effectiveCompanyId, filterSectorId || null, userRole);

    // Create workbook and generate content based on export type
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LeanSight Analytics Platform';
    workbook.created = new Date();

    switch (exportType) {
      case 'comprehensive':
        await generateComprehensiveExport(workbook, assessmentWhere, from, to, orgInfo);
        break;
      case 'raw':
        await generateRawDataExport(workbook, assessmentWhere, from, to, orgInfo);
        break;
      case 'template':
        await generateTemplateExport(workbook, orgInfo);
        break;
      default:
        throw new Error(`Invalid export type: ${exportType}`);
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `lean_analytics_${exportType}_${orgInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(buffer, { status: 200, headers });

  } catch (error: any) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel export', details: error.message },
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

async function generateComprehensiveExport(workbook: ExcelJS.Workbook, assessmentWhere: any, from: Date, to: Date, orgInfo: any) {
  // Fetch all necessary data
  const [scores, assessments, categories, departments, dimensions] = await Promise.all([
    prisma.score.findMany({
      where: { assessment: assessmentWhere },
      include: {
        dimension: { 
          include: { 
            category: true 
          } 
        },
        assessment: {
          include: {
            company: true,
            department: true,
            expert: { select: { name: true, email: true } }
          }
        }
      }
    }),
    prisma.assessment.findMany({
      where: assessmentWhere,
      include: {
        company: true,
        department: true,
        expert: { select: { name: true, email: true } },
        weightingScheme: true
      }
    }),
    prisma.category.findMany({
      select: { id: true, name: true, description: true }
    }),
    prisma.department.findMany({
      select: { id: true, name: true, companyId: true }
    }),
    prisma.dimension.findMany({
      select: { id: true, name: true, description: true, categoryId: true }
    })
  ]);

  // 1. Summary Sheet
  await createSummarySheet(workbook, scores, assessments, orgInfo, from, to);

  // 2. Assessment Details
  await createAssessmentDetailsSheet(workbook, assessments);

  // 3. Scores Breakdown
  await createScoresBreakdownSheet(workbook, scores);

  // 4. Category Analysis
  await createCategoryAnalysisSheet(workbook, scores, categories);

  // 5. Department Analysis
  await createDepartmentAnalysisSheet(workbook, scores, departments);

  // 6. Dimension Analysis
  await createDimensionAnalysisSheet(workbook, scores, dimensions);

  // 7. Trends (if applicable)
  await createTrendsSheet(workbook, scores, from, to);
}

async function generateRawDataExport(workbook: ExcelJS.Workbook, assessmentWhere: any, from: Date, to: Date, orgInfo: any) {
  // Raw Assessments Data
  const assessments = await prisma.assessment.findMany({
    where: assessmentWhere,
    include: {
      company: { select: { name: true, sector: { select: { name: true } } } },
      department: { select: { name: true } },
      expert: { select: { name: true, email: true } },
      weightingScheme: { select: { name: true } },
      scores: {
        include: {
          dimension: {
            include: {
              category: { select: { name: true } }
            }
          }
        }
      },
      evidence: {
        include: {
          dimension: { select: { name: true } }
        }
      }
    }
  });

  // Raw Scores Sheet
  const scoresSheet = workbook.addWorksheet('Raw Scores');
  scoresSheet.columns = [
    { header: 'Assessment ID', key: 'assessmentId', width: 20 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Sector', key: 'sector', width: 15 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Expert Name', key: 'expertName', width: 20 },
    { header: 'Expert Email', key: 'expertEmail', width: 25 },
    { header: 'Dimension', key: 'dimension', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Score', key: 'score', width: 10 },
    { header: 'Assessment Status', key: 'status', width: 15 },
    { header: 'Created Date', key: 'createdAt', width: 15 },
    { header: 'Updated Date', key: 'updatedAt', width: 15 }
  ];

  assessments.forEach(assessment => {
    assessment.scores.forEach(score => {
      scoresSheet.addRow({
        assessmentId: assessment.id,
        company: assessment.company?.name || 'N/A',
        sector: assessment.company?.sector?.name || 'N/A',
        department: assessment.department?.name || 'Company-Wide',
        expertName: assessment.expert?.name || 'N/A',
        expertEmail: assessment.expert?.email || 'N/A',
        dimension: score.dimension.name,
        category: score.dimension.category?.name || 'Uncategorized',
        score: score.level,
        status: assessment.status,
        createdAt: assessment.createdAt.toISOString().split('T')[0],
        updatedAt: assessment.updatedAt.toISOString().split('T')[0]
      });
    });
  });

  // Raw Evidence Sheet
  const evidenceSheet = workbook.addWorksheet('Raw Evidence');
  evidenceSheet.columns = [
    { header: 'Assessment ID', key: 'assessmentId', width: 20 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Dimension', key: 'dimension', width: 30 },
    { header: 'Evidence Type', key: 'evidenceType', width: 15 },
    { header: 'File Name', key: 'fileName', width: 30 },
    { header: 'Notes', key: 'notes', width: 50 },
    { header: 'Upload Date', key: 'uploadedAt', width: 15 }
  ];

  assessments.forEach(assessment => {
    assessment.evidence.forEach(evidence => {
      // Extract filename from fileUrl if it exists
      const fileName = evidence.fileUrl ? evidence.fileUrl.split('/').pop() || 'N/A' : 'N/A';
      
      evidenceSheet.addRow({
        assessmentId: assessment.id,
        company: assessment.company?.name || 'N/A',
        department: assessment.department?.name || 'Company-Wide',
        dimension: evidence.dimension?.name || 'N/A',
        evidenceType: evidence.fileUrl ? 'File' : 'Text Note',
        fileName: fileName,
        notes: evidence.notes || '',
        uploadedAt: evidence.uploadedAt.toISOString().split('T')[0]
      });
    });
  });

  // Apply formatting to both sheets
  formatAsTable(scoresSheet);
  formatAsTable(evidenceSheet);
}

async function generateTemplateExport(workbook: ExcelJS.Workbook, orgInfo: any) {
  // Assessment Template Sheet
  const templateSheet = workbook.addWorksheet('Assessment Template');
  
  // Get all dimensions and categories for template
  const dimensions = await prisma.dimension.findMany({
    include: {
      category: true,
      descriptors: true
    },
    orderBy: [
      { category: { name: 'asc' } },
      { name: 'asc' }
    ]
  });

  templateSheet.columns = [
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Dimension', key: 'dimension', width: 40 },
    { header: 'Description', key: 'description', width: 60 },
    { header: 'Score (1-5)', key: 'score', width: 12 },
    { header: 'Notes', key: 'notes', width: 40 }
  ];

  dimensions.forEach(dimension => {
    templateSheet.addRow({
      category: dimension.category?.name || 'Uncategorized',
      dimension: dimension.name,
      description: dimension.description || '',
      score: '', // Empty for user input
      notes: ''  // Empty for user input
    });
  });

  // Instructions Sheet
  const instructionsSheet = workbook.addWorksheet('Instructions');
  instructionsSheet.addRow(['LeanSight Assessment Template Instructions']);
  instructionsSheet.addRow([]);
  instructionsSheet.addRow(['1. Fill in the "Score (1-5)" column for each dimension']);
  instructionsSheet.addRow(['2. Use the scale: 1 = Initial, 2 = Developing, 3 = Defined, 4 = Managed, 5 = Optimizing']);
  instructionsSheet.addRow(['3. Add any relevant notes in the "Notes" column']);
  instructionsSheet.addRow(['4. Save and upload this file back to LeanSight for processing']);
  instructionsSheet.addRow([]);
  instructionsSheet.addRow(['Score Definitions:']);
  instructionsSheet.addRow(['1 - Initial: Ad-hoc processes, minimal lean awareness']);
  instructionsSheet.addRow(['2 - Developing: Some lean concepts applied, inconsistent implementation']);
  instructionsSheet.addRow(['3 - Defined: Documented lean processes, regular implementation']);
  instructionsSheet.addRow(['4 - Managed: Mature lean processes, measurable improvements']);
  instructionsSheet.addRow(['5 - Optimizing: Continuous innovation, industry-leading practices']);

  // Format both sheets
  formatAsTable(templateSheet);
  formatInstructionsSheet(instructionsSheet);
}

async function createSummarySheet(workbook: ExcelJS.Workbook, scores: any[], assessments: any[], orgInfo: any, from: Date, to: Date) {
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Header information
  summarySheet.addRow(['LeanSight Analytics Summary']);
  summarySheet.addRow(['Organization:', orgInfo.name]);
  summarySheet.addRow(['Report Period:', `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`]);
  summarySheet.addRow(['Generated:', new Date().toLocaleDateString()]);
  summarySheet.addRow([]);

  // Key metrics
  const totalAssessments = assessments.length;
  const completedAssessments = assessments.filter(a => a.status === AssessmentStatus.REVIEWED).length;
  const avgScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s.level, 0) / scores.length : 0;
  const activeUsers = new Set(assessments.map(a => a.expertId)).size;

  summarySheet.addRow(['Key Metrics']);
  summarySheet.addRow(['Total Assessments:', totalAssessments]);
  summarySheet.addRow(['Completed Assessments:', completedAssessments]);
  summarySheet.addRow(['Completion Rate:', `${((completedAssessments / totalAssessments) * 100).toFixed(1)}%`]);
  summarySheet.addRow(['Average Maturity Score:', `${avgScore.toFixed(2)}/5.0`]);
  summarySheet.addRow(['Active Users:', activeUsers]);
  summarySheet.addRow([]);

  // Score distribution
  const distribution = [0, 0, 0, 0, 0];
  scores.forEach(score => {
    const level = Math.round(score.level);
    if (level >= 1 && level <= 5) {
      distribution[level - 1]++;
    }
  });

  summarySheet.addRow(['Score Distribution']);
  summarySheet.addRow(['Level 1 (Initial):', distribution[0]]);
  summarySheet.addRow(['Level 2 (Developing):', distribution[1]]);
  summarySheet.addRow(['Level 3 (Defined):', distribution[2]]);
  summarySheet.addRow(['Level 4 (Managed):', distribution[3]]);
  summarySheet.addRow(['Level 5 (Optimizing):', distribution[4]]);

  // Format summary sheet
  summarySheet.getCell('A1').font = { bold: true, size: 16 };
  summarySheet.getCell('A6').font = { bold: true, size: 14 };
  summarySheet.getCell('A13').font = { bold: true, size: 14 };
}

async function createAssessmentDetailsSheet(workbook: ExcelJS.Workbook, assessments: any[]) {
  const sheet = workbook.addWorksheet('Assessment Details');
  
  sheet.columns = [
    { header: 'Assessment ID', key: 'id', width: 20 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Expert Name', key: 'expertName', width: 20 },
    { header: 'Expert Email', key: 'expertEmail', width: 25 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Weighting Scheme', key: 'weightingScheme', width: 20 },
    { header: 'Created Date', key: 'createdAt', width: 15 },
    { header: 'Updated Date', key: 'updatedAt', width: 15 }
  ];

  assessments.forEach(assessment => {
    sheet.addRow({
      id: assessment.id,
      company: assessment.company?.name || 'N/A',
      department: assessment.department?.name || 'Company-Wide',
      expertName: assessment.expert?.name || 'N/A',
      expertEmail: assessment.expert?.email || 'N/A',
      status: assessment.status,
      weightingScheme: assessment.weightingScheme?.name || 'None',
      createdAt: assessment.createdAt.toISOString().split('T')[0],
      updatedAt: assessment.updatedAt.toISOString().split('T')[0]
    });
  });

  formatAsTable(sheet);
}

async function createScoresBreakdownSheet(workbook: ExcelJS.Workbook, scores: any[]) {
  const sheet = workbook.addWorksheet('Scores Breakdown');
  
  sheet.columns = [
    { header: 'Assessment ID', key: 'assessmentId', width: 20 },
    { header: 'Dimension', key: 'dimension', width: 40 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Score', key: 'score', width: 10 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Department', key: 'department', width: 20 }
  ];

  scores.forEach(score => {
    sheet.addRow({
      assessmentId: score.assessmentId,
      dimension: score.dimension.name,
      category: score.dimension.category?.name || 'Uncategorized',
      score: score.level,
      company: score.assessment.company?.name || 'N/A',
      department: score.assessment.department?.name || 'Company-Wide'
    });
  });

  formatAsTable(sheet);
}

async function createCategoryAnalysisSheet(workbook: ExcelJS.Workbook, scores: any[], categories: any[]) {
  const sheet = workbook.addWorksheet('Category Analysis');
  
  // Calculate category averages
  const categoryStats = categories.map(category => {
    const categoryScores = scores.filter(s => s.dimension.category?.id === category.id);
    const avgScore = categoryScores.length > 0 
      ? categoryScores.reduce((sum, s) => sum + s.level, 0) / categoryScores.length 
      : 0;
    
    return {
      name: category.name,
      description: category.description || '',
      avgScore: parseFloat(avgScore.toFixed(2)),
      scoreCount: categoryScores.length,
      minScore: categoryScores.length > 0 ? Math.min(...categoryScores.map(s => s.level)) : 0,
      maxScore: categoryScores.length > 0 ? Math.max(...categoryScores.map(s => s.level)) : 0
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  sheet.columns = [
    { header: 'Category', key: 'name', width: 25 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Average Score', key: 'avgScore', width: 15 },
    { header: 'Score Count', key: 'scoreCount', width: 12 },
    { header: 'Min Score', key: 'minScore', width: 12 },
    { header: 'Max Score', key: 'maxScore', width: 12 }
  ];

  categoryStats.forEach(stat => sheet.addRow(stat));
  formatAsTable(sheet);
}

async function createDepartmentAnalysisSheet(workbook: ExcelJS.Workbook, scores: any[], departments: any[]) {
  const sheet = workbook.addWorksheet('Department Analysis');
  
  // Calculate department averages
  const departmentStats = departments.map(department => {
    const departmentScores = scores.filter(s => s.assessment.departmentId === department.id);
    const avgScore = departmentScores.length > 0 
      ? departmentScores.reduce((sum, s) => sum + s.level, 0) / departmentScores.length 
      : 0;
    
    return {
      name: department.name,
      avgScore: parseFloat(avgScore.toFixed(2)),
      scoreCount: departmentScores.length,
      assessmentCount: new Set(departmentScores.map(s => s.assessmentId)).size
    };
  }).filter(stat => stat.scoreCount > 0).sort((a, b) => b.avgScore - a.avgScore);

  sheet.columns = [
    { header: 'Department', key: 'name', width: 25 },
    { header: 'Average Score', key: 'avgScore', width: 15 },
    { header: 'Total Scores', key: 'scoreCount', width: 12 },
    { header: 'Assessments', key: 'assessmentCount', width: 12 }
  ];

  departmentStats.forEach(stat => sheet.addRow(stat));
  formatAsTable(sheet);
}

async function createDimensionAnalysisSheet(workbook: ExcelJS.Workbook, scores: any[], dimensions: any[]) {
  const sheet = workbook.addWorksheet('Dimension Analysis');
  
  // Calculate dimension averages
  const dimensionStats = dimensions.map(dimension => {
    const dimensionScores = scores.filter(s => s.dimensionId === dimension.id);
    const avgScore = dimensionScores.length > 0 
      ? dimensionScores.reduce((sum, s) => sum + s.level, 0) / dimensionScores.length 
      : 0;
    
    return {
      name: dimension.name,
      description: dimension.description || '',
      category: dimensionScores.length > 0 ? dimensionScores[0].dimension.category?.name || 'Uncategorized' : 'Uncategorized',
      avgScore: parseFloat(avgScore.toFixed(2)),
      scoreCount: dimensionScores.length
    };
  }).filter(stat => stat.scoreCount > 0).sort((a, b) => b.avgScore - a.avgScore);

  sheet.columns = [
    { header: 'Dimension', key: 'name', width: 40 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Average Score', key: 'avgScore', width: 15 },
    { header: 'Score Count', key: 'scoreCount', width: 12 }
  ];

  dimensionStats.forEach(stat => sheet.addRow(stat));
  formatAsTable(sheet);
}

async function createTrendsSheet(workbook: ExcelJS.Workbook, scores: any[], from: Date, to: Date) {
  const sheet = workbook.addWorksheet('Trends');
  
  // Group scores by month
  const monthlyData: { [key: string]: number[] } = {};
  
  scores.forEach(score => {
    const month = score.assessment.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = [];
    }
    monthlyData[month].push(score.level);
  });

  const trendData = Object.entries(monthlyData)
    .map(([month, scoreArray]) => ({
      month,
      avgScore: parseFloat((scoreArray.reduce((sum, s) => sum + s, 0) / scoreArray.length).toFixed(2)),
      scoreCount: scoreArray.length
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  sheet.columns = [
    { header: 'Month', key: 'month', width: 12 },
    { header: 'Average Score', key: 'avgScore', width: 15 },
    { header: 'Score Count', key: 'scoreCount', width: 12 }
  ];

  trendData.forEach(data => sheet.addRow(data));
  formatAsTable(sheet);
}

function formatAsTable(sheet: ExcelJS.Worksheet) {
  // Style the header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1976D2' }
  };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add borders to all cells with data
  sheet.eachRow((row: any, rowNumber: any) => {
    row.eachCell((cell: any, colNumber: any) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Auto-fit columns (approximate)
  sheet.columns.forEach((column: any) => {
    if (column.width && column.width < 10) {
      column.width = 10;
    }
  });
}

function formatInstructionsSheet(sheet: ExcelJS.Worksheet) {
  sheet.getCell('A1').font = { bold: true, size: 16 };
  sheet.getCell('A8').font = { bold: true, size: 12 };
  
  // Auto-fit first column
  sheet.getColumn(1).width = 60;
} 