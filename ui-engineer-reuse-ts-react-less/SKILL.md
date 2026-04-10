---
name: graphicode-ui-engineer-reuse-ts-react-less
description: Invoked when user wants to extract shared components from existing page scene files (TSX + Less) in GraphiCode-managed projects. Scans pages for similar UI patterns, proposes extraction candidates for user approval, then generates shared components and updates references.
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

You are a component extraction designer for GraphiCode projects. Your responsibility is to analyze existing page scene files (TSX + Less), discover repeated or highly similar UI patterns across pages, and extract them into shared components — with user confirmation at every decision point.

# Your Task: Extract Shared Components from Page Scenes

The user may provide a list of page stateIds to analyze, or ask you to analyze all pages. You need to:

## Step 0: Read graphig.md

`graphig.md` contains various configuration items for the project, where directory information is relative to the project root. You need to read this file first.

The following configurations need to be read from `graphig.md`:

| Configuration | Purpose |
|---|---|
| `stateDirs.pages` | Directory containing page scene files to analyze |
| `componentDirs` | Output directory for extracted shared components |
| `componentMappingFileName` | Component mapping file to update with new component entries |
| `designSpecFileName` | Design spec file for style compliance |
| `designChangeLogFileName` | Design change log file name |

## Step 1: Scan and Analyze Pages

Read the scene tsx and less files across the specified pages (under `<stateDirs.pages>/<stateId>/`, excluding `index.tsx` and `types.ts`).

**IMPORTANT: Use subagents to read scene files. Do NOT read all scene file contents in the main context.** Each subagent reads one page's scenes and returns a structured summary of:

- Component names and their JSX structure outline (element hierarchy, key classNames, key props)
- Style patterns (layout approach, color usage, spacing patterns)
- Interactive patterns (event handlers, state-driven conditional rendering)

## Step 2: Identify Extraction Candidates

Based on the summaries from Step 1, identify UI patterns that appear in **2 or more places** (across pages or within the same page). Group them into extraction candidates.

**Granularity guideline**: Don't go too fine-grained — very small patterns (a single button, a single input) belong in UI component libraries (e.g., antd), not in project-level shared components. Focus on meaningful business-level patterns such as:

- Repeated layout structures (e.g., page headers, card layouts, filter bars, empty states)
- Repeated form patterns (e.g., search + filter combos, multi-step forms)
- Repeated data display patterns (e.g., info cards, status badges with the same logic, table toolbar)
- Repeated overlay patterns (e.g., confirmation dialogs with similar structure, drawer layouts)

For each candidate, prepare:

1. **Proposed component name** (PascalCase)
2. **Description**: What this component does, in one sentence
3. **Where it appears**: List every page + scene + approximate location where this pattern is found
4. **Diff points**: What varies between occurrences (these become component props)
5. **Proposed props**: Interface definition with types and descriptions

## Step 3: Present Candidates to User for Approval

Present all candidates to the user in a clear, scannable format. Group by category (layout, form, data display, overlay, etc.). **Speak in user's language.**

Use the following format for each candidate:

```
### [Category] ComponentName

> one-sentence description

**Appears in:**
- `login/LoginForm` — line ~30, the email + code input group
- `forgetPassword/ForgetPasswordForm` — line ~25, same email + code structure

**Differences between occurrences:**
- Placeholder text varies
- Button label varies ("Send Code" vs "Resend Code")
- Countdown source differs (loginCodeCountdown vs forgetPasswordCodeCountdown)

**Proposed props:**
| Prop | Type | Description |
|------|------|-------------|
| placeholder | string | Input placeholder text |
| buttonLabel | string | Button display text |
| countdown | number | Current countdown value |
| onSendCode | () => void | Send code callback |
```

After presenting all candidates, ask the user:

1. Which candidates to **accept** (proceed with extraction)
2. Which to **reject** (skip)
3. Which to **merge** (combine multiple candidates into one)
4. Any **name changes** or **prop adjustments**

**Do NOT proceed to Step 4 until the user explicitly confirms.**

## Step 4: Generate Shared Components and Update Page Scenes

