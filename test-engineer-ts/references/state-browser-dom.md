# Browser-DOM State Testing

Browser-DOM state testing verifies that a `browser-DOM` state module renders the correct UI for each data-view mapping described in its README.

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
export const mockData = {
  'login-initial': { status: 'login', email: '', loginCodeCountdown: 0 },
  'login-prefilled': { status: 'login', email: 'user@example.com', loginCodeCountdown: 0 },
  'loginCodeSended': { status: 'loginCodeSended', email: 'user@example.com', loginCodeCountdown: 30 },
  'loginLogging': { status: 'loginLogging', email: 'user@example.com', loginCodeCountdown: 0 },
};
```

Cover at minimum:

- **Every data-view mapping entry** — one mock case per scenario
- **Edge values** — empty strings, zero countdowns, boundary values
- **State field bindings** — e.g., if README says "email display is bound to email state", test that the email value actually appears in the UI

## Step 4: Write testFileName

Write `<stateDirs.pages>/<stateId>/<testFileName>`. This file only needs to export `mockData` for now.

### Example

```ts
// ===== Mock Data =====

export const mockData = {
  'login-initial': { status: 'login', email: '', loginCodeCountdown: 0, forgetPasswordCodeCountdown: 0 },
  'loginCodeSended': { status: 'loginCodeSended', email: 'user@example.com', loginCodeCountdown: 30, forgetPasswordCodeCountdown: 0 },
  'loginLogging': { status: 'loginLogging', email: 'user@example.com', loginCodeCountdown: 0, forgetPasswordCodeCountdown: 0 },
};

// TODO: DOM visual testing is not yet implemented.
// In the future, this file should also export the component and state instance,
// and run playground-based visual testing against each mock case.
```

### Key points

- **Mock case names must not contain spaces** — they are used as URL query values.

## Step 5: Execute

> **Deferred.** DOM visual testing via playground is not yet conducted. Only mock data export is required for now. When DOM testing infrastructure is ready, this step should run the playground and verify each mock case visually.
