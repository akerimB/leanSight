interface ModelSpec {
  contextWindow: number;
  trainingCutoff: string;
  modelSize: string;
  tokensPerSecond: number;
  ramUsage: string;
  recommended: string;
}

interface ContextUsage {
  systemPrompt: number;
  assessmentContext: number;
  conversationHistory: number;
  userQuery: number;
  responseBuffer: number;
  total: number;
}

export const OLLAMA_MODEL_SPECS: Record<string, ModelSpec> = {
  'llama2': {
    contextWindow: 4096,
    trainingCutoff: 'September 2022',
    modelSize: '3.8GB',
    tokensPerSecond: 45,
    ramUsage: '8GB',
    recommended: 'General lean manufacturing guidance, quick assessments'
  },
  'llama2:7b': {
    contextWindow: 4096,
    trainingCutoff: 'September 2022',
    modelSize: '3.8GB',
    tokensPerSecond: 45,
    ramUsage: '8GB',
    recommended: 'General lean manufacturing guidance, quick assessments'
  },
  'llama2:13b': {
    contextWindow: 4096,
    trainingCutoff: 'September 2022',
    modelSize: '7.3GB',
    tokensPerSecond: 22,
    ramUsage: '16GB',
    recommended: 'Higher quality lean analysis and recommendations'
  },
  'llama2:70b': {
    contextWindow: 4096,
    trainingCutoff: 'September 2022',
    modelSize: '39GB',
    tokensPerSecond: 10,
    ramUsage: '80GB',
    recommended: 'Highest quality lean analysis and strategic recommendations'
  },
  'mistral': {
    contextWindow: 8192,
    trainingCutoff: 'September 2023',
    modelSize: '4.1GB',
    tokensPerSecond: 37,
    ramUsage: '8GB',
    recommended: 'Detailed lean analysis, multi-step improvement recommendations'
  },
  'mistral:7b': {
    contextWindow: 8192,
    trainingCutoff: 'September 2023',
    modelSize: '4.1GB',
    tokensPerSecond: 37,
    ramUsage: '8GB',
    recommended: 'Detailed lean analysis, multi-step improvement recommendations'
  },
  'mixtral': {
    contextWindow: 32768,
    trainingCutoff: 'September 2023',
    modelSize: '26GB',
    tokensPerSecond: 15,
    ramUsage: '32GB',
    recommended: 'Complex multi-document analysis with extended context'
  },
  'mixtral:8x7b': {
    contextWindow: 32768,
    trainingCutoff: 'September 2023',
    modelSize: '26GB',
    tokensPerSecond: 15,
    ramUsage: '32GB',
    recommended: 'Complex multi-document analysis with extended context'
  },
  'orca-mini': {
    contextWindow: 2048,
    trainingCutoff: 'June 2023',
    modelSize: '1.9GB',
    tokensPerSecond: 75,
    ramUsage: '4GB',
    recommended: 'Fast lean terminology explanations, brief assessments'
  },
  'orca-mini:3b': {
    contextWindow: 2048,
    trainingCutoff: 'June 2023',
    modelSize: '1.9GB',
    tokensPerSecond: 75,
    ramUsage: '4GB',
    recommended: 'Fast lean terminology explanations, brief assessments'
  },
  'neural-chat': {
    contextWindow: 4096,
    trainingCutoff: 'October 2023',
    modelSize: '4.1GB',
    tokensPerSecond: 30,
    ramUsage: '8GB',
    recommended: 'Interactive lean training, Q&A sessions'
  },
  'neural-chat:7b': {
    contextWindow: 4096,
    trainingCutoff: 'October 2023',
    modelSize: '4.1GB',
    tokensPerSecond: 30,
    ramUsage: '8GB',
    recommended: 'Interactive lean training, Q&A sessions'
  },
  'code-llama': {
    contextWindow: 16384,
    trainingCutoff: 'September 2022',
    modelSize: '3.8GB',
    tokensPerSecond: 35,
    ramUsage: '8GB',
    recommended: 'Creating lean dashboards, KPI calculations, data analysis'
  },
  'code-llama:7b': {
    contextWindow: 16384,
    trainingCutoff: 'September 2022',
    modelSize: '3.8GB',
    tokensPerSecond: 35,
    ramUsage: '8GB',
    recommended: 'Creating lean dashboards, KPI calculations, data analysis'
  },
  'code-llama:13b': {
    contextWindow: 16384,
    trainingCutoff: 'September 2022',
    modelSize: '7.3GB',
    tokensPerSecond: 25,
    ramUsage: '16GB',
    recommended: 'Advanced lean automation and integration development'
  },
  'code-llama:34b': {
    contextWindow: 16384,
    trainingCutoff: 'September 2022',
    modelSize: '19GB',
    tokensPerSecond: 13,
    ramUsage: '48GB',
    recommended: 'Complex lean analytics, custom tool development'
  }
};

export class ContextManager {
  private model: string;
  private modelSpec: ModelSpec;

  constructor(model: string = 'llama2') {
    this.model = model;
    this.modelSpec = OLLAMA_MODEL_SPECS[model] || OLLAMA_MODEL_SPECS['llama2'];
  }

