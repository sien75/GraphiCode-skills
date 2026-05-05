/**
 * Algorithm nodes are pure functions that transform data in the flow pipeline.
 *
 * Each algorithm:
 * - Is one function per directory — the directory name is the algorithm ID
 * - Exports a single default function (export default)
 * - Receives { logs, payload } and returns a transformed value
 * - Must be a pure function — no side effects, no state access, no I/O
 * - Only describes how input data becomes output data
 * - Never references states or flows
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

// --- Example algorithm ---
// Directory: algorithms/extractUsername/
// File: algorithms/extractUsername/index.ts
// Signature: (submit payload) -> string
const extractUsername = ({ payload }: PipeContext<{ username: string; password: string }>): string => {
  return payload.username;
};

export default extractUsername;