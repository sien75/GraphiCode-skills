# Skill 修改意见

基于实际执行 Login 页面的完整流程，总结以下需要修改的问题。

## 核心原则补充

skill 的核心思想是"不要偷懒、不要预判，严格按流程执行，客观读取所有信息后再下结论"。以下修改意见均围绕这一原则展开。

---

## 1. 次 mockup 对比：强调必须读 tsx + less 两者

**问题**: 当前 step32 的 subagent context 模板中，没有明确要求 subagent 读取次 mockup 的 less 文件。实际执行中 subagent 只看了 tsx 就下结论，遗漏了 less 中体现的交互状态差异（如 loading 样式、disabled 置灰样式）。

**建议**: 在 step32-gen-main-scene.md 的 subagent context 模板中，明确写出：
- 必须先读取次 mockup 的 tsx **和** less 文件
- 必须先读取主场景当前的 tsx **和** less 文件
- 然后逐一对比差异（结构差异 + 样式差异），再决定需要修改什么

## 2. 次 mockup 对比：subagent 应自主发现差异，主 agent 不应预判

**问题**: 当前 subagent context 模板中有一个 `{xxx} (supplied by main agent)` 的"What is secondary scene?"字段。实际执行中，主 agent 会把自己对次 mockup 的预判写进去（如"The secondary likely shows..."），导致 subagent 带着偏见工作，忽略了实际的视觉差异。

**建议**:
- "What is secondary scene?" 字段改为只提供次 mockup 的名称和在 node-ids.md 中的描述
- 明确指示 subagent："你需要自己读取并对比两组文件，客观总结差异，不要依赖上面的描述"

## 3. 新增基本规范：类型引入

**问题**: subagent 在场景组件中重新定义了 `LoginPageStatus` 类型，而不是从 `typeDirs` 引入。这违反了 GraphiCode 的类型管理原则（类型统一在 typeDirs 中定义和引用）。

**建议**: 在 step32 或全局 Notes 中补充规范：
- 场景组件中用到的类型，必须从 `<typeDirs>/<typeId>` 引入（如 `import LoginPageStatus from '@/types/LoginPageStatus'`）
- 禁止在场景组件中重新定义已存在于 typeDirs 的类型

## 4. 新增基本规范：less 嵌套层级

**问题**: subagent 生成的 less 文件使用扁平结构（所有 class 平级），容易造成跨组件类名冲突。

**建议**: 在 step32 或全局 Notes 中补充规范：
- less 文件中所有子类选择器必须嵌套在根级 class 内部
- `:root` 变量定义除外
- 示例：
  ```less
  // 正确
  .loginPage {
    .logoArea { ... }
    .formTitle { ... }
  }

  // 错误
  .loginPage { ... }
  .logoArea { ... }
  .formTitle { ... }
  ```

## 5. 新增基本规范：props 格式统一传入

**问题**: 主 agent 在 index.tsx 中对不同场景传入了不同的 data 子集（如只传 `{ status, email }` 给某个场景），而不是统一传入完整 data。这违反了 skill 示例中的模式——应由各场景内部自行判断使用哪些字段。

**建议**: 在 step32 中明确写出：
- index.tsx 中必须将完整 data 对象统一传入每个场景组件
- 各场景组件内部自行从 data 中解构所需字段
- 引用 skill 已有的原则："NOT all data and event list need to be used. You need to judge which are useful in the current scenario"——这个判断发生在场景组件内部，不在 index.tsx 层面

## 6. Step 3.1 subagent 指令可执行性

**问题**: Step 3.1 要求"为每对 tsx & less 文件启动 subagent"，但实际执行时主 agent 倾向于偷懒在主上下文中直接读取，因为指令只提供了目标（移除框架代码）但没有强调"必须用 subagent"的原因。

**建议**: 在 step31-remove-structure.md 中补充说明：
- 明确写出"必须使用 subagent，禁止在主上下文中读取 mockup 文件内容"
- 解释原因：mockup 文件体积大，在主上下文中读取会浪费 token 并污染上下文
