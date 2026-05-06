import * as vscode from 'vscode';
import { FlowEditorProvider } from './editorProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(FlowEditorProvider.register(context));
}

export function deactivate() {}
