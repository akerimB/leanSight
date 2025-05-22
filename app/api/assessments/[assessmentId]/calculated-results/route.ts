import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, AssessmentStatus } from '@prisma/client';
import { z } from 'zod';

// Zod schema for request parameters
const requestParamsSchema = z.object({
  assessmentId: z.string().uuid({ message: "Assessment ID must be a valid UUID." }),
  weightingSchemeId: z.string().uuid({ message: "Weighting Scheme ID must be a valid UUID." }),
});

interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  score: number | null; // Raw score (level 1-5)
  weightedScore: number | null;
  maxPossibleWeightedScore: number; // Max weighted score for this dimension based on its weight
  weight: number | null; // Dimension weight within its category
}

interface CategoryScore {
  categoryId: string;
  categoryName: string;
  totalScore: number;
  totalMaxPossibleScore: number; // Sum of max possible raw scores (e.g., 5 * num_dimensions)
  totalWeightedScore: number;
  totalMaxPossibleWeightedScore: number; // Sum of max possible weighted scores for dimensions in this category
  dimensions: DimensionScore[];
  categoryWeight: number | null; // Category weight within the scheme
  finalCategoryScore: number; // Category score considering its own weight in the scheme
  maxPossibleFinalCategoryScore: number; // Max possible category score considering its own weight
}

interface CalculatedResults {
  overallScore: number;
  overallMaxPossibleScore: number;
  categories: CategoryScore[];
  assessmentId: string;
  weightingSchemeId: string;
  weightingSchemeName: string;
}


