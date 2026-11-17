# 检查点与 git 恢复（CHECKPOINT）· 设计

> 需求 = `docs/core/requirements/CHECKPOINT.md`。
> 最近先例：`TOOLS.md` 的 git 调度与 `SESSION.md` 的 cwd 归一。对齐 = 先快照、逐文件恢复、格式跨端。
> 勘察证据：已读 v2 副本、触发、上限、commit 清理和恢复。相关 = 当前 checkpoint 五动作。

## 1. v2 快照

git/checkpoint.mjs 保存变更 tracked 与 untracked 全文及 meta。超大文件按当前限制记录 skipped。

checkpointRoot(cwd) 使用规范化 cwd 的当前哈希。createNonGitCheckpoint 服务非 git 树。

## 2. 触发

snapshotBefore 覆盖当前破坏性 git 动作；bash 的 gitGuardSnapshot 是兜底；checkpoint create 是手动面。

快照不是权限门，审批仍独立。失败不冒充快照成功。

## 3. 查询与恢复

list 显示当前快照与 rewind 指引；cat 读文件；versions 查历史；rewind 按当前 path 范围恢复。

恢复前自动快照。全量恢复不可用时有明确错误，不能误删未选择文件。

## 4. 生命周期

pruneCheckpoints 保持当前每 cwd 上限。

commit 成功后清当前项目快照；清理失败不改变 commit 结果并提示。list/create/restore 的懒清理按当前 HEAD 与快照时间判定。

非 git 快照无 commit 清理。

## 5. 验证

验证副本内容、排除、哈希、各触发点、list/cat/versions/rewind、恢复可逆、上限和 commit 失败不清。
