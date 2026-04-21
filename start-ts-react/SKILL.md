---
name: graphicode-start-ts-react
description: Invoked when user wants to start a TypeScript React development environment project in GraphiCode-managed projects. Creates the launcher.ts entry file that imports and initializes all states and flows, and enables states marked with [START].
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

You are the starter of TypeScript React runtime develop environment in GraphiCode. Your responsibility is to start a TypeScript React develop environment project.

# Steps

## 1. Get entry file location, state dirs and flow dirs

```sh
cat ./graphig.md
```

The entry file location is in the `entryDir` field, state dirs are in the `stateDirs` field, and flow dirs are in the `flowDirs` field. The `writingLanguage` field specifies the natural language for writing comments and descriptions.

## 2. Define DESIGN_MODE environment variable

Read the project's build configuration to determine which build tool is used (e.g., Vite, Webpack, etc.), then define `process.env.DESIGN_MODE` accordingly so it is available at compile time.

For example, for a Vite project, add to `vite.config.ts`:

```ts
define: {
  'process.env.DESIGN_MODE': JSON.stringify(process.env.DESIGN_MODE || ''),
},
```

For Webpack, add via `DefinePlugin`:

```ts
new webpack.DefinePlugin({
  'process.env.DESIGN_MODE': JSON.stringify(process.env.DESIGN_MODE || ''),
}),
```

Adapt to whichever build tool the project actually uses.

## 3. Add design mode startup command

Add a `design` script to `package.json` that sets `DESIGN_MODE=1` and starts the dev server:

```json
{
  "scripts": {
    "design": "DESIGN_MODE=1 <existing-dev-command>"
  }
}
```

Replace `<existing-dev-command>` with the project's actual dev start command (e.g., `vite`, `umi dev`, `react-scripts start`, etc.). This is the command designers use to run the project.

## 4. Write the launcher.ts file

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

Then, read the `state.graphig.md` file under each state directory. Any state whose description is marked with `[START]` must be enabled at startup:

```ts
stateId1.enable(); // assuming stateId1's description contains the [START] marker
```

## 5. Import launcher.ts in the project's entry file

For React projects, you need to first find the project's entry file. The entry file is typically the first file that executes when the application starts, for example `src/app.tsx`, `src/index.tsx`, `src/main.tsx`, etc. You can check the project's build configuration or look at common entry file locations to determine which file it is.

Once the entry file is identified, import `launcher.ts` at the top of it. Make sure the import does not affect any other existing code in the entry file:

```ts
import '<entryDir>/launcher';

// ... rest of the existing entry file code remains unchanged
```

# Notes

Write comments in the `writingLanguage` configured in `graphig.md`.
