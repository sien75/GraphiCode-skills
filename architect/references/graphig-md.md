# graphig.md

`graphig.md` is the root configuration file of a GraphiCode-managed project, located in the project root directory. Its format is as follows:

```markdown
# GcSample

* **language**: TypeScript
* **devEnv**: Bun
* **runtimeEnv**: Bun
* **projectConfig**: bunfig.toml
* **mainFileName**: main.ts
* **testFileName**: main.test.ts
* **testCommand**: bun test

## flowDirs

* `src/flows`: default flow directory

## algorithmDirs

* `src/algorithms`: default algorithm directory

## stateDirs

* `src/states`: default state directory

## typeDirs

* `src/types`: default type directory
```

* appName — the application name (Header 1)
* language — the programming language used
* devEnv — the development environment
* runtimeEnv — the runtime environment
* projectConfig — the project configuration file name (e.g., `package.json`, `bunfig.toml`)
* mainFileName — the main entry file name
* testFileName — the test file name
* testCommand — the command to run tests
* flowDirs — directories containing flow files (bullet points under `## flowDirs`)
* algorithmDirs — directories containing algorithm files (bullet points under `## algorithmDirs`)
* stateDirs — directories containing state files (bullet points under `## stateDirs`)
* typeDirs — directories containing type files (bullet points under `## typeDirs`)
