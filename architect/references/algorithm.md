# algorithm

## what is algorithm node

Algorithm nodes receive input, process it through their own logic, and produce output data.

## algorithm node's input

An algorithm node takes a set of input fields, each with a specific type. These inputs are provided by the flow system at runtime.

Algorithm nodes execute only when all required inputs are ready.

## algorithm node's output

An algorithm node produces a set of output fields. These outputs are used by the flow system to update state nodes or provide inputs to subsequent algorithm nodes.

Only after the algorithm node finishes running completely will the output be processed.

## example

This is an example of an algorithm node file, meaning:

1. this algorithm receives inputs: a (dir1/TypeA), b (dir1/TypeB), c (dir2/TypeC), and d (dir2/TypeD)
2. executes the description under the description heading
3. produces outputs: e (dir2/TypeE), f (dir2/TypeF), and g (dir2/TypeG)

```md
# input
a: dir1/TypeA
b: dir1/TypeB
c: dir2/TypeC
d: dir2/TypeD

# output
e: dir2/TypeE
f: dir2/TypeF
g: dir2/TypeG

# description
Transform a and b to e and f.
```

Each parameter line follows the format `paramName: dir1/TypeA`, where `paramName` is the parameter name used in code, and `dir1/TypeA` is a type ID with its directory prefix. The directory corresponds to one of the `typeDirs` in `graphig.md`, and the type details are defined there, which you need to look up accordingly.

## important notes

When writing algorithms, **do not mention states or flows**. Algorithms should only depend on types.

When writing an algorithm's description, **do not describe the source or destination of data**. Focus only on how data is transformed from input to output.

Remember, you are describing code logic in natural language. You must **use deterministic language and describe specific details clearly**. It's better to be verbose than unclear - others must be able to write code based on your description.
