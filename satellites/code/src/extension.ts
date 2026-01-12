import * as vscode from 'vscode';
import { CortexClient } from './client';
import { CortexEvent } from './types';
import { SidebarProvider } from './sidebar';

let client: CortexClient;

export function activate(context: vscode.ExtensionContext) {
    console.log('OmniContext Extension is now active!');

    // 1. Initialize Client
    client = new CortexClient();
    context.subscriptions.push(client);

    // 2. Register File Watcher
    const activeEditorListener = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            sendContext(editor);
        }
    });

    // 3. Register Sidebar Provider
    const sidebarProvider = new SidebarProvider(context.extensionUri, client);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider)
    );

    // 3. Register Save Listener (Updates context on save)
    const saveListener = vscode.workspace.onDidSaveTextDocument(doc => {
        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document === doc) {
            sendContext(vscode.window.activeTextEditor);
        }
    });

    context.subscriptions.push(activeEditorListener);
    context.subscriptions.push(saveListener);

    // Initial Send
    if (vscode.window.activeTextEditor) {
        sendContext(vscode.window.activeTextEditor);
    }
}

function sendContext(editor: vscode.TextEditor) {
    const doc = editor.document;
    if (doc.uri.scheme !== 'file') return; // Ignore output panels etc.

    const event: CortexEvent = {
        type: 'code_context',
        source: 'vscode_satellite',
        timestamp: Date.now() / 1000,
        payload: {
            filename: doc.fileName,
            cursor_line: editor.selection.active.line,
            content_snippet: doc.getText(), // Send full text for now (optimize later)
            language: doc.languageId
        }
    };

    client.send(event);
    console.log(`Sent context for ${doc.fileName}`);
}

export function deactivate() {
    if (client) {
        client.dispose();
    }
}
