import * as fs from 'fs';
import * as path from 'path';
import { parseReadme, StateTypeInfo } from './readmeParser';

export interface FlowFile {
  name: string;
  yaml: string;
}

export interface Participant {
  name: string;
  path: string;
}

export async function scanFlowYamlFiles(
  workspaceRoot: string,
  flowDirs: string[]
): Promise<FlowFile[]> {
  const results: FlowFile[] = [];

  for (const dir of flowDirs) {
    const absDir = path.join(workspaceRoot, dir);
    if (!fs.existsSync(absDir)) continue;

    const entries = fs.readdirSync(absDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const yamlPath = path.join(absDir, entry.name, 'README.yaml');
      if (!fs.existsSync(yamlPath)) continue;

      const content = fs.readFileSync(yamlPath, 'utf-8');
      results.push({ name: entry.name, yaml: content });
    }
  }

  return results;
}

export function scanParticipantTypes(
  workspaceRoot: string,
  participants: Participant[]
): Map<string, StateTypeInfo> {
  const result = new Map<string, StateTypeInfo>();

  for (const p of participants) {
    let readmePath = path.join(workspaceRoot, p.path, 'README.md');
    if (!fs.existsSync(readmePath)) {
      readmePath = path.join(workspaceRoot, 'src', p.path, 'README.md');
    }
    if (!fs.existsSync(readmePath)) continue;

    const content = fs.readFileSync(readmePath, 'utf-8');
    result.set(p.name, parseReadme(content));
  }

  return result;
}
