# flow

## what is flow

`flow` is the **most important concept** in GraphiCode. It specifies the dependencies and data flow between state nodes, using algorithm nodes to transform and mediate the data. In the flow, **State nodes are the pillars (participants)** and **Algorithm nodes are the connections (messages)**.

## D2 Sequence Diagram Format

Flows are written using the [D2 Sequence Diagram](https://d2lang.com/) syntax. This allows us to visually represent the lifecycle of a process where states trigger events, algorithms process the data, and states are updated.

A flow file must start with `shape: sequence_diagram`.

### State Pillars (Participants)

First, declare the state nodes involved in the flow. Each state node acts as a participant (pillar) in the sequence diagram. If you plan to use short names (which is recommended for readability), you must declare them at the top by mapping the short name to the full directory path: `ShortName: dir/LongName`.

```d2
shape: sequence_diagram

UserPage: pages/UserPage
Network: network/Network
ExtraInfo: models/ExtraInfo
```

### Flow Execution

The sequence of operations is defined by arrows `->` connecting states. The label on the arrow represents the **Algorithm node(s)** that processes the data during this transition.

The general syntax is:
`SourceState.eventOrMethod -> TargetState.method.param: algorithm()`

* `SourceState.eventOrMethod`: The state (using its short name) and its event/method providing the input data. **The source MUST be initiated by `State.event` or `State.method`.**
* `TargetState.method.param`: The state (using its short name), its method, and the specific parameter receiving the output data. **The receiver MUST be initiated by `State.method.paramName` or just `State.method` (when not assigning to a specific parameter, e.g. for triggering).**
* `algorithm()`: The algorithm node responsible for transforming the data. You can chain multiple algorithms by separating them with commas (e.g. `algo1(), algo2()`), and they will be executed sequentially.

#### Connection Numbering

**Every connection must be annotated with a number using a comment (e.g., `# 0`).** This is critical for referencing connection results later in the flow.

#### Context Algorithm

If a connection requires data sources other than the current `source`, you can use the `_context()` algorithm. It returns an object `{ context, payload }`:
* `context`: Contains all context information, keyed by the sequence number of the connection that produced the source's output result.
* `payload`: The result passed from the previous operator (if any).

Example:
```d2
# 1
Network.triggerReq -> ExtraInfo.getToken.pageName: _context(), getPageName()
```

#### Function Execution Rule

A function is truly executed ONLY when ALL its input parameters are gathered. Once all parameters are gathered, it will definitely execute.

#### Synchronous Calls

A synchronous call happens between two methods (`method -> method`). For example, when `a.method1` needs data from `b.method2`.
`a.method1` calls `b.method2` and waits for its result. The return value of `b.method2` is then passed back as a parameter to `a.method1` (e.g., `b.method2 -> a.method1.param1`). Only when `a.method1` receives all required parameters will it truly execute.

**Synchronous calls can be nested.** This means `a.method1` can call `b.method2`, and before `b.method2` returns, it can call `c.method3`. The sequence of arrows would look like: `a.method1 -> b.method2`, then `b.method2 -> c.method3`, followed by the return `c.method3 -> b.method2.paramX`, and finally the return `b.method2 -> a.method1.paramY`.

**Style in D2:**
- The call uses the default arrow.
- The return (call receipt) uses `shape: arrow` in `target-arrowhead`.

```d2
# 0
UserPage.renderDOM -> ExtraInfo.getToken: prepare()

# 1
ExtraInfo.getToken -> Storage.getLocalToken: identity()

# 2
Storage.getLocalToken -> ExtraInfo.getToken.localToken: identity() {
  target-arrowhead: {
    shape: arrow
  }
}

# 3
ExtraInfo.getToken -> UserPage.renderDOM.token: extract() {
  target-arrowhead: {
    shape: arrow
  }
}
```

#### Asynchronous Calls

An asynchronous call usually happens from an event to a method (`event -> method`).
For example, `a.event1 -> b.method2`. After `a` triggers the event, it has no further concern with `b` and does not care about its execution status.

**Style in D2:**
- Asynchronous calls use a hollow arrow (`style.filled: false`) in `target-arrowhead`.

```d2
# 0
UserPage.onUserClick -> Network.triggerReq.id: transform() {
  target-arrowhead: {
    style.filled: false
  }
}
```

### Allowed Connections

In a GraphiCode flow, data transfer and sequencing can **only** occur in the following combinations:

1. **`event -> method`**: An event fires and its payload is pushed into a method. (Asynchronous call)
2. **`method -> method`**: A method calls another method to get data or sequence execution. (Synchronous call)

**You cannot use combinations like `method -> event` or `event -> event`.**

## Complete Example

Putting it all together, a flow file looks like this:

```d2
shape: sequence_diagram

UserPage: pages/UserPage
Network: network/Network
ExtraInfo: models/ExtraInfo

# 0
UserPage.onUserClick -> Network.triggerReq.id: transform() {
  target-arrowhead: {
    style.filled: false
  }
}

# 1
Network.triggerReq -> ExtraInfo.getToken.pageName: _context(), getPageName()

# 2
ExtraInfo.getToken -> Network.triggerReq.token: identity() {
  target-arrowhead: {
    shape: arrow
  }
}

# 3
Network.onRes -> UserPage.renderDOM.userInfo: transform2() {
  target-arrowhead: {
    style.filled: false
  }
}
```

## Built-in Methods

Every state node has a set of built-in methods/events that are **not listed in its README**:

| type | name | description |
|------|--------|-------------|
| method | `enabled` | activates the state |
| method | `disabled` | deactivates the state |
| method | `isEnabled` | returns whether the state is currently enabled |
| event | `onEnabledChange` | fires whenever the enabled/disabled status changes |

You can use these just like any other method in the sequence diagram.

## Important Rules

1. **State nodes are participants (pillars).**
2. **Algorithm nodes are connections (labels on arrows).** You must not define an algorithm as a participant/pillar.
3. Every data transfer must explicitly name the source state's method and the target state's method.
4. Only valid D2 sequence diagram syntax is allowed.
