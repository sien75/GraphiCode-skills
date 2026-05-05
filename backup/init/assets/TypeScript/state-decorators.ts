function getParamNames(fn: Function): string[] {
  const s = fn.toString();
  const match = s.match(/\(([^)]*)\)/);
  if (!match) return [];
  return match[1].split(',').map(p => p.trim().split(/[:\s=]/)[0]).filter(Boolean);
}

function guardEnabled<This extends { _enabled: boolean }, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  _context: ClassMethodDecoratorContext<This>,
) {
  return function (this: This, ...args: Args): Return | undefined {
    if (!this._enabled) return;
    return target.apply(this, args);
  };
}

function curried<This extends object>(
  target: (this: This, ...args: any[]) => any,
  _context: ClassMethodDecoratorContext<This>,
) {
  const paramNames = getParamNames(target);
  const paramCount = target.length;
  const collectorsKey = Symbol('collectors');

  return function (this: any, callerId: any, param: { key: string | undefined; value: any }) {
    if (!this[collectorsKey]) this[collectorsKey] = new Map();
    const collectors: Map<any, Map<string, any>> = this[collectorsKey];

    if (!collectors.has(callerId)) collectors.set(callerId, new Map());
    const collected = collectors.get(callerId)!;
    if (param.key !== undefined) collected.set(param.key, param.value);

    if (collected.size >= paramCount) {
      collectors.delete(callerId);
      const args = paramNames.map(name => collected.get(name));
      return target.apply(this, args);
    }
  };
}

export { guardEnabled, curried };
