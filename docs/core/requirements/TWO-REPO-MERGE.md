# 单仓多产品（TWO-REPO-MERGE）· 需求

> 本档描述当前单仓、多产品与共享核的边界。历史迁移过程由 git 保存。
> 设计 = `docs/core/design/TWO-REPO-MERGE.md`；共享核演进 = `CORE-UNIFICATION.md`。

## 1. 总体需求

CLI、VSC、Desktop、Server、render-core 与 thincoder-core 位于同一 git 仓。产品保持独立构建、发布和端侧职责，共享机制由 core 承担。

“单仓”不等于取消项目归属。PROJECT-MANIFEST.json、docRoot、index.publicRepos 与 index.writableRepos 仍决定文档、索引和写权。

## 2. 功能需求

| # | 需求 |
|---|---|
| F1 | 每个产品有清晰顶层目录，不混合端侧实现 |
| F2 | 各产品独立构建和发布，共享集成门按 TESTING |
| F3 | git 历史可追溯，结构移动不写成当前机制 |
| F4 | 不为 CLI/VSC 的旧双仓形态保留对端发现和逐字镜像机制 |
| F5 | 文档地图、提示词、台账和机检使用当前声明与 core 单源 |
| F6 | 外部仓或归档仓的存在不改变当前项目归属 |
| F7 | 结构调整不改变已声明的产品行为；行为变化走自己的需求与设计 |

## 3. 非功能需求

- 共享代码可打包进各产品发布物。
- 各产品只保留宿主特有逻辑。
- 文档引用使用当前仓内路径或已声明外部源。
- 不把历史仓名当作运行时项目根判据。
- 跨产品变化按 TESTING 运行对应验证。

## 4. 与其他规则的关系

PORTABILITY 与 CROSS-REPO-WRITE 仍适用于真实外部目录和声明仓。本档不能取消它们的写门。

CORE-UNIFICATION 负责共享核与薄壳的当前演进，不在本档复制迁移清单。

## 5. 边界

不恢复旧双仓机制，不把产品独立发布合并成单一发布，不在状态文档记录迁移当日读数。
