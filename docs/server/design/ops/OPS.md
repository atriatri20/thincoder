# Server 运维与配置 · 设计

> 总览 = `docs/server/design/PROJECT.md`；TLS = `../gateway/PUBLICNET.md`。
> 最近先例：core 原子配置与仓级发布纪律。对齐 = 单配置源、显式失败、每配置有 UI。
> 勘察证据：已读配置、首启、CLI、启动停机、部署与更新。相关 = 当前 ops。

## 1. 配置

config.json 持 host/port/db、autoUpdate、trustProxy、保留窗、TLS、限流、代理、告警、bootstrap、provider 种子与 embedding。

启动统一 resolve/validate，非法拒启；provider 常态存库，文件仅首启种子。控制台白名单合并原档、保未知键、预检并原子写，秘密掩码，重启生效项明确标注。

## 2. 首启与 CLI

零 admin 时 bootstrap 幂等建首个管理员，已有 admin 不改密。无配置可起服务并提示本机 CLI 补建。

本机 CLI 提供成员、密码、key 与 usage reconcile，复用域逻辑并审计，不形成第二套业务规则。

## 3. 生命周期

入口完成配置、迁移、运行时、路由、同步、终端、MCP、清理、更新和盒 ticker 装配，ready 含真实版本。

SIGINT/SIGTERM 停新连、清周期、收终端/MCP、关库。日志为单行 JSON，秘密不入日志。

## 4. 部署与更新

npm 包是版本身份，Docker 为壳；systemd 或容器 restart 守护。备份与恢复脚本使用一致库快照。

更新按 off/notify/auto 当前档位检查、下载、收敛或提示，失败保留旧版， registry/核包不可达明确报错。

## 5. 验证

验证配置负例、首启幂等、CLI、启停清理、路由/周期装配、npm 全局入口、备份恢复和更新失败。
