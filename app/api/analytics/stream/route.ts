import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clients } from '@/lib/broadcastUpdate';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const clientId = url.searchParams.get('clientId') || `client_${Date.now()}`;

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Store the client connection
      const response = new Response(
        new ReadableStream({
          start(streamController) {
            // Send initial connection message
            const data = JSON.stringify({
              type: 'connected',
              clientId,
              timestamp: new Date().toISOString()
            });
            
            streamController.enqueue(`data: ${data}\n\n`);
            
            // Store the stream controller for this client
            clients.set(clientId, {
              controller: streamController,
              userId: session.user.id,
              companyId: session.user.companyId,
              role: session.user.role
            } as any);

            // Send periodic heartbeat
            const heartbeat = setInterval(() => {
              try {
                streamController.enqueue(`: heartbeat\n\n`);
              } catch (error) {
                console.log('Client disconnected:', clientId);
                clearInterval(heartbeat);
                clients.delete(clientId);
              }
            }, 30000); // 30 seconds

            // Cleanup on close
            request.signal?.addEventListener('abort', () => {
              clearInterval(heartbeat);
              clients.delete(clientId);
              try {
                streamController.close();
              } catch (error) {
                // Stream already closed
              }
            });
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
          }
        }
      );

      return response;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
} 