# state

## what is state node

State nodes have internal private state, and are the only place where a GraphiCode-managed project stores state.

State nodes have 2 types of members for external interaction: method and event. Regardless of the member type, they all input/output serializable data.

- **method**: receives parameters, returns a value (or throws an error). Methods must **not** publish events — all result distribution (unicast, multicast, broadcast) is handled by the flow layer via `then`/`catch`.
- **event**: self-originated occurrences that the state initiates on its own (e.g., user actions, timers, lifecycle). Event names must use the format `StateClassName.eventName` (e.g., `UserPage.click`, `Timer.tick`).

## example

This example means that this state node file has:

1. types defined locally: `MyOptions`, `MyResult` — these are the state's own types, used by its methods and events.
2. four methods: `method1` takes `MyOptions` and returns `MyResult`, `method2` takes no input and returns `void`, etc.
3. two self-originated events: `MyState.event1` emits `EventData` data, `MyState.event2` emits `string` data.
4. the description of this state is explained under the description heading.

```md
# type
MyOptions: { key: string, value: any }
MyResult: { success: boolean, data: any }
EventData: { id: string, timestamp: number }

# method
method1: (options: MyOptions) -> MyResult
method2: () -> void
method3: (d: string) -> void

# event
MyState.event1: EventData
MyState.event2: string

# resides-in
memory

# description
This state is a memory state, which means...
```

Types are defined inside each state's README under the `# type` section. Each state owns its types — no external type directories. If multiple states need similar types, define them independently in each state but keep them consistent by referencing other states' definitions when writing.

Methods only return values or throw errors. They do **not** publish events. All result distribution is handled by the flow layer.

Events are self-originated only — things the state initiates on its own (user actions, timers, lifecycle). Event names use the `StateClassName.eventName` format to avoid naming conflicts.

## Parameter and Option Constraints

* **Method Parameters**: `method` types **cannot** have optional parameters (e.g., `?`). If a method requires optional inputs, you must encapsulate them in an options object (e.g., `options: TypeOptions`). It's perfectly valid to pass an empty object (`{}`) if the type allows it, but the parameter itself cannot be optional.
* **Event Data**: Each event emits exactly **one** data type. For example: `MyState.dataLoaded: EventData`.

## resides-in

`state` in GraphiCode is more generalized than the conventional understanding of "state". All stateful entities in the project, such as in-memory data, disk data, database data, network req/res, display data, etc., **must and can only be managed by `state`**.

Resides-in list:

* **memory** — in-memory runtime data, such as variables, caches, application state
* **disk** — local file system, such as config files, log files, temp files
* **database** — relational or non-relational databases, such as SQLite, PostgreSQL, MongoDB, Redis
* **network** — remote services or APIs, such as HTTP endpoints, WebSocket connections, RPC services
* **browser-BOM** — browser BOM APIs, such as window, navigator, location, history, setTimeout/setInterval, Web Workers
* **browser-DOM** — browser DOM elements, such as React components, HTML elements
* **browser-storage** — browser-side persistent storage, such as localStorage, sessionStorage, cookies, IndexedDB
* **environment** — system environment, such as environment variables, system config, CLI arguments
* **hardware** — hardware devices, such as sensors, USB devices, camera, microphone
* **stdout/stdin** — standard I/O streams

## Built-in Members

Every state automatically has the following built-in members. They do not need to be declared in state README files:

| type | signature | description |
|------|-----------|-------------|
| method | `enable(): void` | activate state |
| method | `disable(): void` | deactivate state |
| method | `getState(): any` | get all state data |
| method | `isEnabled(): boolean` | check whether the state is currently enabled |
| event | `StateClassName.enabledChange: boolean` | emitted when enabled flag changes |

## important notes

**Important: When writing state descriptions, always maintain mapping thinking.**

Mapping thinking means that no matter what the state is, it must correspond to a concrete entity. In other words, you must clearly specify where this state resides, for example: ordinary in-memory state, persistent state on disk, or state in a database, etc.

When writing states, **do not mention algorithms or flows**. States define their own types locally.

**Check `rumtimeEnv` to determine which resides-in options apply.**

Not all resides-in options are available in every runtime environment. You must check the `runtimeEnv` field in `graphig.md` to determine which options apply. For example, in a Browser runtime, only the `browser-` prefixed options (browser-BOM, browser-DOM, browser-storage) are available, while options like `disk`, `stdout/stdin`, and `hardware` are not.

If the required resides-in is not covered by the list above, you may **define a custom one as appropriate**.

