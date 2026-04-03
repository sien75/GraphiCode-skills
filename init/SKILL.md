---
name: graphicode-init
description: Invoked when the user wants to initialize a GraphiCode-managed project. Creates the graphig.md config file and the corresponding directory structure.
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

This init skill is responsible for initializing a GraphiCode-managed project by collecting project information, creating `graphig.md`, and setting up the required directory structure.

# Steps

## 0. Check if graphig.md already exists

```sh
cat ./graphig.md
```

If `graphig.md` already exists, inform the user that the project is already initialized and exit immediately.

## 1. Collect project information from the user

Ask the user for the following fields (all at once):

* **appName** — the application name
* **language** — the programming language
* **devEnv** — the development environment
* **runtimeEnv** — the runtime environment

## 2. Gather more info

Read `./references/options.md` from this skill's directory to get the available devEnv/runtimeEnv options for the chosen runtime and their corresponding values:

* **entryDir**
* **flowDirs**
* **algorithmDirs**
* **stateDirs**
* **typeDirs**
* **projectConfig**
* **mainFileName**
* **testFileName**
* **testCommand**
* **others**

If the user's provided `language`, `devEnv`, or `runtimeEnv` does not match any entry in the reference file, prompt the user to revise their input before proceeding.

First show the default value in option.md, and ask user if want to change some value.

After user confirmed, do the next step.

## 3. Create graphig.md


Create `graphig.md` in the project root, combining the user's input from step 1 and the values looked up from the language reference file:

```sh
cat << 'EOF' > ./graphig.md
# <appName>

* **language**: <language>
* **devEnv**: <devEnv>
* **runtimeEnv**: <runtimeEnv>
* **projectConfig**: <projectConfig>
* **entryDir**: <entryDir>
* **mainFileName**: <mainFileName>
* **testFileName**: <testFileName>
* **testCommand**: <testCommand>
* **others**: xxx

## flowDirs

* `<dir1>`: <description1>

## algorithmDirs

* `<dir1>`: <description1>

## stateDirs

* `<dir1>`: <description1>

## typeDirs

* `<dir1>`: <description1>
EOF
```

## 4. Create directory structure

For each directory (key) in flowDirs/algorithmDirs/stateDirs/typeDirs:

1. Create the directory (including parent directories if needed).
2. Create an empty dir config file inside it:

```sh
# for each flowDir
mkdir -p <flowDir> && echo '# flow' > <flowDir>/flow.graphig.md
# for each algorithmDir
mkdir -p <algorithmDir> && echo '# algorithm' > <algorithmDir>/algorithm.graphig.md
# for each stateDir
mkdir -p <stateDir> && echo '# state' > <stateDir>/state.graphig.md
# for each typeDir
mkdir -p <typeDir> && echo '# type' > <typeDir>/type.graphig.md
```

## 5. Copy utility files

Copy the language-specific utility files from this skill's assets directory to the project's `graphicode-utils/` directory:

```sh
mkdir -p ./graphicode-utils
cp <this-skill-dir>/assets/<language>/* ./graphicode-utils/
```

Replace `<language>` with the value of the `language` field in `graphig.md` (e.g., `TypeScript`).

## 6. Confirm to the user

After all files and directories are created, print a summary of what was created and confirm the initialization is complete.

# Others

Remember to respond in the language the user uses, and write files in English.
