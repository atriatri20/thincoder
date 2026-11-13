# Server 存储 · 设计

> 总览 = `docs/server/design/PROJECT.md`。表的业务语义归各域档，本档拥有迁移工艺。
> 最近先例：core SQLite WAL 与 server 域拆分。对齐 = 单写者、顺序迁移、可重建派生。
> 勘察证据：已读 DatabaseSync、PRAGMA、v1–当前各域增段。相关 = 当前 store。

## 1. 库

单库单 DatabaseSync 连接，WAL、synchronous=NORMAL、busy_timeout、foreign_keys=ON。运行库不入 git。

PRAGMA user_version 驱动顺序迁移；每版追加 DDL，空库直达当前，旧库逐级升级。迁移不可改写历史语义。

## 2. 结构责任

accounts 拥有 members/api_keys/sessions/audit，gateway 拥有 providers，metering 拥有 usage/usage_daily/quota_counters，agent 拥有管理会话，project/ledger/mcp/sandbox 各自拥有域表。

模型内部真名以 provider/model 两字段保存；派生表只作读面/计数，usage 为可重算真源。秘密列与散列列按 accounts/sandbox 约束，普通查询不回显秘密。

审计 CHECK 扩型通过表重建迁移，保留历史行；退役表或列按当前迁移执行，不把旧结构写成现役契约。

## 3. 验证

验证空库、逐级旧库、幂等、外键、CHECK、回填与回滚；业务字段由对应域测试逐值验证。
