/**
 * State nodes are the only place where a GraphiCode-managed project stores state.
 * All side effects (I/O, storage, DOM, network, etc.) must be encapsulated in State nodes.
 *
 * Each state:
 * - Extends the State base class (provides enable/disable, event pub/sub via rxjs Subject)
 * - Defines methods: receive params, return value or throw error. Methods must NOT call _publish.
 * - Defines self-originated events: published via _publish, name format: ClassName.eventName
 * - Defines its own types in <typeFileName> (configured in graphig.md)
 *
 * Method rules:
 * - Parameters cannot be optional (?). Use an options object for optional inputs.
 * - Use @guardEnabled decorator: method only executes when state is enabled
 * - Use @curried decorator: enables parameter collection for multi-param methods
 *   (Flow delivers params one at a time; @curried collects them and executes when all are ready)
 *
 * Event rules:
 * - Self-originated only: user actions, timers, lifecycle, external stimuli
 * - Each event emits exactly one data type
 * - Name format: ClassName.eventName (e.g., Auth.loginSuccess)
 *
 * Built-in members (inherited from State base class, do not redeclare):
 *   enable(): void | disable(): void | getState(): any | isEnabled(): boolean
 *   Event: ClassName.enabledChange: boolean
 *
 * Resides-in (determines available runtime environments):
 *   memory | disk | database | network | browser-BOM | browser-DOM |
 *   browser-storage | environment | hardware | stdout/stdin
 * Check runtimeEnv in graphig.md to determine which applies.
 *
 * Key distinction from Algorithm:
 * - Algorithm = pure logic (input → output, no side effects)
 * - State = side effects (I/O, storage, DOM, network, etc.)
 */

import State from './State';
import { guardEnabled, curried } from './state-decorators';

// --- Types (normally defined in <typeFileName>, shown here for reference) ---

type LoginOptions = {
  username: string;
  password: string;
};

type LoginResult = {
  id: string;
  name: string;
  token: string;
};

// --- State class definition ---

class Auth extends State {
  // Private state fields
  private _token: string | null = null;
  private _user: LoginResult | null = null;

  // Method: multi-param with @curried
  // Flow delivers params one at a time; @curried collects and executes when all are ready
  @guardEnabled
  @curried
  login(options: LoginOptions): LoginResult {
    // Return value — flow layer handles result distribution via then/catch
    const result: LoginResult = { id: '1', name: options.username, token: 'generated-token' };
    this._token = result.token;
    this._user = result;
    return result;
  }

  // Method: zero-param (no @curried needed — no params to collect)
  @guardEnabled
  logout(): void {
    this._token = null;
    this._user = null;
  }

  // Method: single-param with @curried
  @guardEnabled
  @curried
  getToken(): string | null {
    return this._token;
  }

  // Event publishing — called from lifecycle or external triggers, NOT from methods
  // Events are self-originated: user actions, timers, DOM events, etc.
  private _emitLoginSuccess(result: LoginResult): void {
    this._publish('Auth.loginSuccess', result);
  }

  private _emitLoginError(error: Error): void {
    this._publish('Auth.loginError', error);
  }
}

// --- Create and export instance ---
const auth = new Auth();
auth.enable();

export { Auth, auth };
export { Auth as TheClass, auth as theInstance };
