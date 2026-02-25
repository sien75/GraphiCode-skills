# read
## getStateInstance
> string
Subscription
## getAllStateInstances
Map<string, Subscription>
## isFlowEnabled
> string
boolean
## getAllFlowStates
Map<string, boolean>

# write
## instantiateState
> any
> string?
string
## destroyState
> string

## enableFlow
> string
## disableFlow
> string

# event
## onStateCreated
string, Subscription
## onStateDestroyed
string, null
## onFlowStatusChanged
string, boolean

# resides-in
memory

# description
Store is the global state manager of a GraphiCode-managed project. It manages all state instances and flow on/off status. It stores a map of state id to Subscription instance, and a map of flow id to boolean enabled status. It emits events when state instances are created/destroyed and when flow status changes.
