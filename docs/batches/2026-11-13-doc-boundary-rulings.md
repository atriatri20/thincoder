# 2026-11-13 · doc-boundary-rulings
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（主 agent）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（实施者：主 agent ∥ coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-13 · 来源 = 用户 2026-11-13 裁定跨仓引用一律不报、无项目目录不运行文档门；继续修复文档体系。。
> 台账 = #2386（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-13
批起 sha = cb3ab4a545c06e8e49dc21022cd54d6efdadcaa1
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

- 台账 #2386。
- 用户裁定 1：所有跨仓引用在 doc_check 一律不报，包括已声明公共仓；声明只开放检索/引用。
- 用户裁定 2：无项目目录不运行文档门；target/会话锚不制造项目身份。
- 同批补回 SSRF 的具体设计 owner，并把 TEST-ENV-ECS 纳入可检索文档层。只改文档和 manifest，不改产品代码。

## §2 批次任务与设计（主 agent）
**状态行**：设计完成（用户裁定优先，代码缺口不伪写已交付）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 本批目标态

1. 跨仓：DOC-CHECK 需求/设计统一为「所有跨仓引用一律不报」。PATH-RESOLUTION 只修改 doc_check 的消费规则，保留通用解析层给其他消费面的 declaredRepo、dangling、unverified 状态；`index.publicRepos` 不再被描述为 doc_check 存在性判定的扩展。
2. 无项目：MACHINE-CHECK、DOC-CHECK、PATH-RESOLUTION 统一为「目标不属于项目时不运行文档门」；显式 target 和会话锚只定位，不制造项目身份。
3. 实现对照：读取当前代码确认上述两条是否已实现。若不同，需求记录用户裁定目标，设计如实标当前缺口并登记技术债，不把目标写成已交付。
4. SSRF：在 `docs/core/design/TOOLS.md` 记录下列已从 `shared.mjs`、`web.mjs`、`web-deepseek.mjs` 核实的当前契约，不新增安全机制：
   - 初始 URL 必须以 http/https 开头且能由 URL 解析；失败或私网主机直接拒绝。
   - 主机小写后拦截：localhost 及其子域、0.0.0.0、127/8、0/8、10/8、172.16/12、192.168/16、169.254/16、169.254.169.254、metadata.google.internal；IPv6 目标分类为 ::1、fc/fd 与 fe80::/10。
   - 已实测当前缺口：Node `new URL()` 的 IPv6 hostname 带方括号，而现有比较使用不带括号字面，因而 ::1/fc/fd/fe80 不命中。文档必须标为实现缺口，不得写成当前已拦截。
   - 当前门只检查 URL 中的主机字面，不做 DNS 解析；不得把域名解析后的地址安全写成已覆盖。
   - DeepSeek 抓取在把 URL 交给第三方前再做同一主机检查；失败/空内容回本地抓取。
   - 目标契约：本地抓取只对 301/302/307/308 且有 Location 的响应手动跟进一次；相对地址先归一，目标必须 http/https 并重新过私网门。第二响应仍重定向时不继续跟。
   - 当前直连缺口：proxyFetch 直连未传 `redirect:"manual"`，原生 fetch 自动重定向可能绕过 Location 复查；只有显式代理支保证上述手动检查。不得写成直连已覆盖。
   - 初拒、非法重定向、私网重定向和 HTTP 失败均显式报错，不返回空成功。
5. 环境手册检索：把 `docs/TEST-ENV-ECS.md` 作为操作设计档加入 docRoot.design，使按主题 doc_search 能直接命中；正文无需因此改写。

### 最近先例

`docs/core/design/DOC-CHECK.md` 的仓外面和 `docs/core/design/PATH-RESOLUTION.md` 的统一解析层是本次修复对象；`docs/core/design/TOOLS.md` 的网络段承接 SSRF。对齐 = 一个规则一个权威、实现与目标分开。偏离 = 本批有用户新裁定，但不能把未实现裁定写成当前行为。

### 勘察证据

用户原话裁定：「所有跨仓引用一律不报，包括已声明公共仓」和「不运行文档门；显式 target 不把无项目目录变成受管项目」。已确认旧 DOC-CHECK F4 与 PATH-RESOLUTION 的 dangling 分支冲突，MACHINE-CHECK 与 DOC-CHECK 的无项目行为不一致。SSRF 设计此前只剩「执行 SSRF 规则」；环境手册不在 docRoot。外部公共文档未使用；本批依据用户裁定和当前代码。

