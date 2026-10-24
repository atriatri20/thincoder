# 2026-10-16 · 建盒配额步自愈 + 销毁清 loop
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 用户 2026-10-16 00:15 报障（成员面走查「会话根本起不来」——上游 ② 配额就位失败：`chattr: Operation not supported`）；父侧 .6 实读诊断 = 工作区路径挂陈旧 loop（旧 inode 无 project 特性）+ 就位探只看「是否 mountpoint」不自愈 + 销毁不清 loop/挂载（7 处残留）。。
> 台账 = #1517（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 开账（2026-10-16 00:20 · 主 agent）

**触发**：用户 00:15 报障——「现在会话根本起不来，启动报错：上游服务出错：② 配额就位失败：ext4 项目标记失败（exit=1）：… `chattr: Operation not supported` …」。

**诊断（.6 实读 · 父侧）**：
1. `/var/lib/thincoder/workspaces/12` = `/dev/loop32` 的挂载（loop 接于 2026-10-14 12:24）；但盘上 `12.loop.img` 已被重写（mtime = 2026-10-16 00:18）——**挂载中的 fs = 4,209,364,992 B ≠ 盘上文件 = 4,362,076,160 B** ⇒ 陈旧 loop 持旧 inode，路径上的新镜像**未接上**。
2. 旧 fs 无 ext4 项目特性 ⇒ `quota.mjs:75` 的 `chattr -R -p <id> +P` 得 **EOPNOTSUPP** ⇒ ② 停、建盒停。服务端以 root 跑（同命令非 root 跑 = EPERM——权限先查 ⇒ 服务端的 `not supported` 是 FS 层拒绝）。
3. **不自愈**：`quota.mjs:89` 就位探 = `mountpoint -q <path>` ——只判「是不是挂载点」；已挂载即跳过镜创建/格式化/重挂 ⇒ 每次重试撞同一面墙。
4. **同类残留 7 处**：`losetup -a` 中 workspaces `2/5/6/7/8/9/11` 的 loop 仍挂、镜像文件已删（`(deleted)`）⇒ **销毁径不清 loop/挂载**。

**解卡（用户侧 root 两条——.6 `sudo -n` 拒，父侧无口令）**：`sudo umount /var/lib/thincoder/workspaces/12` + `sudo losetup -d /dev/loop32` ⇒ 回控制台重试启动（就位探见「bare」⇒ 走 loopback 分支重建镜像 `mkfs.ext4 -O project,quota` + 挂载 ⇒ ② 过）。代价 = ws12 旧 inode 上的 10-14 走查内容（`home/.thincoder/`）不可再达，可先 `cp -a` 留档。7 处残留同法清。

**修面（本批）**：① 配额步自愈——就位探须验**挂载身份/能力**（陈旧 loop ⇒ 重接/重建），`chattr` 得 EOPNOTSUPP ⇒ 落 loopback 径；② 销毁径——detach loop + umount（清残留，防本态再生）；③ 沿既有三径语义与 fail-closed，不动 egress/网络面。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-16（五件齐全（①–③ + 落点 + AC-1…AC-5）；零实施；设计档落点 = EXECUTION.md §2.2/§3/§4/§13/§14/§15/§16 + ACCOUNTS.md §2.1；O-5 真机旗形前置核已上抛（知会））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**设计轮记录（2026-10-16 · eng-designer）——建盒配额步自愈 + 销毁清 loop（台账 #1517）**

**本批条目（覆盖）**

- **① 配额步自愈**（三链同经：`box.mjs:310` 建盒 ∥ `:336` 启动确保链 ∥ `:379` 轮换重建——三处皆调 `stepQuota` ⇒ `applyDiskQuota`）：就位探由「是否挂载点」升级为「挂载身份 + 能力」判据；陈旧 ∥ 无能挂载 ⇒ 卸除 + 重接/重建；`chattr` 项目标记被拒 ⇒ 降 loopback 径。
- **② 销毁径清 loop + 挂载**：`box.mjs:505` `destroyWorkspaceBox` 卷清理（现 `:520-526`）增显式两步——卸挂载 + detach loop，再删目录与镜像。
- **③ 零回归 + fail-closed 保持**：既有三径语义 ∥ 读回核 ∥ 停盒口径不动；健康径零新增调用、零新增审计行。

**不并（本批不做，明列）**：**既有 7 处残留**（`losetup -a` workspaces 2/5/6/7/8/9/11 的 `(deleted)` 镜像 loop）= 工作区行已删 ⇒ 本批销毁径无从触达 ⇒ 人工处置（§1 已给句）；本批只防再生。∥ egress/出站闸、网络面、镜像族/派生、容器载荷、卷族、快照/恢复链、放置/定时器 = 零涉。

**设计档落点（逐处 file:line——实读 2026-10-16）**

| # | 文件 | 现状（实读） | 改动 | 净 |
|---|---|---|---|---|
| L1 | `thincoder-server/src/sandbox/quota.mjs` | 121 行（内容行 118） | ① `parseFindmnt` 增 `source` 列（`:25-30`）；② 增 `classifyLoopbackMount` ∥ `parseLoopdevices` ∥ 读件 ∥ `releaseLoopbackVolume`；③ `applyLoopback`（`:87-97`）重写；④ `applyDiskQuota`（`:110-117`）加降级腿 + `recovery`；⑤ `step`（`:49-53`）增 `err.stepLabel` | **≈ +95 ⇒ ≈ 216 行**（内容行） |
| L2 | `thincoder-server/src/sandbox/box.mjs` | 640 行（内容行 667，越 500 软线在册） | 导入 `releaseLoopbackVolume`；销毁卷清理（`:523-525`）改卸除件 + `rm -rf` 改 `host.run`；`stepQuota`（`:226-233`）增 `quota_recovered` 审计 | **≈ +14 ⇒ ≈ 681 行**（内容行） |
| L3 | `docs/server/design/sandbox/EXECUTION.md` | 278 行 | §4（`:92-102`）机制句改写 ∥ §2.2 用途面（`:40`）+1 条 ∥ §3 销毁行（`:57`）补两步 ∥ §13 增用例（N74 ∥ B77–B80 ∥ E58）∥ §14 两值随正 ∥ §15 增 KD-SV-196…200 ∥ §16 增两级不做 | 本批（设计轮） |
| L4 | `docs/server/design/accounts/ACCOUNTS.md` §2.1 | `:73` 「配额一件」 | 同句追加 `quota_recovered`（detail 键集） | ±0（同行追加） |
| L5 | `docs/core/design/API-CONTRACT.md` §1 生成区 | `:3742-3747` quota 六符号行 | 重跑生成器（`node scripts/api-contract.mjs --write`）——新增三导出 + 行号随动；机械重生成 | 机械 |
| L6 | `docs/batches/2026-10-16-box-quota-recovery.test.mjs` | 无 | 新建（用例 1–9——用后即删） | +≈230 |
| L7 | `docs/server/design/sandbox/SANDBOX.md:531` | quota.mjs 行数表值 `≈**120**` | 随正（估形） | ±0 |

**实施轮面（非本轮）**：L1/L2 产品码 ∥ L6 批内件 ∥ L5 生成器重跑 ∥ §14 行数表**实读**收正（本设计给估形 `**≈N**`，最终以实施当刻实读为准）。

**机制设计**

**A. 就位判据（新——`quota.mjs` 导出纯函 `classifyLoopbackMount`；就位探的判据句）**

入 = `{ path, mountTarget, source, mountUuid, imageExists, imageUuid, imageFeatures }`；出 = `"ready" | "absent" | "stale"`。**逐序判**（次序即判序）：

1. `mountTarget !== path`（未挂在工作区路径上）⇒ `absent`；
2. 挂载源非 `/dev/loop<n>`（外来挂载）⇒ `stale`；
3. `imageExists === false`（盘上镜像不在——旧 inode 挂载）⇒ `stale`；
4. 镜像特性**可读且不含** `project` ⇒ `stale`（`chattr` EOPNOTSUPP 之源）；
5. 挂载侧与镜像侧 UUID **皆可读且不等** ⇒ `stale`（陈旧 inode ∥ 镜像被重写）；
6. 其余（读数不可得）⇒ `ready`。

**安全性质（判据不得以「读数不可得」触发破坏性重建）**：`stale` 只在**正面判明**时成立；任一读不可得 ⇒ 归 `ready`（零动——错误照旧在下游 `applyExt4` 显形，不新造数据损失面）。

**B. 自愈流程（`applyLoopback` 重写）**：探（`mountpoint -q` ∥ `findmnt -no SOURCE -T` ∥ `test -f` ∥ `dumpe2fs -h` 读 UUID+features）⇒ 判据 ⇒ 非 `ready` ⇒ **卸**（`umount <path>`（在挂才卸）+ `losetup -d <source>`）⇒ **重建**（镜像可用（具 `project`）⇒ **只重接**；镜像缺失 ∥ 正面缺 `project` ⇒ `truncate` + `mkfs.ext4 -q -O project,quota -F`）⇒ `mount -o loop,prjquota` ⇒ `chown 1000:1000` ⇒ 复用 `applyExt4`。**不再以 `mountpoint` 一判跳过全部**（本 bug 直接成因：`quota.mjs:89`）。重挂身份由挂载命令本身保证（挂的就是当前镜像）——不另设挂后复验读。

**C. ext4 径降级腿（`applyDiskQuota`）**：`ext4`+`prjquota` 径的**项目标记步**（`chattr`）失败 ⇒ 降 loopback 径一次。判据 = 该步的**步标签**（`step` 增 `err.stepLabel`——加性字段，零行为变化），**非错误文本**（locale 不稳）。

**D. 销毁清 loop（新——`quota.mjs` 导出 `releaseLoopbackVolume`；`box.mjs` 销毁卷清理步调用）**：① `mountpoint -q <path>` ⇒ 在挂则 `umount`（失败 ⇒ 抛）② `losetup -a -O NAME,BACK-FILE -n` ⇒ 逐条按 back-file（剥 ` (deleted)` 尾缀）等于**本工作区镜像**者 `losetup -d`（失败 ⇒ 抛；他人镜像零动）③ `rm -rf <path> <path>.loop.img` 改用 `host.run`（失败 ⇒ 抛）。**失败一律抛** ⇒ 停 + 行留 + 重试续链（残留不得静默产生——7 处残留即静默产生）。

**E. 自愈留痕（审计）**：`applyDiskQuota` 返回值增 `recovery ∈ null | "reconnect" | "rebuild" | "demote"`；`stepQuota` 于 `recovery !== null` 落一行 `sandbox_event/quota_recovered`（detail = `kind`+`workspaceId`+`runnerId`+`recovery`+`path`）。健康径零行。

**先例行（closest precedent）**：唯一同族件 = 本模块 loopback 径自身（实现 `quota.mjs:86-97`）∥ 三径择一（`:103-120`）。**对齐** = 三径语义（xfs ∥ ext4 ∥ loopback ∥ 皆不可则停）、项目 id 基址、读回核、幂等口径逐条沿用；**偏离** = 就位探由「`mountpoint -q` 一判」升为「身份 + 能力」判据并加卸除件（理由 = 一判跳过的正是本 bug：陈旧挂载 ⇒ 每次重试撞同一面墙）。销毁件先例 = `box.mjs:523-525` 的 `mountpoint -q && umount || true` 惯用形——对齐其幂等探法；偏离 = 补 detach loop 且由「尽力而为」收紧为 fail-closed（失败静默即残留成因）。

**勘察证据行**：仓内 `thincoder-server/src/sandbox/**` 全量 grep `umount|losetup|loop.img|detach` ⇒ 仅三命中（`quota.mjs:88` 镜像路径 ∥ `quota.mjs:89` 探 ∥ `box.mjs:524` 卸挂载）——**loop 设备面在销毁径零命中**（本 bug 第二条）。公开源 = `PROJECT-MANIFEST.json:189` `index.publicRepos: []`——零声明源，无相关可查（如实记；参考系已移出工作区、不入索引）。

**用例表（批内件——用后即删；与设计档 §13 同源）**

| # | 类 | 输入（假件） | 预期（可机检） |
|---|---|---|---|
| 1 | 判据 | `classifyLoopbackMount` 七例 | `absent` ∥ 外来源 `stale` ∥ 镜像缺 `stale` ∥ 无 `project` `stale` ∥ UUID 不等 `stale` ∥ 读数不可得 `ready` ∥ 就绪 `ready` |
| 2 | 边界 | 陈旧挂载（源 `/dev/loop32`，挂载 UUID ≠ 镜像 UUID，镜像具 `project`） | 序列 = `umount <path>` → `losetup -d /dev/loop32` → `mount -o loop,prjquota <image> <path>` → `chown` → `chattr …+P`；**无** `mkfs`；`recovery = "reconnect"` |
| 3 | 边界 | 镜像在场、特性可读且无 `project` | 序列含 `mkfs.ext4 -q -O project,quota -F <image>`；`recovery = "rebuild"` |
| 4 | 边界 | 就绪（UUID 同 + 具 `project`） | 序列**零** `umount`/`losetup -d`/`mkfs`/`mount`；`recovery = null` |
| 5 | 正常 | 裸路径 + 镜像不在 | `truncate` → `mkfs` → `mount` → `chown`（现状径零变）；`recovery = null` |
| 6 | 正常 | `xfs`+`pquota` ∥ `ext4`+`prjquota` 两径 | 序列逐条 = 现状；`recovery = null` |
| 7 | 错误 | `ext4`+`prjquota`，项目标记步 `exit≠0` | 续走 loopback 三件；`recovery = "demote"` |
| 8 | 边界 | `releaseLoopbackVolume`：在挂 + `losetup -a` 含本工作区两条（一在场一 `(deleted)`）+ 他人一条 | 序列 = `umount <path>` + `losetup -d` 本工作区两条（**不含**他人） |
| 9 | 边界 | 销毁（`deleteVolume:true`） | 序列 = 卸除件 + `rm -rf <path> <path>.loop.img`；审计 `workspace_destroy`/`box_destroy` 在 |

