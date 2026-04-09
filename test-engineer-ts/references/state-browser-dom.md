# Browser-DOM State Testing

Browser-DOM state testing verifies that a `browser-DOM` state module renders the correct UI for each data-view mapping described in its README. It uses `chrome-devtools-mcp` to inspect elements and capture screenshots. No automated test framework is needed — testing is driven through a playground and `chrome-devtools-mcp`.

## Prerequisites

- `chrome-devtools-mcp` must be available as an MCP server.

## Step 1: Read graphig.md

Read the project's `graphig.md` to obtain:

| Configuration | Purpose |
|---|---|
| `stateDirs` (pages) | Directory containing page state README files |
| `testFileName` | Test file name — all mock data and test cases go into this file |
| `testReportFileName` | Test report file name — results are appended here |
| `singleFilePlaygroundCommand` | Command to start the playground for a specific module |

## Step 2: Read the README

Locate the README at `<stateDirs.pages>/<stateId>/README.md`. Focus on:

1. **method** — the callable methods and their parameter types
2. **event** — the user interaction events the page captures
3. **state** — the internal state fields and their types
4. **Data and View Mapping** — the key section: each `{ state combination }` maps to a specific UI appearance

**Do NOT read the module's implementation code.** All test design is based solely on the README.

## Step 3: Design mock data from Data-View Mapping

Each entry in the README's "Data and View Mapping" section describes a scenario. For each scenario, construct a mock data object that sets the state fields to the described values.

**Important: mock case names MUST NOT contain spaces** — they are used as URL query values (e.g., `?mock=loginCodeSended`). Use camelCase or hyphens instead.

### Example

Given a README like:

```md
# state
status: LoginPageStatus
email: string
loginCodeCountdown: number

# Data and View Mapping
{ status: 'login' } Initial login form, displaying email/password/code input fields.
{ status: 'loginCodeSended' } Verification code sent, displaying countdown.
{ status: 'loginLogging' } Logging in, displaying loading button.
```

The mock data would be:

```ts
const mockCases = [
  {
    name: 'login-initial',
    state: { status: 'login', email: '', loginCodeCountdown: 0 },
  },
  {
    name: 'login-prefilled',
    state: { status: 'login', email: 'user@example.com', loginCodeCountdown: 0 },
  },
  {
    name: 'loginCodeSended',
    state: { status: 'loginCodeSended', email: 'user@example.com', loginCodeCountdown: 30 },
  },
  {
    name: 'loginLogging',
    state: { status: 'loginLogging', email: 'user@example.com', loginCodeCountdown: 0 },
  },
];
```

Cover at minimum:

- **Every data-view mapping entry** — one mock case per scenario
- **Edge values** — empty strings, zero countdowns, boundary values
- **State field bindings** — e.g., if README says "email display is bound to email state", test that the email value actually appears in the UI

## Step 4: Write testFileName

Write `<stateDirs.pages>/<stateId>/<testFileName>`. This file must export exactly three things for the playground script to consume:

| Export | Type | Description |
|---|---|---|
| `default` | React Component | The connected component to render |
| `mockCases` | `{ name: string, state: object }[]` | Mock data for each scenario |
| `stateInstance` | State instance | The state class instance (playground will call `enable()` on it) |
| `stateChangeEventName` | `string` | The state change event name used to trigger re-render (e.g., `'LoginPageState.__stateChange'`) |

The playground script handles URL query parsing (`?mock=<caseName>`), `stateInstance.enable()`, state injection via `stateInstance._publish(stateChangeEventName, mockState)`, and rendering.

The module's `<mainFileName>` always exports `default` (the page component), `stateInstance`, and `stateChangeEventName` with fixed names. **You MUST NOT read the implementation file** — just import these fixed exports directly.

### Example

```tsx
import Page, { stateInstance, stateChangeEventName } from './index';

// ===== Mock Data =====

export const mockCases = [
  {
    name: 'login-initial',
    state: { status: 'login', email: '', loginCodeCountdown: 0, forgetPasswordCodeCountdown: 0 },
  },
  {
    name: 'loginCodeSended',
    state: { status: 'loginCodeSended', email: 'user@example.com', loginCodeCountdown: 30, forgetPasswordCodeCountdown: 0 },
  },
  {
    name: 'loginLogging',
    state: { status: 'loginLogging', email: 'user@example.com', loginCodeCountdown: 0, forgetPasswordCodeCountdown: 0 },
  },
];

// ===== Export component =====

export default Page;
export { stateInstance, stateChangeEventName };
```

The playground script will pick up the exported `mockCases` and default component, handle URL query parsing (`?mock=<caseName>`), state injection, and rendering automatically.

### Key points

- **Mock case names must not contain spaces** — they are used as URL query values.
- The file imports directly from the module's `<mainFileName>` — do NOT import from internal/private files.

## Step 5: Execute

The playground requires `esbuild`. Before running, read the `<projectConfig>` file (e.g., `package.json`) to check whether `esbuild` is already installed. If not:

1. Ask the user for permission to install `esbuild` as a devDependency.
2. If approved, install it and add `esbuild` to `feLibraries` in `graphig.md`.

Then proceed:

1. Run `<singleFilePlaygroundCommand> <stateDirs.pages>/<stateId>` and read the port number from stdout.
2. For each mock case:
   - Navigate to `http://localhost:<port>?mock=<mockCase.name>` via `chrome-devtools-mcp`.
   - Inspect the page (elements and screenshot) and judge whether the UI matches the README's data-view mapping description for this scenario.
3. Close the playground process.
4. Append results to `<stateDirs.pages>/<stateId>/<testReportFileName>` (where `testReportFileName` is read from `graphig.md`). Include: which cases passed, which failed, and the reasoning.
