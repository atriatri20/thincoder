# 会话与历史（SESSION）· 设计

> 需求 = `docs/core/requirements/SESSION.md`。
> 最近先例：`CONTEXT-COMPACTION.md` 的双线与 `MULTI-INSTANCE-COLLAB.md` 的三态属主。对齐 = 主存有界读、派生面零权威。
> 勘察证据：已读槽存储、认领、记录 sidecar、索引、盘面清单和账本自愈。相关 = 当前槽与记录契约。

## 1. 文件模型

sessions 根使用 cwd 的完整 sha1：

```text
{hash}.json.N                 槽主文件
{hash}.json.manifest          active、认领、摘要缓存
{hash}.json.manifest.{end}    本端 marker
{槽文件}.d/                   append-only 人读记录
```

端名经 setSessionEnd/sessionEnd 注入，marker API 接受显式 end。createdBy 只在首次物化写入，老槽不回填。

## 2. 槽 JSON 与恢复

version 2 含 history、contextHistory 与轮记录 turns。saveSession 写当前粘性槽并原子替换；saveLines 等端侧写者保留未知字段。

机读线在槽里按三段存，保存按同一投影产出，不写回完整工具过程：

| 键 | 内容 |
|---|---|
| `compactCheckpoint` = `{ note, turnsCovered }` | `note` = 压缩摘要注记原文；`turnsCovered` = 已覆盖的轮记录条数，`turns` 从它的下一项起投影。无压缩 ⇒ 键缺（不写 `null`、不写空对象） |
| `turns` | 全部轮记录，含被摘要覆盖的那些（人读回查仍靠它） |
| `activeRaw` | 在途 ∥ 异常段原文——没有轮记录可依的那一段，含未登记就结束的轮。`transient` 标记的消息落槽前丢弃（与 `contextHistory` 的过滤口径同一条） |

`contextHistory` 仍是派生副本（三段按同一投影拼成，再丢弃 `transient` 标记的消息），留给旧读者与旧槽回退，恢复不再以它为权威。工具段随投影一起进副本，不另存一份。任务状态串已在 `turns` 里，发送层发送前也剥离 transient。投影出哪几条消息归 `CONTEXT-COMPACTION.md` §1.1。

在途段单列一键，不由 `contextHistory` 与投影长度的算术差推断：那份副本经过 transient 过滤，长度不等于投影长度；而按投影重建时整段消失，等于中途崩掉的轮在重启后凭据全无。

`turns` 每项形如 `{ userRequest, finalResponse, taskState }`，最近 2 轮另带 `toolProcess`（该轮的工具段；保留窗口、预算与标记归 `CONTEXT-COMPACTION.md` §1.1 ∥ §1.2）。`toolProcess` 缺键 = 该轮工具过程不在机读线上，与「已折叠」同义。机读线（`turns` 与 `contextHistory`）不经过 `slimForDisplay`，`toolProcess` 逐字落盘，只受 `CONTEXT-COMPACTION.md` §1.2 两条预算约束；截断面的射程见 §5。

读回槽时 `turns` 逐项归一，白名单保留 `toolProcess`——存下去的形状读不回来，等于没存。新增字段对旧 v2 槽是可选面：`turns` 非空才作权威源，空数组与缺键同视为没有——这类槽按以下回退恢复，不报错也不丢历史。

applySession 的恢复权威顺序单点定义如下：

1. `turns` 非空 ⇒ 机读线 = 摘要注记（`compactCheckpoint` 在场时）+ 其后轮记录的投影 + `activeRaw`。装线前先做一次配对收口（尾部没有工具结果的调用、前面没有调用的结果都不装），规则与两支来由的单点在 `CONTEXT-COMPACTION.md` §6。
2. 无 `turns` ⇒ 用 `contextHistory`。
3. 两者皆缺 ⇒ 由 `history` 播种。

恢复也把压缩状态播种回 agent：只装回机读线而不播种，同一会话的第二次压缩只见到重启之后的轮，`turnsCovered` 被写小，被摘要的轮又整条投影回来。

- `agent._compactCheckpoint` = 槽里的 `compactCheckpoint`；键缺 ⇒ 不设，与「本会话还没压过」同义。
- 折叠身份标记按恢复出的轮记录重建：机读线上每条轮记录的那几条消息对象登记为已折叠（载体见 `CONTEXT-COMPACTION.md` §6），下一回合的折叠与压缩按身份判覆盖时，看到的仍是整本账。

播种的键缺失等同没有：不报错，也不回写槽。

`compactCheckpoint` 覆盖到第 N 条轮记录，机读线就从第 N+1 条起投影；被覆盖的那些仍在 `turns` 里供人读回查。摘要在何处切、覆盖条数怎么定，归 `CONTEXT-COMPACTION.md` §6。旧 v1 的截断 tool 参数按当前安全规则处理。

sessionStart、activeProvider、activeModel、effort、createdBy 等随当前字段契约保存。无有效 provider 时走 PROVIDER 的统一选择/提示。

## 3. 认领与并发

sessionId 标识进程。ensureActive 先清死主，再选择可用 active、缺失文件的空号或新号。