  /**
   * Estimate token count from text (rough approximation: 4 chars per token)
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate current context usage
   */
  calculateContextUsage(
    systemPrompt: string = '',
    assessmentContext: string = '',
    conversationHistory: Array<{role: string; content: string}> = [],
    userQuery: string = ''
  ): ContextUsage {
    const systemTokens = this.estimateTokens(systemPrompt);
    const assessmentTokens = this.estimateTokens(assessmentContext);
    const historyTokens = conversationHistory.reduce(
      (sum, msg) => sum + this.estimateTokens(msg.content), 0
    );
    const queryTokens = this.estimateTokens(userQuery);
    const total = systemTokens + assessmentTokens + historyTokens + queryTokens;
    
    // Reserve space for response (typically 25-50% of context window)
    const responseBuffer = Math.floor(this.modelSpec.contextWindow * 0.3);
    
    return {
      systemPrompt: systemTokens,
      assessmentContext: assessmentTokens,
      conversationHistory: historyTokens,
      userQuery: queryTokens,
      responseBuffer,
      total: total + responseBuffer
    };
  }

  /**
   * Check if current context fits within model's window
   */
  isContextValid(usage: ContextUsage): boolean {
    return usage.total <= this.modelSpec.contextWindow;
  }

  /**
   * Optimize context by truncating conversation history if needed
   */
  optimizeContext(
    systemPrompt: string,
    assessmentContext: string,
    conversationHistory: Array<{role: string; content: string}>,
    userQuery: string
  ): Array<{role: string; content: string}> {
    const baseUsage = this.calculateContextUsage(systemPrompt, assessmentContext, [], userQuery);
    const availableForHistory = this.modelSpec.contextWindow - baseUsage.total;
    
    if (availableForHistory <= 0) {
      // Not enough space even without history
      return [];
    }

    // Keep recent messages that fit within available space
    const optimizedHistory: Array<{role: string; content: string}> = [];
    let currentTokens = 0;

    // Add messages from most recent to oldest until we hit the limit
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const messageTokens = this.estimateTokens(conversationHistory[i].content);
      if (currentTokens + messageTokens <= availableForHistory) {
        optimizedHistory.unshift(conversationHistory[i]);
        currentTokens += messageTokens;
      } else {
        break;
      }
    }

    return optimizedHistory;
  }

  /**
   * Suggest optimal model based on context requirements
   */
  suggestOptimalModel(
    systemPrompt: string,
    assessmentContext: string,
    conversationHistory: Array<{role: string; content: string}>,
    userQuery: string,
    queryType: 'general' | 'code' | 'analysis' | 'conversation' = 'general'
  ): string {
    const usage = this.calculateContextUsage(systemPrompt, assessmentContext, conversationHistory, userQuery);
    
    // Filter models by context requirements
    const suitableModels = Object.entries(OLLAMA_MODEL_SPECS)
      .filter(([_, spec]) => usage.total <= spec.contextWindow)
      .sort((a, b) => a[1].contextWindow - b[1].contextWindow); // Sort by context window size

    if (suitableModels.length === 0) {
      // If no model can handle the full context, suggest largest available
      return 'mixtral:8x7b';
    }

    // Select based on query type
    switch (queryType) {
      case 'code':
        const codeModel = suitableModels.find(([name]) => name.includes('code-llama'));
        return codeModel ? codeModel[0] : suitableModels[0][0];
      
      case 'analysis':
        // Prefer models with larger context or higher quality
        if (usage.total > 8192) {
          return 'mixtral:8x7b';
        }
        return suitableModels.find(([name]) => name.includes('llama2:13b') || name.includes('mistral'))?.[0] || suitableModels[0][0];
      
      case 'conversation':
        const chatModel = suitableModels.find(([name]) => name.includes('neural-chat'));
        return chatModel ? chatModel[0] : suitableModels[0][0];
      
      default:
        // For general queries, prefer balanced models
        return suitableModels.find(([name]) => name === 'llama2' || name === 'mistral')?.[0] || suitableModels[0][0];
    }
  }

  /**
   * Get model specifications
   */
  getModelSpec(model?: string): ModelSpec {
    return OLLAMA_MODEL_SPECS[model || this.model] || OLLAMA_MODEL_SPECS['llama2'];
  }

  /**
   * Estimate response time based on model and token count
   */
  estimateResponseTime(outputTokens: number, model?: string): number {
    const spec = this.getModelSpec(model);
    return Math.ceil(outputTokens / spec.tokensPerSecond);
  }

  /**
   * Get context window utilization percentage
   */
  getContextUtilization(usage: ContextUsage): number {
    return Math.round((usage.total / this.modelSpec.contextWindow) * 100);
  }

  /**
   * Check if model is suitable for query complexity
   */
  isModelSuitableForComplexity(
    complexity: 'simple' | 'medium' | 'complex',
    model?: string
  ): boolean {
    const spec = this.getModelSpec(model);
    const modelName = model || this.model;

    switch (complexity) {
      case 'simple':
        return true; // All models can handle simple queries
      
      case 'medium':
        // Exclude very small models for medium complexity
        return !modelName.includes('orca-mini');
      
      case 'complex':
        // Only use larger models for complex queries
        return modelName.includes('13b') || modelName.includes('70b') || 
               modelName.includes('mixtral') || modelName.includes('34b');
      
      default:
        return true;
    }
  }
}

export default ContextManager; 