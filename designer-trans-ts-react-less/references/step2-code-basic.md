# Code Basic Example

This is a complete code structure example, demonstrating how to implement a State README as a State Class and React component.

## README Example

`<stateDirs.pages>/<stateId>/README.md` shows the format of state README, including page state method, event, state, and data-view mapping.

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

## Type Definition Example

Type is defined in the "typeDirs" directory. Refer to `graphig.md` to get the "typeDirs" directory, and find the corresponding type declaration based on the type ID. Assuming typeDir is `src/types`, you should look for `src/types/LoginPageStatus/index.ts`:

```ts
type LoginPageStatus = 'login' | 'loginCodeSended' | 'loginLogging' | 'terms' | 'setNewPassword' | 'forgetPassword' | 'forgetPasswordCodeSended' | 'forgetPasswordSetNewPassword';
export default LoginPageStatus;
```

## Mapping Relationship between State Class and README

State Class consists of three core parts:

| README Definition | State Class Mapping | Description |
|---|---|---|
| `method` | `public` methods | method defines the operation interface for state, exposed externally for calling |
| `state` | `private` properties | state is internal private state, not directly exposed externally, modified through method |
| `event` | Not reflected in State Class | event is captured by browser-DOM layer (React component) and triggers corresponding method |

**Why is event not reflected in State Class?**

Because event is essentially browser-DOM layer interaction events (such as click, input, form submission, etc.), these events are directly listened and handled by React components. Components trigger events directly under specific circumstances.

## State Class Specification

Each State Class must follow the specifications below:

1. **Required Functions**:
   - `getState`: publish the complete state object
   - `on(eventId: string): Observable<any>`: subscribe to specified event

2. **Method Parameter Format**:
   - All methods (except `on`) must have parameter format `({ key, value }, { key, value }, ...)`
   - Parameter order is not fixed, get corresponding `value` through `key`

3. **Event Publishing Mode**:
   - All methods (except `on`) ultimately function through `this._publish` to publish events

4. **Inheritance Relationship**:
   - State Class must extend `Subscription` and implement `State` interface

## Example: Implement Login State Class and React Component

Implement the State Class and set up the React Component structure. No need to implement React Component details.

The connect function is the key to linking State Class and React component. Pass State Class, state change event name (must correspond to State Class), and React Component in order to achieve binding. The return value of connect function is the React Component bound with State Class, which can be exported as default.

```tsx
import React from 'react';
import LoginPageStatus from '<typeDir>/LoginPageStatus';
import { Subscription, State, getArg, connect } from '@/graphicode-utils';
import { Observable } from 'rxjs';

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
    if (email) {
      this.email = email;
      this._publish('LoginPageState.__stateChange', { email });
    }
  }

  public setLoginCodeCountdown(...args: { key: string; value: any }[]) {
    const countdown = getArg<number>(args, 'countdown');
    if (countdown !== undefined) {
      this.loginCodeCountdown = countdown;
      this._publish('LoginPageState.__stateChange', { loginCodeCountdown: countdown });
    }
  }

  public setForgetPasswordCodeCountdown(...args: { key: string; value: any }[]) {
    const countdown = getArg<number>(args, 'countdown');
    if (countdown !== undefined) {
      this.forgetPasswordCodeCountdown = countdown;
      this._publish('LoginPageState.__stateChange', { forgetPasswordCodeCountdown: countdown });
    }
  }

  public getState() {
    this._publish(
      'LoginPageState.__stateChange',
      {
        status: this.status,
        email: this.email,
        loginCodeCountdown: this.loginCodeCountdown,
        forgetPasswordCodeCountdown: this.forgetPasswordCodeCountdown,
      }
    );
  }

  // ========== subscription helper ==========
  public on(eventId: string): Observable<any> {
    return this._subscribe(eventId);
  }
}

const loginPageState = new LoginPageState();

const LoginPage: React.FC<{  any, stateInstance: LoginPageState }> = (props) => {
  const {
     {
      status,
      email,
      loginCodeCountdown,
      forgetPasswordCodeCountdown,
    },
    stateInstance,
  } = props;

  // TODO: render JSX by data
  // - 'login' | 'loginCodeSended' | 'loginLogging': render login form
  // - 'terms': render terms & conditions
  // - 'setNewPassword': render set new password form
  // - 'forgetPassword' | 'forgetPasswordCodeSended': render forget password form
  // - 'forgetPasswordSetNewPassword': render forget password set new password form
  return null;
};

const LoginPageWithState = connect(loginPageState, 'LoginPageState.__stateChange', LoginPage);

export default LoginPageWithState;
```

Save the implementation result to `<stateDirs.pages>/<stateId>/<mainFileName>`.