# Automated Context Management for LLM Integration

## Overview

The LeanSight platform now features an intelligent context management system that automatically enhances LLM responses with relevant maturity level descriptors from the database. When users ask questions about specific sectors and dimensions, the system automatically detects the context and provides the LLM with precise, sector-specific maturity guidance.

## How It Works

### 1. Context Detection
The system analyzes user queries to identify:
- **Sector mentions**: Healthcare, Manufacturing, Finance, etc.
- **Dimension references**: Leadership, Process, Quality, Data Governance, etc.
- **Assessment context**: Current company sector, active assessment details

### 2. Database Integration
When context is detected, the system:
- Fetches relevant maturity descriptors from the `MaturityDescriptor` table
- Filters by sector and dimension combinations
- Includes related dimensions from the same category
- Sorts descriptors by maturity level (1-5)

### 3. Context Enhancement
The LLM receives enhanced prompts containing:
- Specific maturity level descriptions for the detected sector-dimension combinations
- Clear level definitions (Initial, Developing, Defined, Managed, Optimizing)
- Contextual guidance for improvement recommendations

## Architecture

### Core Components

#### ContextService (`lib/llm/contextService.ts`)
The main service that handles all context detection and enhancement:

```typescript
class ContextService {
  // Analyzes queries to detect sectors and dimensions
  async detectContext(query: string, assessmentContext?: any): Promise<DetectedContext>
  
  // Fetches relevant descriptors from database
  async getRelevantDescriptors(sectorIds: string[], dimensionIds?: string[]): Promise<SectorDimensionContext[]>
  
  // Builds formatted context string for LLM prompts
  buildContextString(contexts: SectorDimensionContext[]): string
  
  // Main method: automatically enhances assessment context
  async enhanceAssessmentContext(query: string, assessmentContext?: any): Promise<string>
}
```

#### Enhanced Chat API (`app/api/llm/chat/route.ts`)
The chat endpoint automatically uses the context service:

```typescript
// Automatically enhance context with relevant maturity descriptors
const enhancedMaturityContext = await contextService.enhanceAssessmentContext(
  message,
  assessmentContext
);

// Enhance system prompt with maturity descriptors
const enhancedSystemPrompt = enhancedMaturityContext 
  ? `${systemPrompt}\n\n${enhancedMaturityContext}`
  : systemPrompt;
```

#### Context Detection API (`app/api/llm/context-detection/route.ts`)
Testing endpoint to see context detection in action:

```typescript
POST /api/llm/context-detection
{
  "query": "How can healthcare organizations improve leadership commitment?",
  "assessmentContext": { "companyId": "...", "sectorId": "..." }
}
```

### Database Schema

The system relies on the existing database structure:

```sql
-- Sectors define industry contexts
Sector {
  id: string
  name: string (Healthcare, Manufacturing, etc.)
  description: string?
}

-- Dimensions define assessment areas
Dimension {
  id: string
  name: string (Leadership Commitment, Process Standardization, etc.)
  categoryId: string?
  category: Category?
}

-- Maturity descriptors provide sector-specific guidance
MaturityDescriptor {
  id: string
  sectorId: string
  dimensionId: string
  level: int (1-5)
  description: string
}
```

## Query Examples

### Healthcare Leadership
**User Query**: "How can healthcare organizations improve their leadership commitment?"

**Detected Context**:
- Sector: Healthcare
- Dimension: Leadership Commitment  
- Confidence: 90%

**Enhanced Context**:
```markdown
## Relevant Maturity Level Descriptors

### Leadership Commitment (Leadership & Culture) - Healthcare Sector

**Level 1 (Initial)**: Leadership demonstrates minimal commitment to Lean/QI principles...

**Level 2 (Developing)**: Leadership shows increasing awareness of quality improvement...

**Level 3 (Defined)**: Leadership demonstrates consistent commitment to Lean/QI principles...

**Level 4 (Managed)**: Leadership demonstrates strong, consistent commitment...

**Level 5 (Optimizing)**: Leadership exemplifies best-in-class commitment...
```

### Manufacturing Process Standardization
**User Query**: "What are the best practices for process standardization in manufacturing?"

**Detected Context**:
- Sector: Manufacturing
- Dimension: Process Standardization
- Related: Quality Management, Operational Excellence
- Confidence: 85%

### Multi-Dimensional Healthcare Query
**User Query**: "Our hospital needs to improve patient safety culture and standardize processes"

**Detected Context**:
- Sector: Healthcare
- Dimensions: Safety Culture, Process Standardization
- Query Type: sector_dimension_specific
- Confidence: 95%

## Configuration

### Environment Variables
```bash
# Enable context detection (default: true)
ENABLE_CONTEXT_DETECTION=true

# Context confidence threshold (default: 0.6)
CONTEXT_CONFIDENCE_THRESHOLD=0.6

# Maximum context length in tokens (default: 2000)
MAX_CONTEXT_TOKENS=2000
```

