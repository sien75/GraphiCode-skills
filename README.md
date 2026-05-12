# Flow-Driven Architecture Skills

This repository contains Agent skills for designing software architecture where the **flow DSL is the connection-layer SSOT** (Single Source of Truth). The flow DSL lets you define how modules connect — via events, pipes, and calls — and generates the connection code, ensuring the implementation never drifts from the architecture.

## Why Flow-Driven?

Code is becoming a compilation target. These skills move control from syntax to intent: **humans own the flow** (how modules connect, what data flows where), **AI owns the implementation** (state logic, algorithms, wiring). When the flow changes, the code regenerates; when you review, you review architecture, not call chains.

This is not "generate diagrams from existing code" — diagrams derived from code always drift. Here the flow **drives** the code, making the architecture the single source of truth. The result: systems understood in hours, changes reviewed at the intent layer, and complex execution logic tamed without ever tracing a stack frame.

## Skill Organization

Skills are organized into three groups, mirroring a team structure:

### Dev Group

Designs architecture and generates connection-layer code.

| Skill | Description |
|-------|-------------|
| `dev-architect` | Works interactively with the user to design flows, states, and algorithms. Also generates connection code from flow DSL (README.yaml). Language-specific via `<lang>` references. |

### QA Group

Validates that outputs conform to the DSL specification and behave correctly.

| Skill | Description |
|-------|-------------|
| `qa-linter` | Validates flow DSL schema compliance and type compatibility across module connections. The "compiler" for the flow layer. |
| `qa-tester` | Writes and executes tests for modules. Language/runtime-specific via `<category>-<runtimeEnv>.md` references. |

### Infra Group

Sets up project scaffolding and runtime environments.

| Skill | Description |
|-------|-------------|
| `infra-init` | Initializes a project with flow DSL support. Language/runtime-specific via `config-<runtimeEnv>.md` and `assets/<language>-<runtimeEnv>/`. |

## Core Concepts

- **Flow DSL** (YAML sequence diagram): The connection-layer SSOT. Defines how modules connect — events, pipes, calls, then/catch routing.
- **State**: Modules with internal state, methods, and events. The only place where side effects live.
- **Algorithm**: Pure functions that transform data. No side effects.
- **Code generation**: The architect generates `Flow` classes from YAML — the bridge between architecture design and running code.
- **Linter**: Ensures flow YAML conforms to the DSL schema and module connections are type-safe.

## Typical Workflow

1. **infra-init** — Scaffold the project
2. **dev-architect** — Design flows, states, and algorithms interactively; generate connection code from flow YAML
3. **qa-linter** — Validate flow DSL and type compatibility
4. **qa-tester** — Write and run tests for modules and flows

## Version History

| Date | Version | Changes |
|------|---------|---------|
| May 12, 2026 | 0.0.1-alpha.4 | VS Code extension, merge dev-assembler into dev-architect, linter Phase 3, launcher reminder |
| May 6, 2026 | 0.0.1-alpha.3 | Multi-language asset dirs, code-example references, ext click nav |
| May 1, 2026 | 0.0.1-alpha.2 | Dev/qa/infra groups, qa-linter, skill renames |
| March 10, 2026 | 0.0.1-alpha.1 | Initial release |
