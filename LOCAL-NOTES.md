# 本地开发备忘（codex-ui 分支）

本分支 = ThinCoder 桌面端 Codex 风格 UI 改造（工作区布局 ∕ 对话折叠 ∕ 会话管理等，详见 commit 信息）。
以下为本地环境要点——`npm install` 或换机器后需要重做：

## core 源码联接（关键）

桌面端 `node_modules/@thincoder/core` 默认是 **npm 发布版拷贝**——改 `thincoder-core/` 源码不会生效。
必须建目录联接（上游 CI 用 npm link 同理）：

```bat
cd thincoder-desktop
rmdir /s /q node_modules\@thincoder\core
mklink /J node_modules\@thincoder\core ..\thincoder-core
```

验证：`grep -c assistantRealFrame node_modules/@thincoder/core/context-push.mjs` 应 ≥ 1。
（renderer/ 下的改动不受影响——直接从仓库伺服。）

**CLI ∕ VSC 同理（2026-10-10 补）**：`thincoder-cli` ∕ `thincoder-vscode` 的 `@thincoder/*` 链同样必须指向本地源码
（`npm install` 会按 registry 版覆盖）。一次建齐五链：

```bat
node scripts/dev-link.mjs
```

（`--check` 只读判漂移；`--force` 可把 desktop 的**物化副本**换回联接——打包前仍应 `materialize-deps`。）
CLI ∕ VSC 端源码现已直接消费核新导出（如 `effortDefaultFor`）⇒ **链缺位 = 端侧启动即报「无该导出」**，非静默降级。

## Electron 二进制（中国网络）

```bat
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
node node_modules/electron/install.js
```

## 独立打包（fork 更新源已裁 · 2026-10-05）

上游源 `https://thincoder.com/downloads/` 活发版（latest.yml 现 0.10.3 > fork 版本 ⇒ 装即被静默覆盖）。
已三层独立化：① `electron-builder.yml` win 目标 `publish: null` ⇒ 零 `app-update.yml` 随装；
② `main.mjs` 武装门加 feed 在位校验（无 feed ⇒ 更新面不武装，手动检查静默忽略——与 dev 同语义）；
③ 版本号携 fork 标记（`0.10.3-x.1（fork 构建号不带 codex 字样——用户 2026-10-05 起改 `0.10.3-x.N`）`）。`check-dist.mjs` 改双契约感知（feed 在场 = 上游断言；
不在场 = 反向断言产物零 app-update.yml）。**升级 = 手动装新包**；若日后恢复自动更新，把 win `publish: null`
摘掉并指自有源即可。注意 AppImage（linux）仍带上游 publish——fork 若发 Linux 需同样处理。

## 打包

```bat
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
npm run package
```

## GitHub Releases（fork 构建发布）

```bat
gh release create v0.10.3-x.N dist/ThinCoder-Setup-0.10.3-x.N.exe -R atriatri20/thincoder --target codex-ui --title ... --notes ...
```

- **必须显式 `-R atriatri20/thincoder`**——本仓双 remote，gh 默认解析到 upstream（xinbo-tech）⇒ 404。
- 仓库私有 ⇒ Release 及资产私有（个人下载库 ∕ 版本史）；首例 = v0.10.3-x.5。

## 冒烟

```
npm run quickcheck   （用系统 Edge；9 段全绿 = 可交付）
```

## 已知待办

- 会话归档：后端无 `session:archive` 通道，需 core 层（manifest 归档标志 + listSlots 过滤 + 新通道）——未做。
- 上游同步：本分支与 `main`（xinbo-tech 镜像）会漂移，pull 后重点核对 `renderer/index.html` 链序、
  `views/settings.mjs`、`mount-sessions.mjs wireFace` 透传、core 四文件（reasoning 持久化）。

## 远端（2026-10-05 起）

- `origin` = `atriatri20/thincoder`（**私有仓库**——工作备份，codex-ui 为主分支）
- `upstream` = `xinbo-tech/thincoder`（官方 GitHub 镜像，同步上游用：`git fetch upstream && git rebase upstream/main`）
- gh CLI 走代理需显式：`HTTPS_PROXY=http://127.0.0.1:7897`（git 自身已配代理，不受影响）
