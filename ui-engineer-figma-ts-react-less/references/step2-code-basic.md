# Code Basic Example

This is a complete code structure example, demonstrating how to implement a page README as standard TSX + Less components.

## README Example

`<stateDirs.pages>/<stateId>/README.md` shows the format of page README, including page method, event, data fields, and data-view mapping.

```md
# method
setPageStatus: (status: LoginPageStatus) -> void
setDefaultEmail: (email: string) -> void
setLoginCodeCountdown: (countdown: number) -> void
setForgetPasswordCodeCountdown: (countdown: number) -> void

# event
sendCodeClick: { email: string }
loginClick: { email: string, password: string, code: string }
setNewPasswordClick: { email, newPassword: string }
forgetPasswordClick: {}
forgetPasswordSendCodeClick: { email: string }
forgetPasswordCodeFilled: { email: string, code: string }
forgetPasswordSetNewPasswordClick: { email, newPassword: string }

# state
status: LoginPageStatus
email: string
loginCodeCountdown: number
forgetPasswordCodeCountdown: number

# resides-in
browser-DOM

# description
This is a login page, including login / first-time login password change / forget password / agreement display, etc.

## Data and View Mapping

{ status: 'login' } At this time, the page is the initial login form, displaying email, password input fields, and verification code input field.
{ status: 'loginCodeSended' } At this time, the verification code has been sent, displaying countdown on top of the login page.
{ status: 'loginLogging' } At this time, the page is logging in, displaying button status on top of the login page.
{ status: 'terms' } At this time, the page displays agreements, showing user agreement / privacy policy content.
{ status: 'setNewPassword' } At this time, the page is for setting new password on first login, displaying new password input field and confirm password input field.
{ status: 'forgetPassword' } At this time, the page is the initial state of forget password flow, displaying email input field and verification code input field.
{ status: 'forgetPasswordCodeSended' } At this time, the forget password verification code has been sent, displaying countdown on top of the forget password page.
{ status: 'forgetPasswordSetNewPassword' } At this time, the page is for setting new password in forget password flow, displaying new password input field and confirm password input field.

All pages' email display is bound to the email state.
The login page verification code countdown uses the loginCodeCountdown state.
The forget password page verification code countdown uses the forgetPasswordCodeCountdown state.
```

## Mapping Relationship between README and Output

| README Definition | Output Mapping | Description |
|---|---|---|
| `state` | State class private fields + type definitions | Defines the data shape; each state field becomes a private field in the State class with a corresponding setter method |
| `method` | State class public methods | Each method becomes a public method decorated with `@guardEnabled` and `@curried` that updates private state and returns the updated value |
| `event` | `stateInstance._publish('StateClassName.eventName', payload)` | Self-originated events (user actions, lifecycle) are published via stateInstance |
| Data and View Mapping | Scene component conditional rendering | Each mapping scenario drives conditional rendering logic in scene components |

## Output File Structure

All output files go to `<stateDirs.pages>/<stateId>/`:

```
<stateDirs.pages>/<stateId>/
├── index.tsx           # Entry file: State class + page component + connect wrapper
├── types.ts            # Type definitions (LoginPageStatus, etc.)
├── LoginForm.tsx       # Scene component (export default)
├── LoginForm.less      # Scene styles (Less Modules)
├── Terms.tsx
├── Terms.less
└── ...
```

## Example: Implement Login Page index.tsx and Scene Components

### index.tsx

Generate the `index.tsx` at `<stateDirs.pages>/<stateId>/index.tsx`. It contains:
- Imports for State utilities, scene components, and types
- State class definition with private state fields, public methods with `@guardEnabled` + `@curried` decorators, and getState()
- State instantiation and enable
- Page component receiving `{ data, stateInstance }` and assembling scene components
- `connect()` wrapper and default export

