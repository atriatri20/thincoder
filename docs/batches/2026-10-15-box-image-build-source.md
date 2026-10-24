# 2026-10-15 · box-image-build-source
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 22:44「开」（承 22:43 #1250 呈报——盒镜像构建源面两处固化）+ 台账 #1250（#1430 已并入）。
> 台账 = #1250（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**轮次开账（2026-10-15 22:4x · 主 agent）**

**触发** = 用户 22:44「开」（承 22:43 #1250 呈报——「把每次都要手工绕的，变成本来就通的」）。

**对象（合并）**：**#1250** 盒镜像构建面两件——① **apt 源支持**（构建期换源固化：现走 `deb.debian.org` 在 .6 = 19KB/s，10-14 卡死 30 分钟；绕过 = 临时换源副本，产品档未动）∥ ② **Docker Hub 不可达时的取像路径**（.6 无 `daemon.json` 镜像源 ⇒ 裸 Hub 引用必败；可用源实核 = `docker.1ms.run`）。**#1430**（.6 apt 卡死实证 + scratch 绕过）已并入本行。

**联动（不并）**：**#1482**（盒镜像重建——部署窗口动作，非本批）；做法 = 重建窗口内**先固化后重建**（同一窗口把两件事一次做完）。

**授权口径** = 用户 22:44「开」；设计轮已点火（eng-designer）。

## §2 批次任务与设计（eng-designer）
**状态行**：✅ 设计完成 2026-10-15（五件齐全（①–⑤）；零实施；修正轮（评审轮 1）①–④ 逐号落讫（段末修正块）；AC-3/AC-6 读数绑 #1482 窗口——读数落盘前收口标「待窗口」）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**设计轮记录（2026-10-15 · eng-designer）——盒镜像构建源面固化（台账 #1250；#1430 已并入）**

**本批条目（覆盖）**：① apt 换源固化（绕行 ⇒ 正规能力）∥ ② Docker Hub 不可达取像路径面复核 + 部署指引面落点。**不并**：#1482（盒镜像重建——窗口动作；本批构建读数随其窗口取得）∥ #1461（面不同）。**联动（§1）**：先固化后重建——本批实施落盘在前，重建窗口（#1482）随后。**需求档零触**（构建面能力——非功能点面；如评审判需入册 = 主 agent 笔）。

### ① 换源固化形（裁：Dockerfile build-arg 单径）

**裁**：`ARG APT_MIRROR`——值 = 镜像主机[:端口]；缺省不传 = 官方源零改（不内置地域源）。落点 = `thincoder-server/deploy/sandbox/Dockerfile`（实读 39 行）两处。

档头（:4 后插 1 行）：

```
#   可选换源（官方 `deb.debian.org` 慢/卡死时——台账 #1250）：追加 `--build-arg APT_MIRROR=<镜像主机>`（值 = 主机[:端口]，如 mirrors.aliyun.com）；缺省不传 = 官方源零改。
```

apt 段（:17-20 ⇒ 以下目标块；+6 行）：

```dockerfile

# 换源（可选——值 = 主机[:端口]；缺省空 = 官方源零改；见档头）
ARG APT_MIRROR=
RUN if [ -n "$APT_MIRROR" ]; then \
      MIRROR="${APT_MIRROR#http://}"; MIRROR="${MIRROR#https://}"; \
      sed -i "s|deb.debian.org|$MIRROR|g" /etc/apt/sources.list.d/debian.sources; \
    fi \
 && apt-get update \
 && apt-get install -y --no-install-recommends git curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
```

净行数：39 ⇒ **46**（+7；落盘实读为准）。缺省路径一次性代价：该层缓存键因 RUN 文本更新失效一次（重建窗口内消化）；产物等价（apt 包面零改）。

**择一理由**：① 最小面——换源是构建输入，天然属 Dockerfile；一 ARG + 一守卫 sed 闭环、零新文件；② **「脚本参数化」否决**——盒镜像构建无仓内脚本（实核：`thincoder-server/deploy/` 零构建脚本；构建 = 文档化命令行：`Dockerfile:4` ∥ 台账 #1482 命令）；为其新建脚本 = 新增部署面工件（本批禁止范围），且脚本仍须透传 build-arg（同一原语）⇒ 纯绕行；③ 缺省零改 = 「不宜内置地域源」判的落地形——地域镜像仅作注释示例（非活跃行）。

