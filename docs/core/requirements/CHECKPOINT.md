# 检查点与 git 恢复（CHECKPOINT）· 需求

> 设计 = `docs/core/design/CHECKPOINT.md`；git 调度 = `TOOLS.md`。

## 1. 目标

git 或文件破坏性操作前保存可恢复快照，使用户能经 checkpoint list/cat/versions/rewind 找回操作前内容。

## 2. 功能需求

- 当前 v2 快照保存 tracked 改动与 untracked 文件副本，遵守当前排除和大小上限。
- 存储按规范化 cwd 隔离，各端同目录同格式。
- git 工具破坏性动作与 bash 兜底在执行前快照；手动 create 可用。
- rewind 前再快照，恢复可逆；按当前逐文件/目录契约，不静默全量回滚。
- commit 成功后按当前生命周期清理；失败或中断不触发。
- 非 git 项目使用当前非 git 变体，只受数量上限。
- 每 cwd 快照数量有界，最旧淘汰。

## 3. 可见性

工具描述、列表和恢复入口说明 rewind。快照是操作前状态，不承诺修复操作前已损坏内容。

快照与清理失败不反过来阻断已成功的 git 业务，但结果要如实报告。

## 4. 验收

验证 untracked、commit 后 rewind、跨端互通、恢复前快照、大小/数量上限、commit 清理负例和非 git 项目。
