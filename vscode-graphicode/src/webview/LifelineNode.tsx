import React, { memo } from 'react';
import type { NodeProps } from 'reactflow';

interface LifelineData {
  height: number;
}

export const LifelineNode = memo(({ data }: NodeProps<LifelineData>) => {
  return (
    <div
      className="lifeline-node"
      style={{ height: data.height }}
    />
  );
});

LifelineNode.displayName = 'LifelineNode';
