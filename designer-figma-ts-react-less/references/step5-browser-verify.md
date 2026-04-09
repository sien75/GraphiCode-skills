# Step 5: Browser Verification

Static code review (Step 4) cannot catch runtime issues like global scope conflicts, Less.js compilation failures, asset 404s, or Babel parsing errors. This step verifies the page actually renders in a browser and matches the Figma design.

## 1. Start a static file server

Check if a common static file server CLI is available on the user's machine (try `which ws` for local-web-server, `which http-server`, `which serve` in order). Use the first one found.

If none is found, ask the user whether to install `local-web-server` via `npm i -g local-web-server`. If the user declines, ask them to provide a running server URL and skip to step 2.

Start the server at the **project root** on an available port (e.g., 8080), so that asset paths under `<assetDirs>` resolve correctly. Run it as a **background task** so verification can proceed. Record the PID / task ID to stop it later.

Example: `ws --port 8080` (run from project root)

## 2. Verify each mock data scenario

Use `chrome-devtools` MCP tools. For **every** mock data name defined in `index.html`'s `mockDataMap`:

### 2.1 Navigate

Use `navigate_page` to open `http://localhost:<port>/<playgroundDir>/<stateId>/index.html?name=<mockName>`.

### 2.2 Check console errors

Use `list_console_messages` filtered by `["error"]`. Common issues:

- `Identifier 'xxx' has already been declared` — top-level `const` collision between scene files
- `Unexpected token` — TypeScript syntax that Babel standalone can't parse
- `404 Not Found` — asset path or script path wrong
- `xxx is not defined` — component or variable not in scope

### 2.3 Check network requests

Use `list_network_requests` to verify all resources (tsx, less, assets, CDN scripts) return 200. Flag any 404s or failed loads.

### 2.4 Take a browser screenshot

Use `take_screenshot` to visually verify: page is not blank, layout is roughly correct, key elements are visible.

### 2.5 Compare with Figma design

For the current scenario, find the corresponding Figma node IDs from the scene tsx file's comment block (the `corresponded figma node-ids` section). Read the Figma file key from `figmaFileKeyFileName` (configured in `graphig.md`).

Use the Figma MCP tool `get_screenshot` with the `fileKey` and `nodeId` to fetch the Figma design screenshot. Compare it with the browser screenshot from step 2.4:

- **Layout**: Are elements positioned similarly (header, form, sidebar, etc.)?
- **Content**: Are placeholder texts, icons, and images consistent?
- **Styling**: Are colors, font sizes, spacing roughly matching?

Note: pixel-perfect matching is not required. Focus on catching obvious discrepancies (missing elements, wrong layout direction, completely wrong colors, etc.).

## 3. Fix and re-verify

If any errors or significant visual discrepancies are found in any scenario, fix them, then re-run step 2 for the affected scenarios until all pass cleanly (no console errors, no failed network requests, page renders correctly and matches Figma design).

## 4. Stop the server

After all scenarios pass, stop the static file server started in step 1 (kill the background task).
