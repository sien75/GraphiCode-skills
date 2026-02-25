# graphig.json

`graphig.json` is the root configuration file of a GraphiCode-managed project, located in the project root directory. Its format is as follows:

```json
{
  "appName": "GcSample",
  "language": "TypeScript",
  "devEnv": "Bun",
  "runtimeEnv": "Bun",
  "projectConfig": "bunfig.toml",
  "mainFileName": "main.ts",
  "testFileName": "main.test.ts",
  "testCommand": "bun test",
  "flowDirs": { "src/flows": "default flow directory" },
  "algorithmDirs": { "src/algorithms": "default algorithm directory" },
  "stateDirs": { "src/states": "default state directory" },
  "typeDirs": { "src/types": "default type directory" }
}
```

* **appName** — the application name
* **language** — the programming language used
* **devEnv** — the development environment
* **runtimeEnv** — the runtime environment
* **projectConfig** — the project configuration file name (e.g., `package.json`, `bunfig.toml`)
* **mainFileName** — the main entry file name
* **testFileName** — the test file name
* **testCommand** — the command to run tests
* **flowDirs** — directories containing flow files (object: key is directory path, value is directory description)
* **algorithmDirs** — directories containing algorithm files (object: key is directory path, value is directory description)
* **stateDirs** — directories containing state files (object: key is directory path, value is directory description)
* **typeDirs** — directories containing type files (object: key is directory path, value is directory description)