**先例行（closest precedent）**：唯一先例 = 绕行副本 `.thincoder/tmp/sbox-Dockerfile:7`（无条件 `sed … debian.sources`；实证成：`b73a6af5bcb3` · 1.5 分钟）。对齐 = sed 目标文件与替换语义（host 级换源）；偏离 = 守以 build-arg（副本为一次性构建件；产品档须保官方缺省）。

**勘察证据行**：仓内两 Dockerfile（`thincoder-server/Dockerfile` ∥ `deploy/sandbox/Dockerfile`）零 `ARG` 用法——本面首例（无既有 build-arg 先例）∥ 工作区其他项目零 Dockerfile（glob 实核）∥ 公开源 = `PROJECT-MANIFEST.json:189` `index.publicRepos: []`——零声明源，无相关可查（如实记）。

**案例四则**：

| # | 输入 | 预期 |
|---|---|---|
| N1 | 不传 arg | sed 分支不入 ⇒ apt 打 `deb.debian.org`（现态零改；产物等价） |
| N2 | `APT_MIRROR=mirrors.aliyun.com` | sed 换 host ⇒ apt 打 aliyun；构建成（.6 实证 1.5 分钟） |
| N3 | 带 scheme（`https://mirrors.aliyun.com`） | 剥 scheme ⇒ 同 N2 |
| E1 | 目标文件缺（未来基底形变）∥ 值不可达（源网络败） | 构建停、报错如实（fail-loud——不静默慢建） |

### ② 取像路径面（复核：#1250 原判「产品零缺口」成立——无需变更；指引面已在位）

**复核（代码坐标实读）**：① 拉取端点 = `thincoder-server/src/sandbox/image-routes.mjs:85-115`（`POST …/images/pull`）——输入经 `parseImageRef` 后原样透传引擎（`docker.mjs:348-349` ⇒ `POST /images/create?fromImage=…`）；镜像源前缀引用（`docker.1ms.run/library/ubuntu:24.04`）即普通引用，路径零涉；② 失败两形皆收 + 引擎原文如实（`image-routes.mjs:34-39` `pullFailure`——KD-SV-94）；③ 源侧消费面已建：`image-sources.mjs`（源清单 + 预选七条含 1ms.run）+ 前端「经由源」组装（`public/views-sandbox-images.mjs`；设计 = `sandbox/SANDBOX.md` §3 KD-SV-96/97/100——『拉取仍由节点引擎执行 ∥ 源不写节点 dockerd 配置 ∥ 零自动选源』围栏在册）⇒ **产品代码零变更**（结论 + 坐标在案，无需实施）。

**指引面落点（答案 = `docs/TEST-ENV-ECS.md` §7——已在位，2026-10-11 落）**：可用源清单表 `:127-134`（真拉成 = `docker.1ms.run` 200 · 10.4s · 119MB）∥ daemon.json 便利径 `:136-138`（`.6` 无该档 ∥ `.5` 已配三源——两机不对称 = 裸 Hub 引用失败的机器侧根因）∥ 盒镜像搬运 `:139`。**本批复核结论 = 完整在位、零新增**。归本档理由 = 该档自述分工「我们自己的测试箱（内部机器 + 机器特定事实）」（`:5`）——daemon.json/源可达性皆机器特定事实；产品档（`OPS.md`/`README.md`）零涉。

**余项（服务器侧 = 待窗口执行·标明）**：W1 = `.6` daemon.json 实配（命令 `TEST-ENV-ECS:137`；需 sudo = 用户动作；运维动作不入产品码）⇒ 读数 = 裸 `ubuntu:24.04` 经引擎源直拉成；W2 = 构建读数（④ AC-3）随 #1482 重建窗口（先固化后重建）。

### ③ 落点清单（逐处 file:line——实读 2026-10-15）

