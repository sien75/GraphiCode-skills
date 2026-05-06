import React, { useEffect, useState } from 'react';
import { SequenceDiagram } from './SequenceDiagram';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';

interface FlowGraph {
  name: string;
  nodes: Node[];
  edges: Edge[];
}

declare function acquireVsCodeApi(): {
  postMessage(msg: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

export const vscode = acquireVsCodeApi();
export let typeFileName = 'types.ts';
export let mainFileName = 'index.ts';
export let algorithmDirs: string[] = ['src/algorithms'];

export function App() {
  const [flows, setFlows] = useState<FlowGraph[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === 'setFlowData') {
        setFlows(msg.graphs);
        if (msg.typeFileName) {
          typeFileName = msg.typeFileName;
        }
        if (msg.mainFileName) {
          mainFileName = msg.mainFileName;
        }
        if (msg.algorithmDirs) {
          algorithmDirs = msg.algorithmDirs;
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (flows.length === 0) {
    return (
      <div className="loading">
        <p>Loading flow diagrams...</p>
        <p className="hint">
          Make sure your project has README.yaml files in the flow directories.
        </p>
      </div>
    );
  }

  const activeFlow = flows[activeIndex];

  return (
    <div className="app">
      {flows.length > 1 && (
        <div className="tab-bar">
          {flows.map((f, i) => (
            <button
              key={f.name}
              className={`tab ${i === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}
      {flows.length === 1 && (
        <div className="single-title">{activeFlow.name}</div>
      )}
      <div className="diagram-container">
        <SequenceDiagram
          key={activeFlow.name}
          nodes={activeFlow.nodes}
          edges={activeFlow.edges}
        />
      </div>
    </div>
  );
}
