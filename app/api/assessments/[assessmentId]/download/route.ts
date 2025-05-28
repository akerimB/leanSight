import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream'; // Required for streaming PDF data

// Helper function to convert stream to buffer for NextResponse
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { assessmentId } = await context.params;

  if (!assessmentId) {
    return new NextResponse(
      JSON.stringify({ error: 'Assessment ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId, deletedAt: null },
      include: {
        company: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        expert: { select: { id: true, name: true, email: true } },
        scores: {
          include: {
            dimension: { select: { name: true, category: { select: { name: true} } } }, // Also include category name for grouping
          },
          orderBy: [
            { dimension: { category: { name: 'asc' } } }, 
            { dimension: { name: 'asc' } }
          ]
        },
        weightingScheme: { select: { id: true, name: true } },
      }
    });

    // Ensure TypeScript recognizes the new fields
    type AssessmentWithScore = typeof assessment & {
      weightedAverageScore?: number | null;
      calculationUsed?: string | null;
    };
    
    const assessmentWithScore = assessment as AssessmentWithScore;

    if (!assessment) {
      return new NextResponse(
        JSON.stringify({ error: 'Assessment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (session.user.role !== Role.ADMIN && session.user.companyId !== assessment.companyId) {
        if (session.user.id !== assessment.expertId) {
             return new NextResponse(
                JSON.stringify({ error: 'Forbidden - You do not have permission to view this assessment' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
             );
        }
    }

    // For now, use standard pdfkit instead of the table extension to avoid type issues
    const doc = new PDFDocument({ 
      margin: 50
    });
    const stream = doc as unknown as Readable;

    try {
      // PDF Content - Title
      doc.fontSize(20).text('Assessment Report', { align: 'center' });
      doc.moveDown();

      const assessorName = assessment.expert?.name || assessment.expert?.email || 'N/A';
      const assessmentDate = new Date(assessment.updatedAt).toLocaleDateString();

      // Add header information as basic text instead of a table
      doc.fontSize(16).text('Assessment Information', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Company: ${assessment.company?.name || 'N/A'}`);
      doc.text(`Department/Scope: ${assessment.department?.name || 'Company-Wide'}`);
      doc.text(`Status: ${assessment.status}`);
      doc.text(`Assessment Date: ${assessmentDate}`);
      doc.text(`Assessor: ${assessorName}`);
      doc.text(`Weighting Scheme: ${assessment.weightingScheme?.name || 'None Applied'}`);
      doc.moveDown();
      
      // Add overall score if available
      if (assessmentWithScore.weightedAverageScore !== null && assessmentWithScore.weightedAverageScore !== undefined) {
        doc.fontSize(14).text('Overall Maturity Score', { underline: true });
        doc.fontSize(12).text(`${assessmentWithScore.weightedAverageScore.toFixed(2)}`);
        if (assessmentWithScore.calculationUsed) {
          doc.fontSize(10).text(`(Calculation: ${assessmentWithScore.calculationUsed.replace(/_/g, ' ')})`);
        }
        doc.moveDown();
      }

      // Group scores by category
      const scoresByCategory = assessment.scores.reduce((acc, score) => {
        const categoryName = score.dimension.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(score);
        return acc;
      }, {} as Record<string, typeof assessment.scores>);

      // Scores section
      doc.fontSize(16).text('Scores by Category', { underline: true });
      doc.moveDown();

      if (assessment.scores && assessment.scores.length > 0) {
        // For each category, create a simple text list
        for (const [categoryName, scores] of Object.entries(scoresByCategory)) {
          doc.fontSize(14).text(categoryName);
          doc.moveDown(0.5);
          
          scores.forEach(score => {
            doc.fontSize(10).text(`${score.dimension.name}: Level ${score.level}`);
          });
          
          doc.moveDown();
        }
      } else {
        doc.fontSize(11).text('No scores submitted for this assessment.');
      }
      
      doc.moveDown();
    } catch (err) {
      console.error('Error generating PDF content:', err);
      // Fall back to simpler formatting if there's an error
      doc.fontSize(12).text('Error generating formatted report. Basic information:');
      doc.moveDown();
      doc.text(`Company: ${assessment.company?.name || 'N/A'}`);
      doc.text(`Department: ${assessment.department?.name || 'Company-Wide'}`);
      doc.text(`Total Scores: ${assessment.scores.length}`);
      
      if (assessmentWithScore.weightedAverageScore !== null && assessmentWithScore.weightedAverageScore !== undefined) {
        doc.text(`Overall Score: ${assessmentWithScore.weightedAverageScore.toFixed(2)}`);
      }
    }

    doc.end();

    const buffer = await streamToBuffer(stream);

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="assessment_report_${assessmentId}.pdf"`);

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate PDF', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 