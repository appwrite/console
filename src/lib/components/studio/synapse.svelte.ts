import { SvelteURL } from 'svelte/reactivity';

type WebSocketEvent = 'connect' | 'disconnect' | 'reconnect';
type SynapseMessageType = 'terminal' | 'fs' | 'synapse';
type SynapseResponseMessageType = SynapseMessageType | 'syncWorkDir';
type SynapseMessageOperations = {
    operation: 'updateWorkDir';
    params: {
        workDir: string;
    };
};
type SynapseMessageOperationFileSystem =
    | {
          operation: 'createFile' | 'updateFile';
          params: { filepath: string; content: string };
      }
    | {
          operation: 'getFile' | 'deleteFile';
          params: { filepath: string };
      }
    | {
          operation: 'createFolder' | 'getFolder' | 'deleteFolder';
          params: { folderpath: string };
      }
    | {
          operation: 'updateFilePath';
          params: { filepath: string; newPath: string };
      }
    | {
          operation: 'updateFolderPath';
          params: { folderpath: string; newPath: string };
      }
    | {
          operation: 'searchFiles';
          params: { term: string };
      };
type SynapseMessageOperationTerminal =
    | { operation: 'updateSize'; params: { cols: number; rows: number } }
    | { operation: 'createCommand'; params: { command: string } };

type Events = WebSocketEvent | SynapseMessageType | SynapseResponseMessageType;
type BaseMessage<T = unknown> = {
    success: boolean;
    data: T;
    type: SynapseMessageType;
    requestId: string;
};

export type SyncWorkDirData = {
    path: string;
} & (
    | {
          event: 'unlink';
          content: null;
      }
    | {
          event: 'add';
          content: string;
      }
    | {
          event: 'change';
          content: string;
      }
);

export class Synapse {
    private ws: WebSocket | null = null;
    private endpoint: string;
    private callbacks: Partial<
        Record<Events, Array<(args: { socket: WebSocket; message: BaseMessage }) => void>>
    > = {};
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private requestCounter = 0;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    public isReconnecting = $state(false);

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    public async isConnected(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let tries = 0;
            const interval = setInterval(() => {
                if (++tries > 20) {
                    reject(new Error('WebSocket is not connected'));
                }
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    clearInterval(interval);
                    resolve(true);
                }
            }, 50);
        });
    }

    public async *streamStatus(): AsyncGenerator<
        'reconnecting' | 'closing' | 'closed' | 'connecting' | 'connected' | 'unknown'
    > {
        while (true) {
            switch (true) {
                case this.isReconnecting:
                    yield 'reconnecting';
                    break;
                case this.ws && this.ws.readyState === WebSocket.CLOSING:
                    yield 'closing';
                    break;
                case this.ws && this.ws.readyState === WebSocket.CLOSED:
                    yield 'closed';
                    break;
                case this.ws && this.ws.readyState === WebSocket.CONNECTING:
                    yield 'connecting';
                    break;
                case this.ws && this.ws.readyState === WebSocket.OPEN:
                    yield 'connected';
                    break;
                default:
                    yield 'unknown';
                    break;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    public async changeArtifact(endpoint: string, artifact: string, syncWorkDir: boolean = false) {
        const url = new SvelteURL(endpoint);
        // url.searchParams.set('workDir', `/artifact/${artifact}`);
        // url.searchParams.set('workDir', `/Users/arielweinberger/Development/appwrite/appwrite-console/ai-service/tmp/workspace/artifact/68681e3c002a03876050`);

        if (syncWorkDir) url.searchParams.set('syncWorkDir', 'true');

        this.endpoint = url.toString();

        this.connect();
        await this.isConnected();
    }

    public connect() {
        console.log("Endpoint", this.endpoint);
        this.ws = new WebSocket(this.endpoint);

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.isReconnecting = false;
            this.callEventListeners('connect', null);
        };

        this.ws.onclose = () => {
            this.callEventListeners('disconnect', null);
            this.reconnect();
        };

        this.ws.onerror = () => {
            if (this.ws) {
                this.ws.close();
            }
        };

        this.ws.onmessage = (message) => this.onMessage(message);
    }

    private reconnect() {
        if (this.isReconnecting) return;
        this.isReconnecting = true;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Maximum reconnection attempts reached');
            return;
        }

        const delay = Math.min(100 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        this.callEventListeners('reconnect', null);

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    private isMessage(data: unknown): data is BaseMessage {
        return typeof data === 'object' && data !== null && 'type' in data && 'requestId' in data;
    }

    private onMessage(message: MessageEvent<string>) {
        const response = JSON.parse(message.data);
        if (!this.isMessage(response)) return;
        this.callEventListeners(response.type, response);
    }

    private callEventListeners(event: Events, message: BaseMessage) {
        const listeners = this.callbacks[event];
        if (listeners && this.ws) {
            listeners.forEach((listener) => listener({ socket: this.ws!, message }));
        }
    }

    public async dispatch<T extends SynapseMessageType>(
        type: T,
        payload: {
            synapse: SynapseMessageOperations;
            fs: SynapseMessageOperationFileSystem;
            terminal: SynapseMessageOperationTerminal;
        }[T],
        options?: {
            timeout?: number;
            noReturn?: boolean;
        }
    ): Promise<BaseMessage> {
        const requestId = String(Date.now().toString() + ++this.requestCounter);

        const message = {
            type,
            operation: payload.operation,
            params: payload.params,
            requestId
        };
        const response = new Promise<BaseMessage>((resolve, reject) => {
            const noReturn = options?.noReturn === true;
            const timeout = setTimeout(() => {
                if (noReturn) return;
                reject(
                    new Error('Request timed out', {
                        cause: message.operation
                    })
                );
            }, options?.timeout ?? 5000);
            const callback = (message: MessageEvent<string>) => {
                const response = JSON.parse(message.data);
                if (!this.isMessage(response)) return;
                const finish = () => {
                    resolve(response);
                    clearTimeout(timeout);
                    this.ws.removeEventListener('message', callback);
                };
                // workaround for awaiting terminal answers
                if (type === 'terminal') {
                    if (String(response.data).endsWith('# \u001b[6n')) {
                        finish();
                    }
                }
                if (response.requestId === requestId) {
                    finish();
                }
            };
            if (!noReturn) this.ws.addEventListener('message', callback);
            else resolve(null);
        });

        // check if websocket is connected
        if (this.ws?.readyState !== WebSocket.OPEN) {
            await this.isConnected();
            if (this.ws?.readyState !== WebSocket.OPEN)
                throw new Error('WebSocket is not connected');
        }
        this.ws.send(JSON.stringify(message));

        return response;
    }
    public addEventListener(
        event: Events,
        callback: (args: { socket: WebSocket; message: BaseMessage }) => void
    ): () => void {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        const index = this.callbacks[event]!.push(callback) - 1;

        return () => {
            if (this.callbacks[event]) {
                this.callbacks[event]!.splice(index, 1);
            }
        };
    }
}
