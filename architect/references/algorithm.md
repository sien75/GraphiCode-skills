# algorithm

## what is algorithm node

Algorithm nodes receive input, process it through their own logic, and produce output data. In the flow system, algorithms are chained in a pipe — each algorithm receives `{ context, payload }` and returns a transformed value that becomes the next step's payload.

## example

This is an example of an algorithm node file, meaning:

1. this algorithm receives a payload containing fields a (dir1/TypeA), b (dir1/TypeB), c (dir2/TypeC), and d (dir2/TypeD)
2. executes the description under the description heading
3. produces an output with fields e (dir2/TypeE), f (dir2/TypeF), and g (dir2/TypeG)

```md
# io
(a: dir1/TypeA, b: dir1/TypeB, c: dir2/TypeC, d: dir2/TypeD) -> {e: dir2/TypeE, f: dir2/TypeF, g: dir2/TypeG}

# description
Transform a and b to e and f.
```

The first line is the **signature**: `(inputs...) -> output`. Each parameter follows the format `paramName: dir/TypeID`, where `dir/TypeID` is a type ID with its directory prefix. The directory corresponds to one of the `typeDirs` in `graphig.md`, and the type details are defined there, which you need to look up accordingly.

## important notes

When writing algorithms, **do not mention states or flows**. Algorithms should only depend on types.

When writing an algorithm's description, **do not describe the source or destination of data**. Focus only on how data is transformed from input to output.

Remember, you are describing code logic in natural language. You must **use deterministic language and describe specific details clearly**. It's better to be verbose than unclear - others must be able to write code based on your description.