| # | 文件 | 现状 | 改动 | 净 |
|---|---|---|---|---|
| L1 | `thincoder-server/deploy/sandbox/Dockerfile` | 39 行（档头 :3-4 ∥ apt 段 :17-20） | 档头 :4 后 +1 行；apt 段 ⇒ ① 目标块（+6） | +7 ⇒ **46** |
| L2 | `docs/TEST-ENV-ECS.md` | 145 行；坑 7 = `:94`（现句「绕行 = 构建期换源副本（仅改副本、产品 Dockerfile 不动）」） | `:94` 改写 = 固化句（`--build-arg APT_MIRROR=…`）；+1 命令行（上下文 = 仓根）；19 kB/s 读数保留 | +1 ⇒ ≈146 |
| L3 | `docs/server/design/agent/MEMBER-AGENT.md` | 435 行；`:212`「现读 **39**」∥ `:359` 行账「**39**」 | 两值 ⇒ 新实读（46） | ±0 |
| L4 | `docs/server/design/ops/OPS.md` | 357 行；`:281` 表值「**19**」（**陈值**——member-face 批后未随正；据行数面机检语义为既有差异 1 条，`doc-check-linecounts.mjs:4-7`） | 收正 ⇒ 新实读（46） | ±0 |
| L5 | `docs/batches/2026-10-15-box-image-build-source.test.mjs` | 无 | 新建（结构断言 5 条——④ AC-1；用后即删） | +≈50 |

**deploy 脚本**：零落点（无盒镜像构建脚本——① 理由②）。
**不触（明列）**：`thincoder-server/Dockerfile`（服务端镜像——射程外）∥ `sandbox/EXECUTION.md:225`（`≈32` 预算估值形——机检按预估行跳过）∥ `sandbox/SANDBOX.md`（产品机制零缺口）∥ `README.md` ∥ `OPS.md` §5（客户部署面——盒镜像构建非客户径）∥ `.thincoder/tmp/sbox-Dockerfile`（tmp 面——O-3）。

### ④ 验收对照（可机检 ∥ 待窗口）

| AC | 判据 | 载体 |
|---|---|---|
| AC-1 | Dockerfile 目标形机检 5 条：① `ARG APT_MIRROR=` 在场且缺省空 ② apt RUN 守卫形（`[ -n "$APT_MIRROR" ]`） ③ 换源目标 = `/etc/apt/sources.list.d/debian.sources` ∥ host 替换 `deb.debian.org` ④ `FROM node:24-slim` 与 apt 三件（git curl ca-certificates）零改 ⑤ 活跃行（剔注释）零地域镜像字面量 | 批内件（`node --test docs/batches/2026-10-15-box-image-build-source.test.mjs`） |
| AC-2 | 缺省零改（结构性：缺省空 + 守卫 ⇒ 官方源路径） | 批内件 |
| AC-3 | **真机构建读数（待窗口——随 #1482 重建）**：带 `--build-arg APT_MIRROR=mirrors.aliyun.com` 建成 + apt 步耗时（对照基线 19 kB/s ∥ 10-14 卡死）；缺省构建复证官方源路径 | §5/§6 读数行（窗口执行） |
| AC-4 | 文档在位机检读数：L2 固化句 ∥ L3/L4 三处值与实读一致（node 行扫描读数一行） | §5 读数 |
| AC-5 | ② 复核结论 + 坐标在案（产品零缺口）∥ 指引面在位坐标（`TEST-ENV-ECS:125-139`） | 本 §2 |
| AC-6 | **W1 daemon.json 实配读数（待窗口·用户动作）**：裸引用直拉成 | §5/§6（窗口执行） |

### ⑤ 量级

产品面净 ≈ **+8 行**（L1 +7 ∥ L2 +1）；三处值改（±0）；批内件 ≈50（用后即删）。零新文件（批内件除外）∥ `src/**` 零触。

### 关键决策

- **KD-1 择一 = build-arg**（否决脚本参数化 ∥ 否决内置地域源缺省）——理由见 ①。
- **KD-2 缺省语义 = 空 ⇒ 零改**：`ARG APT_MIRROR=` + 守卫；缺省构建同产物（一次性层缓存失效——如实）。
- **KD-3 ② 零新增**：指引面已在位（`TEST-ENV-ECS` §7）；daemon.json = 机器侧手工便利径（`KD-SV-96` 围栏无涉——产品零隐式注入不变）；实配 = 运维窗口动作。
- **KD-4 行数面**：L3/L4 随批收正；`EXECUTION.md:225`（≈ 估值）与服务端 Dockerfile 零触。

### 观察/发现（逐条报）

