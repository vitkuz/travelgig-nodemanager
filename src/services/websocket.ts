type WebSocketMessage = {
    type: string;
    data: {
        id: string;
        [key: string]: unknown;
    };
};

class WebSocketService {
    private socket: WebSocket | null = null;
    private messageHandlers: ((message: WebSocketMessage) => void)[] = [];

    constructor(private url: string) {}

    connect() {
        if (this.socket) {
            console.warn('WebSocket is already connected.');
            return;
        }

        this.socket = new WebSocket(this.url);

        // Log WebSocket connection open
        this.socket.onopen = () => {
            console.log('[WebSocket] Connected to:', this.url);
        };

        // Log WebSocket disconnection
        this.socket.onclose = (event) => {
            console.log('[WebSocket] Disconnected:', event.reason || 'No reason provided');
        };

        // Log WebSocket errors
        this.socket.onerror = (error) => {
            console.error('[WebSocket] Error:', error);
        };

        // Log all incoming messages
        this.socket.onmessage = (event) => {
            console.log('[WebSocket] Message received:', event.data);

            try {
                const message: WebSocketMessage = JSON.parse(event.data as string);
                this.messageHandlers.forEach((handler) => handler(message));
            } catch (err) {
                console.error('[WebSocket] Error parsing message:', err);
            }
        };
    }

    addMessageHandler(handler: (message: WebSocketMessage) => void) {
        this.messageHandlers.push(handler);

        return () => {
            this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
        };
    }

    sendMessage(message: WebSocketMessage) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('[WebSocket] Sending message:', message);
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('[WebSocket] Cannot send message: WebSocket is not connected');
        }
    }

    disconnect() {
        if (this.socket) {
            console.log('[WebSocket] Disconnecting...');
            this.socket.close();
            this.socket = null;
        }
    }
}

export const websocketService = new WebSocketService(
    'wss://nk1i6lotii.execute-api.us-east-1.amazonaws.com/prod'
);
