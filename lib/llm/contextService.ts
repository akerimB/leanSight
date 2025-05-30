import prisma from '@/lib/prisma';

interface MaturityDescriptor {
  id: string;
  level: number;
  description: string;
  dimensionId: string;
  sectorId: string;
  dimension: {
    id: string;
    name: string;
    description?: string | null;
    category?: {
      id: string;
      name: string;
    } | null;
  };
}

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

interface DetectedContext {
  sectors: string[];
  dimensions: string[];
  queryType: 'general' | 'sector_specific' | 'dimension_specific' | 'sector_dimension_specific';
  confidence: number;
}

export class ContextService {
  private sectorCache = new Map<string, any>();
  private dimensionCache = new Map<string, any>();
  private descriptorCache = new Map<string, MaturityDescriptor[]>();

  /**
   * Analyze user query to detect mentions of sectors and dimensions
   */
  async detectContext(query: string, assessmentContext?: any): Promise<DetectedContext> {
    const lowerQuery = query.toLowerCase();
    
    // Check for manual selections first
    if (assessmentContext?.manualSectors || assessmentContext?.manualDimensions) {
      return {
        sectors: assessmentContext.manualSectors || [],
        dimensions: assessmentContext.manualDimensions || [],
        queryType: 'sector_dimension_specific',
        confidence: 1.0 // Full confidence for manual selections
      };
    }
    
    // Get all sectors and dimensions for matching
    const [sectors, dimensions] = await Promise.all([
      this.getAllSectors(),
      this.getAllDimensions()
    ]);

    const detectedSectors: string[] = [];
    const detectedDimensions: string[] = [];

    // Check for explicit sector mentions
    for (const sector of sectors) {
      const sectorNames = [sector.name.toLowerCase(), ...this.generateAlternativeNames(sector.name)];
      if (sectorNames.some(name => lowerQuery.includes(name))) {
        detectedSectors.push(sector.id);
      }
    }

    // Check for explicit dimension mentions
    for (const dimension of dimensions) {
      const dimensionNames = [dimension.name.toLowerCase(), ...this.generateAlternativeNames(dimension.name)];
      if (dimensionNames.some(name => lowerQuery.includes(name))) {
        detectedDimensions.push(dimension.id);
      }
    }

    // Use assessment context if available and no explicit mentions found
    if (detectedSectors.length === 0 && assessmentContext?.companyId) {
      const company = await this.getCompanyWithSector(assessmentContext.companyId);
      if (company?.sectorId) {
        detectedSectors.push(company.sectorId);
      }
    }

    // Determine query type and confidence
    let queryType: DetectedContext['queryType'] = 'general';
    let confidence = 0.5;

    if (detectedSectors.length > 0 && detectedDimensions.length > 0) {
      queryType = 'sector_dimension_specific';
      confidence = 0.9;
    } else if (detectedSectors.length > 0) {
      queryType = 'sector_specific';
      confidence = 0.8;
    } else if (detectedDimensions.length > 0) {
      queryType = 'dimension_specific';
      confidence = 0.7;
    }

    // Boost confidence if assessment context is available
    if (assessmentContext && (detectedSectors.length > 0 || detectedDimensions.length > 0)) {
      confidence = Math.min(confidence + 0.1, 1.0);
    }

    return {
      sectors: detectedSectors,
      dimensions: detectedDimensions,
      queryType,
      confidence
    };
  }

  /**
   * Fetch relevant maturity descriptors based on detected context
   */
  async getRelevantDescriptors(
    sectorIds: string[],
    dimensionIds?: string[],
    includeRelatedDimensions = true
  ): Promise<SectorDimensionContext[]> {
    const contexts: SectorDimensionContext[] = [];

    for (const sectorId of sectorIds) {
      const sector = await this.getSectorById(sectorId);
      if (!sector) continue;

      let targetDimensionIds = dimensionIds || [];

      // If no specific dimensions provided, get all dimensions for the sector
      if (targetDimensionIds.length === 0) {
        const allDimensions = await this.getAllDimensions();
        targetDimensionIds = allDimensions.map((d: any) => d.id);
      }

      // Include related dimensions if requested
      if (includeRelatedDimensions && dimensionIds) {
        const relatedDimensions = await this.getRelatedDimensions(dimensionIds);
        targetDimensionIds = Array.from(new Set([...targetDimensionIds, ...relatedDimensions]));
      }

      // Fetch descriptors for each dimension
      for (const dimensionId of targetDimensionIds) {
        const descriptors = await this.getDescriptorsForSectorDimension(sectorId, dimensionId);
        if (descriptors.length > 0) {
          const dimension = await this.getDimensionById(dimensionId);
          contexts.push({
            sectorId,
            sectorName: sector.name,
            dimensionId,
            dimensionName: dimension?.name || 'Unknown Dimension',
            categoryName: dimension?.category?.name,
            descriptors: descriptors.map(d => ({
              level: d.level,
              description: d.description
            })).sort((a, b) => a.level - b.level)
          });
        }
      }
    }

    return contexts;
  }

  /**
   * Build context string for LLM prompts
   */
  buildContextString(contexts: SectorDimensionContext[]): string {
    if (contexts.length === 0) {
      return '';
    }

    let contextStr = '\n\n## Relevant Maturity Level Descriptors\n\n';
    
    for (const context of contexts) {
      contextStr += `### ${context.dimensionName}`;
      if (context.categoryName) {
        contextStr += ` (${context.categoryName})`;
      }
      contextStr += ` - ${context.sectorName} Sector\n\n`;

      for (const descriptor of context.descriptors) {
        const levelName = this.getLevelName(descriptor.level);
        contextStr += `**Level ${descriptor.level} (${levelName})**: ${descriptor.description}\n\n`;
      }
    }

    contextStr += '---\n\n';
    contextStr += 'Use these maturity level descriptors to provide specific, contextualized guidance. ';
    contextStr += 'Reference the appropriate levels when discussing improvements or assessments.\n\n';

    return contextStr;
  }

