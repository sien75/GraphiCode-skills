# algorithm

## what is algorithm node

Algorithm nodes receive input, process it through their own logic, and produce output data.

## algorithm node's input

* Subscribe to an state instance.
* Take the output of the previous algorithm node as input.
* Directly read data from state instance.

Generally, the first algorithm node subscribes to an event.

Algorithm node can receive all inputs above simultaneously, and will only execute when all inputs are ready.

## algorithm node's output

* Pass output to the next algorithm node.
* Push output to state instance.

The output to the next algorithm node does not have to be the same to which to the state.

Only after the algorithm node finishes running completely, will the actual output action be executed.

## example

This is an example of an algorithm node file, meaning:

1. this algorithm subscribes to two types of data: dir1/TypeA and dir1/TypeB
2. pulls dir2/TypeC data from a specific state
3. receives dir2/TypeD data passed from the previous node
4. executes the description under the description heading
5. pushes dir2/TypeE and dir2/TypeF data to a specific state
6. passes dir2/TypeG data to next node

> Here we use the verb+s form as a noun. While not grammatically standard, the meaning is clear.

```md
# input
## subscribes
dir1/TypeA
dir1/TypeB
## pulls
dir2/TypeC
## passes
dir2/TypeD

# output
## pushes
dir2/TypeE
dir2/TypeF
## passes
dir2/TypeG

# description
Transform dir1/TypeA and dir1/TypeB to dir2/TypeC.
```

Here `dir1/TypeA` is a type ID with its directory prefix. The directory corresponds to one of the `typeDirs` in `graphig.json`, and the type details are defined there, which you need to look up accordingly.

## important notes

When writing algorithms, **do not mention states or flows**. Algorithms should only depend on types.

When writing algorithms, **the first node's input must contain "subscribes"** and will not have data passed from a previous node; **the last node's output has "pushes"** and will not be passed to a subsequent node.

A node can receive **at most one subscribe** to trigger execution. If other data is needed, it must be pulled.

When writing an algorithm's description, **do not describe the source or destination of data**. Focus only on how data is transformed from input to output.

Remember, you are describing code logic in natural language. You must **use deterministic language and describe specific details clearly**. It's better to be verbose than unclear - others must be able to write code based on your description.
