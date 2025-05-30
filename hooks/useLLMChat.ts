import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    provider?: string;
    promptType?: string;
    usage?: any;
  };
}

export interface AssessmentContext {
  questionText?: string;
  categoryName?: string;
  dimensionName?: string;
  currentScore?: number;
  industryContext?: string;
  companyName?: string;
  departmentName?: string;
  evidenceFiles?: string[];
  manualSectors?: string[];
  manualDimensions?: string[];
}

export interface UseLLMChatOptions {
  maxMessages?: number;
  enableStreaming?: boolean;
  autoSave?: boolean;
}

export interface LLMChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  usageStats?: any;
}

export function useLLMChat(options: UseLLMChatOptions = {}) {
  const {
    maxMessages = 50,
    enableStreaming = true,
    autoSave = true
  } = options;

  const [state, setState] = useState<LLMChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null
  });

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages.slice(-(maxMessages - 1)), newMessage]
    }));

    return newMessage;
  }, [maxMessages]);

  const updateLastMessage = useCallback((content: string, metadata?: any) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, index) => 
        index === prev.messages.length - 1 
          ? { ...msg, content, metadata: { ...msg.metadata, ...metadata } }
          : msg
      )
    }));
  }, []);

  const sendMessage = useCallback(async (
    message: string,
    context?: AssessmentContext,
    promptType: string = 'GENERAL_GUIDANCE'
  ) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = addMessage({
      role: 'user',
      content: message.trim()
    });

    // Set loading state
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (enableStreaming) {
        // Use streaming endpoint
        await handleStreamingResponse(message, context, promptType);
      } else {
        // Use regular endpoint
        await handleRegularResponse(message, context, promptType);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      }));
    }
  }, [addMessage, enableStreaming]);

  const handleStreamingResponse = useCallback(async (
    message: string,
    context?: AssessmentContext,
    promptType: string = 'GENERAL_GUIDANCE'
  ) => {
    setState(prev => ({ ...prev, isStreaming: true }));

    // Add empty assistant message that will be updated
    const assistantMessage = addMessage({
      role: 'assistant',
      content: ''
    });

    try {
      const response = await fetch('/api/llm/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          promptType,
          conversationHistory: state.messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                fullResponse = data.fullResponse;
                updateLastMessage(fullResponse);
              } else if (data.type === 'complete') {
                updateLastMessage(data.fullResponse, { completed: true });
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } finally {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isStreaming: false 
      }));
    }
  }, [addMessage, updateLastMessage, state.messages]);

  const handleRegularResponse = useCallback(async (
    message: string,
    context?: AssessmentContext,
    promptType: string = 'GENERAL_GUIDANCE'
  ) => {
    try {
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          promptType,
          conversationHistory: state.messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Add assistant response
      addMessage({
        role: 'assistant',
        content: data.message,
        metadata: data.metadata
      });

      // Update usage stats
      setState(prev => ({
        ...prev,
        usageStats: data.metadata
      }));

    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addMessage, state.messages]);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: null
    }));
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId)
    }));
  }, []);

  const getConversationSummary = useCallback(() => {
    const totalMessages = state.messages.length;
    const userMessages = state.messages.filter(msg => msg.role === 'user').length;
    const assistantMessages = state.messages.filter(msg => msg.role === 'assistant').length;
    
    return {
      totalMessages,
      userMessages,
      assistantMessages,
      lastActivity: state.messages[state.messages.length - 1]?.timestamp
    };
  }, [state.messages]);

  return {
    ...state,
    sendMessage,
    clearMessages,
    removeMessage,
    getConversationSummary,
    hasMessages: state.messages.length > 0
  };
} 