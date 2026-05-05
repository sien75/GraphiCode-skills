# GraphiCode Skills

This repository contains AI skills for **GraphiCode** — a programming tool where the **flow DSL is the connection-layer SSOT** (Single Source of Truth). GraphiCode lets you design architecture visually and generates connection code from the flow DSL, ensuring code never drifts from the architecture.

## Skill Organization

Skills are organized into three groups, mirroring a team structure:

### Dev Group (研发组)

Designs architecture and generates connection-layer code.

| Skill | Description |
|-------|-------------|
| `dev-architect` | Works interactively with the user to design flows, states, and algorithms. The human architect steers; the agent proposes. |
| `dev-assembler-ts` | Generates TypeScript connection code from flow DSL (README.yaml). Translates YAML sequence diagrams into executable `Flow` classes. |

### QA Group (质检组)

Validates that outputs conform to the DSL specification and behave correctly.

| Skill | Description |
|-------|-------------|
| `qa-linter-ts` | Validates flow DSL schema compliance and type compatibility across module connections. The "compiler" for the flow layer. |
| `qa-tester-ts-browser` | Writes and executes tests for TypeScript modules in browser (React/DOM) environments. |
| `qa-tester-ts-bun` | Writes and executes tests for TypeScript modules in Bun runtime environments. |

### Infra Group (基建组)

Sets up project scaffolding and runtime environments.

| Skill | Description |
|-------|-------------|
| `infra-init-ts-browser` | Initializes a GraphiCode-managed TypeScript project for browser (React + Node.js) environments. |
| `infra-init-ts-bun` | Initializes a GraphiCode-managed TypeScript project for Bun runtime environments. |

## Core Concepts

- **Flow DSL** (YAML sequence diagram): The connection-layer SSOT. Defines how modules connect — events, pipes, calls, then/catch routing.
- **State**: Modules with internal state, methods, and events. The only place where side effects live.
- **Algorithm**: Pure functions that transform data. No side effects.
- **Assembler**: Generates `Flow` classes from YAML — the bridge between architecture design and running code.
- **Linter**: Ensures flow YAML conforms to the DSL schema and module connections are type-safe.

## Typical Workflow

1. **infra-init** — Scaffold the project
2. **dev-architect** — Design flows, states, and algorithms interactively
3. **dev-assembler-ts** — Generate connection code from flow YAML
4. **qa-linter-ts** — Validate flow DSL and type compatibility
5. **qa-tester** — Write and run tests for modules and flows

## Version History

May 1, 2026, 0.1.0 — Restructured into dev/qa/infra groups, added qa-linter-ts, renamed skills
March 10, 2026, 0.0.1-alpha.1 — Initial release