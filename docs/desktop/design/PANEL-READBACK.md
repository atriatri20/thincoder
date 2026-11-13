# Desktop 子代理面板回读 · 设计

> 活动机制 = `ACTIVITY.md`；核 panel 工具 = `docs/core/design/AGENT-LOOP-SUBAGENT.md`。
> 最近先例：CLI panel view/freeze 与 core suspension 的 reclaim。对齐 = 渲染实况、done 必达、归档幂等。
> 勘察证据：已读 panel:state、readout、freeze 和自愈扫。相关 = 当前桌面回读链。

## 1. 上报与缓存

渲染帧完成后 panel-readout 上报 `{key,blocks}`，每块含 key/status/frozen/awaitingDigest/region/dom 与 role/id；rows 不上报。

panel-live 按 key 保存最新 readout 和 receivedAt，agent._panelReadout 提供给核 panel view/freeze。view 返回 renderer 来源、asOf/ageMs，并交叉核池标 digested。

无快照时按当前 state/池降级链，不能把未上报说成空面板。

## 2. freeze 与归还

freeze 接受当前 sub: 前缀两写法，先校验 awaitingDigest、非 flow、核池/pending/consult 状态，再经 relay 发规范化 done。

重复 done 由 drop-frozen 幂等，归档与 record 不重复。

suspension 的每条 pending 离容必须经 reclaim 或 freezeAll 至少补发一次 done；Abort、异常和残差也覆盖，原错误继续抛出。

## 3. 自愈

sweepDigestedStuck 在起跑/onCounts/reclaim 等现有拍检查 awaitingDigest+frozen 且核侧已无驻留的块并补发 done。

宿主记录 reemit-done/sweep 痕，渲染记录 subagent-trace，便于区分丢失发射与归档幂等。

## 4. 验证

验证快照签名、缓存覆盖、view 降级、freeze 负例、异常/Abort 归还、重复 done 幂等和自愈。
