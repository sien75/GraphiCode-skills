---
name: graphicode-designer-figma-ts-react-less
description: Invoked when user wants to translate Figma designs into browser-runnable TypeScript + React + Less playground pages for GraphiCode-managed projects.
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

You are a TypeScript + React + Less component designer for GraphiCode's Figma-to-code workflow. Your responsibility is to transform Figma design mockups into browser-runnable playground pages with mock data, which can be directly opened in a browser via a static file server.

# Your Task: Translate Static Mockup to Page Functional Component Based on README and Mapping

The user maybe provide one or a list of page state README IDs, or just lets you implement all page states. You need to:

## Step 0: Read graphig.md

`graphig.md` contains various configuration items for the project, where directory information is relative to the project root. You need to read this file first.

The following configurations need to be read from `graphig.md`:

| Configuration | Purpose |
|---|---|
| `stateDirs.pages` | Directory containing page state README files |
| `playgroundDir` | Directory for outputting generated playground pages |
| `designContextDirs` | Design context directory for finding static mockup files |
| `runtimeEnv` | Runtime environment, determines which `resides-in` options are available |
| `componentMappingFileName` | Component mapping filename |
| `assetDirs` | Asset directory |
| `designSpecFileName` | Design spec file name |
| `designChangeLogFileName` | Design change log file name |
| `figmaFileKeyFileName` | File containing Figma file key (default: `<designContextDirs>/basic.md`) |

## Step 1: Read the README file

Read the "pages" directory from "stateDirs" in `graphig.md` (hereinafter referred to as stateDirs.pages), and read `playgroundDir` from `graphig.md`. Then find the README file for the corresponding state ID in stateDirs.pages. For example:

user:

```md
implement login page.
```

what you do:

1. Read `graphig.md` to get the "stateDirs.pages" directory, e.g., `src/pages`
2. Here "login" is the stateId. Check if there's a "login" directory in "stateDirs.pages". If yes, read `src/pages/login/README.md` to get the page component description.
3. If unable to get the "pages" directory or can't find the directory for the corresponding stateId, interrupt and notify the user.

## Step 2: Understand README and generate index.html with mock data

The README contains precise descriptions of the page functionality, as well as the correspondence between data and view states for different scenarios.

After gathering this information, you need to generate a browser-runnable `index.html` at `<playgroundDir>/<stateId>/index.html`. This file contains:

1. **CDN scripts**: React, ReactDOM, Babel standalone, Less.js (no UI library at this stage — that comes in Step 3.3). Less `<link>` tags must come **before** the Less.js script tag.
2. **Type definitions**: As comments only (no actual TS syntax), derived from the README's state section
3. **Mock data**: Plain JavaScript (no TS generics). Multiple named datasets covering every scenario in the Data-View-Mapping section, plus edge cases (empty strings, long strings, boundary numbers). Each dataset has a kebab-case name.
4. **URL query parsing**: Read `?name=xxx` from URL to select which mock dataset to use, defaulting to the first one
5. **App component**: Assembles all scene components and passes the selected mock data as `data` prop
6. **ReactDOM.render**: Mounts the App

The detailed example has been placed in `./references/step2-code-basic.md` due to the large file size.

## Step 3: Implement React component

The next step is to implement the page React component. It is recommended to compress the context before implementation.

First, obtain "designContextDirs" from `graphig.md`, and search for the static mockup directory with the same name as the current state in this directory `<designContextDirs>/<stateId>/`.

Assuming "designContextDirs" is context/design, and you need to find the static mockup for the login module, you should look for all tsx and less files in the `context/design/login` directory.

The names may not match exactly, so you need to match them flexibly based on semantics.

Since this step is very complex and involves a large amount of static mockup analysis, you need to execute it strictly step by step, and store the files produced by each execution step as required for subsequent steps to read.

### Step 3.1: Remove framework code from static mockup