- **O-1（已处置）**：`OPS.md:281` 陈值 19（39 之旧读——member-face 批未随正）⇒ 同拍收正（一致性面）。
- **O-2（不处置·理由）**：`EXECUTION.md:225` `≈32` = 预算估值形——doc-check 按预估行跳过（`scripts/doc-check-linecounts.mjs:6-7`），合法形态零触。
- **O-3（处置建议·父侧笔）**：`.thincoder/tmp/sbox-Dockerfile` 绕行副本的理由随本批失效（头注自述「产品档是否支持换源（build-arg）另挂台账」= 本批）——tmp 清理属工程工具面（父侧），非本批产品落点。
- **O-4（射程说明）**：服务端镜像 `thincoder-server/Dockerfile` 同无换源能力（.5 构建、源速正常）——如后续需要 = 另批。

**边界**：不内置地域源 ∥ 不动服务端镜像 ∥ 不加部署面新工件 ∥ daemon.json 实配不入产品码 ∥ 无 UI/交互面 ∥ 零实施（本轮只写 §2）。

### §2 修正块（fix 轮 · 评审轮 1 发现 1–4 逐号收正 · eng-designer · 2026-10-15 23:1x）

**来由**：§3 轮次 1 = **pass**（🔴 0 ∥ 🟡 2 ∥ 🔵 2）；父侧裁 = 4 条全受理（逐号定点 ①–④）。**写入面** = 本段（append-only——上段已落行零改；逐号处置以本块为准）∥ **零实施**（L1/L2 ∥ 产品码 = 实施轮面——本块零触）∥ §1/§3 零触 ∥ 零新语义（一切改动 = 评审发现 + 父裁的直接导出）。

| 号 | 审# | 处置（逐条） | 落点 |
|---|---|---|---|
| ① | 1 | **L5 口径注**：批内件 = 用后即删——沿现行单元测试纪律（零留存——批档 §5 留读数行；与 `MEMBER-AGENT.md:370`「随批收口用后即删——零留存」同口径）。**`OPS.md:118` 括注就地收正**：旧「随批档留存、零维护」⇒ 现行形「随批收口用后即删、零留存」；「红不作门禁判据」保留；「不扫旧件」判**与删后态不相容**（零留存下无旧件可扫——前提已消失）⇒ 同拍删。 | `docs/server/design/ops/OPS.md:118`（就地）∥ 本块 |
| ② | 2 | **窗口绑定行**：AC-3 ∥ AC-6 读数**绑 #1482 窗口**（与 W1/W2 同窗）；读数落盘前收口标「**待窗口**」（对照基线沿用 ④ 既有口径：19 kB/s ∥ 10-14 卡死）。 | 本块 ∥ 本段状态行 |
| ③ | 3 | **O-2 理由行收正（本块为准）**：`EXECUTION.md:225` `≈32` 不被机检的真因 = 该档**未入 lineCounts 声明面**（`PROJECT-MANIFEST.json:43-180`——机检不涉）；「零触」结论保留；旧「按预估行跳过」从句作废（该形非 `**≈N**` 预估形——按 `scripts/doc-check-linecounts.mjs:6-7`（实现 `:43`）实按 pair 解读）。 | 本块（O-2） |
| ④ | 4 | **记录点注**：换源能力记录点 = Dockerfile 档头（L1）+ `TEST-ENV-ECS` 坑 7（L2）；**设计档不做能力句（取舍）**（`MEMBER-AGENT.md` §3.10 ∥ `EXECUTION.md` §8 不加能力注记）。**`MEMBER-AGENT.md:359` 预算列不随正**（该档实读为准——`:344` 自述「以实施当刻实读为准」）。 | 本块 |

**面界（本块）**：产品码 ∥ `Dockerfile` ∥ `TEST-ENV-ECS` ∥ `EXECUTION.md` ∥ §1/§3 = 零触；`OPS.md` 面 = 仅 :118 一句（L4 值行 `:281` = 实施轮面——零触）。

**回读**：`OPS.md:118` 现读 = 「…**单元测试档不入任何门**（单元测试纪律——随批收口用后即删、零留存；红不作门禁判据）。」——与 `MEMBER-AGENT.md:370` 同口径（随批收口 ∥ 用后即删 ∥ 零留存）；②③④ = 本块在盘（段末）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

对象 = 本批 §2（盒镜像构建源面固化；零实施）——设计评审。

