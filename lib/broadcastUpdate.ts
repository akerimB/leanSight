// In-memory store for tracking connected clients
export const clients = new Map<string, any>();

// Broadcast function to send updates to connected clients
export function broadcastUpdate(data: any, filter?: (client: any) => boolean) {
  const message = JSON.stringify({
    type: 'update',
    data,
    timestamp: new Date().toISOString()
  });

  Array.from(clients.entries()).forEach(([clientId, client]) => {
    try {
      // Apply filter if provided
      if (filter && !filter(client)) {
        return;
      }

      client.controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      console.log('Failed to send to client:', clientId);
      clients.delete(clientId);
    }
  });
} 