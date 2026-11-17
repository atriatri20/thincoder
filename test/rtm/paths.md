# RTM 分册 · paths

> 本册护的机制 = 路径与项目根解析（工作区锚 ∥ manifest ∥ 统一解析层）；族表与归属判据 = docs/core/design/TESTING.md。
> 索引回指 = test/RTM.md：故事索引表（含端覆盖矩阵）∥「异常与更正」∥ 签署面只住索引；本册只装故事节与用例行。

## CLI 9. 项目根解析：工作区锚不就地建档

> 目的：会话锚是多根工作区（自身无档、下辖有项目）时，建档流当场报明项目并给路，不在用户目录里凭空生成 `PROJECT-MANIFEST.json`。
> 节注：回指 = `docs/core/design/MANIFEST.md`「项目解析」∥「manifest 工具」∥「Schema 与默认值」（`codePaths` 缺省 = `[]`）∥ `docs/core/design/PORTABILITY.md`「项目声明」；三态（行序）= 9-1 错误 · 9-2 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 9-1 | 夹具目录（根无 `PROJECT-MANIFEST.json`、下辖 1 个裸仓——`.git` 无档）为会话锚，直调 `manifest` 工具 `init`（`target` = 该目录） | 当场拒（抛，前缀 `manifest init: refused`）：文案含 `workspace` 态 + 下辖候选全列 + 显式 `target` 指引；**零建档**——锚目录下零 `PROJECT-MANIFEST.json` 新建、裸仓档零变 | — | `test/integration/manifest-workspace-init.test.mjs` |
| 9-2 | 空目录直调 `manifest` 工具 `init`（`target` = 该目录）建档并读回档；同一仓内配 `src/` 段下的文档后缀档与脚本各一，读分类；再调 `manifest write` 显式写 `codePaths: ["src"]` 读同一路径 | 建档后档内 `codePaths` 缺键或为 `[]`；未声明代码段 ⇒ `src` 下文档后缀档判 `doc`、脚本判 `code`（兜底仍在）；显式声明 `src` 段后同一文档后缀档判 `code` | — | `test/integration/manifest-init-default.test.mjs` |

## CLI 29. 路径解析统一层

> 目的：同一条相对路径在哪个面都得到同一个答案——判得出就解析出，判不出就停下要人挑（列出候选）。
> 节注：回指 = 需求 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md`「路径」· `docs/core/requirements/DOC-CHECK.md` F3 ∥ F4 ∥ AC-3 ∥ AC-4（行 29-3 ∥ 29-4 的判据）；机制单源 = `docs/core/design/PATH-RESOLUTION.md`（工具面的路径解析）；「被引的那份档在不在」那一面住 `docs/core/design/DOC-CHECK.md` ∥ §4；交互组件 = 统一解析层 `thincoder-core/path-resolve.mjs` ⟷ 七个吃路径的面（批档读 ∥ create ∥ 评审文档 ∥ 子代理 `files` ∥ 台账 `cwd` ∥ `doc_check target` ∥ 文档锚面）；进入口 = 父侧 `batch append` 一笔 / 一次 `advisor` 发起 / 一跑 `doc_check`；四态（行序）= 29-1 正常 · 29-2 错误 · 29-3 边界 · 29-4 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 29-1 | 父侧 `batch append` 写一笔 §1：批档以**裸档名**定位（档在 `docRoot.batches` 下），写入文本里再引一个裸档名 | 写入落盘（回执含 `appended`）、回执无 `DOC-CHECK GATE: REFUSED`（门不再判档缺）；追加文本在档内可读回 | — | `test/integration/path-resolution.test.mjs` |
| 29-2 | 会话锚 = 工作区（下辖两项目），三面各一笔：`batch status` 传项目根相对形 ∥ `ledger count` 不带 `cwd` ∥ `doc_check({mode:"gate"})` 不带 `target` | 三面同一句报明形：拒 + 候选全列（批档面回执含 `Candidates:` 与两个项目名；台账面含「未找到项目根」+ 下辖候选；文档门面拒 + 报文点名 `target`（`target` 必填后不再走歧义支——首行不是 `DOC-CHECK GATE: ERROR（多项目工作区：请指名 target）`）） | — | `test/integration/path-resolution.test.mjs` |
| 29-3 | 夹具项目里放一档写两条 `../` 出仓的指针（一条真实在盘、一条不在盘），调 `doc_check({mode:"gate", docs:[该档], target})`；另备一档写一条仓内带目录段的悬空指针，同跑 | 前半：首行 `DOC-CHECK GATE: PASS`、零命中行（仓外一律不看——在盘与不在盘同等）；后半：`REFUSED`、命中行点名该档与该 token——两半都成立才算过 | 回指 = `docs/core/requirements/DOC-CHECK.md` F4 ∥ AC-4；判据 = `docs/core/design/DOC-CHECK.md` | `test/integration/path-resolution.test.mjs` |
| 29-4 | 夹具项目里让同一个后缀在仓内两处各有一份档，一份档引它；另备一份档引一个仓内零命中的带目录段 token，同跑 `doc_check` | 前半：首行 `PASS`、零命中行（有就行、不判唯一）；后半：`REFUSED`、命中行点名该 token——两半都成立才算过 | 回指 = `docs/core/requirements/DOC-CHECK.md` F3 ∥ AC-3；判据 = `docs/core/design/DOC-CHECK.md`「有就行，不判唯一」 | `test/integration/path-resolution.test.mjs` |