```tsx
import State from '@/graphicode-utils/State';
import { guardEnabled, curried } from '@/graphicode-utils/state-decorators';
import { connect } from '@/graphicode-utils';
import React from 'react';
import LoginForm from './LoginForm';
import Terms from './Terms';
import SetNewPassword from './SetNewPassword';
import ForgetPassword from './ForgetPassword';
import { LoginPageStatus } from './types';

// State Class - Manages internal state and logic of login page
export class LoginPageState extends State {
  // ========== private state ==========
  private status: LoginPageStatus = 'login';
  private email: string = '';
  private loginCodeCountdown: number = 0;
  private forgetPasswordCodeCountdown: number = 0;

  // ========== public methods ==========
  @guardEnabled
  @curried
  public setPageStatus(status: LoginPageStatus) {
    this.status = status;
    this._publish('LoginPageState.__stateChange', { status });
  }

  @guardEnabled
  @curried
  public setDefaultEmail(email: string) {
    this.email = email;
    this._publish('LoginPageState.__stateChange', { email });
  }

  @guardEnabled
  @curried
  public setLoginCodeCountdown(countdown: number) {
    this.loginCodeCountdown = countdown;
    this._publish('LoginPageState.__stateChange', { loginCodeCountdown: countdown });
  }

  @guardEnabled
  @curried
  public setForgetPasswordCodeCountdown(countdown: number) {
    this.forgetPasswordCodeCountdown = countdown;
    this._publish('LoginPageState.__stateChange', { forgetPasswordCodeCountdown: countdown });
  }

  public getState() {
    return {
      status: this.status,
      email: this.email,
      loginCodeCountdown: this.loginCodeCountdown,
      forgetPasswordCodeCountdown: this.forgetPasswordCodeCountdown,
    };
  }
}

const loginPageState = new LoginPageState();

loginPageState.enable();

const LoginPage: React.FC<{
  data: any;
  stateInstance: LoginPageState;
}> = (props) => {
  const { data, stateInstance } = props;

  return (
    <div>
      <LoginForm data={data} stateInstance={stateInstance} />
      <Terms data={data} stateInstance={stateInstance} />
      <SetNewPassword data={data} stateInstance={stateInstance} />
      <ForgetPassword data={data} stateInstance={stateInstance} />
    </div>
  );
};

const LoginPageWithState = connect(
  loginPageState,
  'LoginPageState',
  LoginPage,
);

export default LoginPageWithState;
```

### Key Patterns

When generating index.tsx from README:

1. **State class naming**: Use `<PageName>State` (e.g., `LoginPageState`), extending `State`.
2. **Private fields**: One per `state` entry in README, with sensible defaults.
3. **Public methods**: One per `method` entry in README. Decorated with `@guardEnabled` (auto-skip when not enabled) and `@curried` (parameter collection from flow layer). Methods use normal parameter signatures and update private fields directly. Use `this._publish('ClassName.__stateChange', { field: value })` to notify the UI of state changes.
4. **getState()**: Returns all private state fields as an object.
6. **Page component**: Receives `{ data, stateInstance }` and passes both to every scene component.
7. **connect()**: Wraps with `connect(stateInstance, '<ClassName>', Component)`. The second parameter is the class name; `connect` internally appends `.__stateChange` to derive the event name.

### Scene TSX File Example

Scene tsx files use standard import/export and Less Modules.

```tsx
/*
 * corresponded figma node-ids
 * loginForm: 1-1
 */

import React, { useState } from 'react';
import styles from './LoginForm.less';

interface LoginFormProps {
  data: any;
  stateInstance: any;
}

const LoginForm: React.FC<LoginFormProps> = (props) => {
  const { data, stateInstance } = props;

  // TODO: render JSX by data
  // Use styles.xxx for className
  // Use stateInstance._publish('StateClassName.eventName', payload) for self-originated events
  return null;
};

export default LoginForm;
```

### Scene Less File Example

Less files use nested class selectors and are imported as Less Modules (`styles.xxx`).

```less
.loginForm {
  .logoArea {
    /* styles */
  }
  .formTitle {
    /* styles */
  }
}
```

Save the index.tsx to `<stateDirs.pages>/<stateId>/index.tsx`.
