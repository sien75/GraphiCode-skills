# Code Validation Rules

This document defines the rules for validating module boundaries in GraphiCode's algorithm and state implementation code.

## Overview

Code validation ensures that algorithms and states respect their architectural boundaries. Algorithms are pure functions — they must not reach into states or other algorithms. States own side effects — they must not bypass the flow layer to call other states or algorithms directly.

All checks read actual source files (not READMEs) and rely on `graphig.md` to resolve `algorithmDirs` and `stateDirs` paths.

## Rule A1: Algorithm must not import state

Algorithms are pure data transformers with no side effects. They must not import or reference any module from directories listed in `stateDirs`.

**How to check:**
1. Read `graphig.md` to get `stateDirs` paths.
2. For each algorithm source file, scan import/require statements.
3. If any import path resolves to a directory under `stateDirs`, report an error.

**Error format:**
```
[ERROR] A1: Algorithm "extractToken" imports state module "services/Auth" — algorithms must not import states
```

**Rationale:** State modules contain side effects and runtime state. Importing them breaks the purity guarantee of algorithms and creates hidden coupling outside the flow layer.

## Rule A2: Algorithm must not import other algorithms

Each algorithm is an isolated pure function. Composition happens exclusively through flow `pipe` chains — algorithms must not import or call each other directly.

**How to check:**
1. Read `graphig.md` to get `algorithmDirs` paths.
2. For each algorithm source file, scan import/require statements.
3. If any import path resolves to another algorithm directory within `algorithmDirs`, report an error.

**Error format:**
```
[ERROR] A2: Algorithm "formatToken" imports algorithm "extractToken" — algorithms must not import each other; use flow pipe chains instead
```

**Rationale:** Algorithm composition belongs in the flow layer (pipe chains). Direct imports create invisible dependencies that bypass the flow DSL and break the connection-layer SSOT.

## Rule S1: State `_publish` event name format

When a state calls `_publish`, the event name (first argument) must follow the `StateClassName.eventName` format, where `StateClassName` matches the current state's class name.

**How to check:**
1. For each state source file, identify the class name (the class extending `State`).
2. Scan all `_publish` calls in the file.
3. If the first argument is a string literal, verify it matches `<ClassName>.<eventName>`.
4. If the first argument is not a string literal (e.g., a variable or expression), report a warning (cannot statically verify).

**Error format:**
```
[ERROR] S1: State "Auth" calls _publish("loginSuccess") — event name must follow "Auth.<eventName>" format (e.g., "Auth.loginSuccess")
[WARN]  S1: State "Auth" calls _publish with dynamic expression — cannot verify event name format statically
```

**Rationale:** The `StateClassName.eventName` format ensures events are namespaced and can be reliably cross-referenced in flow YAML `on.event` fields and state source code.

## Rule S2: State must not import other state instances

States must not import other state instances and call their methods directly. All cross-state communication must go through the flow layer (event → pipe → call → then/catch).

**How to check:**
1. Read `graphig.md` to get `stateDirs` paths.
2. For each state source file, scan import/require statements.
3. If any import path resolves to another state directory within `stateDirs`, report an error — unless the import is only for type references (e.g., `import type { ... }` in TypeScript).

**Error format:**
```
[ERROR] S2: State "Auth" imports state module "stores/TokenStore" — cross-state calls must go through the flow layer, not direct imports
```

**Rationale:** Direct state-to-state calls bypass the flow layer, creating hidden dependencies that are invisible in the flow DSL and cannot be validated for type safety or event routing.

## Rule S3: State must not import algorithms

Algorithms are invoked exclusively through flow `pipe` chains. States must not import or call algorithms directly.

**How to check:**
1. Read `graphig.md` to get `algorithmDirs` paths.
2. For each state source file, scan import/require statements.
3. If any import path resolves to a directory under `algorithmDirs`, report an error.

**Error format:**
```
[ERROR] S3: State "Auth" imports algorithm "extractToken" — algorithms must be invoked through flow pipe chains, not imported by states
```

**Rationale:** Algorithm invocation belongs in the flow layer. Direct imports bypass the type validation of pipe chains and break the connection-layer SSOT.

## Severity levels

Same as type validation:

| Level | Meaning |
|-------|---------|
| ERROR | Boundary violation that breaks the flow-layer SSOT. Fails the lint. |
| WARN | Cannot verify statically (e.g., dynamic `_publish` argument). Passes the lint but should be reviewed. |
| INFO | Informational note, no action needed. |

## Type-only imports (language-specific)

Some languages allow importing types without importing runtime values (e.g., TypeScript `import type`, Python `from typing import TYPE_CHECKING`). These are **allowed** — they do not create runtime dependencies and do not bypass the flow layer.

When checking A1, A2, S2, S3:
- TypeScript: `import type { ... }` is allowed; `import { ... }` is not.
- Python: `if TYPE_CHECKING:` guarded imports are allowed; top-level imports are not.
- For other languages, treat all imports as runtime imports unless the language has an explicit type-only import mechanism.