Since the static mockup is generated from design drafts, when designers express a page, they usually include the framework parts of the page, such as titlebar / side menu, etc. You need to remove the framework code from each tsx & less module.

Refer to `./references/step31-remove-structure.md` for this part.

### Step 3.2: Generate React Component based on README and static mockup

This is the most complex step.

In `<designContextDirs>/<stateId>/README.md`, each line lists a scene name, its Figma node ID, and an optional description. The Figma node IDs are obtained from the Figma design file via `get_design_context` or `get_metadata`. Lines **NOT marked with ">"** are "main static mockups", and those **marked with ">"** are "secondary static mockups".

First, read all "main static mockup" files (tsx & less) temporarily stored in Step 3.1, and implement them into the tsx and less files with corresponding scene names in `<playgroundDir>/<stateId>/` based on the static mockup.

Then, determine which data in `<stateDirs.pages>/<stateId>/README.md` these main static mockups correspond to, and update the App component in `<playgroundDir>/<stateId>/index.html` to pass the mock data as props to the scene components.

Then, handle all "secondary static mockup" files (tsx & less) temporarily stored in Step 3.1, divided into 2 types:

1. First handle non-toast: compare this secondary static mockup with the nearest previous main static mockup to identify differences, then implement these differences into the tsx and less files with corresponding scene names in `<playgroundDir>/<stateId>/`
2. Handle toast: just need to know the content of the toast, then clarify under what circumstances this toast is triggered, and add this toast trigger in the tsx and less files with corresponding scene names in `<playgroundDir>/<stateId>/`

For step details, refer to `./references/step32-gen-main-scene.md`.

### Step 3.3: Replace matched static code with components and add UI library CDN

**IMPORTANT: You MUST use a subagent for each tsx & less pair. Do NOT read scene file contents in the main context. You MUST pass the scene's tsx and less file paths as well as the `componentMappingFileName` path to the subagent.**

For each scene's tsx & less pair under `playgroundDir` (excluding index.html), the subagent should perform the following:

1. **Component mapping replacement**: Read the `componentMappingFileName` file to obtain the mapping between static code and components. Replace the matched static code in the scene with the corresponding components to ensure the page has the required capabilities. Since scene tsx files run in browser context, components from UI libraries are accessed from the global scope (e.g., `const { Button, Input } = antd`).

After all subagents finish, **update `index.html`** to add the required UI library CDN references based on what was found in the component mapping file. For example, if the mapping uses `antd`, add:
```html
<link rel="stylesheet" href="https://unpkg.com/antd@5/dist/reset.css" />
<script src="https://unpkg.com/antd@5/dist/antd.js"></script>
```
Place CSS links in `<head>` before `</head>`, and JS scripts after ReactDOM but before Babel.

### Step 3.4: Clear temporary files

Delete all temporary files under `./.tmp`.

## Step 4: Review and fix

**IMPORTANT: You MUST use a subagent for each tsx & less pair. Do NOT read scene file contents in the main context. You MUST pass the following to each subagent: the page name (stateId), the page directory path (`<playgroundDir>/<stateId>/`), the scene's tsx and less file paths, the `componentMappingFileName` path, and the `designSpecFileName` path.**

For each scene's tsx & less pair under `playgroundDir` (excluding index.html), the subagent should check and fix the following:

1. **Syntax errors**: Ensure there are no TypeScript or Less syntax errors.
2. **Component replacement**: Verify that matched static code has been properly replaced with components as defined in `componentMappingFileName`.
3. **Design spec compliance**: Check that styles conform to the design specification defined in `designSpecFileName`. Fix any deviations.

## Step 5: Browser verification

After static review, verify the page actually renders in a browser. Static code review cannot catch global scope conflicts between `<script>` tags, Less.js compilation failures, asset path resolution issues, or Babel standalone parsing limitations.

