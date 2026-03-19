# state

## what is state node

State nodes have internal private state, and are the only place where a GraphiCode-managed project stores state.

State nodes have 2 types of methods for external interaction: method and event. Regardless of the method type, they all input/output serializable data.

## example

This example means that this state node file has:

1. three method-type methods `method1`, `method2`, and `method3`, where `method1`'s input is a `dir1/TypeX` data, `method2`'s does not have input, and `method3`'s input is `dir2/TypeD`. All method-type methods output `void`.
2. two event-type methods `event1` and `event2`, where `event1` sends a `dir1/TypeH` event and `event2` sends a `dir1/TypeI` event via callbacks.
3. the description of this state is explained under the description heading

```md
# method
method1: (x: dir1/TypeX) -> void
method2: () -> void
method3: (d: dir2/TypeD) -> void
method4: (options: dir2/TypeOptions) -> void

# event
event1: (cb: (h: dir1/TypeH) -> void) -> void
event2: (cb: (i: dir1/TypeI) -> void) -> void


# resides-in
memory

# description
This state is a memory state, which means...
```

Here `dir1/TypeA` is a type ID with its directory prefix. The directory corresponds to one of the `typeDirs` in `graphig.md`, and the type details are defined there, which you need to look up accordingly.

## Parameter and Option Constraints

* **Method Parameters**: `method` types **cannot** have optional parameters (e.g., `?`). If a method requires optional inputs, you must encapsulate them in an options object (e.g., `options: TypeOptions`). It's perfectly valid to pass an empty object (`{}`) if the type allows it, but the parameter itself cannot be optional.
* **Event Callbacks**: Events **must** pass strictly **one** parameter. No optional parameters are allowed in event callbacks either. For example: `event: (cb: (data: TypeData) -> void) -> void`.

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

## important notes

**Important: When writing state descriptions, always maintain mapping thinking.**

Mapping thinking means that no matter what the state is, it must correspond to a concrete entity. In other words, you must clearly specify where this state resides, for example: ordinary in-memory state, persistent state on disk, or state in a database, etc.

When writing states, **do not mention algorithms or flows**. States should only depend on types.

**Check `rumtimeEnv` to determine which resides-in options apply.**

Not all resides-in options are available in every runtime environment. You must check the `runtimeEnv` field in `graphig.md` to determine which options apply. For example, in a Browser runtime, only the `browser-` prefixed options (browser-BOM, browser-DOM, browser-storage) are available, while options like `disk`, `stdout/stdin`, and `hardware` are not.

If the required resides-in is not covered by the list above, you may **define a custom one as appropriate**.