**抽查（设计声明核验 · 实读）**：`thincoder-server/deploy/sandbox/Dockerfile` 现 39 行（档头 `:4` = build 命令；apt RUN 实为 `:18-20`）∥ `agent/MEMBER-AGENT.md:212`/`:359`「39」∥ `ops/OPS.md:281`「19」∥ `docs/TEST-ENV-ECS.md:94` 现句逐字相符、`§7 = :125-139` 在位 ∥ 先例件 `.thincoder/tmp/sbox-Dockerfile:7` 在盘（无条件 sed）∥ `PROJECT-MANIFEST.json:189` `"publicRepos": []` ∥ ② 坐标抽查通过（`image-routes.mjs:34`/`:85`/`:91` ∥ `docker.mjs:348-349` ∥ `image-sources.mjs:21-33` ∥ `SANDBOX.md:592-596` KD-SV-96/97/100）∥ L1 算术自洽（apt 区 4 行 ⇒ 10 行 = +6；+1 ⇒ 净 +7 = 46）∥ 勘察行「仓内两 Dockerfile 零 ARG」属实。局限：无标准档（方法论按 AGENTS.md 判）∥ 无文档地图（ownership 判据降级）。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Document ownership | 🟡 | L5 取「用后即删」一侧，而评审面内两处纪律句口径相斥——`MEMBER-AGENT.md:370`「随批收口用后即删——零留存」∥ `OPS.md:118`「单元测试纪律——随批档留存、零维护」；设计未注明所据一侧（同批在先件 `docs/batches/2026-10-15-inject-project-rules-switch.test.mjs` 仍在盘，与「留存」侧同向） | L5 处注明所据口径（或改按留存侧落）；两处纪律句口径差 = 一致性面（登记待处理） |
| 2 | Scope / coordination | 🟡 | AC-3（真机构建读数）∥ AC-6（W1 daemon.json 读数）实施当刻不可取证——依赖 #1482 重建窗口与 `.6` 需 sudo 的用户动作（W1/W2 已在 §2 状态行标明；协调项非缺陷） | AC-3/AC-6 与 #1482 窗口排期绑定；读数落盘前收口记录标「待窗口」，口径沿用 ④ 既有对照（19 kB/s ∥ 10-14 卡死） |
| 3 | Methodology / evidence | 🔵 | O-2 理由与机检语义不符：`EXECUTION.md:225` 表值形 = 「≈**32**（本档定义契约）」；「预估 ⇒ 跳过」形按 `scripts/doc-check-linecounts.mjs:6-7`（实现 `:43`）须 ≈ 在粗体内（`**≈N**`）⇒ `≈**32**` 实按 pair（32）解读；该行不被机检的真因 = `docs/server/design/sandbox/EXECUTION.md` 不在 `PROJECT-MANIFEST.json:43-180` 的 `lineCounts` 声明面内。结论「零触」成立、理由行不成立 | O-2 理由改记「该档未入 lineCounts 声明面（机检不涉）」；若确按预估语义，行面形态应写 `**≈32**` |
| 4 | Document ownership / clarity | 🔵 | 新构建输入（`--build-arg APT_MIRROR=…`）记录点仅 Dockerfile 档头（L1）+ TEST-ENV-ECS 坑 7（L2）；描述盒镜像的设计档只随正行数（`MEMBER-AGENT.md:212`/`:359`），能力本身零记录；且 `:359` 行「≈35（设计）」与本批后 现读 46 相距 11 行（该档自述「实读为准」下合法，行面读感为超预算） | 评估在盒镜像所属设计档（`MEMBER-AGENT.md` §3.10 / `EXECUTION.md` §8）加一行能力注记，或明确「Dockerfile 档头 = 唯一记录点」；`:359` 预算列取舍注明一行即可 |

计数：🔴 0 · 🟡 2 · 🔵 2
VERDICT: pass

## §4 用户批准（主 agent）

**用户批准**：2026-10-15 23:54「**批**」（11 批队列放行——本批实施轮 eng-coder#51 在其列；收口随该令走完）。
**评审记录**：§3 设计评审轮次 1 = 通过；实施侧 advisor code 评审 = **pass**（🔴 0 ∥ 🟡 0 ∥ 🔵 3——范围外知会，处置见 §6）。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-15（L1–L5 落讫 ∥ 发散审计零偏差 ∥ 代码评审 pass（🔴0/🟡0/🔵3）∥ fix round = 零轮；AC-3/AC-6 待 #1482 窗口）