**受影响文档**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| docs/core/requirements/DOC-CHECK.md | 统一跨仓规则 | 实写 |
| docs/core/design/DOC-CHECK.md | 同步跨仓与无项目边界 | 实写 |
| docs/core/design/PATH-RESOLUTION.md | 删除声明仓 dangling 冲突并同步项目身份 | 实写 |
| docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MACHINE-CHECK.md | 明确无项目不运行 | 实写 |
| docs/core/design/TOOLS.md | 补回当前 SSRF 机制 | 实写 |
| PROJECT-MANIFEST.json | 主 agent 将 TEST-ENV-ECS 加入 docRoot.design | 实写 |

本批无产品代码或单元测试文件，代码机读清单为空。

### 逐项验收

| 项 | 正常与边界 | 失败面 |
|---|---|---|
| 跨仓 | 仓外、未声明、已声明公共仓在 doc_check 均不报；公共仓仍可检索/引用 | 任一档仍把已声明缺失目标判 dangling 即不通过 |
| 无项目 | 无项目时不运行文档门；target/锚只定位 | 任一档仍声称 target 制造项目身份即不通过 |
| 实现诚实 | 当前代码与裁定逐项对照；差异有明确技术债 | 把未实现目标写成当前行为即不通过 |
| SSRF | 公网 URL 可过；列出的私网/元数据初拒；重定向到私网拒绝；DeepSeek 前复查；明确不做 DNS 解析和多次跟进 | 仍只有「执行 SSRF 规则」、遗漏分类或把未覆盖的 DNS/重定向写成已防护即不通过 |
| 环境手册 | 按部署/回滚主题 doc_search 能直接命中 TEST-ENV-ECS | 仅地图有入口而检索不到即不通过 |
| 机械检查 | 所有改动文档 `doc_check report` PASS | 未处置命中即不通过 |

本批只改文档和检索声明，不改变业务可观察结果，无集成用例增量。代码差异若存在只登记，不在本批修产品代码。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解决 | 批档 §2「本批目标态」要求「补回当前私网/元数据拒绝的地址分类、URL/DNS/重定向边界和错误语义」；`docs/core/design/TOOLS.md` §5 仍只有「websearch/fetch 在请求前执行 SSRF 规则」，未给出这些契约。 |
| 2 | 🟡 | 建议澄清 | 批档 §2「本批目标态」写「DOC-CHECK 需求/设计与 PATH-RESOLUTION 统一为『所有跨仓引用一律不报』」，而 §1 用户裁定限定为「所有跨仓引用在 doc_check 一律不报」；需避免把通用 PATH-RESOLUTION 的声明仓解析状态一并删除。 |

VERDICT: changes-required
计数：🔴 1 · 🟡 1 · 🔵 0

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | Fixed | 批档 §2「本批目标态」SSRF 条已列出初始 URL、私网/元数据分类、DNS 不解析边界、DeepSeek 前复查、单次重定向与重新过门、显式错误语义；`docs/core/design/TOOLS.md` §5 已列为实施落点。 |
| 2 | 🟡 | Fixed | 批档 §2「本批目标态」明确「PATH-RESOLUTION 只修改 doc_check 的消费规则，保留通用解析层给其他消费面的 declaredRepo、dangling、unverified 状态」，与 §1 用户裁定作用面一致。 |

VERDICT: pass
计数：未解决 🔴 0 · 🟡 0 · 🔵 0（原 2 项均 Fixed）

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔵 | 建议更新 | `docs/core/design/DOC-CHECK.md` 文首「勘察证据」仍写「已读需求 F1–F10」，而 `docs/core/requirements/DOC-CHECK.md` §2 已含 F11「无项目不运行文档门」；这是勘察记录的范围漂移，不影响 F11 的目标契约与当前缺口披露。 |

VERDICT: pass
计数：🔴 0 · 🟡 0 · 🔵 1

## §4 用户批准（主 agent）

- 2026-11-13：用户选择「所有跨仓引用一律不报，包括已声明公共仓」；随后选择「不运行文档门；显式 target 不把无项目目录变成受管项目」。

## §5 实施记录（实施者：主 agent ∥ coder）
**状态行**：实施完成（五份文档与 doc_check 已完成；代码缺口仅披露，待主 agent 登记技术债）



### 实施记录

已按 §2 修改五份目标文档，未改产品代码、测试、manifest 或其他文档。

