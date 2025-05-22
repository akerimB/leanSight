import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, AssessmentStatus } from '@prisma/client';
import { z } from 'zod';

// Zod schema for PUT request validation
const updateAssessmentSchema = z.object({
  id: z.string().uuid({ message: "Assessment ID must be a valid UUID." }),
  answers: z.array(z.object({
    dimensionId: z.string().uuid(),
    level: z.number().min(1).max(5).int(),
  })).optional(),
  status: z.nativeEnum(AssessmentStatus).optional(),
  weightingSchemeId: z.string().uuid().nullable().optional(), // Allow string UUID or null
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized - Please sign in to submit an assessment' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Accept draft creation or full submission
    const body = await request.json();
    const { companyId, departmentId, answers, draft, weightingSchemeId } = body;

    // Validate required fields
    if (!companyId) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required field: companyId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Note: departmentId can be null for company-wide assessments
    if (departmentId === undefined) {
      return new NextResponse(
        JSON.stringify({ error: 'departmentId must be explicitly set (can be null for company-wide assessments)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For non-draft submissions, validate answers
    if (!draft && !Array.isArray(answers)) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: answers must be an array for non-draft submissions' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authorization: only admins or users of that company can submit
    if (session.user.role !== Role.ADMIN && session.user.companyId !== companyId) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden - You do not have permission to submit for this company' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If departmentId is provided (not null), verify it belongs to the company
    if (departmentId !== null) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { companyId: true }
      });

      if (!department) {
        return new NextResponse(
          JSON.stringify({ error: 'Department not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (department.companyId !== companyId) {
        return new NextResponse(
          JSON.stringify({ error: 'Department does not belong to the specified company' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create the assessment record
    const assessment = await prisma.assessment.create({
      data: {
        companyId,
        departmentId, // This can be null for company-wide assessments
        expertId: session.user.id,
        status: draft ? AssessmentStatus.DRAFT : AssessmentStatus.SUBMITTED,
        weightingSchemeId: weightingSchemeId || null,
      },
    });

    // For full submission or saving answers, create associated scores
    if (Array.isArray(answers) && answers.length > 0) {
      const scoreData = answers.map((a: { dimensionId: string; level: number }) => ({
        assessmentId: assessment.id,
        dimensionId: a.dimensionId,
        level: a.level,
        perception: true,
      }));
      
      await prisma.score.createMany({ data: scoreData });
    }

    return new NextResponse(JSON.stringify({ id: assessment.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return new NextResponse(
        JSON.stringify({ error: 'A similar assessment already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (error.code === 'P2003') {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid reference: One or more IDs do not exist' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: 'Failed to submit assessment', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Fetch list of assessments or a single assessment by id
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  // Single assessment
  if (id) {
    try {
      const assessment = await prisma.assessment.findUnique({
        where: { id, deletedAt: null },
        include: {
          company: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          scores: {
            select: {
              dimensionId: true,
              level: true,
              dimension: {
                select: {
                  name: true
                }
              }
            }
          },
          weightingScheme: {
            include: {
              categoryWeights: {
                include: {
                  category: { select: { id: true, name: true } },
                  dimensionWeights: {
                    include: {
                      dimension: { select: { id: true, name: true } }
                    }
                  }
                }
              }
            }
          }
        },
      });
      if (!assessment) {
        return new NextResponse(
          JSON.stringify({ error: 'Assessment not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Authorization: only admin or owner company
      if (session.user.role !== Role.ADMIN && session.user.companyId !== assessment.companyId) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.json(assessment);
    } catch (error) {
      console.error('GET assessment error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch assessment' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  // List assessments
  try {
    const baseWhere: any = {
      deletedAt: null,
    };

    const finalWhere = session.user.role === Role.ADMIN
      ? baseWhere
      : session.user.companyId
        ? { ...baseWhere, companyId: session.user.companyId }
        : { ...baseWhere, id: '__NEVER_MATCH__' };

    const assessments = await prisma.assessment.findMany({
      where: finalWhere,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        company: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        scores: { select: { level: true } }, // Select scores to calculate raw average
        _count: { select: { scores: true } }, // Keep existing score count if needed elsewhere
      },
    });

    // Calculate raw average score for each assessment
    const assessmentsWithRawAvg = assessments.map(assessment => {
      const { scores, ...rest } = assessment;
      let rawAverageScore = null;
      if (scores && scores.length > 0) {
        const totalScore = scores.reduce((sum, score) => sum + score.level, 0);
        rawAverageScore = totalScore / scores.length;
      }
      return { ...rest, rawAverageScore, scoreCount: scores?.length || 0 }; // Add rawAverageScore and ensure scoreCount is based on fetched scores
    });

    return NextResponse.json(assessmentsWithRawAvg);
  } catch (error) {
    console.error('LIST assessments error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch assessments' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Update existing assessment
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  try {
    const body = await request.json();
    const validation = updateAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id, answers, status: newStatus, weightingSchemeId } = validation.data;

    const existing = await prisma.assessment.findUnique({ where: { id } });
    if (!existing) {
      return new NextResponse(
        JSON.stringify({ error: 'Assessment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // General Authorization: User must be Admin or belong to the company of the assessment
    // This initial check is for general updates like answers and status by company members.
    let canUpdateAssessment = false;
    if (session.user.role === Role.ADMIN || session.user.companyId === existing.companyId) {
        canUpdateAssessment = true;
    }
    
    // If only weightingSchemeId is being updated, or in addition to other fields,
    // specific authorization for weightingSchemeId (Admin or assigned Expert) takes precedence if general auth fails.
    let canUpdateScheme = false;
    if (weightingSchemeId !== undefined) { // Intention to change scheme is present
        if (session.user.role === Role.ADMIN || session.user.id === existing.expertId) {
            canUpdateScheme = true;
        } else {
             // If user is not Admin/Expert but tries to change scheme, it's forbidden for this part.
            return new NextResponse(
                JSON.stringify({ error: 'Forbidden - Only Admin or the assigned Expert can change the weighting scheme.' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } else {
        // If there's no intention to change the scheme, this part doesn't need specific auth beyond general.
        canUpdateScheme = true; // Effectively means no scheme update is requested or auth passes through.
    }

    // If neither general update permission nor specific scheme update permission is met.
    // This handles cases where a non-admin/non-company member tries to update other fields (e.g. status, answers)
    // without being the expert trying to change the scheme.
    if (!canUpdateAssessment && weightingSchemeId === undefined) {
         return new NextResponse(
            JSON.stringify({ error: 'Forbidden - You do not have permission to update this assessment.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const dataToUpdate: any = {};

    // If answers present, replace scores (within transaction if combined with other updates)
    if (Array.isArray(answers)) {
      // This part needs to be handled carefully if combined in a transaction or as separate operations.
      // For simplicity, keeping it as sequential operations before the final assessment update.
      await prisma.score.deleteMany({ where: { assessmentId: id } });
      if (answers.length > 0) {
        const scoreData = answers.map((a) => ({
          assessmentId: id,
          dimensionId: a.dimensionId,
          level: a.level,
          perception: true, // Assuming default
        }));
        await prisma.score.createMany({ data: scoreData });
      }
      // If answers are updated, it implies the assessment is at least SUBMITTED unless explicitly set otherwise
      if (!newStatus && existing.status === AssessmentStatus.DRAFT) {
        dataToUpdate.status = AssessmentStatus.SUBMITTED;
      }
    }

    // Handle status transition
    if (newStatus) {
      if (newStatus === AssessmentStatus.REVIEWED && session.user.role !== Role.ADMIN) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - only admins can mark as reviewed' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Allow Admin to revert to DRAFT perhaps, or any other valid transitions.
      // For now, assume any status change by an authorized user is valid unless specifically restricted.
      dataToUpdate.status = newStatus;
    }

    // Handle weightingSchemeId update
    if (weightingSchemeId !== undefined && canUpdateScheme) { // Check canUpdateScheme again for safety, though prior logic should gate it.
      dataToUpdate.weightingSchemeId = weightingSchemeId; // This can be string (UUID) or null
    }

    // Perform the update if there's anything in dataToUpdate
    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.assessment.update({ 
        where: { id }, 
        data: dataToUpdate 
      });
    }

    return NextResponse.json({ id, message: "Assessment updated successfully." });
  } catch (error) {
    console.error('PUT assessment error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update assessment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Soft delete an assessment
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing assessment ID' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const assessmentToUpdate = await prisma.assessment.findUnique({
      where: { id },
    });

    if (!assessmentToUpdate) {
      return new NextResponse(
        JSON.stringify({ error: 'Assessment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authorization: Only ADMIN or the user who created the assessment (expertId) can delete
    if (session.user.role !== Role.ADMIN && session.user.id !== assessmentToUpdate.expertId) {
        // Or if company based deletion: && session.user.companyId !== assessmentToUpdate.companyId
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden - You do not have permission to delete this assessment' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.assessment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return new NextResponse(JSON.stringify({ message: 'Assessment soft deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error soft deleting assessment:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to soft delete assessment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}