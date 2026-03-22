# lang: TypeScript

## devEnv: Bun

* projectConfig: `package.json`

### runtimeEnv: Bun

* entryDir: `src/entry`
* flowDirs: `src/flows`
* algorithmDirs: `src/algorithms`
* stateDirs: `src/states`
* typeDirs: `src/types`
* projectConfig: `package.json`
* mainFileName: `index.ts`, `index.tsx` ( for React component )
* testFileName: `index.test.ts`
* testCommand: `bun test {testFile}`


### runtimeEnv: Umi

* entryDir: `src/entry`
* flowDirs: `src/flows`
* algorithmDirs: `src/algorithms`
* stateDirs: `src/pages` (for UI components and routing pages), `src/states` (for global state management), `src/constants` (for static configuration and constant values)
* typeDirs: `src/types`
* projectConfig: `package.json`
* mainFileName: `index.ts`, `index.tsx` ( for React component )
* testFileName: `index.test.ts`
* testCommand: `bun test {testFile}`

<!-- ### runtimeEnv: Browser

* test runner: `bun test {testFile}`
* Playwright: `bunx playwright-test {testFile}`
* files: main - `index.ts`, test - `index.test.ts` -->