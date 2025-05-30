import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLLMService } from '@/lib/llm/service';
import { buildPrompt, getPromptTemplate, AssessmentContext } from '@/lib/llm/prompts';

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
    const template = getPromptTemplate(promptType);
    
    // Build the prompt with assessment context
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

    const { systemPrompt, userPrompt, options } = buildPrompt(
      template,
      assessmentContext,
      message
    );

    // Convert conversation history to context messages
    const contextMessages = conversationHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const metadata = {
            type: 'metadata',
            promptType,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

          // Generate streaming response
          let fullResponse = '';
          for await (const chunk of llmService.generateStreamResponse(userPrompt, {
            ...options,
            systemPrompt,
            contextMessages
          })) {
            fullResponse += chunk;
            const data = {
              type: 'content',
              content: chunk,
              fullResponse
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }

          // Send completion signal
          const completion = {
            type: 'complete',
            fullResponse,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completion)}\n\n`));
          
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = {
            type: 'error',
            error: 'Failed to generate response'
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('LLM Stream API error:', error);
    return NextResponse.json(
      { error: 'Failed to process stream request' },
      { status: 500 }
    );
  }
} 