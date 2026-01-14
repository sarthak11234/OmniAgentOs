import * as vscode from 'vscode';
import { CortexClient } from './client';

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'omnicontext.sidebar';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _client: CortexClient
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'sendMessage':
                    const userQuery = data.value;
                    this._handleQuery(userQuery);
                    break;
            }
        });
    }

    private async _handleQuery(query: string) {
        if (this._view) {
            this._view.webview.postMessage({ type: 'addMessage', role: 'user', content: query });

            try {
                const result = await this._client.query(query);
                this._view.webview.postMessage({
                    type: 'addMessage',
                    role: 'bot',
                    content: result.answer,
                    context: result.context_used
                });
            } catch (err) {
                this._view.webview.postMessage({
                    type: 'addMessage',
                    role: 'error',
                    content: `Error: ${err}`
                });
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OmniContext</title>
                <style>
                    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 10px; }
                    textarea { width: 100%; height: 80px; margin-bottom: 10px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; padding: 5px; resize: vertical; }
                    button { width: 100%; padding: 8px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 2px; cursor: pointer; }
                    button:hover { background: var(--vscode-button-hoverBackground); }
                    .chat-log { margin-top: 20px; overflow-y: auto; max-height: calc(100vh - 180px); }
                    .message { margin-bottom: 15px; padding: 8px; border-radius: 4px; }
                    .user { background: var(--vscode-editor-selectionBackground); border-left: 3px solid #007acc; }
                    .bot { background: var(--vscode-editor-inactiveSelectionBackground); border-left: 3px solid #4ec9b0; }
                    .error { color: var(--vscode-errorForeground); background: rgba(255,0,0,0.1); }
                    .context-hint { font-size: 0.8em; color: #888; margin-top: 5px; cursor: help; border-bottom: 1px dotted #888; display: inline-block; }
                    .label { font-weight: bold; font-size: 0.8em; margin-bottom: 4px; display: block; opacity: 0.8; }
                </style>
            </head>
            <body>
                <h3 style="margin-top:0">Cortex Brain 🧠</h3>
                <div class="chat-log" id="chat-log">
                    <p style="opacity:0.5; font-style: italic;">Ask me about your code or meetings...</p>
                </div>
                <div style="position: fixed; bottom: 10px; left: 10px; right: 10px; background: var(--vscode-sideBar-background);">
                    <textarea id="prompt" placeholder="Type a message..."></textarea>
                    <button id="askBtn">Send Query</button>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();
                    const chatLog = document.getElementById('chat-log');
                    const prompt = document.getElementById('prompt');
                    const askBtn = document.getElementById('askBtn');

                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.type === 'addMessage') {
                            if (chatLog.innerHTML.includes('Ask me about')) chatLog.innerHTML = '';
                            
                            const div = document.createElement('div');
                            div.className = 'message ' + message.role;
                            
                            const label = document.createElement('span');
                            label.className = 'label';
                            label.innerText = message.role === 'user' ? 'YOU' : 'CORTEX';
                            div.appendChild(label);

                            const content = document.createElement('div');
                            content.innerText = message.content;
                            div.appendChild(content);

                            if (message.context && message.context !== "No relevant context found.") {
                                const hint = document.createElement('span');
                                hint.className = 'context-hint';
                                hint.innerText = 'Used context ℹ️';
                                hint.title = message.context;
                                div.appendChild(hint);
                            }

                            chatLog.appendChild(div);
                            chatLog.scrollTop = chatLog.scrollHeight;
                        }
                    });

                    askBtn.addEventListener('click', () => {
                        const text = prompt.value.trim();
                        if(text) {
                            vscode.postMessage({ type: 'sendMessage', value: text });
                            prompt.value = '';
                        }
                    });

                    prompt.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            askBtn.click();
                        }
                    });
                </script>
            </body>
            </html>`;
    }
}
