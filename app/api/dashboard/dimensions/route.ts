import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get submitted assessments with their scores
    const assessments = await prisma.assessment.findMany({
      where: { 
        status: { in: ['SUBMITTED', 'REVIEWED'] }
      },
      include: {
        scores: {
          include: {
            dimension: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Calculate average score for each dimension
    const dimensionScores: Record<string, { totalScore: number; count: number; name: string }> = {};

    assessments.forEach(assessment => {
      assessment.scores.forEach(score => {
        const dimensionId = score.dimensionId;
        const dimensionName = score.dimension?.name || 'Unknown';
        
        if (!dimensionScores[dimensionId]) {
          dimensionScores[dimensionId] = { totalScore: 0, count: 0, name: dimensionName };
        }
        
        dimensionScores[dimensionId].totalScore += score.level;
        dimensionScores[dimensionId].count += 1;
      });
    });

    // Convert to array and calculate averages
    const dimensionsArray = Object.entries(dimensionScores).map(([id, data]) => ({
      id,
      name: data.name,
      score: data.totalScore / data.count
    }));

    // Sort by score (descending for top, ascending for bottom)
    const sortedByScore = [...dimensionsArray].sort((a, b) => b.score - a.score);
    
    // Get top 3 and bottom 3 dimensions
    const top = sortedByScore.slice(0, 3);
    const bottom = [...sortedByScore].sort((a, b) => a.score - b.score).slice(0, 3);

    return NextResponse.json({ top, bottom });
  } catch (error) {
    console.error('Error fetching dimension data:', error);
    return NextResponse.json({ error: 'Failed to fetch dimension data' }, { status: 500 });
  }
} 