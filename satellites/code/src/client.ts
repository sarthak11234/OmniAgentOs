import * as WebSocket from 'ws';
import * as vscode from 'vscode';
import { CortexEvent } from './types';

export class CortexClient {
    private ws: WebSocket | null = null;
    private url: string = 'ws://localhost:8000/ws/stream';
    private reconnectInterval: number = 5000;
    private isConnected: boolean = false;
    private statusItem: vscode.StatusBarItem;

    constructor() {
        this.statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusItem.text = "$(circle-slash) Cortex: Offline";
        this.statusItem.show();
        this.connect();
    }

    private connect() {
        try {
            this.ws = new WebSocket(this.url);

            this.ws.on('open', () => {
                console.log('Connected to Cortex Brain');
                this.isConnected = true;
                this.statusItem.text = "$(rss) Cortex: Online";
                vscode.window.showInformationMessage('OmniContext: Connected to Brain 🧠');
            });

            this.ws.on('close', () => {
                console.log('Disconnected from Cortex Brain');
                this.isConnected = false;
                this.statusItem.text = "$(circle-slash) Cortex: Offline";
                setTimeout(() => this.connect(), this.reconnectInterval);
            });

            this.ws.on('error', (err: Error) => {
                console.error('WebSocket error:', err);
                this.ws?.close();
            });

        } catch (e) {
            console.error('Connection failed:', e);
            setTimeout(() => this.connect(), this.reconnectInterval);
        }
    }

    public send(event: CortexEvent) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(event));
        }
    }

    public async query(query: string): Promise<{ answer: string; context_used: string }> {
        const response = await fetch('http://localhost:8000/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`Cortex Brain returned error: ${response.statusText}`);
        }

        return await response.json() as { answer: string; context_used: string };
    }

    public dispose() {
        this.ws?.close();
        this.statusItem.dispose();
    }
}
