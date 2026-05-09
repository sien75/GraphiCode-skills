/**
 * Assembler generates TypeScript connection-layer code from flow README.yaml.
 *
 * A flow module is a class that extends Flow. The constructor calls this._connect(...)
 * for each connection defined in the YAML.
 *
 * Import rules:
 * - States: import from participant `path` field (e.g., `import ApprovalCenter from "pages/ApprovalCenter"`)
 * - Algorithms: import from `algorithms/<algorithmName>` — strip `()` from pipe entries
 *   (e.g., `buildApprovalError()` → `import buildApprovalError from "algorithms/buildApprovalError"`)
 * - Flow base class: `import { Flow } from "graphicode-utils"`
 *
 * _connect signature:
 *   this._connect(
 *     serialNumber,     // connection id (number)
 *     sourceState,      // state instance for on.state, or undefined for EventBus
 *     sourceEvent,      // on.event (string)
 *     targetState,      // state instance for call.state
 *     targetMethod,     // call.method (string)
 *     targetParam,      // call.param (string | undefined for zero-param methods)
 *     pipe,             // algorithm array (default [])
 *     thenDef,          // optional ThenDef
 *     catchDef          // optional ThenDef
 *   )
 *
 * Detection: array → multicast, object with `event` → broadcast, object with `state` → unicast
 */

import Flow from "graphicode-utils";
import type State from "graphicode-utils/State";

// --- ThenDef types ---

type UnicastDef = {
  targetState: State;
  targetMethod: string;
  targetParam?: string;
  pipe: ((input: any) => any)[];
  then?: ThenDef;
  catch?: ThenDef;
};

type BroadcastDef = { event: string };

type ThenDef = UnicastDef | UnicastDef[] | BroadcastDef;

// --- YAML → _connect mapping examples (inside a Flow subclass constructor) ---

// Basic connection (no then/catch):
//   YAML: on.state=ApprovalCenter, event=ApprovalCenter.viewDetail,
//         pipe=[buildApprovalDetailNavigation()], call.state=router, method=navigateTo, param=target
//   this._connect(0, ApprovalCenter, 'ApprovalCenter.viewDetail', router, 'navigateTo', 'target', [buildApprovalDetailNavigation]);

// Unicast then/catch:
//   YAML: then.state=ApprovalCenter, method=renderPendingList, param=data
//         catch.state=ApprovalCenter, method=showError, param=error, pipe=[buildApprovalError()]
//   this._connect(
//     0, ApprovalCenter, 'ApprovalCenter.loadPendingList',
//     approvalApi, 'fetchPendingList', 'query', [],
//     { targetState: ApprovalCenter, targetMethod: 'renderPendingList', targetParam: 'data', pipe: [] },
//     { targetState: ApprovalCenter, targetMethod: 'showError', targetParam: 'error', pipe: [buildApprovalError] }
//   );

// Multicast then:
//   YAML: then=[{state:Store,method:save,param:token,pipe:[extractToken()]},
//               {state:Dashboard,method:render,param:user,pipe:[extractUser()]}]
//   this._connect(
//     0, UserPage, 'UserPage.submit',
//     Auth, 'login', 'username', [getUsername],
//     [
//       { targetState: Store, targetMethod: 'save', targetParam: 'token', pipe: [extractToken] },
//       { targetState: Dashboard, targetMethod: 'render', targetParam: 'user', pipe: [extractUser] },
//     ],
//     { targetState: Dashboard, targetMethod: 'showError', targetParam: 'error', pipe: [] }
//   );

// Broadcast then/catch:
//   YAML: then.event=loginSuccess, catch.event=loginError
//   this._connect(
//     0, UserPage, 'UserPage.submit',
//     Auth, 'login', 'credentials', [getCredentials],
//     { event: 'loginSuccess' },
//     { event: 'loginError' }
//   );

// Broadcast event listener (on without state):
//   YAML: on.event=loginSuccess (no state)
//   this._connect(0, undefined, 'loginSuccess', Store, 'save', 'token', [extractToken]);

// Zero-parameter call:
//   YAML: call.method=logout (no param)
//   this._connect(
//     0, UserPage, 'UserPage.logoutClick',
//     Auth, 'logout', undefined, [],
//     { targetState: UserPage, targetMethod: 'render', targetParam: 'config', pipe: [] }
//   );

// Nested then chain:
//   YAML: then: state=B, method=process, then: state=C, method=save, then: state=A, method=render
//   {
//     targetState: B, targetMethod: 'process', targetParam: 'data', pipe: [],
//     then: {
//       targetState: C, targetMethod: 'save', targetParam: 'data', pipe: [],
//       then: { targetState: A, targetMethod: 'render', targetParam: 'result', pipe: [] },
//     },
//   }

// --- Complete example ---

// Given README.yaml with participants: ApprovalCenter (pages/ApprovalCenter),
// approvalApi (states/approvalApi), router (states/router)

import ApprovalCenter from "pages/ApprovalCenter";
import approvalApi from "states/approvalApi";
import router from "states/router";

import buildApprovalError from "algorithms/buildApprovalError";
import buildApprovalDetailNavigation from "algorithms/buildApprovalDetailNavigation";

class ApprovalCenterFlow extends Flow {
  constructor() {
    super();

    this._connect(
      0, ApprovalCenter, 'ApprovalCenter.loadPendingList',
      approvalApi, 'fetchPendingList', 'query', [],
      { targetState: ApprovalCenter, targetMethod: 'renderPendingList', targetParam: 'data', pipe: [] },
      { targetState: ApprovalCenter, targetMethod: 'showError', targetParam: 'error', pipe: [buildApprovalError] }
    );

    this._connect(1, ApprovalCenter, 'ApprovalCenter.viewDetail', router, 'navigateTo', 'target', [buildApprovalDetailNavigation]);
  }
}

export default new ApprovalCenterFlow();
