# what is flow

`flow` is the core concept in GraphiCode. It describes how data flows from state events, through algorithms, into parameters of state methods. When all parameters are collected, the method executes automatically.

# YAML sequence diagram format

Flow is described in YAML format, stored in `README.yaml` files.

## basic structure

```yaml
type: sequence_diagram

description: <one-line scenario summary, written in the writingLanguage specified in graphig.md>

participants:
  - name: UserPage
    path: pages/UserPage
  - name: Auth
    path: services/Auth

connections:
  - id: 0
    on:
      state: UserPage
      event: submit
    pipe:
      - getUsername()
    call:
      state: Auth
      method: login
      param: username
```

## description

Each `README.yaml` must have a `description` field — a one-line summary of the flow's scenario, written in the `writingLanguage` specified in the project's `graphig.md`. This description is displayed in the flow viewer UI to help readers quickly identify each flow.

## participants

Declare all participating states under `participants`. Each participant has:

- `name`: Short name used in connections.
- `path`: Directory path of the state (e.g., `pages/UserPage`, `services/Auth`).

## connections

Each connection reads as a sentence: **on** event, **pipe** transforms, **call** method, **then** handle return, **catch** handle error.

Fields:

- `id`: Unique sequence number, starting from 0, must be consecutive.
- `on.state`: Optional. The state that emits the event. If present, listens to a state self-originated event. If absent, listens to a flow broadcast event on the global EventBus.
- `on.event`: The event name that triggers this connection (broadcast — receives all occurrences).
- `pipe`: Optional list of algorithm functions. Each receives `{ logs, payload }` and returns a transformed value. Executes top-to-bottom. The final output becomes the value for `call.param`.
- `call.state`: The target state that owns the method. **`call` is required** — every connection must have a `call` block. `then` and `catch` are optional.
- `call.method`: The method to call.
- `call.param`: Optional. Which parameter of the method this connection fills. If the method takes zero parameters, omit `call.param` — the method executes immediately when the event fires.
- `then`: Optional. Routes the method's return value. See "then and catch" below.
- `catch`: Optional. Routes a thrown error (or Promise rejection). See "then and catch" below.

Only **event -> method** connections are allowed:

- `on` must reference a state event (with `state`) or a flow broadcast event (without `state`).
- `call` must reference a state method. If the method takes parameters, one of its parameters must be specified via `call.param`. If the method takes zero parameters, `call.param` is omitted.

## then and catch

`then` routes the method's return value. `catch` routes a thrown error or Promise rejection. If the method returns a Promise, it is automatically awaited: resolve goes to `then`, reject goes to `catch`.

`then` and `catch` each support three distribution modes, distinguished by their YAML structure:

**Unicast** — object with `state`, `method`, `param`: routes to one target.

```yaml
then:
  state: UserPage
  method: render
  param: config
```

**Multicast** — array of objects: routes to multiple targets simultaneously.

```yaml
then:
  - state: Store
    method: save
    param: token
  - state: Dashboard
    method: render
    param: user
```

**Broadcast** — object with `event`: publishes the value as a broadcast event on the global EventBus. Any connection with `on: { event: ... }` (no `state`) can listen to it.

```yaml
then:
  event: loginSuccess
```

Detection rule for the large model: if the value is an **array** → multicast. If the value is an object with an `event` field → broadcast. If the value is an object with a `state` field → unicast.

Each unicast/multicast target has these fields:

- `state`: The target state.
- `method`: The method to call.
- `param`: Which parameter this fills.
- `pipe`: Optional transformation pipeline (same as connection pipe).
- `then`: Optional nested then (for chains like A → B → C → A).
- `catch`: Optional nested catch.

Each broadcast target has these fields:

- `event`: The event name to publish (published on the global EventBus).

When multiple connections fill the same method, `then`/`catch` go on **one** connection (convention: the first). Other connections for the same method don't repeat them.

## pipe

Pipe is a transformation pipeline between the event and the method call:

```yaml
pipe:
  - extractToken()
  - validateToken()
  - formatToken()
```

- Each function receives `{ logs, payload }`.
  - `logs`: `Map<number, any[]>` — flow's operation history, records of all connection executions.
  - `payload`: Data from the upstream event, or the previous function's output.
- The final output becomes the value for `call.param`.
- `pipe` can also appear inside `then`/`catch` targets, transforming the return value or error before delivery.

## parameter collection

A method may require multiple parameters, each provided by a different connection. The flow tracks which parameters have been filled:

- Each connection fills exactly one parameter (specified by `call.param`), or calls a zero-parameter method directly (when `call.param` is omitted).
- When **all** parameters of a method have received values, the method executes automatically. Zero-parameter methods execute immediately on event.

## event naming

There are two sources of events:

- **State self-originated events**: declared in the state README, named as `StateClassName.eventName` (e.g., `UserPage.click`, `Timer.tick`). These are inherently namespaced and won't conflict. Listened via `on: { state: ..., event: ... }`.
- **Flow broadcast events**: defined in flow YAML via `then`/`catch` broadcast mode. Published to the global EventBus. When naming a broadcast event, search all existing flow YAML files for `event:` fields to avoid name conflicts. Listened via `on: { event: ... }` (no `state`).

