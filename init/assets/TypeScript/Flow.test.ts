import State from './State';
import { Flow, ThenDef } from './Flow';
import { curried } from './state-decorators';

class TestState extends State {
  [key: string]: any;
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
  class Dst extends State {
    @curried
    doSomething(data: string) { calls.push(data); return data; }
  }
  const dst2 = new Dst();
  dst2.enable();

  flow.connect(0, src, 'click', dst2, 'doSomething', 'data');
  src.emit('click', 'hello');

  assert(calls.length === 1, 'method called once');
  assert(calls[0] === 'hello', 'correct value');
}

// ─── Test 2: Multi param (parameter collection via @curried) ─

console.log('\nTest 2: Multi param via @curried');
{
  const flow = new TestFlow();
  const page = new TestState();
  page.enable();

  const calls: any[] = [];
  class Auth extends State {
    @curried
    login(username: string, password: string) {
      calls.push({ username, password });
      return 'ok';
    }
  }
  const auth = new Auth();
  auth.enable();

  flow.connect(0, page, 'submit', auth, 'login', 'username', [({ payload }: any) => payload.toUpperCase()]);
  flow.connect(1, page, 'submit', auth, 'login', 'password');
  page.emit('submit', 'alice');

  assert(calls.length === 1, 'login called once');
  assert(calls[0].username === 'ALICE', 'pipe transformed username');
  assert(calls[0].password === 'alice', 'password through');
}

// ─── Test 3: Pipe chain ─────────────────────────────────

console.log('\nTest 3: Pipe chain');
{
  const flow = new TestFlow();
  const src = new TestState();
  src.enable();

  const calls: any[] = [];
  class Dst extends State {
    @curried
    process(result: string) { calls.push(result); return result; }
  }
  const dst = new Dst();
  dst.enable();

  flow.connect(0, src, 'data', dst, 'process', 'result', [
    ({ payload }: any) => payload * 2,
    ({ payload }: any) => payload + 10,
    ({ payload }: any) => `val:${payload}`,
  ]);
  src.emit('data', 5);

  assert(calls[0] === 'val:20', 'chain: 5*2+10=20');
}

// ─── Test 4: Then - unicast ──────────────────────────────

console.log('\nTest 4: Then - unicast');
{
  const flow = new TestFlow();
  const page = new TestState();
  page.enable();

  const renderCalls: any[] = [];
  class Store extends State {
    @curried
    read(key: string) { return { config: 'val-' + key }; }
  }
  class Page extends State {
    @curried
    render(config: any) { renderCalls.push(config); }
  }
  const store = new Store();
  const page2 = new Page();
  store.enable(); page2.enable();

  flow.connect(0, page, 'init', store, 'read', 'key', [],
    { targetState: page2, targetMethod: 'render', targetParam: 'config', pipe: [] }
  );
  page.emit('init', 'myKey');

  assert(renderCalls.length === 1, 'render called');
  assert(renderCalls[0].config === 'val-myKey', 'correct value');
}

// ─── Test 5: Catch - error routing ───────────────────────

console.log('\nTest 5: Catch - error routing');
{
  const flow = new TestFlow();
  const page = new TestState();
  page.enable();

  const okCalls: any[] = [];
  const errCalls: any[] = [];
  class Store extends State {
    @curried
    read(key: string): any { throw new Error('not found'); }
  }
  class Page extends State {
    @curried
    render(config: any) { okCalls.push(config); }
    @curried
    showError(error: any) { errCalls.push(error); }
  }
  const store = new Store();
  const page2 = new Page();
  store.enable(); page2.enable();

  flow.connect(0, page, 'init', store, 'read', 'key', [],
    { targetState: page2, targetMethod: 'render', targetParam: 'config', pipe: [] },
    { targetState: page2, targetMethod: 'showError', targetParam: 'error', pipe: [] }
  );
  page.emit('init', 'badKey');

  assert(okCalls.length === 0, 'render not called');
  assert(errCalls.length === 1, 'showError called');
  assert(errCalls[0].message === 'not found', 'correct error');
}

// ─── Test 6: Then - multicast ────────────────────────────

console.log('\nTest 6: Then - multicast');
{
  const flow = new TestFlow();
  const page = new TestState();
  page.enable();

  const saveCalls: any[] = [];
  const renderCalls: any[] = [];
  class Auth extends State {
    @curried
    login(cred: string) { return { token: 'tk', user: 'alice' }; }
  }
  class TokenStore extends State {
    @curried
    save(token: string) { saveCalls.push(token); }
  }
  class Dash extends State {
    @curried
    render(user: string) { renderCalls.push(user); }
  }
  const auth = new Auth();
  const store = new TokenStore();
  const dash = new Dash();
  auth.enable(); store.enable(); dash.enable();

  flow.connect(0, page, 'submit', auth, 'login', 'cred', [], [
    { targetState: store, targetMethod: 'save', targetParam: 'token', pipe: [({ payload }: any) => payload.token] },
    { targetState: dash, targetMethod: 'render', targetParam: 'user', pipe: [({ payload }: any) => payload.user] },
  ]);
  page.emit('submit', 'alice');

  assert(saveCalls.length === 1 && saveCalls[0] === 'tk', 'store.save got token');
  assert(renderCalls.length === 1 && renderCalls[0] === 'alice', 'dash.render got user');
}

