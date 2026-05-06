import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

interface ParticipantData {
  name: string;
  path: string;
}

export const ParticipantNode = memo(({ data }: NodeProps<ParticipantData>) => {
  return (
    <div className="participant-node">
      <div className="participant-name">{data.name}</div>
      <div className="participant-path">{data.path}</div>
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
});

ParticipantNode.displayName = 'ParticipantNode';