**验收对照（可机检判据——逐条回指本批条目）**

| AC | 回指 | 判据句 | 载体 |
|---|---|---|---|
| AC-1 | ① | 判据七例（用例 1）+ 陈旧挂载自愈序列与 `recovery` 值（用例 2/3/4/7）；**含安全性质**（用例 1 第七例：读数不可得 ⇒ 零卸除零重建） | 批内件 |
| AC-2 | ② | 销毁序列（用例 8/9）：`umount` + detach（仅本工作区镜像）+ `rm -rf`；无残留路径。**实机口径句**（收口轮一行）：销毁后 `losetup -a` 与 `mount` 对该工作区路径**零行** | 批内件 + 收口轮 |
| AC-3 | ③ | 健康径零回归（用例 5/6）：两径 + 裸径序列逐条同现状；零 `quota_recovered` 行 | 批内件 |
| AC-4 | 落点 | 文档在职机检：EXECUTION.md §4 判据句/§3 销毁行/§13 用例/§15 KD 在场；ACCOUNTS.md `quota_recovered` 行在场；API-CONTRACT 生成区含 `classifyLoopbackMount`∥`parseLoopdevices`∥`releaseLoopbackVolume` | 行扫描读数（§5） |
| AC-5 | ①/② | 真机复证（**待真机**）：`.6` 上一工作区造陈旧挂载 ⇒ 走 ② 得恢复 + `quota_recovered` 行；销毁后零残留 | §5/§6（真机，父侧收口轮） |

**关键决策**

- **KD-1 判据 = 身份（fs UUID）+ 能力（`project` 特性），非「是否挂载点」**；且**读数不可得不得触发重建**（安全性质）——理由：判据若「读不到就重建」，读件形错一次即抹掉全部工作区卷。
- **KD-2 收敛优先，重建兜底**：镜像可用 ⇒ 只重接（保盘上镜像内容）；破坏性 `mkfs` 仅限「镜像缺失 ∥ 正面缺 `project`」。**披露**：旧 inode 上的写入两径皆不可达（镜像已被重写）；差异 = 现状径连**盘上镜像**内容一并抹掉（`quota.mjs:91` `truncate` + `:92` `mkfs` 在裸径无条件跑）——本批消除该多余损失。
- **KD-3 卸除归属判据 = back-file（剥 ` (deleted)`）等于本工作区镜像路径** ⇒ 不动他工作区 loop（多工作区共存安全）。
- **KD-4 销毁径由「尽力而为」收紧为 fail-closed**（`umount`/`losetup -d`/`rm -rf` 失败 ⇒ 抛；停 + 行留 + 重试续链）——理由：静默失败正是 7 处残留的成因。
- **KD-5 拒以错误文本判能力**（locale 不稳）⇒ 以步标签 + 特性读为判据（与派单「`chattr` 得 EOPNOTSUPP ⇒ 落 loopback 径」**同效异法**——如实披露：效果同、判法不同）。
- **KD-6 自愈留痕 = 新 kind `quota_recovered`**（健康径零行）——理由：本 bug 的痛点正是「不可见」（同一墙撞多次、无人知）。
- **KD-7 不留旧镜像副本**（免残留面扩大）；留档 = 用户侧手工 `cp -a`（§1 已给句）。

**观察/发现（逐条报）**

- **O-1（不处置·射程外）**：既有 7 处 `(deleted)` loop 残留——工作区行已删，本批销毁径触达不到；人工 `losetup -d`（§1 已给处置句）。本批只防再生。
- **O-2（已处置·本批）**：`quota.mjs:91` 的 `truncate -s` 对**已存在镜像**做定长设置（可缩），`:92` `mkfs` 紧随——现状在「裸径 + 镜像有数据」时**抹掉镜像内容**；KD-2 顺带消除该多余损失。
- **O-3（在册·不扩）**：`box.mjs` 内容行 667 > 500 软线（`EXECUTION.md:204/:229` 在册）；本批 +14 行仍在册，拆案不在本批。
- **O-4（同族惯例·不扩）**：`ACCOUNTS.md:70` 的 `sandbox_event` kind 清单已极长；本批按既有惯例落在 `:73`「配额一件」行（不动清单结构）。
- **O-5（[上抛·知会]）**：三个读件的**确切旗形**（`findmnt -no SOURCE -T` ∥ `dumpe2fs -h <dev>` ∥ `losetup -a -O NAME,BACK-FILE -n`；本机无 Linux 可验）⇒ 列实施轮**真机前置核**：三条只读命令各跑一次，输出形对不上 ⇒ **停并回报**，不得臆改判据（判据语义以本 §2 为准）。
- **O-6（知会）**：`applyDiskQuota` 增返回字段 + `parseFindmnt` 增列 ⇒ `API-CONTRACT.md` 生成区需重跑生成器（L5，机械）。

**边界（明列不动面）**

- **不动**：出站/egress 闸 ∥ 网络面（`tc-ws-<id>`）∥ 镜像族与派生（`derive.mjs`）∥ 容器载荷参数集（`buildBoxPayload`）∥ 命名卷族 ∥ 快照/恢复链 ∥ 放置与定时器 ∥ 需求档（本批零语义变更——`docs/server/requirements/PROJECT.md:516`「资源上限…磁盘配额」∥ `:413` AC-36 ⑤ 已在册）。
- **不做**：既有 7 处残留清理（人工）∥ 旧镜像留档副本 ∥ `quota.mjs`/`box.mjs` 拆案 ∥ 真机自动化（本批真机读数 = 父侧收口轮）。
- **无 UI/交互面**（本批纯主机侧链路）。

**上抛项**

- **[上抛·知会]** O-5（真机旗形前置核——实施轮，非阻塞）。
- **[上抛·待裁]** 无（无需求冲突 ∥ 无越权面 ∥ 派单授权口径内）。

**段末补正 + 回读（2026-10-16 · eng-designer）**

- **[上抛·知会] 并行写者披露**：`docs/server/design/sandbox/EXECUTION.md` ∥ `SANDBOX.md` ∥ `accounts/ACCOUNTS.md` 有第二个写者在场（另批 `docs/batches/2026-10-16-record-face-correction.md`——正做行数面 `读/内容` 形归一）。**已发生一次冲撞**：本轮的 §14 两值改动被并行批次覆回（现盘 `**639/640**` ∥ `**120/121**`，非本设计估形）。
- **撤一条落点**：L3 的「§14 两值随正」**撤销**——§14 归并行批次实测形维护；本批两值随正 = **实施轮面**（以实施当刻实读为准）。L7 的 SANDBOX.md 行**已落**（职责列 + 状态词 `（拟新增）⇒（已落）`；**行数值不动**）。
- **计数/坐标随正（自检发现）**：AC-1 的安全性质腿 = **用例 4**（`§13 B79` 第二腿：读数不可得 ⇒ 序列零动——纯函侧见用例 1 第六例）。O-3 坐标随并行批次归一后移 ⇒ 现盘 `EXECUTION.md:225-226`（§14 两行）∥ `:250`（行数读数段）。实读口径：`box.mjs` = read 640 行 ∥ `quota.mjs` = read 121 行。
- **用例两套编号映射（批内件 1–9 ↔ 设计档 §13）**：1 ⇒ 判据七例（§13 无独立行——由 §4 判据句承载）∥ 2 ⇒ B77 ∥ 3 ⇒ B78 ∥ 4 ⇒ B79（两腿）∥ 5+6 ⇒ N74 ∥ 7 ⇒ B80 ∥ 8+9 ⇒ E58（释放腿 + 销毁腿）。
- **回读（D6——写入后逐处复读）**：`EXECUTION.md` §2.2 `:40`（⑤销毁卷清理）✓ ∥ §3 销毁行 `:57`（④卸挂载 + detach + fail-closed）✓ ∥ §4 `:92-117`（判据 ①–⑥ + 安全性质 + 自愈三步 + 留痕 + 卸除件）✓ ∥ §13 `:214-219`（N74 ∥ B77–B80 ∥ E58）✓ ∥ §15 KD-SV-196…200 ✓ ∥ §16 配额/销毁余项 ✓ ∥ `ACCOUNTS.md:74`（`quota_recovered`）✓ ∥ `SANDBOX.md:531` ✓。
- **本轮零实施**：L1/L2/L5/L6 与 §14 实读收正 = 实施轮面。

**修正记录（fix 轮 · 2026-10-16 · eng-designer）——按评审 §3 轮次 1 发现表逐条落（1–10）**

**输入**：评审裁 changes-required（🔴 2 ∥ 🟡 7 ∥ 🔵 2；合计 11）、未签发令牌；父侧裁定 **1–10 全部受理（设计侧落）∥ 11 不动**（评审面限制说明，无需改）。本段 = 修正记录：上文本 §2 与更正相抵处**以本段为准**（§2 append-only——原行不改，更正逐条列明）。

| 号 | 发现（简） | 处置 | 改动 file:line |
|---|---|---|---|
| 1 🔴 | `stale` 态「外来挂载」无处置定义 + 自愈对任意 `<source>` 无条件发 `losetup -d`（B 段无卸除失败语义） | 规则 = **非 `/dev/loop<n>` 源 ⇒ 只卸挂载、零 detach**；detach 归属判据单源（沿 KD-3）= 源为 `/dev/loop<n>` ∧ back-file 等于本工作区镜像路径（剥 ` (deleted)`）；卸除失败（`umount` ∥ `losetup -d` 非零）⇒ 抛（fail-closed）；新用例 | `EXECUTION.md:105`（判据②处置句）∥ `:112`（自愈①归属 + 卸除失败）∥ `:119`（卸除件归属判据）∥ `:290`（KD-SV-196）∥ `:291`（KD-SV-197）∥ `:223`（**B81** 新）；用例行 `:120` 随正 |
| 2 🔴 | 新 kind `quota_recovered` 的审计面落点未入表；`:125` 还断言「无 UI/交互面」 | 落点表补三行 **L8/L9/L10**（下表）；文案 = zh「磁盘配额自愈」∥ en `Disk quota recovered`（en 零 CJK——沿 `quota_apply_failed` 同形）；**撤本 §2 `:125` 句**；测试链随正 = **不涉**（实测：`docs/batches/*.test.mjs` 全域 grep `SANDBOX_KIND_KEYS`/`AUDIT_TYPES`/`i18n-zh-system`/`sandboxKind` **零命中**——在盘十件实扫） | `views-audit.mjs` `:224` 区 +1（现读 **271/272**；未知 kind 原值兜底 = `:231` 不动）∥ `i18n-zh-system.mjs` `:216` 区 +1（现读 **221/222**）∥ `i18n-en-system.mjs` `:216` 区 +1（现读 **221/222**） |
| 3 🟡 | 零回归口径与新探针相抵；`parseFindmnt` 增列未给旗形/字段序 | 口径改「**变更性命令零增**（`umount`/`losetup -d`/`truncate`/`mkfs`/`mount`/`chown` 六族）+ **审计行零增**」，新增**只读读件显式列出**；旗形 = `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T <path>`；`parseFindmnt` 出参序 = `{ mount, source, fstype, options }`（旗形逐位）；随正 N74 | `EXECUTION.md:101-102`（读件 + 旗形/字段序）∥ `:117`（健康径口径）∥ `:217`（N74 随正）；本 §2 `:33`/`:41`/`:98` 随正 |
| 4 🟡 | 留痕只绑成功返回；重建后 `applyExt4` 抛 ⇒ 卷已重建却零痕 | 留痕绑**物理动作** = 重建/重接即落行（成功返回携 `recovery` ∥ **重建后下游失败由错误携 `err.recovery`**——`stepQuota` 两径皆落）；新用例 | `EXECUTION.md:118` ∥ `:225`（**E59** 新） ∥ `ACCOUNTS.md:74`（写入点「两径皆落」） |
| 5 🟡 | 销毁径「未挂」语义未定（现状惯用形未挂零退出；按字面换 `host.run` 会让未挂也抛） | 判据句 = **未挂 ⇒ 过、零动作、不抛**；命令形保两段探（`mountpoint -q … && umount …` 形——判据句定语义，命令形不改）；新用例 | `EXECUTION.md:119` ∥ `:57`（销毁行）∥ `:224`（**B82** 新）∥ `:293`（KD-SV-199） |
| 6 🟡 | 降级腿三处未定：守卫（两径同一步标签）/ 降级后新 fs 盖住路径内容未披露 / 无「再失败」用例 | 守卫 = **仅 `ext4-project` 径的该次调用降**；降级后 loopback 径项目标记再失败 ⇒ **停**（零第二次降级）；「盖住路径内容」入披露；新用例 | `EXECUTION.md:100` ∥ `:226`（**E60** 新） ∥ `:292`（KD-SV-198） |
| 7 🟡 | L4 与落盘形不符（原「`:73` 同句追加」= 估形；盘上为独立行） | L4 收正 = **`ACCOUNTS.md:74` 独立行形**（`quota_recovered` detail 键集句已在 `:74`）；O-4 坐标同收正 | 本 §2 `:44`（L4）∥ `:117`（O-4）；**设计档零改**（盘面已正确——实读核过） |
| 8 🟡 | `box.mjs` 行数标注不自洽（「内容行 667」> 总行 640；同一文件三种数） | 统一到 §14「读/总」形：**639/640**（现读）⇒ 本批 +≈14 ⇒ ≈ **653/654**；「内容行」表述撤；口径 = `\n` 换行计数（总行 = 换行数 + 1）。**同族补正**（同类不一致，一并收）：L1 `quota.mjs` = **120/121**（现读）⇒ +≈95 ⇒ ≈ **215/216**（原「121 行（内容行 118）」同撤） | 本 §2 `:42`（L2）∥ `:41`（L1） |
| 9 🟡 | 既有单测件未入表、亦无「不受影响」声明 | **受影响 ⇒ 入表 L11**（下表）：现读 **421** 行 ⇒ `±≤3`（假件 `findmnt` 读数行 `:65` 补 `SOURCE` 字段；断言零改）。判据（不改 ⇒ 面漂）= 3 字段行在新字段序下 ⇒ `fstype = "rw,relatime,prjquota"` ⇒ 落 loopback 支路：T1 仍绿但已不表达 ext4 腿；T5（`findmntFails`）不受影响——探明步先抛 | 落点表补 **L11** |
| 10 🔵 | O-3 坐标未随并行写者收正 | 收正 = `EXECUTION.md:225-226`（§14 两行）∥ `:250`（行数读数段）；原「`:204/:229`」撤 | 本 §2 `:116`（O-3） |
| 11 🔵 | 评审面限制说明（无项目标准档/文档地图；需求档引用不在射程） | **不动**（父侧裁定） | —— |