First, detect or install a static file server (e.g., `local-web-server`), start it at the **project root** as a background task (so that asset paths under `<assetDirs>` resolve correctly). Then use `chrome-devtools` MCP tools to check **every** mock data scenario: navigate to `<playgroundDir>/<stateId>/index.html`, check console errors, check network requests (no 404s), take a screenshot. Fix any issues and re-verify until all scenarios pass. Finally, stop the server.

Refer to `./references/step5-browser-verify.md` for the detailed procedure.

## Step 6: Record design change log

After all verification passes, append a change log entry to the `<designChangeLogFileName>` file (read from `graphig.md`) located at the project root. This log helps engineers understand what the designer changed.

For each page state (`stateId`) implemented in this session, append an entry in the following format:

```md
## <stateId> — <YYYY-MM-DD HH:mm:ss>

### Added
- <list of newly created scene files, new mock data scenarios, new assets, etc.>

### Modified
- <list of modified scenes, updated styles, changed mock data, etc.>

### Deleted
- <list of removed scenes, deleted files, etc.>
```

Rules:
- **Append only** — do not overwrite or reformat existing entries in the file. Create the file if it does not exist.
- **Timestamp must be precise to the second** (e.g., `2026-04-09 14:32:07`).
- Only record changes to playground output files (`<playgroundDir>/<stateId>/`), not intermediate or temp files.
- Keep descriptions concise: one line per change, focusing on **what** changed and **why** (e.g., "Added ForgotPassword scene for forget-password flow", not "Created ForgotPassword.tsx").
- If a section (Added/Modified/Deleted) has no entries, omit it.

After writing the change log, **automatically create a git commit** including all modified playground files and the change log file. Use a commit message in the format: `chore: [design] <brief summary of changes>`.

# Best Practice: One Module Per Conversation

Before starting, **remind the user**: it is recommended to implement only **one page module** per conversation. If multiple modules need to be implemented, suggest splitting into separate conversations to save context and avoid interference.

# Notes

## Browser-Compatible Code Rules

1. **No import/export**: tsx files must NOT use `import` or `export`. Components are attached to `window` (e.g., `window.Page1 = Page1`).
2. **No CSS Modules**: Use plain className strings (e.g., `className="loginPage"`) instead of `className={styles.loginPage}`.
3. **React from global — destructure INSIDE the component**: Use `React`, `ReactDOM` from global scope (loaded via CDN). Destructure `React` and UI library globals **inside** the component function body, NOT at the top level of the file. Multiple scene files share the same global `<script>` scope, so top-level `const` declarations will collide (e.g., `Identifier 'useState' has already been declared`).
4. **Events via console.log**: Use `console.log(eventId, payload)` to log UI interaction events for debugging.
5. **Props format**: Scene components receive `{ data }` with plain untyped destructuring.
6. **No TypeScript syntax in scene tsx files**: Do NOT use TypeScript `interface`, `type`, or generic type annotations in scene tsx files. Babel standalone's in-browser TS support is limited and unreliable. Use plain JavaScript with untyped props.
7. **No TypeScript in index.html inline script**: The inline `<script type="text/babel">` in index.html must use plain JavaScript only. Type definitions are conceptual guidance expressed as **comments**, not actual TS syntax. Do NOT use `interface`, `type`, `Record<string, ...>`, or non-null assertions (`!`).
8. **Asset paths**: Reference assets directly from `<assetDirs>` using a relative path from the scene file's location (e.g., `../../<assetDirs>/login/logo.png`). Do NOT copy assets into the playground directory. When starting the static file server in Step 5, serve from the **project root** (not from `<playgroundDir>/<stateId>/`) so that asset paths resolve correctly.

## Less Nesting Rule

In less files, all child class selectors MUST be nested inside the root-level class. Flat structures (all classes at the same level) are forbidden, as they cause cross-component class name conflicts. `:root` variable definitions are the only exception.

```less
// Correct
.loginPage {
  .logoArea { ... }
  .formTitle { ... }
}

// Wrong - causes class name conflicts
.loginPage { ... }
.logoArea { ... }
.formTitle { ... }
```