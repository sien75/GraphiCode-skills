import { Subject } from 'rxjs';
import Subscription from './Subscription';
import { Flow, ThenDef } from './Flow';

class TestState extends Subscription {
  [key: string]: any;
  on(eventId: string): Subject<any> { return this._subscribe(eventId); }
  emit(eventId: string, payload?: any): void { this._publish(eventId, payload); }
}

class TestFlow extends Flow {
  public connect(
    sn: number, sourceState: any, sourceEvent: string,
    targetState: any, targetMethod: string, targetParam: string,
    pipe: ((input: any) => any)[] = [], thenDef?: ThenDef, catchDef?: ThenDef
  ) {
    this._connect(sn, sourceState, sourceEvent, targetState, targetMethod, targetParam, pipe, thenDef, catchDef);
  }
}

let passed = 0;
let failed = 0;
function assert(condition: boolean, message: string) {
  if (condition) { console.log(`  ✓ ${message}`); passed++; }
  else { console.error(`  ✗ ${message}`); failed++; }
}

// ─── Test 1: Broadcast event - single param ─────────────

console.log('\nTest 1: Broadcast event - single param');
{
  const flow = new TestFlow();
  const src = new TestState();
  const dst = new TestState();
  src.enable(); dst.enable();

  const calls: any[] = [];
  dst.doSomething = (p: any) => { calls.push(p); };

  flow.connect(0, src, 'click', dst, 'doSomething', 'data');
  src.emit('click', 'hello');

  assert(calls.length === 1, 'method called once');
  assert(calls[0].value === 'hello', 'correct value');
}

// ─── Test 2: Multi param (parameter collection) ─────────

console.log('\nTest 2: Multi param');
{
  const flow = new TestFlow();
  const page = new TestState();
  const auth = new TestState();
  page.enable(); auth.enable();

  const calls: any[] = [];
  auth.login = (p1: any, p2: any) => { calls.push({ p1, p2 }); return 'ok'; };

  flow.connect(0, page, 'submit', auth, 'login', 'username', [({ payload }: any) => payload.toUpperCase()]);
  flow.connect(1, page, 'submit', auth, 'login', 'password');
  page.emit('submit', 'alice');

  assert(calls.length === 1, 'login called once');
  assert(calls[0].p1.value === 'ALICE', 'pipe transformed');
  assert(calls[0].p2.value === 'alice', 'password through');
}

// ─── Test 3: Pipe chain ─────────────────────────────────

console.log('\nTest 3: Pipe chain');
{
  const flow = new TestFlow();
  const src = new TestState();
  const dst = new TestState();
  src.enable(); dst.enable();

  const calls: any[] = [];
  dst.process = (p: any) => { calls.push(p); };

  flow.connect(0, src, 'data', dst, 'process', 'result', [
    ({ payload }: any) => payload * 2,
    ({ payload }: any) => payload + 10,
    ({ payload }: any) => `val:${payload}`,
  ]);
  src.emit('data', 5);

  assert(calls[0].value === 'val:20', 'chain: 5*2+10=20');
}

// ─── Test 4: Then - unicast ──────────────────────────────

console.log('\nTest 4: Then - unicast');
{
  const flow = new TestFlow();
  const page = new TestState();
  const store = new TestState();
  page.enable(); store.enable();

  const renderCalls: any[] = [];
  store.read = (p: any) => ({ config: 'val-' + p.value });
  page.render = (p: any) => { renderCalls.push(p); };

  flow.connect(0, page, 'init', store, 'read', 'key', [],
    { targetState: page, targetMethod: 'render', targetParam: 'config', pipe: [] }
  );
  page.emit('init', 'myKey');

  assert(renderCalls.length === 1, 'render called');
  assert(renderCalls[0].value.config === 'val-myKey', 'correct value');
}

// ─── Test 5: Catch - error routing ───────────────────────

console.log('\nTest 5: Catch - error routing');
{
  const flow = new TestFlow();
  const page = new TestState();
  const store = new TestState();
  page.enable(); store.enable();

  const okCalls: any[] = [];
  const errCalls: any[] = [];
  store.read = () => { throw new Error('not found'); };
  page.render = (p: any) => { okCalls.push(p); };
  page.showError = (p: any) => { errCalls.push(p); };

  flow.connect(0, page, 'init', store, 'read', 'key', [],
    { targetState: page, targetMethod: 'render', targetParam: 'config', pipe: [] },
    { targetState: page, targetMethod: 'showError', targetParam: 'error', pipe: [] }
  );
  page.emit('init', 'badKey');

  assert(okCalls.length === 0, 'render not called');
  assert(errCalls.length === 1, 'showError called');
  assert(errCalls[0].value.message === 'not found', 'correct error');
}

