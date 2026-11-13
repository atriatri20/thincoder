# 多实例协作（MULTI-INSTANCE-COLLAB）· 设计

> 需求 = `docs/core/requirements/MULTI-INSTANCE-COLLAB.md`。
> 最近先例：`SESSION.md` 的端标记/判活与 `AGENT-LOOP-ASYNC-POOL.md` 的交付轮。对齐 = 复用会话身份、业务失败可见。
> 勘察证据：已读 peer 感知、claims、instance inbox 和配置原子写。相关 = 当前三工具面。

## 1. 感知

peerInstances(cwd) 读取 manifest slotSessions，按 sessionId 分组，批量判活和命令行身份复核。

缓存按 manifest mtime 或当前 TTL 命中；缓存有界。探测失败不当全死。process-probe 统一 ownerState、isProductProc、classifyEnd、filterDeadOwners 和同步/异步探测束。

pushPeerReminder 在 depth-0 装配中异步读取，有同伴才注入。peer_instances 返回去 self 的白名单字段。

## 2. 写足迹与 claims

peers/{sessionId}.json 是每实例单写者文件：

- domains/updatedAt：成功写足迹。
- claims/claimsUpdatedAt：意图租约。

peerWriteTargets 从结构化写参数提取实际写路径；copy 只算 dest，move/rename 算 source+dest。

写成功后 recordPeerWrites；新 claim 目标立即写，续约按 CLAIM_RENEW_FLUSH_MS 节流，过期按 CLAIM_TTL_MS 失效。属主死亡后按当前惰性清理。

写前 peerCollabNote 聚合有效 claims 与热足迹，返回软提示但不阻断。认领命中抑制同目标足迹提示，并按目标×属主×run 去重。

fields 级 read-modify-write 保留另一面与未知字段；writeSessionFile 原子写。

## 3. 配置写

writeConfigAtomic(path, mutate)：

1. 在新鲜读前取 stat。
2. 读最新 raw 并执行单项 mutate。
3. 写前重 stat，变化则备份并返回 mtime-conflict。
4. 合法时原子写。

畸形配置拒写。配置包含凭据，权限处理按当前安全规则。

## 4. 名册

instances/{sessionId}.json 记录 sessionId/pid/end/cwd/startedAt/updatedAt。只有取件闩装配成功的会话登记。

instance_list 只列在册且 pid 明确可确认存活者；headless/ACP/直接 runAgent 无取件面，不列。

正常退出/面板销毁撤闩并删名册，残留按当前龄期与明确死亡条件清理。

## 5. 发送

instance_send 校验 sessionId、text 与可选 re，检查名册、pid 和 inbox 写能力。

成功原子写 inbox/{sessionId}/{msgId}.json，返回 requestId=msgId 与 delivered-to-inbox。unknown 不当可达，失败不排队。

消息含 from、sentAt、text 与可选 re。来源标记是自述，不是认证；本机用户目录权限是当前边界。

## 6. 取件闩

createInboxWatch({ready,isBusy,onTake,onBlocked,timer,clear}) 使用自续有界拍：

- 每拍先重臂，再检查 ready/isBusy。
- inFlight 防重入。
- ready 由宿主提供且必填；不就绪不取件。
- onTake 只有新轮已登记在飞才 resolve；开轮失败 reject。
- 忙碌时不读 inbox；空闲时按当前间隔取件。
- 回合尾/模态关闭的 sync 只幂等补位，不承担闩存活。

## 7. 消息落法

crossMessageContent/Text 把消息组成带来源与 re 的普通用户输入。端壳以 autoTurn:false、resume:false 起新轮，由 prepareRun 落一条 user 消息。

不先 pushReal 再开空轮，不走一步一取的 queued input，不插入当前轮。

取走即删。onTake reject 时记录 inbox-watch-take-lost 并显示消息 id，不重投。长期 busy/carrier 跨阈时显示 blocked 行并记日志。

## 8. 验证

验证缓存与三态、写路径分类、claims 字段不互覆、配置冲突、发送四态、闩在异常后续拍、短轮/审批悬挂、不就绪恢复、开轮失败和来源标记。
