import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContextService } from '@/lib/llm/contextService';

interface SectorDimensionContext {
  sectorId: string;
  sectorName: string;
  dimensionId: string;
  dimensionName: string;
  categoryName?: string;
  descriptors: Array<{
    level: number;
    description: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, assessmentContext } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const contextService = new ContextService();

    // Detect context from the query
    const detectedContext = await contextService.detectContext(query, assessmentContext);

    // Get relevant descriptors if any sectors/dimensions detected
    let relevantDescriptors: SectorDimensionContext[] = [];
    let contextString = '';

    if (detectedContext.sectors.length > 0 || detectedContext.dimensions.length > 0) {
      relevantDescriptors = await contextService.getRelevantDescriptors(
        detectedContext.sectors,
        detectedContext.dimensions.length > 0 ? detectedContext.dimensions : undefined,
        true
      );
      contextString = contextService.buildContextString(relevantDescriptors);
    }

    // Get enhanced context string
    const enhancedContext = await contextService.enhanceAssessmentContext(query, assessmentContext);

    // Get sector and dimension names for detailed display
    const detectedSectorNames: string[] = [];
    const detectedDimensionNames: string[] = [];

    // Fetch names for detected IDs
    if (detectedContext.sectors.length > 0) {
      for (const sectorId of detectedContext.sectors) {
        const sector = await contextService.getSectorById(sectorId);
        if (sector) {
          detectedSectorNames.push(sector.name);
        }
      }
    }

    if (detectedContext.dimensions.length > 0) {
      for (const dimensionId of detectedContext.dimensions) {
        const dimension = await contextService.getDimensionById(dimensionId);
        if (dimension) {
          detectedDimensionNames.push(dimension.name);
        }
      }
    }

    return NextResponse.json({
      detectedContext: {
        ...detectedContext,
        sectorNames: detectedSectorNames,
        dimensionNames: detectedDimensionNames
      },
      relevantDescriptors: relevantDescriptors.map(rd => ({
        sectorId: rd.sectorId,
        sectorName: rd.sectorName,
        dimensionId: rd.dimensionId,
        dimensionName: rd.dimensionName,
        categoryName: rd.categoryName,
        descriptorCount: rd.descriptors.length,
        levels: rd.descriptors.map((d: any) => d.level)
      })),
      contextString,
      enhancedContext,
      analysis: {
        sectorsDetected: detectedContext.sectors.length,
        dimensionsDetected: detectedContext.dimensions.length,
        confidence: detectedContext.confidence,
        queryType: detectedContext.queryType,
        willEnhanceContext: enhancedContext.length > 0,
        contextTokensEstimate: Math.ceil(enhancedContext.length / 4),
        manualSelectionUsed: !!(assessmentContext?.manualSectors || assessmentContext?.manualDimensions)
      }
    });

  } catch (error) {
    console.error('Context detection API error:', error);
    return NextResponse.json(
      { error: 'Failed to detect context' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contextService = new ContextService();

    // Get sample queries for testing
    const sampleQueries = [
      {
        query: "How can healthcare organizations improve their leadership commitment?",
        description: "Healthcare sector specific query"
      },
      {
        query: "What are the best practices for process standardization in manufacturing?",
        description: "Manufacturing sector with process dimension"
      },
      {
        query: "How do we implement 5S methodology?",
        description: "General lean methodology query"
      },
      {
        query: "What's the difference between Level 3 and Level 4 maturity in data governance?",
        description: "Dimension-specific maturity level query"
      },
      {
        query: "Our hospital needs to improve patient safety culture",
        description: "Healthcare sector with culture dimension"
      }
    ];

    return NextResponse.json({
      message: "Context Detection API - Test various queries to see automatic context enhancement",
      sampleQueries,
      usage: {
        endpoint: "/api/llm/context-detection",
        method: "POST",
        body: {
          query: "Your question here",
          assessmentContext: {
            companyId: "optional-company-id",
            sectorId: "optional-sector-id", 
            dimensionId: "optional-dimension-id"
          }
        }
      },
      features: [
        "Automatic sector detection from query text",
        "Dimension identification based on keywords",
        "Related dimension discovery",
        "Confidence scoring for context relevance",
        "Maturity descriptor fetching from database",
        "Context string generation for LLM prompts"
      ]
    });

  } catch (error) {
    console.error('Context detection API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get context detection info' },
      { status: 500 }
    );
  }
} 