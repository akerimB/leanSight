import { LLMProvider, LLMOptions, LLMResponse, OpenAIProvider, AnthropicProvider, OllamaProvider } from './providers';
import { cache } from '../cache';

export interface LLMServiceConfig {
  providers: {
    openai?: { apiKey: string; priority: number };
    anthropic?: { apiKey: string; priority: number };
    ollama?: { baseUrl?: string; priority: number; defaultModel?: string };
  };
  defaultProvider: 'openai' | 'anthropic' | 'ollama';
  enableCaching: boolean;
  cacheTTL: number;
  maxRetries: number;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  providerStats: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export class LLMService {
  private providers: Map<string, LLMProvider> = new Map();
  private config: LLMServiceConfig;
  private usageStats: UsageStats = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    providerStats: {}
  };

  // Cost per 1K tokens (approximate rates)
  private readonly COST_PER_1K_TOKENS = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    // Local models are essentially free
    'llama2': { input: 0, output: 0 },
    'mistral': { input: 0, output: 0 },
    'mixtral': { input: 0, output: 0 },
    'code-llama': { input: 0, output: 0 },
  };

  constructor(config: LLMServiceConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    if (this.config.providers.openai) {
      this.providers.set('openai', new OpenAIProvider(this.config.providers.openai.apiKey));
    }
    
    if (this.config.providers.anthropic) {
      this.providers.set('anthropic', new AnthropicProvider(this.config.providers.anthropic.apiKey));
    }

    if (this.config.providers.ollama) {
      this.providers.set('ollama', new OllamaProvider(this.config.providers.ollama.baseUrl));
    }
  }

  private selectProvider(preferredProvider?: string): LLMProvider {
    if (preferredProvider && this.providers.has(preferredProvider)) {
      return this.providers.get(preferredProvider)!;
    }
    
    if (this.providers.has(this.config.defaultProvider)) {
      return this.providers.get(this.config.defaultProvider)!;
    }
    
    // Fallback to any available provider
    const availableProvider = this.providers.values().next().value;
    if (!availableProvider) {
      throw new Error('No LLM providers configured');
    }
    
    return availableProvider;
  }

  private calculateCost(usage: any, model: string): number {
    const rates = this.COST_PER_1K_TOKENS[model as keyof typeof this.COST_PER_1K_TOKENS];
    if (!rates || !usage) return 0;
    
    const inputCost = (usage.promptTokens / 1000) * rates.input;
    const outputCost = (usage.completionTokens / 1000) * rates.output;
    return inputCost + outputCost;
  }

  private updateUsageStats(response: LLMResponse) {
    this.usageStats.totalRequests++;
    
    if (response.usage) {
      this.usageStats.totalTokens += response.usage.totalTokens;
      const cost = this.calculateCost(response.usage, response.model);
      this.usageStats.totalCost += cost;
      
      if (!this.usageStats.providerStats[response.provider]) {
        this.usageStats.providerStats[response.provider] = {
          requests: 0,
          tokens: 0,
          cost: 0
        };
      }
      
      const providerStats = this.usageStats.providerStats[response.provider];
      providerStats.requests++;
      providerStats.tokens += response.usage.totalTokens;
      providerStats.cost += cost;
    }
  }

  private getCacheKey(prompt: string, options: LLMOptions, provider: string): string {
    return `llm:${provider}:${Buffer.from(JSON.stringify({ prompt, options })).toString('base64')}`;
  }

  async generateResponse(
    prompt: string, 
    options: LLMOptions = {}, 
    preferredProvider?: string
  ): Promise<LLMResponse> {
    const provider = this.selectProvider(preferredProvider);
    const cacheKey = this.getCacheKey(prompt, options, provider.name);
    
    // Check cache first
    if (this.config.enableCaching) {
      const cachedResponse = cache.get<LLMResponse>(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    let retries = 0;
    while (retries <= this.config.maxRetries) {
      try {
        // Set default model based on provider
        if (!options.model && provider.name === 'ollama') {
          options.model = this.config.providers.ollama?.defaultModel || 'llama2';
        }

        const response = await provider.generateResponse(prompt, options);
        
        // Update usage statistics
        this.updateUsageStats(response);
        
        // Cache the response
        if (this.config.enableCaching) {
          cache.set(cacheKey, response, this.config.cacheTTL);
        }
        
        return response;
      } catch (error) {
        retries++;
        if (retries > this.config.maxRetries) {
          throw new Error(`LLM request failed after ${this.config.maxRetries} retries: ${error}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
    
    throw new Error('LLM request failed');
  }

  async* generateStreamResponse(
    prompt: string, 
    options: LLMOptions = {}, 
    preferredProvider?: string
  ): AsyncIterable<string> {
    const provider = this.selectProvider(preferredProvider);
    
    try {
      // Set default model based on provider
      if (!options.model && provider.name === 'ollama') {
        options.model = this.config.providers.ollama?.defaultModel || 'llama2';
      }

      for await (const chunk of provider.generateStreamResponse(prompt, options)) {
        yield chunk;
      }
    } catch (error) {
      throw new Error(`LLM streaming request failed: ${error}`);
    }
  }

  getUsageStats(): UsageStats {
    return { ...this.usageStats };
  }

  resetUsageStats() {
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      providerStats: {}
    };
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  // Check if Ollama is available
  async checkOllamaHealth(): Promise<boolean> {
    if (!this.providers.has('ollama')) {
      return false;
    }

    try {
      const ollamaProvider = this.providers.get('ollama') as OllamaProvider;
      const baseUrl = (ollamaProvider as any).baseUrl || 'http://localhost:11434';
      
      const response = await fetch(`${baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get available Ollama models
  async getOllamaModels(): Promise<string[]> {
    if (!this.providers.has('ollama')) {
      return [];
    }

    try {
      const ollamaProvider = this.providers.get('ollama') as OllamaProvider;
      const baseUrl = (ollamaProvider as any).baseUrl || 'http://localhost:11434';
      
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      return [];
    }
  }
}

// Singleton instance
let llmService: LLMService | null = null;

export function getLLMService(): LLMService {
  if (!llmService) {
    const config: LLMServiceConfig = {
      providers: {
        openai: process.env.OPENAI_API_KEY ? {
          apiKey: process.env.OPENAI_API_KEY,
          priority: 1
        } : undefined,
        anthropic: process.env.ANTHROPIC_API_KEY ? {
          apiKey: process.env.ANTHROPIC_API_KEY,
          priority: 2
        } : undefined,
        ollama: {
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          priority: 3,
          defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama2'
        }
      },
      defaultProvider: (process.env.DEFAULT_LLM_PROVIDER as any) || 'ollama',
      enableCaching: true,
      cacheTTL: 300000, // 5 minutes
      maxRetries: 2,
    };
    
    llmService = new LLMService(config);
  }
  
  return llmService;
} 