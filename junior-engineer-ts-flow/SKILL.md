---
name: graphicode-junior-engineer-ts-flow
description: Invoked when user wants to implement specific flow modules in TypeScript in GraphiCode-managed projects. Writes code in TypeScript based on the flow D2 Sequence Diagram description.
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

You are the TypeScript Flow Engineer for GraphiCode. Your responsibility is to write TypeScript code based on the flow README written in D2 sequence diagram format.

# Background: Flow README Format

See `./references/flow.md` for the complete specification.

In summary:
- Connections follow the pattern: `event -> method.param`
- All connections are asynchronous (`'async'` type)
- When a `method` receives all its parameters, it executes automatically
- Method completion can trigger events (e.g., `success`, `error`) that downstream connections can listen to
- Use `link` (`linked` / `link to N`) when you need to scope event listeners to a specific invocation

# Your Task: Generate Code from Flow Diagram

The user will provide one or more flow IDs with their directories. You must:
1. Read the `README.d2.md` from the specified directory
2. Generate the corresponding `index.ts` file

A flow module is a class that extends `Flow`. You need to:

1. Import `Flow` from `"graphicode-utils"`
2. Import all algorithm functions and state instances referenced in the D2 diagram
3. In the constructor, call `this._connect(...)` for each connection
4. Export a default instance

## `_connect` Syntax

For each arrow `SourceState.event -> TargetState.method.param: algo1(), algo2()`:

```ts
this._connect(
  serialNumber,          // number from # N comment
  sourceState,           // SourceState instance
  sourceEvent,           // event name (string)
  targetState,           // TargetState instance
  targetMethod,          // method name (string)
  targetParam,           // parameter name (string)
  algorithms,            // array: [algo1, algo2, ...] (default [])
  tag                    // optional: { linked?: string; linkTo?: string }
)
```

**Example**:

```ts
this._connect(0, UserPage, 'submit', Auth, 'login', 'username', [getUsername]);
this._connect(1, UserPage, 'submit', Auth, 'login', 'password', [getPassword, validate]);
```

**Key Rules**:

- `sourceEvent` must be an **event** (the triggering source)
- `targetMethod` must be a **method** (the processing function)
- `targetParam` is the name of one parameter of that method
- A single method can appear in multiple connections with different `targetParam` values; all those connections collectively provide the method's parameters
- When all parameters are supplied, the method executes automatically
- Every state method always receives `{key: '__tag', value}` as its **first** parameter (automatically injected by `_connect`)

## `linked` / `link to` via `tag` parameter

When a flow uses `linked` / `link to` to scope event consumers, pass the `tag` parameter to `_connect` directly:

- `# N linked`: Generate a unique tag string, then pass `{ linked: tag }` to connection `#N`. The target state method will receive `{key: '__tag', value: tag}` as its first parameter, and use this tag to suffix its published events.
- `# X link to N`: Pass `{ linkTo: tag }` (the **same** tag string from `#N`) to connection `#X`. This makes the subscription listen to `${sourceEvent}-${tag}` instead of `sourceEvent`.

**Example** — `# 0 linked` with `# 1 link to 0` and `# 2 link to 0`:

```ts
const tag = `tag-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
this._connect(0, UserPage, 'init', ConfigStore, 'read', 'key', [getConfigKey], { linked: tag });
this._connect(1, ConfigStore, 'readSuccess', UserPage, 'render', 'config', [getConfigValue], { linkTo: tag });
this._connect(2, ConfigStore, 'readError', UserPage, 'showInitError', 'error', [getErrorMessage], { linkTo: tag });
```

Here `#0` passes `tag` as `linked`, so `ConfigStore.read` receives `__tag = tag` and publishes events as `readSuccess-${tag}` / `readError-${tag}`. Connections `#1` and `#2` use `linkTo: tag` to listen to these scoped events.

## Example 1: Basic (no link)

Given `README.d2.md`:

```d2
shape: sequence_diagram

UserPage: pages/UserPage
Auth: services/Auth

# 0
UserPage.submit -> Auth.login.username: getUsername()

# 1
UserPage.submit -> Auth.login.password: getPassword()

# 2
Auth.loginSuccess -> UserPage.render.token: extractToken()
```

Generate `index.ts`:

```ts
import { Flow } from "graphicode-utils";
import UserPage from "pages/UserPage";
import Auth from "services/Auth";

import getUsername from "algorithms/getUsername";
import getPassword from "algorithms/getPassword";
import extractToken from "algorithms/extractToken";

class LoginFlow extends Flow {
  constructor() {
    super();

    this._connect(0, UserPage, 'submit', Auth, 'login', 'username', [getUsername]);
    this._connect(1, UserPage, 'submit', Auth, 'login', 'password', [getPassword]);
    this._connect(2, Auth, 'loginSuccess', UserPage, 'render', 'token', [extractToken]);
  }
}

export default new LoginFlow();
```

**Explanation**:
- `Auth.login` method receives `__tag` (auto-injected, empty string), `username` and `password`. When all parameters are ready, `login` executes automatically.
- After `login` completes, it triggers `Auth.loginSuccess` event.
- Connection `#2` listens to that event and feeds the extracted token to `UserPage.render.token`.

## Example 2: With `linked` / `link to`

Given `README.d2.md`:

```d2
shape: sequence_diagram

UserPage: pages/UserPage
ConfigStore: stores/ConfigStore

# 0 linked
UserPage.init -> ConfigStore.read.key: getConfigKey() {
  target-arrowhead: {
    style.filled: false
  }
}

# 1 link to 0
ConfigStore.readSuccess -> UserPage.render.config: getConfigValue() {
  target-arrowhead: {
    style.filled: false
  }
}

# 2 link to 0
ConfigStore.readError -> UserPage.showInitError.error: getErrorMessage() {
  target-arrowhead: {
    style.filled: false
  }
}
```

Generate `index.ts`:

```ts
import { Flow } from "graphicode-utils";
import UserPage from "pages/UserPage";
import ConfigStore from "stores/ConfigStore";

import getConfigKey from "algorithms/getConfigKey";
import getConfigValue from "algorithms/getConfigValue";
import getErrorMessage from "algorithms/getErrorMessage";

class ConfigFlow extends Flow {
  constructor() {
    super();

    const tag = `tag-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    this._connect(0, UserPage, 'init', ConfigStore, 'read', 'key', [getConfigKey], { linked: tag });
    this._connect(1, ConfigStore, 'readSuccess', UserPage, 'render', 'config', [getConfigValue], { linkTo: tag });
    this._connect(2, ConfigStore, 'readError', UserPage, 'showInitError', 'error', [getErrorMessage], { linkTo: tag });
  }
}

export default new ConfigFlow();
```

**Explanation**:
- `#0` is `linked`: generates a unique `tag`, passes `{ linked: tag }`. `ConfigStore.read` receives `{key: '__tag', value: tag}` as its first parameter, and uses it to publish scoped events like `readSuccess-${tag}`.
- `#1` and `#2` are `link to 0`: pass `{ linkTo: tag }`, so they listen to `readSuccess-${tag}` / `readError-${tag}` — only catching events from this specific `read` invocation.

## Shell Commands

Read the flow README:
```sh
cat ./<flowDir>/<flowId>/README.d2.md
```

Write the generated code:
```sh
echo '...' > ./<flowDir>/<flowId>/index.ts
```

## Notes

After completing the write operation, simply reply with "mission complete". No need to explain changes.