- `docs/core/requirements/DOC-CHECK.md`：F4 明确仓外、未声明别仓、已声明公共仓均不报，公共仓声明仍服务检索与引用；新增 F11 与 AC-15、AC-16，明确无项目不运行及 target/会话锚不制造项目身份。
- `docs/core/design/DOC-CHECK.md`：写入项目身份和跨仓目标契约，新增「当前实现对照」，如实标出跨仓与无项目两项代码缺口。
- `docs/core/design/PATH-RESOLUTION.md`：只调整 doc_check 消费边界；通用文档锚的 declaredRepo、dangling、unverified 状态及行为矩阵保留。
- `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MACHINE-CHECK.md`：补齐无项目时 report/gate 均不运行、显式 target 和会话锚只定位的验收。
- `docs/core/design/TOOLS.md`：补齐初始 URL、全部地址分类、不做 DNS、DeepSeek 前复查、一次手动重定向和显式错误的目标契约；IPv6 方括号与直连自动重定向两个当前缺口单列，未写成已防护。

### 代码对照与实测

| 面 | 当前代码或实测 | 处置 |
|---|---|---|
| 跨仓 | `thincoder-core/doc-check/existence.mjs` 的 `existenceHits` 只经 `siblingProjectForm` 跳过「同级目录且有 PROJECT-MANIFEST.json」的别仓路径，不读取 `index.publicRepos`；不符合该目录形的已声明公共仓缺失目标仍会命中 | 文档区分目标与当前行为；待登记技术债 |
| 无项目 | `thincoder-core/agent-tools/doc-check.mjs` 的 `execute` 在非 ok 项目视图下以 target 赋 root，`thincoder-core/doc-check/index.mjs` 的 `projectRootOf` 也以调用方基根兜底；无项目目标仍进入检查 | 文档区分目标与当前行为；待登记技术债 |
| IPv6 | 实测 `isPrivateHost("::1")=true`、`isPrivateHost("[::1]")=false`；fc00 与 fe80 同样是不带括号 true、带括号 false。`new URL` 对 IPv6 URL 的 hostname 返回带方括号形 | TOOLS 保留应覆盖分类并披露漏拦；待登记技术债 |
| 直连重定向 | `thincoder-core/proxy.mjs` 的 `proxyFetch` 直连支未传 `redirect:"manual"`。本地 302 探针：默认 fetch 得 `status=200 redirected=true finalUrl=…/final`；显式 manual 对照得 `status=302 redirected=false location=/final` | TOOLS 明确仅显式代理支当前保证一次手动跟进并重新过门；直连缺口待登记技术债 |

DeepSeek 前 `new URL` 与 `isPrivateHost` 复查、失败/空内容回本地、初始 URL scheme 与解析检查、主机字面无 DNS、手动代理支重定向状态集与 Location 归一、第二响应不继续跟及显式 HTTP 错误，均已对照 `shared.mjs`、`web.mjs`、`web-deepseek.mjs` 记录。

### 验证

- 对五份改动文档执行 `doc_check(mode:"report")`，结果 = `DOC-CHECK GATE: PASS`。
- `doc_search` 以「ECS 测试环境 部署 回滚 运维手册」和「TEST-ENV-ECS server runner 更新部署 回滚」检索，均直接命中 `docs/TEST-ENV-ECS.md` 的部署、回滚内容；本席未改 manifest 或该手册。
- 上述 URL 与重定向命令是针对性运行探针，不是产品测试套件；本批未运行也不宣称产品测试通过。

本批新债四项，均待主 agent 登记：已声明公共仓跨仓误报、无项目仍运行文档门、IPv6 方括号漏拦、直连自动重定向绕过 Location 复查。本批不修这些代码缺口。

- 主 agent 已逐份复读五份交付；用户裁定、通用路径状态与当前代码缺口分开，SSRF 不把 IPv6/直连重定向写成已防护。
- 主 agent 已完成 manifest 的 TEST-ENV-ECS 检索声明；doc_search 部署/回滚主题直接命中该手册。
- 本批新债 4 条：#2387 IPv6 方括号归一，#2388 直连手动重定向，#2389 公共仓目录形误报，#2390 无项目 target/基根兜底。

## §6 验证与收口（父代理）

- 用户两项裁定已在需求/设计/路径层统一；通用解析状态和当前代码缺口没有混淆。
- SSRF 地址分类、DeepSeek 复查、重定向目标和 DNS 边界已恢复；IPv6 与直连重定向当前缺口如实披露。
- 五份改动文档及最终 DOC-CHECK 复跑均 PASS；TEST-ENV-ECS 可由 doc_search 直接命中。
- 独立复核 #28 通过，勘察范围提示已修为 F1–F11。
- 本批新债 4 条：#2387、#2388、#2389、#2390。未运行产品测试；本批只改文档与检索声明。
