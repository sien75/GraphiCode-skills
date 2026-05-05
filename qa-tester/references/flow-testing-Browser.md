# Flow Module Testing

Flow modules connect states and algorithms according to the flow YAML specification. Testing flows verifies that the connection layer works correctly.

## What to test

For each connection in the flow YAML:

1. **Event triggering**: When the source event fires, the target method is called
2. **Pipe transformation**: Each algorithm in the pipe chain transforms data correctly
3. **Parameter delivery**: The transformed data is delivered to the correct parameter of the target method
4. **Then routing**: The method's return value is routed correctly (unicast, multicast, or broadcast)
5. **Catch routing**: Errors are caught and routed correctly
6. **Parameter collection**: Methods with multiple parameters execute only when all parameters are received

## Test setup

1. Read `graphig.md` to find `flowDirs` and `utilsDir`
2. Read the flow's `README.yaml` to understand connections
3. Read referenced state and algorithm READMEs to understand interfaces

## Test structure

```ts
import { Flow } from 'graphicode-utils';
// Import or mock the states and algorithms referenced in the flow

describe('FlowName', () => {
  // Set up: create flow instance, enable all states

  it('connection #0: on EventA, pipe through algo, call methodB', () => {
    // 1. Trigger the source event
    // 2. Verify the target method was called with correct parameters
    // 3. If then/catch defined, verify routing
  });

  // ... one test per connection
});
```

## Key patterns

### Testing parameter collection

When a method takes multiple parameters, each filled by a different connection:

```ts
it('method executes only when all params received', () => {
  // Flow connection #0 fills param "username"
  page.emit('submit', 'alice');
  expect(auth.login).not.toHaveBeenCalled(); // still waiting for "password"

  // Flow connection #1 fills param "password"
  page.emit('submit', 'secret');
  expect(auth.login).toHaveBeenCalledWith('alice', 'secret');
});
```

### Testing then/catch

```ts
it('then routes return value to target', async () => {
  api.fetch.mockResolvedValue({ token: 'abc' });
  page.emit('load');
  await waitFor(() => {
    expect(store.save).toHaveBeenCalledWith('abc');
  });
});

it('catch routes error to target', async () => {
  api.fetch.mockRejectedValue(new Error('fail'));
  page.emit('load');
  await waitFor(() => {
    expect(page.showError).toHaveBeenCalled();
  });
});
```

### Testing broadcast

```ts
it('then broadcasts event to EventBus', () => {
  // Set up a listener on the broadcast event
  flow2.connect(0, undefined, 'loginSuccess', store, 'save', 'token');
  auth.login.mockReturnValue({ token: 'abc' });
  page.emit('submit');
  expect(store.save).toHaveBeenCalledWith('abc');
});
```

## Test runner

For browser environments, use `vitest`:

```sh
vitest
```