import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, AssessmentStatus, Score, WeightingScheme, CategoryWeight, DimensionWeight, Dimension, Category } from '@prisma/client';
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

// Helper function to calculate weighted score
interface ExtendedDimensionWeight extends DimensionWeight {
  dimension: Dimension;
}

interface ExtendedCategoryWeight extends CategoryWeight {
  category: Category;
  dimensionWeights: ExtendedDimensionWeight[];
}

interface ExtendedWeightingScheme extends WeightingScheme {
  categoryWeights: ExtendedCategoryWeight[];
}

interface ScoreWithDimension extends Score {
  dimension: { name: string, categoryId?: string }; // categoryId is optional if not directly on dimension
}

function calculateWeightedScore(
  scores: ScoreWithDimension[],
  weightingScheme: ExtendedWeightingScheme | null
): { weightedAverageScore: number | null; calculationUsed: 'weighted' | 'raw_average' | 'no_scores' } {
  if (!scores || scores.length === 0) {
    return { weightedAverageScore: null, calculationUsed: 'no_scores' };
  }

  // Calculate raw average as a fallback or default
  const rawTotalScore = scores.reduce((sum, score) => sum + score.level, 0);
  const rawAverage = scores.length > 0 ? rawTotalScore / scores.length : null;

  if (!weightingScheme || !weightingScheme.categoryWeights || weightingScheme.categoryWeights.length === 0) {
    return { weightedAverageScore: rawAverage, calculationUsed: 'raw_average' };
  }

  let totalWeightedScore = 0;
  let totalWeightSum = 0;

  // Create a map for easy lookup of scores by dimensionId
  const scoresMap = new Map(scores.map(s => [s.dimensionId, s.level]));
  
  // Create a set of dimension IDs that have scores
  const scoredDimensionIds = new Set(scores.map(s => s.dimensionId));

  for (const cw of weightingScheme.categoryWeights) {
    let categoryWeightedScoreSum = 0;
    let categoryDimensionWeightSum = 0;
    let categoryHasScoredDimension = false;

    if (cw.dimensionWeights && cw.dimensionWeights.length > 0) {
      // Filter dimension weights to only include dimensions that have scores
      // This prevents errors from dimensions that are in the weight scheme but not assessed
      const validDimensionWeights = cw.dimensionWeights.filter(dw => 
        scoredDimensionIds.has(dw.dimensionId)
      );
      
      for (const dw of validDimensionWeights) {
        const scoreLevel = scoresMap.get(dw.dimensionId);
        if (scoreLevel !== undefined) {
          categoryWeightedScoreSum += scoreLevel * dw.weight;
          categoryDimensionWeightSum += dw.weight;
          categoryHasScoredDimension = true;
        }
      }
    } else {
      // If a category has a weight but no specific dimension weights, average its dimensions directly
      // This requires knowing which dimensions belong to this category from the scores.
      // This part assumes `scores.dimension.categoryId` is available or dimensions are pre-fetched with category info.
      const dimensionsInCategory = scores.filter(s => s.dimension.categoryId === cw.categoryId);
      if (dimensionsInCategory.length > 0) {
        const categoryRawTotal = dimensionsInCategory.reduce((sum, s) => sum + s.level, 0);
        const categoryRawAverage = categoryRawTotal / dimensionsInCategory.length;
        
        categoryWeightedScoreSum += categoryRawAverage * cw.weight; // Weight the raw average of the category
        categoryDimensionWeightSum += cw.weight; // The "weight" for this category's contribution
        categoryHasScoredDimension = true; 
      }
    }
    
    if (categoryHasScoredDimension && categoryDimensionWeightSum > 0) {
        // Average score for the category, weighted by dimension weights
        const averageCategoryScore = categoryWeightedScoreSum / categoryDimensionWeightSum;
        // Now, weight this average category score by the category\'s own weight
        totalWeightedScore += averageCategoryScore * cw.weight;
        totalWeightSum += cw.weight;
    } else if (categoryHasScoredDimension && categoryDimensionWeightSum === 0 && cw.weight > 0) {
        // Edge case: Dimensions were scored, but all had zero weight in the scheme, but category itself has a weight.
        // This might mean the category\'s average (which would be 0 if all dimension weights are 0) is weighted.
        // Or, more likely, this scenario implies an issue with the scheme or means the category contributes 0.
        // For now, let\'s assume if dimension weights sum to 0, the category contributes 0 effectively if it relied on dimension weights.
        // If it had direct scores (handled in the \'else\' above for dimensionsInCategory), that would be different.
        // This path should ideally be refined based on precise business logic for zero-sum dimension weights.
        // For safety, let\'s add the category weight to totalWeightSum if it was supposed to contribute.
        totalWeightSum += cw.weight;
    }

  }

  if (totalWeightSum === 0) {
    // If total weight sum is zero (e.g., no matching categories/dimensions found or all weights are zero),
    // fall back to raw average.
    return { weightedAverageScore: rawAverage, calculationUsed: 'raw_average' };
  }

  return { weightedAverageScore: totalWeightedScore / totalWeightSum, calculationUsed: 'weighted' };
}

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

    // Verify the user (expert) exists in the database
    // This prevents foreign key violations on expertId
    const expertExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true }
    });

    if (!expertExists) {
      console.error(`User not found with ID: ${session.user.id}`);
      return new NextResponse(
        JSON.stringify({ error: 'Your user account could not be found. Please sign out and sign in again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    // If we have a weighting scheme, make sure it's compatible with the company's sector
    let finalWeightingSchemeId = weightingSchemeId || null;
    if (weightingSchemeId) {
      // Get the company's sector ID
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { sectorId: true }
      });
      
      if (company) {
        // Get dimensions that have descriptors for this sector (valid dimensions)
        const categories = await prisma.category.findMany({
          include: {
            dimensions: {
              where: {
                descriptors: {
                  some: {
                    sectorId: company.sectorId,
                    deletedAt: null
                  }
                }
              },
              select: { id: true }
            }
          }
        });
        
        // Create a set of valid dimension IDs
        const validDimensionIds = new Set();
        categories.forEach(cat => {
          cat.dimensions.forEach(dim => {
            validDimensionIds.add(dim.id);
          });
        });
        
        // Check if the weighting scheme has weights for dimensions without descriptors
        const weightingScheme = await prisma.weightingScheme.findUnique({
          where: { id: weightingSchemeId },
          include: {
            categoryWeights: {
              include: {
                dimensionWeights: true
              }
            }
          }
        });
        
        if (weightingScheme) {
          let hasInvalidDimensions = false;
          weightingScheme.categoryWeights.forEach(cw => {
            cw.dimensionWeights.forEach(dw => {
              if (!validDimensionIds.has(dw.dimensionId)) {
                hasInvalidDimensions = true;
              }
            });
          });
          
          // If the weighting scheme references invalid dimensions, don't use it
          if (hasInvalidDimensions) {
            console.warn(`Weighting scheme ${weightingSchemeId} references dimensions without descriptors for sector ${company.sectorId}. Using even weights instead.`);
            finalWeightingSchemeId = null;
          }
        }
      }
    }
    
    // Log the attempt but don't query the database separately
    // NextAuth should ensure the user exists
    console.log(`Creating assessment with expertId: ${session.user.id}, companyId: ${companyId}, departmentId: ${departmentId}`);
    
    // Create the assessment record
    const assessment = await prisma.assessment.create({
      data: {
        companyId,
        departmentId, // This can be null for company-wide assessments
        expertId: session.user.id, // Use session user ID directly
        status: draft ? AssessmentStatus.DRAFT : AssessmentStatus.SUBMITTED,
        weightingSchemeId: finalWeightingSchemeId,
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
      
      // Calculate and store the weighted score if we have scores and potentially a weighting scheme
      if (answers.length > 0) {
        // Fetch the created assessment with scores and dimension details for calculation
        const assessmentWithScores = await prisma.assessment.findUnique({
          where: { id: assessment.id },
          include: {
            scores: {
              include: {
                dimension: { select: { name: true, categoryId: true } }
              }
            },
            weightingScheme: {
              include: {
                categoryWeights: {
                  include: {
                    dimensionWeights: {
                      include: {
                        dimension: true
                      }
                    },
                    category: true
                  }
                }
              }
            }
          }
        });

        if (assessmentWithScores) {
          // Cast to the expected types for the calculateWeightedScore function
          const scoresWithDimension = assessmentWithScores.scores as unknown as ScoreWithDimension[];
          const extendedWeightingScheme = assessmentWithScores.weightingScheme as unknown as ExtendedWeightingScheme | null;
          
          // Calculate the weighted score
          const { weightedAverageScore, calculationUsed } = calculateWeightedScore(scoresWithDimension, extendedWeightingScheme);
          
          // Update the assessment with the calculated score
          // Using Prisma.updateMany to bypass type issues
          await prisma.$executeRaw`
            UPDATE "Assessment"
            SET "weightedAverageScore" = ${weightedAverageScore}, "calculationUsed" = ${calculationUsed}
            WHERE "id" = ${assessment.id}
          `;
        }
      }
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
      // Enhanced error messaging for foreign key constraint violations
      let errorMessage = 'Invalid reference: One or more IDs do not exist';
      
      if (error.meta && error.meta.field_name) {
        const fieldName = error.meta.field_name;
        
        if (fieldName.includes('expertId')) {
          errorMessage = 'Session error: Your user account could not be verified. Please sign out and sign in again.';
        } else if (fieldName.includes('companyId')) {
          errorMessage = 'The selected company does not exist or has been deleted.';
        } else if (fieldName.includes('departmentId')) {
          errorMessage = 'The selected department does not exist or has been deleted.';
        } else if (fieldName.includes('dimensionId')) {
          errorMessage = 'One or more dimensions in your assessment are no longer available. Please refresh the page and try again.';
        } else if (fieldName.includes('weightingSchemeId')) {
          errorMessage = 'The selected weighting scheme is no longer available. Please choose another scheme.';
        }
        
        console.error(`Foreign key error on field: ${fieldName}`);
      }
      
      return new NextResponse(
        JSON.stringify({ error: errorMessage }),
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
                  name: true,
                  // Ensure categoryId is fetched if needed for direct category weighting without dimensionWeights
                  categoryId: true, // Assuming Dimension model has categoryId
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
                      dimension: { select: { id: true, name: true } } // Dimension details already here
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

      // Calculate weighted score
      const { weightedAverageScore, calculationUsed } = calculateWeightedScore(
        assessment.scores as ScoreWithDimension[], // Cast needed due to Prisma generated types vs. our extended interface
        assessment.weightingScheme as ExtendedWeightingScheme | null
      );

      return NextResponse.json({ ...assessment, weightedAverageScore, calculationUsed });
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

    // Validation with Zod
    const validationResult = updateAssessmentSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request data', details: validationResult.error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id, answers, status, weightingSchemeId } = validationResult.data;

    // Fetch the assessment to check permissions and current state
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id, deletedAt: null },
      include: { 
        company: { select: { id: true } }, 
        scores: {
          include: {
            dimension: { select: { id: true, name: true, categoryId: true } }
          }
        }
      }
    });

    if (!existingAssessment) {
      return new NextResponse(
        JSON.stringify({ error: 'Assessment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authorization check
    if (session.user.role !== Role.ADMIN && session.user.companyId !== existingAssessment.companyId) {
      if (session.user.id !== existingAssessment.expertId) { // Check if they're the assessment creator
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - You do not have permission to update this assessment' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Prepare base update data
    const updateData: any = {};

    // Handle weightingSchemeId update if provided
    if (weightingSchemeId !== undefined) {
      updateData.weightingSchemeId = weightingSchemeId;
    }
    
    // Handle status update if provided
    if (status) {
      // Status validation logic
      // For example: can only move to SUBMITTED if it's in DRAFT, etc.
      if (existingAssessment.status === AssessmentStatus.REVIEWED && status !== AssessmentStatus.REVIEWED && session.user.role !== Role.ADMIN) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden - Only admins can change the status of a reviewed assessment' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Ensure DRAFT assessments can't be submitted without at least one answer
      if (existingAssessment.status === AssessmentStatus.DRAFT && status === AssessmentStatus.SUBMITTED) {
        const scoreCount = await prisma.score.count({ where: { assessmentId: id } });
        if (scoreCount === 0 && (!answers || answers.length === 0)) {
          return new NextResponse(
            JSON.stringify({ error: 'Cannot submit assessment without any scores' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      updateData.status = status;
    }

    // Handle answers update if provided
    if (answers && answers.length > 0) {
      // Prepare a transaction to update all scores atomically
      await prisma.$transaction([
        // First, delete existing scores (could also use upsert for each, but this is simpler)
        prisma.score.deleteMany({
          where: { assessmentId: id }
        }),
        // Then create the new scores
        prisma.score.createMany({
          data: answers.map((a: { dimensionId: string; level: number }) => ({
            assessmentId: id,
            dimensionId: a.dimensionId,
            level: a.level,
            perception: true,
          }))
        })
      ]);
    }

    // After updating answers or changing weightingScheme, we need to calculate the weighted score
    if (answers || weightingSchemeId !== undefined) {
      // Fetch fresh data for score calculation
      const updatedAssessment = await prisma.assessment.findUnique({
        where: { id },
        include: {
          scores: {
            include: {
              dimension: { select: { name: true, categoryId: true } }
            }
          },
          weightingScheme: {
            include: {
              categoryWeights: {
                include: {
                  dimensionWeights: {
                    include: {
                      dimension: true
                    }
                  },
                  category: true
                }
              }
            }
          }
        }
      });

      if (updatedAssessment && updatedAssessment.scores.length > 0) {
        // Cast to the expected types for the calculateWeightedScore function
        const scoresWithDimension = updatedAssessment.scores as unknown as ScoreWithDimension[];
        const extendedWeightingScheme = updatedAssessment.weightingScheme as unknown as ExtendedWeightingScheme | null;
        
        // Calculate the weighted score
        const { weightedAverageScore, calculationUsed } = calculateWeightedScore(scoresWithDimension, extendedWeightingScheme);
        
        // Add these to our updateData
        updateData.weightedAverageScore = weightedAverageScore;
        updateData.calculationUsed = calculationUsed;
      }
    }

    // Perform the update if there's anything to update
    if (Object.keys(updateData).length > 0) {
      await prisma.assessment.update({
        where: { id },
        data: updateData
      });
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating assessment:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update assessment', details: error.message }),
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