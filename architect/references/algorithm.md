# algorithm

## what is algorithm node

Algorithm nodes receive input, process it through their own logic, and produce output data. In the flow system, algorithms are chained in a pipe — each algorithm receives `{ logs, payload }` and returns a transformed value that becomes the next step's payload.

## example

This is an example of an algorithm node file, meaning:

1. this algorithm receives a payload containing fields a (TypeA), b (TypeB), c (TypeC), and d (TypeD)
2. executes the description under the description heading
3. produces an output with fields e (TypeE), f (TypeF), and g (TypeG)

```md
# io
(a: TypeA, b: TypeB, c: TypeC, d: TypeD) -> {e: TypeE, f: TypeF, g: TypeG}

# description
Transform a and b to e and f.
```

The first line is the **signature**: `(inputs...) -> output`. Each parameter follows the format `paramName: TypeName`. Types are defined in the state README files that participate in the flow where this algorithm is used — look up the relevant state's `# type` section for the type definition.

## important notes

When writing algorithms, **do not mention states or flows**. Algorithms reference types defined in states but do not depend on state logic.

When writing an algorithm's description, **do not describe the source or destination of data**. Focus only on how data is transformed from input to output.

Remember, you are describing code logic in natural language. You must **use deterministic language and describe specific details clearly**. It's better to be verbose than unclear - others must be able to write code based on your description.
