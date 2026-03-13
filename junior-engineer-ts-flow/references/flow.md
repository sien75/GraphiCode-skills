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
`SourceState.eventOrRead -> TargetState.write.param: dir/algorithm()`

* `SourceState.eventOrRead`: The state (using its short name) and its event/read method providing the input data.
* `TargetState.write.param`: The state (using its short name), its write method, and the specific parameter receiving the output data.
* `dir/algorithm()`: The algorithm node (with directory, lowercase start) responsible for transforming the data. You can chain multiple algorithms by separating them with commas (e.g. `dir/algo1(), dir/algo2()`), and they will be executed sequentially.

#### Example 1: Event to Write

When a user clicks a button, it triggers a network request:

```d2
UserPage.onUserClick -> Network.triggerReq.id: algorithms/transform()
```
- Source: `UserPage` state fires `onUserClick` event.
- Target: `Network` state's `triggerReq` method's `id` parameter.
- Algorithm: `algorithms/transform()` processes the click event data into the `id` format required by the network request.

#### Example 2: Read to Write (Pulling Extra Data)

Sometimes, executing an algorithm requires pulling additional data from another state. You can draw another arrow pointing to the same target parameter or a different parameter of the same method:

```d2
ExtraInfo.getToken -> Network.triggerReq.token: algorithms/identity() {
  target-arrowhead: {
    style.filled: false
  }
}
```
- Source: `ExtraInfo` state's `getToken` read method.
- Target: `Network` state's `triggerReq` method's `token` parameter.
- Algorithm: `algorithms/identity()` just passes the token along.

#### Example 3: Write to Write (Sequential Timing)

Sometimes you need to express that one write operation should immediately follow another write operation, even though the first write produces no output. In this case, the algorithm is mainly responsible for triggering the next action or generating the required data independently.

```d2
Network.cancelReq -> UserPage.showError.msg: algorithms/clearState(), algorithms/generateErrorMsg()
```
- Source: `Network` state's `cancelReq` write method (completes execution).
- Target: `UserPage` state's `showError` write method's `msg` parameter.
- Algorithm: `algorithms/clearState()` runs first, then its output is passed to `algorithms/generateErrorMsg()` which generates an error message.

### Allowed Connections

In a GraphiCode flow, data transfer and sequencing can **only** occur in the following combinations:

1. **`event -> write`**: An event fires and its payload is transformed and pushed into a write method. (Most common)
2. **`read -> write`**: Data is pulled from a read method, transformed, and pushed into a write method. (Usually as an auxiliary pull accompanying an event)
3. **`write -> write`**: A write operation completes, and its completion triggers a subsequent write operation. (Used strictly for sequential timing)

**You cannot use combinations like `read -> read`, `event -> event`, or `write -> event`.**

## Complete Example

Putting it all together, a flow file looks like this:

```d2
shape: sequence_diagram

UserPage: pages/UserPage
Network: network/Network
ExtraInfo: models/ExtraInfo

UserPage.onUserClick

UserPage.onUserClick -> Network.triggerReq.id: algorithms/transform()

ExtraInfo.getToken -> Network.triggerReq.token: algorithms/identity() {
  target-arrowhead: {
    style.filled: false
  }
}

Network.cancelReq -> UserPage.showError.msg: algorithms/clearState(), algorithms/generateErrorMsg()
```

## Built-in Methods

Every state node has a set of built-in methods that are **not listed in its README**:

| type | method | description |
|------|--------|-------------|
| write | `enabled` | activates the state |
| write | `disabled` | deactivates the state |
| read | `isEnabled` | returns whether the state is currently enabled |
| event | `onEnabledChange` | fires whenever the enabled/disabled status changes |

You can use these just like any other method in the sequence diagram.

## Important Rules

1. **State nodes are participants (pillars).**
2. **Algorithm nodes are connections (labels on arrows).** You must not define an algorithm as a participant/pillar.
3. Every data transfer must explicitly name the source state's method and the target state's method.
4. Only valid D2 sequence diagram syntax is allowed.