**落点表补四行（原 L1–L7 之外——L6 随用例数随正）**

| # | 文件 | 现状（实读 2026-10-16） | 改动 | 净 |
|---|---|---|---|---|
| L8 | `thincoder-server/public/views-audit.mjs` | 271/272（`SANDBOX_KIND_KEYS` 逐 kind 登记；`:224` = `quota_apply_failed` 同族形 ∥ `:231` 未知 kind 原值兜底） | `:224` 区 +1 键 `quota_recovered: "audit.sandboxKind.quota_recovered"` | ±≤2 ⇒ ≈ 272/273 |
| L9 | `thincoder-server/public/i18n-zh-system.mjs` | 221/222（`:216` = `audit.sandboxKind.quota_apply_failed`） | `:216` 区 +1 键（值 = 「磁盘配额自愈」） | ±≤2 ⇒ ≈ 222/223 |
| L10 | `thincoder-server/public/i18n-en-system.mjs` | 221/222（`:216` 同键） | `:216` 区 +1 键（值 = `Disk quota recovered`——**en 零 CJK**） | ±≤2 ⇒ ≈ 222/223 |
| L11 | `docs/batches/2026-10-15-server-mech-closeout.test.mjs` | 421（前批单测件——在盘；假件硬编 3 字段 `findmnt` 读数 `:65`） | 假件读数行补 `SOURCE` 字段（断言零改）——**受影响件，非本批新件** | ±≤3 ⇒ ≈ 424 |
| L6 随正 | `docs/batches/2026-10-16-box-quota-recovery.test.mjs` | 无（本批新建） | 用例 1–9 ⇒ **1–13**（+4：外来挂载 ∥ 重建后 `chattr` 失败 ∥ 销毁未挂 ∥ 降级再失败） | ≈ 230 ⇒ ≈ **300** |

**用例表补四行（批内件序 10–13——与设计档 §13 同源）**

| # | 类 | 输入（假件） | 预期（可机检） | 设计档 |
|---|---|---|---|---|
| 10 | 边界 | 外来挂载（源 `/dev/sdb1`、镜像在场且具 `project`） | 序列 = `umount <path>` → `mount -o loop,prjquota` → `chown` → `chattr`；**零** `losetup -d`；`recovery = "reconnect"` | B81 |
| 11 | 错误 | 陈旧挂载 ⇒ 重建（`mkfs`）后项目标记步 `exit≠0` | 审计 `quota_recovered`（`recovery = "rebuild"`）**在场** + `quota_apply_failed` 在场；错误上抛 | E59 |
| 12 | 边界 | 销毁 + 路径未挂（xfs/ext4 径常态） | 零 `umount`/零 `losetup -d`（不抛）+ `rm -rf` 两项；终态 `destroyed` | B82 |
| 13 | 错误 | 降级腿后 loopback 径项目标记**再失败** | **停**（零第二次降级）；`quota_recovered`（`recovery = "demote"`）在场 + `quota_apply_failed` 在场 | E60 |

**编号映射随正（批内件 1–13 ↔ 设计档 §13）**：1 ⇒ 判据七例（§4 判据句承载）∥ 2 ⇒ B77 ∥ 3 ⇒ B78 ∥ 4 ⇒ B79（两腿）∥ 5+6 ⇒ N74 ∥ 7 ⇒ B80 ∥ 8+9 ⇒ E58 ∥ 10 ⇒ B81 ∥ 11 ⇒ E59 ∥ 12 ⇒ B82 ∥ 13 ⇒ E60。

**AC 随正（回指不变，载体随新用例）**：AC-1（①）= 用例 1–4 ∥ 7 ∥ 10 ∥ 13（§13 B77–B81 ∥ E59–E60）∥ AC-2（②）= 用例 8 ∥ 9 ∥ 12（§13 E58 ∥ B82）∥ AC-3（③）= 用例 5 ∥ 6（口径 = 变更性命令零增 + 审计行零增 + 只读件清单）∥ AC-4（落点）增三件行扫描（views-audit ∥ i18n zh/en）+ `ACCOUNTS.md:74` ∥ AC-5 不变。

**本轮零实施**：L1/L2/L5/L6/L8–L11 与 §14 行数实读收正 = 实施轮面（本 fix 轮只落设计档与批档）。**无新语义夹带**：逐条皆由 1–10 派生；超字面两处已披露——⑧ 同族补正 L1（同「内容行」缺陷类）∥ ④ 随正 `ACCOUNTS.md:74` 写入点句（由「留痕绑物理动作」直接派生）。

**修正记录·补（坐标随动 + 同族一处 · 2026-10-16 · eng-designer）**

- **⑩ 行的 §14 坐标已随本 fix 轮后移**（本段上表 ⑩ 行写的 `:225-226`/`:250` = 评审当刻盘面；本 fix 轮 §4 +3 行、§13 +4 行 ⇒ §14 后移 7 行）：现盘 = `EXECUTION.md:232-233`（§14 的 `box.mjs` 行 ∥ `quota.mjs` 行）∥ `:257-259`（行数读数段）。'§2 `:136` 计数/坐标随正段' 所记 O-3 坐标同随此归正——此后凡引 §14 **以段名（§14 两行 ∥ 行数读数段）为准**，行号只作当刻快照（D4 口径）。
- **同族一处补正（⑧ 同类，一并收）**：L3 `docs/server/design/sandbox/EXECUTION.md` 行数标注 = `278 行`（设计轮估形，已陈旧）⇒ 收正 **313**（fix 轮落点后实读；fix 轮前实读 = 306——差数归并行写者 + 本 fix 轮 +7）。

**修正记录（fix 轮 2 · 2026-10-16 · eng-designer）——两裁定案落档 + 三处陈旧收正（append-only；与上文相抵处以本段为准）**

**输入** = 父侧 fix 轮派单（三处陈旧 + 两条待裁定案）。**落点只涉设计档两件**（`sandbox/EXECUTION.md` ∥ `sandbox/SANDBOX.md`）+ 本段；**零产品码**（(A) 的代码随正 = 实施轮另派）∥ 零需求档 ∥ 零其余机制面。

**(A) 值层留痕缺口 ⇒ 裁「抹掉既有镜像内容即必留痕」**

缺口（实施轮 §5 披露 ⑥ ∥ 评审轮 2 值层发现）：裸路径（判据① ⇒ `absent`）∧ 镜像在场 ∧ 正面缺 `project` ⇒ 实现已 `truncate`+`mkfs` **抹掉既有镜像内容**，而 `recovery` 因判据绑裁决名（`stale`）而仍 `null` ⇒ 零 `quota_recovered` 行——与「卷已重建 ⇒ 行必落」相抵。**裁定 = 留痕判据改绑「是否抹掉既有内容」**（非裁决名）：

| 径 | 重建前镜像 | 内容被抹 | `recovery` |
|---|---|---|---|
| 裸路径 ∧ 镜像在场 ∧ 正面缺 `project`（**本裁定案**） | 在场 | 是 | **`"rebuild"`**（行必落） |
| `stale` ∧ 镜像在场（判据②/④/⑤） | 在场 | 是 | `"rebuild"` |
| `stale` ∧ 镜像不在（判据③旧 inode——旧内容不可再达） | 不在 | 是 | `"rebuild"` |
| 裸路径 ∧ 镜像不在（首建） | 不在 | 否 | `null`（**唯一 `null` 径**） |

| # | 改动（改前 → 改后） | file:line |
|---|---|---|
| A-1 | §4 留痕句尾追加「**重建留痕的判据 = 是否抹掉既有内容**：`mkfs` 抹掉既有镜像内容（重建前镜像在场）⇒ 行必落（`rebuild`）——裁决 `absent` ∥ `stale` 皆然；`stale` ∧ 镜像不在 ⇒ 亦 `rebuild`；唯 `absent` ∧ 重建前镜像不在（首建）⇒ `null`」 | `EXECUTION.md:118` |
| A-2 | §13 N74 裸径腿口径收窄——尾「零 `quota_recovered` 行」加括注（裸径腿 = **镜像不在**的首建；裸径 ∧ 镜像在场缺 `project` 者见 B83） | `EXECUTION.md:217` |
| A-3 | §13 **新用例 B83**（裸路径 + 镜像在场缺 `project` ⇒ 抹既有镜像 + `recovery = "rebuild"` + `quota_recovered` 行在场） | `EXECUTION.md` §13 表内 B82 行后（新增行） |
| A-4 | §4 用例枚举 `N74 ∥ B77–B82 ∥ E58–E60` ⇒ `N74 ∥ B77–B83 ∥ E58–E60` | `EXECUTION.md:120` |
| A-5 | §15 KD-SV-200 决策格追加「**留痕判据 = 是否抹掉既有内容**」（`mkfs` 抹掉既有镜像 ⇒ `rebuild`；唯 `absent` ∧ 重建前镜像不在 ⇒ `null`） | `EXECUTION.md:295` |

**（A）代码随正（实施轮另派——本席不动产品码）**：`quota.mjs` `applyLoopback` 的 `recovery = "rebuild"` 赋值判据改为 `verdict === "stale" || !missing`（= `stale` ∨ 重建前镜像在场），替换现盘 `verdict === "stale"` 单判；随正附批内件**用例 14 = B83**。判据语义以本段与 §4 表述为准。

**(B) 判据⑤ 未提权即退化 ⇒ 裁「记为部署前提 + 明书退化面」**

真机实测（§5 真机前置核 2 ∥ 披露 ⑥）：`/dev/loopN` = `brw-rw---- root disk` ⇒ 非 root 不可读 ⇒ 判据⑤（两侧 UUID 比对）恒不成立 ⇒ 归 `ready`、陈旧挂载不自愈。**裁定 = 记为部署前提 + 明书退化面；不设「无 root 判据腿」**（不以不可靠读件换自愈率）；该退化由安全性质（KD-SV-196：读不了 ⇒ 不臆断 ⇒ 不重建）**直接派生**。

| # | 改动（改前 → 改后） | file:line |
|---|---|---|
| B-1 | §4 判据⑤ 句尾追加「**读挂载侧需服务以可读 `/dev/loopN` 的身份运行（root ∥ `disk` 组）**——不可读 ⇒ 本判据空转、归 `ready`、该档不自愈（**部署前提**；退化由安全性质派生）」 | `EXECUTION.md:108` |
| B-2 | §12 验收判据 ⑤ 行并入该前提（可核项）——§4 配额格内加「**部署前提 = 服务以可读 `/dev/loopN` 的身份运行——root ∥ `disk` 组，判据⑤**」 | `EXECUTION.md:182` |
| B-3 | §15 KD-SV-196 决策格追加前提句 + 「**不设「无 root 判据腿」**」 | `EXECUTION.md:291` |
| B-4 | SANDBOX.md 部署面（§3 节点侧前置）**新增一行「主机侧命令前置」**（可读 `/dev/loopN` 的身份 + 不可读的退化行为 + 判据全文指针 + 不设无 root 腿） | `SANDBOX.md:59` 后新增 `:60` |

**三处陈旧（实读收正——改前 → 改后）**

