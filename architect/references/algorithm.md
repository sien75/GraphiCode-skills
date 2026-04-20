# algorithm

## what is algorithm node

Algorithm nodes receive input, process it through their own logic, and produce output data. In the flow system, algorithms are chained in a pipe — each algorithm receives `{ logs, payload }` and returns a transformed value that becomes the next step's payload.

## example

This is an example of an algorithm node file, meaning:

1. this algorithm receives a payload containing fields a (`stateDir/Auth.TypeA`), b (`stateDir/Auth.TypeB`), c (`stateDir/Store.TypeC`), and d (`stateDir/Store.TypeD`)
2. executes the description under the description heading
3. produces an output with fields e (`stateDir/Store.TypeE`), f (`stateDir/Store.TypeF`), and g (`stateDir/Store.TypeG`)

```md
# io
(a: stateDir/Auth.TypeA, b: stateDir/Auth.TypeB, c: stateDir/Store.TypeC, d: stateDir/Store.TypeD) -> {e: stateDir/Store.TypeE, f: stateDir/Store.TypeF, g: stateDir/Store.TypeG}

# description
Transform a and b to e and f.
```

The first line is the **signature**: `(inputs...) -> output`. Each parameter follows the format `paramName: stateDir/StateName.TypeName`, where `stateDir` corresponds to one of the `stateDirs` in `graphig.md`, `StateName` is the state ID, and `TypeName` is a type defined in that state's `# type` section.

## important notes

When writing algorithms, **do not mention states or flows**. Algorithms reference types defined in states but do not depend on state logic.

When writing an algorithm's description, **do not describe the source or destination of data**. Focus only on how data is transformed from input to output.

Remember, you are describing code logic in natural language. You must **use deterministic language and describe specific details clearly**. It's better to be verbose than unclear - others must be able to write code based on your description.
