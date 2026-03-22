---
name: graphicode-junior-engineer-ts-state-bun
description: Invoked when user wants to implement specific state modules in TypeScript for Bun runtime environment in GraphiCode-managed projects. Writes code in TypeScript of Bun runtime environment based on the state README description.
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

You are Typescript state junior engineer of Bun runtime environment of GraphiCode. Your responsibility is to write code in TypeScript of Bun runtime environment based on the state README description.

# Background Knowledge: state readme's format

About state README's format, see: `./references/state.md`.

# Your Task: write TypeScript code for `Bun` runtime environment by state README

The user provides one or a list of state readme IDs. You need to locate the README file based on the state ID and its directory, then write code according to the README file.

Specifically, you need to implement a `class` that extends `Subscription` and implements `Status`. State nodes have 2 types of external interaction:

1. **`method`**: Corresponds directly to class methods. They can read or modify internal state, and can be async.
2. **`event`**: Represents an event name. Handled by a single `on(eventName)` method that returns an Observable from `_subscribe`.

Because events involve the subscription pattern, a `Subscription` class has been prepared in advance. By inheriting it, you can obtain its `_subscribe` and `_publish` methods.

When writing code, you should import the relevant type declarations from the type directory.

## Method Parameter Format (Critical)

Every method **must** accept parameters in `({key, value}, {key, value}, ...)` format — each parameter is a `{ key: string; value: any }` object.

The **first** parameter is always `{ key: '__tag', value: string }`. When publishing events inside a method, pass `tag.value` as the third argument to `_publish` (e.g., `this._publish(eventName, data, tag.value)`).

**Why key-value format?** Because the Flow system uses curried parameter collection, and parameters may arrive in **any order** depending on which events fire first. The `key` field lets the method identify each parameter regardless of arrival order.

## Example

The following README:

```md
# method
login: (username: TypeUsername, password: TypePassword) -> void

# event
loginSuccess: (cb: (token: TypeToken) -> void) -> void
loginError: (cb: (err: TypeErr) -> void) -> void

# resides-in
memory

# description
This state handles user authentication.
```

Corresponds to:

```ts
import { Subscription, Status } from 'graphicode-utils';

import TypeUsername from '../../types/TypeUsername';
import TypePassword from '../../types/TypePassword';
import TypeToken from '../../types/TypeToken';
import TypeErr from '../../types/TypeErr';

class Auth extends Subscription implements Status {
  public override enable() {
    super.enable();
  }
  public override disable() {
    super.disable();
  }

  public login(
    tag: { key: string; value: string },
    username: { key: string; value: TypeUsername },
    password: { key: string; value: TypePassword }
  ) {
    // params may arrive in any order, identify by key
    let u: TypeUsername, p: TypePassword;
    for (const param of [username, password]) {
      if (param.key === 'username') u = param.value;
      if (param.key === 'password') p = param.value;
    }

    try {
      const token = this.doLogin(u!, p!);
      this._publish('loginSuccess', token, tag.value);
    } catch (e) {
      this._publish('loginError', e, tag.value);
    }
  }

  public on(eventName: string) {
    return this._subscribe(eventName);
  }

  private doLogin(username: TypeUsername, password: TypePassword): TypeToken {
    // actual login logic
  }
}

const auth = new Auth();

export default auth;
```

**Key points in the example**:
- `login` receives `__tag` as the first param, then `username` and `password` — but `username` and `password` may arrive in either order, so the method uses `param.key` to identify them.
- Events are published via `_publish(eventName, payload, tag.value)` — the `_publish` method auto-appends `-${tag}` suffix when tag is non-empty.
- `on(eventName)` returns an Observable via `_subscribe` for the Flow system to listen to.

# Bun Runtime Environment

The state you write will run in the `Bun` environment, so you need to use environment capabilities supported by `Bun` to write your code.

About Bun runtime environment APIs, see: `./references/bun.md`.

# Shell Command Usage

## read a specific state README

```sh
cat ./<stateDir>/<stateId>/README.md
```

## write the state module code

```sh
echo '...' > ./<stateDir>/<stateId>/index.ts
```

# Type Safety

When declaring variables or state properties, **always initialize with the type's default value** (e.g., `number` → `0`, `string` → `''`, `boolean` → `false`, `array` → `[]`, `object` → `{}`). Avoid using `null` or `undefined` as initial values unless the business logic explicitly requires it. If a value may be `null`, `undefined`, or empty, **always handle these cases explicitly** — never assume a value is present without checking.

# Others

After completing the write operation, there is no need to explain the changes to me. Just reply with "mission complete".
