# RTM 分册 · paths

> 本册护的机制 = 路径与项目根解析（工作区锚 ∥ manifest ∥ 统一解析层）；族表与归属判据 = docs/core/design/TESTING.md §11.18.3。
> 索引回指 = test/RTM.md：故事索引表（含端覆盖矩阵）∥「异常与更正」∥ 签署面只住索引；本册只装故事节与用例行。

## CLI 9. 项目根解析：工作区锚不就地建档

> 目的：会话锚是多根工作区（自身无档、下辖有项目）时，建档流当场报明项目并给路，不在用户目录里凭空生成 `PROJECT-MANIFEST.json`。
> 节注：回指 = docs/core/design/MANIFEST.md AC-22 ∥ AC-27 ∥ T51（判据 = docs/core/design/LEDGER.md §3.8「多根工作区锚（batch 面）」）；三态（行序）= 9-1 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 9-1 | 夹具目录（根无 `PROJECT-MANIFEST.json`、下辖 1 个裸仓——`.git` 无档）为会话锚，直调 `manifest` 工具 `init`（`target` = 该目录） | 当场拒（抛，前缀 `manifest init: refused`）：文案含 `workspace` 态 + 下辖候选全列 + 显式 `target` 指引；**零建档**——锚目录下零 `PROJECT-MANIFEST.json` 新建、裸仓档零变 | — | `test/integration/manifest-workspace-init.test.mjs` |

## CLI 29. 路径解析统一层

> 目的：同一条相对路径在哪个面都得到同一个答案——判得出就解析出，判不出就停下要人挑（列出候选），解析无果就说清缺哪一段并列出盘上同名档；跨仓引用只判「引用写对没有」。
> 节注：回指 = 需求 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md`（相对路径解析序与防嵌套 F-BP1）· `docs/core/requirements/PROMPT-SYSTEM.md` ⑤（跨仓引用三态）· `docs/core/requirements/ADVISOR-CONVERGENCE.md` §2.3 条目 F18；机制单源 = `docs/core/design/PATH-RESOLUTION.md` §2（四态与判定算法）∥ §2.6（报明文）∥ §2.7（跨仓判据）；交互组件 = 统一解析层 `thincoder-core/path-resolve.mjs` ⟷ 七个吃路径的面（批档读 ∥ create ∥ 评审文档 ∥ 子代理 `files` ∥ 台账 `cwd` ∥ `doc_check target` ∥ 文档锚面）；进入口 = 父侧 `batch append` 一笔 / 一次 `advisor` 发起 / 一跑 `doc_check`；三态（行序）= 29-1 正常 · 29-2 错误 · 29-3 错误 · 29-4 边界 · 29-5 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 29-1 | 父侧 `batch append` 写一笔 §1：批档以**裸档名**定位（档在 `docRoot.batches` 下），写入文本里再引一个裸档名 | 写入落盘（回执含 `appended`）、回执无 `DOC-CHECK GATE: REFUSED`（门不再判档缺）；追加文本在档内可读回 | — | `test/integration/path-resolution.test.mjs` |
| 29-2 | 会话锚 = 工作区（下辖两项目），三面各一笔：`batch status` 传项目根相对形 ∥ `ledger count` 不带 `cwd` ∥ `doc_check({mode:"gate"})` 不带 `target` | 三面同一句报明形：拒 + 候选全列（批档面回执含 `Candidates:` 与两个项目名；台账面含「未找到项目根」+ 下辖候选；文档门首行 `DOC-CHECK GATE: ERROR（多项目工作区：请指名 target）` + 候选行） | — | `test/integration/path-resolution.test.mjs` |
| 29-3 | 文档门判一份引裸档名的档（裸名在项目根与引用方目录都不中、同名档在更深的子目录里） | 回执报「缺「<该名>」」+「盘上同名：<路径>」（「你是不是指这个」）；命中仍是 `档缺` 一条（候选不产受理） | — | `test/integration/path-resolution.test.mjs` |
| 29-4 | 文档门判一份含两条跨仓引用的档：一条首段 = 已声明仓名（本机没有该仓）、一条首段 = 项目根同级目录名（未声明） | 两条均零命中（写作被放行）；已声明形出行「仓「X」的 Y（声明源引用，未校验存在性）」，未声明形出行含「须先在 index.publicRepos 声明」+ 本机仓名候选 | — | `test/integration/path-resolution.test.mjs` |
| 29-5 | 文档门判一份形态错的跨仓引用（`仓名/../越界.md`）；同形改走台账面（`ledger update` 的 `task_book` 指同形路径） | 文档面仍判缺（`✗ 锚·档缺`，不落跨仓读数）；台账面硬拒（拒文含 `task_book 指向的档不存在`）——两面放宽面不同 | — | `test/integration/path-resolution.test.mjs` |
