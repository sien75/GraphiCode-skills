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


## devEnv Node.js

### runtimeEnv: Browser

dir config:

> must have these 4 kind of dirs

* entryDir: `src/entry`
* flowDirs: `src/flows`
* algorithmDirs: `src/algorithms`
* stateDirs:
  * `src/pages` (for pages)
  * `src/states` (for normal state management)

* componentDirs: `src/components`
* designContextDirs: `context/design`
* productContextDirs: `context/product`
* assetDirs: `src/assets`
* utilsDir: `src/graphicode-utils`

filename config:

* mainFileName: `index.ts`, `index.tsx` ( for React component )
* testFileName: `index.test.ts`
* typeFileName: `types.ts`
* testReportFileName: `testReport.md`

command config:

* testCommand: `vitest`

dependency config:

* projectConfig: `package.json`
* feMainLibrary: `react`
* feLibraries: `antd`, `vite`, `vitest`

design config:

* designDraftSource: `figma`
* figmaFileKeyFileName: `<designContextDirs>/basic.md`

* componentMappingFileName: `COMPONENT-MAPPING.md`
* designSpecFileName: `DESIGN_SPEC.md`
* designChangeLogFileName: `DESIGN_CHANGE_LOG.md`

