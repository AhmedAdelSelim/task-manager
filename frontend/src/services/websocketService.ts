type WebSocketHandler = (message: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<WebSocketHandler> = new Set();

  connect() {
    this.ws = new WebSocket('ws://localhost:3000');

    this.ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messageHandlers.forEach(handler => handler(message));
    };

    this.ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setTimeout(() => this.connect(), 5000);
    };
  }

  subscribe(handler: WebSocketHandler) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }
}

export const wsService = new WebSocketService(); 