export interface EventInfo {
  type: string;
  line: number;
}

export interface MethodInfo {
  params: { name: string; type: string }[];
  returnType: string;
  line: number;
}

export interface StateTypeInfo {
  events: Map<string, EventInfo>;
  methods: Map<string, MethodInfo>;
}

export function parseReadme(content: string): StateTypeInfo {
  const events = new Map<string, EventInfo>();
  const methods = new Map<string, MethodInfo>();

  const lines = content.split('\n');
  let section = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('# ')) {
      section = line.slice(2).trim().toLowerCase();
      continue;
    }

    if (!line || line.startsWith('#')) continue;

    if (section === 'event') {
      // Format: EventName: PayloadType
      const m = line.match(/^(\S+):\s*(.+)$/);
      if (m) {
        events.set(m[1], { type: m[2].trim(), line: i + 1 });
      }
    } else if (section === 'method') {
      // Format: methodName: (param: Type, param2: Type2) -> ReturnType
      // Or:     methodName: () -> ReturnType
      const m = line.match(/^(\w+):\s*\(([^)]*)\)\s*->\s*(.+)$/);
      if (m) {
        const name = m[1];
        const rawParams = m[2].trim();
        const returnType = m[3].trim();
        const params: { name: string; type: string }[] = [];

        if (rawParams) {
          for (const seg of rawParams.split(',')) {
            const parts = seg.trim().split(':');
            if (parts.length === 2) {
              params.push({ name: parts[0].trim(), type: parts[1].trim() });
            }
          }
        }

        methods.set(name, { params, returnType, line: i + 1 });
      }
    }
  }

  return { events, methods };
}