| # | 项 | 改前 → 改后 | file:line |
|---|---|---|---|
| ① | 「③ 删目录与镜像」被列在卸除件句内（实现按 L2/用例 8 落 `box.mjs` `host.run`） | 原句「…零 detach ③ 删目录与镜像；`umount` ∥ `losetup -d` ∥ `rm -rf` 失败皆 ⇒ 抛」⇒ 「…零 detach；`umount` ∥ `losetup -d` 失败 ⇒ 抛。③ **删目录与镜像不在卸除件内**——落 `box.mjs` 销毁步（`rm -rf …` 走 `host.run`，失败 ⇒ 抛；§3 销毁行）；卸除件（①②，`quota.mjs`）与删除件（③，`box.mjs`）两档共成销毁全程 fail-closed」；同拍 §2.2 ⑤ 用途面指针收正（①② 落 §4 卸除件 ∥ ③ 落 `box.mjs` 销毁步） | `EXECUTION.md:119` ∥ `:40` |
| ② | §4 读件表缺**挂载侧** `dumpe2fs -h <source>`（判据⑤取数来源；实现 = `quota.mjs:133`） | 镜像侧 `dumpe2fs` 之后插入「`dumpe2fs -h <source>`（**挂载侧** fs UUID——判据⑤取数；仅源为 `/dev/loop<n>` 时读，外来挂载零外读）」；§4 健康径口径只读件枚举同拍（`dumpe2fs`（镜像侧 + 挂载侧两读）） | `EXECUTION.md:101` ∥ `:117` |
| ③ | §14 行数值仍作实施前读数 | `quota.mjs` **120/121 ⇒ 285/286** ∥ `box.mjs` **639/640 ⇒ 652/653**（§14 两档行 + 行数读数段）；`SANDBOX.md` §13 同两行同值 | `EXECUTION.md:233/:234/:258` ∥ `SANDBOX.md:531/:532` |

**③ 的同族补正（超派单字面一处·披露）**：派单 ③ 只点名 `quota.mjs`（120/121）两处；`box.mjs` 两处（`EXECUTION.md` §14 行 + 行数读数段 ∥ `SANDBOX.md` §13 行）为**同因陈旧**（同一实施轮改码；派单已知事实亦给 `box.mjs` = 652/653）⇒ 一并收正，避免同一表内新旧两读并存。

**实读读数（2026-10-16 · 本 fix 轮亲测；口径 = `\n` 换行计数 / 总行 = 换行数 +1）**：`quota.mjs` **285/286** ∥ `box.mjs` **652/653** ∥ `views-audit.mjs` **272/273** ∥ `i18n-zh-system.mjs` **222/223** ∥ `i18n-en-system.mjs` **222/223** ∥ 批内件 `2026-10-16-box-quota-recovery.test.mjs` **479/480** ∥ `EXECUTION.md` **313/314** ∥ `SANDBOX.md` **659/660**（两档含本段落点）。§14 除 box/quota 外 **21 档行**逐档实测与盘面同值（仅 box/quota 两行陈旧）；`SANDBOX.md` §13 其余行同。

**回读（D6——写入后逐处复读）**：`EXECUTION.md` §2.2 `:40` ✓ ∥ §4 `:101` ∥ `:108` ∥ `:117` ∥ `:118` ∥ `:119` ∥ `:120` ✓ ∥ §12 `:182` ✓ ∥ §13 `:217` ∥ B83 新行 ✓ ∥ §14 `:233/:234` + 读数段 `:258` ✓ ∥ §15 KD-SV-196 `:291` ∥ KD-SV-200 `:295` ✓ ∥ `SANDBOX.md` `:59-60` ∥ §13 `:531/:532` ✓。

**未落项 / 上抛**

- **[上抛·待裁] 评审 §3 轮次 2 遗留三条本轮未动**（派单未列，不扩面）：**N1**（🟡——§2 上文「AC-1 = 用例 1–4 ∥ 7 ∥ 10 ∥ 13」枚举缺「11/E59」）；**N2**（🔵——`:101`/`:117` 对 `losetup -a` 阶段归属两说）；**N3**（🔵——`:118` 错误携句只点「重建后」未含「重接后」）。请父侧裁是否另轮或并入。
- **[上抛·知会] 实施轮随正待办**：① (A) 代码随正（`quota.mjs` `applyLoopback` 判据）+ 批内件**用例 14（= B83）**；② §5 实施记录 `:279` 的在职行扫与批内件表头仍作 `B77–B82`（实施轮当刻快照）——实施轮随用例 14 落行时自随正；③ 若再改码，§14/§13 行数须以当刻实读复读。
- **[上抛·知会] 范本形不齐（域外·归并行批次）**：`SANDBOX.md` §13 三行作**孤值**而非「读/总」形（`registry-client.mjs` **225**、`image-source-routes.mjs` **150**、`credentials.mjs` **31**）——实读 = 225/226 ∥ 150/151 ∥ 31/32；孤值语义不可判（不知指读或指总）⇒ **本席不动**（形归一 = 并行批 `2026-10-16-record-face-correction` 面）。
- **[上抛·知会] 并行写者在场**：本批本轮触及 `EXECUTION.md` §2.2/§4/§12/§13/§14/§15 + `SANDBOX.md` §3/§13；与该批目标行（`EXECUTION.md:7` ∥ `SANDBOX.md:648`）不重叠；`EXECUTION.md` 行号因本段 +1（313 ⇒ 314）、`SANDBOX.md` +1（659 ⇒ 660）——此后引坐标以段名 + 当刻复读为准（D4）。

**修正记录（fix 轮 3 · 2026-10-16 · eng-designer）——判据族自洽收正（五件 + #1531 三条；append-only——与上文相抵处以本段为准）**

**输入** = 父侧 fix 轮派单（五件判据/文本相抵 + #1531 = §3 轮次 2 遗留三条）。**落点** = `docs/server/design/sandbox/EXECUTION.md` 相应句 + 本段；**零产品码**（#86 已实装——本轮零行为改动要求，见下「代码随正」）∥ 零需求档 ∥ 零其余机制面。

**逐件收正（改前 → 改后）**

| 号 | 发现（简） | 改动（改前 → 改后） | file:line |
|---|---|---|---|
| ① | `:118`「裁决 `absent` ∥ `stale` 皆然」未排除「`stale` ∧ 镜像可用（具 `project`）⇒ 只重接（`reconnect`、零 `mkfs`）」径——与 `:113` ∥ §13 B77 ∥ B81 相抵 | 判别句头「重建留痕的判据 = 是否抹掉既有内容」⇒「**`rebuild` 的判据 = 是否抹掉既有内容**（既有内容不可再达即是）」；「皆然」后加限定句「**无抹 ⇒ 非 `rebuild`**——`stale` ∧ 镜像可用（具 `project`）⇒ 只重接，`recovery = "reconnect"`（行由主句「命中 `reconnect`」规约）」 | `EXECUTION.md:118` |
| ② | 「唯 `absent` ∧ 重建前镜像不在（首建）⇒ `null`」未列「`absent` ∧ 镜像在场且具 `project`（只挂载既有镜像、零 `mkfs`、无抹）」径；**定案** = 该径 `recovery = null`（`reconnect` 定义域在 `stale` 自愈径内——`:111`/`:113`；`absent` = 建/挂 ⇒ 非自愈 ⇒ 零痕） | 尾句 ⇒「`null` 径 = 无既有内容被抹：`absent` ∧ 重建前镜像不在（首建——无内容可抹）∥ `absent` ∧ 镜像在场且具 `project`（只挂载既有镜像，零 `mkfs`）∥ `ready`（健康径）」——「唯一」表述撤 | `EXECUTION.md:118` ∥ `:296`（KD-SV-200 决策格同句同拍） |
| ③ | 本批档 §2 fix 轮 2 四径表第 2 行「`stale` ∧ 镜像在场（判据②/④/⑤）⇒ 内容被抹 = 是 ⇒ `rebuild`」与 ① 同因（判据②/⑤ 镜像可用者实为 `reconnect`） | 收正 = 见下「③ 收正后的四径表」（拆分 ②/⑤ 与 ④；末行「**唯一 `null` 径**」依 ② 收正） | 本批档 `:200` ∥ `:202` |
| ④ | 编号映射（`:178`）与 AC-1 枚举（`:180`）未含**用例 14 = B83** | `:178` 补「14 ⇒ B83 ∥ 14 附 ⇒ B84」；`:180` AC-1 枚举补 `11` ∥ `14`、§13 范围 `B77–B81` ⇒ `B77–B84` | 本批档 `:178` ∥ `:180` |
| ⑤ | §13 无「`stale` ∧ 镜像不在」行（用例 14 附 的载体 = §4 散句）——**定其载体** = **§13 新行 B84**（判据 = §13 = 用例表、四径须逐条在场；沿 B83「一径一行」先例） | §13 增行 **B84**（陈旧挂载 + 盘上镜像不在 ⇒ `umount` → `losetup -d /dev/loop32` → `truncate` → `mkfs.ext4 -q -O project,quota -F` → `mount -o loop,prjquota` → `chown` → `chattr`；`recovery = "rebuild"` ∥ `quota_recovered` 行在场）；§4 `:120` 枚举 `N74 ∥ B77–B83` ⇒ `N74 ∥ B77–B84` | `EXECUTION.md` §13 B83 行后新增 `:226` ∥ `:120` |
| N1 | 本批档 `:180` AC-1 枚举缺**用例 11/E59**（其括注却点了 E59） | 同 ④ 行收敛（`:180` 补 `11`） | 本批档 `:180` |
| N2 | `:101` 注 `losetup -a`「（loop 归属读数——卸除件用）」而 `:117` 书「loopback 腿另加 … `losetup -a`」——同读件阶段归属两说；健康径只读集未钉 | `:101` 括注 ⇒「（loop 归属读数——**卸除阶段用**：自愈卸除 ∥ 销毁卸除件；健康径零读）」；`:117` loopback 腿只读列**删 `losetup -a`** + 加「**`losetup -a` 不在健康径**——仅卸除阶段读（自愈卸除 ∥ 销毁卸除件）」 | `EXECUTION.md:101` ∥ `:117` |
| N3 | `:118` 错误携句只点「重建后」，其上句规约「卷已重建/重接 ⇒ 行必落」——**重接后下游失败**未明（E59 只覆盖重建腿） | 「**重建后**下游步失败时由错误携 `err.recovery`」⇒「**重建/重接后**下游步失败时由错误携 `err.recovery`」；KD-SV-200 决策格同句同拍 | `EXECUTION.md:118` ∥ `:296` |

**③ 收正后的四径表（取代上文 fix 轮 2 同名表——以本表为准）**

| 径 | 重建前镜像 | 内容被抹 | `recovery` |
|---|---|---|---|
| `stale` ∧ 镜像在场 ∧ 具 `project`（判据②/⑤ 镜像可用） | 在场 | 否 | **`"reconnect"`**（非 `rebuild`——行由「命中 `reconnect`」规约） |
| `stale` ∧ 镜像在场 ∧ 缺 `project`（判据④） | 在场 | 是 | `"rebuild"`（行必落） |
| `stale` ∧ 镜像不在（判据③旧 inode——旧内容不可再达） | 不在 | 是 | `"rebuild"`（行必落） |
| 裸路径 ∧ 镜像在场 ∧ 正面缺 `project`（原裁定案） | 在场 | 是 | `"rebuild"`（行必落） |
| 裸路径 ∧ 镜像在场 ∧ 具 `project`（只挂载） | 在场 | 否 | `null`（零 `mkfs`——非本判据面） |
| 裸路径 ∧ 镜像不在（首建） | 不在 | 否 | `null` |
| 就绪（`ready`——健康径） | —— | 否 | `null`（零行） |

**自洽核查表（改后逐处实读——判据族零相抵）**

| 处 | 判据句要义（实读） | 自洽？ |
|---|---|---|
| `:118` | `rebuild`（有抹）/ `reconnect`（`stale` ∧ 镜像可用，零 `mkfs`）/ `null`（`absent` 无抹 ∥ `ready`）；重建/重接后失败由 `err.recovery` 携 | ✓（本轮收正） |
| `:113` | 自愈 = 卸 ⇒ 镜像可用 ⇒ **只重接** ∥ 缺失/缺 `project` ⇒ `truncate`+`mkfs` | ✓（与 `:118`「无抹 ⇒ 非 `rebuild`」逐义一致；`reconnect` 定义域 = `stale` 自愈径） |
| §13 B77 | 陈旧挂载（源 loop、UUID 不等、镜像具 `project`）⇒ `umount`→`losetup -d`→`mount`→`chown`→`chattr`；无 `mkfs`；`recovery = "reconnect"` | ✓ |
| §13 B81 | 外来挂载（源非 loop、镜像在且具 `project`）⇒ `umount`→`mount`→`chown`→`chattr`；零 `losetup -d`；`reconnect` | ✓ |
| §13 B83 | 裸路径 + 镜像在场缺 `project` ⇒ 抹掉既有镜像（`truncate`+`mkfs`）；`rebuild` ∥ 行在场 | ✓（②「有抹 ⇒ `rebuild`」正例） |
| §13 B84（新） | 陈旧挂载 + 盘上镜像不在 ⇒ `rebuild` ∥ 行在场 | ✓（⑤ 载体——旧 inode 内容不可再达 ⇒ 有抹） |
| N74 `:217` | 健康径三腿（含裸径腿 = 镜像不在的首建）⇒ 零变更性命令 + `recovery = null` + 零行 | ✓（与 `:118`「`null` 径」逐义一致） |
| KD-SV-200 `:296` | `rebuild`（有抹）/ 无抹 ⇒ 非 `rebuild`（`stale` ∧ 可用 ⇒ `reconnect`）/ `null` 径 = `absent`（首建 ∥ 镜像在场只挂载）∥ `ready`；重建/重接后失败由 `err.recovery` 携 | ✓（同 `:118` 同拍） |

**实读读数与行数随动（口径 = `\n` 换行计数；总行 = 换行数 +1）**