**实施轮记录（2026-10-15 23:5x · eng-coder）——盒镜像构建源面固化（initial = 首轮实施）**

**交付摘要**：按 §2 落点表 L1–L5 逐项落盘（含修正块 ①–④ 的处置面）。

| # | 落点 | 改动 | file:line | 净 |
|---|---|---|---|---|
| L1 | 盒镜像 Dockerfile | 档头 +1 行（可选换源说明）；apt 段换源守卫块（`ARG APT_MIRROR=` + 守卫 sed + apt 三步并入同一 RUN） | `thincoder-server/deploy/sandbox/Dockerfile:5` ∥ `:19-27` | 39 ⇒ 46（+7） |
| L2 | 测试环境手册 坑 7 | 「绕行副本」⇒ 固化句（`--build-arg APT_MIRROR=<镜像主机>`）+ 1 条盒镜像构建命令行（上下文 = 仓根）；`19 kB/s` 读数保留 | `docs/TEST-ENV-ECS.md:94-95` | 145 ⇒ 146（+1） |
| L3 | 成员面设计档（盒镜像现读） | `:212` ∥ `:359` 两处「现读」列 39 ⇒ 46；`:359` 预算列 `≈35（设计）` 不随正（修正块 ④） | `docs/server/design/agent/MEMBER-AGENT.md:212` ∥ `:359` | ±0 |
| L4 | 运维设计档 行数表 | 陈值 19 ⇒ 46 | `docs/server/design/ops/OPS.md:281` | ±0 |
| L5 | 批内单元测试档 | 新建：AC-1 ①–⑤ 五条 + AC-2 一条（结构断言） | `docs/batches/2026-10-15-box-image-build-source.test.mjs` | +86 |

**修正块处置面**：① `OPS.md:118` = 现行口径（随批收口用后即删、零留存；红不作门禁判据）——设计轮已就地收正，实施轮复核 = 与 `MEMBER-AGENT.md:370` 同口径 ∥ 全档无「随批档留存」残留（本批零改）；② AC-3/AC-6 = 待 #1482 窗口（本记录标「待窗口」）；③ O-2 理由行以修正块为准（O-2 属 §2 面，实施零触）；④ 见 L3。

**决策透明表**

| 决策 | 择 | 理由 |
|---|---|---|
| Dockerfile 档头插入位 | `:4` 后（构建命令行下一行） | 与现有档头三空格缩进同形；换源说明紧跟 build 命令，便于照抄加 `--build-arg` |
| apt 段落形 | 守卫 sed 与 apt update/install/rm 并入同一 RUN | 沿 §2 ① 目标块逐字落；同层 = 少一层镜像层，且「换源 + 装包」同层语义一致 |
| L3 两处值 | 两处「现读」皆 46；预算列不动 | §2 L3「两值 ⇒ 新实读（46）」+ 修正块 ④「`:359` 预算列不随正」 |
| 单元测试档留存 | 用后即删（零留存） | 现行单元测试纪律（`MEMBER-AGENT.md:370` ∥ `OPS.md:118` 同口径）——§5 留读数行 |

**审计与代码评审轮次与终态**

| 轮 | 面 | 结果 |
|---|---|---|
| 发散审计（explore 子代理 · 只读） | 与 §2 逐项对位（落点 L1–L5 ∥ AC-1…AC-6 ∥ 修正块 ①②③④ ∥ 越表 ∥ 设计档漂移） | 零偏差；越表 = 无；漂移 = 无。唯一记录项 = §5 载体（本记录即补，见其豁免注） |
| 代码评审（advisor · type=code） | 审阅范围 = 改动五档 + 批档（需求对照件） | **VERDICT: pass**（🔴 0 ∥ 🟡 0 ∥ 🔵 3） |

**fix round**：**零轮**——审计与评审皆无必改项（三条 🔵 属引读/量级形态，不动本批落点）。

**验证读数**

