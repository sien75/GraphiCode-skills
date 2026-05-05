/**
 * Algorithm nodes are pure functions that transform data in the flow pipeline.
 *
 * Each algorithm:
 * - Receives { logs, payload } and returns a transformed value
 * - Must be a pure function — no side effects, no state access, no I/O
 * - Only describes how input data becomes output data
 * - Never references states or flows
 * - Group similar algorithms in the same file (e.g., all validation functions together, all transform functions together)
 *
 * In the flow, algorithms are chained in a pipe:
 *   event → algo1 → algo2 → ... → method(param)
 * Each step's output becomes the next step's payload.
 *
 * Key distinction from State:
 * - Algorithm = pure logic (input → output, no side effects)
 * - State = side effects (I/O, storage, DOM, network, etc.)
 * All side effects belong in State nodes; Algorithm nodes handle only data transformation.
 */

// --- Pipe context type (provided by the flow runtime) ---
type Logs = Map<number, any[]>;
type PipeContext<T = any> = { logs: Logs; payload: T };

// --- Example: extract a field from event payload ---
// Signature: (submit payload) -> string
const extractUsername = ({ payload }: PipeContext<{ username: string; password: string }>): string => {
  return payload.username;
};

// --- Example: validate and transform data ---
// Signature: (raw token) -> validated token
const validateToken = ({ payload }: PipeContext<string>): { token: string; valid: boolean } => {
  return {
    token: payload,
    valid: payload.length > 0 && payload.length <= 256,
  };
};

// --- Example: combine data from logs and payload ---
// Signature: (partial result) -> enriched result
const enrichResult = ({ logs, payload }: PipeContext<{ id: string }>): { id: string; source: string } => {
  const source = logs.get(0)?.[0]?.source ?? 'unknown';
  return { ...payload, source };
};

export { extractUsername, validateToken, enrichResult };
