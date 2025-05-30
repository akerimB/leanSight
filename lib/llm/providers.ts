import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface LLMProvider {
  name: string;
  generateResponse(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
  generateStreamResponse(prompt: string, options?: LLMOptions): AsyncIterable<string>;
}

export interface LLMOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  model?: string;
  contextMessages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  public name = 'openai';

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateResponse(prompt: string, options: LLMOptions = {}): Promise<LLMResponse> {
    const {
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt,
      model = 'gpt-4',
      contextMessages = []
    } = options;

    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push(...contextMessages);
    messages.push({ role: 'user', content: prompt });

    const completion = await this.client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined,
      model: completion.model,
      provider: this.name,
    };
  }

  async* generateStreamResponse(prompt: string, options: LLMOptions = {}): AsyncIterable<string> {
    const {
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt,
      model = 'gpt-4',
      contextMessages = []
    } = options;

    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push(...contextMessages);
    messages.push({ role: 'user', content: prompt });

    const stream = await this.client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  public name = 'anthropic';

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateResponse(prompt: string, options: LLMOptions = {}): Promise<LLMResponse> {
    const {
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt = '',
      model = 'claude-3-sonnet-20240229',
      contextMessages = []
    } = options;

    // Convert context messages to Anthropic format
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    contextMessages.forEach(msg => {
      if (msg.role !== 'system') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });
    messages.push({ role: 'user', content: prompt });

    const completion = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages,
    });

    const content = completion.content[0];
    return {
      content: content.type === 'text' ? content.text : '',
      usage: {
        promptTokens: completion.usage.input_tokens,
        completionTokens: completion.usage.output_tokens,
        totalTokens: completion.usage.input_tokens + completion.usage.output_tokens,
      },
      model: completion.model,
      provider: this.name,
    };
  }

  async* generateStreamResponse(prompt: string, options: LLMOptions = {}): AsyncIterable<string> {
    const {
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt = '',
      model = 'claude-3-sonnet-20240229',
      contextMessages = []
    } = options;

    // Convert context messages to Anthropic format
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    contextMessages.forEach(msg => {
      if (msg.role !== 'system') {
        messages.push({ role: msg.role, content: msg.content });
      }
    });
    messages.push({ role: 'user', content: prompt });

    const stream = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }
}

export class OllamaProvider implements LLMProvider {
  private baseUrl: string;
  public name = 'ollama';

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generateResponse(prompt: string, options: LLMOptions = {}): Promise<LLMResponse> {
    const {
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt,
      model = 'llama2',
      contextMessages = []
    } = options;

    // Build the context for Ollama
    let fullPrompt = '';
    if (systemPrompt) {
      fullPrompt += `System: ${systemPrompt}\n\n`;
    }

    // Add conversation history
    contextMessages.forEach(msg => {
      const role = msg.role === 'user' ? 'Human' : 'Assistant';
      fullPrompt += `${role}: ${msg.content}\n\n`;
    });

    fullPrompt += `Human: ${prompt}\n\nAssistant:`;

    const requestBody = {
      model,
      prompt: fullPrompt,
      stream: false,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Estimate token usage (Ollama doesn't provide exact counts)
      const promptTokens = Math.ceil(fullPrompt.length / 4); // Rough estimate: 4 chars per token
      const completionTokens = Math.ceil((data.response || '').length / 4);

      return {
        content: data.response || '',
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        model: data.model || model,
        provider: this.name,
      };
    } catch (error) {
      throw new Error(`Failed to call Ollama API: ${error}`);
    }
  }

  async* generateStreamResponse(prompt: string, options: LLMOptions = {}): AsyncIterable<string> {
    const {
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt,
      model = 'llama2',
      contextMessages = []
    } = options;

    // Build the context for Ollama
    let fullPrompt = '';
    if (systemPrompt) {
      fullPrompt += `System: ${systemPrompt}\n\n`;
    }

    // Add conversation history
    contextMessages.forEach(msg => {
      const role = msg.role === 'user' ? 'Human' : 'Assistant';
      fullPrompt += `${role}: ${msg.content}\n\n`;
    });

    fullPrompt += `Human: ${prompt}\n\nAssistant:`;

    const requestBody = {
      model,
      prompt: fullPrompt,
      stream: true,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body from Ollama');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              yield data.response;
            }
            if (data.done) {
              return;
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to stream from Ollama API: ${error}`);
    }
  }
}

// Available local models for Ollama
export const OLLAMA_MODELS = {
  // Llama models
  'llama2': 'Meta Llama 2 7B',
  'llama2:13b': 'Meta Llama 2 13B',
  'llama2:70b': 'Meta Llama 2 70B',
  'llama2-uncensored': 'Llama 2 Uncensored 7B',
  'code-llama': 'Code Llama 7B',
  'code-llama:13b': 'Code Llama 13B',
  'code-llama:34b': 'Code Llama 34B',
  
  // Mistral models
  'mistral': 'Mistral 7B',
  'mistral-openorca': 'Mistral OpenOrca 7B',
  'mixtral': 'Mixtral 8x7B',
  
  // Other popular models
  'vicuna': 'Vicuna 7B',
  'orca-mini': 'Orca Mini 3B',
  'neural-chat': 'Neural Chat 7B',
  'starling-lm': 'Starling LM 7B',
  'dolphin-mixtral': 'Dolphin Mixtral 8x7B',
  'nous-hermes2': 'Nous Hermes 2 7B',
  
  // Specialized models
  'sqlcoder': 'SQL Coder 7B',
  'magicoder': 'MagiCoder 6.7B',
  'deepseek-coder': 'DeepSeek Coder 6.7B',
}; 