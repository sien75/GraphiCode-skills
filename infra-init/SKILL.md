---
name: graphicode-infra-init
description: The initializer in the infra group. Sets up a new GraphiCode-managed project with the directory structure, configuration, and runtime utilities.
license: See LICENSE file.
---

GraphiCode is a programming tool where the **flow DSL is the connection-layer SSOT**. The initializer scaffolds a new project with the directory structure, configuration, and runtime utilities needed for GraphiCode to work.

You are the **initializer** for GraphiCode's infra group. Your responsibility is to set up a new GraphiCode-managed project from scratch.

# Reference

Runtime-specific config: `./references/config-<runtimeEnv>.md` (e.g., `config-Browser.md`, `config-Bun.md`).

Runtime-specific assets: `./assets/<language>-<runtimeEnv>/` (e.g., `TypeScript-Browser/`, `TypeScript-Bun/`).

Shared assets: `./assets/<language>/` (e.g., `TypeScript/`).

When setting up a project, read `graphig.md` to determine `language` and `runtimeEnv`, then use the matching config and assets.

# Steps

## 0. Check if graphig.md already exists

```sh
cat ./graphig.md
```

If `graphig.md` already exists, inform the user that the project is already initialized and exit immediately.

## 1. Collect project information from the user

Ask the user for the following fields (all at once):

* **appName** — the application name
* **language** — the programming language (e.g., `TypeScript`)
* **runtimeEnv** — the runtime environment (e.g., `Browser`, `Bun`)

The `devEnv` field is determined by `runtimeEnv`.

## 2. Confirm configuration

Read `./references/config-<runtimeEnv>.md` from this skill's directory to get the standard configuration values for the chosen runtime environment.

Show the user the full configuration and ask if they want to change any values. After the user confirms, proceed.

## 3. Create graphig.md

Create `graphig.md` in the project root with the confirmed configuration. See `./references/config-<runtimeEnv>.md` for the format.

```sh
cat << 'EOF' > ./graphig.md
# <appName>

...config content...
EOF
```

## 4. Create directory structure

For each directory in flowDirs/algorithmDirs/stateDirs in `graphig.md`:

1. Create the directory (including parent directories if needed).
2. Create an empty dir config file inside it:

```sh
# for each flowDir
mkdir -p <flowDir> && echo '# flow' > <flowDir>/flow.graphig.md
# for each algorithmDir
mkdir -p <algorithmDir> && echo '# algorithm' > <algorithmDir>/algorithm.graphig.md
# for each stateDir
mkdir -p <stateDir> && echo '# state' > <stateDir>/state.graphig.md
```

Also create the entry directory and other config directories as specified in `graphig.md`.

## 5. Copy utility files

Copy the shared and runtime-specific utility files from this skill's assets directory to the project's `utilsDir`:

```sh
mkdir -p <utilsDir>
cp <this-skill-dir>/assets/<language>/* <utilsDir>/
cp <this-skill-dir>/assets/<language>-<runtimeEnv>/* <utilsDir>/
```

Shared files are overwritten by runtime-specific files if names collide (e.g., `index.ts`).

## 6. Confirm to the user

After all files and directories are created, print a summary of what was created and confirm the initialization is complete.

# Others

Remember to respond in the language the user uses.

Write file content (descriptions, READMEs, comments) in the `writingLanguage` configured in `graphig.md`.