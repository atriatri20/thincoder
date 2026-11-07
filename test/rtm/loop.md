# RTM 分册 · loop

> 本册护的机制 = 会话环与 provider（压缩 ∥ 断流 ∥ 空响应 ∥ 后台投递 ∥ 撞帽 ∥ 提醒预算）；族表与归属判据 = docs/core/design/TESTING.md §11.18.3。
> 索引回指 = test/RTM.md：故事索引表（含端覆盖矩阵）∥「异常与更正」∥ 签署面只住索引；本册只装故事节与用例行。

## CLI 11. 超窗守卫与内部阶段豁免（absent 档全档同判）

> 目的：越窗时要么先压一次再发，要么带三实数当场报错——不把同一条超限请求丢给服务端吃 400；压缩只在压完能落到线下时发生——不为一次没有净减的摘要白付请求，用户照常拿到答复。
> 节注：回指 = `docs/core/design/CONTEXT-COMPACTION.md` §6.2 ∥ §6.17；交互组件 = `thincoder-core/agent/run-stages.mjs`（守卫）· `thincoder-core/provider/{core,anthropic,google,responses}.mjs`（净判）· `thincoder-core/provider/errors.mjs`（400 分类）；需求回指 = `docs/core/requirements/CONTEXT-COMPACTION.md` §2.1（压缩线目标 60% ∥ 触发可达性门 ∥ F-CC2 主动压缩）；三态（行序）= 11-1 正常 · 11-2 错误 · 11-3 边界 · 11-4a 错误 · 11-4b 错误 · 11-5 边界 · 11-6 正常 · 11-7 边界 · 11-8 边界 · 11-9 错误。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 11-1 | CLI 会话经 provider 桩跑到估算越线（显式压缩线 750,000 隔离阈值面），再发一条消息 | 压缩事件恰好 1（`mode:"summary"`）；压缩请求 1 · 回合请求 1；全 200 无 400；`max_tokens` 仍未发 | — | `test/integration/context-overflow-guard.test.mjs` |
| 11-2 | 同上，摘要桩回超长摘要使压后仍越线 | 错误带 prompt / `max_tokens not sent` / 窗口三实数；强压请求恰 1 · 回合请求 0；无 400 | — | `test/integration/context-overflow-guard.test.mjs` |
| 11-3 | `absent` 档（deepseek-flash 形状）两半段：越线 620,000 ∥ 未越线 100,000，另加退化档 `doubao-seed-2-1-turbo-260628` | 越线：强压 1 · 回合请求 1 · 零 400；未越线：零压缩 · 请求照发；退化档：零压缩 · 请求照发（地板不误伤） | — | `test/integration/context-overflow-guard.test.mjs` |
| 11-4a | provider 桩首回合回 400 越窗报文，重试回合回 200 | 压缩事件恰 1（自适应压一次）· 压缩请求 1 · 回合请求 2（首 400 + 重试）· 用户拿到答复而非错误 | — | `test/integration/context-overflow-guard.test.mjs` |
| 11-4b | 同一夹具，压缩后重试仍回 400 越窗（二次越窗） | typed 错误浮出（`kind = "context_overflow"` · `retryable === false`）· 压缩恰 1（不再压）· 回合请求恰 2（无第三次）· 不静默截断 | — | `test/integration/context-overflow-guard.test.mjs` |
| 11-5 | 恢复带样本的会话（槽带 `estimateSample`：`num 723_272` / `den 491_000` ⇒ 比 ≈ 1.473；provider `maxTokens: 393_216` ⇒ `limit` 606,784），发一条消息 | 首请求估算支 ≈ 723,272 > `limit` ⇒ 触发压缩而非吃 400；业务可观察 = 重启后继续大会话不再 400 | 缺口来源 = 2026-10-27 上下文预算低估批；回指 = `docs/core/requirements/CONTEXT-COMPACTION.md` F-CC7 · `docs/core/design/CONTEXT-COMPACTION.md` §6.17.1 链二 | `test/integration/context-overflow-guard.test.mjs` |
| 11-6 | CLI 会话用 128,000 窗档（压缩线 76,800），provider 桩带巨型工具 schema 使 `system + tools` 估算 > 76,800、`history` 仅数条短消息（复刻一次真实超窗事故的现场），发一条消息 | 压缩事件 0（`agent._lastCompressInfo` 未置位）· 摘要请求 0（`logCtx.stage === "compress"` 零发）· 回合请求 1 · 用户拿到答复 · 无 400 | 缺口来源 = 压缩判据把固定开销算进被判定的一侧 | `test/integration/context-overflow-guard.test.mjs` |
| 11-7 | 同一档，`history` 堆出足量可摘中段，使 `history − middle + 注记 + 占位 + 开销` 的估算 ≤ 76,800，再发一条消息 | 压缩事件恰 1（`agent._lastCompressInfo.mode === "summary"`）· 摘要请求恰 1 · 回合请求恰 1 · 回复引用工具结果 | 同上 | `test/integration/context-overflow-guard.test.mjs` |
| 11-8 | CLI 会话里让模型主动调 `context{action:'compact'}`——用户说一句「压一下上下文」即进入该回合，且压后仍超压缩线 | 压缩仍执行恰 1——门只拦阈值面，`force` 全文豁免 | — | `test/integration/context-overflow-guard.test.mjs` |
| 11-9 | CLI 会话里粘一段超 `OVERSIZE_CONTENT_LIMIT` 的巨型日志发出去，且无中段可摘 | 走 `shrinkOversized`、体内出现截断标记；门不拦（零网络） | — | `test/integration/context-overflow-guard.test.mjs` |

