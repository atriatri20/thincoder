# 对话流渲染统一方案（fork 2026-10-06 定稿）

> 背景：用户反馈「打开会话只载部分 ∕ 滚动卡住 ∕ 两套系统打架」。经 ZCode 源码深查
> （`packages/ui/src/v4/ConversationTimeline.tsx` ∕ `conversationLayout.ts` ∕ `timelineScrollAnchor.ts` ∕
> `conversationTimelineLiveTail.ts` ∕ `timelineRowHeightCache.ts`）与本端实测（1173 块全挂载滚动零长任务），
> 定稿本方案——**一个加载器 ∕ 全量挂载 ∕ 原生虚拟化 ∕ 两态滚动**，替换修补叠加的旧三件套。

## 0. ZCode 方案全貌（对标源）

| 机制 | ZCode 实现 | 本端对应 |
|---|---|---|
| 消息管理 | tanstack-virtual **全量虚拟化**：所有回合在虚拟列表注册，只渲染视口 ±8（`ROW_OVERSCAN=8`） | 全量挂载 + **原生虚拟化**（`content-visibility: auto`——浏览器跳过屏外布局∕绘制，`contain-intrinsic-size: auto` 记忆上次实高） |
| 测高 | 动态 `measureElement`（ResizeObserver）+ 稳定 key 高度缓存（卸载行重挂用上次实高，缺省估 72px） | 浏览器 last-remembered size（同语义，零代码） |
| 历史加载 | `loadOlder` 滚动中途自动预取：`scrollTop ≤ max(64px, 2×视口高)` 触发；前插锚 = 虚拟项稳定 key | 开会话**后台预载链**直取全史（更激进——预载后滚动零等待；超大会话触顶兜底） |
| 前插锚定 | prepend 前存虚拟项锚（稳定 turn key + offset），commit 后回填修正 | `compensateTop`（保留——预载期非跟滚补偿仍需） |
| 滚动源 | 三分类（user ∕ programmatic ∕ layout guard）门控一切调整 | `smoothWindow` ∕ following 两态（够用，保留） |
| 流式尾 | **唯一 running unit 拆出虚拟列表**独立渲染（流式不回虚拟器） | 尾段追加本就在窗外（等价） |
| 尺寸变化调整 | `shouldAdjustScrollPositionOnItemSizeChange`（following ∕ 宽变 ∕ restore 三闸） | `tailAction`（stick ∕ compensate ∕ none 三态——同构） |
| 正文列宽 | `calc(100% − 6rem)` ∕ cap 6xl | 同值已对齐（72rem cap ∕ 3rem 恒保边距） |

## 1. 旧三件套（退役对象）

- **渲染窗**：`MAX_RENDER_BLOCKS=150` 初始窗 + `visibleWindow` 切片 + 「更早的 N 条」摘要钮——预载链接管后钮与窗退场。
- **滚动触发回填**：`scrollAction` backfill 出口 ∕ `BACKFILL_PX` ∕ `chat.mjs` 落地续链 rAF——预载链唯一化后退役（超大会话触顶兜底保留于 store 判据层，视图层零触发）。
- **多触发源**：滚动触发 ∕ 按钮触发 ∕ 预载链三源并存 → **唯一加载器 = 预载链**（open 会话即链式取全史，`hasOlder=false` 自然终止）。

## 2. 新模型（单一系统）

```
打开会话
  → 首屏 history:page(200 行) 即刻 paints（用户立刻看到最新消息）
  → 预载链后台续页（60ms 节奏 ∕ hasOlder 尽即停）——全史挂载
  → 挂载后：滚动 = 浏览器原生（content-visibility 屏外零成本）∕ 小地图全展示 ∕ 无按钮
滚动模型（两态）
  following=true  ⇒ 贴底 pin（流式追加零扰动）
  following=false ⇒ 用户自由滚（原生锚定 ∕ 预载期头动补偿兜底）
  回到最新        ⇒ 药丸 ∕ Ctrl（回底 pin）
```

## 3. 实施清单（本批）

1. `session-wire.mjs`：预载链预算无限化（删 12 页帽）——加载器唯一。
2. `chat-scroll.mjs`：`scrollAction` 退役 backfill 出口（三出口 → 两出口）。
3. `chat.mjs` ∕ `chat-chrome.mjs` ∕ `app.mjs`：摘要钮 ∕ onBackfill 接线退役。
4. `beauty.css`：`.block` 原生虚拟化（`content-visibility: auto` + `contain-intrinsic-size: auto 320px`）。
5. `user-collapse.mjs`：折叠判定改 IntersectionObserver（进视口才评——避免 content-visibility
   未渲染块的估计高度误判短文折叠）。

## 4. 边界与保险

- 超大会话（>6000 行）：预载链照跑（后台节奏 150ms ∕ 页）；极端上限由 `history:page` 游标自然封顶。
- `content-visibility` 屏外块 `scrollHeight` = 估计值：跟滚判据（nearBottom）在贴底态走 pin 不受影响；
  非跟滚期自由滚的锚定 = 浏览器原生（已渲染块实高稳定）。
- 挂载成本：全史一次性 mount 的构建开销 = 开会话后台链上逐页分摊（每页 ~400 块）——实测无长任务。
