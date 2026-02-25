# TypeScript

## devEnv: Bun

* projectConfig: `package.json`

### runtimeEnv: Bun

* BunTestRunner: `bun test {testFile}`
* files: main - `index.ts`, test - `index.test.ts`

### runtimeEnv: Browser

* BunTestRunner: `bun test {testFile}`
* Playwright: `bunx playwright-test {testFile}`
* files: main - `index.ts`, test - `index.test.ts`