- `EXECUTION.md` **313/314 ⇒ 314/315**（+1 = B84 行）。
- §13 行序随动：B84 落 `:226` ⇒ E59/E60 = `:227`/`:228`；§14 头 `:230`（原 `:229`）、两档行 `:234`/`:235`（原 `:233`/`:234`）、行数读数段 `:259`（原 `:258`）；§15 KD-SV-200 `:296`（原 `:295`）。此后引坐标以段名 + 当刻复读为准（D4）。
- §13 现行集实读 = `N74 B77 B78 B79 B80 E58 B81 B82 B83 B84 E59 E60`。

**代码随正（实施轮/父侧另派——本席不动产品码）**

- **本轮零行为改动要求**：①（`stale` ∧ 可用 ⇒ `reconnect`）∥ ②（`absent` ∧ 镜像在场具 `project` ⇒ `null`）∥ N3（重接后失败由 `err.recovery` 携）——三者**实装现状已逐条相符**：`quota.mjs:218`（`recovery === null && verdict === "stale"` ⇒ `reconnect`）∥ `:212`（判据块只在 `missing || lackingProject` 内 ⇒ `absent` ∧ 具 `project` 径 `recovery` 保持 `null`）∥ `:224`（挂 `err.recovery` 不筛值 ⇒ 重接亦携）。
- **唯注释随正待办（doc-comment，非行为）**：`quota.mjs:14`（模块头）∥ `:193`（`applyLoopback` docstring）∥ `:212`（行尾注释）三处仍作「唯 `absent` ∧ 重建前镜像不在（首建）⇒ `null`」——同 ② 陈旧表述 ⇒ 随正为「`null` 径 = `absent`（首建 ∥ 镜像在场且具 `project` 的只挂载）∥ `ready`」。判据式 = §4 `:118` ∥ KD-SV-200（本段为准）。

**同因披露（超派单字面——本席未动，报父侧裁）**

- **`ACCOUNTS.md:74` 同因句**：`（**成功返回 ∥ 重建后下游失败两径皆落**——不因后续失败丢痕）` 与 N3 同因（只点重建、未含重接）。派单限「只动 `EXECUTION.md` 相应句」⇒ **本席未动**；建议同拍收正为「成功返回 ∥ 重建/重接后下游失败两径皆落」（设计席面·一行）。

**零新语义夹带**：①–⑤ + N1–N3 逐条由派单/#1531 直接派生；② 的「该径 = `null`」为派单点名「定案」项（判据 = `reconnect` 定义域落在 `stale` 自愈径内——沿 `:111`/`:113` 句结构，零新口径）；⑤ 的「载体 = §13 新行」为派单点名「定其载体」项（判据 = §13 = 用例表、一径一行，沿 B83 先例）。**超字面一处已披露**（`ACCOUNTS.md:74` 同因句——见上，未动）。

**回读（D6——写入后逐处复读）**：`EXECUTION.md` `:101` ✓ ∥ `:117` ✓ ∥ `:118` ✓ ∥ `:120` ✓ ∥ §13 B84 `:226` ✓（行集复读 `N74 B77 B78 B79 B80 E58 B81 B82 B83 B84 E59 E60`）∥ KD-SV-200 `:296` ✓；全文 grep「唯一 `null`」∥「卸除件用」∥「重建后下游」∥「B77–B83」**零命中** ✓。

**未落项 / 上抛**

- **[上抛·待裁] 派单 ① 括注与判据族相抵（本席未按字面落）**：派单 ① 括注作「**无抹 ⇒ 非本留痕判据面**（`recovery = "reconnect"`、**不落 `quota_recovered` 行**）」——「不落行」与 KD-SV-200（`EXECUTION.md:296`「命中 `reconnect` ⇒ 一行」）∥ `:118` 主句 ∥ `box.mjs:239/243`（`recovery` 非空即 `trace`）∥ 19/19 绿（含 B77 断言 `reconnect`）**相抵**；且派单 ② 自身亦书「无抹 ⇒ 非 `rebuild`（`null` ∥ `reconnect`）」⇒ `reconnect` 为有效 recovery 值。**本席按判据族落**「`reconnect` 落行（由主句规约）」；若父侧确欲「reconnect 不落行」= 语义变更（须改码 + 批内件 B77 期望值），请另裁另派。
- **[上抛·知会] 并行写者在场**：本轮触及 `EXECUTION.md` §4（`:101`/`:117`/`:118`/`:120`）∥ §13（B84 新行）∥ §15（`:296`）；行号因 +1 全表后移一位（见上「实读读数」）。
- **本轮零实施**：产品码/批内件/生成器 = 零改（①/②/N3 实装已相符，唯注释随正待办）。

**本段补正（fix 轮 3 · 同日 · eng-designer）——④ 行 §13 范围写法收正**

上段 ④ 行「§13 范围 `B77–B81` ⇒ `B77–B84`」写法不精确：**`B82` 属 ②（销毁）⇒ AC-2**，AC-1 的 §13 集**不含 `B82`**。精确写法 = **AC-1 枚举补 `11` ∥ `14` ∥ `14 附`；§13 范围 `B77–B81` ⇒ `B77–B81 ∥ B83–B84 ∥ E59–E60`**（AC-2 不变 = 用例 8 ∥ 9 ∥ 12（§13 E58 ∥ B82））。本补正取代上段 ④ 行该半句，其余逐条不变（回读实读：§13 行集 = `N74 B77 B78 B79 B80 E58 B81 B82 B83 B84 E59 E60`）。

**本段补正 2（fix 轮 3 · 同日 · eng-designer）——③ 表名计数随正**

上段 ③ 的表名「四径表」为旧名沿用（上文 fix 轮 2 原表 4 行）；本席表 **实为 7 行**（原 4 径按 `裁决 × 镜像在场 × 具 project` 拆分展开，新增 3 行：`stale` ∧ 在场 ∧ 具 `project` ⇒ `"reconnect"` ∥ 裸路径 ∧ 在场 ∧ 具 `project` ⇒ `null` ∥ `ready` ⇒ `null`）。此后引该表以「留痕路径表（7 行）」为准（行数实读 = 7）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：`thincoder/docs/batches/2026-10-16-box-quota-recovery.md` §2 设计（评审类型 = 设计评审；射程 = 该批档 + `sandbox/EXECUTION.md` + `sandbox/SANDBOX.md` + `accounts/ACCOUNTS.md`；另做 criterion 8 的落点实数抽验 = `src/sandbox/quota.mjs`（121 行）∥ `src/sandbox/box.mjs`（640 行）∥ `docs/batches/2026-10-15-server-mech-closeout.test.mjs`（421 行）∥ `public/views-audit.mjs` ∥ `public/i18n-{zh,en}-system.mjs` ∥ `docs/core/design/API-CONTRACT.md:3742-3747` + `scripts/api-contract.mjs`）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Feasibility / Acceptance criteria | 🔴 | 设计自造的 `stale` 态「外来挂载」（批档 `:58`「挂载源非 `/dev/loop<n>`（外来挂载）⇒ `stale`」；`EXECUTION.md:103` 同）无处置定义：自愈卸除件对任意 `<source>` 无条件发 `losetup -d`（批档 `:66`「**卸**（`umount <path>`（在挂才卸）+ `losetup -d <source>`）」），D 段明写「**失败一律抛**」（`:70`）而 B 段卸除零失败语义；同族安全口径反要求按归属收敛（`:106` KD-3 ∥ `EXECUTION.md:110`）；用例 1 只验判据输出、用例 2 入参是 loop 源 ⇒ 该态序列无用例（`:82`/`:83`） | 补规则（非 `/dev/loop` 源 ⇒ 只卸挂载零 detach，或仅正面判明属本工作区 loop 件才 detach）+ 卸除失败语义 + 一条该态的序列用例 |
| 2 | Affected files（criterion 8） | 🔴 | 新 kind `quota_recovered`（`:109` KD-6「理由：本 bug 的痛点正是「不可见」（同一墙撞多次、无人知）」）的审计面落点未入表：`views-audit.mjs:224` `SANDBOX_KIND_KEYS` 逐 kind 登记、`:231` 未知 kind 落原值、`i18n-zh-system.mjs:216` 同族两表；先例批把这类落点入表（`2026-10-15-server-mech-closeout.md:91`「`public/views-audit.mjs`（`SANDBOX_KIND_KEYS` +1）」）；而落点表 L1–L7（`:41`–`:47`）无此行，`:125` 还断言「**无 UI/交互面**（本批纯主机侧链路）。」 | 落点表补三行（views-audit.mjs ∥ i18n-zh/en-system.mjs，各 +1，标当前行数与 ≤±N）并改 `:125`；若有意不做文案（原值兜底）写明理由 |
| 3 | Acceptance criteria / Clarity | 🟡 | 零回归口径与自写机制相抵：`:33`「健康径零新增调用、零新增审计行。」+ `:98`「健康径零回归（用例 5/6）：两径 + 裸径序列逐条同现状；零 `quota_recovered` 行」对 `:66` 新探针「探（`mountpoint -q` ∥ `findmnt -no SOURCE -T` ∥ `test -f` ∥ `dumpe2fs -h` 读 UUID+features）」不成立（现状只有一条探 `quota.mjs:89`；用例 5 预期 `:86` 亦未列读件）；`:41`「① `parseFindmnt` 增 `source` 列（`:25-30`）」未给字段序/调用形，而现状唯一入参是 `findmnt -no TARGET,FSTYPE,OPTIONS -T`（`quota.mjs:108`） | 零回归口径改为「变更性命令 + 审计行零增」（沿用例 4 `:85` 的正确写法）并显式列新增只读件；给出新 `findmnt` 旗形与字段序，据此随正用例 5/6 |
| 4 | Acceptance criteria | 🟡 | 留痕与 KD-6 理由相抵：E 只在成功返回时落行（`:72`「`stepQuota` 于 `recovery !== null` 落一行 `sandbox_event/quota_recovered`」，写入点 = `box.mjs:228`-`:232`），破坏性重建在 `applyExt4` 之前（`:66`）而 `applyExt4` 首步即会抛（`quota.mjs:75`）⇒ 卷已重建却零痕 | 留痕绑物理动作（重建/重接即落行，或 `recovery` 挂抛出的错误由 `stepQuota` 落行）+ 一条「重建后 chattr 失败」用例 |
| 5 | Clarity / Acceptance criteria | 🟡 | 销毁径 fail-closed 的「未挂」语义未定：`:70`「① `mountpoint -q <path>` ⇒ 在挂则 `umount`（失败 ⇒ 抛）」+ `:107` KD-4「失败 ⇒ 抛」，而现状是 `box.mjs:524`「await host.call(runner, `mountpoint -q ${path} && umount ${path} || true`)」这条未挂也零退出的惯用形 ⇒ 按字面换 `host.run`/`step` 会让未挂（xfs/ext4 常态）也抛；用例 8/9 只给在挂入参（`:89`） | 补判据句（未挂 = 过、零动作、不抛）+ 命令形（保两段探）+ 一条「销毁 + 路径未挂」用例 |
| 6 | Clarity / Acceptance criteria | 🟡 | 降级腿（C）三处未定：① `:68`「判据 = 该步的**步标签**」两径同标签（`applyLoopback` 复用 `applyExt4`（`quota.mjs:96`），项目标记步标签同为 `quota.mjs:75` 的 `"ext4 项目标记"`）⇒「降 loopback 径一次」守卫未写；② 降级后新 fs 盖挂路径（`:66`）使原目录内容从盒视角不可达，披露只及镜像侧（`:105` KD-2）；③ 无「loopback 径自身项目标记失败」用例 | 写明守卫（限 `ext4-project` 那次调用；再失败 ⇒ 停不再降）+ 补用例 + 把「盖住路径内容」写进披露 |
| 7 | Document ownership（doc-state） | 🟡 | L4 与落盘形不符：`:44`「| L4 | … | `:73` 「配额一件」 | 同句追加 `quota_recovered`（detail 键集） | ±0（同行追加） |」，盘上是独立行 `ACCOUNTS.md:74`；O-4 同指旧坐标（`:117`），本批回读已记 `:74`（`:138`） | L4 两列 + O-4 坐标收正为 `:74` 独立行形 |
| 8 | Affected-file size annotations（criterion 8） | 🟡 | box.mjs 行数标注不自洽：`:42`「640 行（内容行 667，越 500 软线在册）」——内容行 > 总行数（实读 640），改后「**≈ +14 ⇒ ≈ 681 行**（内容行）」只能由 667 推出（640+14 ≈ 654）；同档 `EXECUTION.md:225` 用「**639/640**」形 ⇒ 同一文件三种数 | 统一到 §14「读/总」形并让算式与前值一致（640 → ≤654），或明写「内容行」定义与读数命令 |
| 9 | Affected files / Test coverage（criterion 8） | 🟡 | 既有单测件未入表、亦无「不受影响」声明：`docs/batches/2026-10-15-server-mech-closeout.test.mjs`（421 行）经 `createWorkspaceBox` 驱动 ② 配额步，假主机硬编当前读数形（`:62`/`:65` `/var/lib/tc/workspaces ext4 rw,relatime,prjquota`）；本轮改探针与 `parseFindmnt` 字段面后该假件是否仍表达现状未判 | 补该件（当前行数 + `≤±N`／「结构不变」）或写明「既有单测件零改」的判据 |
| 10 | Doc hygiene / numeric drift | 🔵 | O-3 坐标未随并行写者收正：`:116`「`EXECUTION.md:204/:229` 在册」；盘上 = `:225`-`:226` ∥ `:250`（本批补正段 `:136` 已记） | 改写为 `:225`-`:226` 或径引 §14 段名 |
| 11 | Methodology / review limitation | 🔵 | 无项目标准档、无文档地图 ⇒ 判据 3/7 仅按 `AGENTS.md` 判；需求档引用（`:123`）不在射程 ⇒ unverified。判据 9/10 已满足（`:74` 先例行含偏离与理由 ∥ `:76` 勘察证据行含「零声明源」明记） | 需求档引用由父侧以当刻盘面复读；先例行/勘察证据行无需改 |

