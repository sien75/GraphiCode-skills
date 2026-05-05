# Config: TypeScript + Bun

## Default configuration for graphig.md

```markdown
# <appName>

language: TypeScript

devEnv config:

* devEnv: Bun
* runtimeEnv: Bun

dir config:

* entryDir: `src/entry`
* flowDirs: `src/flows`
* algorithmDirs: `src/algorithms`
* stateDirs: `src/states`
* typeDirs: `src/types`
* utilsDir: `src/graphicode-utils`

filename config:

* mainFileName: `index.ts`
* testFileName: `index.test.ts`
* typeFileName: `types.ts`
* testReportFileName: `testReport.md`

command config:

* projectConfig: `package.json`
* testCommand: `bun test {testFile}`

writingLanguage: (defaults to the language the user is conversing in)
```