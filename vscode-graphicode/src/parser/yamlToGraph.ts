import * as yaml from "js-yaml";
import type { Node, Edge } from "reactflow";
import type { StateTypeInfo } from "./readmeParser";

interface Participant {
  name: string;
  path: string;
}

interface Connection {
  id: number;
  description?: string;
  on: { state?: string; event: string };
  pipe?: string[];
  call?: { state: string; method: string; param?: string };
  then?: ThenCatch | ThenCatch[] | { event: string };
  catch?: ThenCatch | ThenCatch[] | { event: string };
}

interface ThenCatch {
  state: string;
  method: string;
  param?: string;
  pipe?: string[];
  then?: ThenCatch | ThenCatch[] | { event: string };
  catch?: ThenCatch | ThenCatch[] | { event: string };
}

interface FlowYaml {
  type: string;
  participants: Participant[];
  connections: Connection[];
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  participants: Participant[];
}

const PARTICIPANT_WIDTH = 160;
const PARTICIPANT_GAP = 60;
const HEADER_HEIGHT = 60;
const STEP_HEIGHT = 80;
const LIFELINE_START_Y = HEADER_HEIGHT + 20;

export function yamlToGraph(
  yamlStr: string,
  typeInfoMap?: Map<string, StateTypeInfo>
): GraphData {
  const doc = yaml.load(yamlStr) as FlowYaml;
  if (!doc || !doc.participants || !doc.connections) {
    return { nodes: [], edges: [], participants: [] };
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const participantIndex = new Map<string, number>();
  doc.participants.forEach((p, i) => {
    participantIndex.set(p.name, i);
  });

  // Build path lookup
  const participantPath = new Map<string, string>();
  doc.participants.forEach((p) => {
    participantPath.set(p.name, p.path);
  });

  const hasBroadcastSource = doc.connections.some((c) => !c.on.state);
  const hasBroadcastTarget = doc.connections.some((c) => {
    return isBroadcastThenCatch(c.then) || isBroadcastThenCatch(c.catch);
  });
  const needsEventBus = hasBroadcastSource || hasBroadcastTarget;

  if (needsEventBus && !participantIndex.has("__EventBus__")) {
    participantIndex.set("__EventBus__", participantIndex.size);
  }

  for (const [name, idx] of participantIndex) {
    const isEventBus = name === "__EventBus__";
    const participant = doc.participants.find((p) => p.name === name);
    const x = idx * (PARTICIPANT_WIDTH + PARTICIPANT_GAP);

    nodes.push({
      id: `participant-${name}`,
      type: "participantNode",
      position: { x, y: 0 },
      data: {
        name: isEventBus ? "EventBus" : name,
        path: isEventBus ? "global" : participant?.path ?? "",
      },
      draggable: false,
    });
  }

  let stepIndex = 0;

  function getX(stateName: string): number {
    const idx = participantIndex.get(stateName) ?? 0;
    return idx * (PARTICIPANT_WIDTH + PARTICIPANT_GAP) + PARTICIPANT_WIDTH / 2;
  }

  function lookupEventType(stateName: string, eventName: string): string | undefined {
    if (!typeInfoMap) return undefined;
    const info = typeInfoMap.get(stateName);
    if (!info) return undefined;
    const ev = info.events.get(eventName);
    return ev?.type;
  }

  function lookupMethodParamType(stateName: string, methodName: string, paramName: string): string | undefined {
    if (!typeInfoMap) return undefined;
    const info = typeInfoMap.get(stateName);
    if (!info) return undefined;
    const meth = info.methods.get(methodName);
    if (!meth) return undefined;
    const p = meth.params.find((pp) => pp.name === paramName);
    return p?.type;
  }

  interface EdgeExtra {
    eventType?: string;
    methodParamType?: string;
    sourceParticipantPath?: string;
    targetParticipantPath?: string;
    eventName?: string;
    methodName?: string;
  }

  function addStep(
    sourceState: string,
    targetState: string,
    sourceLabel: string,
    targetLabel: string,
    pipeLabel: string,
    edgeType: "connection" | "then" | "catch",
    description?: string,
    connId?: number,
    extra?: EdgeExtra
  ) {
    const y = LIFELINE_START_Y + stepIndex * STEP_HEIGHT;
    const srcId = `anchor-${stepIndex}-src`;
    const tgtId = `anchor-${stepIndex}-tgt`;

    nodes.push({
      id: srcId,
      type: "anchorNode",
      position: { x: getX(sourceState) - 4, y },
      data: {},
      draggable: false,
    });
    nodes.push({
      id: tgtId,
      type: "anchorNode",
      position: { x: getX(targetState) - 4, y },
      data: {},
      draggable: false,
    });

    const isLeftToRight =
      (participantIndex.get(sourceState) ?? 0) <=
      (participantIndex.get(targetState) ?? 0);

    edges.push({
      id: `edge-${stepIndex}`,
      source: srcId,
      target: tgtId,
      sourceHandle: isLeftToRight ? "right" : "left",
      targetHandle: isLeftToRight ? "left" : "right",
      type: "connectionEdge",
      data: { sourceLabel, targetLabel, pipeLabel, edgeType, description, connId, ...extra },
    });

    stepIndex++;
  }

  function processThenCatch(
    tc: ThenCatch | ThenCatch[] | { event: string } | undefined,
    sourceState: string,
    type: "then" | "catch"
  ) {
    if (!tc) return;

    if (Array.isArray(tc)) {
      for (const target of tc) {
        const pipe = target.pipe ? target.pipe.join(" | ") : "";
        const methodParamType = target.param
          ? lookupMethodParamType(target.state, target.method, target.param)
          : undefined;
        const extra: EdgeExtra = {
          methodParamType,
          targetParticipantPath: participantPath.get(target.state),
          methodName: target.method,
        };
        addStep(sourceState, target.state, type, `${target.method}(${target.param ?? ""})`, pipe, type, undefined, undefined, extra);
        processThenCatch(target.then, target.state, "then");
        processThenCatch(target.catch, target.state, "catch");
      }
    } else if ("event" in tc) {
      addStep(sourceState, "__EventBus__", type, `emit ${tc.event}`, "", type);
    } else {
      const pipe = tc.pipe ? tc.pipe.join(" | ") : "";
      const methodParamType = tc.param
        ? lookupMethodParamType(tc.state, tc.method, tc.param)
        : undefined;
      const extra: EdgeExtra = {
        methodParamType,
        targetParticipantPath: participantPath.get(tc.state),
        methodName: tc.method,
      };
      addStep(sourceState, tc.state, type, `${tc.method}(${tc.param ?? ""})`, pipe, type, undefined, undefined, extra);
      processThenCatch(tc.then, tc.state, "then");
      processThenCatch(tc.catch, tc.state, "catch");
    }
  }

  for (const conn of doc.connections) {
    const sourceState = conn.on.state ?? "__EventBus__";
    const pipe = conn.pipe ? conn.pipe.join(" | ") : "";

    if (conn.call) {
      const paramStr = conn.call.param ? conn.call.param : "";
      const eventType = lookupEventType(sourceState, conn.on.event);
      const methodParamType = conn.call.param
        ? lookupMethodParamType(conn.call.state, conn.call.method, conn.call.param)
        : undefined;
      const extra: EdgeExtra = {
        eventType,
        methodParamType,
        sourceParticipantPath: participantPath.get(sourceState),
        targetParticipantPath: participantPath.get(conn.call.state),
        eventName: conn.on.event,
        methodName: conn.call.method,
      };
      addStep(sourceState, conn.call.state, conn.on.event, `${conn.call.method}(${paramStr})`, pipe, "connection", conn.description, conn.id, extra);
      processThenCatch(conn.then, conn.call.state, "then");
      processThenCatch(conn.catch, conn.call.state, "catch");
    } else {
      processThenCatch(conn.then, sourceState, "then");
      processThenCatch(conn.catch, sourceState, "catch");
    }
  }

  const totalHeight = LIFELINE_START_Y + stepIndex * STEP_HEIGHT + 40;
  for (const [name, idx] of participantIndex) {
    const x = idx * (PARTICIPANT_WIDTH + PARTICIPANT_GAP) + PARTICIPANT_WIDTH / 2 - 1;
    nodes.push({
      id: `lifeline-${name}`,
      type: "lifelineNode",
      position: { x, y: HEADER_HEIGHT },
      data: { height: totalHeight - HEADER_HEIGHT },
      draggable: false,
    });
  }

  return { nodes, edges, participants: doc.participants };
}

function isBroadcastThenCatch(
  tc: ThenCatch | ThenCatch[] | { event: string } | undefined
): boolean {
  if (!tc) return false;
  if (Array.isArray(tc)) return false;
  return "event" in tc && !("state" in tc);
}
