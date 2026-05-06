import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import { ParticipantNode } from './ParticipantNode';
import { AnchorNode } from './AnchorNode';
import { LifelineNode } from './LifelineNode';
import { ConnectionEdge } from './ConnectionEdge';

const nodeTypes = {
  participantNode: ParticipantNode,
  anchorNode: AnchorNode,
  lifelineNode: LifelineNode,
};

const edgeTypes = {
  connectionEdge: ConnectionEdge,
};

interface Props {
  nodes: Node[];
  edges: Edge[];
}

export function SequenceDiagram({ nodes, edges }: Props) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag
      zoomOnScroll
      minZoom={0.2}
      maxZoom={2}
    >
      <Background gap={20} size={1} color="var(--vscode-editorLineNumber-foreground)" />
      <Controls />
    </ReactFlow>
  );
}
