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
| `method` | State class public methods | Each method becomes a public setter that updates private state and calls `this._publish()` |
| `event` | `stateInstance._publish(eventId, payload)` | Events are published via stateInstance when triggered by UI interactions |
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
- State class definition with private state fields, public setter methods, getState(), and on() helper
- State instantiation and enable
- Page component receiving `{ data, stateInstance }` and assembling scene components
- `connect()` wrapper and default export

```tsx
import { State, Subscription, connect, getArg } from '@/graphicode-utils';
import React from 'react';
import { Observable } from 'rxjs';
import LoginForm from './LoginForm';
import Terms from './Terms';
import SetNewPassword from './SetNewPassword';
import ForgetPassword from './ForgetPassword';
import { LoginPageStatus } from './types';

// State Class - Manages internal state and logic of login page
export class LoginPageState extends Subscription implements State {
  // ========== private state ==========
  private status: LoginPageStatus = 'login';
  private email: string = '';
  private loginCodeCountdown: number = 0;
  private forgetPasswordCodeCountdown: number = 0;

  // ========== public methods ==========
  public setPageStatus(...args: { key: string; value: any }[]) {
    const status = getArg<LoginPageStatus>(args, 'status');
    if (status) {
      this.status = status;
      this._publish('LoginPageState.__stateChange', { status });
    }
  }

  public setDefaultEmail(...args: { key: string; value: any }[]) {
    const email = getArg<string>(args, 'email');
    if (email !== undefined) {
      this.email = email;
      this._publish('LoginPageState.__stateChange', { email });
    }
  }

  public setLoginCodeCountdown(...args: { key: string; value: any }[]) {
    const countdown = getArg<number>(args, 'countdown');
    if (countdown !== undefined) {
      this.loginCodeCountdown = countdown;
      this._publish('LoginPageState.__stateChange', {
        loginCodeCountdown: countdown,
      });
    }
  }

  public setForgetPasswordCodeCountdown(...args: { key: string; value: any }[]) {
    const countdown = getArg<number>(args, 'countdown');
    if (countdown !== undefined) {
      this.forgetPasswordCodeCountdown = countdown;
      this._publish('LoginPageState.__stateChange', {
        forgetPasswordCodeCountdown: countdown,
      });
    }
  }

  public getState() {
    this._publish('LoginPageState.__stateChange', {
      status: this.status,
      email: this.email,
      loginCodeCountdown: this.loginCodeCountdown,
      forgetPasswordCodeCountdown: this.forgetPasswordCodeCountdown,
    });
  }

  // ========== subscription helper ==========
  public on(eventId: string): Observable<any> {
    return this._subscribe(eventId);
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

1. **State class naming**: Use `<PageName>State` (e.g., `LoginPageState`).
2. **Private fields**: One per `state` entry in README, with sensible defaults.
3. **Public methods**: One per `method` entry in README. Each extracts args via `getArg()`, updates the private field, and calls `this._publish('<ClassName>.__stateChange', { field: value })`.
4. **getState()**: Publishes all private state fields at once.
5. **on()**: Returns `this._subscribe(eventId)` for external subscription.
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
  // Use stateInstance._publish(eventId, payload) for events
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
