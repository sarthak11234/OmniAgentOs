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
                    vscode.window.showInformationMessage(`Sending to Cortex: ${userQuery}`);
                    // TODO: Send to Cortex via Client
                    // this._client.sendQuery(userQuery);
                    break;
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OmniContext</title>
                <style>
                    body { font-family: sans-serif; padding: 10px; }
                    textarea { width: 100%; height: 100px; margin-bottom: 10px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
                    button { width: 100%; padding: 8px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; }
                    button:hover { background: var(--vscode-button-hoverBackground); }
                    .chat-log { margin-top: 20px; border-top: 1px solid #333; padding-top: 10px; }
                </style>
            </head>
            <body>
                <h3>Cortex Chat 🧠</h3>
                <div class="chat-log" id="chat-log">
                    <p><i>Ask me anything about your context...</i></p>
                </div>
                <br/>
                <textarea id="prompt" placeholder="Type here..."></textarea>
                <button id="askBtn">Ask Cortex</button>

                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('askBtn').addEventListener('click', () => {
                        const text = document.getElementById('prompt').value;
                        if(text) {
                            vscode.postMessage({ type: 'sendMessage', value: text });
                            document.getElementById('prompt').value = '';
                        }
                    });
                </script>
            </body>
            </html>`;
    }
}