- 批内件实跑：`node --test docs/batches/2026-10-15-box-image-build-source.test.mjs` ⇒ `tests 6 ∥ pass 6 ∥ fail 0`（AC-1①–⑤ + AC-2）
- 行数实读（内容行口径 = `scripts/doc-check-linecounts.mjs` `countContentLines` 语义）：`deploy/sandbox/Dockerfile` = 46 ∥ `TEST-ENV-ECS.md` = 146 —— 与 L1/L2 目标一致
- AC-4 文档在位机检：`TEST-ENV-ECS.md:94` 固化句 + `:95` 命令行在场 ∥ `MEMBER-AGENT.md:212`/`:359` 与 `OPS.md:281` 三值 = 46 且与实读一致 ⇒ 全绿
- **待窗口**：AC-3（真机构建读数·随 #1482 重建窗口）∥ AC-6（W1 `.6` daemon.json 实配读数·用户动作）——本轮不可取证，如实标「待窗口」

**批内件**：`docs/batches/2026-10-15-box-image-build-source.test.mjs`（用后即删——读数已入本段，随收口删除）。

**范围外知会（本批零改，供父侧/设计档面处置）**：
- 评审 🔵-① `OPS.md:281` 行在行数机检面为「行式异常」（首格档名 `thincoder-server/deploy/sandbox/Dockerfile` 末段无扩展名 ⇒ `doc-check-linecounts.mjs` `filesOf` 取不到档 ⇒ 永不比对；值 46 本身与实读一致；该形态本批前既有）。
- 评审 🔵-② 设计所引 `TEST-ENV-ECS` §7 坐标（原 `:127-134` ∥ `:136-138` ∥ `:125-139`）随 L2 的 +1 行后移 1 ⇒ 现盘 `:128-135` ∥ `:137-139` ∥ `:126-140`（引读面偏 1；内容在位）。
- 评审 🔵-③ 批内件实读 86 行 vs 设计量级 `≈50`。

## §6 验证与收口（父代理）

**收口（父侧 · 2026-10-16）**

**① 验证读数（本批验证行）**：父侧抽核 —— `thincoder-server/deploy/sandbox/Dockerfile` 换源守卫块（`:19–27`：`ARG APT_MIRROR=` 缺省空 ∥ `if [ -n "$APT_MIRROR" ]` 守卫 sed ⇒ **缺省 = 官方源零改**）+ 档头说明（`:5`）在盘、内容行 **46** ✓；`MEMBER-AGENT.md:212`「现读 **46**」✓；`OPS.md:281` 值 **46** ✓（三值同源一致）。批内件 `node --test` = **6/6 绿**（#51 读数）。禁调令遵守 = 全程零调 `node scripts/doc-check.mjs` 入口 ✓。

**② 集成场景影响**：无 —— 构建面 + 档面，无业务场景增删/修订。

**③ 核销结算**：台账 **#1250**（盒镜像构建源面——apt 源固化 ∥ Docker Hub 取像路径）→ 已核销；证据 = 本档 §5 ∥ §6。

**④ 暂缓批复核**：无（本批无暂缓标记）。

**⑤ 结算同步清单**：角色表（§1 主 agent ∥ §2 eng-designer ∥ §3 评审 ∥ §4 主 agent ∥ §5 eng-coder ∥ §6 父代理）✓ ∥ 状态行（§5 实施完成 → 本档已收口）✓ ∥ 计数（Dockerfile 39⇒46 ∥ 三值 = 46）✓ ∥ 指针（#1250 指本档）✓ ∥ 待办勾销（AC-3 真机读数 ∥ AC-6 `.6` 配置 = **窗口绑定**——设计自裁在案，非欠账）✓ ∥ 前批遗留交叉核（#1430 已并入 #1250 ✓、无锚悬）✓。

**⑥ 范围外知会处置**（#51 报告 🔵 3 + 附注）：① `OPS.md:281` 首格档名末段无扩展名 ⇒ 行数机检永不比对（值 46 与实读一致）→ 并入台账 #1510 族；② 设计所引 `TEST-ENV-ECS` §7 坐标随 L2 的 +1 行后移（现盘 `:128-135` ∥ `:137-139` ∥ 块体 `:126-140`）→ 并入 #1510 族；③ 批内件实读 86 行 vs 设计量级 ≈50 → 用后即删件，不追；④ `thincoder/.thincoder/tmp/sbox-Dockerfile` 绕行副本理由随本批失效 → 临时面清理（工程工具面 · 父侧直笔）；⑤ `TESTING.md:49/:90/:92`「随批留存」陈句族 = 台账 #1501 同族（已在册）。

**⑦ 结算行**：台账 #1250 → 已核销（随本行呈报）。