State methods only return values or throw errors. They do **not** call `_publish` to emit events. All result distribution (unicast, multicast, broadcast) is handled by the flow layer.

## important rules

1. Only `event -> method` connections are allowed.
2. Sequence numbers (`id`) must be unique and consecutive, starting from 0.
3. Each connection fills exactly one parameter of the target method, or calls a zero-parameter method directly (no `call.param`).
4. A method executes automatically when all its parameters are collected. Zero-parameter methods execute immediately.
5. `on` with `state`: listens to a state self-originated event. `on` without `state`: listens to a flow broadcast event on the global EventBus.
6. `then` routes the method's **return value**: unicast (object with `state`), multicast (array), or broadcast (object with `event`).
7. `catch` routes a **thrown error or Promise rejection**: same three modes as `then`.
8. State methods must not call `_publish`. Result distribution is flow's responsibility.

# examples

## example 1: login (multicast then)

```yaml
type: sequence_diagram

description: Login flow — submit credentials, store token, render dashboard

participants:
  - name: UserPage
    path: pages/UserPage
  - name: Auth
    path: services/Auth
  - name: Store
    path: stores/TokenStore
  - name: Dashboard
    path: pages/Dashboard

connections:
  - id: 0
    on:
      state: UserPage
      event: UserPage.submit
    pipe:
      - getUsername()
    call:
      state: Auth
      method: login
      param: username
    then:
      - state: Store
        method: save
        param: token
        pipe:
          - extractToken()
      - state: Dashboard
        method: render
        param: user
        pipe:
          - extractUser()
    catch:
      state: Dashboard
      method: showError
      param: error

  - id: 1
    on:
      state: UserPage
      event: UserPage.submit
    pipe:
      - getPassword()
    call:
      state: Auth
      method: login
      param: password
```

- `#0` and `#1`: `UserPage.submit` is a broadcast event, all listeners receive it. They fill `Auth.login`'s `username` and `password`.
- When both parameters are ready, `Auth.login` executes.
- `then` (multicast): the return value is routed to both `Store.save` and `Dashboard.render`.
- `catch` (unicast): if `Auth.login` throws, the error is routed to `Dashboard.showError`.

## example 2: config read (unicast then/catch)

```yaml
type: sequence_diagram

description: Config read — load configuration on page init

participants:
  - name: UserPage
    path: pages/UserPage
  - name: ConfigStore
    path: stores/ConfigStore

connections:
  - id: 0
    on:
      state: UserPage
      event: UserPage.init
    pipe:
      - getConfigKey()
    call:
      state: ConfigStore
      method: read
      param: key
    then:
      state: UserPage
      method: render
      param: config
      pipe:
        - getConfigValue()
    catch:
      state: UserPage
      method: showInitError
      param: error
      pipe:
        - getErrorMessage()
```

- `on.event: UserPage.init` is broadcast — all listeners receive it.
- `ConfigStore.read` executes and returns the config data.
- `then` (unicast): the return value is piped through `getConfigValue` and routed to `UserPage.render`.
- `catch` (unicast): if `ConfigStore.read` throws, the error is piped through `getErrorMessage` and routed to `UserPage.showInitError`.

## example 3: broadcast result

```yaml
connections:
  - id: 0
    on:
      state: UserPage
      event: UserPage.submit
    pipe:
      - getCredentials()
    call:
      state: Auth
      method: login
      param: credentials
    then:
      event: loginSuccess
    catch:
      event: loginError
```

- `then` (broadcast): `Auth.login`'s return value is published as `loginSuccess` event on the global EventBus. Any connection with `on: { event: loginSuccess }` (no `state`) can listen to it.
- `catch` (broadcast): a thrown error is published as `loginError` event on the global EventBus.

## example 4: listening to a flow broadcast event

Example 3 broadcasts `loginSuccess`. A separate flow listens to this event. Note that `on` has **no `state` field** — this is a flow broadcast event living on the global EventBus, not a self-originated state event.

```yaml
# flow file: save-token-on-login.yaml
type: sequence_diagram

description: Save token on login — store token when login succeeds

participants:
  - name: Store
    path: stores/TokenStore

connections:
  - id: 0
    on:
      event: loginSuccess
    pipe:
      - extractToken()
    call:
      state: Store
      method: save
      param: token
```

- `on.event: loginSuccess` has no `state` — it listens to the global EventBus where flow broadcast events are published.
- This demonstrates the two types of `on`: with `state` (state self-originated events) and without `state` (flow broadcast events).

## example 5: zero-parameter call

```yaml
connections:
  - id: 0
    on:
      state: UserPage
      event: UserPage.logoutClick
    call:
      state: Auth
      method: logout
    then:
      state: UserPage
      method: render
      param: config
```

- `Auth.logout` takes zero parameters, so `call.param` is omitted.
- The method executes immediately when `UserPage.logoutClick` fires.
- `then` still works as usual — the return value of `logout` is routed to `UserPage.render`.

# built-in methods and events

Every state has these built-in members :

| type | signature | description |
|------|-----------|-------------|
| method | `enable(): void` | activate state |
| method | `disable(): void` | deactivate state |
| method | `getState(): any` | get all state data |
| method | `isEnabled(): boolean` | check whether the state is currently enabled |
| event | `StateClassName.enabledChange: boolean` | emitted when enabled flag changes |