**已核（无发现）**：落点坐标抽验逐处命中——`quota.mjs:121`（`:25-30` ∥ `:49-53` ∥ `:87-97` ∥ `:110-117`）∥ `box.mjs:640`（`stepQuota` = `:226-233`、三链 = `:310`/`:336`/`:379`、销毁 = `:505`/`:520-526`/`:523-525`）∥ `API-CONTRACT.md:3742-3747`（六符号）+ `scripts/api-contract.mjs` 在案 ∥ `ACCOUNTS.md:74` 键集与 E 段/`EXECUTION.md:115` 三值域同形 ∥ `EXECUTION.md` §2.2 `:40`／§3 `:57`／§13 `:214-219`／§15 KD-SV-196…200 在场 ∥ `host.run` 抛语义在案（`box.mjs:82-88`）⇒ 「`rm -rf` 改 `host.run`」可行。

计数：🔴 2 ∥ 🟡 7 ∥ 🔵 2（合计 11）。

VERDICT: changes-required

### 轮次 2（评审子代理）

**轮次 2 复核**：射程 = 批档 §2（含 fix 段）全文 ∥ `sandbox/EXECUTION.md` 全文 ∥ `sandbox/SANDBOX.md` ∥ `accounts/ACCOUNTS.md`；criterion 8/9 抽验件实读 = `src/sandbox/quota.mjs`（121 行）∥ `src/sandbox/box.mjs`（640 行）∥ `docs/batches/2026-10-15-server-mech-closeout.test.mjs`（421 行）∥ `public/views-audit.mjs`（271/272）∥ `public/i18n-{zh,en}-system.mjs`（各 221/222）∥ `docs/batches/*.test.mjs` 全域（`SANDBOX_KIND_KEYS`/`AUDIT_TYPES`/`i18n-zh-system`/`sandboxKind` 零命中——只命中 .md 与 `.thincoder/tmp/**`）∥ 先例批 `2026-10-15-server-mech-closeout.md:192`（+1 kind 同形「测试链随正 = 不涉」形，评审已 pass）。

**前表裁定（11 条）**

| Orig# | 状态 | 核实 |
|---|---|---|
| 1 🔴 | Fixed | `EXECUTION.md:105`「② 挂载源非 `/dev/loop<n>`（外来挂载）⇒ `stale`（**处置 = 只卸挂载、零 detach**——归属判据见卸除件）」∥ `:112` 卸除件（仅「源为 `/dev/loop<n>` 且其 back-file 属本工作区镜像」才 detach；外来/不可得/不等 ⇒ 零 detach；非零 ⇒ 抛）∥ `:290` KD-SV-196 ∥ `:223` 新用例 **B81**（序列 = `umount` → `mount -o loop,prjquota` → `chown` → `chattr`；零 `losetup -d`；`recovery = "reconnect"`）∥ 批档 fix 段 `:147` + 用例 10（`:173`） |
| 2 🔴 | Fixed | 落点表补 **L8/L9/L10**（`:163`-`:165`）= `views-audit.mjs` 271/272（`:224` 同族形 ∥ `:231` 原值兜底）+ 两 i18n 221/222（`:216`）；实读核过（`views-audit.mjs:224` = `quota_apply_failed: "audit.sandboxKind.quota_apply_failed",` ∥ `:231` = `return SANDBOX_KIND_KEYS[kind] ? t(SANDBOX_KIND_KEYS[kind]) : String(kind ?? "—")` ∥ `i18n-zh-system.mjs:216` = `"audit.sandboxKind.quota_apply_failed": "磁盘配额应用失败",`；总行 272 ∥ 222 同）；`:125` 句撤（fix 段 `:148`）∥ AC-4 增三件行扫描（`:180`）∥ 测试链「不涉」沿先例形——在盘批内单测件实扫零命中 ✓ |
| 3 🟡 | Fixed | `EXECUTION.md:117` 口径改「**变更性命令零增**（`umount` ∥ `losetup -d` ∥ `truncate` ∥ `mkfs` ∥ `mount` ∥ `chown` 六族）+ **审计行零增**；新增唯只读读件」∥ `:101`/`:102` 旗形 = `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T <path>`、`parseFindmnt` 出参序 = `{ mount, source, fstype, options }` ∥ `:217` N74 随正 |
| 4 🟡 | Fixed | `EXECUTION.md:118`「**绑定物理动作**：卷已重建/重接 ⇒ 行必落——成功返回时由返回值携 `recovery`；**重建后下游步失败时由错误携 `err.recovery`**」+ `:225` 新用例 **E59**；`ACCOUNTS.md:74` 写入点句已随（「成功返回 ∥ 重建后下游失败两径皆落——不因后续失败丢痕」✓ 实读在盘） |
| 5 🟡 | Fixed | `EXECUTION.md:119`「① 在挂则 `umount`（**未挂 ⇒ 零动作、不抛**——xfs/ext4 径常态）」∥ `:57` 销毁行 ∥ `:224` 新用例 **B82** ∥ `:293` KD-SV-199 |
| 6 🟡 | Fixed | `EXECUTION.md:100`（守卫 = 仅 `ext4-project` 径该次调用降；再失败 ⇒ 停；**披露** = 降级落 loopback ⇒ 新 fs 盖住工作区路径 ⇒ 原目录内容从盒视角不可达）∥ `:226` **E60** ∥ `:292` KD-SV-198 |
| 7 🟡 | Fixed | fix 段 `:153`：L4 收正 = `ACCOUNTS.md:74` 独立行形 + O-4 坐标同收；盘面实读 `ACCOUNTS.md:74` = 「**配额自愈一件**：`quota_recovered`（detail 键集 = …」✓ |
| 8 🟡 | Fixed | fix 段 `:154`：L2 = 639/640 ⇒ ≈653/654 ∥ L1 = 120/121 ⇒ ≈215/216（「内容行」表述撤；口径 = `\n` 换行计数）；盘面实读 `EXECUTION.md:232`/`:233` = `box.mjs`「**639/640**」∥ `quota.mjs`「**120/121**」✓ |
| 9 🟡 | Fixed | fix 段 `:155` + 落点表 **L11**（`:166`）= `docs/batches/2026-10-15-server-mech-closeout.test.mjs` 421 行、`±≤3`、假件 `:65` 读数行补 `SOURCE`（断言零改）；实读核过（421 行 ∥ `:62` = `if (command.includes("findmnt")) {` ∥ `:65` = 3 字段硬编行） |
| 10 🔵 | Fixed | fix 段 `:156` + 补 `:186`：坐标收正 = `EXECUTION.md:232-233`（§14 两行）∥ `:257-259`（行数读数段），并立「凡引 §14 以段名为准」口径；盘面实读同 ✓ |
| 11 🔵 | Accepted | 父侧裁「不动」（评审面限制说明：无标准档/无文档地图；需求档引用射程外）。理由成立（射程事实，非设计缺陷）——闭项 |

**新发现（本轮）**

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| N1 | Doc consistency / AC 挂载 | 🟡 | fix 段 AC 随正行自相抵：`…box-quota-recovery.md:180`「AC-1（①）= 用例 1–4 ∥ 7 ∥ 10 ∥ 13（§13 B77–B81 ∥ E59–E60）」——括号点了 E59，枚举缺 **11**（`:174`「| 11 | 错误 | 陈旧挂载 ⇒ 重建（`mkfs`）后项目标记步 `exit≠0`」，映射 `:178`「11 ⇒ E59」）⇒ ④ 号发现（留痕绑物理动作）的唯一「重建后失败」用例未挂任何 AC（AC-2 = 8/9/12 ∥ AC-3 = 5/6 ∥ AC-4 = 文档扫描） | AC-1 枚举补 `11`（或明书 11 ⇒ AC-1 的 E59 腿） |
| N2 | Clarity | 🔵 | `EXECUTION.md:101` 把 `losetup -a -O NAME,BACK-FILE -n` 注为「（loop 归属读数——卸除件用）」，而 `:117` 书「loopback 腿另加 `mountpoint`/`test -f`/`dumpe2fs`/`losetup -a`」——同一读件的阶段归属两说；健康径读数集未钉（`:220` B79「两例序列皆**零** `umount`/`losetup -d`/`mkfs`/`mount`；`recovery = null`」只断言零变更性命令） | 明书 `losetup -a` 仅卸除阶段读（stale 径）∥ 或把健康径只读件清单钉进 B79 |
| N3 | Clarity | 🔵 | `EXECUTION.md:118` 的错误携句只点重建：「**重建后下游步失败时由错误携 `err.recovery`**」，其上句规约是「卷已重建/重接 ⇒ 行必落」——**重接后下游失败**是否落行未明（E59 只覆盖重建腿） | 收正为「重建/重接后下游失败皆由错误携」（或明书重接不落行） |

计数：🔴 0 ∥ 🟡 1 ∥ 🔵 2（合计 3）；前表 = Fixed 10 ∥ Accepted 1（无 Unfixed）。

VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成（L1/L2/L5/L6/L8–L10 已落；L11 无对象；fix 轮 1–3 已落（fix 轮 3 = quota.mjs 三处注释随正、零改码、19/19 绿）；批内件待 §6 收口轮用毕即删）



### 实施记录（2026-10-16 · eng-coder）

**交付摘要**：建盒配额步自愈（判据升级 + 卸除/重接/重建 + 降级腿 + 自愈留痕）+ 销毁径清 loop/挂载（卸除件 + fail-closed 删目录与镜像）。改动 = L1/L2 产品码 ∥ L5 生成器重跑 ∥ L6 批内件 ∥ L8–L10 审计面三件；L11 无对象（见披露 ①）。

**落点逐条（实读读数——2026-10-16 当刻盘面；口径 = `\n` 换行计数/总行）**

| 落点 | 文件 | 改动（file:line） | 行数（前 ⇒ 后） |
|---|---|---|---|
| L1 | `thincoder-server/src/sandbox/quota.mjs` | `parseFindmnt` +`source` 列 `:38`；`parseLoopdevices` `:46`；`classifyLoopbackMount` `:75`（六判据逐序）；读件 `:121-142`；`detachOwnedLoops` `:156`；`applyLoopback` 重写 `:192-220`；`demoteToLoopback` `:225`；`applyDiskQuota` 降级腿 + `recovery` `:236-258`；`releaseLoopbackVolume` `:266`；`step` 增 `err.stepLabel` `:96` | 120/121 ⇒ **279/280** |
| L2 | `thincoder-server/src/sandbox/box.mjs` | 导入 `releaseLoopbackVolume` `:23`；`stepQuota` 两径落行 `:225-245`；销毁卷清理 `:532-539`（卸除件 + `rm -rf` 走 `host.run`） | 639/640 ⇒ **652/653** |
| L5 | `docs/core/design/API-CONTRACT.md` | 生成器重跑（`node scripts/api-contract.mjs --write`）——生成区整区替换（4268 条）；新增三导出在场 `:3750-3754` | 机械（生成区） |
| L6 | `docs/batches/2026-10-16-box-quota-recovery.test.mjs` | 新建（用例 1–13 ⇒ 15 个 test 块）——**用毕即删** | 0 ⇒ **439/440** |
| L8 | `thincoder-server/public/views-audit.mjs` | `:224` 增 `quota_recovered` 键（`SANDBOX_KIND_KEYS`） | 271/272 ⇒ **272/273** |
| L9 | `thincoder-server/public/i18n-zh-system.mjs` | `:216` 增键（值 = 「磁盘配额自愈」） | 221/222 ⇒ **222/223** |
| L10 | `thincoder-server/public/i18n-en-system.mjs` | `:216` 增键（值 = `Disk quota recovered`——**en 零 CJK**） | 221/222 ⇒ **222/223** |
| L11 | `docs/batches/2026-10-15-server-mech-closeout.test.mjs` | **不做**（该件不在盘——披露 ①） | —— |

**验证读数（命令 ∥ 结果）**

| # | 命令 | 结果 |
|---|---|---|
| 1 | `node --test docs/batches/2026-10-16-box-quota-recovery.test.mjs`（仓根） | **tests 15 ∥ pass 15 ∥ fail 0**（0.32s） |
| 2 | `node --check` × 6（quota.mjs ∥ box.mjs ∥ views-audit.mjs ∥ i18n-zh/en-system.mjs ∥ 批内件） | 六件全 OK |
| 3 | `npm run prepublishOnly`（`thincoder-server/`） | exit 0（CI server 门禁三条 `node --check` 过） |
| 4 | `node scripts/api-contract.mjs --check`（重跑后） | 生成区 = 源（三导出行 3750/3751/3754 在场） |
| 5 | 审计面行扫（AC-4） | `views-audit.mjs:224` ∥ `i18n-zh-system.mjs:216` ∥ `i18n-en-system.mjs:216` 三行在场 |
| 6 | 文档在职行扫（AC-4——设计档，非本席笔） | `EXECUTION.md` §4 `:100`（KD-SV-198）∥ `:103`（KD-SV-196）∥ `:111-112`（KD-SV-197）∥ `:118`（KD-SV-200）∥ `:119`（KD-SV-199）∥ §13 `:217-227`（N74 ∥ B77–B83 ∥ E58–E60；B83 落 `:225` ⇒ 范围尾随正）∥ §15 `:291-295`（KD-SV-196…200；同因随正——B83 插行后移一位）∥ `ACCOUNTS.md:74` ∥ `SANDBOX.md:531` 全在场 |
| 7 | 回读（D6——写入后逐处复读） | quota.mjs 全文 ∥ box.mjs `:23`/`:225-245`/`:532-539` ∥ 三审计面行 ∥ 批内件——与改动意图一致 |