## CLI 15. 偶发空响应不打断会话

> 目的：提供端瞬时吐空之后，用户照常拿到答复，而不是 `LLM returned empty response`；只有连续空才抛。
> 节注：回指 = `docs/core/design/AGENT-LOOP.md` §6.5①（清零判据 ∥ 额度 ∥ 清零点）· `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.31.8（判空加宽）；缺口来源 = 用户 2026-10-27 报告「deepseek-flash 一直报 empty response，点 retry 又能继续」。三态（行序）= 15-1 正常 · 15-2 错误 · 15-3 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 15-1 | CLI 会话里发一条消息，provider 桩按序回：空 → 带正文且带工具调用 → 空 → 带正文（中间轮必须带工具调用——零工具调用的带正文响应会当场收束本 run） | 用户拿到两次正文答复；中间轮之后 `_emptyRetries` 读到 0（读点在下一轮取值之前）；全程不抛 `LLM returned empty response` | — | `test/integration/empty-response-retry.test.mjs` |
| 15-2 | 同上，桩恒回空响应 | 第 3 次空响应当场抛 `LLM returned empty response`（文案带原错误）；前两次各注入一次空响应提醒 | — | `test/integration/empty-response-retry.test.mjs` |
| 15-3 | 同上，桩按序回：空 → 带工具调用 → 空 → 空 → 带正文 | 不抛；工具轮复位后两次空各计 1 / 2、第三次空未发生 ⇒ 重试成功。**修前此行为红**（工具轮不清零，第 3 次空即抛）——「不抛」本身即判别点 | — | `test/integration/empty-response-retry.test.mjs` |

## CLI 16. 状态行百分比与压缩判据同尺

> 目的：用户看到的上下文百分比就是压缩实际用的那把尺子——校准比生效，不是低报的裸估算。
> 节注：需求回指 = `docs/core/requirements/CONTEXT-COMPACTION.md`（F-CC1 感知「模型可查当前上下文的用量与构成」∥ 报面「同名输出不得两个无名百分比并存」）；设计回指 = `docs/core/design/CONTEXT-COMPACTION.md`（stats 面「与状态行 ctx% 的单源关系」条：单源 = 核 `historyReading`）；交互组件 = 槽 `estimateSample` → 核 `sampleRatio` / `restoreTokenSample` → CLI 渲染缓存 `ctxCacheOf` → 状态行渲染（四组件）；进入口 = CLI 恢复带样本的会话，用户肉眼读状态行；三态（行序）= 16-1 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 16-1 | CLI 端恢复一个**带 `estimateSample`** 的会话（`num` / `den` ⇒ 比 > 1，如 1473 / 1000），读状态行的 `context X%` 段，同一回合再调 `context` 工具的 `stats` | 状态行显示的 X = 核 `historyReading(合并后机读线, provider, `sampleRatio` 出的比).pct`（与未校准读数不同）；`stats` 第 6 行同值——两处一个数 | — | `test/integration/context-percent-calibrated.test.mjs` |

## CLI 18. 一条后台报告只投递一次，未签收时才升级

> 目的：一条后台报告在会话里出现一次之后**不再被注入**——空回合不把它再推一遍；未签收累积到上限才升级（终局披露一次 + 一条 UNSETTLED 提醒），此后零自动投递。
> 节注：回指 = `docs/core/requirements/AGENT-LOOP.md` §4.15（F-DA1 / F-DA2 / F-DA3 · N2 / N4）；机制单源 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.31.5（判定两支 ∥ 未签收上限 ∥ 升级支）∥ §6.31.11（A-DA3 / A-DA9）；交互组件 = 会话链路（`createAgent` + `runAgent` 消化轮）⟷ 见账 pass（`accountDigestRound`——含升级终局披露）⟷ 会话流与 status 面；进入口 = CLI 会话里一条后台报告被投递之后的连续消化轮；三态（行序）= 18-1 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 18-1 | CLI 会话里一条后台报告被投递之后的连续消化轮：置 `_daSession`，把一条**未投递**条目放进 `_pendingAsyncResults`（report = 可检索标记串，不预置 `_daDelivered`），逐轮 `runAgent(agent, "", {}, { autoTurn: true })`——前 4 轮桩恒回空响应（该轮抛 `LLM returned empty response`，调用面 catch 后继续），第 5 轮桩回任意正文 | 第 1 轮后报告正文出现 1 次（首投）；第 1–3 轮后会话流零 UNSETTLED 提醒、条仍在容器、注入计数 = 1、`report` 未释放；第 4 轮后 `_unsettledDigests` 恰 1 条（`missRounds = 4`）、UNSETTLED 提醒恰 1 条、正文出现 2 次（首投 + 终局披露）、`unsettledCount === 0`（条已离容器）；第 5 轮后零新注入。**修前红**：第 2、3 轮各再注入一次（正文出现 3 次）、第 3 轮即出 UNSETTLED 提醒 | — | `test/integration/digest-empty-round.test.mjs` |

## CLI 19. 首 token 慢的长上下文请求不再被当断流

> 目的：等首 token 与流中途停摆分开计时——prefill 久不算断流，中途真停摆仍按空闲窗及时报错。
> 节注：回指 = docs/core/design/TIMEOUT-DIGEST.md §2.4（判据 A11 ∥ A13）；交互组件 = provider 读侧看门狗（`thincoder-core/provider/sse.mjs` 两态臂）⟷ 两个取值点 `effectiveFetchTimeoutMs` / `effectiveBodyIdleMs`（传输层看门狗本批不动——另批，见该档 §7）；进入口 = CLI 里对慢 prefill 的 provider 桩发一条长上下文消息；两态（行序）= 19-1 正常 · 19-2 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 19-1 | CLI 配慢 prefill 的 provider 桩（响应头立刻回、首帧延迟 3s），`agent.bodyIdleTimeoutMs` 设 800，发一条消息 | 用户拿到正文答复；会话流零 `SSE … timeout` 报错（首 chunk 窗生效） | — | `test/integration/sse-first-chunk-window.test.mjs` |
| 19-2 | 同一桩吐出首帧后停摆，`agent.bodyIdleTimeoutMs` 设 800 | 报错文案含 `no data for 0.8s`、相位串 `sse-idle`（不是 `sse-first-chunk`、不是 600s 首 chunk 窗）；用时只作旁证，不作断言 | — | `test/integration/sse-first-chunk-window.test.mjs` |

## CLI 23. 配了 OpenCode Go 的会话能发出话

> 目的：配好渠道后发一句话就有回复，不再吃 `400 MissingSessionID`。
> 节注：回指 = `docs/core/requirements/PROVIDER.md` §4.11（R38 头值 = 每会话一个 ∥ R39 模板按渠道声明 ∥ R40 预设自带缺省，用户 2026-11-01 01:04 裁定「每会话一个」）；交互组件 = 配置装载（`providers[].headers` 的 `${sessionId}` 模板）⟷ 请求装配（`withUserAgent`）⟷ 本地假上游 HTTP；进入口 = 用户在 `/config` 配好 `opencode-go` 后发一句话，看的是助手回复那一格；三态（行序）= 23-1 正常。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 23-1 | CLI 会话把 `opencode-go` 的 `baseURL` 指向本地假上游（零外网、零付费端点）：假上游按请求头作答——带头 ⇒ 200 + 一段助手回复，不带头 ⇒ `400 {"type":"MissingSessionID"}`（逐字复刻实测载荷）。先跑一次带头的正常回合；再以修前配置形状（无该头）跑同一句作对照 | 正常跑 = 会话里出现助手回复（不再落 400 错误面）；对照跑 = 该回合失败并带出上游 400 的 `MissingSessionID` 错误面（不静默、不返回空回复） | 出站头的值不在本行断言（同值判据归单元用例，两层不重复）；真端点留给收口 smoke | `test/integration/opencode-session-header.test.mjs` |

## CLI 25. 撞帽了，用户看得见自己转了多久

> 目的：撞帽卡上同时给出本段轮数与链内累计轮数——用户据此判「继续还是停」。
> 节注：回指 = `docs/core/requirements/TURN-CAP-CONTINUE.md`（撞帽提示条目）；判据 = `docs/core/design/TURN-CAP-CONTINUE.md` §6；交互组件 = 核回合环（每轮 `++_turnSeq` ∥ `ContinueError` 抛点）⟷ CLI 撞帽分支（询问行 ∥ 待答状态行）；进入口 = CLI 会话里让一个任务连撞两次轮帽，读第二次的卡面；两态（行序）= 25-1 正常 · 25-2 边界。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 25-1 | CLI 会话把 `agent.maxTurns` 调小，发一个跑得比它长的任务，撞帽后在卡上选 Continue，第二段再撞帽 | 第二张卡的两行都同时含两个数：`Ran 3 turns — 6 turns total. Continue?` 与 `Continue after 3 turns (6 total)?`——本段 3、累计 6，零 `(limit` | — | `test/integration/turn-cap-progress.test.mjs` |
| 25-2 | 同一会话首段即撞帽（未续跑） | 首张卡 = `Ran 3 turns — 3 turns total. Continue?`（累计等于本段，两个数都在） | — | `test/integration/turn-cap-progress.test.mjs` |

## CLI 32. advisor guard 的提醒到顶就停，未评审要说出来

> 目的：推回提醒不会因为中间读了几次文件就回满重来——同一未评审周期里提醒有硬上限，两层（进展窗口 ∥ 周期）任一停推就推恰好一条诚实提醒，然后放行收尾、不静默。
> 节注：回指 = `docs/core/design/ADVISOR-CONVERGENCE.md` §6.4（A ∥ B 两层口径 · 到顶行为）；缺口来源 = 用户来信 2026-10-29「advisor guard 死锁：提醒可无限重复（实测单会话 624 轮）」；交互组件 = 回合环工具批执行处的预算复位（`thincoder-core/agent/turn-loop.mjs` 的写序比）⟷ 完成守卫推回判定（`thincoder-core/agent/completion.mjs`）⟷ 子代理合并推进写序（`thincoder-core/agent-tools/subagent-async.mjs`）⟷ guard 状态携带（`thincoder-core/agent/helpers.mjs` 的 `INHERITED_GUARD_KEYS`）；进入口 = CLI 会话开 `advisor.guard` 后，让助手改代码再一路只读、始终不调 `advisor`；四态（行序）= 32-1 正常（层 1 先耗尽）· 32-2 正常（推满 5 条）· 32-3 边界（子代理合并算进展）· 32-4 边界（诚实提醒位随新进展复位）。

| 编号 | 怎么做 | 怎么算通过 | 异常 | 证据 |
|---|---|---|---|---|
| 32-1 | CLI 会话开 `advisor.guard`，让助手改一处代码；此后每轮只 `read` 文件、始终不调 `advisor`，连续收尾 | 会话最终正常收尾（不抛、不挂）；层 1 耗尽即停推（提醒恰好 3 条，其余批次不改这个数——读 10 次后仍是 3 条，不是 13 条）；其后恰好 1 条诚实提醒，文案里的条数写实（3）且要求「在回答里明说这段代码未经评审」；无新进展时诚实提醒只发一次（再收尾即放行）。**诚实分界**：机制侧（条数 ∥ 文案）机判；助手最终回答是否真写了「未经评审」= 人读，不作机判断言 | 修前红：层 1 先耗尽时两支都不进 ⇒ 直接 `done`、零诚实提醒（静默交付未评审代码） | `test/integration/advisor-guard-reminder-cap.test.mjs` |
| 32-2 | 同 32-1 的开关与起手，但两次写之间只夹一次被推回的收尾、如此反复共 5 次成功写文件（每次写都把进展窗口回满）；写与推回之间不读文件（到顶后读一批即放行）、始终不调 `advisor` | 同一未评审周期内推回提醒恰好 5 条，第 5 条带末条句（`This is reminder 5 of 5 — the last one`）；其后恰好 1 条诚实提醒（条数写实 = 5），不发第 2 条；会话正常收尾 | 修前红：预算被任意工具批清零 ⇒ 同一条提醒可重复到数百轮（用户来信实测 624 轮） | `test/integration/advisor-guard-reminder-cap.test.mjs` |
| 32-3 | 父侧不直接写文件，改动走委托：集成夹具工具 `delegate_merge` 把子代理的改动合进父侧修改追踪（真 `mergeChildMutations`）；父侧不读文件、不调 `advisor` | 合并算进展 ⇒ 推回预算复位：提醒条数越过 3 继续推（不是停在 3 冻死），最终到上限 5 条 + 恰好 1 条诚实提醒；会话正常收尾 | 修前红：合并不是 `FILE_MUTATORS` 工具调用 ⇒ 只认写工具的判据下预算永不复位，全委托会话层 1 冻死 | `test/integration/advisor-guard-reminder-cap.test.mjs` |
| 32-4 | 接 32-1 的形态：层 1 耗尽、计数停在 3 并已发过一条诚实提醒之后，助手再成功写一次代码（写序推进），随后仍只 `read`、不调 `advisor`、连续收尾 | 写序推进复位层 1 与诚实提醒位 ⇒ 推回续推（计数 4、然后 5，第 5 条带末条句），再推一条诚实提醒（条数写实 5）；两条诚实提醒之间无一次静默收尾；会话正常收尾 | 修前红：一次性位不随进展复位 ⇒ 诚实提醒之后又改代码仍静默放行（未评审即交付不吭声） | `test/integration/advisor-guard-reminder-cap.test.mjs` |

★ 32-3：委托入口是集成夹具工具 `delegate_merge`，不是真 `subagent` 调用——`thincoder-core/agent-tools/` 的 spawn 面三处合入点（`thincoder-core/agent-tools/subagent.mjs` 一处 ∥ `thincoder-core/agent-tools/subagent-async.mjs` 两处）均带 `role === "eng-coder"` 门，夹具里起不了真子代理（要设计 token）。

escalate 面合入点无角色门，但同样要真子代理回合，本例未驱动；被评的机制是真的（`mergeChildMutations` 推进父侧写序 ⇒ 层 1 预算复位），真调用点接线不在本例断言内。
