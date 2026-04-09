# Step 5: Browser Verification

Static code review (Step 4) cannot catch runtime issues like global scope conflicts, Less.js compilation failures, asset 404s, or Babel parsing errors. This step verifies the page actually renders in a browser.

## 1. Start a static file server

Check if a common static file server CLI is available on the user's machine (try `which ws` for local-web-server, `which http-server`, `which serve` in order). Use the first one found.

If none is found, ask the user whether to install `local-web-server` via `npm i -g local-web-server`. If the user declines, ask them to provide a running server URL and skip to step 2.

Start the server in `<playgroundDir>/<stateId>/` on an available port (e.g., 8080). Run it as a **background task** so verification can proceed. Record the PID / task ID to stop it later.

Example: `ws --directory <playgroundDir>/<stateId> --port 8080`

## 2. Verify each mock data scenario

Use `chrome-devtools` MCP tools. For **every** mock data name defined in `index.html`'s `mockDataMap`:

### 2.1 Navigate

Use `navigate_page` to open `http://localhost:<port>/index.html?name=<mockName>`.

### 2.2 Check console errors

Use `list_console_messages` filtered by `["error"]`. Common issues:

- `Identifier 'xxx' has already been declared` — top-level `const` collision between scene files
- `Unexpected token` — TypeScript syntax that Babel standalone can't parse
- `404 Not Found` — asset path or script path wrong
- `xxx is not defined` — component or variable not in scope

### 2.3 Check network requests

Use `list_network_requests` to verify all resources (tsx, less, assets, CDN scripts) return 200. Flag any 404s or failed loads.

### 2.4 Take a screenshot

Use `take_screenshot` to visually verify: page is not blank, layout is roughly correct, key elements are visible.

## 3. Fix and re-verify

If any errors are found in any scenario, fix them, then re-run step 2 for the affected scenarios until all pass cleanly (no console errors, no failed network requests, page renders correctly).

## 4. Stop the server

After all scenarios pass, stop the static file server started in step 1 (kill the background task).
