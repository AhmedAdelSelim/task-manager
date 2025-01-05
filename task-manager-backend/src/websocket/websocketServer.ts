import { Server as HTTPServer } from 'http';
import { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  userId?: string;
}

interface WebSocketMessage {
  type: string;
  payload: any;
  userId?: string;
}

class WebSocketManager extends EventEmitter {
  private wss: WebSocketServer;
  private pingInterval!: NodeJS.Timeout;

  constructor(server: HTTPServer) {
    super();
    this.wss = new WebSocketServer({ server });
    this.initialize();
    this.startHeartbeat();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocketClient, req) => {
      ws.isAlive = true;

      // Extract user information from request (you can modify this based on your auth system)
      const userId = this.extractUserIdFromRequest(req);
      ws.userId = userId;

      console.log(`Client connected. Total clients: ${this.wss.clients.size}`);

      // Handle incoming messages
      ws.on('message', (message: string) => {
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(message);
          this.handleMessage(parsedMessage, ws);
        } catch (error) {
          console.error('Error handling message:', error);
          ws.send(JSON.stringify({
            type: 'ERROR',
            payload: 'Invalid message format'
          }));
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log(`Client disconnected. Total clients: ${this.wss.clients.size}`);
      });

      // Handle pong messages
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Send initial state if needed
      this.sendInitialState(ws);
    });
  }

  private startHeartbeat() {
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach((client: WebSocket) => {
        const wsClient = client as WebSocketClient;
        if (wsClient.isAlive === false) {
          return wsClient.terminate();
        }

        wsClient.isAlive = false;
        wsClient.ping();
      });
    }, 30000);
  }

  private handleMessage(message: WebSocketMessage, sender: WebSocketClient) {
    // Add sender's userId to the message
    message.userId = sender.userId;

    switch (message.type) {
      case 'TASK_UPDATE':
      case 'CUSTOM_FIELD_UPDATE':
        this.broadcast(message, sender);
        break;
      case 'REQUEST_INITIAL_STATE':
        this.sendInitialState(sender);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  public broadcast(message: WebSocketMessage, exclude?: WebSocketClient) {
    this.wss.clients.forEach((client: WebSocket) => {
      const wsClient = client as WebSocketClient;
      if (wsClient !== exclude && wsClient.readyState === WebSocket.OPEN) {
        wsClient.send(JSON.stringify(message));
      }
    });
  }

  private sendInitialState(ws: WebSocketClient) {
    // Implement this method to send initial state to new clients
    ws.send(JSON.stringify({
      type: 'INITIAL_STATE',
      payload: {
        timestamp: new Date().toISOString()
      }
    }));
  }

  private extractUserIdFromRequest(req: any): string {
    // Implement your user extraction logic here
    return req.headers['x-user-id'] || 'anonymous';
  }

  public cleanup() {
    clearInterval(this.pingInterval);
    this.wss.close();
  }
}

let wsManager: WebSocketManager;

export const initializeWebSocket = (server: HTTPServer) => {
  wsManager = new WebSocketManager(server);
  return wsManager;
};

export const getWebSocketManager = () => {
  if (!wsManager) {
    throw new Error('WebSocket Manager not initialized');
  }
  return wsManager;
};