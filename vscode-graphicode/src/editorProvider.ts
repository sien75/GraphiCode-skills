import * as vscode from "vscode";
import { scanFlowYamlFiles, scanParticipantTypes } from "./parser/scanner";
import { yamlToGraph } from "./parser/yamlToGraph";
import * as yaml from "js-yaml";

interface ReferenceLocation {
  file: string;
  line: number;
  text: string;
}

export class FlowEditorProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = "graphicode.flowViewer";

  constructor(private readonly context: vscode.ExtensionContext) {}

  static register(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerCustomEditorProvider(
      FlowEditorProvider.viewType,
      new FlowEditorProvider(context),
      { supportsMultipleEditorsPerDocument: false, webviewOptions: { retainContextWhenHidden: true } }
    );
  }

  async openCustomDocument(uri: vscode.Uri): Promise<vscode.CustomDocument> {
    return { uri, dispose: () => {} };
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    try {
      webviewPanel.webview.options = { enableScripts: true };

      const graphigContent = await vscode.workspace.fs.readFile(document.uri);
      const graphigText = Buffer.from(graphigContent).toString("utf-8");

      const flowDirs = this.parseConfigList(graphigText, "flowDirs");
      const algorithmDirs = this.parseConfigList(graphigText, "algorithmDirs");
      const typeFileName = this.parseConfigValue(graphigText, "typeFileName") || "types.ts";
      const mainFileName = this.parseConfigValue(graphigText, "mainFileName") || "index.ts";
      const workspaceRoot = vscode.Uri.joinPath(document.uri, "..").fsPath;

      const flowData = await scanFlowYamlFiles(workspaceRoot, flowDirs);

      const graphs = flowData.map((f) => {
        const doc = yaml.load(f.yaml) as { participants?: { name: string; path: string }[] } | null;
        const participants = doc?.participants ?? [];
        const typeInfoMap = scanParticipantTypes(workspaceRoot, participants);
        const graph = yamlToGraph(f.yaml, typeInfoMap);
        return { name: f.name, ...graph };
      });

      const scriptUri = webviewPanel.webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview.js")
      );

      webviewPanel.webview.html = this.getHtml(scriptUri);

      webviewPanel.webview.postMessage({
        type: "setFlowData",
         graphs,
        typeFileName,
        mainFileName,
        algorithmDirs,
      });

      // Handle navigation requests from webview
      webviewPanel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.type === "openFile") {
          await this.handleOpenFile(workspaceRoot, msg.filePath, msg.pattern);
        } else if (msg.type === "findReferences") {
          await this.handleFindReferences(workspaceRoot, flowDirs, msg.pattern);
        }
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      webviewPanel.webview.html = this.getErrorHtml(`Failed to load: ${message}`);
    }
  }

  private async handleOpenFile(workspaceRoot: string, relativePath: string, pattern: string) {
    const path = await import("path");
    const fs = await import("fs");
    let absPath = path.join(workspaceRoot, relativePath);
    if (!fs.existsSync(absPath)) {
      absPath = path.join(workspaceRoot, "src", relativePath);
    }
    // Fallback: if .ts file doesn't exist, try .tsx
    if (!fs.existsSync(absPath) && absPath.endsWith(".ts")) {
      const tsxPath = absPath + "x";
      if (fs.existsSync(tsxPath)) {
        absPath = tsxPath;
      }
    }
    try {
      const uri = vscode.Uri.file(absPath);
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc, { preview: false });

      if (pattern) {
        const text = doc.getText();
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(pattern)) {
            const pos = new vscode.Position(i, 0);
            editor.selection = new vscode.Selection(pos, pos);
            editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
            break;
          }
        }
      }
    } catch {
      vscode.window.showWarningMessage(`File not found: ${relativePath}`);
    }
  }

  private async handleFindReferences(
    workspaceRoot: string,
    flowDirs: string[],
    pattern: string
  ) {
    const path = await import("path");
    const fs = await import("fs");

    const locations = this.searchFiles(workspaceRoot, workspaceRoot, pattern, flowDirs);

    if (locations.length === 0) {
      vscode.window.showInformationMessage(`No references found for "${pattern}"`);
      return;
    }

    if (locations.length === 1) {
      // Single result — navigate directly
      await this.navigateToLocation(locations[0]);
      return;
    }

    // Multiple results — show QuickPick
    const items = locations.map((loc) => {
      const relPath = path.relative(workspaceRoot, loc.file);
      return {
        label: `${path.basename(loc.file)}:${loc.line + 1}`,
        description: relPath,
        detail: loc.text.trim(),
        location: loc,
      };
    });

    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: `References to "${pattern}" (${locations.length} found)`,
    });

    if (picked) {
      await this.navigateToLocation(picked.location);
    }
  }

  private searchFiles(
    workspaceRoot: string,
    dir: string,
    pattern: string,
    excludeDirs: string[]
  ): ReferenceLocation[] {
    const pathMod = require("path");
    const fsMod = require("fs");
    const results: ReferenceLocation[] = [];

    // Directories to always skip
    const alwaysSkip = new Set(["node_modules", ".git", "dist", "build", "out"]);

    // Normalize exclude dirs to absolute paths
    const excludeAbs = new Set(excludeDirs.map((d: string) => pathMod.join(workspaceRoot, d)));

    let entries: string[];
    try {
      entries = fsMod.readdirSync(dir);
    } catch {
      return results;
    }

    for (const entry of entries) {
      const fullPath = pathMod.join(dir, entry);
      let stat: { isDirectory(): boolean; isFile(): boolean };
      try {
        stat = fsMod.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (entry.startsWith(".") || alwaysSkip.has(entry) || excludeAbs.has(fullPath)) continue;
        results.push(...this.searchFiles(workspaceRoot, fullPath, pattern, excludeDirs));
      } else if (stat.isFile() && !entry.startsWith(".") && /\.(ts|tsx|js|jsx)$/.test(entry)) {
        try {
          const content = fsMod.readFileSync(fullPath, "utf-8");
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(pattern)) {
              results.push({ file: fullPath, line: i, text: lines[i] });
            }
          }
        } catch {
          // Skip unreadable files
        }
      }
    }

    return results;
  }

  private async navigateToLocation(location: ReferenceLocation) {
    const uri = vscode.Uri.file(location.file);
    const doc = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(doc, { preview: false });
    const pos = new vscode.Position(location.line, 0);
    editor.selection = new vscode.Selection(pos, pos);
    editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
  }

  private parseConfigList(content: string, key: string): string[] {
    const defaults: Record<string, string[]> = {
      flowDirs: ["src/flows"],
      algorithmDirs: ["src/algorithms"],
    };
    const match = content.match(new RegExp(`${key}:\\s*(.+)`));
    if (!match) return defaults[key] ?? [];
    const dirs: string[] = [];
    const re = /`([^`]+)`/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(match[1])) !== null) {
      dirs.push(m[1]);
    }
    return dirs.length > 0 ? dirs : (defaults[key] ?? []);
  }

  private parseConfigValue(content: string, key: string): string | undefined {
    const match = content.match(new RegExp(`${key}:\\s*\`([^\`]+)\``));
    return match ? match[1] : undefined;
  }

  private getHtml(scriptUri: vscode.Uri): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GraphiCode Flow Viewer</title>
  <style>
    body { margin: 0; padding: 0; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); font-family: var(--vscode-font-family); overflow: hidden; }
    #root { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="${scriptUri}"></script>
</body>
</html>`;
  }

  private getErrorHtml(message: string): string {
    return `<!DOCTYPE html><html><body><h2>Error</h2><p>${message}</p></body></html>`;
  }
}