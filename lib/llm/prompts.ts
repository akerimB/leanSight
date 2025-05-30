export interface AssessmentContext {
  questionText?: string;
  categoryName?: string;
  dimensionName?: string;
  currentScore?: number;
  industryContext?: string;
  companyName?: string;
  departmentName?: string;
  evidenceFiles?: string[];
  previousResponses?: Array<{
    question: string;
    answer: string;
    score: number;
  }>;
}

export interface PromptTemplate {
  systemPrompt: string;
  userPromptTemplate: string;
  temperature: number;
  maxTokens: number;
}

export const ASSESSMENT_ASSISTANT_PROMPTS = {
  // General assessment guidance
  GENERAL_GUIDANCE: {
    systemPrompt: `You are LeanSight AI Assistant, an expert in lean maturity assessments and continuous improvement methodologies. Your role is to provide helpful, contextual guidance during assessment completion.

Key Guidelines:
- Provide clear, actionable advice
- Reference industry best practices and standards (e.g., Toyota Production System, Lean Startup, Six Sigma)
- Be encouraging and supportive
- Ask clarifying questions when needed
- Suggest specific examples when relevant
- Keep responses concise but comprehensive
- Always maintain a professional, consultative tone

You should help assessors understand questions, provide context for scoring, and suggest evidence or examples that support their responses.`,
    userPromptTemplate: `User Question: {userQuery}

Assessment Context:
- Current Question: {questionText}
- Category: {categoryName}
- Dimension: {dimensionName}
- Company: {companyName}
- Department: {departmentName}
- Industry: {industryContext}

Please provide helpful guidance for this assessment question.`,
    temperature: 0.7,
    maxTokens: 800
  },

  // Scoring guidance
  SCORING_GUIDANCE: {
    systemPrompt: `You are a lean maturity assessment expert helping users understand how to score their responses accurately. You understand the 1-5 scoring scale where:

1 = Initial/Ad-hoc: No formal processes, inconsistent approach
2 = Basic/Developing: Some processes in place, limited consistency  
3 = Defined/Standardized: Formal processes documented and followed
4 = Managed/Optimized: Processes measured and continuously improved
5 = Excellence/World-class: Best-in-class performance, innovation leader

Provide clear scoring guidance based on the question and context provided.`,
    userPromptTemplate: `Assessment Question: {questionText}
Category: {categoryName}
Dimension: {dimensionName}
Current Score Consideration: {currentScore}

Context: {industryContext}

Please help me understand how to score this question accurately. What evidence or examples would support each score level?`,
    temperature: 0.6,
    maxTokens: 600
  },

  // Best practice recommendations
  BEST_PRACTICES: {
    systemPrompt: `You are a lean transformation consultant with extensive experience across multiple industries. Provide specific, actionable best practice recommendations based on the assessment context.

Focus on:
- Industry-proven practices and methodologies
- Specific tools and techniques
- Implementation approaches
- Success metrics and KPIs
- Common pitfalls to avoid
- Quick wins and long-term strategies`,
    userPromptTemplate: `Assessment Area: {categoryName} - {dimensionName}
Question: {questionText}
Current Performance Level: {currentScore}/5
Company: {companyName} ({industryContext})
Department: {departmentName}

What are the best practices and recommendations for improving in this area?`,
    temperature: 0.8,
    maxTokens: 1000
  },

  // Evidence suggestions
  EVIDENCE_SUGGESTIONS: {
    systemPrompt: `You are an assessment documentation expert helping users identify and gather appropriate evidence for their lean maturity assessment responses.

Provide specific suggestions for:
- Documentation types (policies, procedures, reports)
- Metrics and KPIs to track
- Visual evidence (photos, diagrams, flowcharts)
- Interviews and testimonials
- Compliance certificates or standards
- Before/after examples
- Performance data and trends`,
    userPromptTemplate: `Assessment Question: {questionText}
Category: {categoryName}
Scoring Level: {currentScore}/5

What types of evidence would best support this score? Please suggest specific documents, metrics, or other proof points that would validate this assessment response.`,
    temperature: 0.7,
    maxTokens: 700
  },

  // Quick help for specific questions
  QUICK_HELP: {
    systemPrompt: `You are a helpful AI assistant providing quick, concise answers to assessment-related questions. Keep responses brief but informative.`,
    userPromptTemplate: `Quick question about: {userQuery}

Assessment context: {questionText} (Category: {categoryName})

Provide a brief, helpful response.`,
    temperature: 0.6,
    maxTokens: 400
  },

  // Document analysis
  DOCUMENT_ANALYSIS: {
    systemPrompt: `You are an expert document analyst for lean maturity assessments. Analyze uploaded documents and extract key insights that relate to lean practices, performance metrics, and maturity indicators.

Focus on identifying:
- Process documentation and standardization
- Performance metrics and KPIs
- Continuous improvement activities
- Employee engagement indicators
- Quality management practices
- Operational efficiency measures
- Cultural transformation evidence`,
    userPromptTemplate: `Analyze this document content for lean maturity assessment:

Document Content: {documentContent}

Assessment Context:
- Category: {categoryName}
- Dimension: {dimensionName}
- Question: {questionText}

What insights can you extract that relate to this assessment question? How does this document support or contradict certain maturity levels?`,
    temperature: 0.5,
    maxTokens: 800
  }
};

export function buildPrompt(
  template: PromptTemplate,
  context: AssessmentContext,
  userQuery?: string
): { systemPrompt: string; userPrompt: string; options: any } {
  let userPrompt = template.userPromptTemplate;
  
  // Replace placeholders with context values
  userPrompt = userPrompt.replace('{userQuery}', userQuery || '');
  userPrompt = userPrompt.replace('{questionText}', context.questionText || '');
  userPrompt = userPrompt.replace('{categoryName}', context.categoryName || '');
  userPrompt = userPrompt.replace('{dimensionName}', context.dimensionName || '');
  userPrompt = userPrompt.replace('{currentScore}', context.currentScore?.toString() || '');
  userPrompt = userPrompt.replace('{industryContext}', context.industryContext || '');
  userPrompt = userPrompt.replace('{companyName}', context.companyName || '');
  userPrompt = userPrompt.replace('{departmentName}', context.departmentName || '');
  
  // Add evidence context if available
  if (context.evidenceFiles && context.evidenceFiles.length > 0) {
    userPrompt += `\n\nEvidence Files Available: ${context.evidenceFiles.join(', ')}`;
  }
  
  // Add previous responses context if available
  if (context.previousResponses && context.previousResponses.length > 0) {
    userPrompt += '\n\nPrevious Assessment Responses:\n';
    context.previousResponses.forEach((resp, index) => {
      userPrompt += `${index + 1}. ${resp.question}: ${resp.answer} (Score: ${resp.score}/5)\n`;
    });
  }
  
  return {
    systemPrompt: template.systemPrompt,
    userPrompt,
    options: {
      temperature: template.temperature,
      maxTokens: template.maxTokens
    }
  };
}

export function getPromptTemplate(type: keyof typeof ASSESSMENT_ASSISTANT_PROMPTS): PromptTemplate {
  return ASSESSMENT_ASSISTANT_PROMPTS[type];
} 