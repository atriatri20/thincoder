# 工作区约定（WORKSPACE）· 设计

> 需求 = `docs/core/requirements/WORKSPACE.md`。
> 最近先例：`docs/core/design/ARCHITECTURE.md` 的 core 与端壳边界。对齐 = 共享机制进 core，宿主差异留端侧。
> 勘察证据：已核 `thincoder-core/skills.mjs` 的发现与排序、`thincoder-vscode/src/extension/skills.mjs` 的核转口，以及 core 和端侧相关模块的实际存在性。相关 = 当前单源和转口形态。

## 1. 模块归属

| 机制 | 共享实现 | 端侧面 |
|---|---|---|
| 技能 | `thincoder-core/skills.mjs` | 端侧可转口同步或异步接口 |
| 规则 | `thincoder-core/rules.mjs` | 装配与注入由当前端消费 |
| 同伴实例 | `peer-instances.mjs` · `peer-domains.mjs` | 只补宿主发现信息 |
| 工作项规则 | `ledger.mjs` · `conventions.mjs` · `escape.mjs` | 不另建规则副本 |
| 工作项呈现 | `ledger-surface.mjs` | CLI 与 VSC 各自适配界面 |

端侧转口只保持消费者 import 形状，不形成第二份逻辑。

## 2. 技能

### 2.1 发现形状

支持：

```text
.thincoder/skills/<name>.md
.thincoder/skills/<name>/SKILL.md
```

同时扫描项目级和用户级目录。项目级技能优先；同名时用户级条目不覆盖项目级条目。目录中的 `SKILL.md` 优先于同名扁平文件。

### 2.2 稳定与加载

- 文件和目录排序稳定。
- 技能名只接受当前名称规则允许的字符。
- 描述从技能内容中读取，缺失时使用明确占位。
- 目录缺失或不可读按发现结果处理，不制造技能。
- 系统提示只携带发现列表；skill 工具加载具体内容。

## 3. 规则

### 3.1 流规则

`.thincoder/rules/*.md` 使用 frontmatter 的 `pattern`、`action`、`repeat`。

- `abort`：中断当前输出并注入规则消息。
- `warn`：在相应回合边界注入去重提醒。
- 消费由 core 的统一流处理面承担。

### 3.2 Cursor 作用域规则

`.cursor/rules/` 支持 `.md` 与 `.mdc`，读取 `globs`、`alwaysApply` 和 `description`。

分类顺序：

1. `alwaysApply: true` → 常驻。
2. 有 `globs` → 按路径作用域在工具派发前提醒。
3. 无 `globs` 且无 `description` → 常驻。
4. 只有 `description` → 不自动注入。

匹配与分类由 core 统一实现。端侧负责把结果接入自己的提示或工具派发面。

## 4. 同伴与工作项

- 同伴模块只报告实际可发现、可寻址的实例。
- 跨实例消息不建立上下级关系，目标可以拒绝或忽略。
- 工作项数据、状态和路径规则由 core 决定。
- 展示模块可以格式化状态，但不能改变状态迁移和业务判据。

## 5. 验证与边界

- 技能验证覆盖两种文件形状、同名优先、稳定排序和缺失目录。
- 规则验证覆盖分类顺序、作用域匹配和去重。
- 端侧只增加宿主可见的集成场景，不复制 core 单元测试。
- 不在本档保存历史迁移裁决、相似度读数或一次性文件清单。