process-probe 提供批量探测与 ownerState 三态；unknown 保守保留，不当作死主。

saveManifest 只在 ENOENT 首建或可信对象基座上读-合并-写。deletions/setActive/release 显式传递，损坏基座拒写并保全。

guardForeignSlotFile 在异会话或更新版本前轮转备份。写盘使用原子临时文件，manifest 写后结构读回。

## 4. 生命周期

newSession、switchToSlot、claimSlot、ACP close 与项目切换计算本进程其余活绑定，释放不再绑定的认领。

switchToSlot 直接读目标槽；被活外人占用时按宿主当前拒绝或 fork 语义，不能双写。

优雅退出 releaseClaimsAll，保留本端 marker。崩溃路径仍靠三态探测。

## 5. 记录 sidecar

pushReal 在写双线时向绑定 recordStore 追加 slim 后人读条目。pushRecord 写 digest/subagent 记录但不进机读线。

盘上这条人读线是 slim 后的形态：`tool` 内容截到 500 字符、`tool_calls.arguments` 截到 300 字符。截断面的射程 = 人读线：槽 JSON 的 `history` 键与记录 sidecar 都按 slim 存；机读线（槽里的 `turns` 与 `contextHistory`）逐字落盘，不在截断面上（预算见 `CONTEXT-COMPACTION.md` §1.2）。

`history` 一词在这里有两个所指，读的时候先认它是哪一个：内存里的 `agent.history` 是机读线那一条（逐字），槽 JSON 的 `history` 键是人读线那一条（slim）。同一条工具结果在两个位置上长度不同，那不是矛盾，是两条线。

取回面 `read_history` 的截断标记必须与这一事实一致：它截断的正是盘上已经没有的那部分，标记只报截了多少，不把读者指向一个取不到全文的位置——一句假承诺让模型以为自己能取回原文，它就不再重跑那个工具、也不再问。

sidecar 使用定长 JSONL 段，只有末段追加。meta 含 segSize、identity 和 degraded。

绑定时：

1. identity 不符则隔离陈旧 sidecar 并重建。
2. degraded 或 JSON 更长时以 JSON 重建。
3. sidecar 不短于 JSON 时以 sidecar 为准。
4. 人读内存恢复为当前尾窗。

append 失败即停写并标 degraded；只能追赶仍在窗口内的连续缺口，不能写洞。

槽投影可流式拼接段文件；删除和 GC 联动清理。

## 6. 列表与摘要

listSlots 枚举实际槽文件。元数据依次使用新鲜摘要、小档全读、大档早键截读和 stat 兜底；读字节有总预算。

摘要 ts 与槽 mtime 比较；updatedAt 是会话逻辑时，不能替代 ts。计数不可得为 null。

摘要自愈有打开/切换顺手补写、列表后的有界懒核实和正常保存三条路。懒核实异步、分块、单飞、失败负缓存，不拖启动。

manifest 摘要不决定清单、打开或保存。

## 7. 会话派生索引

session-index.db 是零权威派生库，包含 sessions/messages/tool_calls/FTS/meta。

- sidecar 按段号、字节、mtime、tail hash 增量。
- JSON 源按当前整档水位重建。
- identity 变化、源切换、段缩水触发重建。
- 源消失清行，索引不复活数据。
- 写面单事务，FTS 与消息同删。
- 坏库保留现场后重建。

查询路径：本会话记录存储 → 指定槽索引/JSON 回落 → all 的已索引 FTS。索引不可写时回落主存，不改变业务记录。

## 8. 标题与偏好

isRealUserMsg 统一标题源。generateTitle 统一请求，ensureSessionTitle 在回合尾保存前调用，失败下回合可重试。

setSlotPrefs 写 provider/model/effort；resolveEffortPatch 按模型枚举归一。applySession 在模型恢复后施加 effort。保存必须携带 effort，避免整对象抹除。

mode 是会话级 tiny/normal/engineering 权威值。新会话从 agent.mode 配置取默认；模式命令或宿主控件更新当前 agent 与槽。恢复时优先读槽内合法 mode（旧字面 minimal 归一为 tiny，见 CONFIG §5.4），旧槽才回退到 engineering 布尔迁移。恢复后同步派生 config.agent.engineering，下一轮 prepareRun 使用同一 mode。

槽写回面在写回前同样归一：`thincoder-vscode/src/extension/panel-session-write.mjs` 以核 `normalizeWorkMode` 处理读到的旧 mode，旧槽不会把 `minimal` 原样写回。

## 9. 可观测记录

logEvent 记录当前 slot 写时点，不读路径刷屏。droppedDesignTokens 只度量离开当前生效集的未过期凭证。

digest/subagent 记录经 pushRecord 追加，historyWindow 在 records:true 时读取；宿主按当前呈现契约重建。

## 10. 验证

覆盖槽迁移、双线、并发占用、未知属主、认领释放、sidecar 身份/缺口/崩溃、列表预算、摘要拒写与自愈、索引增量/回退、偏好恢复、压缩检查点与在途段的落盘回读、检查点与折叠身份标记的恢复播种、在途段尾端配对，以及旧槽无新键的回退。