  /**
   * Automatically enhance assessment context with relevant descriptors
   */
  async enhanceAssessmentContext(
    query: string,
    assessmentContext?: any
  ): Promise<string> {
    try {
      const detected = await this.detectContext(query, assessmentContext);
      
      if (detected.confidence < 0.6) {
        return '';
      }

      const contexts = await this.getRelevantDescriptors(
        detected.sectors,
        detected.dimensions.length > 0 ? detected.dimensions : undefined,
        true
      );

      return this.buildContextString(contexts);
    } catch (error) {
      console.error('Error enhancing assessment context:', error);
      return '';
    }
  }

  /**
   * Get sector-specific context for general queries
   */
  async getSectorSpecificContext(sectorId: string, maxDimensions = 5): Promise<string> {
    try {
      const sector = await this.getSectorById(sectorId);
      if (!sector) return '';

      // Get the most important dimensions (you could implement ranking logic here)
      const allDimensions = await this.getAllDimensions();
      const topDimensions = allDimensions.slice(0, maxDimensions);

      const contexts = await this.getRelevantDescriptors(
        [sectorId],
        topDimensions.map((d: any) => d.id),
        false
      );

      return this.buildContextString(contexts);
    } catch (error) {
      console.error('Error getting sector-specific context:', error);
      return '';
    }
  }

  // Public helper methods for API access

  async getSectorById(sectorId: string) {
    if (!this.sectorCache.has(sectorId)) {
      const sector = await prisma.sector.findUnique({
        where: { id: sectorId },
        select: { id: true, name: true, description: true }
      });
      this.sectorCache.set(sectorId, sector);
    }
    return this.sectorCache.get(sectorId);
  }

  async getDimensionById(dimensionId: string) {
    if (!this.dimensionCache.has(dimensionId)) {
      const dimension = await prisma.dimension.findUnique({
        where: { id: dimensionId },
        include: {
          category: {
            select: { id: true, name: true }
          }
        }
      });
      this.dimensionCache.set(dimensionId, dimension);
    }
    return this.dimensionCache.get(dimensionId);
  }

  // Private helper methods

  private async getAllSectors() {
    if (!this.sectorCache.has('all')) {
      const sectors = await prisma.sector.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, description: true }
      });
      this.sectorCache.set('all', sectors);
    }
    return this.sectorCache.get('all');
  }

  private async getAllDimensions() {
    if (!this.dimensionCache.has('all')) {
      const dimensions = await prisma.dimension.findMany({
        where: { deletedAt: null },
        include: {
          category: {
            select: { id: true, name: true }
          }
        }
      });
      this.dimensionCache.set('all', dimensions);
    }
    return this.dimensionCache.get('all');
  }

  private async getDescriptorsForSectorDimension(sectorId: string, dimensionId: string): Promise<MaturityDescriptor[]> {
    const cacheKey = `${sectorId}:${dimensionId}`;
    
    if (!this.descriptorCache.has(cacheKey)) {
      const descriptors = await prisma.maturityDescriptor.findMany({
        where: {
          sectorId,
          dimensionId,
          deletedAt: null
        },
        include: {
          dimension: {
            select: {
              id: true,
              name: true,
              description: true,
              category: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: { level: 'asc' }
      }) as MaturityDescriptor[];
      this.descriptorCache.set(cacheKey, descriptors);
    }
    
    return this.descriptorCache.get(cacheKey) || [];
  }

  private async getCompanyWithSector(companyId: string) {
    return await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, sectorId: true }
    });
  }

  private async getRelatedDimensions(dimensionIds: string[]): Promise<string[]> {
    // Get dimensions from the same categories
    const categoryIds = await prisma.dimension.findMany({
      where: { id: { in: dimensionIds } },
      select: { categoryId: true }
    }).then(dims => dims.map(d => d.categoryId).filter(Boolean) as string[]);

    const dimensions = await prisma.dimension.findMany({
      where: {
        deletedAt: null,
        categoryId: { in: categoryIds }
      },
      select: { id: true }
    });

    return dimensions.map(d => d.id).filter(id => !dimensionIds.includes(id));
  }

  private generateAlternativeNames(name: string): string[] {
    const alternatives: string[] = [];
    
    // Add acronyms if name has multiple words
    const words = name.split(/\s+/);
    if (words.length > 1) {
      alternatives.push(words.map(w => w[0]).join('').toLowerCase());
    }
    
    // Add partial matches for compound terms
    if (name.includes('&') || name.includes('and')) {
      alternatives.push(...name.split(/\s*(?:&|and)\s*/i));
    }
    
    // Add without common prefixes/suffixes
    const withoutCommon = name.replace(/^(the|a|an)\s+/i, '').replace(/\s+(management|system|process)$/i, '');
    if (withoutCommon !== name) {
      alternatives.push(withoutCommon.toLowerCase());
    }
    
    return alternatives.map(alt => alt.toLowerCase());
  }

  private getLevelName(level: number): string {
    const levelNames = {
      1: 'Initial',
      2: 'Developing', 
      3: 'Defined',
      4: 'Managed',
      5: 'Optimizing'
    };
    return levelNames[level as keyof typeof levelNames] || 'Unknown';
  }

  /**
   * Clear caches (useful for testing or when data changes)
   */
  clearCaches() {
    this.sectorCache.clear();
    this.dimensionCache.clear();
    this.descriptorCache.clear();
  }
}

export default ContextService; 