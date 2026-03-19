# flow

## What is flow

`flow` is the core concept in GraphiCode. It describes how data flows from state events, through algorithms, into parameters of state methods. When all parameters are collected, the method executes automatically.

## D2 Sequence Diagram Format

Use [D2 Sequence Diagram](https://d2lang.com/) syntax.

### Participants (States)

Declare all state nodes at the top:

```d2
shape: sequence_diagram

UserPage: pages/UserPage
Auth: services/Auth
```

Mapping: `ShortName: dir/LongName`

### Connection Rule

Format:

```d2
SourceState.event -> TargetState.method.param: algo1(), algo2()
```

**Components**:

- `SourceState.event`: An event that triggers the flow.
- `TargetState.method.param`: A method and one of its parameters.
- `algo1(), algo2()`: Optional algorithm chain. Each receives `{ context, payload }` and returns transformed value.

### Numbering and Linking

Every connection needs a number: `# 0`, `# 1`, ...

Use `link` to bind downstream consumers to a specific invocation:

- `# 0 linked` – initiating connection; creates flow context ID 0
- `# 1 link to 0` – responds only to events from #0's execution

`link` is needed when a method's completion event (e.g., `readSuccess`) could come from multiple independent calls. It prevents cross-flow interference.

Arrow style must be hollow at "link" scene. Add:

```d2
{
  target-arrowhead: {
    style.filled: false
  }
}
```

### Parameter Collection

A method may have multiple parameters, each from a different connection. The flow tracks completion:

- Each connection's result is stored by its serial number.
- When all parameters have values, the method executes automatically.

### Example 1: Login

```d2
shape: sequence_diagram

UserPage: pages/UserPage
Auth: services/Auth
Store: stores/TokenStore
Dashboard: pages/Dashboard

# 0
UserPage.submit -> Auth.login.username: getUsername()

# 1
UserPage.submit -> Auth.login.password: getPassword()

# 2
Auth.loginSuccess -> Store.save.token: extractToken()

# 3
Auth.loginSuccess -> Dashboard.render.user: extractUser()
```

- `#0` and `#1` both originate from `UserPage.submit`. They fill `Auth.login`'s `username` and `password`.
- When both parameters are ready, `Auth.login` executes.
- After execution, `Auth.loginSuccess` event is triggered.
- `#2` and `#3` consume that event, passing data to `Store.save.token` and `Dashboard.render.user`.

All four connections belong to one flow.

### Example 2: Read with link

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

- `#0` initiates `ConfigStore.read`. It is `linked`, creating flow context 0.
- `ConfigStore.read` executes. On completion, it triggers either `readSuccess` or `readError`.
- `#1` and `#2` are `link to 0`. They only respond to events from the specific `read` call initiated by `#0`.
- This scoping ensures that if another flow also calls `ConfigStore.read`, its events won't be caught by `#1` and `#2`.

### Important Rules

1. Only `event -> method` connections are allowed.
2. Sequence numbers must be unique and consecutive.
3. Use `link` only when you need to scope event consumers to a specific invocation. Otherwise omit it.
4. Connections without explicit `link` that share an event source belong to the same flow.

## Built-in Methods

Every state has these (not in README):

| type | name | description |
|------|------|-------------|
| method | `enabled` | activate state |
| method | `disabled` | deactivate state |
| method | `readEnabled` | get enabled status (boolean) |
| event | `enabledChange` | enabled flag changed (payload: boolean) |
| event | `enabledValueRead` | after `readEnabled` call |