**真机前置核（O-5——2026-10-16 于 runner 机 `10.0.0.6`（`ssh -i ~/.ssh/thincoder_ecs thincoder@10.0.0.6`）逐条实跑；只读）**

| # | 命令 | 实读形 | 判 |
|---|---|---|---|
| 1 | `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T /var/lib/thincoder/workspaces/12` | `/var/lib/thincoder/workspaces/12 /dev/loop32 ext4   rw,relatime,prjquota`（四列 = TARGET ∥ SOURCE ∥ FSTYPE ∥ OPTIONS） | **形对**（`parseFindmnt` 出参序逐位） |
| 1b | 同形未挂路径 ⇒ `TARGET = /`（祖先挂载）∥ 不存在路径 ⇒ `exit=1` 空输出 | 与判据①「`mountTarget !== path` ⇒ `absent`」一致 | **形对** |
| 2 | `dumpe2fs -h /var/lib/thincoder/workspaces/12.loop.img` | `Filesystem UUID: ba1c23b6-…` ∥ `Filesystem features: … quota metadata_csum project`（含 `project`）；**镜像文件 = 非 root 可读**；`/dev/loop32` = `brw-rw---- root disk` ⇒ 设备侧读需提权（server 侧命令走提权口——`sudo_cipher` 在 ⇒ `sudo -S`） | **形对**（镜像侧读成立；设备侧读未以非 root 复证——如实记） |
| 3 | `losetup -a -O NAME,BACK-FILE -n`（util-linux 2.37.2） | `/dev/loop32 /var/lib/thincoder/workspaces/12.loop.img` ∥ `/dev/loop29 /var/lib/thincoder/workspaces/2.loop.img (deleted)`（NAME 列后空白分隔、列对齐；`-n` 无表头；非 root 可读） | **形对**（`parseLoopdevices` 首段空白分割 + ` (deleted)` 剥尾缀） |
| 附 | 事故现场同刻实读 | `/12` 挂 `/dev/loop32`（Oct 14 12:24）∥ 盘上镜像 mtime Oct 16 00:24（重写）⇒ **判据⑤（两侧 UUID 不等）即真实命中面**（镜像侧具 `project` ⇒ 判据④不触发） | 判据与现场一致 |

**关键实现点（决策透明）**

- **判据①用 findmnt 的 `TARGET`**（非 `mountpoint` 退出码）：未挂 ⇒ `TARGET` = 祖先挂载点 ≠ 工作区路径 ⇒ `absent`（真机 1b 已核）；`mountpoint -q` 只作「在挂才卸」的读（§4 读件表两件各司其职）。
- **挂载侧/镜像侧读数分工**：`findmnt`（严格读——`step`，探明步已证可达）⇒ `mountTarget`/`source` 恒可读；`dumpe2fs`（容忍读）⇒ UUID/特性，不可得 ⇒ `null` ⇒ 判据④⑤不成立 ⇒ `ready`（安全性质：不新造破坏性重建面）。
- **`recovery` 语义**：`stale` 自愈 ⇒ `reconnect`（只重接）∥ `rebuild`（走 `mkfs`）；`absent`（首次就位——含裸路径）∥ `ready` ⇒ `null`（非常态、零痕——用例 5 期望值）；降级腿 ⇒ `demote`（外层裁，含内层重接/重建）。
- **失败留痕两径**：物理动作（重接/重建/降级）已发生 ⇒ 行必落——成功返回携 `recovery`；下游（`chattr`/读回核）失败 ⇒ 错误对象挂 `err.recovery` ⇒ `stepQuota` 两径皆落（用例 11/13 断言双行在场）。
- **降级腿守卫**：判据 = 步标签 `"ext4 项目标记"`（模块内单一源常量 `EXT4_PROJECT_STEP`）；只有 `ext4-project` 径那次调用有 try/catch ⇒ 降一次；loopback 径自身失败直接上抛（零第二次降级——用例 13 断言 `chattr` 两次、`mkfs` 一次）。
- **销毁径卸除件与删除分工**：`releaseLoopbackVolume` = 卸挂载 + 归属 detach（用例 8 期望序列不含 `rm -rf`）；`rm -rf <path> <path>.loop.img` 由 `box.mjs` 走 `host.run`（fail-closed）——与披露 ③ 同因。
- **归属判据单源**：`backFileOfRow`（剥 ` (deleted)` 尾缀）等于 `<path>.loop.img` ⇒ 自愈（限 `source` 一件）与卸除件（全部归属件）共用；他工作区/外来 loop 零动（用例 8 断言不含 `/dev/loop40`）。
- **零回归口径**：健康径变更性命令零增（xfs 三句 ∥ ext4 三句 ∥ 裸径 `truncate`+`mkfs`+`mount`+`chown` 逐条同现状）+ 审计行零增（盒级用例断言 `audit_events` 仅 `workspace_create`）；新增唯只读读件（`findmnt` 补 `SOURCE` 列 ∥ `mountpoint`/`test -f`/`dumpe2fs`/`losetup -a`）。**零行为变化**：`parseFindmnt` 增列、`applyDiskQuota` 增 `recovery`、`step` 增 `stepLabel` 皆加性（全仓 grep 实读：两函数无本链外消费者）。

**披露（不自行改设计档/批档口径——交由设计席/父侧裁）**

1. **[上抛·知会] L11 无对象**：`docs/batches/2026-10-15-server-mech-closeout.test.mjs` **不在盘**（全仓 glob 零命中；`git log` 该路径零提交；`docs/batches/*.test.mjs` 全域 grep `findmnt`/`createWorkspaceBox`/`prjquota`/`losetup` 零命中）——合理解释 = 前批 16:42 收口按「单测件用毕即删」删除（设计/评审 16:39 读到时它还在）。本席**不新建**该件（新建 = 他批单测件，越界）；后果 = `parseFindmnt` 增列**零回归风险**（无既有假件需随正）。
2. **挂载侧 UUID 读件未入 §4 读件表**：§4 `:101` 的读件表只列 `dumpe2fs -h <path>.loop.img`（镜像侧），而判据⑤需**挂载侧** UUID（批档 `:55` 入参含 `mountUuid`）。本席实现 = `dumpe2fs -h <source>`（同命令、源取自 `findmnt` 的 `SOURCE`；仅当源为 `/dev/loop<n>` 时才读——外来挂载零外读）。**建议设计席**把该读件补进 §4 读件表（判据⑤的取数来源当前靠读者自推）。
3. **`rm -rf` 归属两说**：§4 `:119` 把「③ 删目录与镜像」列进**卸除件**句内，而 L2/用例 8（§2）把它放在 `box.mjs` 销毁步（`rm -rf` 改 `host.run`）。本席按**L2 + 用例 8** 落（卸除件 = 卸挂载 + detach；`rm -rf` 在 `box.mjs`）——理由：`host.run` 属 `box.mjs` 面、且用例 8 对 `releaseLoopbackVolume` 的期望序列不含 `rm -rf`。**建议设计席**收正 §4 `:119` 的句子归属（当前句内 ③ 与实现分层相抵——不影响语义：销毁全程仍 fail-closed）。
4. **行数估形偏差（实读收正——设计席面）**：`quota.mjs` 实读 **279/280**（设计估形 ≈215/216，超估 ≈64——判据/读件/归属/降级四件比估形厚）；`box.mjs` **652/653** ✓（估 ≈653/654）；批内件 **439/440**（估 ≈300）。`SANDBOX.md:531` 与 `EXECUTION.md` §14 的 `quota` 行仍作 `120/121` ⇒ 需以本读数收正（本席不改设计档）。
5. **销毁 detach 与挂载态无关**（实现口径，与用例 12 输入无抵）：路径未挂时仍读 `losetup -a` 并按归属 detach——AC-2「销毁后零残留」要求覆盖「挂了又卸、loop 仍在」态；用例 12 的输入（xfs/ext4 径常态）本无归属 loop ⇒ 其「零 `losetup -d`」期望按归属判据自然成立。
6. **真机设备侧读未以非 root 复证**（如实记）：`dumpe2fs -h /dev/loop32` 以 `thincoder` 跑得 `Permission denied`（设备 `brw-rw---- root disk`）⇒ 判据⑤在**未提权**部署下退化为不触发（归 `ready`——安全性质零动，但陈旧挂载不被自愈）。本批运行环境（runner 行有提权口）不触发该退化；是否需要「无 root ⇒ 另设判据」= 设计席/父侧裁。

**边界（未越）**：未动出站/egress 闸 ∥ 网络面 ∥ 镜像族 ∥ 容器载荷 ∥ 命名卷族 ∥ 快照/恢复链 ∥ 放置与定时器 ∥ 需求档；既有 7 处 `(deleted)` 残留零触（人工处置，不在本批）；**零调** `node scripts/doc-check.mjs`（12:10 禁调令）。

**零残留**：`.thincoder/tmp/loopcheck.sh` ∥ `probe6.sh`（本席真机核用临时件）已删；批内单测件待 §6 收口轮按「用毕即删」处置（§6 未落地 ⇒ 本批未完）。

### 修正记录（fix 轮 1 · 2026-10-16 · eng-coder）

**输入** = 两轮内部复核：(a) 背离审计（explore，1 轮）2 条；(b) 代码评审（advisor——轮次 1 VERDICT **pass**（10 条发现）∥ 轮次 2 复核修复声明 VERDICT **pass**（1 条新值层发现））。本段与上文相抵处以本段为准（§5 append-only——原行不改）。

| 轮 | # | 发现（简） | 处置 | 改动 file:line |
|---|---|---|---|---|
| 审计 | 1 | API-CONTRACT 生成区行号漂移（`applyDiskQuota` 记 `:238`、`releaseLoopbackVolume` 记 `:269`；盘上实读 `:239`/`:270`——生成器跑在末次改码之前） | 码定稿后重跑生成器；复核 `--check` = 骨架零漂移（4268 条 · 855 档） | `docs/core/design/API-CONTRACT.md` 生成区（`node scripts/api-contract.mjs --write`）；quota 行现 = `:3746-3754` |
| 审计 | 2 | **第三态误触破坏性重建**：`applyLoopback` 原 `else` 分支把「镜像在场 ∧ 特性读数不可得」也送进 `truncate`+`mkfs`——与 KD-SV-196 安全性质相抵（`EXECUTION.md:290` 自记「读不到就重建 ⇒ 读件形错一次即抹掉全部工作区卷」）；可触达径 = 判据②/⑤ 判 `stale` ∧ 镜像侧特性读不可得 | 重建限定两态（`missing` ∥ `lackingProject`），其余 ⇒ 只重接（保镜像；确缺 `project` ⇒ 下游 `chattr` 失败原样上抛，可见不静默） | `quota.mjs:206-213`（两态守卫）∥ `:216-219`（只重接腿）；新用例 `docs/batches/2026-10-16-box-quota-recovery.test.mjs:197` |
| 评审 | 3 | 留痕窗口窄于 §4 `:118`（「重建后下游步失败时由错误携 `err.recovery`」）：`recovery` 赋值在重建/重接之后而 `try` 只包 `applyExt4` ⇒ 「`mkfs` 成 ∧ `mount`/`chown` 失败」零 `quota_recovered` 行 | 留痕改绑**物理动作完成点**（`mkfs` 成 ⇒ `rebuild`；重接挂成 ⇒ `reconnect`），`try` 上提覆盖「挂载/属主/ext4 径/读回核」——其后任一步失败 ⇒ `err.recovery` 携 | `quota.mjs:212`（`recovery = "rebuild"` 提前）∥ `:215-226`（`try` 上提 + `:218` 重接完成点）；新用例 `批内件:410` |

**坐标随正（fix 轮后实读——取代本 §5 上表 L1 行内坐标；此后凡引以段名 + 当刻复读为准）**：`quota.mjs` = `PROJECT_ID_BASE:21` ∥ `LOOP_IMAGE_SLACK_MB:24` ∥ `LOOP_DEVICE_RE:27` ∥ `projectIdOf:33` ∥ `parseFindmnt:38` ∥ `parseLoopdevices:46` ∥ `readable:59` ∥ `hasProjectFeature:64` ∥ `classifyLoopbackMount:75` ∥ `expectedBlocks:85` ∥ `withinOneBlock:90` ∥ `tail:95` ∥ `step:101`（`err.stepLabel:105`）∥ `readFs:112` ∥ `probeLoopback:124` ∥ `backFileOfRow:146` ∥ `detachOwnedLoops:151` ∥ `applyXfs:161` ∥ `applyExt4:178` ∥ `applyLoopback:198` ∥ `demoteToLoopback:231` ∥ `applyDiskQuota:245` ∥ `releaseLoopbackVolume:276`。

**行数实读随正（fix 轮后）**：`quota.mjs` = **285/286**（本 §5 上表记 `279/280`）∥ `box.mjs` = **652/653**（不变）∥ 批内件 = **479/480**（上表记 `439/440`）。

