import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Helper to extract params from the URL
function extractParamsFromUrl(urlString: string) {
  const url = new URL(urlString, 'http://localhost');
  const parts = url.pathname.split('/');
  // Find relevant indices in URL structure
  // /api/assessments/[assessmentId]/dimensions/[dimensionId]/evidence/[evidenceId]
  const assessmentsIdx = parts.findIndex(p => p === 'assessments');
  
  return {
    assessmentId: parts[assessmentsIdx + 1],
    dimensionId: parts[assessmentsIdx + 3],
    evidenceId: parts[assessmentsIdx + 5]
  };
}

// PUT endpoint for updating evidence
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { assessmentId, dimensionId, evidenceId } = extractParamsFromUrl(request.url);
  if (!assessmentId || !dimensionId || !evidenceId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // Get the current evidence
    const currentEvidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      select: {
        id: true,
        fileUrl: true,
        fileType: true,
        notes: true,
        tags: true,
        version: true,
        uploadedById: true,
        assessment: {
          select: {
            status: true,
            expertId: true,
            companyId: true
          }
        }
      }
    });

    if (!currentEvidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    // Check permissions - only the original uploader, the assessment expert, or an admin can edit
    const isAdmin = session.user.role === 'ADMIN';
    const isExpert = session.user.role === 'EXPERT';
    const isOriginalUploader = currentEvidence.uploadedById === session.user.id;
    const isAssessmentExpert = currentEvidence.assessment.expertId === session.user.id;
    const hasCompanyAccess = session.user.companyId === currentEvidence.assessment.companyId;

    if (!isAdmin && !isExpert && !isOriginalUploader && !isAssessmentExpert && !hasCompanyAccess) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Parse the request body
    const body = await request.json();
    const { notes, tags } = body;

    // Create a history entry of the current version before updating
    await prisma.evidenceHistory.create({
      data: {
        evidenceId: currentEvidence.id,
        fileUrl: currentEvidence.fileUrl,
        fileType: currentEvidence.fileType,
        notes: currentEvidence.notes,
        tags: currentEvidence.tags || [],
        version: currentEvidence.version,
        uploadedById: currentEvidence.uploadedById
      }
    });

    // Update the evidence with new values and increment version
    const updatedEvidence = await prisma.evidence.update({
      where: { id: evidenceId },
      data: {
        notes,
        tags: tags || [],
        version: { increment: 1 },
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedEvidence);
  } catch (error) {
    console.error('Error updating evidence:', error);
    return NextResponse.json({ error: 'Failed to update evidence' }, { status: 500 });
  }
}

// DELETE endpoint for removing evidence
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { assessmentId, dimensionId, evidenceId } = extractParamsFromUrl(request.url);
  if (!assessmentId || !dimensionId || !evidenceId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // Get the current evidence
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      select: {
        id: true,
        fileUrl: true,
        uploadedById: true,
        assessment: {
          select: {
            status: true,
            expertId: true,
            companyId: true
          }
        }
      }
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    // Check permissions - only the original uploader, the assessment expert, or an admin can delete
    const isAdmin = session.user.role === 'ADMIN';
    const isExpert = session.user.role === 'EXPERT';
    const isOriginalUploader = evidence.uploadedById === session.user.id;
    const isAssessmentExpert = evidence.assessment.expertId === session.user.id;
    const hasCompanyAccess = session.user.companyId === evidence.assessment.companyId;

    if (!isAdmin && !isExpert && !isOriginalUploader && !isAssessmentExpert && !hasCompanyAccess) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Delete the file if it exists
    if (evidence.fileUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', evidence.fileUrl.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with deletion even if file removal fails
      }
    }

    // Soft delete the evidence
    await prisma.evidence.update({
      where: { id: evidenceId },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    return NextResponse.json({ error: 'Failed to delete evidence' }, { status: 500 });
  }
} 