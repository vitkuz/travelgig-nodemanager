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
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: number | null = null;
    private isIntentionalClose = false;

    constructor(private url: string) {}

    connect() {
        if (this.socket) {
            if (this.socket.readyState === WebSocket.OPEN) {
                console.log('[WebSocket] Already connected.');
                return;
            }
            if (this.socket.readyState === WebSocket.CONNECTING) {
                console.log('[WebSocket] Connection in progress...');
                return;
            }
        }

        this.isIntentionalClose = false;
        try {
            this.socket = new WebSocket(this.url);
            this.setupSocketHandlers();
        } catch (error) {
            console.error('[WebSocket] Connection error:', error);
            this.handleReconnect();
        }
    }

    private setupSocketHandlers() {
        if (!this.socket) return;

        this.socket.onopen = () => {
            console.log('[WebSocket] Connected to:', this.url);
            this.reconnectAttempts = 0;
        };

        this.socket.onclose = (event) => {
            console.log('[WebSocket] Disconnected:', event.reason || 'No reason provided');
            if (!this.isIntentionalClose) {
                this.handleReconnect();
            }
        };

        this.socket.onerror = (error) => {
            console.error('[WebSocket] Error:', error);
        };

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

    private handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[WebSocket] Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);

        console.log(`[WebSocket] Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts})`);

        if (this.reconnectTimeout) {
            window.clearTimeout(this.reconnectTimeout);
        }

        this.reconnectTimeout = window.setTimeout(() => {
            this.connect();
        }, delay);
    }

    disconnect() {
        this.isIntentionalClose = true;
        if (this.reconnectTimeout) {
            window.clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.socket) {
            console.log('[WebSocket] Disconnecting...');
            this.socket.close();
            this.socket = null;
        }
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
}

export const websocketService = new WebSocketService(
    'wss://nk1i6lotii.execute-api.us-east-1.amazonaws.com/prod'
);
