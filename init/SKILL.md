---
name: graphicode-init
description: Invoked when the user wants to initialize a GraphiCode-managed project. Creates the graphig.json config file and the corresponding directory structure.
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

This init skill is responsible for initializing a GraphiCode-managed project by collecting project information, creating `graphig.json`, and setting up the required directory structure.

# Steps

## 0. Check if graphig.json already exists

```sh
cat ./graphig.json
```

If `graphig.json` already exists, inform the user that the project is already initialized and exit immediately.

## 1. Collect project information from the user

Ask the user for the following fields (all at once):

* **appName** — the application name
* **language** — the programming language (e.g., TypeScript, Python)
* **devEnv** — the development environment (e.g., Bun, Node.js, Deno)
* **runtimeEnv** — the runtime environment (e.g., Bun, Node.js, Browser)
* **flowDirs** — directories for flow files (e.g., `{ "src/flows": "default flow directory" }`)
* **algorithmDirs** — directories for algorithm files (e.g., `{ "src/algorithms": "default algorithm directory" }`)
* **stateDirs** — directories for state files (e.g., `{ "src/states": "default state directory" }`)
* **typeDirs** — directories for type files (e.g., `{ "src/types": "default type directory" }`)

If the user is unsure about any field, suggest reasonable defaults based on the project context.

## 2. Create graphig.json

First, read `./references/<language>.md` (e.g., `./references/TypeScript.md`) from this skill's directory to get the available devEnv/runtimeEnv options and their corresponding `projectConfig`, `mainFileName`, `testFileName`, `testCommand` values.

If the user's provided `language`, `devEnv`, or `runtimeEnv` does not match any entry in the reference file, prompt the user to revise their input before proceeding.

Then create `graphig.json` in the project root, combining the user's input from step 1 and the values looked up from the language reference file:

```sh
echo '{
  "appName": "<appName>",
  "language": "<language>",
  "devEnv": "<devEnv>",
  "runtimeEnv": "<runtimeEnv>",
  "projectConfig": "<projectConfig>",
  "mainFileName": "<mainFileName>",
  "testFileName": "<testFileName>",
  "testCommand": "<testCommand>",
  "flowDirs": { "<dir1>": "<description1>" },
  "algorithmDirs": { "<dir1>": "<description1>" },
  "stateDirs": { "<dir1>": "<description1>" },
  "typeDirs": { "<dir1>": "<description1>" }
}' > ./graphig.json
```

## 3. Create directory structure

For each directory (key) in flowDirs/algorithmDirs/stateDirs/typeDirs:

1. Create the directory (including parent directories if needed).
2. Create an empty dir config file inside it:

```sh
# for each flowDir
mkdir -p <flowDir> && echo '{}' > <flowDir>/flow.graphig.json
# for each algorithmDir
mkdir -p <algorithmDir> && echo '{}' > <algorithmDir>/algorithm.graphig.json
# for each stateDir
mkdir -p <stateDir> && echo '{}' > <stateDir>/state.graphig.json
# for each typeDir
mkdir -p <typeDir> && echo '{}' > <typeDir>/type.graphig.json
```

## 4. Copy utility files

Copy the language-specific utility files from this skill's assets directory to the project's `graphicode-utils/` directory:

```sh
mkdir -p ./graphicode-utils
cp <this-skill-dir>/assets/<language>/* ./graphicode-utils/
```

Replace `<language>` with the value of the `language` field in `graphig.json` (e.g., `TypeScript`).

## 5. Confirm to the user

After all files and directories are created, print a summary of what was created and confirm the initialization is complete.

# Others

Remember to respond in the language the user uses, and write files in English.
