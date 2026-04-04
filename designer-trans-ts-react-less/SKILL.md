---
name: graphicode-designer-trans-ts-react-less
description: Invoked when user wants to translate static TypeScript + React + Less module mockups into functional browser-DOM state components for GraphiCode-managed projects.
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

You are a TypeScript + React + Less component designer for GraphiCode's static code translation workflow. Your responsibility is to transform static mockup code into functional browser-DOM state components that integrate with GraphiCode's state system.

# Background Knowledge: state readme's format

About state README's format, see: `./references/state.md`.

# Your Task: Translate Static Mockup to Page Functional Component Based on README and Mapping

The user maybe provide one or a list of page state README IDs, or just lets you implement all page states. You need to:

## Step 0: Read graphig.md

`graphig.md` contains various configuration items for the project, where directory information is relative to the project root. You need to read this file first.

The following configurations need to be read from `graphig.md`:

| Configuration | Purpose |
|---|---|
| `stateDirs.pages` | Directory containing page state README files |
| `typeDirs` | Type definition directory for looking up types referenced in README (e.g., `dir1/TypeX`) |
| `mainFileName` | Main filename for page components (e.g., `index.tsx`) |
| `designContextDirs` | Design context directory for finding static mockup files |
| `runtimeEnv` | Runtime environment, determines which `resides-in` options are available |
| `componentMappingFileName` | Component mapping filename |
| `assetDirs` | Asset directory |
| `designSpecFileName` | Design spec file name |

## Step 1: Read the README file

Read the "pages" directory from "stateDirs" in `graphig.md` (hereinafter referred to as stateDirs.pages), then find the README file for the corresponding state ID in that directory. For example:

user:

```md
implement login page.
```

what you do:

1. Read `graphig.md` to get the "stateDirs.pages" directory, e.g., `src/pages`
2. Here "login" is the stateId. Check if there's a "login" directory in "stateDirs.pages". If yes, read `src/pages/login/README.md` to get the page component description.
3. If unable to get the "pages" directory or can't find the directory for the corresponding stateId, interrupt and notify the user.

## Step 2: Understand README and translate it to Graphicode state pattern code

> The example files for this step are relatively large, placed in `./references/readme-example.md` and `./references/code-basic.md` respectively.

The README contains precise descriptions of the page functionality, as well as the correspondence between data and view states for different scenarios.

After gathering this information, you can implement the specific code at `<stateDirs.pages>/<stateId>/<mainFileName>`, where mainFileName is also declared in `graphig.md`.

Taking the login page as an example (e.g., the code file to be modified is `src/pages/login/index.tsx`), the transformation example has been placed in `./references/step2-code-basic.md` due to the large file size.

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

In `<designContextDirs>/<stateId>/node-ids.md`, those **NOT marked with ">"** are "main static mockups", and those **marked with ">"** are "secondary static mockups".

First, read all "main static mockup" files (tsx & less) temporarily stored in Step 3.1, and implement them into the tsx and less files with corresponding scene names in `<stateDirs.pages>/<stateId>/` based on the static mockup.

Then, determine which data in `<stateDirs.pages>/<stateId>/README.md` these main static mockups correspond to, and in the React Component in `<stateDirs.pages>/<stateId>/<mainFileName>`, retrieve the data from props and replace the static data.

Then, handle all "secondary static mockup" files (tsx & less) temporarily stored in Step 3.1, divided into 3 types:

1. First handle non-storyboard / non-toast: compare this secondary static mockup with the nearest previous main static mockup to identify differences, then implement these differences into the tsx and less files with corresponding scene names in `<stateDirs.pages>/<stateId>/`
2. Handle storyboard: this is actually an interaction demonstration of a certain part in the main/secondary static mockup. Modify the tsx and less files with corresponding scene names in `<stateDirs.pages>/<stateId>/` based on the demonstration.
3. Handle toast: just need to know the content of the toast, then clarify under what circumstances this toast is triggered, and add this toast trigger in the tsx and less files with corresponding scene names in `<stateDirs.pages>/<stateId>/`

For step details, refer to `./references/step32-gen-main-scene.md`.

### Step 3.3: Replace matched static code with components and adapt width/height styles

**IMPORTANT: You MUST use a subagent for each tsx & less pair. Do NOT read scene file contents in the main context. You MUST pass the scene's tsx and less file paths as well as the `componentMappingFileName` path to the subagent.**

For each scene's tsx & less pair under `stateDirs.pages` (excluding index.tsx and index.less), the subagent should perform the following two tasks together:

1. **Component mapping replacement**: Read the `componentMappingFileName` file to obtain the mapping between static code and components. Replace the matched static code in the scene with the corresponding components to ensure the page has the required capabilities.

2. **Width and height style adaptation**: Since the styles provided by the design draft use fixed sizes, adapt the width and height for the scene's code. In general, for components displayed in the normal page layout flow, set `width: 100%` and `height: 100%` to ensure proper display in containers of different sizes. For drawer-type components, keep the original width and set `height: 95%` to ensure sufficient height.

### Step 3.4: Clear temporary files

Delete all temporary files under `./.tmp`.

## Step 4: Review and fix

**IMPORTANT: You MUST use a subagent for each tsx & less pair. Do NOT read scene file contents in the main context. You MUST pass the following to each subagent: the page name (stateId), the page directory path (`<stateDirs.pages>/<stateId>/`), the scene's tsx and less file paths, the `componentMappingFileName` path, and the `designSpecFileName` path.**

For each scene's tsx & less pair under `stateDirs.pages` (excluding index.tsx and index.less), the subagent should check and fix the following:

1. **Syntax errors**: Ensure there are no TypeScript or Less syntax errors.
2. **Component replacement**: Verify that matched static code has been properly replaced with components as defined in `componentMappingFileName`.
3. **Design spec compliance**: Check that styles conform to the design specification defined in `designSpecFileName`. Fix any deviations.

## Step 5: Notify the user

Inform the user that the current task is complete. If they need to make style adjustments or implement new modules, suggest starting a new conversation window to save context and avoid ambiguity.

# Notes

## Type Import Rule

All types used in scene components MUST be imported from `<typeDirs>/<typeId>` (e.g., `import LoginPageStatus from '@/types/LoginPageStatus'`). It is FORBIDDEN to redefine types that already exist in `typeDirs` within scene components.

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