import * as vscode from 'vscode';
import { CortexClient } from './client';

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'omnicontext.sidebar';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _client: CortexClient
    ) {
        // Listen for connection state changes
        this._client.onConnectionChange((isConnected) => {
            this._updateConnectionStatus(isConnected);
        });
    }

    private _updateConnectionStatus(isConnected: boolean) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'connectionStatus',
                connected: isConnected
            });
        }
    }

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

        // Send initial connection status
        this._updateConnectionStatus(this._client.isConnectedNow());

        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'sendMessage':
                    const userQuery = data.value;
                    await this._handleQuery(userQuery);
                    break;
                case 'copyText':
                    await vscode.env.clipboard.writeText(data.value);
                    vscode.window.showInformationMessage('Copied to clipboard!');
                    break;
                case 'insertAtCursor':
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        editor.edit(editBuilder => {
                            editBuilder.insert(editor.selection.active, data.value);
                        });
                        vscode.window.showInformationMessage('Inserted at cursor!');
                    } else {
                        vscode.window.showWarningMessage('No active editor to insert into.');
                    }
                    break;
            }
        });
    }

    private async _handleQuery(query: string) {
        if (this._view) {
            // Show user message
            this._view.webview.postMessage({ type: 'addMessage', role: 'user', content: query });
            // Show loading indicator
            this._view.webview.postMessage({ type: 'setLoading', loading: true });

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
            } finally {
                // Hide loading indicator
                this._view.webview.postMessage({ type: 'setLoading', loading: false });
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
                    * { box-sizing: border-box; }
                    body { 
                        font-family: var(--vscode-font-family); 
                        color: var(--vscode-foreground); 
                        padding: 10px;
                        margin: 0;
                    }
                    
                    /* Header & Status */
                    .header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid var(--vscode-widget-border);
                    }
                    .header h3 { margin: 0; }
                    .status-badge {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        font-size: 0.75em;
                        padding: 3px 8px;
                        border-radius: 10px;
                        background: var(--vscode-badge-background);
                    }
                    .status-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: #f44;
                    }
                    .status-dot.online { background: #4c4; }
                    
                    /* Input Area */
                    textarea { 
                        width: 100%; 
                        height: 70px; 
                        margin-bottom: 8px; 
                        background: var(--vscode-input-background); 
                        color: var(--vscode-input-foreground); 
                        border: 1px solid var(--vscode-input-border); 
                        border-radius: 4px; 
                        padding: 8px; 
                        resize: vertical;
                        font-family: inherit;
                    }
                    button { 
                        width: 100%; 
                        padding: 8px; 
                        background: var(--vscode-button-background); 
                        color: var(--vscode-button-foreground); 
                        border: none; 
                        border-radius: 4px; 
                        cursor: pointer;
                        font-weight: 500;
                    }
                    button:hover { background: var(--vscode-button-hoverBackground); }
                    
                    /* Chat Log */
                    .chat-log { 
                        margin-top: 15px; 
                        overflow-y: auto; 
                        max-height: calc(100vh - 220px);
                        padding-bottom: 10px;
                    }
                    .message { 
                        margin-bottom: 12px; 
                        padding: 10px; 
                        border-radius: 6px;
                        position: relative;
                    }
                    .user { 
                        background: var(--vscode-editor-selectionBackground); 
                        border-left: 3px solid #007acc; 
                    }
                    .bot { 
                        background: var(--vscode-editor-inactiveSelectionBackground); 
                        border-left: 3px solid #4ec9b0; 
                    }
                    .error { 
                        color: var(--vscode-errorForeground); 
                        background: rgba(255,0,0,0.1);
                        border-left: 3px solid #f44;
                    }
                    .label { 
                        font-weight: bold; 
                        font-size: 0.75em; 
                        margin-bottom: 6px; 
                        display: block; 
                        opacity: 0.7;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .context-hint { 
                        font-size: 0.75em; 
                        color: #888; 
                        margin-top: 8px; 
                        cursor: help; 
                        border-bottom: 1px dotted #888; 
                        display: inline-block;
                    }
                    
                    /* Code Blocks */
                    .content code {
                        background: var(--vscode-textCodeBlock-background);
                        padding: 2px 5px;
                        border-radius: 3px;
                        font-family: var(--vscode-editor-font-family);
                        font-size: 0.9em;
                    }
                    .content pre {
                        background: var(--vscode-textCodeBlock-background);
                        padding: 10px;
                        border-radius: 4px;
                        overflow-x: auto;
                        margin: 8px 0;
                    }
                    .content pre code {
                        background: none;
                        padding: 0;
                    }
                    
                    /* Action Buttons */
                    .actions {
                        display: flex;
                        gap: 5px;
                        margin-top: 8px;
                    }
                    .action-btn {
                        width: auto;
                        padding: 4px 8px;
                        font-size: 0.75em;
                        background: var(--vscode-button-secondaryBackground);
                        color: var(--vscode-button-secondaryForeground);
                        border-radius: 3px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                    .action-btn:hover {
                        background: var(--vscode-button-secondaryHoverBackground);
                    }
                    
                    /* Loading Indicator */
                    .typing-indicator {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        padding: 10px;
                        opacity: 0.7;
                    }
                    .typing-indicator span {
                        width: 8px;
                        height: 8px;
                        background: var(--vscode-foreground);
                        border-radius: 50%;
                        animation: bounce 1.4s infinite ease-in-out both;
                    }
                    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                    @keyframes bounce {
                        0%, 80%, 100% { transform: scale(0); }
                        40% { transform: scale(1); }
                    }
                    
                    /* Input Container */
                    .input-container {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        padding: 10px;
                        background: var(--vscode-sideBar-background);
                        border-top: 1px solid var(--vscode-widget-border);
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h3>🧠 Cortex Brain</h3>
                    <div class="status-badge">
                        <span id="status-dot" class="status-dot"></span>
                        <span id="status-text">Offline</span>
                    </div>
                </div>
                
                <div class="chat-log" id="chat-log">
                    <p style="opacity:0.5; font-style: italic;">Ask me about your code or meetings...</p>
                </div>
                
                <div id="loading" class="typing-indicator" style="display:none">
                    <span></span><span></span><span></span>
                    <span style="margin-left: 5px; font-size: 0.85em;">Thinking...</span>
                </div>
                
                <div class="input-container">
                    <textarea id="prompt" placeholder="Ask about your code, meetings, or anything..."></textarea>
                    <button id="askBtn">Send to Cortex</button>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();
                    const chatLog = document.getElementById('chat-log');
                    const prompt = document.getElementById('prompt');
                    const askBtn = document.getElementById('askBtn');
                    const loading = document.getElementById('loading');
                    const statusDot = document.getElementById('status-dot');
                    const statusText = document.getElementById('status-text');

                    // Simple markdown parser for code blocks
                    function parseMarkdown(text) {
                        // Code blocks
                        text = text.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, '<pre><code>$2</code></pre>');
                        // Inline code
                        text = text.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
                        // Bold
                        text = text.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
                        // Italic
                        text = text.replace(/\\*([^*]+)\\*/g, '<em>$1</em>');
                        // Line breaks
                        text = text.replace(/\\n/g, '<br>');
                        return text;
                    }

                    // Extract code from response for copy/insert
                    function extractCode(text) {
                        const codeMatch = text.match(/\`\`\`[\\w]*\\n([\\s\\S]*?)\`\`\`/);
                        return codeMatch ? codeMatch[1].trim() : text;
                    }

                    window.addEventListener('message', event => {
                        const message = event.data;
                        
                        if (message.type === 'connectionStatus') {
                            if (message.connected) {
                                statusDot.classList.add('online');
                                statusText.textContent = 'Online';
                            } else {
                                statusDot.classList.remove('online');
                                statusText.textContent = 'Offline';
                            }
                        }
                        
                        if (message.type === 'setLoading') {
                            loading.style.display = message.loading ? 'flex' : 'none';
                            askBtn.disabled = message.loading;
                            if (message.loading) {
                                chatLog.scrollTop = chatLog.scrollHeight;
                            }
                        }
                        
                        if (message.type === 'addMessage') {
                            if (chatLog.innerHTML.includes('Ask me about')) chatLog.innerHTML = '';
                            
                            const div = document.createElement('div');
                            div.className = 'message ' + message.role;
                            
                            const label = document.createElement('span');
                            label.className = 'label';
                            label.innerText = message.role === 'user' ? 'You' : message.role === 'error' ? 'Error' : 'Cortex';
                            div.appendChild(label);

                            const content = document.createElement('div');
                            content.className = 'content';
                            if (message.role === 'bot') {
                                content.innerHTML = parseMarkdown(message.content);
                            } else {
                                content.innerText = message.content;
                            }
                            div.appendChild(content);

                            // Add action buttons for bot messages
                            if (message.role === 'bot') {
                                const actions = document.createElement('div');
                                actions.className = 'actions';
                                
                                const copyBtn = document.createElement('button');
                                copyBtn.className = 'action-btn';
                                copyBtn.innerHTML = '📋 Copy';
                                copyBtn.onclick = () => vscode.postMessage({ type: 'copyText', value: message.content });
                                actions.appendChild(copyBtn);
                                
                                const insertBtn = document.createElement('button');
                                insertBtn.className = 'action-btn';
                                insertBtn.innerHTML = '⬇️ Insert';
                                insertBtn.onclick = () => vscode.postMessage({ type: 'insertAtCursor', value: extractCode(message.content) });
                                actions.appendChild(insertBtn);
                                
                                div.appendChild(actions);
                            }

                            if (message.context && message.context !== "No relevant context found.") {
                                const hint = document.createElement('span');
                                hint.className = 'context-hint';
                                hint.innerText = '📚 Used context';
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