export async function GET(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized - Please sign in.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const weightingSchemeId = searchParams.get('weightingSchemeId');

  const validation = requestParamsSchema.safeParse({
    assessmentId: params.assessmentId,
    weightingSchemeId: weightingSchemeId,
  });

  if (!validation.success) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { assessmentId: validatedAssessmentId, weightingSchemeId: validatedWeightingSchemeId } = validation.data;

  try {
    // 1. Fetch Assessment with its scores and company
    const assessment = await prisma.assessment.findUnique({
      where: { id: validatedAssessmentId, deletedAt: null },
      include: {
        company: { select: { id: true, name: true } },
        scores: { // Scores are the raw answers (level 1-5)
          where: { deletedAt: null },
          select: { dimensionId: true, level: true }
        },
      },
    });

    if (!assessment) {
      return new NextResponse(
        JSON.stringify({ error: 'Assessment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authorization: Admin or user belonging to the assessment's company
    if (session.user.role !== Role.ADMIN && session.user.companyId !== assessment.companyId) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden - You do not have permission to view these results.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch Weighting Scheme with its category and dimension weights
    const weightingScheme = await prisma.weightingScheme.findUnique({
      where: { id: validatedWeightingSchemeId, deletedAt: null },
      include: {
        categoryWeights: {
          where: { deletedAt: null },
          include: {
            category: { select: { id: true, name: true, dimensions: { select: { id: true, name: true }} } }, // Fetch dimensions under category
            dimensionWeights: {
              where: { deletedAt: null },
              select: { dimensionId: true, weight: true },
            },
          },
        },
      },
    });

    if (!weightingScheme) {
      return new NextResponse(
        JSON.stringify({ error: 'Weighting scheme not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // --- Score Calculation Logic ---
    const MAX_DIMENSION_LEVEL = 5;
    const assessmentScoresMap = new Map(assessment.scores.map(s => [s.dimensionId, s.level]));
    
    const calculatedCategories: CategoryScore[] = [];
    let overallAchievedScore = 0;
    let overallMaxPossibleScore = 0;

    for (const cw of weightingScheme.categoryWeights) {
      const category = cw.category;
      const categorySchemeWeight = cw.weight;

      let categoryTotalRawAchieved = 0;
      let categoryTotalRawMax = 0;
      let categoryTotalWeightedAchieved = 0;
      let categoryTotalWeightedMax = 0;
      
      const dimensionScores: DimensionScore[] = [];

      const explicitDimensionWeightsMap = new Map(cw.dimensionWeights.map(dw => [dw.dimensionId, dw.weight]));
      const usesExplicitDimWeights = cw.dimensionWeights.length > 0;

      // Dimensions relevant to this category, that were actually scored in the assessment
      const scoredDimensionsInThisCategory = category.dimensions.filter(d => assessmentScoresMap.has(d.id));

      if (!usesExplicitDimWeights) {
        // Equal weighting for all scored dimensions in this category
        const numScoredDims = scoredDimensionsInThisCategory.length;
        const dimWeight = numScoredDims > 0 ? 1 / numScoredDims : 0;

        for (const dim of scoredDimensionsInThisCategory) {
          const rawScore = assessmentScoresMap.get(dim.id) || 0;
          const weightedScore = rawScore * dimWeight;
          const maxWeightedScore = MAX_DIMENSION_LEVEL * dimWeight;

          dimensionScores.push({
            dimensionId: dim.id,
            dimensionName: dim.name,
            score: rawScore,
            weight: dimWeight, // Representing proportion if equally weighted
            weightedScore: weightedScore,
            maxPossibleWeightedScore: maxWeightedScore,
          });

          categoryTotalRawAchieved += rawScore;
          categoryTotalRawMax += MAX_DIMENSION_LEVEL;
          categoryTotalWeightedAchieved += weightedScore;
          categoryTotalWeightedMax += maxWeightedScore;
        }
      } else {
        // Use explicit dimension weights; only consider dimensions with an explicit weight.
        for (const dim of category.dimensions) { // Iterate all dimensions defined for this category
          const rawScore = assessmentScoresMap.get(dim.id); // May be undefined if not scored
          const dimWeight = explicitDimensionWeightsMap.get(dim.id);

          if (dimWeight !== undefined) { // Dimension has an explicit weight in the scheme for this category
            const currentRawScore = rawScore ?? 0; // Treat unscored as 0 if it has a weight
            const weightedScore = currentRawScore * dimWeight;
            const maxWeightedScore = MAX_DIMENSION_LEVEL * dimWeight;
            
            dimensionScores.push({
              dimensionId: dim.id,
              dimensionName: dim.name,
              score: rawScore ?? null, // Keep null if not scored
              weight: dimWeight,
              weightedScore: weightedScore,
              maxPossibleWeightedScore: maxWeightedScore,
            });

            // Only contribute to category totals if it was part of the weighting scheme
            categoryTotalRawAchieved += currentRawScore; // For consistency, raw scores sum up if dimension is weighted
            categoryTotalRawMax += MAX_DIMENSION_LEVEL; 
            categoryTotalWeightedAchieved += weightedScore;
            categoryTotalWeightedMax += maxWeightedScore;

          } else if (rawScore !== undefined) {
            // Scored, but no explicit weight in a scheme that uses explicit weights for other dimensions.
            // It contributes nothing to weighted score, but we can list it.
             dimensionScores.push({
              dimensionId: dim.id,
              dimensionName: dim.name,
              score: rawScore,
              weight: null, // No weight assigned in this scheme context
              weightedScore: 0,
              maxPossibleWeightedScore: 0,
            });
            // It doesn't contribute to the category's weighted score or raw totals under this scheme.
            // Or, decide if raw score should still be added to categoryTotalRawAchieved for info.
            // For now, keeping it strict: if explicit weights are used, only explicitly weighted dimensions count for totals.
          }
        }
      }

      // This is the category\'s performance (0-5 scale) based on its internal dimension weighting
      const categoryPerformanceFactor = categoryTotalWeightedMax > 0 ? categoryTotalWeightedAchieved / categoryTotalWeightedMax : 0;
      const categoryNormalizedScore = categoryPerformanceFactor * MAX_DIMENSION_LEVEL;


      const finalCategoryScoreContribution = categoryNormalizedScore * categorySchemeWeight;
      const maxPossibleFinalCategoryScoreContribution = MAX_DIMENSION_LEVEL * categorySchemeWeight;
      
      calculatedCategories.push({
        categoryId: category.id,
        categoryName: category.name,
        dimensions: dimensionScores,
        categoryWeight: categorySchemeWeight,
        
        totalScore: categoryTotalRawAchieved, // Sum of raw scores of dimensions that contributed
        totalMaxPossibleScore: categoryTotalRawMax, // Sum of max raw scores of dimensions that contributed

        // Represents the sum of (raw_score * dim_weight_within_category)
        totalWeightedScore: categoryTotalWeightedAchieved, 
        // Represents the sum of (MAX_LEVEL * dim_weight_within_category)
        totalMaxPossibleWeightedScore: categoryTotalWeightedMax, 

        finalCategoryScore: finalCategoryScoreContribution,
        maxPossibleFinalCategoryScore: maxPossibleFinalCategoryScoreContribution,
      });

      overallAchievedScore += finalCategoryScoreContribution;
      overallMaxPossibleScore += maxPossibleFinalCategoryScoreContribution;
    }
    
    const finalCalculatedResults: CalculatedResults = {
      overallScore: overallAchievedScore,
      overallMaxPossibleScore: overallMaxPossibleScore, // If category weights sum to 1, this should be MAX_DIMENSION_LEVEL (or 100 if scaled)
      categories: calculatedCategories,
      assessmentId: validatedAssessmentId,
      weightingSchemeId: validatedWeightingSchemeId,
      weightingSchemeName: weightingScheme.name,
    };

    return NextResponse.json(finalCalculatedResults);

  } catch (error) {
    console.error('Error calculating assessment results:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to calculate assessment results' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 