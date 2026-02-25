type RelationType = "$" | "&" | "@";

type NodeInput = {
  subscribes: Record<string, any>;
  pulls: Record<string, any>;
  passes: Record<string, any>;
};

type NodeOutput = {
  pushes: Record<string, any>;
  passes: Record<string, any>;
};

type NodeFn = (input: NodeInput) => NodeOutput | Promise<NodeOutput>;

type StateLink = { state: any; method: string; field: string };

class Flow {
  private _nextNodes = new Map<NodeFn, Set<NodeFn>>();
  private _pulls = new Map<NodeFn, StateLink[]>();
  private _pushes = new Map<NodeFn, StateLink[]>();

  private _subscriptionFields = new Map<NodeFn, string>();
  private _pendingPasses = new Map<NodeFn, Record<string, any>>();

  protected _composeMajorPipeline(...nodes: NodeFn[]) {
    for (let i = 0; i < nodes.length - 1; i++) {
      if (!this._nextNodes.has(nodes[i])) {
        this._nextNodes.set(nodes[i], new Set());
      }
      this._nextNodes.get(nodes[i])!.add(nodes[i + 1]);
    }
  }

  protected _linkMinorRelation(
    type: RelationType,
    state: any,
    stateMethod: string,
    node: NodeFn,
    nodeField: string
  ) {
    if (type === "$") {
      this._subscriptionFields.set(node, nodeField);
      state[stateMethod]((data: any) => {
        const pending = this._pendingPasses.get(node) ?? {};
        this._pendingPasses.delete(node);
        this._execute(node, { [nodeField]: data }, pending);
      });
    } else if (type === "&") {
      if (!this._pulls.has(node)) this._pulls.set(node, []);
      this._pulls.get(node)!.push({ state, method: stateMethod, field: nodeField });
    } else if (type === "@") {
      if (!this._pushes.has(node)) this._pushes.set(node, []);
      this._pushes.get(node)!.push({ state, method: stateMethod, field: nodeField });
    }
  }

  private async _execute(
    node: NodeFn,
    subscribes: Record<string, any>,
    passes: Record<string, any>
  ) {
    const pulls: Record<string, any> = {};
    const pullLinks = this._pulls.get(node);
    if (pullLinks) {
      for (const p of pullLinks) {
        pulls[p.field] = p.state[p.method]();
      }
    }

    const output = await node({ subscribes, pulls, passes });

    const pushLinks = this._pushes.get(node);
    if (pushLinks) {
      for (const p of pushLinks) {
        p.state[p.method](output.pushes[p.field]);
      }
    }

    const nexts = this._nextNodes.get(node);
    if (nexts) {
      for (const next of nexts) {
        if (this._subscriptionFields.has(next)) {
          const existing = this._pendingPasses.get(next) ?? {};
          this._pendingPasses.set(next, { ...existing, ...output.passes });
        } else {
          await this._execute(next, {}, { ...output.passes });
        }
      }
    }
  }
}

export default Flow;
