# GraphiCode Skills

This repository contains AI skills for **GraphiCode** — a programming tool where the **flow DSL is the connection-layer SSOT** (Single Source of Truth). GraphiCode lets you design architecture visually and generates connection code from the flow DSL, ensuring code never drifts from the architecture.

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
| `infra-init` | Initializes a GraphiCode-managed project. Language/runtime-specific via `config-<runtimeEnv>.md` and `assets/<language>-<runtimeEnv>/`. |

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
5. **qa-tester** — Write and run tests for modules and flows

## Version History

| Date | Version | Changes |
|------|---------|---------|
| May 12, 2026 | 0.0.1-alpha.4 | VS Code extension, merge dev-assembler into dev-architect, linter Phase 3, launcher reminder |
| May 6, 2026 | 0.0.1-alpha.3 | Multi-language asset dirs, code-example references, ext click nav |
| May 1, 2026 | 0.0.1-alpha.2 | Dev/qa/infra groups, qa-linter, skill renames |
| March 10, 2026 | 0.0.1-alpha.1 | Initial release |