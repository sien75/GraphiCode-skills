# Type Validation Rules

This document defines the rules for validating type compatibility across module connections in GraphiCode's flow layer.

## Overview

Type validation ensures that data flowing through connections is type-safe. It checks:

1. **Pipe type chains**: Input → algorithm → algorithm → ... → call parameter
2. **Then/catch type chains**: Method return type → then/catch parameter
3. **Parameter collection**: Multiple connections filling the same method's parameters

## Type sources

All type information comes from source code:

- **State events**: inferred from `_publish` calls in the state source file — the second argument's type is the event data type
- **State methods**: parsed from method declarations in the state class — parameter names/types and return type
- **Algorithm I/O**: parsed from the algorithm's default export function signature — input from `PipeContext<T>` generic, output from return type
- **State type definitions**: `<typeFileName>` (e.g., `types.ts`) in each state's directory (referenced by `graphig.md`)

## Rule 1: Pipe type chain

A connection's `pipe` transforms data from the event through a chain of algorithms before reaching the `call` parameter.

```
event data type → algorithm_1 → algorithm_2 → ... → call.param type
```

For each step:
1. The source type must be assignable to the algorithm's input type
2. The algorithm's output type becomes the source for the next step
3. The final algorithm's output type must be assignable to `call.param`'s declared type

If no `pipe` is present, the event data type must be directly assignable to `call.param`'s type.

If `call.param` is omitted (zero-parameter method), the pipe output is ignored (method executes immediately on event).

## Rule 2: Then/catch type chain

### Then

```
call.method return type → [then.pipe] → then.param type
```

1. The method's return type (from the state source file method declaration) must be assignable to the first algorithm in `then.pipe`, or directly to `then.param` if no pipe
2. If `then.pipe` exists, the final pipe output must be assignable to `then.param`'s type
3. If `then` is multicast, each target's `param` type is validated independently
4. If `then` is broadcast, the method's return type is the broadcast event's data type (no further validation needed)

### Catch

```
thrown error type → [catch.pipe] → catch.param type
```

Same rules as then, but the source type is the error type from the method's `catch` clause or `any` if not specified.

## Rule 3: Nested then/catch chains

When `then` or `catch` targets have their own `then`/`catch`, validate recursively:

```
A.call → B.method → [B.then] → C.method → [C.then] → D.method
```

Each link in the chain must satisfy the type rules above.

## Rule 4: Parameter collection

When multiple connections fill parameters of the same method:

1. All `call.param` names for the same `(state, method)` pair must match the method's declared parameter names
2. No two connections in the same flow should fill the same parameter of the same method (this would cause overwrites at runtime)
3. Every required parameter of the method must be covered by at least one connection (otherwise the method will never execute)

## Type compatibility rules

- **Exact match**: `string` ↔ `string` — compatible
- **Structural subtyping**: `{ a: string, b: number }` is assignable to `{ a: string }` — compatible
- **`any`**: Assignable to and from anything, but generates a **warning** (type safety is lost)
- **Missing type info**: If a state source file doesn't specify a type or uses an unresolvable type reference, generate a **warning** rather than a failure
- **Primitive widening**: `number` is not assignable to `string` — incompatible

## Severity levels

| Level | Meaning |
|-------|---------|
| ERROR | Type mismatch that will cause runtime errors. Fails the lint. |
| WARN | Type information is incomplete or uses `any`. Passes the lint but should be reviewed. |
| INFO | Informational note, no action needed. |

## Reporting format

For each type validation check:

```
[ERROR] Pipe type mismatch in connection #0: algorithm "extractToken" expects TokenResponse but receives ApiResponse
[WARN]  Type "any" used in connection #2 pipe — type safety cannot be verified
[INFO]  Method "login" has 2 parameters, covered by 2 connections (#0, #1)
```