**验证读数（fix 轮后重跑）**：`node --test docs/batches/2026-10-16-box-quota-recovery.test.mjs` ⇒ **tests 17 ∥ pass 17 ∥ fail 0**（0.30s）∥ `node --check` 六件 OK ∥ `node scripts/api-contract.mjs --check` ⇒ 骨架零漂移 ∥ 审计面三行 + 文档在职行扫（本节验证表 #5/#6）不变。

**未采纳项（如实列 · 皆报告态）**：评审 #2（`EXECUTION.md:119` 归属句——设计档非本席笔）∥ #4（§14 行数——设计档 + 并行批次面）∥ #5（§4 读件表补挂载侧 `dumpe2fs`——设计席面）∥ #6（AC-5 真机腿 = 父侧 §6 收口轮）∥ #7（判据⑤未提权退化 = 设计席裁）∥ #8（`box.mjs` 行数在册）∥ #9（批内件假 `run` 不返判退出码——该腿实现 = `box.mjs:82-88` 既有 `host.run`，本批只改调用点（`host.call` ⇒ `host.run`），风险面属既有机制；批内件聚焦本批新增语义）∥ #10（loopback 径重复只读 `findmnt`——留设计席收 §4 读件表）∥ 轮次 2 新发现（**值层**：裸路径 ∧ 镜像正面缺 `project` ⇒ `mkfs` 已抹盘而 `recovery` 仍 `null`／零行——属设计未覆盖子态（`absent ⇒ null` 由 §13 N74 与本节 `recovery` 语义行明书），改则与 N74 期望值相抵 ⇒ 交设计席/父侧裁）。

**零新语义夹带**：三条改动皆由发现直接派生（审计①=机械重跑；审计②=判据只允许两态（设计原文 KD-SV-197）；评审③=§4 `:118` 的「绑物理动作」）。

### 修正记录（fix 轮 2 · 2026-10-16 · eng-coder）

**输入** = 父侧 fix 轮派单（点修三处）：设计席 #85 已把 **(A) 值层留痕缺口** 定案落档（`EXECUTION.md:118` 判据句 ∥ `:225` 新用例 **B83** ∥ `:217` N74 括注 ∥ `:295` KD-SV-200），**代码与批内件随本段落**。本段与上文相抵处以本段为准。

**① 判据改绑（值层留痕缺口闭合）**：`quota.mjs:212` = `if (verdict === "stale" || !missing) recovery = "rebuild"`（改前 = `verdict === "stale"` 单判）——判据由「绑裁决名」改绑「**是否抹掉既有内容（重建前镜像在场）**」，与 `EXECUTION.md:118` 逐字同义；该行只在 `:209` 的 `missing || lackingProject` 块内 ⇒ 只在真跑 `mkfs` 时求值。三处注释同拍随正：模块头 `:14` ∥ `applyLoopback` docstring `:193`（括注实装式）∥ `:212` 行尾。**副带收益**：`absent` ∧ 镜像在场缺 `project` 径若 `mkfs` 成而后下游（挂载/属主/读回核）失败 ⇒ 错误现携 `err.recovery = "rebuild"`（`:224`）⇒ `box.mjs:239` 落行——此前该径零痕。

**② 批内件**：补 **用例 14 = B83**（盒级：裸路径 + 镜像在场缺 `project` ⇒ `truncate`→`mkfs`→`mount`→`chown`→`chattr`；`quota_recovered`（`recovery = "rebuild"`）行在场）∥ 补 **用例 14 附**（判据四径第三径：`stale` ∧ 重建前镜像**不在** ⇒ `rebuild` + 行在场——四径中此前唯一无用例者）∥ 表头 `:3` 随正（`用例 1–14` ∥ `B77–B83`）。

**③ 批档 §5 在职行扫行收正**（同一行）：`B77–B82` ⇒ `B77–B83`；**同因两处一并收**（披露）= §13 坐标 `:217-226` ⇒ `:217-227`（B83 插行后移）∥ §15 `:290-294` ⇒ `:291-295`（同因 +1）。

**内部审计 / 代码评审轮次与终态**

| 轮 | 角色 | 结论 |
|---|---|---|
| 背离审计 ×1 | explore（只读） | **四类偏差零发现**（判据同义 ∥ 落点 = 派单三处 ∥ 无设计档漂移 ∥ 用例 14 真走 B83 支路，空序列骗不过）。四条低severity观察中：① 用例 14 缺 `chattr` 显式断言 ⇒ 本轮补断言；③ §15 坐标同因陈旧 ⇒ 随正 ③；②（四径表第 2 行）∥ ④（`absent` ∧ 在场 ∧ 具 `project` 径未列未测）⇒ 上抛，未自裁 |
| 代码评审 ×1 | advisor（轮次 1） | **VERDICT: pass**——零 🔴；4 🟡 + 2 🔵 全属文档层（§5 本轮记录缺失 = 本段即补 ∥ §2 `:200` 四径表第 2 行与设计档 `:113`/B77/用例 2 相抵 ∥ `EXECUTION.md:118`「唯一 `null` 径」未覆盖「`absent` ∧ 在场 ∧ 具 `project`」的只挂载径 ∥ 批内件越 500 软线）——**零代码改动要求** |

**终态 = `clean`**（无未闭合代码项；审计/评审所报非代码项一律如实上报，未自行改设计档或批档他段）。

**验证读数**（cwd = 仓根 `thincoder/`；口径 = `\n` 换行计数 ∥ 总行 = 换行数 + 1）

| # | 命令 ∥ 读数 | 结果 |
|---|---|---|
| 1 | `node --test docs/batches/2026-10-16-box-quota-recovery.test.mjs` | **tests 19 ∥ pass 19 ∥ fail 0**（0.36s；含新用例 14 ∥ 14 附） |
| 2 | `node --check` 两件（`quota.mjs` ∥ 批内件） | 两件 **Syntax OK** |
| 3 | 行数实读 | `quota.mjs` **285/286**（不变——判据/注释皆原位替换、零行增删）⇒ 与 `EXECUTION.md` §14 ∥ `SANDBOX.md` §13 同值，**零漂移** ∥ 批内件 **540/541**（19 个 test 块） |
| 4 | 回读（D6——写入后逐处复读） | `quota.mjs:14`/`:193`/`:212` ∥ 批内件 `:3`/`:483-513`/`:516-540` ∥ §5 在职行扫行——与改动意图一致 |

**四径对表（可机检——新判据验收）**：① `absent` ∧ 镜像不在 ⇒ `null`（用例 5 `:266`）∥ ② `absent` ∧ 镜像在场 ∧ 正面缺 `project` ⇒ `rebuild` + 行在场（用例 14 `:501`）∥ ③ `stale` ∧ 镜像在场（判据④）⇒ `rebuild`（用例 3 ∥ 用例 11 `:405`）∥ ④ `stale` ∧ 镜像不在 ⇒ `rebuild` + 行在场（用例 14 附 `:536`）。旁证「`stale` ∧ 镜像在场且具 `project` ⇒ `reconnect`、零抹盘」= 用例 2 `:162`（设计档 §13 B77）。

**上抛（如实列）**

- **[上抛·知会] 一条文本相抵（已上抛）**：批档 §2 fix 轮 2 四径表第 2 行（`stale` ∧ 镜像在场（判据②/④/⑤）⇒ 内容被抹 = 是 ⇒ `rebuild`）与设计档 `:113`（镜像可用（具 `project`）⇒ **只重接**）∥ §13 B77（`reconnect`）∥ 本批用例 2 相抵；正本判据句 `:118` 与之相抵处以正本为准（派单已指定「以 `EXECUTION.md:118` 为准」），实装随之 ⇒ **代码零改**，但该表文本待设计席/父侧裁。
- **[上抛·知会] 设计缺口一径**：`absent` ∧ 镜像在场 ∧ 具 `project` ⇒ 只 `mount` 既有镜像、`recovery = null`（无内容被抹）；设计「唯一 `null` 径」句（`EXECUTION.md:118` ∥ `quota.mjs:14`）未列此支，§13 亦无行——归属（零痕合法 ∥ 计 `reconnect`）请设计席裁。
- **[上抛·知会] 设计席面两处随正**：§2 `:178` 编号映射（仍作 1–13）与 `:180` AC-1 枚举（`用例 1–4 ∥ 7 ∥ 10 ∥ 13`）未含用例 14 ⇒ 值层留痕用例未挂 AC；§13 无「`stale` ∧ 镜像不在」径的行（用例 14 附 的载体 = §4 散句）。本席不动他段。
- **[上抛·知会] 批内件越软线**：现盘 540/541 > 500 软线（「用毕即删」件；请在册/收口处置）。
- **未落项**：无（派单三处全落）。

**零新语义夹带**：① 由 `EXECUTION.md:118` 判据句直接派生 ∥ ② 由派单「随正附批内件用例 14 = B83」+ 验收标准「新判据四径逐条对表」派生（第三径无用例 ⇒ 补 14 附，逐字披露）∥ ③ 由派单「在职行扫 `B77–B82` ⇒ `B77–B83`」派生（同因两处坐标随正已逐处披露）。

### 修正记录（fix 轮 3 · 2026-10-16 · eng-coder）

**输入** = 父侧 fix 轮派单：设计席 #87 已把 `null` 判据轴改对（正本 = `EXECUTION.md:118` ∥ `:296` KD-SV-200 同拍）——`null` 径 = **无既有内容被抹**（`absent` ∧ 重建前镜像不在（首建）∥ `absent` ∧ 镜像在场且具 `project`（只挂载既有镜像、零 `mkfs`）∥ `ready`）；`stale` 自愈径 = `reconnect`（零 `mkfs`）∥ `rebuild`（有抹）。**实装行为已逐条相符（零改码）**，唯 `quota.mjs` 三处注释仍作旧表述「唯 `absent` ∧ 重建前镜像不在 ⇒ `null`」⇒ 注释与判据相抵。本段与上文相抵处以本段为准（§5 append-only——原行不改）。

**逐处收正（改前 → 改后；原位替换 —— 行数不变）**

| # | file:line | 改前（旧表述） | 改后（与 `:118` 同义） |
|---|---|---|---|
| ① | `thincoder-server/src/sandbox/quota.mjs:14`（模块头留痕句） | `…（裁决 absent ∥ stale 皆然）；唯 `absent` ∧ 重建前镜像不在（首建——无内容可抹）⇒ `null`（健康径同）。…` | `` `null` 径 = 无既有内容被抹：`absent` ∧ 重建前镜像不在（首建——无内容可抹）∥ `absent` ∧ 镜像在场且具 `project`（只挂载既有镜像，零 `mkfs`）∥ `ready`（健康径）。`` |
| ② | `:194`（`applyLoopback` docstring——括注续行） | `` 唯 `absent` ∧ 重建前镜像不在（首建——无内容可抹）∥ 就绪 ⇒ `null`（零痕）。 `` | `` `null` 径 = 无既有内容被抹：`absent` ∧ 重建前镜像不在（首建——无内容可抹）∥ `absent` ∧ 镜像在场且具 `project`（只挂载既有镜像，零 `mkfs`）∥ `ready`（健康径——零痕）。 `` |
| ③ | `:212`（判据行尾注） | `` // 抹掉既有内容 ⇒ 留痕（KD-SV-200：`stale` 两态 ∥ `absent` ∧ 重建前镜像在场；唯「`absent` ∧ 镜像不在」= 首建 ⇒ `null`） `` | `` // 抹掉既有内容 ⇒ 留痕（KD-SV-200：`stale` 两态 ∥ `absent` ∧ 重建前镜像在场；`null` 径 = 无抹：`absent` ∧ 重建前镜像不在（首建）∥ `absent` ∧ 镜像在场且具 `project`（只挂载、零 `mkfs`）∥ `ready`） `` |

**坐标随正（如实披露·同因）**：派单给 ② 的坐标 = `:193`（`applyLoopback` docstring），实读该旧表述落在 docstring 的**续行 `:194`**（`:193` = 首行「`recovery`（KD-SV-200）：判据 = …」）；改动落在 `:194`，语义与派单所指同一处（docstring）。`:193` 与 `:212` 坐标实读与派单一致。

**验证读数（cwd = 仓根 `d:\teamcode\thincoder`；口径 = `\n` 换行计数 ∥ 总行 = 换行数 + 1）**

| # | 命令 ∥ 读数 | 结果 |
|---|---|---|
| 1 | `node --check thincoder-server/src/sandbox/quota.mjs` | **Syntax OK** |
| 2 | `node --test docs/batches/2026-10-16-box-quota-recovery.test.mjs` | **tests 19 ∥ pass 19 ∥ fail 0**（314ms；含 B77 `reconnect` ∥ B83 ∥ B84——**期望值零改**） |
| 3 | 行数实读（node 计 `\n`） | `quota.mjs` **285/286**（不变——三处皆原位替换，零行增删） |
| 4 | 回读（D6——写入后逐处复读） | `:14` ∥ `:194` ∥ `:212` 三行逐字复读为新表述（`execute` 复读脚本，见上） |
| 5 | 残留扫（`grep 唯` 于 `quota.mjs`） | **零命中**——「唯…唯一」类旧表述无残留 |
| 6 | `git diff`（该文件） | 本轮改动 = 上述三行；**零逻辑改**（判据/流程/导出符号皆未动） |

**未落项**：无（派单三处全落）。**边界（未越）**：未动 `box.mjs` ∥ 未动设计档（设计席面）∥ 未动批内件用例与期望值 ∥ 未改判据本身。**零新语义夹带**：三处改动皆由「旧表述 ⇒ 与 `:118` 同义」直接派生（逐字对齐 `:118` 的 `null` 径三支）。

## §6 验证与收口（父代理）
