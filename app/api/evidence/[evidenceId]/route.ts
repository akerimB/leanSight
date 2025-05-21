import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs/promises'; // Use promise-based fs for async operations
import path from 'path';

// Helper to extract evidenceId from URL
function extractEvidenceId(urlString: string) {
  const url = new URL(urlString, 'http://localhost');
  const parts = url.pathname.split('/');
  const idx = parts.findIndex(p => p === 'evidence');
  return parts[idx + 1];
}

// PUT handler to update notes for an existing evidence item
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const evidenceId = extractEvidenceId(request.url);
  if (!evidenceId) {
    return NextResponse.json({ error: 'Missing evidence ID' }, { status: 400 });
  }

  const { notes } = await request.json();

  if (typeof notes !== 'string' || notes.trim() === '') {
    return NextResponse.json({ error: 'Notes cannot be empty' }, { status: 400 });
  }

  try {
    // First, check if the evidence exists and is not soft-deleted
    const existingEvidence = await prisma.evidence.findFirst({
      where: {
        id: evidenceId,
        deletedAt: null, // Can only update non-deleted items
        // Optional: Add an ownership check: uploadedById: session.user.id OR check assessment ownership
      },
    });

    if (!existingEvidence) {
      return NextResponse.json({ error: 'Evidence not found or already deleted' }, { status: 404 });
    }

    // Optional: Authorization check - ensure the user is allowed to update this evidence
    // For example, if (existingEvidence.uploadedById !== session.user.id) { ... return 403 ... }

    const updatedEvidence = await prisma.evidence.update({
      where: { id: evidenceId },
      data: { notes },
    });

    return NextResponse.json(updatedEvidence);
  } catch (error) {
    console.error('Error updating evidence notes:', error);
    return NextResponse.json({ error: 'Failed to update evidence notes' }, { status: 500 });
  }
}

// DELETE handler to soft-delete an evidence item and remove its physical file
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const evidenceId = extractEvidenceId(request.url);
  if (!evidenceId) {
    return NextResponse.json({ error: 'Missing evidence ID' }, { status: 400 });
  }

  try {
    const evidenceToDelete = await prisma.evidence.findFirst({
      where: {
        id: evidenceId,
        deletedAt: null, // Can only delete non-deleted items
         // Optional: Add an ownership check: uploadedById: session.user.id OR check assessment ownership
      },
    });

    if (!evidenceToDelete) {
      return NextResponse.json({ error: 'Evidence not found or already deleted' }, { status: 404 });
    }

    // Optional: Authorization check here as well

    // Soft delete the evidence record
    await prisma.evidence.update({
      where: { id: evidenceId },
      data: { deletedAt: new Date() },
    });

    // If there was a file associated, attempt to delete it from the filesystem
    if (evidenceToDelete.fileUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', evidenceToDelete.fileUrl);
        await fs.unlink(filePath); // fs.promises.unlink
        console.log(`Successfully deleted physical file: ${filePath}`);
      } catch (fileError: any) {
        // Log the error but don't fail the whole operation if the DB record was soft-deleted
        // The file might have been manually deleted, or path is incorrect.
        console.error(`Failed to delete physical file ${evidenceToDelete.fileUrl}:`, fileError.message);
        // Potentially add a flag to the evidence record or a separate log for failed physical deletes
      }
    }

    return NextResponse.json({ message: 'Evidence soft-deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    return NextResponse.json({ error: 'Failed to delete evidence' }, { status: 500 });
  }
} 