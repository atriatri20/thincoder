# VSC 配置面板 · 设计

> 配置语义 = `docs/core/design/CONFIG.md`；provider = `docs/core/design/PROVIDER.md`。
> 最近先例：`CONFIG.md` 的原子写与 `WEBVIEW-PROTOCOL.md` 的快照。对齐 = config 单源、差异提交。
> 勘察证据：已读六类设置、打开快照、回填、MCP、删除与 watch。相关 = 当前 VSC 设置面。

## 1. 信息架构

Providers、Agent、Consult & Advisor、Tools & Services、Environment、团队按当前卡片组织。模型选择归会话输入面，不另建设置默认模型控件。

各控件使用当前 picker/表单；会话模式使用 minimal/normal/engineering 固定选项；MCP env/headers 用行式键值，空键值不提交、重复后胜、全空删字段。

## 2. 打开与回填

openSettings 发 getAgentSettings，host 按当前顺序推 index/provider/proxy/websearch/shell/agent 等快照，agentSettings 是 build 触发拍。

updateProxySettings/updateShellCandidates/updateWebsearchSettings/updateIndexStatus 等回填活控件；聚焦输入不被覆盖，不重建整卡。

## 3. 写值

change-to-save 只发实际编辑字段，屏值相对该控件基线有变化才发送。快照未到、blur/Enter 未改和其他字段默认值不得写盘。

显式空 uri 删除 proxy；System default 删除 shell；自定义 shell 空值不发送。advisor 等部分载荷从磁盘合并，缺席与显式 null 区分。

保存失败经 providerError 到对应设置段；成功回执只恢复相应控件。

## 4. 删除与外部变化

provider/MCP/密钥/令牌/模型菜单删除统一 _confirmSecretDelete，取消零发值。直通删除不得用于这些不可复得入口。

startConfigWatch 用 stat 元组和自写基线抑制回声，外部写经 _pushSettingsLight 可见；dispose 释放监听和定时器。

## 5. 验证

验证快照齐、聚焦不覆盖、未编辑零写、显式删除、部分载荷、MCP 行值、外部写/自写和失败可见。
