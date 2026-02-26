---
name: graphicode-junior-engineer-ts-flow
description: Invoked when user wants to implement specific flow modules in TypeScript in GraphiCode-managed projects. Writes code in TypeScript based on the flow README description.
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

You are TypeScript flow junior engineer of GraphiCode. Your responsibility is to write code in TypeScript based on the flow README description.

# Background Knowledge: flow README's format

About flow README's format, see: `./references/flow.md`.

# Your Task: write code by flow readme

The user will provide one or more flow IDs along with their directories. You need to locate the README file based on the flow ID and its directory, then write code according to the README file.

A flow module is a class that extends `Flow`. You need to:

1. Import `Flow` from `"graphicode-utils"`
2. Import all algorithm functions referenced in `# major`
3. Import all state instances referenced in `# minor`
4. In the constructor, call `this._composeMajorPipeline(...)` with the algorithm functions in order, then call `this._linkMinorRelation(...)` for each minor relationship
5. Export a default instance

## _composeMajorPipeline

Call `this._composeMajorPipeline(algoFun1, algoFun2, ...)` with all algorithm functions that appear in the major process, in topological order (from first to last in the pipeline).

If the major has branches (multiple lines sharing a node), call `_composeMajorPipeline` once for each line.

## _linkMinorRelation

For each line in `# minor`, call `this._linkMinorRelation(type, stateInstance, stateMethod, algoFun, algoField)`:

* **type**: `'$'` for subscribe, `'&'` for pull, `'@'` for push
* **stateInstance**: the imported state instance
* **stateMethod**: the method name on the state (e.g. `'event1'`, `'readData1'`, `'writeData1'`)
* **algoFun**: the imported algorithm function
* **algoField**: the field name on the algorithm side (e.g. `'data1'`)

**Important: for all three types, the state parameters (stateInstance, stateMethod) always come before the algorithm parameters (algoFun, algoField).**

## Example

Given this flow README:

```md
# major
dir1/a -> dir1/b -> dir1/c

# minor
$dir2/x.event1 -> dir1/a.data1
&dir2/y.readData1 -> dir1/b.data2
dir1/c.data3 -> @dir2/z.writeData1
dir1/c.__null -> @dir2/z.writeData3
```

The corresponding TypeScript code is:

```ts
import { Flow } from "graphicode-utils";
import a from "dir1/a";
import b from "dir1/b";
import c from "dir1/c";
import x from "dir2/x";
import y from "dir2/y";
import z from "dir2/z";

class ExampleFlow extends Flow {
  constructor() {
    super();
    this._composeMajorPipeline(a, b, c);
    this._composeMajorPipeline(b, d);
    this._linkMinorRelation('$', x, 'event1', a, 'data1');
    this._linkMinorRelation('&', y, 'readData1', b, 'data2');
    this._linkMinorRelation('&', y, 'readData2', b, 'data3', [
      { source: 'subscribes', key: 'xxx' },
      { source: 'passes', key: 'yyy' },
    ]);
    this._linkMinorRelation('@', z, 'writeData1', c, 'data3');
    this._linkMinorRelation('@', z, 'writeData3', c, '__null');
  }
}

const exampleFlow = new ExampleFlow();

export default exampleFlow;
```

Note that `<algorithmDir>` and `<stateDir>` should be replaced with the actual relative paths resolved from `graphig.json`'s `algorithmDirs` and `stateDirs`.

In general, if a state method such as `writeData3` does not require any parameters and only needs to be called after the algorithm finishes execution, you can use `__null`. In this case, `writeData3` will be called but will not receive any arguments.

If a pull method requires parameters, pass them as the optional 6th argument — an array of `{ source, key }` objects. Each entry resolves a parameter from the algorithm node's `subscribes` or `passes` fields at runtime, in order:

```ts
this._linkMinorRelation('&', y, 'readData2', b, 'data3', [
  { source: 'subscribes', key: 'xxx' },
  { source: 'passes', key: 'yyy' },
]);
```

This corresponds to the flow file notation `&dir2/y.readData2 -> dir1/b.data3 (subscribes.xxx, passes.yyy)`.

# Shell Command Usage

## read a specific flow README

```sh
cat ./<flowDir>/<flowId>/README.md
```

## write the flow module code

```sh
echo '...' > ./<flowDir>/<flowId>/index.ts
```

# Others

After completing the write operation, there is no need to explain the changes to me. Just reply with "mission complete".
