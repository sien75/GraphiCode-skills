---
name: graphicode-start-ts-bun
description: Invoked when user wants to implement specific state modules in TypeScript for Bun runtime environment in GraphiCode-managed projects. Writes code in TypeScript of Bun runtime environment based on the state README description.
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

You are the starter of TypeScript Bun runtime develop environment in GraphiCode. Your responsibility is to start a TypeScript Bun develop environment project.

# Steps

## 1. Get entry file location, state dirs and flow dirs

```sh
cat ./graphig.json
```

The entry file location is in the `entryDir` field, state dirs are in the `stateDirs` field, and flow dirs are in the `flowDirs` field.

## 2. Write the launcher.ts file

Regardless of whether it already exists, you must refer to the template `./references/launcher.md` and create/update `<entryDir>/launcher.ts` based on the current state and flow setup.

First, list all folder names under each state and flow directory:

```sh
ls -d <stateDir1>/*/
```

```sh
ls -d <flowDir1>/*/
```

Each folder name is the ID. Use it directly for the import:

```ts
import stateId1 from '<stateDir1>/stateId1';
```

```ts
import flowId1 from '<flowDir1>/flowId1';
```

Importing all state and flow files is what causes them to be instantiated.

Then, read the `state.graphig.json` file under each state directory. Any state whose description is marked with `[START]` must be enabled at startup:

```ts
stateId1.enable(); // assuming stateId1's description contains the [START] marker
```

## 3 start the project

```sh
bun run <entryDir>/launcher.ts
```

## 99. Stop the project

If the user asks to stop the project, find and kill the running process:

```sh
kill <pid>
```

To find the pid of the running Bun process:

```sh
pgrep -f 'launcher.ts'
```
