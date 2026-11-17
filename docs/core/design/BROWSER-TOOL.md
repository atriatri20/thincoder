# 浏览器工具（BROWSER-TOOL）· 设计

> 需求 = `docs/core/requirements/BROWSER-TOOL.md`。
> 最近先例：`TOOLS.md` 的动作权限与 `AGENT-LOOP-ASYNC-POOL.md` 的后台任务。对齐 = 真实浏览器、串行会话、失败可见。
> 勘察证据：已读 CDP 模块、十八动作、共享池与状态校验。相关 = 当前 browser 工具表。

## 1. 模块

browser/cdp.mjs 传输；launch.mjs 发现与启动；pool.mjs 共享；session.mjs 串行会话；snapshot.mjs 引用；actions/input-actions/clipboard/session-state 实现动作；queue.mjs 预算；tools/browser.mjs 校验与回执。

使用 Node 原生 WebSocket 和系统 Edge/Chrome，独立 profile。

## 2. 动作与引用

navigate 后返回新页快照。snapshot 生成稳定 selector/key 与 e<N>，微变复用；使用时重新找 DOM，stale/disabled 显式失败。

click 等 DOM 级激活与 press/mouse/touch 等真实输入按当前权限分类。password 值不回显。

wait 支持 selector/text/url/networkIdle；所有动作有当前预算与卡点步名。

## 3. 会话与池

session.runAction 串行执行。首用 attachOrLaunch；启动窗和动作预算分离，queue 的 pause/resume 防止冷启吃掉动作预算。

共享 pool 记录持有者与使用者。headless 由首个有效实例决定；close 幂等，最后释放按真实结果报告。

进程/连接死亡清理当前标签与登记，后续动作可重开，profile 保留。

## 4. 状态与剪贴板

cookies 经 CDP 支持 httpOnly 与显式域；set 后回读值和 path，未落地报错。域匹配区分域名与 IP，端口非法。

storage 仅在当前 http(s) origin 操作，local/session 分离，值必须字符串。读取清单畸形时报错。

clipboard 使用当前 Browser 域/页面权限面；有头与无头按实际能力报告，不写日志。

## 5. 异步

browser async 经 browser-async 入当前后台任务面，实际动作仍进同一串行队列。完成、失败、取消经统一 digest，process 可定向终止。

## 6. 验证

用假 CDP 测校验/引用/预算/池，用本地页面做真浏览器冒烟。验证失败侧包括无浏览器、stale、启动超时、外部关闭、Cookie 未落地和畸形清单。
