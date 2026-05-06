import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export const AnchorNode = memo(({ }: NodeProps) => {
  return (
    <div className="anchor-node">
      <Handle type="source" position={Position.Right} id="right" className="anchor-handle" />
      <Handle type="source" position={Position.Left} id="left" className="anchor-handle" />
      <Handle type="target" position={Position.Right} id="right" className="anchor-handle" />
      <Handle type="target" position={Position.Left} id="left" className="anchor-handle" />
    </div>
  );
});

AnchorNode.displayName = 'AnchorNode';
