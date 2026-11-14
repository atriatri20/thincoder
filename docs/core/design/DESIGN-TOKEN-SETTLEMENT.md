# 设计评审凭证结算（DESIGN-TOKEN-SETTLEMENT）· 设计

> 需求 = `docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md`。
> 最近先例：`SESSION.md` 的槽安全写与 `LEDGER.md` 的失败可见。对齐 = 权威持久面、同步结算；分工 = 本档只管凭证。
> 勘察证据：已读当前 subagent 槽清点/消费契约、评审守卫与批次收口。相关 = 多槽、选择器、批次与封印。

## 1. 定位

槽文件是权威持久面，内存 Map 是当前进程缓存。settle、恢复、门禁和消费必须形成闭环，不能只更新其中一侧。

## 2. settle 当场落盘

settleAdvisorRun 在结算点调用 persistEngTokens，使用 engTokenSlotFields 序列化，并经会话槽安全写与轮转守卫落盘。

写失败时恢复 settle 前内存，返回未完成结算；不签发可用 Approved 结果，不保留半结算态。

## 3. 门禁回读

resolveDesignSlot 先读内存；miss 时通过 reconcileEngTokensFromSlot 回读权威槽，再做 TTL、严格相等、批归属与封印判断。

普通模式不经过工程凭证门。

## 4. 单值镜像与保存

_engDesignToken 单值镜像不再是运行态来源。旧字段只在兼容迁移点读取，随后由多槽表取代。

写门使用 anyLiveDesignSlot。保存合并保留槽独有项，同 key 按当前新写者规则；consume 的删除不能再被旧保存合并复活。

## 5. consume 对称落盘

executeConsumeDesignAction 移出目标槽后当场 persist。失败时恢复快照并抛错，可重试。

单槽、显式多槽、过期和olderThanDays共用同一持久化与回滚核。未知或已消费 id 幂等提示。

## 6. 清点面

design-slots 使用槽与内存并集，只读，不回写。

每行包含 designId、live/expired、ageDays、expiresAt、batch、designToken。批名优先取槽旁列，旧槽可从当前实例注册表派生；不可得时为 —。

令牌值位于行尾。日志脱敏由日志面负责，不能用文档记录代替运行态取用。

## 7. 批归属

### 7.1 来源

batchAbsPathOfRun 优先使用 run.batchDoc，再从 docSetKey 的唯一批档兜底。两源都不可得时不猜。

批次档不并入 documents 计算 docSetKey，因为该键还承担实例复用、同 scope 判定和冻结范围。

### 7.2 存储

engDesignTokenBatches 保存 designId 到批档绝对路径。它与 token、seal 同步序列化、恢复、合并与持久化。

spawn 比较解析并归一后的 batchDoc 与槽归属。槽有值而不符时拒绝；严格读失败不得落入“无值不拦”。

### 7.3 收口自动消费

close 与 status §1→已收口调用 consumeBatchDesignTokens，在写状态前消费该批全部槽。

无匹配为 no-op。普通模式无槽时也 no-op。严格读或消费失败则 close 拒绝，批次字节不变。

无归属旧槽不猜、不误消费，回执可见。

## 8. 评审封印

### 8.1 集合与字节

被算集合 = run.docAbs 中排除 docRoot.batches 的文档。按清单顺序读原始字节，档间一个 `\n`，路径不进入总 hash。

engDesignTokenSeals[designId] 保存 `{hash, docs, docHashes}`。派单只读槽内 docs 复算，不另推清单。

### 8.2 判定顺序

凭证存在与相等、TTL、批归属、封印依次判断。批不符时不必读文档算封印。

封印不一致时拒；有 docHashes 则按 docs 原序点名变化文档。被审档缺失或不可读时拒。

settle 面无法计算封印时拒签：不写槽、不落轮次块、不动 §3 状态行；spawn 面无结算可回，读取失败按当前错误通道外显。

## 9. 实现归属

| 面 | 模块/符号 |
|---|---|
| 结算 | advisor-settle.mjs / settleAdvisorRun |
| 签发与裁定 | design-token.mjs / settleDesignReview |
| 槽 I/O 与 TTL | token-ttl.mjs |
| spawn 门 | subagent-spawn.mjs / resolveDesignSlot |
| 批与封印校验 | subagent-design-token.mjs / gateDesignToken |
| 清点与消费 | design-slots.mjs |
| 批次自动消费 | batch-lifecycle.mjs / consumeBatchDesignTokens |
| 会话合并 | session-slot-write.mjs |

## 10. 多端

core 提供结算与门禁语义。宿主负责在每 run 重建或常驻对象场景中水合当前槽，不以宿主差异改变授权结果。

## 11. 验证

验证 settle 后立即重启、缓存 miss、consume 不复活、失败回滚、空态保存、多槽隔离、选择器、批归属、封印变化、严格读和普通模式 no-op。

## 12. 边界

不改 token 格式来塞入批信息，不用 basename 作为批次身份，不把无归属槽猜给某批，不在状态文档保存当前槽读数。
