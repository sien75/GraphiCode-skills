# state

## what is state node

State nodes have internal private state, and are the only place where a GraphiCode-managed project stores state.

State nodes have 3 types of methods for external interaction: read/write/event. Regardless of the method type, they all input/output serializable data.

## example

This example means that this state node file has:

1. two read-type methods readData1 and readData2, where readData1's input is a dir1/TypeX data and output is a dir1/TypeA data, and readData2's does not have input and output is dir1/TypeB and dir1/TypeC data
2. two write-type methods writeData1 and writeData2, where writeData1's input is dir2/TypeD and writeData2's input is dir2/TypeE, dir2/TypeF and dir2/TypeG
3. two event-type methods onEvent1 and onEvent2, where onEvent1 sends a dir1/TypeH event and onEvent2 sends a dir1/TypeI event
4. the description of this state is explained under the description heading

```md
# read
## readData1
> dir1/TypeX
dir1/TypeA
## readData2
dir1/TypeB
dir1/TypeC

# write
## writeData1
dir2/TypeD
## writeData2
dir2/TypeE
dir2/TypeF
dir2/TypeG

# event
## onEvent1
dir1/TypeH
## onEvent2
dir1/TypeI

# resides-in
memory

### description
This state is a memory state, which means...
```

Here `dir1/TypeA` is a type ID with its directory prefix. The directory corresponds to one of the `typeDirs` in `graphig.json`, and the type details are defined there, which you need to look up accordingly.

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

Not all resides-in options are available in every runtime environment. You must check the `runtimeEnv` field in `graphig.json` to determine which options apply. For example, in a Browser runtime, only the `browser-` prefixed options (browser-BOM, browser-DOM, browser-storage) are available, while options like `disk`, `stdout/stdin`, and `hardware` are not.

If the required resides-in is not covered by the list above, you may **define a custom one as appropriate**.

