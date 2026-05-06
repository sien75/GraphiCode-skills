import React from 'react';
import { getBezierPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import { vscode, typeFileName, mainFileName, algorithmDirs } from './App';

interface ConnectionEdgeData {
  sourceLabel: string;
  targetLabel: string;
  pipeLabel: string;
  edgeType: 'connection' | 'then' | 'catch';
  description?: string;
  connId?: number;
  eventType?: string;
  methodParamType?: string;
  sourceParticipantPath?: string;
  targetParticipantPath?: string;
  eventName?: string;
  methodName?: string;
}

const EDGE_COLORS: Record<string, string> = {
  connection: 'var(--vscode-charts-blue, #4fc1ff)',
  then: 'var(--vscode-charts-green, #89d185)',
  catch: 'var(--vscode-charts-red, #f14c4c)',
};

function openFile(filePath: string, pattern: string) {
  vscode.postMessage({ type: 'openFile', filePath, pattern });
}

function findReferences(pattern: string) {
  vscode.postMessage({ type: 'findReferences', pattern });
}

export function ConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<ConnectionEdgeData>) {
  const edgeType = data?.edgeType ?? 'connection';
  const color = EDGE_COLORS[edgeType];

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0,
  });

  const isLeftToRight = sourceX <= targetX;
  const srcLabel = data?.sourceLabel ?? '';
  const tgtLabel = data?.targetLabel ?? '';
  const pipeLabel = data?.pipeLabel ?? '';
  const description = data?.description ?? '';
  const connId = data?.connId;
  const eventType = data?.eventType ?? '';
  const methodParamType = data?.methodParamType ?? '';
  const srcPath = data?.sourceParticipantPath ?? '';
  const tgtPath = data?.targetParticipantPath ?? '';
  const eventName = data?.eventName ?? '';
  const methodName = data?.methodName ?? '';

  const descLine = description
    ? (connId != null ? `#${connId} ${description}` : description)
    : '';

  // Layout rows:
  // descY:  #n description (centered)
  // labelY: event (source side) | pipe (center) | method(param) (target side)
  // typeY:  eventType (source side) | methodParamType (target side)
  // arrow line at sourceY
  const descY = sourceY - 46;
  const labelY = sourceY - 30;
  const typeY = sourceY - 16;

  const srcLabelX = isLeftToRight ? sourceX - 154 : sourceX + 4;
  const tgtLabelX = isLeftToRight ? targetX + 4 : targetX - 154;

  const clickable: React.CSSProperties = { cursor: 'pointer' };

  return (
    <>
      <path
        id={id}
        d={edgePath}
        stroke={color}
        strokeWidth={2}
        fill="none"
        markerEnd={`url(#arrow-${edgeType})`}
      />
      <defs>
        <marker
          id={`arrow-${edgeType}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={color} />
        </marker>
      </defs>
      {/* Description line */}
      {descLine && (
        <foreignObject
          x={Math.min(sourceX, targetX)}
          y={descY}
          width={Math.abs(targetX - sourceX) || 200}
          height={16}
          style={{ overflow: 'visible', pointerEvents: 'all' }}
        >
          <div style={{
            fontSize: '10px', fontStyle: 'italic',
            color: 'var(--vscode-descriptionForeground)',
            whiteSpace: 'nowrap', textAlign: 'center',
            display: 'inline-block', position: 'relative',
            left: '50%', transform: 'translateX(-50%)', opacity: 0.85,
          }}>
            {descLine}
          </div>
        </foreignObject>
      )}
      {/* Source label (event) — bold, clickable */}
      {srcLabel && (
        <foreignObject x={srcLabelX} y={labelY} width={150} height={18} style={{ overflow: 'visible', pointerEvents: 'all' }}>
          <div
            style={{
              fontSize: '11px', fontWeight: 700, color, whiteSpace: 'nowrap',
              textAlign: isLeftToRight ? 'right' : 'left',
              background: 'var(--vscode-editor-background)', padding: '0 2px',
              display: 'inline-block', float: isLeftToRight ? 'right' : 'left',
              ...(srcPath ? clickable : {}),
            }}
            onClick={srcPath ? () => findReferences(eventName || srcLabel) : undefined}
          >
            {srcLabel}
          </div>
        </foreignObject>
      )}
      {/* Target label (method(param)) — bold, clickable */}
      {tgtLabel && (
        <foreignObject x={tgtLabelX} y={labelY} width={150} height={18} style={{ overflow: 'visible', pointerEvents: 'all' }}>
          <div
            style={{
              fontSize: '11px', fontWeight: 700, color, whiteSpace: 'nowrap',
              textAlign: isLeftToRight ? 'left' : 'right',
              background: 'var(--vscode-editor-background)', padding: '0 2px',
              display: 'inline-block', float: isLeftToRight ? 'left' : 'right',
              ...(tgtPath ? clickable : {}),
            }}
            onClick={tgtPath ? () => openFile(`${tgtPath}/${mainFileName}`, methodName || tgtLabel) : undefined}
          >
            {tgtLabel}
          </div>
        </foreignObject>
      )}
      {/* Event type — below event label, clickable */}
      {eventType && (
        <foreignObject x={srcLabelX} y={typeY} width={150} height={16} style={{ overflow: 'visible', pointerEvents: 'all' }}>
          <div
            style={{
              fontSize: '10px', fontWeight: 400, color, opacity: 0.75,
              whiteSpace: 'nowrap',
              textAlign: isLeftToRight ? 'right' : 'left',
              display: 'inline-block', float: isLeftToRight ? 'right' : 'left',
              padding: '0 2px', cursor: 'pointer',
            }}
            onClick={() => openFile(`${srcPath}/${typeFileName}`, eventType)}
          >
            {eventType}
          </div>
        </foreignObject>
      )}
      {/* Method param type — below method label, clickable */}
      {methodParamType && (
        <foreignObject x={tgtLabelX} y={typeY} width={150} height={16} style={{ overflow: 'visible', pointerEvents: 'all' }}>
          <div
            style={{
              fontSize: '10px', fontWeight: 400, color, opacity: 0.75,
              whiteSpace: 'nowrap',
              textAlign: isLeftToRight ? 'left' : 'right',
              display: 'inline-block', float: isLeftToRight ? 'left' : 'right',
              padding: '0 2px', cursor: 'pointer',
            }}
            onClick={() => openFile(`${tgtPath}/${typeFileName}`, methodParamType)}
          >
            {methodParamType}
          </div>
        </foreignObject>
      )}
      {/* Pipe label — centered on arrow, each algorithm name clickable */}
      {pipeLabel && (() => {
        const algoNames = pipeLabel.split(' | ');
        const algoDir = algorithmDirs[0] || 'src/algorithms';
        const midX = (sourceX + targetX) / 2;
        const labelWidth = Math.max(Math.abs(targetX - sourceX) * 0.8, algoNames.length * 120);
        return (
          <foreignObject
            x={midX - labelWidth / 2}
            y={labelY}
            width={labelWidth}
            height={18}
            style={{ overflow: 'visible', pointerEvents: 'all' }}
          >
            <div style={{
              fontSize: '10px', fontWeight: 400, color,
              textAlign: 'center', background: 'var(--vscode-editor-background)',
              padding: '0 3px', display: 'inline-block', position: 'relative',
              left: '50%', transform: 'translateX(-50%)', opacity: 0.85,
            }}>
              {algoNames.map((name, i) => (
                <React.Fragment key={i}>
                  {i > 0 && ' '}
                  <span
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => {
                      const algoName = name.replace(/\(\)$/, '');
                      openFile(`${algoDir}/${algoName}/${mainFileName}`, algoName);
                    }}
                  >
                    {name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </foreignObject>
        );
      })()}
    </>
  );
}
