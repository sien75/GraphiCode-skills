# playground.ts example

This file is imported by `launcher.ts` in design mode. It imports mock data from each page's test file and injects it into the corresponding page state.

Test files under `stateDirs.pages` export mock data (not self-executing). Each test file exports a `mockData` object where `key = scenario name`, `value = state data for that scenario`. This file imports that data, injects the first scenario by default, and provides a floating UI to switch scenarios.

This is an example, you should replace it with the actual.

## mockData format

```ts
// mockData is { [scenarioName: string]: { [stateField: string]: any } }
export const mockData = {
  'login-default': { status: 'login', email: '', loginCodeCountdown: 0 },
  'login-code-sent': { status: 'loginCodeSended', email: 'test@example.com', loginCodeCountdown: 30 },
  'forget-password': { status: 'forgetPassword', email: '', forgetPasswordCodeCountdown: 0 },
};
```

## playground.ts

```ts
import state1 from "<stateDirs.pages>/state1";
import state2 from "<stateDirs.pages>/state2";

import { mockData as state1MockData } from "<stateDirs.pages>/state1/<testFileName>";
import { mockData as state2MockData } from "<stateDirs.pages>/state2/<testFileName>";

// ========== page registry ==========
// Each entry maps a route path to its page state instance, class name, and mock data.
// Route paths must be determined by reading the project's routing configuration.
// Could be path-based (e.g., '/login') or hash-based (e.g., '#/login') — check the project.

interface PageEntry {
  state: any;
  className: string;
  mockData: Record<string, Record<string, any>>;
}

const pages: Record<string, PageEntry> = {
  '/state1': { state: state1, className: 'State1ClassName', mockData: state1MockData },
  '/state2': { state: state2, className: 'State2ClassName', mockData: state2MockData },
};

// ========== inject mock for current page ==========

function getCurrentRoute(): string {
  // Determine whether the project uses hash routing or path routing,
  // then return the current route accordingly.
  // Hash routing example: return window.location.hash.replace('#', '') || '/';
  // Path routing example: return window.location.pathname;
  return window.location.pathname; // adapt to project
}

function findCurrentPage(): PageEntry | null {
  const route = getCurrentRoute();
  for (const [path, entry] of Object.entries(pages)) {
    if (route === path || route.startsWith(path + '/')) {
      return entry;
    }
  }
  return null;
}

function injectMock(entry: PageEntry, scenarioName: string) {
  const data = entry.mockData[scenarioName];
  if (!data) return;
  entry.state._publish(`${entry.className}.__stateChange`, data);
}

// ========== floating scenario switcher UI ==========

let currentEntry: PageEntry | null = null;
let currentScenario: string = '';
let container: HTMLDivElement | null = null;

function createSwitcherUI() {
  container = document.createElement('div');
  container.id = '__playground_switcher__';
  container.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    display: flex; flex-direction: column; gap: 8px; align-items: center;
  `;
  document.body.appendChild(container);
}

function renderButtons() {
  if (!container || !currentEntry) return;
  container.innerHTML = '';

  const scenarios = Object.keys(currentEntry.mockData);
  scenarios.forEach((name, i) => {
    const btn = document.createElement('div');
    const isActive = name === currentScenario;

    btn.style.cssText = `
      width: 36px; height: 36px; border-radius: 50%;
      background: ${isActive ? '#1677ff' : '#fff'};
      color: ${isActive ? '#fff' : '#333'};
      border: 2px solid ${isActive ? '#1677ff' : '#d9d9d9'};
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 12px; font-weight: bold;
      transition: all 0.2s; position: relative;
    `;
    btn.textContent = String(i + 1);

    // tooltip
    const tooltip = document.createElement('div');
    tooltip.textContent = name;
    tooltip.style.cssText = `
      position: absolute; right: 44px; top: 50%; transform: translateY(-50%);
      background: rgba(0,0,0,0.75); color: #fff; padding: 4px 8px;
      border-radius: 4px; font-size: 12px; white-space: nowrap;
      pointer-events: none; opacity: 0; transition: opacity 0.15s;
    `;
    btn.appendChild(tooltip);

    btn.addEventListener('mouseenter', () => { tooltip.style.opacity = '1'; });
    btn.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

    btn.addEventListener('click', () => {
      currentScenario = name;
      injectMock(currentEntry!, name);
      renderButtons();
    });

    container!.appendChild(btn);
  });
}

function switchToPage() {
  const entry = findCurrentPage();
  if (entry === currentEntry) return;
  currentEntry = entry;

  if (entry) {
    const scenarios = Object.keys(entry.mockData);
    currentScenario = scenarios[0] || '';
    if (currentScenario) injectMock(entry, currentScenario);
  } else {
    currentScenario = '';
  }

  renderButtons();
}

// ========== init ==========

createSwitcherUI();
switchToPage();

// listen to route changes
// For path routing: listen to popstate
window.addEventListener('popstate', switchToPage);

// For hash routing: listen to hashchange
// window.addEventListener('hashchange', switchToPage);

// Also intercept pushState/replaceState for SPA navigation
const origPushState = history.pushState.bind(history);
const origReplaceState = history.replaceState.bind(history);
history.pushState = (...args) => { origPushState(...args); switchToPage(); };
history.replaceState = (...args) => { origReplaceState(...args); switchToPage(); };
```