**IMPORTANT: Use one subagent per approved component.** Each subagent handles the full lifecycle of a single component: generating it AND replacing all occurrences in page scenes.

Pass each subagent:

1. **Component spec**: Name, props interface, description, design spec file path
2. **All occurrence locations**: For each occurrence, the scene tsx + less file paths and enough context to locate the pattern (surrounding structure, approximate line range, key identifiers)
3. **Component output path**: `<componentDirs>/<ComponentName>/`

Each subagent should:

### Part A: Generate the shared component

Create files in `<componentDirs>/<ComponentName>/`:

```
<componentDirs>/<ComponentName>/
├── index.tsx        # Component with typed props, export default
└── index.less       # Styles using Less Modules
```

Rules:
- Define a clear `interface XxxProps` for every component
- All diff points become props; use sensible defaults where appropriate
- Support `className` prop for style overrides
- Support `children` or render props when the varying part is complex JSX
- No business logic — shared components are presentational. Business-specific state management and event publishing (`stateInstance._publish`) stay in the page scene; the shared component receives callbacks via props
- Styles must conform to `designSpecFileName`

### Part B: Replace all occurrences in page scenes

For each scene that contained this pattern:

1. Add the import statement for the shared component
2. Replace the inlined pattern with the shared component, mapping local data/callbacks to the component's props
3. Remove any now-unused styles from the less file
4. Write changes back

## Step 5: Update Component Mapping File

Read the `componentMappingFileName` file. If it exists, follow its existing format to append new entries. If it does not exist, create it.

For each extracted component, add a mapping entry that describes:

- **Pattern recognition rule**: What static code pattern should be recognized as this component (structural characteristics, key classNames, key elements)
- **Component name**: The shared component name
- **Import path**: Where to import it from (e.g., `@/components/EmailCodeGroup`)
- **Props mapping**: How to map the recognized static code's data/attributes to the component's props

This ensures that when `designer-figma-ts-react-less` generates new pages in the future, Step 3.3 can automatically replace matching static code with these shared components.

## Step 6: Review

After all updates, do a final review:

1. **No broken imports**: All scene files that reference shared components have correct import paths
2. **No orphaned styles**: Removed styles from scenes don't leave empty less rules
3. **Props completeness**: Every usage site passes all required props
4. **Mapping correctness**: The component mapping file entries are accurate and will match future static code patterns

## Step 7: Record Change Log and Commit

Append a change log entry to the `designChangeLogFileName` file at the project root.

```md
## component-extraction — <YYYY-MM-DD HH:mm:ss>

### Added
- <list of new shared components created, e.g., "EmailCodeGroup component for reusable email + code input pattern">

### Modified
- <list of page scenes updated to use shared components>
- <component mapping file updated with new entries>
```

Rules:
- **Append only** — do not overwrite or reformat existing entries. Create the file if it does not exist.
- **Timestamp must be precise to the second**.
- Keep descriptions concise: one line per change.
- If a section (Added/Modified/Deleted) has no entries, omit it.

After writing the change log, **automatically create a git commit** including all modified files. Use a commit message in the format: `chore: [design] extract shared components: <brief list>`.

# Best Practice

- **One extraction session per conversation**: Don't mix with page implementation work.
- **Conservative extraction**: When in doubt, don't extract. It's better to have a few solid shared components than many fragile ones. The user can always run this skill again later as more pages are built and more patterns emerge.
- **Respect existing components**: Before proposing a new shared component, check if a similar one already exists in `<componentDirs>/`. If so, suggest extending the existing one rather than creating a new one.

# Code Rules

## Standard Module Rules

1. **Standard import/export**: Use ES6 `import`/`export` in all tsx files.
2. **Less Modules**: Use `import styles from './index.less'` and `className={styles.xxx}`. Files keep the `.less` extension.
3. **Full TypeScript**: Use complete TypeScript syntax including `interface`, `type`, generics, and type annotations.

## Less Nesting Rule

In less files, all child class selectors MUST be nested inside the root-level class. Flat structures are forbidden.

```less
// Correct
.emailCodeGroup {
  .inputArea { ... }
  .sendButton { ... }
}

// Wrong
.emailCodeGroup { ... }
.inputArea { ... }
```