### Caching
The ContextService implements intelligent caching:
- **Sector Cache**: All sectors loaded once
- **Dimension Cache**: All dimensions loaded once  
- **Descriptor Cache**: Sector-dimension combinations cached by key
- **Cache Invalidation**: Automatic on data changes

## Usage Examples

### Automatic Enhancement (Default)
```typescript
// Chat API automatically enhances context
const response = await fetch('/api/llm/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: "How do we improve healthcare quality management?",
    context: { companyId: "healthcare-corp-id" }
  })
});
```

### Manual Context Detection
```typescript
// Test context detection
const contextService = new ContextService();
const detected = await contextService.detectContext(
  "What's the difference between Level 3 and Level 4 process maturity?",
  { sectorId: "manufacturing-sector-id" }
);

console.log(detected);
// {
//   sectors: ["manufacturing-sector-id"],
//   dimensions: ["process-maturity-dimension-id"],
//   queryType: "sector_dimension_specific",
//   confidence: 0.9
// }
```

### Enhanced Assessment Assistant
```typescript
// Assessment assistant automatically uses context
<AssessmentAssistant
  assessmentContext={{
    companyId: "company-id",
    dimensionName: "Leadership Commitment",
    industryContext: "Healthcare"
  }}
  compact={true}
/>
```

## Performance Considerations

### Query Analysis
- **Fast text matching**: Uses efficient string inclusion checks
- **Alternative names**: Handles acronyms and partial matches
- **Confidence scoring**: Prioritizes high-confidence matches

### Database Optimization
- **Indexed queries**: Sector and dimension lookups use indexes
- **Efficient joins**: Minimal data fetching with strategic includes
- **Batch processing**: Multiple descriptors fetched in single queries

### Context Size Management
- **Token estimation**: ~4 characters per token approximation
- **Selective inclusion**: Only relevant descriptors included
- **Length limits**: Respects model context windows

## Testing

### Demo Interface
Visit `/llm-demo` to test context detection:
- Sample queries for different sectors
- Real-time context detection results
- Enhanced response comparison

### API Testing
```bash
# Test context detection
curl -X POST /api/llm/context-detection \
  -H "Content-Type: application/json" \
  -d '{"query": "How can healthcare improve leadership?"}'

# Test enhanced chat
curl -X POST /api/llm/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are Level 4 indicators for process maturity?",
    "context": {"sectorId": "manufacturing-id"}
  }'
```

### Context Quality Metrics
The system tracks:
- **Detection Accuracy**: Percentage of correctly identified sectors/dimensions
- **Enhancement Rate**: How often context enhances responses
- **Token Efficiency**: Context tokens vs. total response tokens
- **User Satisfaction**: Improved response relevance

## Future Enhancements

### Planned Features
1. **Semantic Matching**: Use embeddings for better query understanding
2. **Context Learning**: Machine learning to improve detection accuracy
3. **Custom Descriptors**: Company-specific maturity definitions
4. **Multi-Language**: Support for non-English queries
5. **Context History**: Learn from user interaction patterns

### Integration Opportunities
1. **Assessment Workflows**: Auto-populate context during assessments
2. **Report Generation**: Include relevant descriptors in reports
3. **Training Materials**: Generate sector-specific training content
4. **Benchmarking**: Compare against sector-specific best practices

## Troubleshooting

### Common Issues

#### Low Confidence Detection
```
Problem: Context detection confidence < 60%
Solution: Use more specific terminology, mention sector/dimension explicitly
Example: "healthcare leadership" instead of "management"
```

#### Missing Descriptors
```
Problem: No descriptors found for sector-dimension combination
Solution: Check if maturity descriptors exist in database for that combination
Query: SELECT * FROM MaturityDescriptor WHERE sectorId = ? AND dimensionId = ?
```

#### Context Too Large
```
Problem: Enhanced context exceeds token limits
Solution: System automatically truncates, but consider:
- Using more specific queries
- Limiting related dimensions
- Adjusting MAX_CONTEXT_TOKENS
```

### Debug Mode
Enable debug logging:
```bash
DEBUG_CONTEXT_DETECTION=true
```

Debug output includes:
- Query analysis results
- Sector/dimension matches
- Confidence calculations
- Context string generation
- Token usage estimates

## Conclusion

The automated context management system significantly improves LLM response quality by providing relevant, sector-specific maturity guidance. The system is designed to be:

- **Transparent**: Users can see detected context
- **Efficient**: Minimal performance impact
- **Accurate**: High-confidence detection with fallbacks
- **Scalable**: Handles growing data and user base
- **Maintainable**: Clean architecture with clear separation of concerns

This enhancement makes LeanSight's AI assistant significantly more valuable for sector-specific lean maturity assessments and guidance. 