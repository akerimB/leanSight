import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, AssessmentStatus } from '@prisma/client';

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
    const { companyId, departmentId, answers, draft } = body;
    if (!companyId || (departmentId === undefined)) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: companyId and departmentId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!draft && !Array.isArray(answers)) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: answers must be an array' }),
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

    // Create the assessment record
    const assessment = await prisma.assessment.create({
      data: {
        companyId,
        departmentId,
        expertId: session.user.id,
        status: draft ? AssessmentStatus.DRAFT : AssessmentStatus.SUBMITTED,
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
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to submit assessment' }),
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
        where: { id },
        include: {
          company: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          scores: { select: { dimensionId: true, level: true } },
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
    const where = session.user.role === Role.ADMIN
      ? undefined
      : session.user.companyId
        ? { companyId: session.user.companyId }
        : undefined;
    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        company: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        _count: { select: { scores: true } },
      },
    });
    return NextResponse.json(assessments);
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
    // Accept both answers updates and/or status transitions
    const { id, answers, status: newStatus } = await request.json();
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required field: id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = await prisma.assessment.findUnique({ where: { id } });
    if (!existing) {
      return new NextResponse(
        JSON.stringify({ error: 'Assessment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Authorization
    if (session.user.role !== Role.ADMIN && session.user.companyId !== existing.companyId) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If answers present, replace scores
    if (Array.isArray(answers)) {
      await prisma.score.deleteMany({ where: { assessmentId: id } });
      const scoreData = answers.map((a: { dimensionId: string; level: number }) => ({
        assessmentId: id,
        dimensionId: a.dimensionId,
        level: a.level,
        perception: true,
      }));
      await prisma.score.createMany({ data: scoreData });
    }
    // Handle status transition
    if (newStatus) {
      // Only admins can mark as REVIEWED or DRAFT
      if (newStatus === AssessmentStatus.REVIEWED && session.user.role !== Role.ADMIN) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - only admins can review' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      await prisma.assessment.update({ data: { status: newStatus }, where: { id } });
    } else if (Array.isArray(answers)) {
      // If answers updated without explicit status, keep existing or submitted
      await prisma.assessment.update({ data: { status: AssessmentStatus.SUBMITTED }, where: { id } });
    }
    return NextResponse.json({ id });
  } catch (error) {
    console.error('PUT assessment error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update assessment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}