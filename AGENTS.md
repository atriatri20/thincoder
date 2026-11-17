# AGENTS.md — ThinCoder

> 工作区层（兄弟项目、参考系去向）= `../AGENTS.md`。本档只放**这个仓库自己的**规则。

## 这是什么

AI coding CLI。唯一第三方运行时依赖 = `electron-updater`（桌面自动更新面）。

## Tech Stack

- **Language**: JavaScript (ESM `.mjs`), zero TypeScript
- **Runtime**: Node.js >= 24, native standard library
- **Build**: no build step, no bundler — run directly
- **Package manager**: npm

## Commands

```bash
# CLI
cd thincoder-cli && npm test                # full suite (node test/run.mjs)
cd thincoder-cli && node bin/thincoder.cjs  # start CLI

# VS Code extension
cd thincoder-vscode && npm test
```

## Coding Conventions

- **ESM only**: `.mjs` extension, `import`/`export` syntax
- **Imports**: `node:` prefix for standard library; the in-repo `@thincoder/core` is the one declared dependency. Sole exception: `electron-updater` (desktop auto-update face).
- **Commit messages**: `type: summary` (feat/fix/release/docs), single English line

## Where the rules live

本档只放这个仓库的**事实**（语言、依赖、命令、提交格式）。规则正文的单源在下面这些档，改规则去改那里，不要在这里复述：

- 文档地图（写/改文档前先定位「拥有该主题的档」）= `docs/README.md`
- 方法论（工程纪律、四步流程、判据）= `docs/core/standards/METHODOLOGY.md`
- 代码结构分档（500 ∥ 800 两线、判者、漂移判定）= `docs/core/standards/CODE-TIER.md`
- 提示词面（会话里实际下派的行为规则）= `thincoder-core/prompts/`
- 设计哲学链 = `docs/core/requirements/PHILOSOPHY.md` → `docs/core/standards/METHODOLOGY.md` → prompts
