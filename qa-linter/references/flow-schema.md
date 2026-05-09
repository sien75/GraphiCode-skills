# Flow DSL Schema Specification

This document defines the formal schema for GraphiCode's flow YAML format. The linter uses this as the source of truth for schema validation.

## Top-level structure

```yaml
type: sequence_diagram  # required, must be exactly "sequence_diagram"

participants:           # required, non-empty array
  - name: string        # required, unique within participants
    path: string        # required, non-empty

connections:            # required, non-empty array
  - id: number          # required, unique, consecutive starting from 0
    description: string # required, non-empty
    on: OnDef           # required
    pipe: PipeDef[]     # optional
    call: CallDef       # required
    then: ThenDef       # optional
    catch: ThenDef      # optional
```

## OnDef

```yaml
on:
  state: string   # optional — if present, references a participant name
  event: string   # required — event name
```

Rules:
- If `state` is present: `event` must follow `StateClassName.eventName` format, and `state` must match a participant `name`
- If `state` is absent: `event` is a broadcast event name (no `StateClassName.` prefix)

## CallDef

```yaml
call:
  state: string    # required — must reference a participant name
  method: string   # required — non-empty
  param: string    # optional — if present, non-empty
```

## PipeDef

```yaml
pipe:
  - algorithmName()   # each entry is a function call string ending with ()
```

Rules:
- Each algorithm name (without `()`) must correspond to an existing algorithm in the project

## ThenDef / CatchDef

Three modes:

### Unicast

```yaml
then:
  state: string      # required — participant name
  method: string     # required
  param: string      # optional
  pipe: PipeDef[]    # optional
  then: ThenDef      # optional — nested
  catch: ThenDef     # optional — nested
```

### Multicast

```yaml
then:
  - state: string    # each element is a unicast def (no broadcast in array)
    method: string
    param: string
    pipe: PipeDef[]
    then: ThenDef
    catch: ThenDef
```

### Broadcast

```yaml
then:
  event: string      # event name published to global EventBus
```

Detection rule:
- Array → multicast
- Object with `event` field → broadcast
- Object with `state` field → unicast

## ID rules

- Connection IDs must be unique within a flow
- Connection IDs must be consecutive integers starting from 0
- No gaps allowed (0, 1, 2, 3 — not 0, 2, 5)

## Cross-reference rules

- Every `state` reference in `on`, `call`, `then`, `catch` must match a participant `name`
- Every algorithm name in `pipe` must exist in the project's `algorithmDirs`
- Every `call.method`, `then.method`, `catch.method` must exist as a method declaration in the referenced state's source file
- Every `on.event` (with `state`) must correspond to an event published by the referenced state (via `_publish` calls in its source file)
- Broadcast event names must not conflict with `StateClassName.eventName` patterns