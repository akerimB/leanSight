import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLLMService } from '@/lib/llm/service';
import { buildPrompt, getPromptTemplate, AssessmentContext } from '@/lib/llm/prompts';
import { OLLAMA_MODEL_SPECS } from '@/lib/llm/contextManager';
import { ContextService } from '@/lib/llm/contextService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      message,
      context,
      promptType = 'GENERAL_GUIDANCE',
      conversationHistory = []
    } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const llmService = getLLMService();
    const contextService = new ContextService();
    const template = getPromptTemplate(promptType);
    
    // Build the assessment context
    const assessmentContext: AssessmentContext = {
      questionText: context?.questionText,
      categoryName: context?.categoryName,
      dimensionName: context?.dimensionName,
      currentScore: context?.currentScore,
      industryContext: context?.industryContext,
      companyName: context?.companyName,
      departmentName: context?.departmentName,
      evidenceFiles: context?.evidenceFiles,
      previousResponses: context?.previousResponses
    };

    // Automatically enhance context with relevant maturity descriptors
    console.log('🔍 Analyzing query for automatic context enhancement...');
    const enhancedMaturityContext = await contextService.enhanceAssessmentContext(
      message,
      {
        companyId: context?.companyId,
        dimensionId: context?.dimensionId,
        sectorId: context?.sectorId,
        manualSectors: context?.manualSectors,
        manualDimensions: context?.manualDimensions,
        ...assessmentContext
      }
    );

    // Build the prompt with assessment context and enhanced maturity context
    const { systemPrompt, userPrompt, options } = buildPrompt(
      template,
      assessmentContext,
      message
    );

    // Enhance the system prompt with maturity descriptors if available
    const enhancedSystemPrompt = enhancedMaturityContext 
      ? `${systemPrompt}\n\n${enhancedMaturityContext}`
      : systemPrompt;

    // Convert conversation history to context messages
    const contextMessages = conversationHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    console.log('🤖 Generating LLM response with enhanced context...');
    
    // Generate response using LLM service
    const response = await llmService.generateResponse(userPrompt, {
      ...options,
      systemPrompt: enhancedSystemPrompt,
      contextMessages
    });

    // Get usage statistics
    const usageStats = llmService.getUsageStats();

    // Log context enhancement results
    const contextEnhanced = enhancedMaturityContext.length > 0;
    console.log(`✅ Response generated. Context enhanced: ${contextEnhanced}`);

    return NextResponse.json({
      message: response.content,
      metadata: {
        model: response.model,
        provider: response.provider,
        usage: response.usage,
        promptType,
        totalCost: usageStats.totalCost,
        contextEnhanced,
        contextLength: enhancedMaturityContext.length
      }
    });

  } catch (error) {
    console.error('LLM Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
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

    const llmService = getLLMService();
    const usageStats = llmService.getUsageStats();
    const availableProviders = llmService.getAvailableProviders();

    // Check Ollama health and get models
    const ollamaHealth = await llmService.checkOllamaHealth();
    const ollamaModels = ollamaHealth ? await llmService.getOllamaModels() : [];

    // Add model specifications for available Ollama models
    const modelSpecs = ollamaModels.reduce((specs: any, modelName: string) => {
      if (OLLAMA_MODEL_SPECS[modelName]) {
        specs[modelName] = OLLAMA_MODEL_SPECS[modelName];
      }
      return specs;
    }, {});

    return NextResponse.json({
      usageStats,
      availableProviders,
      ollamaHealth,
      ollamaModels,
      modelSpecs,
      contextInfo: {
        description: 'Context windows and training data information for available models',
        tokenEstimation: 'Approximately 4 characters per token',
        managementStrategy: 'LeanSight automatically manages context windows with smart truncation'
      },
      promptTypes: Object.keys(getPromptTemplate as any),
      recommendations: {
        costEffective: ollamaHealth ? 'ollama' : 'openai',
        highQuality: 'anthropic',
        balanced: ollamaHealth ? 'ollama' : 'openai',
        quickResponse: ollamaHealth && ollamaModels.includes('orca-mini') ? 'ollama' : 'openai',
        codeGeneration: ollamaHealth && ollamaModels.some(m => m.includes('code-llama')) ? 'ollama' : 'openai',
        complexAnalysis: ollamaHealth && (ollamaModels.includes('mixtral') || ollamaModels.includes('llama2:70b')) ? 'ollama' : 'anthropic'
      }
    });

  } catch (error) {
    console.error('LLM Chat status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get LLM status' },
      { status: 500 }
    );
  }
} 