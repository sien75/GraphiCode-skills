# Code Basic Example

This is a complete code structure example, demonstrating how to implement a page README as browser-runnable mock data and React components.

## README Example

`<stateDirs.pages>/<stateId>/README.md` shows the format of page README (note: README is read from stateDirs.pages, but code is output to playgroundDir), including page method, event, data fields, and data-view mapping.

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
| `state` | Mock data fields | Defines the data shape; generate multiple mock datasets covering all scenarios and edge cases |
| `method` | Not used | Not needed in playground |
| `event` | `console.log(eventId, payload)` | Events are logged to console for debugging when triggered by UI interactions |
| Data and View Mapping | Mock data variants | Each mapping scenario becomes one or more named mock datasets |

## Output File Structure

All output files go to `<playgroundDir>/<stateId>/`:

```
<playgroundDir>/<stateId>/
├── index.html          # Entry file, inline App component + mock data
├── Page1.tsx           # Scene component (attached to window)
├── Page1.less          # Scene styles (plain class names)
├── Page2.tsx
├── Page2.less
└── ...
```

## Example: Implement Login Page index.html and Scene Components

### index.html

Generate the `index.html` at `<playgroundDir>/<stateId>/index.html`. It contains:
- CDN scripts for React, ReactDOM, Babel standalone, Less.js
- `<link rel="stylesheet/less">` tags for all scene less files, placed **before** the Less.js script
- `<script type="text/babel" src="...">` loading all scene tsx files
- Inline `<script type="text/babel">` with: mock data (plain JS, no TS syntax), URL query parsing, App component, ReactDOM.render

**Important**: Do NOT include any UI library (antd, etc.) CDN references at this stage. UI library references will be added later in Step 3.3 after reading the component mapping file.

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Less files: use <link> tags BEFORE less.js script -->
  <link rel="stylesheet/less" type="text/css" href="./Page1.less" />
  <link rel="stylesheet/less" type="text/css" href="./Page2.less" />
  <link rel="stylesheet/less" type="text/css" href="./Page3.less" />
  <script>less = { env: 'development' }</script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/less.js/4.2.0/less.min.js"></script>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel" src="./Page1.tsx" data-presets="react"></script>
  <script type="text/babel" src="./Page2.tsx" data-presets="react"></script>
  <script type="text/babel" src="./Page3.tsx" data-presets="react"></script>

  <script type="text/babel" data-presets="react">
    // === Type Definitions (comments only — no actual TS syntax) ===
    // LoginPageStatus: 'login' | 'loginCodeSended' | 'loginLogging' | 'terms' | 'setNewPassword' | 'forgetPassword' | 'forgetPasswordCodeSended' | 'forgetPasswordSetNewPassword'
    // MockData shape: { status, email, loginCodeCountdown, forgetPasswordCodeCountdown }

    // === Mock Data ===
    // Define multiple mock datasets covering all scenarios from README's Data and View Mapping,
    // plus edge cases (empty strings, long strings, boundary numbers, etc.)
    const mockDataMap = {
      'login-default': {
        status: 'login',
        email: '',
        loginCodeCountdown: 0,
        forgetPasswordCodeCountdown: 0,
      },
      'login-with-email': {
        status: 'login',
        email: 'user@example.com',
        loginCodeCountdown: 0,
        forgetPasswordCodeCountdown: 0,
      },
      'login-code-sended': {
        status: 'loginCodeSended',
        email: 'user@example.com',
        loginCodeCountdown: 59,
        forgetPasswordCodeCountdown: 0,
      },
      'login-logging': {
        status: 'loginLogging',
        email: 'user@example.com',
        loginCodeCountdown: 0,
        forgetPasswordCodeCountdown: 0,
      },
      'terms': {
        status: 'terms',
        email: 'user@example.com',
        loginCodeCountdown: 0,
        forgetPasswordCodeCountdown: 0,
      },
      'set-new-password': {
        status: 'setNewPassword',
        email: 'user@example.com',
        loginCodeCountdown: 0,
        forgetPasswordCodeCountdown: 0,
      },
      'forget-password': {
        status: 'forgetPassword',
        email: '',
        loginCodeCountdown: 0,
        forgetPasswordCodeCountdown: 0,
      },
      'forget-password-code-sended': {
        status: 'forgetPasswordCodeSended',
        email: 'user@example.com',
        loginCodeCountdown: 0,
        forgetPasswordCodeCountdown: 45,
      },
      'forget-password-set-new-password': {
        status: 'forgetPasswordSetNewPassword',
        email: 'user@example.com',
        loginCodeCountdown: 0,
        forgetPasswordCodeCountdown: 0,
      },
      // Edge cases
      'boundary-long-email': {
        status: 'login',
        email: 'very-long-email-address-that-might-overflow@extremely-long-domain-name.com',
        loginCodeCountdown: 0,
        forgetPasswordCodeCountdown: 0,
      },
      'boundary-countdown-max': {
        status: 'loginCodeSended',
        email: 'user@example.com',
        loginCodeCountdown: 120,
        forgetPasswordCodeCountdown: 120,
      },
    }

    // === URL Query Parsing ===
    const params = new URLSearchParams(window.location.search)
    const mockName = params.get('name') || Object.keys(mockDataMap)[0]
    const data = mockDataMap[mockName] || mockDataMap[Object.keys(mockDataMap)[0]]

    // === App Component ===
    const App = () => {
      return (
        <div>
          <Page1 data={data} />
          <Page2 data={data} />
          <Page3 data={data} />
        </div>
      )
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />)
  </script>
</body>
</html>
```

### Mock Data Guidelines

When generating mock data from README:

1. **One dataset per Data-View-Mapping entry**: Each `{ status: 'xxx' }` mapping in the README should have at least one mock dataset.
2. **Edge cases**: Add datasets for boundary conditions:
   - Empty strings for text fields
   - Very long strings for overflow testing
   - Maximum/minimum values for numbers
   - Special characters in text fields
3. **Naming convention**: Use kebab-case names that describe the scenario (e.g., `'login-default'`, `'boundary-long-email'`).
4. **Type the mock data**: Use a typed `Record` with the state shape from README to ensure all fields are present.

### Scene TSX File Example

Scene tsx files are loaded via `<script type="text/babel" src="...">` in index.html. They must NOT use import/export.

```tsx
/*
 * corresponded figma node-ids
 * page1: 1-1
 */

const Page1 = (props) => {
  const { data } = props
  // Destructure React hooks and UI library globals INSIDE the component,
  // NOT at top level (multiple scene files share the same global scope)
  const { useState, useEffect } = React

  // TODO: render JSX by data
  // Use className as plain strings, NOT CSS Modules
  // Use console.log for events
  return null
}

window.Page1 = Page1
```

### Scene Less File Example

Less files use plain nested class selectors (NOT CSS Modules). They are imported via `<link rel="stylesheet/less">` in index.html.

```less
.page1 {
  .logoArea {
    /* styles */
  }
  .formTitle {
    /* styles */
  }
}
```

Save the index.html to `<playgroundDir>/<stateId>/index.html`.
