# Memory State Testing (Bun)

Memory state testing verifies that in-memory state modules behave correctly according to their README specifications.

## Step 1: Read graphig.md

Read the project's `graphig.md` to obtain:

| Configuration | Purpose |
|---|---|
| `stateDirs` | Directory containing state README files |
| `testFileName` | Test file name — all mock data and test cases go into this file |
| `testCommand` | Command to run tests (`bun test {testFile}`) |

## Step 2: Read the README

Locate the README at `<stateDir>/<stateId>/README.md`. Focus on:

1. **method** — the callable methods, their parameter types, and return types
2. **event** — the self-originated events and their data types
3. **state** — the internal state fields and their types

**Do NOT read the module's implementation code.** All test design is based solely on the README.

## Step 3: Design test cases

For each method in the README:

1. **Normal case**: Call with valid inputs, verify the return value matches the documented type
2. **Edge cases**: Empty strings, zero values, boundary numbers, empty arrays/objects
3. **Error cases**: If the method can throw, verify the error is thrown for invalid inputs

For each event in the README:

1. Verify the event fires with the documented data type when the state changes
2. Verify the event does NOT fire when the state is disabled

For state fields:

1. Verify `getState()` returns the current state data
2. Verify `enable()`/`disable()` work correctly
3. Verify `isEnabled()` returns the correct status
4. Verify `enabledChange` event fires on enable/disable

## Step 4: Write test file

Write `<stateDir>/<stateId>/<testFileName>` using Bun test syntax:

```ts
import { test, expect, describe } from 'bun:test';

describe('StateName', () => {
  // Test methods
  test('methodName with valid input returns expected output', () => {
    // ...
  });

  // Test events
  test('eventName fires with correct data', () => {
    // ...
  });

  // Test built-in
  test('enable/disable works correctly', () => {
    // ...
  });
});
```

## Step 5: Execute

Run the test file:

```sh
bun test <stateDir>/<stateId>/<testFileName>
```

Report results: how many passed, how many failed, and details of any failures.

## Important notes

- Use `bun:test` imports, not vitest or jest
- Memory states can be tested synchronously in most cases
- For async methods, use `async` test functions and `await`
- Mock external dependencies (network, disk) but do NOT mock the state under test