// ─── Test 7: Then - broadcast ────────────────────────────

console.log('\nTest 7: Then - broadcast');
{
  const flow1 = new TestFlow();
  const flow2 = new TestFlow();
  const page = new TestState();
  page.enable();

  const saveCalls: any[] = [];
  class Auth extends State {
    @curried
    login(cred: string) { return { token: 'tk-' + cred }; }
  }
  class TokenStore extends State {
    @curried
    save(token: any) { saveCalls.push(token); }
  }
  const auth = new Auth();
  const store = new TokenStore();
  auth.enable(); store.enable();

  flow1.connect(0, page, 'submit', auth, 'login', 'cred', [],
    { event: 'loginSuccess' }
  );
  flow2.connect(0, undefined, 'loginSuccess', store, 'save', 'token');

  page.emit('submit', 'alice');

  assert(saveCalls.length === 1, 'store.save called via broadcast');
  assert(saveCalls[0].token === 'tk-alice', 'broadcast carried return value');
}

// ─── Test 8: Nested then chain ───────────────────────────

console.log('\nTest 8: Nested then chain (A → B → C → A)');
{
  const flow = new TestFlow();

  const finalCalls: any[] = [];
  class A extends TestState {
    @curried
    render(result: string) { finalCalls.push(result); }
  }
  class B extends TestState {
    @curried
    process(data: string) { return 'processed-' + data; }
  }
  class C extends TestState {
    @curried
    save(data: string) { return 'saved-' + data; }
  }
  const a = new A(); const b = new B(); const c = new C();
  a.enable(); b.enable(); c.enable();

  flow.connect(0, a, 'click', b, 'process', 'data', [], {
    targetState: c, targetMethod: 'save', targetParam: 'data', pipe: [],
    then: { targetState: a, targetMethod: 'render', targetParam: 'result', pipe: [] },
  });
  a.emit('click', 'hello');

  assert(finalCalls.length === 1, 'a.render called');
  assert(finalCalls[0] === 'saved-processed-hello', 'chained B → C → A');
}

// ─── Test 9: Promise resolve/reject ──────────────────────

console.log('\nTest 9: Promise support');
{
  const flow = new TestFlow();
  const page = new TestState();
  page.enable();

  const okCalls: any[] = [];
  const errCalls: any[] = [];
  class Api extends State {
    @curried
    fetch(url: string) { return Promise.resolve('data-' + url); }
  }
  class Page extends State {
    @curried
    show(data: string) { okCalls.push(data); }
    @curried
    showErr(error: any) { errCalls.push(error); }
  }
  const api = new Api();
  const page2 = new Page();
  api.enable(); page2.enable();

  flow.connect(0, page, 'load', api, 'fetch', 'url', [],
    { targetState: page2, targetMethod: 'show', targetParam: 'data', pipe: [] },
    { targetState: page2, targetMethod: 'showErr', targetParam: 'error', pipe: [] }
  );
  page.emit('load', '/api/items');

  setTimeout(() => {
    assert(okCalls.length === 1, 'then called after resolve');
    assert(okCalls[0] === 'data-/api/items', 'resolved value routed');
    assert(errCalls.length === 0, 'catch not called');

    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
  }, 0);
}

// ─── Test 10: @curried flow isolation ────────────────────

console.log('\nTest 10: @curried flow isolation');
{
  const flow1 = new TestFlow();
  const flow2 = new TestFlow();
  const pageA = new TestState();
  const pageB = new TestState();
  pageA.enable(); pageB.enable();

  const calls: any[] = [];
  class Auth extends State {
    @curried
    login(username: string, password: string) {
      calls.push({ username, password });
      return 'ok';
    }
  }
  const auth = new Auth();
  auth.enable();

  // flow1 fills username, flow2 fills username — should not mix
  flow1.connect(0, pageA, 'submit', auth, 'login', 'username');
  flow1.connect(1, pageA, 'submit', auth, 'login', 'password');

  flow2.connect(0, pageB, 'submit', auth, 'login', 'username');
  flow2.connect(1, pageB, 'submit', auth, 'login', 'password');

  pageA.emit('submit', 'alice');
  pageB.emit('submit', 'bob');

  assert(calls.length === 2, 'login called twice (once per flow)');
  assert(calls[0].username === 'alice' && calls[0].password === 'alice', 'flow1 got alice');
  assert(calls[1].username === 'bob' && calls[1].password === 'bob', 'flow2 got bob');
}
