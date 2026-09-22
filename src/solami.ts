import 'dotenv/config';

export interface SolamiEvent {
  type?: string;
  slot?: number;
  signature?: string;
  [key: string]: unknown;
}

interface SolamiSocket {
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onerror: ((error: unknown) => void) | null;
  onclose: (() => void) | null;
  send(data: string): void;
  close(): void;
}

export interface SolamiStreamStatus {
  configured: boolean;
  connected: boolean;
  endpoint: string | null;
  lastEventAt: string | null;
  lastError: string | null;
}

export class SolamiBlurStream {
  private socket: SolamiSocket | null = null;
  private readonly status: SolamiStreamStatus;

  constructor(
    private readonly apiKey = process.env.SOLAMI_API_KEY,
    private readonly endpoint = process.env.SOLAMI_WS_URL || 'wss://ws.solami.dev/data/subscribe'
  ) {
    this.status = {
      configured: Boolean(apiKey),
      connected: false,
      endpoint: apiKey ? endpoint : null,
      lastEventAt: null,
      lastError: null
    };
  }

  getStatus(): SolamiStreamStatus {
    return { ...this.status };
  }

  start(filter: Record<string, unknown> = { type: 'swap' }): SolamiStreamStatus {
    if (!this.apiKey) {
      this.status.lastError = 'SOLAMI_API_KEY is not configured';
      return this.getStatus();
    }
    const WebSocketCtor = (globalThis as unknown as { WebSocket?: new (url: string) => SolamiSocket }).WebSocket;
    if (!WebSocketCtor) {
      this.status.lastError = 'WebSocket is unavailable in this Node runtime';
      return this.getStatus();
    }
    const url = `${this.endpoint}?chain=solana&api_key=${encodeURIComponent(this.apiKey)}`;
    this.socket = new WebSocketCtor(url);
    this.socket.onopen = () => {
      this.status.connected = true;
      this.status.lastError = null;
      this.socket?.send(JSON.stringify(filter));
    };
    this.socket.onmessage = event => {
      this.status.lastEventAt = new Date().toISOString();
      try {
        JSON.parse(event.data);
      } catch {
        this.status.lastError = 'Received a non-JSON Solami event';
      }
    };
    this.socket.onerror = () => {
      this.status.connected = false;
      this.status.lastError = 'Solami WebSocket connection failed';
    };
    this.socket.onclose = () => {
      this.status.connected = false;
    };
    return this.getStatus();
  }

  stop(): SolamiStreamStatus {
    this.socket?.close();
    this.socket = null;
    this.status.connected = false;
    return this.getStatus();
  }
}
