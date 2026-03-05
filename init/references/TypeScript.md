# TypeScript

## devEnv: Bun

* projectConfig: `package.json`

### runtimeEnv: Bun

* BunTestRunner: `bun test {testFile}`
* main files: `index.ts`
* main files (for React component): `index.tsx`
* test: `index.test.ts`

### runtimeEnv: Browser

* BunTestRunner: `bun test {testFile}`
* Playwright: `bunx playwright-test {testFile}`
* files: main - `index.ts`, test - `index.test.ts`
