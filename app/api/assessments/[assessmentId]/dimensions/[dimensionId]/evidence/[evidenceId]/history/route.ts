import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Helper to extract params from the URL
function extractParamsFromUrl(urlString: string) {
  const url = new URL(urlString, 'http://localhost');
  const parts = url.pathname.split('/');
  // Find relevant indices in URL structure
  // /api/assessments/[assessmentId]/dimensions/[dimensionId]/evidence/[evidenceId]/history
  const assessmentsIdx = parts.findIndex(p => p === 'assessments');
  
  return {
    assessmentId: parts[assessmentsIdx + 1],
    dimensionId: parts[assessmentsIdx + 3],
    evidenceId: parts[assessmentsIdx + 5]
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { assessmentId, dimensionId, evidenceId } = extractParamsFromUrl(request.url);
  
  if (!assessmentId || !dimensionId || !evidenceId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // First, check if current user has access to this assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { 
        companyId: true,
        departmentId: true,
        expertId: true,
        status: true
      }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Check access rights based on role
    const isAdmin = session.user.role === 'ADMIN';
    const isExpert = session.user.role === 'EXPERT';
    const isAssessmentExpert = assessment.expertId === session.user.id;
    const hasCompanyAccess = session.user.companyId === assessment.companyId;
    
    if (!isAdmin && !isExpert && !isAssessmentExpert && !hasCompanyAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch the current evidence and its historical versions
    const currentEvidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      select: {
        id: true,
        fileUrl: true, 
        fileType: true,
        notes: true,
        uploadedAt: true,
        uploadedById: true,
        tags: true,
        version: true
      }
    });

    if (!currentEvidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    // Fetch historical versions
    const historyRecords = await prisma.evidenceHistory.findMany({
      where: { 
        evidenceId: evidenceId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        fileUrl: true,
        fileType: true,
        notes: true,
        createdAt: true,
        uploadedById: true,
        tags: true,
        version: true
      }
    });

    // Format for consistent response
    const formattedHistory = historyRecords.map(record => ({
      id: record.id,
      fileUrl: record.fileUrl,
      fileType: record.fileType,
      notes: record.notes,
      uploadedAt: record.createdAt,
      uploadedById: record.uploadedById,
      tags: record.tags,
      version: record.version
    }));

    // Combine current evidence with history, putting current first
    const allVersions = [
      {
        ...currentEvidence,
        uploadedAt: currentEvidence.uploadedAt.toISOString()
      },
      ...formattedHistory
    ];

    return NextResponse.json(allVersions);
  } catch (error) {
    console.error('Error fetching evidence history:', error);
    return NextResponse.json({ error: 'Failed to fetch evidence history' }, { status: 500 });
  }
} 