// ─── Test 6: Then - multicast ────────────────────────────

console.log('\nTest 6: Then - multicast');
{
  const flow = new TestFlow();
  const page = new TestState();
  const auth = new TestState();
  const store = new TestState();
  const dash = new TestState();
  page.enable(); auth.enable(); store.enable(); dash.enable();

  const saveCalls: any[] = [];
  const renderCalls: any[] = [];
  auth.login = (p: any) => ({ token: 'tk', user: 'alice' });
  store.save = (p: any) => { saveCalls.push(p); };
  dash.render = (p: any) => { renderCalls.push(p); };

  flow.connect(0, page, 'submit', auth, 'login', 'cred', [], [
    { targetState: store, targetMethod: 'save', targetParam: 'token', pipe: [({ payload }: any) => payload.token] },
    { targetState: dash, targetMethod: 'render', targetParam: 'user', pipe: [({ payload }: any) => payload.user] },
  ]);
  page.emit('submit', 'alice');

  assert(saveCalls.length === 1 && saveCalls[0].value === 'tk', 'store.save got token');
  assert(renderCalls.length === 1 && renderCalls[0].value === 'alice', 'dash.render got user');
}

// ─── Test 7: Then - broadcast ────────────────────────────

console.log('\nTest 7: Then - broadcast');
{
  const flow1 = new TestFlow();
  const flow2 = new TestFlow();
  const page = new TestState();
  const auth = new TestState();
  const store = new TestState();
  page.enable(); auth.enable(); store.enable();

  const saveCalls: any[] = [];
  auth.login = (p: any) => ({ token: 'tk-' + p.value });
  store.save = (p: any) => { saveCalls.push(p); };

  // flow1: login then broadcast loginSuccess on auth
  flow1.connect(0, page, 'submit', auth, 'login', 'cred', [],
    { event: 'loginSuccess' }
  );
  // flow2: listen to EventBus loginSuccess (no sourceState), call store.save
  flow2.connect(0, undefined, 'loginSuccess', store, 'save', 'token');

  page.emit('submit', 'alice');

  assert(saveCalls.length === 1, 'store.save called via broadcast');
  assert(saveCalls[0].value.token === 'tk-alice', 'broadcast carried return value');
}

// ─── Test 8: Nested then chain ───────────────────────────

console.log('\nTest 8: Nested then chain (A → B → C → A)');
{
  const flow = new TestFlow();
  const a = new TestState();
  const b = new TestState();
  const c = new TestState();
  a.enable(); b.enable(); c.enable();

  const finalCalls: any[] = [];
  b.process = (p: any) => 'processed-' + p.value;
  c.save = (p: any) => 'saved-' + p.value;
  a.render = (p: any) => { finalCalls.push(p); };

  flow.connect(0, a, 'click', b, 'process', 'data', [], {
    targetState: c, targetMethod: 'save', targetParam: 'data', pipe: [],
    then: { targetState: a, targetMethod: 'render', targetParam: 'result', pipe: [] },
  });
  a.emit('click', 'hello');

  assert(finalCalls.length === 1, 'a.render called');
  assert(finalCalls[0].value === 'saved-processed-hello', 'chained B → C → A');
}

// ─── Test 9: Promise resolve/reject ──────────────────────

console.log('\nTest 9: Promise support');
{
  const flow = new TestFlow();
  const page = new TestState();
  const api = new TestState();
  page.enable(); api.enable();

  const okCalls: any[] = [];
  const errCalls: any[] = [];
  api.fetch = (p: any) => Promise.resolve('data-' + p.value);
  page.show = (p: any) => { okCalls.push(p); };
  page.showErr = (p: any) => { errCalls.push(p); };

  flow.connect(0, page, 'load', api, 'fetch', 'url', [],
    { targetState: page, targetMethod: 'show', targetParam: 'data', pipe: [] },
    { targetState: page, targetMethod: 'showErr', targetParam: 'error', pipe: [] }
  );
  page.emit('load', '/api/items');

  setTimeout(() => {
    assert(okCalls.length === 1, 'then called after resolve');
    assert(okCalls[0].value === 'data-/api/items', 'resolved value routed');
    assert(errCalls.length === 0, 'catch not called');

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
  }, 0);
}
