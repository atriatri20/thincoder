# Function Spec · M1 项目状态档 manifest

> 模块归属 = `docs/core/design/ENGINEERING-MODE-V2.md` 的 M1。
> 当前实现与接口 = `docs/core/design/MANIFEST.md`。

## ① 模块目标

为任意用户提供一份纯机器可读的项目声明 `PROJECT-MANIFEST.json`。项目阶段、文档层、代码分类和索引范围从同一处读取。

manifest 描述用户项目自身，不承载产品提示词路径、评审配置、模型凭据或一次性决策。

## ② 功能点

1. **schema**：包含 `version`、`phase`、`docRoot`、`codePaths`、`index`。
2. **读、写、校验**：由 core 提供，操作对象为目标项目的 manifest；git 不是项目存在的前提。
3. **按用点解析**：动作作用于哪个项目的路径，就使用那个项目的声明；多项目工作区是正常状态。
4. **发现与归属分离**：归属沿目标祖先链上溯取最近 manifest；发现只查看锚的直接子目录，用于报告工作区，不用于猜测当前项目。
5. **缺档处置**：读取明确报告 missing / no-project / workspace / invalid；初始化是显式动作，不覆盖现有文件，不自动执行 `git init`。
6. **缺键回退**：缺键使用 `DEFAULT_MANIFEST`，并在 `missingKeys` 中报告；非法值进入 `errors`。
7. **写权**：主 agent 可初始化和点改；子代理只装配只读变体。写入必须通过校验和作者门。
8. **docRoot 值**：每个文档层接受非空字符串、非空字符串数组或 `null`。`null` 表示本层不存在；数组是完整声明，不与默认合并。
9. **文档层成员**：声明目录及其子目录中的 `.md` 属于该层；不跟随符号链接。
10. **索引声明**：支持扩展名、索引排除、文档检查排除、公共仓和可写外部目录。
11. **agent 工具**：提供 `read`、`init`、`write`；`target` 必填，写操作使用点路径，不接受 `docRoot` 或 `index` 整对象覆盖。
12. **情境行**：工程模式顶层会话按当前规则注入项目 phase 或不可解析状态，普通模式装配钩子不因 manifest 阻断会话。

## ③ 边界

- 不实现台账、批次档或文档检查的业务规则。
- 不替项目自动创建业务目录。
- 不把 manifest 当作模式开关；模式状态属于会话与配置。
- 不把决策、待裁项或历史写入 JSON。
- 不在工作区中任选一个子项目作为默认项目。
- 不通过未知键、非法 JSON 或非法形态静默改变业务结果。

## ④ 验收

| # | 判据 |
|---|---|
| AC-M1-1 | 非法 phase、version、docRoot 或声明键形态被校验拒绝 |
| AC-M1-2 | 缺档和无项目可读出不抛；普通模式不被装配钩子阻断 |
| AC-M1-3 | 缺键补默认并出现在 missingKeys；显式 null 不被补回 |
| AC-M1-5 | 非主 agent 写入不可达或被作者门拒绝 |
| AC-M1-6 | 工程模式情境行幂等、单活体，并能按当前 mtime 规则更新 |
| AC-M1-7 | docRoot 单根、多根和 null 均按声明解析；空串、空数组和混合数组拒绝 |
| AC-M1-8 | 子代理 files 域不能借 manifest 获得写权 |
| AC-M1-9 | 旧声明档不生效并可见告警；声明不可读时消费面按当前降级规则处理 |
| AC-M1-10 | read、init、write 可对全部合法节点完成读写往返 |
| AC-M1-11 | 非法写入、缺档 write 和重复 init 均拒绝且磁盘不变 |
| AC-M1-12 | 子代理工具 schema 只有 read；主 agent 具有完整动作 |

## ⑤ 依赖

- 基础实现：`thincoder-core/manifest.mjs`、`manifest-schema.mjs`、`manifest-discovery.mjs`。
- 声明投影：`thincoder-core/declaration.mjs`。
- 工具装配：`thincoder-core/agent/family-tools.mjs`。
- 消费面：文档检查、文档图、评审、批次、索引、会话情境和写门。

## ⑥ 解析模型

### 归属

目标路径从文件所在目录或目录自身开始，沿祖先链上溯，取最近的 manifest 目录。嵌套项目各自归属；没有 manifest 时不跨兄弟目录寻找项目。

项目根视图不向下选择项目。根视图使用目标所在文件系统盘根作为上溯边界；台账等其他消费面可以使用自己声明的边界。

### 发现

发现只看锚及其直接子目录：

1. 锚有 manifest，或锚是 git 仓根，属于锚自身形态。
2. 直接子目录优先报告带 manifest 的项目。
3. 没有带 manifest 子目录时才报告裸 git 仓。
4. 发现到一个或多个下辖项目时，项目根视图为 workspace，列出候选但不选根。
5. 都没有时为 none / no-project。

### 写入目标

`manifest` 工具的 `target` 必填。相对目标按会话锚解析；workspace 上的 init / write 拒绝并要求明确项目根。write 不建档，init 不覆盖。

### 多端

CLI、VSC、Desktop 和适用的子代理共享 core 解析与校验，不各建一套项目归属规则。
