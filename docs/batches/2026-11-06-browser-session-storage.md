# 2026-11-06 · browser-session-storage
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`，§4.19）；非作者一概拒。
> 编制：主 agent · 2026-11-06 · 来源 = 用户 2026-11-06 17:23「我发现个缺口，咱们的浏览器好像没有放开注入cookie之类的工具。」· 17:37 取向「都要（写 + 读 + localStorage/sessionStorage）」· 17:37 逐字裁定「跨域写cookie是必须的不要搞鸡毛审核，我要的是一个测试干活的工具，不是给你一个向我装安全逼的道场！」· 17:38「落」。。
> 台账 = #2111（— · 归批）。前情 = docs/batches/2026-11-06-prompt-system-enum-sync.md（已收口 2026-11-06）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-06
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 需求（父侧 · 2026-11-06 18:32）

**问题**：浏览器工具没有会话态读写面。父侧实读：`thincoder-core/browser/` 十档扫 `cookie|storageState|addCookies|setCookie` ⇒ **命中 0**（`session.mjs` 两处是注释，讲末关落盘）。设计档 `docs/core/design/BROWSER-TOOL.md` 原有「未见性面（设计定）」写死「工具自身**不**读取/输出 profile 内存储」。

**为什么现有面兜不住**：唯一能碰 cookie 的是 `evaluate`，而 `document.cookie` **只给非 httpOnly**——登录令牌通常正是 httpOnly ⇒ 搬登录态这条路走不通，写也写不进去。

**已落需求档**（`docs/core/requirements/BROWSER-TOOL.md`）：

| 条目 | 形 |
|---|---|
| `F-BT20` | `cookies` 三形 `get` ∥ `set` ∥ `clear`，**含 httpOnly**；**跨域直写、不设开关、不设审批门**；回执**值照出不打码** |
| `F-BT21` | `storage` 三形 × localStorage ∥ sessionStorage，**自分不串档**；**免审批门** |
| `N-BT4`（收正） | 原文「工具不读写用户浏览器数据」与新能力相抵 ⇒ 改为「不读写用户**日常**浏览器的数据目录；自有 profile 的会话态可读写；**不读 profile 磁盘文件**」 |
| `N-BT7`（补） | `cookies` ∥ `storage` 六个动作**一律免审** |
| §4 边界 | 「自动凭据填充」收窄为「自动填表登录」并写明**不含**显式注入；新增「不读磁盘 profile 文件」 |
| §6 验收 | `AC-BT1`–`AC-BT7`，其中 **AC-BT1 是立命之条** |

**用户裁定（逐字，2026-11-06 17:37）**：「跨域写cookie是必须的不要搞鸡毛审核，我要的是一个测试干活的工具，不是给你一个向我装安全逼的道场！」⇒ 由此定下：跨域不设门、读出值不打码、写/清不进审批门。**这三条不是实现选择，是需求。**

**边界（不做什么）**：

- **不动既有的 password 隐藏 ∥ clipboard 不回显**（`N-BT4` 旧面 ∥ `N-BT9`）——那是上一批已批准的设计，本批不顺手改别人的面。要动另开批。
- **不做 `storageState` 整份导出/导入专门动作**——`get` / `set` 的组合就够，多一个动作就是多一套语义。
- **不引入第三方库**（`N-BT1` 零依赖不变）。

**验收（可机判）**：见需求档 §6 `AC-BT1`–`AC-BT7`。**其中 `AC-BT1` 是本批的立命之条**：同一登录态下 `cookies get` 回得到 httpOnly 那几条、而 `evaluate` 的 `document.cookie` 回不到——**没有这条对照，就分不清「真加了 cookie 面」与「给 `document.cookie` 套了个壳」**。

**依赖**：`docs/core/design/BROWSER-TOOL.md`（设计权威，本批要改其「未见性面」与动作枚举）；`thincoder-core/browser/`（实现面：`actions.mjs` ∥ `cdp.mjs` ∥ `snapshot.mjs` 族）。

### 修正轮的两条上抛 · 父侧处置（2026-11-06 18:48）

| # | 事项 | 裁定 |
|---|---|---|
| 1 | 需求档首行 `F-BT1–F-BT19` 与新增两条不一致 | **已由父侧改**：`F-BT1–F-BT21 / N-BT1–N-BT10`（需求档 = 主 agent 笔） |
| 2 | 批次冒烟档命名 `docs/batches/2026-11-06-browser-session-storage.smoke.mjs` | **准**。理由：单元档既有形是 `<批档名>.test.mjs`，冒烟档取同一前缀 + `.smoke.mjs` 无歧义；历史冒烟档随批删、盘上无先例可对齐，故按此定形。**这条命名自此成为先例**，后续批次照此 |

**另记一条实质改动（修正轮自报，父侧采认）**：`success:false` 判据换成「写后回读核对」（KD-30）。理由 = 实测造不出 `success:false`（`sameSite:"Bogus"` ∥ `domain:"https://nope"` 都回 `success:true`，后者被存成域 `https`）。**父侧判断**：这不是需求变更，是**判据更换**——需求 `AC-BT6` 要求「回执值与写入值逐字相等」，回读核对正是验它最直接的法子。**准留**。

### 实施轮披露的六条 · 父侧处置（2026-11-06 19:08）

| # | 事项 | 裁定 |
|---|---|---|
| 1 | 集成档跑了两次（§2 写「集成不在本轮跑」） | **准**。理由：新写的用例从未执行等于一条断言；父侧收口那次仍是唯一发布门。**准的是「验自己写的用例」，不是「把集成当回归反复跑」** |
| 2 | §2 读数偏低（`thincoder-core/tools/browser.mjs` 记 +6，实为 162 → 190；`thincoder-core/tool-docs/browser.md` 54 → 56） | **设计笔改**（父侧复量确认：190 ∥ 55）。**这是 D12 的实战场景**——读数写进关系句就没人校正，写进可复跑的表才对 |
| 3 | `cookies clear` 带 `domain` = 该域**及其子域** | **准**，并进设计档 §2.2（现只在工具档写了）。理由：cookie 的 `Domain=.example.test` 本就覆盖其下全部，`get` ∥ `clear` 用同一匹配规则才有单一语义 |
| 4 | **给了但类型非字符串的 `domain` / `key` 被当作「没给」⇒ `clear` 落到全域清空** | **判为实现缺陷，必修。**父侧实读 `thincoder-core/browser/session-state.mjs`：`const filter = typeof args.domain === "string" && args.domain !== "" ? args.domain : null` ——**非法输入没有失败，它升级成了最破坏的动作**。业务门纪律：该失败就失败，不许「顺过去」。**修法 = `validateArgs` 显式拒（见 §2.2 两条新校验句）**，不是靠 schema 类型兜。schema 声明是给人读的，不是运行期防线 |
| 5 | `cookies set` 未给 `domain` 且页面仍 `about:blank` ⇒ 落到浏览器原始 CDP 错 | **判为缺句，必须补**。理由同 `storage` 的首条件：**同一个工具里两类面不能一边有明示句、一边漏原始错** |
| 6 | `AC-BT3` ∥ `AC-BT6` ∥ `AC-BT7` 的机判只在收口即删的批次单元档 | **裁：给一条常驻判据**（`35-1` 尾段加 `cookies clear` 带域 ⇒ 再 `get` 回空，同时覆盖 AC-BT3 与「值照出」的 AC-BT6 面）。理由：`AC-BT7`（免审批）是你逐字裁掉的那条，**它不该由一份收口就删的档来守**。若设计席判断 AC-BT7 无法在集成面判，则明写「只由批次档判、收口即失」并说明为什么——**两条路都行，含糊不行** |

### 实施修正轮上抛 · 父侧处置（2026-11-06 19:27）

| # | 事项 | 裁定 |
|---|---|---|
| A | 设计档 §2.2 的 `依据` 行引的正是**本轮修掉的缺陷代码**（`const filter = typeof args.domain === "string" …`，现 `grep` 0 命中） | **必修（设计笔）**。理由：**引文去核会核到相反行为**——这是最坏的一种证据：它看起来是证据，指向的却是已被推翻的那行。改指现行两句（`cookieDomainError` ∥ `domainFilter`）或删代码引文只留规则句 |
| B | `Network.getAllCookies` 回执畸形 ⇒ 代码明示错，设计 §2.2 无此句 | **必修（设计笔）**，按代码方向补。退回不行：**那是把一个读失败伪装成「关于 cookie store 的事实」**，正是业务门纪律禁止的那一类 |
| C | `domainMatches` 是纯标签后缀匹配，`"0.0.1"` 会匹配 `127.0.0.1` ⇒ 带域 `clear` 可能删掉别的主机条目 | **判为实现缺陷，必修（实施笔）**。父侧判据同 #4：**破坏性动作的匹配必须落在标签边界上**。设计 §2.2 已写「全等 ∥ 子域」——全等与子域本来就带边界，是实现的匹配漏了这道，**不需改设计，改实现** |
| D | `cookies set` 回读只核 `name`+`domain`，同名旧条目会让回读假通过 | **判为必修（设计 + 实施）**。AC-BT6 要求「回执值与写入值逐字相等」，回读不核值 ⇒ **假通过时它报的恰恰是那句话**。回读并核 `value`（`path` 按同批一并定） |
| E | 逐项 `cookies[].domain: null` 仍按「没给」处理，而顶层 `domain: null` 已拒 | **判为不一致，必修**：同一参数两级两套语义，读者只能靠猜。统一为逐项同拒（或统一为逐项也当「未给」——**二选一，写明**） |

### 实施落 C/D/E 后的三笔上抛 · 父侧处置（2026-11-06 19:41）

**先记一条：我 19:27 给裁定 C 的理由是错的，实施席把它纠正了。**

我写的是「全等与子域本来就带边界」。**但 `"127.0.0.1".endsWith(".0.0.1")` 在边界上仍为真**——补上这个洞的不是「边界比较」，是 **IP 字面量判法**（`isIpLiteral`：IPv4 四点形 ∥ 含冒号的 IPv6，任一为 IP 就只剩全等）。**结论（必修）对，理由错。**理由错的判据会教错下一个读它的人——所以设计档必须补这一句，而不只是补代码。

| # | 事项 | 裁定 |
|---|---|---|
| 1 | 设计档 §2.2 缺「IP 字面量只走全等」 | **必修（设计笔）**。理由如上：**只读设计重实现的人会把洞装回去**——他照着「全等 ∥ 子域」写，得到的正是那个会误删 `127.0.0.1` 的实现 |
| 2 | 设计档 §2.2 的「别的域与 host-only 条目一概不动」在代码里判不出 | **必修（设计笔，改措辞）**。`Network.getAllCookies` 的条目没有 host-only 字段 ⇒ 同域的 host-only 条目会被一并删。**句子写的是做不到的事**，读者会据它以为同域 host-only 能保住。改为「别的域的条目（含其 host-only）不动；同域条目一并删」——**写成代码实际做的样子** |
| 3 | `area: null` 仍被当作「没给」⇒ 静默落到 `localStorage` | **判为必修，并入同一轮**。理由 = 裁定 E 立的那条规矩：「**只有键不存在才算没给**」。`area` 是同一族的兄弟参数，**一边拒 `null` 一边放行，读者只能靠猜**。后果虽非破坏性，但「静默落到缺省」与 E 拒掉的「静默落到全域」是同一类：**输入的形不对，行为却照走** |

### 实施轮三的上抛 · 父侧处置（2026-11-06 19:53）

**先说一件我自己的失职**：同一类缺陷已经被我裁了三次（`domain` ∥ `key` ∥ `area`），三次都是「给了但形不对 ⇒ 静默落到别的行为」。**每次都是实施席发现、我事后裁。**根因不在实施，在**设计档把校验写成了逐字段的句子清单，清单必然漏**——`httpOnly` ∥ `secure` ∥ `sameSite` ∥ `expires` 就是这么漏掉的。

**⇒ 本轮不再逐条裁，改为立一条通用规则，一次收口。**

| # | 事项 | 裁定 |
|---|---|---|
| 1 | `httpOnly` ∥ `secure` 给成非布尔 ⇒ 静默按 `false`，回执照报成功 | **必修**，且**不是逐条修**：见下方通用规则。**这一条的严重性最高**——`AC-BT1` 的整个主题就是 httpOnly，而 `httpOnly:"true"` 会得到一条**不是 httpOnly 的 cookie 加一张成功回执**。**判据被自己的实现骗了第二次**（第一次是 D 的回读只核 `name`+`domain`） |
| 2 | `sameSite: ""` 被豁免，而同块的 `domain: ""` 被拒 | **必修**：同一个「给了但形不对」，两级两判 |
| 3 | `expires: ""` 过形检（`Number("") === 0`），到回读才炸 | **必修**：**校验的责任是在写之前拦住，不是让回读去发现** |
| 4 | 代码多出第三个失败变体（` at path "<实际>"`），设计只钉两个 | **必修（设计笔）**：补一句，或退代码——**二选一，不留「代码比设计多说一句」** |
| 5 | 缺 `op` 时两入口句子不同（`storage requires op` ∥ `unknown storage op ""`） | **登记，不修**：`validateArgs` 先拒，工具面不可达。**理由写明**：不可达的分支不值得再改一轮 |
| 6 | §2 读数 `session-state.mjs` 388 已陈（现 396） | **必修（设计笔）**：读数随实施轮走，这是第二次同类 |

**通用规则（本轮要立进设计档的，替代逐字段清单）**：

> **`cookies` 与 `storage` 的每一个声明了类型的参数，判法只有一条：键不存在 = 没给（落缺省或当前页源）；给了就必须是声明类型且形合法，否则显式拒。**没有第二个判法，不设「这个字段宽松一点」的例外。

理由：一张逐字段的清单，**下一个字段加进来就会漏**——本批已经漏了四个。**规则要能回答设计时没想到的那个字段**，清单不能。

### 收口前最后一轮 · 父侧裁定（2026-11-06 20:14）

**这是本批最后一次开轮。此后除关档必需，一律登记不修。**

| # | 事项 | 裁定 |
|---|---|---|
| 1 | §2 的 `依据` 引了本轮删掉的旧码（`item.httpOnly === true`，现 0 命中）⇒ **文档门在收口面会拦** | **必修（设计笔）**：**这是本批第二次同类**（上一次是 19:27 的 A 条）。规则：**引文指向的东西被改掉时，引文必须同轮跟着改**——否则它长得像证据，指向相反行为。改指现行判据句（`typeof item.httpOnly !== "boolean"` 一族） |
| 2 | §2 读数表仍记 396 ∥ 204，现为 435 ∥ 206 | **必修（设计笔）**：第三次同类。**读数不是一次性文书，它随实施轮走** |
| 3 | 顶层 `domain` 放行 `host:port`（`localhost:3000` 两道都过，`get` ∥ `clear` 静默回 0 条） | **必修**：**这是最容易被真用户踩到的一条**——`localhost:3000` 是人写域名的自然写法，而 cookie 的域不含端口。**静默回 0 条比报错更坏：它看起来像「本来就没有」**。补拒句（含端口 ⇒ 明示拒，并说明 cookie 域不含端口） |
| 4 | `storage get` 在 `entries` 缺失时回 `0 key(s)` | **必修**：设计已立「空集合不得顶替读不出」，但只推到 cookies 侧。**同一条规则不能只管一半**——补到 storage 侧，与 cookies 同句形 |
| 5 | `cookies[].name === ""` 落「缺键」句（字段表无此行） | **登记，不修**：句子差别不影响行为（两者都拒），且工具面 `validateArgs` 先拒、不可达 |
| 6 | 回读只核 `value`（给了 `path` 再核 `path`），不核 `httpOnly` ∥ `secure` ∥ `sameSite` | **登记，不修**：`KD-30` 只要求前两项；扩到全部字段是**为一条可能的失败加一条不可达的断言**，与本批一直在拆的东西相反 |
| 7 | 单元档 512 行越过 500 建议线，不拆 | **准**：**收口即删的档不按常驻档的尺寸纪律管**——为一份活一小时的档拆文件，是把纪律用在它不管的东西上 |

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成


### 本批覆盖（需求条目 → 交付面）

| 需求条目 | 形（回指需求档，不复制） | 本批落点 |
|---|---|---|
| `F-BT20` | `docs/core/requirements/BROWSER-TOOL.md` §2 `F-BT20`：`cookies` 三形，含 httpOnly ∥ 跨域直写 ∥ 值照出 | 设计档 §2.2 cookies 行 ∥ §13 |
| `F-BT21` | 同档 §2 `F-BT21`：`storage` 三形 × 两域，自分不串档 | 设计档 §2.2 storage 行 |
| `N-BT4`（收正） | 同档 §3 `N-BT4`：自有 profile 的会话态可读写、磁盘文件不读 | 设计档 §3.4「会话态面」条 |
| `N-BT7`（补） | 同档 §3 `N-BT7`：六个动作一律免审 | 设计档 §3.1 免审面 + 扩展表末两行 |
| 需求 §4 边界 | 「自动填表登录」不含显式注入 ∥ 不读磁盘 profile 文件 | 设计档 §9 末尾三条 |
| 需求 §6 验收 | `AC-BT1`–`AC-BT7` | 本段「验收对照」表 |

**不在本批**（做了就是越界）：

- 不动 password 隐藏 ∥ 剪贴板隐私面（`N-BT4` 旧面 ∥ `N-BT9`）——上一批已批准的设计，要改另开批。
- 不做 `storageState` 整份导出 / 导入动作；不做自动凭据填充 / 撞库。
- 不引第三方库（`N-BT1`）；不改审批 / 权限机制本体——免审 = 同一 `isReadonlyAction` 钩子按动作分类，零新机制。

### 设计档落点（`docs/core/design/BROWSER-TOOL.md`）

| 面 | 落点 |
|---|---|
| 一句话 ∥ 模块结构 | §1（动作面十六 ⇒ 十八；新档 `session-state.mjs`） |
| 接口契约 | §2.1 schema（枚举 +2、新属性四个、`cookies[]` 逐项字段的声明类型）· §2.2 两条动作行 + **参数的形判一条规则**——键不存在 = 没给；给了就必须是声明类型且形合法，否则显式拒，`null` 也算「给了」；字段实例进表，`httpOnly` ∥ `secure` ∥ `sameSite` ∥ `expires` ∥ `path` 由规则本身兜住 · `domain` 一套匹配规则（`get` 与 `clear` 都含子域，IP 字面量只走全等）· 带域 `clear` 的作用域含同域 host-only 条目 · `cookies set` 无 `domain` 且页面无 http(s) origin ⇒ 明示拒 · `set` 的成功判据 = 写后回读逐字核 `value`，`path` 落错另点出实际 path · 取面回执畸形 ⇒ 明示错 |
| 动作预算 | §2.9 表（`cookies` 30s ∥ `storage` 15s） |
| 门面 | §3.1 免审面条 + 扩展分类表末两行 |
| 隔离与凭据 | §3.4 会话态面（替换旧「未见性面」句）· `cookies clear` 不带域 = 清空整份共享 profile 的硬后果 |
| 关键决策 | §6 `KD-27`（两条路的语义差）· `KD-28`（`allowDomains` 收束面）· `KD-29`（取面：三形同走页面会话，不设回落）· `KD-30`（回读核对才是成功判据） |
| 回指 ∥ 用例 | §7 `F-BT20` ∥ `F-BT21` ∥ `N-BT7` 行 · §8 `U75`–`U90` |
| 边界 ∥ UI | §9（不做 `storageState` 整份导出导入 ∥ storage 只作于当前页 origin ∥ 自动填表登录不含显式注入）· §10 第 10 条 |
| 受影响文件 ∥ 集成 | §13（分层结论）· §14（对 `test/RTM.md` 的差量） |

### 机制（四句——每句带实测依据）

- **cookies = 浏览器级存储、页级连接**：三形全走页面会话的 `Network` 域——`get` 取 `Network.getAllCookies`（全 profile，含 httpOnly）、`set` 逐条 `Network.setCookie`、`clear` 有 `domain` 逐条 `Network.deleteCookies`、无 `domain` 走 `Network.clearBrowserCookies`。**不设取面回落**（设计档 `KD-29`）。`domain` 一套匹配规则（全等 ∥ 子域；IP 字面量只走全等），`get` 与 `clear` 共用；`domain` ∥ `key` 给了但形不对 ⇒ 显式拒——「当作没给」会把 `clear` 升级成全域清空（设计档 §2.2）。逐项 `cookies[].domain` 与顶层同一判法（`null` ∥ 非串 ∥ 空串一律拒）；**每个声明了类型的参数都走这一条规则**，`httpOnly` ∥ `secure` ∥ `sameSite` ∥ `expires` ∥ `path` 由此兜住（19:53 裁定 #1–#3——清单必漏，规则不漏）；取面回执畸形（`Network.getAllCookies` 不回数组）⇒ 明示错，不回 `0 cookie(s)`；`domain` 带端口（`localhost:3000`）⇒ 同一句明示拒，不放行成零匹配过滤（设计档 §2.2「`domain` 不带端口」）。
- **storage = 页级面**：`Runtime.evaluate` 读写 `window.localStorage` ∥ `sessionStorage`；值以 JSON 转义往返。只作用于当前页 origin——写别的源要先 `navigate`（浏览器存储本身的界，非保守选择）。全量面页侧回执缺 `entries` ⇒ 明示错、不回 `0 key(s)`（与 cookies 取面同一条理由：空集合不得顶替读不出）。
- **六个动作免审**：不进 `GATED_ACTIONS` ⇒ `isReadonlyAction` 恒真，门闭态 / `planMode` 下照常执行（`AC-BT7`）。
- **回执值不打码**：cookie 逐条一行、标记尾置（`; httpOnly` 等）——这一列正是 `AC-BT1` 的对照面。`set` 的成功判据 = 写后回读核对：按 `name`+`domain` 定位后逐字核 `value`（给了 `path` 的再核 `path`），不是浏览器的 `success`（`KD-30`）——只核 `name`+`domain` 时同名同域覆盖写会拿旧值假通过。

**为什么会翻掉旧稿的机制**（旧稿写 `get` 取 `Storage.getCookies`、`set` 走 `Network.setCookie`、缺则回落）：实测在本机 Edge 147.0.3912.60 上跑的两次探针，见下节读数——浏览器级连接上根本没有 `Network.*`，`Storage.deleteCookies` 也不在；页面会话上四个 Network 方法全在。旧稿的回落分支护的是一个不存在的场景（版本漂移），真实分野是**连接级别**。

### 受影响文件与测试覆盖

全表与跨层结论见设计档 §13（结论：**无档跨层**）。测试面：

| 类 | 档 ∥ 用例 |
|---|---|
| 批次单元档（收口删） | `docs/batches/2026-11-06-browser-session-storage.test.mjs`——`T50`–`T53`（假传输：三形调用面 ∥ 域过滤 ∥ 写后回读核对未落地 ⇒ 错误句 ∥ 同名覆盖写值不符 ⇒ 报错且点名存储值（设计档 `U89`）∥ 取面回执畸形 ⇒ 明示错（`U88`）∥ 形不对的 `domain` ∥ `key` ⇒ 显式拒（`U86`）∥ 逐项字段的类型形判（`httpOnly:"true"` ∥ `secure:1` ∥ `sameSite:""` ∥ `expires:""` ∥ `path:123` 一律拒、零 CDP 命令——`U91`）∥ `path` 落错 ⇒ 点出实际 `path`（`U92`）∥ 逐项 `domain: null` ⇒ 拒（`U86`）∥ 无 `domain` 且 `about:blank` ⇒ 明示拒（`U87`）∥ 带域 `clear` 只删该域及子域（`U85`）∥ 域匹配 IP 只走全等（`U90`）∥ 带端口的 `domain` ⇒ 拒（`U93`）∥ 全量面缺 `entries` ⇒ 明示错（`U94`）∥ `area` 给了 `null` ⇒ 拒（`U86`，代码判据随实施面）∥ 值往返 ∥ 动作枚举含两新动作 ∥ 六形 `isReadonlyAction` 恒真） |
| 批次冒烟档（收口删） | `docs/batches/2026-11-06-browser-session-storage.smoke.mjs`——`S23`（`AC-BT1` 对照 + 跨域直写）∥ `S24`（两域不串档 + 值往返），真 Edge/Chrome |
| 常驻集成 | `test/integration/browser-session-state.test.mjs`——`35-1`（`AC-BT1` ∥ `AC-BT2` ∥ `AC-BT3` ∥ `AC-BT6`，同一行四判据）∥ `35-2`（两域 + 值往返）∥ `35-3`（六形免审：门面读取面 `readonlyActionOf` 逐形为真 + 真跑） |

**本轮验收命令**（变化面单元档）：`node --test docs/batches/2026-11-06-browser-session-storage.test.mjs`（`U85`–`U94` 十条判据进这一档——`U88` ∥ `U90` 是取面畸形回执与 IP 边界两条，`U91`–`U93` 是形判三条，`U94` 住 `T52`）。

集成三档（`browser-session-state` ∥ 既有 `browser-shared-pool` / `browser-start-window`）**不在本轮跑**——集成 = 发布门，父侧收口时一次跑。

旧批单元档已随批删（盘上 `docs/batches/*.test.mjs` 实测 0 档），故无「旧档复跑」这一面。

### 验收对照（每条指回需求档 §6）

| 判据 | 本批怎么验 |
|---|---|
| `AC-BT1`（立命之条） | 集成 `35-1` ①：同页 httpOnly 条在 `cookies get` 里、不在 `document.cookie` 里 |
| `AC-BT2` | 集成 `35-1` ②：当前页在 `localhost`，`set` 带 `domain:"127.0.0.1"` ⇒ 带该域 `get` 读得到（不给任何开关）；单元 `T50`：`domain` 原样交给 `Network.setCookie`，无开关、无审批 |
| `AC-BT3` | 集成 `35-1` ③：带域 `clear` 后该域 `get` 回 0 条、域外那条仍在 ⇒ 写 → 清 → 读回空，且清的是该域不是全清；单元 `T50`：同面逐条删的调用形 |
| `AC-BT4` | 集成 `35-2` ∥ 单元 `T52`：两域各写各读、互不串档 |
| `AC-BT5` | 集成 `35-2` ∥ 单元 `T53`：含中文 ∥ 引号 ∥ 换行 ∥ ≥2KB 的值逐字相等 |
| `AC-BT6` | 集成 `35-1` ④：四段回执零 `****` ∥ `••••`、httpOnly 那条的值逐字相等 ∥ 单元 `T51`（回执零遮挡）∥ `T50` 的 `U89`（同名覆盖写按值核对，不假通过）∥ 冒烟 `S23` |
| `AC-BT7` | 集成 `35-3`：门面读取面 `readonlyActionOf` 六形逐条为真 + 六形真跑（门闭态零审批请求）∥ 单元 `T50` 内：六形 `isReadonlyAction` 恒真 |

`AC-BT3` ∥ `AC-BT6` ∥ `AC-BT7` 的常驻判据落在 `35-1` ③④ 与 `35-3`（设计档 §14）；批次档随收口删，这三条不靠它。

### 读数（量法 + 值；设计档只留关系）

量法 = `readFileSync(f,"utf8").split("\n").length`（Node · 2026-11-06 设计笔收口轮复量，可复跑）。**读数随实施轮走**：实施段每轮复量，设计段在收口轮复量一次。

| 档 | 改前 | 当刻 | 结论 |
|---|---|---|---|
| `thincoder-core/browser/session.mjs` | 473 | 475 | 软线 500 之内 |
| `thincoder-core/browser/queue.mjs` | 200 | 202 | 无软线 |
| `thincoder-core/tools/browser.mjs` | 162 | 207 | 无软线 |
| `thincoder-core/tool-docs/browser.md` | 54 | 56 | 无软线 |
| `thincoder-core/browser/session-state.mjs` | —（新档） | 450 | 无软线 |

- `test/RTM.md` 集成用例行当刻 **129**（量法：正则 `^\|\s*\d+-\d+[a-z]?\s*\|` 计数 · 2026-11-06）、故事号 1–35——已在 ≈50–100 窗口之上。故事 35 三行（`35-1` ∥ `35-2` ∥ `35-3`）全在盘；不删旧行，超窗部分供收口裁。
- `thincoder-core/browser/` 十档扫 `cookie|Cookie|storageState|localStorage|sessionStorage` ⇒ 改前仅 `session.mjs` 两行注释、零实现——故 `session-state.mjs` 是新增档，不是改造既有档。

### 实测读数（本机 Edge 147.0.3912.60 · 2026-11-06 · 设计轮内跑的两次 CDP 探针）

量法：`node` 内 spawn 一份临时 profile 的无头 Edge（`--remote-debugging-port=0`）→ 读 `DevToolsActivePort` → 原生 `WebSocket` 直连 `/json/version` 给的浏览器级端点（以及 `/json/new` 给的页面端点）→ 逐方法调用。

| 面 | 调用 | 结果 |
|---|---|---|
| 浏览器级 | `Storage.getCookies` / `setCookies` / `clearCookies` | 三个都在，均成功 |
| 浏览器级 | `Storage.deleteCookies` | **不在**（`-32601 wasn't found`） |
| 浏览器级 | `Network.getAllCookies` / `setCookie` | **不在**（`-32601 wasn't found`） |
| 页面会话 | `Network.setCookie` / `getAllCookies` / `deleteCookies` / `clearBrowserCookies` / `enable` | 五个全在，均成功 |
| 跨域直写 | 页面在 `about:blank`，`setCookie` 写 `domain:"other.test"` 与 `127.0.0.1`（httpOnly） | 两条都 `success:true` 并落进 store；浏览器级 `Storage.getCookies` 读得到 |
| 定向删他域 | 页面会话 `Network.deleteCookies{name, domain:"other.test"}` | 成功，只删掉那一条 |
| 全清 | `Network.clearBrowserCookies` | 成功，store 归零 |
| 无效输入 | `setCookie{sameSite:"Bogus"}` ∥ `setCookie{domain:"https://nope"}` | **两条都回 `success:true`**；后者被存成域 `https` |

**结论三条**：① `F-BT20` 的立命假设成立（跨域直写真做得到，且不需要任何开关）；② 取 / 写 / 删 / 清四面落在同一个连接（页面会话），无回落可写；③ `success` **不是**有效性判据 ⇒ 成功判据改用写后回读核对（`KD-30`）。

### 修正轮改判（§1 19:27 裁定 A ∥ B ∥ D ∥ E——设计笔落点与实施面后果）

| # | 设计面落地（`docs/core/design/BROWSER-TOOL.md`） | 实施面后果 |
|---|---|---|
| A | §2.2「给了但形不对」条的 `依据` 改指现行拒句（`cookies "domain" must be a non-empty host string …`），并点名判法单源 `cookieDomainError` ∥ `storageKeyError` ∥ `domainFilter`；旧引文指的那行降级码已不在盘，引它等于把反驳当依据 | 零改动 |
| B | §2.2 新增一条「取面回执畸形 ⇒ 明示错」（`U88`）：`Network.getAllCookies` 不回数组 ⇒ `Error: cookies failed — the browser returned no cookie list (Network.getAllCookies)`，且不发 `clearBrowserCookies` | 代码已如此（`allCookies` 的非数组分支）——按此句核一次即可，不新增分支 |
| D | §2.2 cookies 判据格 ∥ §6 `KD-30`：回读按 `name`+`domain` 定位后**逐字核 `value`**，请求给了 `path` 的再核 `path`；值不符的错句 = `the browser holds "<存储值头 80 字符>"`（`U89`） | `cookiesSet` 的 `landed.find` 目前只比 `name`+`domain` ⇒ 须加值比对；同名同域覆盖写此前会拿旧值假通过 |
| E | §2.2 逐项校验：`cookies[].domain` 为 `null` ∥ 非字符串 ⇒ 拒，与顶层同一个判法；只有「键不存在」才算没给（`U86`） | `cookieSetError` 的逐项判定目前放行 `null`（`item.domain !== null`）⇒ 须把 `null` 纳入拒面 |

C（`domainMatches` 的标签边界）判为实施笔，设计 §2.2 已写「全等 ∥ 子域」，不改设计。

### 修正轮三（§1 19:41 三条裁定 · 全为设计笔 · 2026-11-06）

| # | 设计面落地（`docs/core/design/BROWSER-TOOL.md`） | 依据 ∥ 来历 |
|---|---|---|
| 1 | §2.2 新增条「**IP 字面量只走全等**」：任一侧是 IP（IPv4 四点形 ∥ 含冒号的 IPv6）⇒ 不做子域判；理由句写进设计——`"127.0.0.1".endsWith(".0.0.1")` 在标签边界上仍为真，补洞的是「IP 没有子域」，不是「边界比较」 | 父侧 19:41 自纠（给 C 的理由错、结论对）；依据 thincoder-core/browser/session-state.mjs「if (isIpLiteral(c) || isIpLiteral(w)) return false」 |
| 2 | §2.2 的 `clear` 作用域改写：只删该域及其子域；别的域的条目一概不动；**同域条目一并删，含该域下 host-only 的条目**——`Network.getAllCookies` 回执不带 host-only 字段，判定只有域这一条依据，故同域 host-only 的几条保不住 | 父侧 19:41 #2；依据 thincoder-core/browser/session-state.mjs「const picked = all.filter((cookie) => domainMatches(cookie.domain, filter))」 |
| 3 | §2.2 新增条「**`area` 只有「键不存在」算没给**」：给了 `null` ∥ 非串 ∥ 空串 ⇒ `unknown storage area "<x>"`，**不落 `localStorage`**；不另立形检句的理由写进设计（它本就有值域句，一个参数两套句子会让读者猜用哪句） | 父侧 19:41 #3（与 19:27 裁定 E 同一条规矩） |

**同批跟上、一层不能落的面**（D11）：§2.1 `area` 属性注释（给了就必须是这两个之一）· §7 `F-BT20` 行加 `U90`、`F-BT21` 行加 `U86` 的 `area` 格 · §8 用例表新增 `U90`（IP 边界：`"0.0.1"` 取不到 `127.0.0.1`，真子域 `a.0.0.1` 照取）、`U86` 增 `area:null` 一格 · §13 的 `thincoder-core/tool-docs/browser.md` 行内容要求补两条（`domain` 的 IP 只走全等 ∥ `area` 形不对即拒）。

**读数**：以本段「读数」表为准（该表随实施轮复量，第五节即本段末次复量）——段内不再另存一份数字，读数只住一处（D12）。

**留给实施面的两笔**（不是设计笔，本段不动）：`area` 的形检要落在 `validateArgs` 与动作面两处（现 `String(args.area ?? "localStorage")` 静默落缺省、`validateArgs` 把 `null` 排除在拒面外）；`thincoder-core/tool-docs/browser.md` ∥ schema 的 `area` 描述同批补句——内容要求已进设计 §13。

**未动的一笔**：见本段末「修正轮四」的「仍未裁的一笔」（评审轮次 2 的 N5 · `KD-30` 的测量来历）。

### 修正轮四（§1 19:53 六条 + 通用规则 · 全为设计笔 · 2026-11-06）

**这一轮不再逐字段修，改为立一条规则收口**——根因是设计档把校验写成了逐字段的句子清单，清单必然漏（本批已漏四个：`domain` ∥ `key` ∥ `area` ∥ 这一次的 `httpOnly` 族）。规则落 `docs/core/design/BROWSER-TOOL.md` §2.2 的置顶句，逐项字段的声明类型落 §2.1：

> 键不存在 = 没给（落缺省或当前页源）；给了就必须是声明类型且形合法（枚举在册），否则显式拒。没有第二个判法，不设「这个字段宽松一点」的例外——`null` 也算「给了但形不对」，不是「没给」。

| # | 事项 | 设计面落地 | 依据 ∥ 来历 |
|---|---|---|---|
| 1 | `httpOnly` ∥ `secure` 给成非布尔 ⇒ 静默按 `false`，回执照报成功（而 `AC-BT1` 的主题正是 httpOnly） | 规则兜住 + §8 `U91`（`httpOnly:"true"` ⇒ 写之前拒、零 `Network.setCookie`）；§2.1 写明逐项字段的声明类型 | 父侧 19:53 #1；依据 thincoder-core/browser/session-state.mjs「if (item.httpOnly !== undefined && typeof item.httpOnly !== "boolean") {」 |
| 2 | `sameSite: ""` 被豁免，而同块的 `domain: ""` 被拒 | 同一规则：不在 Strict ∥ Lax ∥ None ⇒ 拒（`U91` 一格） | 父侧 19:53 #2 |
| 3 | `expires: ""` 过形检（`Number("")` 得 `0`），到回读才炸 | `expires` 声明类型 = number，**不收字符串、不做 `Number()` 强转**；理由写进设计（空串会写成一条立即过期的 cookie，等于删） | 父侧 19:53 #3 |
| 4 | 代码多第三个失败变体（` at path "<实际>"`），设计只钉两个 | §2.2 cookies 行判据补第三形 + §8 `U92`；**不退回代码**——值对、落点错时只报值会被读成「浏览器里就是你要的值」 | 父侧 19:53 #4「二选一」；依据 thincoder-core/browser/session-state.mjs「at path "${u.heldPath}"」 |
| 5 | 缺 `op` 时两入口句子不同（`storage requires op` ∥ `unknown storage op ""`） | **登记不修**：`validateArgs` 先拒，动作面那句在工具面不可达——不可达的分支不值得再改一轮 | 父侧 19:53 #5 |
| 6 | §2 读数 `session-state.mjs` 已陈 | 读数表按当刻复量（**数字只住本段「读数」表**，段内不复写绝对值） | 父侧 19:53 #6 |

**同批跟上、一层不能落的面（D11）**：§2.1 `cookies[]` 逐项字段的声明类型 · §2.2 规则 + 实例表（`path` 的形 = 以 `/` 开头的 string——cookie 的 path 按协议就是绝对路径）· §7 `F-BT20` 行加 `U91` ∥ `U92` · §8 新增两行 · §13 的 `thincoder-core/tool-docs/browser.md` 行内容要求加五个字段的形判句。

**留给实施面的三笔**（不是设计笔，本段不动）：

- `cookieSetError` 按规则补 `httpOnly` ∥ `secure` 的布尔形判、`path` 形判，`expires` 改纯 number（去 `Number()` 强转），`sameSite` 去 `""` 豁免；`validateArgs` 同批一句（文案单源，与既有两道同判法）。
- `thincoder-core/tool-docs/browser.md` 与 schema 的 `cookies` 描述补句（内容要求已进设计 §13）。
- 批次单元档 T50 补 `U91` 五格 ∥ `U92` 一格。

**仍未裁的一笔**：[上抛·待裁] 评审轮次 2 的 N5（`KD-30` 宜补一个仍可达的测量输入作来历）不在 19:53 六条内，本段不改——`KD-30` 现行两形各有可达输入，是否再补一条测量来历请父侧裁。

### 修正轮五（§1 20:14 收口前最后一轮 · 设计笔 · 2026-11-06）

父侧本轮七条：**必修四条**（#1 `依据` 引了已删旧码 ∥ #2 读数陈旧 ∥ #3 `domain` 放行 `host:port` ⇒ 零匹配静默回 0 条 ∥ #4 `storage get` 缺 `entries` 回 `0 key(s)`）、**登记不修两条**（#5 `cookies[].name === ""` 落「缺键」句 ∥ #6 回读只核 `value`（给了 `path` 再核 `path`））、**准一条**（#7 单元档 512 行不拆）。本段只落设计笔与读数，不动实施码。

| # | 设计面落地（`docs/core/design/BROWSER-TOOL.md`） | 实施面后果 |
|---|---|---|
| 1 | 本段「修正轮四」表的 `依据` 改指现行判据句（`if (item.httpOnly !== undefined && typeof item.httpOnly !== "boolean") {`） | 零改动 |
| 2 | 本段「读数」表按当刻复量（**数字只住本段「读数」表**）；「修正轮三」段内的旧数字改为指向本表 | 零改动 |
| 3 | §2.2 新增条「**`domain` 不带端口**」· 字段表两行（`cookies[].domain` 形加「无端口」、顶层 `domain` 行的拒句括号写明带端口同句拒）· §8 `U93` · §7 `F-BT20` 行 · §13 工具档内容要求 | `badBareHost` 加端口判；`cookies set` 逐项拒句补 `no port`；工具档 ∥ schema 描述同批补句；单元档补 `U93` 三格 |
| 4 | §2.2 新增条「**全量面回执畸形 ⇒ 明示错（storage 侧同句形）**」· storage 行判据 · §8 `U94` · §7 `F-BT21` 行 · §13 工具档内容要求 | `actStorage` 全量面判 `res.entries` 非数组 ⇒ 明示错（`storage failed — the page returned no key list (<area>)`），不回 `0 key(s)`；单元档补 `U94` 一格 |
| 5 | 登记不修（§1 裁定）：句子差别不影响行为，且工具面 `validateArgs` 先拒、不可达 | 零改动 |
| 6 | 登记不修（§1 裁定）：`KD-30` 只要求值与 `path`；扩到全部字段是为一条可能的失败加一条不可达的断言 | 零改动 |
| 7 | 准：单元档 512 行不拆——收口即删的档不按常驻档的尺寸纪律管 | 零改动 |

**`domain` 不带端口的判法为什么是「只含一个冒号且冒号后纯数字」**：IPv6 字面量本身有多个冒号（`::1`），按「含冒号」一刀切会把 §2.2「IP 字面量只走全等」那一条的合法形一起拒掉；而 `<host>:<port>` 恰是单冒号 + 纯数字尾巴。这一形不收，`get` ∥ `clear` 都落在零匹配上 ⇒ 回 `0 cookie(s)` ∥ `0 removed`，读起来像「那个域本来就没有」。

**一处刻意的措辞取舍**：字段表顶层 `domain` 行的「非空主机串」保持原样，端口一句写进同一行的拒句括号与 §2.2 新条。理由 = `§5` 有一条 `依据` 引的正是这一格的原文，改它就把别人的证据降级成引缺；同一规则的表述以「`依据` 可核」为准。

**留给实施面的两笔**（不是设计笔，本段不动）：见上表 #3 ∥ #4 的「实施面后果」列。两笔同属本批已有的那条族——**形不对就拒、读不出就报错**——不加新机制。

**仍未裁的一笔**（沿修正轮四末条，本轮裁定未覆盖）：[上抛·待裁] 评审轮次 2 的 N5（`KD-30` 宜补一个仍可达的测量输入作来历）——`KD-30` 现行两形各有可达输入，是否再补一条请父侧裁。

### 修正轮六（收口轮 · 设计笔复量 ∥ 判据枚举跟上 · 2026-11-06）

**本段只做两件事**：把 §2 的读数按盘上现态复量，把 §2 提到判据的地方与设计档 §8 的用例枚举对齐。不动实现码，不动设计档的规则句（设计档 §2.2 的两条新条已在盘：`domain` 不带端口 ∥ 全量面回执畸形）。

| # | 落地 | 出处 |
|---|---|---|
| 1 | 「读数」表两格改为当刻值：`thincoder-core/tools/browser.mjs` → 207 · `thincoder-core/browser/session-state.mjs` → 450（量法与其余三档不变） | §1 20:14 #2；§5 修正轮五披露 #29 的复量值 |
| 2 | 「本轮验收命令」的判据枚举 `U85`–`U90` → `U85`–`U94`，并点出 `U94` 住 `T52` | 设计档 §8 现表即 `U85`–`U94` 十行；批次单元档 ⑨ ∥ ⑬ ∥ ⑯ ∥ ⑰ ∥ ⑱ 与 `T52` 的 U94 段逐条在盘 |
| 3 | 段内两处复写的绝对行数（修正轮四 #6 ∥ 修正轮五 #2 的表格格）改为指向「读数」表 | 「数字只住一处」是该两行自己写的规矩，复写与它相抵 |
| 4 | 十档勘察句加「改前」二字：改前零实现，故 `session-state.mjs` 是新增档而非改造既有档 | 该句是「为什么新开一档」的理由；文件落盘后原句读起来像在说现在仍是零实现 |

**引文去核（本批第三次同类，一次全核）**：本段新写的两条引文与全档既有各条、设计档内各条，逐条取所指档做子串比对——**全部命中，零 `档缺`、零 `引缺`**，合计 38 条（本段写完后当刻数）。量法：Node 读两档、按同一形提取引文行、对目标档做 `includes` 判定。

**仍未裁的一笔（沿修正轮四末条，父侧两轮未覆盖）**：[上抛·待裁] 端口判的残缺面——设计钉的判法是「单冒号 + 纯数字尾」，故 `localhost:` ∥ `host:abc` ∥ `a:b:c` 三形仍放行、仍落成零匹配的 `0 cookie(s)` ∥ `0 removed`（§5 修正轮五上抛）。设计档 §2.2 的置顶规则「给了就必须是声明类型且形合法」在原则上已覆盖它们（三者都不是合法主机串），但落实它要改形检判法，属实现语义的收放，不由本段自决。

**依据**（本轮所引的契约原句）：

依据 docs/core/design/BROWSER-TOOL.md「判法 = 只含一个冒号且冒号后是纯数字；IPv6 字面量有多个冒号，不在这一道判内」

依据 docs/core/design/BROWSER-TOOL.md「键不存在 = 没给（落缺省或当前页源）；给了就必须是声明类型且形合法（枚举在册），否则显式拒。没有第二个判法，不设「这个字段宽松一点」的例外——`null` 也算「给了但形不对」，不是「没给」。」

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

#### 轮次 1 · 全量设计评审（设计档 §13 ∥ §14 ∥ 批档 §2）

| # | 级别 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | 批档 §2 验收对照「`AC-BT2` … 集成 `35-1` 尾段」↔ 设计档 §14 35-1 行（判据只有 httpOnly 对照）· §14「缺 2 行（35-1 ∥ 35-2）」· §7 F-BT20 行「集成 35-1」 |
| 2 | 🔴 | 未解决 | 批档 §2 风险段「`Storage.getCookies` 可能不在旧版本」∥「**跨域直写未实跑** … **unverified**」——两支回落既无实读观测亦无复现路径（对照 §3.5 剪贴板「实测（本机 Edge）」） |
| 3 | 🟡 | 待改进 | 设计档 §8 U84 落点「单元测试 T25 扩展」· §7 N-BT7 行「单元测试 T25」↔ 批档 §2「旧批单元档已随批删（盘上 `docs/batches/*.test.mjs` 实测 0 档）」+「AC-BT7 … 单元 `T50` 内」 |
| 4 | 🟡 | 待改进 | 设计档 §13「不跨层」行（`thincoder-core/tools/browser.mjs` ∥ `queue.mjs`）· 批档 §2 读数只登记 `session.mjs` 473 行与 `test/RTM.md` 126 行 |
| 5 | 🟡 | 待改进 | 设计档缺本节「最接近先例」行（§12「最接近先例」属共享池批；KD-29 只引回落先例） |
| 6 | 🟡 | 待改进 | 设计档缺公开源核查行（§2.4「公开源核查行」属启动窗批）；F-BT20 参照面 = `Network.getCookies`，设计 get 面取 `Storage.getCookies` 且无核查记录 |
| 7 | 🟡 | 待改进 | 设计档 §2.1 新名 `cookies` ∥ `storage` 动作、`domain` ∥ `area` ∥ `value` 属性、§1 `session-state.mjs`——无三问答复（`existing:` ∥ `none found:`） |
| 8 | 🟡 | 待改进 | 设计档 §2.2 cookies ∥ storage 行无输出上限/截断标记（同表 clipboard read「≤8000 字符 · 截断标记」、evaluate 同）；N-BT3「回执有默认规模上限」 |
| 9 | 🟡 | 待改进 | 设计档 §2.2 cookies 行「`[cookies clear] <N> removed (all domains)`」——共享浏览器下全域清除抹掉他实例登录态（§12）未登记；多条 `cookies set` 部分失败语义未定 |
| 10 | 🟡 | 待改进 | 设计档 §8 U83 句「`Error: storage requires an http/https page origin — current page is "about:blank"`」不在 §2.2 storage 条件校验行内 |
| 11 | 🟡 | 待改进 | 设计档「本批」≥3 个所指：§2.4「本批定死」· §11「（F34 · 本批 · 收口口径）」· §12「拆法①（本批必做）」· §13/§14「本批」；另「评审 N1 那一格」 |
| 12 | 🟡 | 待改进 | 设计档 §9「不做反爬规避/自动凭据填充（需求 §4）」↔ 需求档 §4「自动填表登录）——**不含**显式注入会话态」 |
| 13 | 🟡 | 待改进 | 冒烟 `S23` ∥ `S24` 落点档不在设计档 §13 表、不在批档 §2 测试面表（两表均只列单元档 ∥ 集成档） |
| 14 | 🟡 | 待改进 | 批档 §2「本批回归 = … 既有集成两档（`browser-shared-pool` ∥ `browser-start-window`）全绿」——未给本轮验收命令；集成半入实施轮成本 |
| 15 | 🔵 | 登记 | 需求档首行「（F-BT1–F-BT19 / N-BT1–N-BT10 判定句）」↔ 设计档首行「F-BT1–F-BT21」 |
| 16 | 🔵 | 登记 | 评审面无文档地图 / 无项目标准档；`test/RTM.md` 与源码不在本轮刊面 ⇒ 差量「破 0 · 冗余 0」与 §13 尺寸抽查均 unverified |

计数：🔴 2 · 🟡 12 · 🔵 2（判据：需求覆盖 ∥ 分支来历 6b ∥ 档层 8 ∥ 先例 9 ∥ 勘察 10 ∥ 既有件 11 ∥ 验收可机判）

VERDICT: changes-required

### 轮次 2（评审子代理）

#### 轮次 2 · 逐项复核（对象 = 上轮 2🔴 12🟡 2🔵 + 派生改动 KD-30）

| # | 级别 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已解决 | 批档 §2 验收对照「集成 `35-1` 第二判据：当前页在 `localhost`，`set` 带 `domain:"127.0.0.1"`」↔ 设计档 §14 35-1「② 跨域写：`set` 回执点名 `127.0.0.1`，`get` 带该域读得到」· §14「**AC-BT2 与 AC-BT1 同一行**」 |
| 2 | 🔴 | 已解决 | 设计档 KD-29「**不设取面回落**」+ 批档 §2「实测读数（本机 Edge 147.0.3912.60）」表——旧稿两支虚构回落已删，场景有实读（`-32601 wasn't found` ∥ 跨域直写两条 `success:true`） |
| 3 | 🟡 | 已解决 | 设计档 §8 U84 落点「单元测试 T50」· §7 N-BT7 行「单元测试 T50」（T25 悬空已消；残留见 N1） |
| 4 | 🟡 | 已解决 | 批档 §2 读数表 `session.mjs` 473 ∥ `queue.mjs` 200 ∥ `tools/browser.mjs` 162 ∥ `thincoder-core/tool-docs/browser.md` 54（残留见 N2） |
| 5 | 🟡 | 已解决 | 设计档 §13「**最接近先例**：剪贴板动作 = `thincoder-core/browser/clipboard.mjs`」+ 对齐三条 + 偏离一条 |
| 6 | 🟡 | 已解决 | 设计档 §13「**公开源核查行**」∥「需求档给 F-BT20 的参照 = `Network.getCookies`…取面必须换」段 |
| 7 | 🟡 | 已解决 | 设计档 §13「**三问答复（本批新增的每个名字）**」五行（`none found` ∥ `existing`） |
| 8 | 🟡 | 已解决 | 设计档 §2.2 cookies ∥ storage 行「正文 ≤8000 字符 + 截断标记」 |
| 9 | 🟡 | 已解决 | 设计档 §2.2「**`cookies set` 的部分落地语义**：逐条写、逐条核对；**不做回滚**」∥ §3.4「**`cookies clear` 不给 `domain` = 清空整份共享 profile 的 cookie**」 |
| 10 | 🟡 | 已解决 | 设计档 §2.2「`storage` 首条件（页面无 http(s) origin ⇒ 明示拒）」句面与 U83 对齐 |
| 11 | 🟡 | 未解决（部分） | 设计档 §2.4「**启动窗取值（钳位与非法值，本批定死）**」「**冷启预算（本批定死）**」「**设计前置两行（本批）**」——与 §13/§14 的「本批」所指不同（评审 N1 指针已删、§11/§12 已改归属） |
| 12 | 🟡 | 未解决（部分） | 设计档 §9「**不做自动凭据填充** / 撞库（需求 §4）」↔ 需求档 §4「自动填表登录）——**不含**显式注入会话态」；同节另一处已改为「不做自动填表登录」 |
| 13 | 🟡 | 已解决 | 设计档 §13 表含 `docs/batches/2026-11-06-browser-session-storage.smoke.mjs` 行 ∥ 批档 §2 测试面表「批次冒烟档（收口删）」+ §1 修正轮准其命名 |
| 14 | 🟡 | 已解决 | 批档 §2「**本轮验收命令**（变化面单元档）：`node --test …test.mjs`」·「集成…**不在本轮跑**」 |
| 15 | 🔵 | 已解决 | 需求档首行「（F-BT1–F-BT21 / N-BT1–N-BT10 判定句）」 |
| 16 | 🔵 | 仍登记 | 无文档地图 / 无项目标准档；`test/RTM.md` 与源码不在刊面 ⇒ §14 差量数与 §13 尺寸抽查 unverified |
| N1 | 🟡 | 新增 | 设计档 §7 F-BT7 行「扩展表 = T25（N-BT7 行）」——同表 N-BT7 行已改 T50；批档 §2 落点表「`KD-29`（取面与回落）」而 KD-29 现写「不设取面回落」 |
| N2 | 🟡 | 新增 | 设计档 §13「**不跨层**：改前 473 行（软线 500），加两行后 475」↔ §12「读数：改前绝对行数与量法登记在批档 §2（设计档只给关系与拆分计划）」 |
| N3 | 🟡 | 新增 | 批档 §2 验收对照「单元 `T50`：写 → 清 → 读回空」「单元 `T50` 内：六形 `isReadonlyAction` 恒真」——AC-BT3 ∥ AC-BT7 只在收口即删的批次单元档有判据，档面未登记这一事实 |
| N4 | 🔵 | 新增 | 设计档 §7 标题「（F-BT1–19 / N-BT1–10 → 设计条目 → 用例）」而表内含 F-BT20 ∥ F-BT21 两行 |
| N5 | 🔵 | 新增 | 设计档 KD-30「落点与请求不符 ⇒ 明示错并点名实际落点」——其唯一实测到的错位输入（`domain:"https://nope"` 存成 `https`）已由 §2.2 客户端校验拦掉，宜补一个仍可达的输入作来历 |

计数：🔴 0 · 🟡 待改进 5（#11 #12 N1 N2 N3，均不挡批准）· 🔵 3（#16 N4 N5）· 上轮 16 项已解决 14 项（#11 #12 部分）
KD-30 核：`success` 非有效性判据有实测（`sameSite:"Bogus"` ∥ `domain:"https://nope"` 都回 `success:true`），回读核对的失败句与成功后「只列核对通过的条目」在 §2.2 ∥ U80 自洽。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准（2026-11-06）

| 时点 | 用户原话 | 批的什么 |
|---|---|---|
| 17:23 | 「我发现个缺口，咱们的浏览器好像没有放开注入cookie之类的工具。」 | 提需求（缺口成立） |
| 17:37 | 「都要（写 + 读 + localStorage/sessionStorage 一并）」 | 射程：两面全要 |
| 17:37 | 「跨域写cookie是必须的不要搞鸡毛审核，我要的是一个测试干活的工具，不是给你一个向我装安全逼的道场！」 | **取向裁定**：跨域不设门 ∥ 读出值不打码 ∥ 写清不进审批门 |
| 17:38 | 「落」 | 准需求档 |
| 18:31 | 「自动跑完吧」 | **整批令**：设计 → 评审 → 实施 → 收口全链自动跑完，覆盖批准门 |

**批的是范围、取向与跑法，不是内容对**——内容由评审两轮（`#179` 2🔴 12🟡 2🔵 → `#181` pass）判。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施（eng-coder · 2026-11-06）

**范围** = §2 全部覆盖项：`F-BT20` ∥ `F-BT21` 六形 ∥ `N-BT4` 收正面 ∥ `N-BT7` 免审面 ∥ 需求 §4 边界 ∥ `AC-BT1`–`AC-BT7`。

**改了什么**（九档，全部在设计 `docs/core/design/BROWSER-TOOL.md` §13 受影响文件表内——无越界档）：

| 档 | 动作 | 当刻行数（量法：`readFileSync(f,"utf8").split("\n").length` · 2026-11-06） |
|---|---|---|
| `thincoder-core/browser/session-state.mjs` | 新增：六形实现 ∥ 域过滤 ∥ 写后回读核对 ∥ 回执文法 ∥ 三条页侧 storage 表达式 | 302 |
| `thincoder-core/browser/session.mjs` | +1 import ∥ `ACTION_TABLE` 加 spread ∥ 头注释同批 | 475（软线 500 内） |
| `thincoder-core/browser/queue.mjs` | `ACTION_BUDGETS` +2：cookies 30s ∥ storage 15s | 202 |
| `thincoder-core/tools/browser.mjs` | 枚举 +2 ∥ schema +4 属性（`cookies` / `domain` / `area` / `value`）∥ `validateArgs` 两段条件校验 ∥ 头注释 | 190 |
| `thincoder-core/tool-docs/browser.md` | 两动作描述段 ∥ 免审面 ∥ 隔离与凭据段（旧句「never echoes cookie values」被本批推翻，同批改）∥ allowDomains 收束面补 storage ∥ 超时一览补 storage | 56 |
| `docs/batches/2026-11-06-browser-session-storage.test.mjs` | 新增：T50–T53（假传输 = 内存 cookie store + `node:vm` 里真跑的 storage 替身；零真浏览器） | — |
| `docs/batches/2026-11-06-browser-session-storage.smoke.mjs` | 新增：S23 ∥ S24（真 Edge/Chrome；临时 `HOME` 隔离） | — |
| `test/integration/browser-session-state.test.mjs` | 新增：35-1 ∥ 35-2（常驻集成，临时 `HOME` 隔离） | — |
| `test/RTM.md` | 新增故事 35 两行（35-1 ∥ 35-2） | 集成行 126 → 128 |

### 验收对照（逐条指回需求 §6 ∥ 本批判据）

| 判据 | 怎么验的 | 结果 |
|---|---|---|
| `AC-BT1`（立命之条） | 集成 35-1 ①：本地夹具页 `Set-Cookie: int_sid=…; HttpOnly` ⇒ `cookies get` 行集含该名且带 `; httpOnly`，`evaluate` 的 `document.cookie` 串不含该名（真 Edge 实跑） | ✅ |
| `AC-BT2` | 集成 35-1 ②：当前页在 `localhost`，`cookies set` 带 `domain:"127.0.0.1"` ⇒ 回执点名该域（回读核对通过才列）⇒ 带该域 `get` 读得到；单元 T50 ②断言 `domain` 原样交给 `Network.setCookie`（无开关、无审批） | ✅ |
| `AC-BT3` | 单元 T50 ⑥⑦：有 `domain` 清 ⇒ 逐条 `Network.deleteCookies`、清后同域 `get` 回 0 条；无 `domain` 清 ⇒ `Network.clearBrowserCookies` | ✅ |
| `AC-BT4` | 集成 35-2 ∥ 单元 T52：两域各写各读、互不串档；只写一域的键在另一域读回 `not set` | ✅ |
| `AC-BT5` | 集成 35-2 ∥ 单元 T53：换行 ∥ 引号 ∥ 中文 ∥ ≥2KB 串逐字相等（JSON 转义面比对） | ✅ |
| `AC-BT6` | 单元 T51 ∥ T53：回值逐字相等 ∥ 回执零 `****` ∥ `••••`；冒烟 S23 同面各一次 | ✅ |
| `AC-BT7` | 单元 T50 ⑧：全 18 动作 `isReadonlyAction` 逐条取值（六形恒真、`touch` 三手势、旧八动作分类零变） | ✅ |
| `N-BT4`（收正） | 单元 T50 ⓞ：会话态实现零 `node:` import ∥ 零文件读写调用；工具档同批改口径 | ✅ |
| `N-BT7` | 同 `AC-BT7` 一行 + `GATED_ACTIONS` 不含两新动作（表末两行即分类结论） | ✅ |
| 需求 §4 边界 | 不做 `storageState` 导出导入 ∥ 不读磁盘 profile 文件 ∥ 无自动凭据填充（只搬调用方给的现值）——代码面零对应分支 | ✅ |

### 实跑读数（三条命令 · 2026-11-06）

| 面 | 命令 | 结果 |
|---|---|---|
| 变化面单元档（§2 本轮验收命令） | `node --test docs/batches/2026-11-06-browser-session-storage.test.mjs` | tests 4 ∥ pass 4 ∥ fail 0 |
| 批次冒烟档（真 Edge 147.0.3912.60） | `node docs/batches/2026-11-06-browser-session-storage.smoke.mjs` | 15/15 checks passed（S23 九项 ∥ S24 六项） |
| 集成两档（常驻档，本轮跑一次作自检） | `node --test test/integration/browser-session-state.test.mjs` | tests 2 ∥ pass 2 ∥ fail 0 |

三条在同一轮内各跑两次：第一次全绿后，按内部审计/评审的处置又改了 `session-state.mjs`（取面畸形回执改为明示错）与两处断言，改完三条全部复跑仍全绿——表里是改后那一版的读数。

### 偏离与披露（逐条；均由我自报，非静默）

| # | 事项 | 处置 ∥ 理由 |
|---|---|---|
| 1 | 集成档跑了两次，而 §2 写「集成两档不在本轮跑——父侧收口时一次跑」 | 新写的用例从未执行等于一条断言而非验证；这属于对调度句的偏离，本表登记。父侧收口那次仍是唯一发布门，本轮不动 `browser-shared-pool` ∥ `browser-start-window` 两档 |
| 2 | §2 读数表 `tools/browser.mjs` 记「+6 上下」，实为 162 → 190（+28）；同表登记 `thincoder-core/tool-docs/browser.md` 只给改前 54，实为 56 | 软线不破（该档无软线；`session.mjs` 475 ≤ 500）。§2 是设计笔，本段只报不改 |
| 3 | `cookies clear` 带 `domain` = 该域**及其子域**（与 `get` 的过滤面同一匹配规则）；设计只写「按 domain ∥ 全部」，未定子域语义 | 取「`domain` 一个参数一套匹配」的最小读法：`get` 过滤已明写含子域（U78），若 `clear` 只删精确域，两个动作对同一个参数就给出两套语义。已在 `thincoder-core/tool-docs/browser.md` 的 clear 段写明 |
| 4 | 已给但类型非字符串的 `domain` ∥ `key` 被当作「没给」⇒ 落到全域破坏面（`clear` 全清、`store.clear()`） | **修正轮已修**（§1 19:08 裁定 #4 判为实现缺陷）：文案单源 = `cookieDomainError` ∥ `storageKeyError`，`validateArgs` 与动作面各拒一次，拒在任何 CDP 命令之前（单元 T50 ⑪ ∥ T52 的 U86 段断言 store 一条未少）。原文「留报不动」作废 |
| 5 | `cookies set` 未给 `domain` 且页面仍 `about:blank`（会话刚开、尚未 navigate）⇒ 落到浏览器回的原始 CDP 错，未像 `storage` 那样有明示拒句 | **修正轮已修**（§1 19:08 裁定 #5 判为缺句）：`cookies set requires domain or an http(s) page origin — current page is "<url>"`，拒在写之前；给了 `domain` 的条目仍照写（跨域直写不受这道前提限制——单元 T50 ⑫ 两侧各一条断言）。原文「留报」作废 |
| 6 | `AC-BT3` ∥ `AC-BT6` ∥ `AC-BT7` 的机判只住在收口即删的批次单元档，常驻集只覆盖 `AC-BT1` ∥ `AC-BT2` ∥ `AC-BT4` ∥ `AC-BT5` | 设计 §7 就是这么指派的（§3 轮次 2 的 N3 已登记同一事实）；收口删档后这三条无门，供父侧裁 |

### 自检轮次与终态

| 轮 | 谁 | 结果 | 处置 |
|---|---|---|---|
| 1 | 内部探索审计（explore，只读） | 9 条：2 med ∥ 7 low ∥ 0 high | med① 工具档 allowDomains 漏 `storage`（KD-28 的反面）⇒ 已改；med② `clear` 子域语义未定 ⇒ 已在工具档写明并上表登记；low 两条证明缺口（全 18 动作取值 ∥ 零 fs 结构检）⇒ 已补断言；low 一条超时一览漏 `storage` ⇒ 已改；余为读数与设计笔残留 ⇒ 上表登记 |
| 2 | 内部代码评审（advisor `type=code`） | VERDICT `pass`：0 🔴 ∥ 4 🟡（均未标 must-fix）∥ 3 🔵 | 🟡「取面畸形回执退成空集」⇒ 已改为明示错并补断言 T50 ⑨；🟡「`set` 回执打印回读域，真机断言钉死无点形」⇒ 断言放宽为容忍前导点；🔵「origin 取法复刻 clipboard」⇒ 注释写明是取舍不是漏看；余两条 🟡 属设计笔/收口协调（上表 #4 #6），一条 🔵 属读数卫生（上表 #2） |

**终态 = `clean`**：无未处置的 must-fix 项；三条实跑全绿；文档门 `doc_check(mode:"gate")` = `PASS`（范围：`test/RTM.md` ∥ `thincoder-core/tool-docs/browser.md`）。

**依据**（实现所依据的契约原句）：
依据 docs/core/design/BROWSER-TOOL.md「`get` = `Network.getAllCookies`（全 profile，含 httpOnly）」
依据 docs/core/requirements/BROWSER-TOOL.md「回执 = 条数 + 逐条的域 ∥ 名 ∥ 值（**值照出、不打码**：打码等于没给）」
依据 docs/core/requirements/BROWSER-TOOL.md「值往返不损：含中文 ∥ 引号 ∥ 换行 ∥ 长串（≥2KB）的值，`set` → `get` 逐字相等」

### 修正轮（§1 19:08 六条裁定中判为必修 ∥ 必须补 ∥ 给常驻判据的三条 · 2026-11-06）

**范围** = 裁定 #4（畸形 `domain` ∥ `key` 必须明示拒）∥ #5（`cookies set` 无 `domain` 且页面无 http(s) origin 必须明示拒）∥ #6（`AC-BT3` ∥ `AC-BT6` ∥ `AC-BT7` 要有常驻判据）。#1（集成跑两次）∥ #2（读数）∥ #3（`clear` 含子域）已在父侧处置里结掉，本段不动。

| 裁定 | 落点（代码 ∥ 用例） |
|---|---|
| #4 | 文案单源 = `thincoder-core/browser/session-state.mjs` 的 `cookieDomainError` ∥ `storageKeyError`。工具面 `validateArgs` 先拒（模型面拿到的第一句就是它）；动作面 `domainFilter` ∥ `actStorage` 再拒一次，位置在 `ensureSession` 与任何 `h.call` 之前。单元 T50 ⑪（`domain:123` ∥ `""` ⇒ 拒，`METHODS` 为空、store 一条未少）、T52 的 U86 段（`key:42` ⇒ 拒、`localStorage.length` 仍 1）；`key:""` 是合法键名，另一条断言钉住不误拒 |
| #5 | `cookiesSet` 在写之前判：`cookies set requires domain or an http(s) page origin — current page is "<url>"`。同一处两侧各一条断言：无 `domain` ⇒ 拒且零 CDP 命令；给了 `domain` ⇒ 照写（跨域直写是 `F-BT20` 的本体，不许被这道前提误伤） |
| #6 | `test/integration/browser-session-state.test.mjs`：35-1 尾段加 ③（带域 `clear` ⇒ 该域 `get` 回 `0 cookie(s)`、`localhost` 那条仍在）④（四段回执零 `****` ∥ `••••`、httpOnly 那条的值逐字相等）；新增 35-3（`readonlyActionOf` 六形逐条为真 + 六形真跑 + `set` 回读得到）。`test/RTM.md` 同步：加 35-3 行、35-1 判据补 ③④、★ 行改 35-1–35-3 |

**`AC-BT7` 的判据面（按裁定 #6 的第二条路明写）**：常驻判据读门面的公共输入 `readonlyActionOf(browserTool, "browser", args)` 逐形为真，再六形真跑。它**不**随收口消失；但它**不是**「门关态端到端跑一遍」——`browserTool.execute` 直调面绕得过门禁，设计 §14 已写明「零审批」只能在门面上读。这是设计给的读面，不是本轮缩水。

**修正轮读数**（量法 = `readFileSync(f,"utf8").split("\n").length` · Node · 2026-11-06 · 改后当刻）：

| 档 | 当刻 | 与上一轮之差 |
|---|---|---|
| `thincoder-core/browser/session-state.mjs` | 347 | +45（两条形检 ∥ 域归一 ∥ origin 读法外提 ∥ 注释） |
| `thincoder-core/tools/browser.mjs` | 202 | +12（import ∥ 两段形检 ∥ 注释） |
| `thincoder-core/browser/session.mjs` | 475 | 0（软线 500 内） |
| `thincoder-core/browser/queue.mjs` | 202 | 0 |
| `thincoder-core/tool-docs/browser.md` | 56 | 0 行数差（改的是 `cookies` ∥ `storage` 两行的措辞） |
| `test/RTM.md` 集成用例行 | 129 | +1（35-3；与 §2 预告的 129 一致） |

**修正轮实跑**（三条命令 · 2026-11-06）：

| 面 | 命令 | 结果 |
|---|---|---|
| 变化面单元档 | `node --test docs/batches/2026-11-06-browser-session-storage.test.mjs` | tests 4 ∥ pass 4 ∥ fail 0 |
| 批次冒烟档（真 Edge 147.0.3912.60） | `node docs/batches/2026-11-06-browser-session-storage.smoke.mjs` | 15/15 checks passed |
| 集成三档（本轮新写用例的自检——沿 #1 的口径） | `node --test test/integration/browser-session-state.test.mjs` | tests 3 ∥ pass 3 ∥ fail 0 |

**本轮披露（逐条；我自报，非静默）**：

| # | 事项 | 处置 ∥ 理由 |
|---|---|---|
| 7 | 形检在工具面与动作面各拒一次，而设计 §2.2 只点名 `validateArgs` | 动作面才是真正执行「最破坏动作」的那一层：只留工具面一道，任何直调 `runAction` 的内部路径仍会把非法输入升级成全清。文案仍单源，第二道只多一个调用点，不新增第二套句子 |
| 8 | `domain` 的空白串（`"   "`）一并拒，而设计只写「给了空串」 | 「非空主机字符串」的读法：空白串不是主机名；`cookies set` 的 `badBareHost` 本就按 `trim()` 判空白，两处取同一判法才不会「同一参数两级两套」。收窄一个形，不放宽任何动作 |
| 9 | `cookies set` 的回读只核 `name`+`domain`，不核 `value` ∥ `path` | 内部评审指出：同名覆盖写时旧条目会让回读假通过。这是判据面的盲区，但核什么由设计定——改判据属设计笔，故报给父侧裁（评审标为可选、非 must-fix） |
| 10 | 逐项 `cookies[].domain: null` 仍按「没给」处理，而顶层 `domain: null` 已拒 | 逐项这一豁免是上一轮的既有行为，设计 §2.2 的逐项句只列三形（含 `://` ∥ 含 `/` ∥ 含空白）；本轮不动没被裁过的语义，报出供父侧定 |

**自检轮次（本轮）**：

| 轮 | 谁 | 结果 | 处置 |
|---|---|---|---|
| 3 | 内部探索审计（explore，只读） | 5 条：0 high ∥ 2 med ∥ 3 low | med① 我上一笔编辑把 T50 的 ⑨ 段（取面畸形回执）整段吞掉了，而 ⑨ 正是记录里声称已补的断言 ⇒ 已复原并顺手补上「`clear` 读到畸形回执也不许报 `0 removed`」一条；med② `AC-BT7` 的「门关态」只在散文里 ⇒ 已按设计 §14 的读面在记录里写明判据面；low 三条（设计档缺畸形回执规则 ∥ 设计档 §2.2 依据句引了已删的旧码 ∥ 读数落后）⇒ 前两条是设计笔、上抛，第三条本段已复量 |
| 4 | 内部代码评审（advisor `type=code`） | VERDICT `pass`：0 🔴 ∥ 3 🟡（均未标 must-fix）∥ 4 🔵 | 🟡① 设计档 §2.2 的「依据」引的是被本批推翻的旧码 ⇒ 上抛（设计笔）；🟡② 本段偏离表 #4 #5 仍写「留报不动」⇒ 已就地改写为「修正轮已修」；🟡③ 回读只核 `name`+`domain` ⇒ 上表 #9 登记。🔵 四条：逐项 `null` 不对称（上表 #10）、`domainMatches` 对 IP 形不做界（兄弟条目，未改）、读数（本段已复量）、`storage set` 回执的 `chars` 用 UTF-16 码元（沿 `insert` ∥ `clipboard` 同口径，未改） |

**修正轮终态 = `clean`**：无未处置的 must-fix 项；三条实跑全绿；文档门 `doc_check(mode:"gate")` = `PASS`（范围：`test/RTM.md` ∥ `thincoder-core/tool-docs/browser.md`）。

**待父侧裁的两笔（设计笔，我不改）**：

- 设计档 §2.2 的「依据」句引了 `thincoder-core/browser/session-state.mjs` 里已被本批删掉的旧码（`const filter = typeof args.domain === "string" …`）——旧码正是裁定 #4 要修的那个降级；引文换成现行两句或删掉。
- 设计档 §2.2 未写「取面回执畸形（`Network.getAllCookies` 不回数组）⇒ 明示错」，而代码在这么做了（`cookies failed — the browser returned no cookie list`）；要么补一句进设计，要么代码退回去（退回就是把读失败报成 `0 cookie(s)`，不建议）。

**依据**（本轮实现所依据的契约原句）：
依据 docs/core/design/BROWSER-TOOL.md「给了但形不对 ⇒ 显式拒，不当作没给」
依据 docs/core/design/BROWSER-TOOL.md「明示拒，不落到浏览器的原始 CDP 错」
依据 docs/core/design/BROWSER-TOOL.md「写 → 清 → 读回空，且清的是该域不是全清」

### 修正轮二（§1 19:27 裁定 C ∥ D ∥ E · 2026-11-06）

**范围** = 三条「判为实施笔」的裁定：C（`domainMatches` 的主机边界）∥ D 的实施半（回读核 `value`、请求给了 `path` 的再核 `path`）∥ E（逐项 `cookies[].domain: null` 与顶层同一判法）。A ∥ B 与 D 的设计半属设计笔，本段不动。

| 裁定 | 落点（代码） | 用例 |
|---|---|---|
| C | `thincoder-core/browser/session-state.mjs`：新增 `isIpLiteral`；`domainMatches` = 全等 → 两边任一为 IP 字面量则不成子域 → `endsWith("." + w)` | T50 ⑬ |
| D | 同档 `cookiesSet`：按 name+bare(domain) 取 `candidates`，`hit` 还要求 `value` 逐字相等、请求给了 `path` 时 `path` 相等；不符走新增的 `describeUnlanded` | T50 ⑭ |
| E | 同档 `cookieSetError`：逐项 `domain !== undefined` 即按裸主机形检；`cookiesSet` 的 `needsOrigin` ∥ 落点取值改判 `=== undefined`，空串不再算「没给」 | T50 ⑮ |

**为什么 C 是 IP 判法而不是边界判法**：`"127.0.0.1".endsWith(".0.0.1")` 为真，且这一处确实落在标签边界上。补上这个洞的是「IP 字面量没有子域」这条，不是边界比较本身。设计档只有「全等 ∥ 子域」，故这条规则暂无设计落点（见下上抛）。

**改了什么（五档）**：

| 档 | 动作 | 当刻行数（量法：`readFileSync(f,"utf8").split("\n").length` · Node · 2026-11-06） |
|---|---|---|
| `thincoder-core/browser/session-state.mjs` | `isIpLiteral` 新增 ∥ `domainMatches` 边界 ∥ `cookieSetError` 逐项 `null` ∥ `cookiesSet` 回读核值核 path ∥ `describeUnlanded` ∥ 头注释同步 | 388 |
| `thincoder-core/tools/browser.mjs` | `domain` schema 描述句（IP 只走全等 ∥ 形不对即拒、不当作没给） | 202 |
| `thincoder-core/tool-docs/browser.md` | `cookies` 一段（回读核值核 path ∥ IP 只走全等 ∥ 逐项 domain 同拒） | 56 |
| `docs/batches/2026-11-06-browser-session-storage.test.mjs` | T50 加 ⑬（IP 边界：`get` ∥ `clear` 过滤 `"0.0.1"` 不碰 `127.0.0.1`，全等 IP 照删）∥ ⑭（旧值 ⇒ 报错；真回写 ⇒ 列该条；`path` 落错 ⇒ 报实际 path）∥ ⑮（逐项 `null` ∥ `""` 在两个入口各拒，零 CDP 命令） | 415 |
| `test/integration/browser-session-state.test.mjs` | 零改（35-1 ③ 的带域 `clear` 走 IP 全等，行为不变——已实跑复认） | 207 |

集成面零改动：`test/RTM.md` 的集成用例行仍 129 行，故事 35 三行（35-1 ∥ 35-2 ∥ 35-3）在盘、判据未变。

**实跑读数（四条命令 · 2026-11-06）**：

| 面 | 命令 | 结果 |
|---|---|---|
| 变化面单元档（§2 本轮验收命令） | `node --test docs/batches/2026-11-06-browser-session-storage.test.mjs` | tests 4 ∥ pass 4 ∥ fail 0 |
| 批次冒烟档（真 Edge 147.0.3912.60） | `node docs/batches/2026-11-06-browser-session-storage.smoke.mjs` | 15/15 checks passed |
| 集成三档（新写用例的自检——沿 §1 19:08 裁定 #1 的口径） | `node --test test/integration/browser-session-state.test.mjs` | tests 3 ∥ pass 3 ∥ fail 0 |
| 语法（`thincoder-cli`） | `node scripts/check-syntax.mjs` | 125 file(s) OK |

**本轮披露（逐条；我自报，非静默——接上一块的编号）**：

| # | 事项 | 处置 ∥ 理由 |
|---|---|---|
| 11 | 改了两档不在本 spawn 声明文件表里的档：`thincoder-core/tool-docs/browser.md` ∥ `thincoder-core/tools/browser.mjs` | 两处都是同一行为的对外句：D 改了成功判据、C 改了匹配面。留着旧句就是文档说一套、代码做一套（落后的那一层会成为下一轮的指令）。行为零新增 |
| 12 | 回读不符的错句在「browser holds "<值>"」之后，`path` 落错时再带 ` at path "<实际>"` | 设计档 §2.2 只给两句，且都假设值是旧的；`path` 这一支是值对、落点错，只报值会被读成「浏览器里就是你要的值」 |
| 13 | 设计档 §2.2 没有 IP 字面量这条，代码补了 | 裁定 C 的理由句是「全等与子域本来就带边界」，而 `"127.0.0.1".endsWith(".0.0.1")` 在边界上仍为真。设计笔不归我，上抛 |
| 14 | `get` 一并收紧（不只 `clear`） | 设计档 §2.2 明写 `domain` 一套匹配规则、`get` 与 `clear` 共用；两面不同判法就是同一个参数两套作用域 |

**上抛（设计笔，我不改）**：

- [上抛·待裁] 设计档 §2.2 差一句「IP 字面量只走全等」（用例表可另加一条 U 条）。只读设计重实现的人会把 C 的洞装回去。
- [上抛·待裁] 设计档 §2.2 的 `clear` 作用域句「别的域与 host-only 条目一概不动」在代码里判不出 host-only：`Network.getAllCookies` 的条目没有这个字段，匹配按「同一域及其子域」走，故同域的 host-only 条目会一并删。宜改成「别的域的条目（含其 host-only 条目）」或明写同域一并删。
- [上抛·待裁] `area: null` 与裁定 E 同形：`thincoder-core/tools/browser.mjs` 的 `validateArgs` 把 `area` 的 `null` 排除在拒面外，动作面 `String(args.area ?? "localStorage")` 静默落缺省；设计档 §2.2 的 storage 条件句是「`unknown storage area "<x>"`」。后果是「静默落到 localStorage」而非破坏性动作，且不在 C/D/E 三条裁定内，故未自改——请裁是否并入下一轮。

**自检轮次与终态（本轮）**：

| 轮 | 谁 | 结果 | 处置 |
|---|---|---|---|
| 1 | 内部探索审计（explore，只读） | 3 条：0 high ∥ 1 med ∥ 2 low | C ∥ D ∥ E 逐问判 ok，无实现缺陷。med = 设计档缺 IP 规则（设计笔、上抛）；low 两条 = 「holds」句多一个 ` at path` 尾句（上表 #12）∥ `clear` 的 host-only 句歧义（上抛） |
| 2 | 内部代码评审（advisor `type=code`） | VERDICT `pass`：0 🔴 ∥ 1 🟡（未标 must-fix）∥ 6 🔵 | 🟡 = `area: null`（裁定 E 的兄弟参数）⇒ 上抛，未自改。🔵 六条：逐项形检在 `ensureSession` 之后（模型面 `validateArgs` 已先拒，故不可达）∥ 动作面缺 `op` 的句子与工具面不同句 ∥ `storage get` 把 `entries` 缺失映射成 `0 key(s)` ∥ IPv6 域形未归一（unverified）∥ `expires` 靠 `Number()` 强转收下空串 ∥ 批次档的零 `node:` import 检是对源码文本的正则依赖。除 🟡 外均未改：三条属设计笔、三条属既有面的边角 |

**终态 = `clean`**：0 项 must-fix 未处置；四条命令全绿；文档门读数见下面一块。

**依据**（本轮实现所依据的契约原句）：
依据 docs/core/design/BROWSER-TOOL.md「全等 ∥ 子域（`Domain=.example.test` 本就覆盖其下全部）」
依据 docs/core/design/BROWSER-TOOL.md「`set` 过后按 `name`+`domain` 重读一次，逐字比对 `value`（请求给了 `path` 的条目再核 `path`）」
依据 docs/core/design/BROWSER-TOOL.md「逐项与顶层同一个判法（顶层 `domain` 的 null ∥ 非串 ∥ 空串一律拒，见下条）」

**文档门读数（本段写完即跑）**

| 范围 | 命令 | 结果 |
|---|---|---|
| `thincoder-core/tool-docs/browser.md` ∥ 本批档 | `doc_check(mode:"gate")` | `DOC-CHECK GATE: PASS`（2 档全清，0 段有问题） |
| 本段追加时的工具侧门 | `batch append §5` 回执 | `[doc-check gate] DOC-CHECK GATE: PASS · 范围 3 档` |

### 实施记录 · `area` 形检两入口 + 描述面同拍（eng-coder · 2026-11-06）

**本 spawn 的任务面** = §2「留给实施面的两笔」，不含设计笔。

两笔：① `area` 的形检落在工具面 `validateArgs` 与动作面 `actStorage` 两处（原 `String(args.area ?? "localStorage")` 静默落缺省、`validateArgs` 把 `null` 排除在拒面外）；② `thincoder-core/tool-docs/browser.md` ∥ schema 的 `area` 描述同批补句（内容要求由设计 §13 给）。

设计侧 `area` 条已在盘（§2.2 修正轮三 #3），本段只做实现，不改设计；集成三档按 §2 不在本轮跑。

**改了什么（四档）**

| 档 | 动作 | 当刻行数（量法：`readFileSync(f,"utf8").split("\n").length` · 2026-11-06） |
|---|---|---|
| `thincoder-core/browser/session-state.mjs` | `actStorage` 的 `area` 取值改「只有键不存在算没给」∥ 新增 `typeof` 形判 ∥ 头注释补 `area` 那一段 | 396 |
| `thincoder-core/tools/browser.mjs` | `validateArgs` 的 storage 段：`area` 去掉 `!== null` 豁免、并加 `typeof` 形判 ∥ `area` schema 描述补句 | 204 |
| `thincoder-core/tool-docs/browser.md` | storage 行的 `area` 描述补句（形不对即拒、不落缺省） | 56 |
| `docs/batches/2026-11-06-browser-session-storage.test.mjs` | T52 的 U86 段：`area` 四形 × 两入口各一条断言 ∥ 缺省正例一条 | 443 |

**形判为什么不靠 stringify**：`String()` 只用来渲染错误句。`["localStorage"]` 会 stringify 成合法域名，若拿字符串化结果判形，「非字符串 ⇒ 拒」就落空，而兄弟参数 `domain` ∥ `key` 的形检都只认 `typeof`。

**实跑读数（四条命令 · 2026-11-06）**

| 面 | 命令 | 结果 |
|---|---|---|
| 变化面单元档（§2 本轮验收命令） | `node --test docs/batches/2026-11-06-browser-session-storage.test.mjs` | tests 4 ∥ pass 4 ∥ fail 0 |
| 语法 | `node scripts/check-syntax.mjs`（cwd = `thincoder-cli`） | 125 file(s) OK |
| 文档门 | `doc_check(mode:"gate")`（范围 = 本段写过的 `thincoder-core/tool-docs/browser.md`） | `DOC-CHECK GATE: PASS` |
| 两入口逐形探针 | 直接调 `SESSION_STATE_ACTIONS.storage` ∥ `browserTool.execute` | `null` ∥ `123` ∥ `""` ∥ `true` ∥ `{}` ∥ `["localStorage"]` ∥ `["sessionStorage"]` 七形两入口全拒；省略 ⇒ `localStorage`，显式两值照取 |

**断言不是空转**：改前的 `String(args.area ?? "localStorage")` 对 `area: null` 取到 `localStorage`，`assert.rejects` 会因其未拒而失败 ⇒ 新断言可倒；`["localStorage"]` 那一格同理（改前会照读缺省域）。

**披露（逐条；接上一块编号）**

| # | 事项 | 处置 ∥ 理由 |
|---|---|---|
| 15 | `thincoder-core/tool-docs/browser.md` ∥ 批次单元档同批改 | 两处都在本 spawn 声明文件表内（声明面四档全用上），零越界档 |
| 16 | `area` 的形判改用 `typeof`，比「非字符串 ⇒ 拒」多拦「stringify 后恰好合法」那一形（`["localStorage"]`） | 设计句写的就是「非字符串」，字符串化判形会让该句落空；拒句仍用同一句值域句，不新增第二套句子 |
| 17 | 形判在工具面与动作面各一道 | 同 `domain` ∥ `key` 的既有裁决（本段上文 #7）：`browser-async` 直调 `runAction`，只留工具面一道仍有非法输入照走的路 |
| 18 | `area` 为数组时错误句渲染成 `unknown storage area "localStorage"`（读起来像「合法值被判未知」） | 渲染按设计给的 `unknown storage area "<x>"` 单一形式；换渲染形会新增第二套句子，属设计笔，未自改 |

**上抛（设计笔 ∥ 未裁语义，我不改）**

- [上抛·待裁] `httpOnly` ∥ `secure` 给了非布尔（如 `httpOnly: "true"`）被 `item.httpOnly === true` 静默收成 `false`，回读只核 `value`（与 `path`）⇒ 成功回执指向一条没有 httpOnly 的 cookie。设计 §2.2 有 `name` ∥ `value` ∥ `sameSite` ∥ `expires` ∥ `domain` 的校验句，这两个字段没有：要么补校验句，要么把标记纳入回读核对。AC-BT1 的主角正是 httpOnly，故报出。
- [上抛·待裁] `sameSite: ""` 被 `item.sameSite !== ""` 豁免、按「没给」处理，而同一校验块里 `cookies[].domain: ""` 是拒 —— 同一个「给了但形不对」在两参数上两套判法。
- [上抛·待裁] `expires: ""` 过 `Number.isFinite(Number(""))`（得 0）⇒ 以 `expires: 0` 发出（立即过期的 cookie），错句落在回读面而非形检面。
- [上抛·知会] 设计 §2.2 的失败句只两形，代码多一形：`held` 之后再带 ` at path "<实际>"`（值对、落点错那一支）。本档修正轮二 #12 已披露，由设计席补句或代码退回。
- [上抛·知会] 缺 `op` 时两入口句子不同（工具面 `storage requires op` ∥ 动作面 `unknown storage op ""`）；工具面先拒，故不可达。
- [上抛·知会] §2 读数表记 `session-state.mjs` 388 行，本段改后 396 行（该档无软线）。§2 是设计笔，本段只报不改。

**自检轮次与终态**

| 轮 | 谁 | 结果 | 处置 |
|---|---|---|---|
| 1 | 内部探索审计（explore，只读） | `divergence: 0 条`（a ∥ b ∥ c 三问皆 ok；另报三条不计偏差的事实） | 其中「工具面 `area` 只断言 `null` ∥ `""`」一条 ⇒ 已补 `123` ∥ `["localStorage"]` 两格，两入口四形对齐 |
| 2 | 内部代码评审（advisor `type=code`） | VERDICT `pass`：0 🔴 ∥ 2 🟡（均未标 must-fix）∥ 6 🔵 | 🟡① `area` 判形靠 stringify ⇒ **已修**（两入口加 `typeof`、用例补 `["localStorage"]`）并复跑绿；🟡② `httpOnly` ∥ `secure` 静默收 `false` ⇒ 设计笔，上抛；🔵 六条：`sameSite: ""` 豁免 ∥ `expires: ""` 强转 ∥ `at path` 尾句 ∥ 缺 `op` 两句 ∥ 单元档对源码文本的正则依赖 ∥ §2 旧读数。处置：前两条属未裁语义、`at path` 与缺 `op` 两条属设计笔 ⇒ 上抛；单元档一条已补 `area` 两格（源码正则未动）；读数本段已复量 |

**终态 = `clean`**：0 项 must-fix 未处置；单元档 4/4 绿、语法 125 档 OK、文档门 PASS；两条 🟡 一条已修、一条上抛。

**依据**（本轮实现所依据的契约原句）：

依据 docs/core/design/BROWSER-TOOL.md「`area` 形不对即拒、不落缺省」

依据 docs/core/design/BROWSER-TOOL.md「不静默落到 `localStorage`」

依据 docs/core/design/BROWSER-TOOL.md「它本就有值域句（枚举二选一）」

### 修正轮四实施 · 通用形判规则落代码（eng-coder · 2026-11-06）

**本 spawn 的任务面** = §1 19:53 的通用规则 + 同块「留给实施面的三笔」，不含设计笔。

三笔：① `cookieSetError` 按规则补 `httpOnly` ∥ `secure` 的布尔形判、`path` 形判，`expires` 改纯 number（去 `Number()` 强转），`sameSite` 去 `""` 豁免，`validateArgs` 同批一句（文案单源）；② `thincoder-core/tool-docs/browser.md` 与 schema 的 `cookies` 描述补句（内容要求由设计 §13 给）；③ 批次单元档 T50 补 `U91` 五格 ∥ `U92` 一格。

**改了什么（四档，全在本 spawn 声明文件表内——零越界档）**

| 档 | 动作 | 当刻行数（量法：`readFileSync(f,"utf8").split("\n").length` · 2026-11-06） |
|---|---|---|
| `thincoder-core/browser/session-state.mjs` | `cookieSetError` 按 §2.2 字段表逐项落形判（`name` ∥ `value` 分「缺键」与「类型不对」两句、`path` 形、`expires` 纯 number、`httpOnly` ∥ `secure` 布尔、`sameSite` 去豁免）∥ `cookiesSet` 逐字段原样交给浏览器（去 `=== true` 收窄、去 `Number()` 强转）∥ `normalizeSameSite` 只收 string、去 `trim()` ∥ `cookieDomainError` 委派 `badBareHost`（顶层与逐项同一判法）∥ `actCookies` 的逐项形检前移到 `ensureSession` 之前 ∥ 头注释同步 | 435 |
| `thincoder-core/tools/browser.mjs` | `cookies` schema 描述补五个字段的形判句（`path` ∥ `expires` ∥ `httpOnly` ∥ `secure` ∥ `sameSite`；`httpOnly:"true"` 的反例写明）∥ `validateArgs` 注释写单源与一条判法 | 206 |
| `thincoder-core/tool-docs/browser.md` | `cookies` 一段补五个字段的形判句 ∥ `null` 算「给了但形不对」∥ 零静默默认 | 56 |
| `docs/batches/2026-11-06-browser-session-storage.test.mjs` | T50 补 ⑯（`U91` 五形 + 三形 `sameSite` + 五形 `null`，两入口各一条、零 CDP 命令、正例不误伤）∥ ⑰（字段表 `name` ∥ `value` 两句）∥ ⑬ 补 `a.0.0.1` 真子域格（`U90` 第二半）∥ ⑪ 补顶层 `domain` 三形（`https://nope` ∥ `example.test/app` ∥ 尾随空白）∥ `U92` 钉成逐字相等 | 512 |

**三笔逐条对照**

| 笔 | 落点 | 判据面 |
|---|---|---|
| ① | `cookieSetError` 现按「键不存在 = 没给；给了就必须是声明类型且形合法」逐项判；`validateArgs` 与动作面同调这一个函数 ⇒ 两处同句（D2） | ⑯：五形 ×（动作面 + 工具面）各拒、`METHODS` 为空、`store.length === 0`；`null` 五形同拒；正例（`path:"/"` ∥ `expires` 数值 ∥ `false` ∥ `"None"`）照写 |
| ② | 工具档一段 + schema 一句，五字段与 `httpOnly:"true"` 的反例都在 | 读面核过（工具档 `cookies` 行 ∥ `tools/browser.mjs` 的 `cookies` 属性描述）；`doc_check(mode:"gate")` = `PASS` |
| ③ | ⑯ `U91` 五格（另加 `sameSite` 两格）∥ ⑭ 的 `U92` 一格钉成 `assert.equal` | 见下「实跑读数」 |

**实跑读数（四条命令 · 2026-11-06）**

| 面 | 命令 | 结果 |
|---|---|---|
| 变化面单元档（§2 本轮验收命令） | `node --test docs/batches/2026-11-06-browser-session-storage.test.mjs` | tests 4 ∥ pass 4 ∥ fail 0 |
| 批次冒烟档（真 Edge 147.0.3912.60） | `node docs/batches/2026-11-06-browser-session-storage.smoke.mjs` | 15/15 checks passed |
| 语法（cwd = `thincoder-core`） | `node scripts/check-syntax.mjs` | 295 file(s) OK |
| 文档门 | `doc_check(mode:"gate")`（范围 = `thincoder-core/tool-docs/browser.md`） | `DOC-CHECK GATE: PASS`（1 档全清，0 段有问题） |

集成三档按 §2 **不在本轮跑**（父侧收口那次仍是唯一发布门）。冒烟档跑两次：字段形判落完一次、`sameSite` 归一收紧后再一次，两次都 15/15。

**断言不是空转**：`httpOnly:"true"` ∥ `secure:1` 改前被收成 `false`、`sameSite:""` 与 `expires:""` 过形检、`path:123` 从不判——改前这五格全部回成功回执，`assert.rejects` 会因其未拒而失败；`sameSite:["Lax"]` 改前经 `String()` 归一成合法枚举名，`" Lax "` 改前经 `trim()` 同样放行，两格都靠新判据才红；顶层 `domain:"https://nope"` ∥ 尾随空白改前不拒、静默落成一次空过滤。

**披露（逐条；我自报，非静默——接上一块的编号）**

| # | 事项 | 处置 ∥ 理由 |
|---|---|---|
| 19 | `cookieSetError` 的 `name` ∥ `value` 分成「缺键」与「点名该字段」两句，超出 19:53 三笔的字面列举 | 判据是同一张表的同一行（§2.2 字段表 `cookies[].name` ∥ `value` 行明写两个句子）与同一条规则；照字面只修五字段就是设计席刚废掉的「逐字段清单」做法本身 |
| 20 | 顶层 `domain` 收紧到 `badBareHost`（带 scheme ∥ 带 path ∥ 含空白一律拒），超出三笔字面范围 | 三笔之前的裁定（§1 19:08 #4 ∥ 19:27 E）已立「同一个参数两级一套判法」；不改则工具档 ∥ schema 的「top-level or per cookie alike」是假话，且带域 `clear` 会把畸形输入兑现成「0 removed」——调用方以为清了、实际一条没动 |
| 21 | `normalizeSameSite` 只收 string、去掉 `trim()` | 内审实测 `sameSite:["Lax"]` 经 `String()` 归一成合法枚举名 ⇒ 「非字符串 ⇒ 拒」落空（与两轮前 `area` 那个 stringify 洞同一类）；`trim` 是设计没写的宽松面（设计只给「大小写不敏感」），`" Lax "` 不在枚举里 |
| 22 | `actCookies` 的逐项形检前移到 `ensureSession` 之前 | 评审 🔵：与 `domainFilter` 的既有位置不一致，非法 payload 会先把浏览器拉起来再拒。`cookiesSet` 内那道保留作第二道（沿 `validateArgs` ∥ `domainFilter` 的双道纪律） |
| 23 | 单元档 ⑬ 补 `a.0.0.1` 一格 | 设计 `U90` 的期望有两半（`127.0.0.1` 不被选中 ∥ `a.0.0.1` 作为真子域被选中），改前只钉了第一半 |
| 24 | 单元档现 512 行，越过 `.mjs` 的 500 行建议线（本轮 ⑯ ∥ ⑰ ∥ ⑬ 三组断言所致） | 不拆档、不删断言：该档收口即删，删断言换行数是拿判据换排版；下一轮若要收，拆成同批第二档比压缩断言稳。评审轮 2 已登记为 🔵 |
| 25 | 读数（本轮复量）：`session-state.mjs` 435 ∥ `tools/browser.mjs` 206 ∥ `thincoder-core/tool-docs/browser.md` 56 ∥ 单元档 512 | §2 读数表仍是 396 ∥ 204 ∥ 56——§2 是设计笔，本段只报不改（D12：绝对读数住批档，可复跑） |

**上抛**

- [上抛·待裁] §2 读数表 `thincoder-core/browser/session-state.mjs` 记 396、`thincoder-core/tools/browser.mjs` 记 204，现为 435 ∥ 206（设计笔）。
- [上抛·待裁] 顶层 `domain` 的「主机串」是否也排除 `host:port`：`domain:"localhost:3000"` 现两道形检都放行，`get` ∥ `clear` 上静默回 0 条（`set` 靠回读核对的 `did not land — the browser stored …` 兜住）。本地 dev 把带端口的 host 抄给 `domain` 是最可能的误用，而设计 §2.2 对这一形没有句子——不猜，请裁（补句或收严）。
- [上抛·待裁] `storage get` 全量面在页侧回执缺 `entries` 时映射成 `0 key(s)`（`Array.from(res.entries ?? [], …)`）；设计 §2.2 的「空集合不得顶替读不出」只写在取面那一条，未推到 storage 侧。补一句设计句或明确「storage 侧不设此判」都要设计笔，本段不动。
- [上抛·知会] `cookies[].name === ""` 仍落「缺键」句 `cookies set requires name and value on every cookie`：字段表没有「给了空串」这一行，新增句子属设计笔。
- [上抛·知会] 回读核对只核 `value`（给了 `path` 再核 `path`），`httpOnly` ∥ `secure` ∥ `sameSite` 不核——`KD-30` 只要求值与 `path`，实现无偏离；但 `AC-BT1` 的主题字段 `httpOnly` 落在判据外，属设计面残余。
- [上抛·知会] 单元档 512 行越 500 建议线（见披露 #24）。

**自检轮次与终态**

| 轮 | 谁 | 结果 | 处置 |
|---|---|---|---|
| 1 | 内部探索审计（explore，只读） | 1 条 med：`sameSite` 经 `normalizeSameSite` 的 `String()` 归一 ⇒ `["Lax"]` 绕过声明类型判（与本批 `area` 的 stringify 洞同一类） | **已修**：`normalizeSameSite` 改 `typeof value !== "string" ⇒ null` 并去 `trim()`；单元档补 `["Lax"]` ∥ `" Lax "` 两格。另核 ok：五字段拒句与设计字段表逐字同句、`expires` 无强转、回读仍核值核 `path`、文档与代码同拍、集成 ∥ 冒烟的调用形（只带 `name`∥`value`∥`domain`）不被新判据误伤 |
| 2 | 内部代码评审（advisor `type=code`）轮 1 | VERDICT `changes-required`：0 🔴 ∥ 1 🟡（must-fix）∥ 8 🔵 | 🟡 = 顶层 `domain` 形判只拦「非串 ∥ 空白」而逐项走 `badBareHost`，两套判法且与工具档 ∥ schema「top-level or per cookie alike」相抵 ⇒ **已修**（`cookieDomainError` 委派 `badBareHost`）并补三形用例（动作面三形 + 工具面一形）。🔵 三条已修：形检前移（#22）∥ `U90` 真子域格（#23）∥ 其余六条上抛登记 |
| 3 | 内部代码评审 轮 2（fix-verification） | VERDICT `pass`：三笔修复逐条核过、零回归（拒绝优先级未变、`badBareHost` 对合法形无误伤、⑬ 四条计数与 `domainMatches` 逐条相符） | 新登记 1 条 🔵（单元档 512 行越建议线），不上修 |

**终态 = `clean`**：0 项 must-fix 未处置；四条命令全绿；文档门 `PASS`。

**依据**（本轮实现所依据的契约原句）：

依据 docs/core/design/BROWSER-TOOL.md「键不存在 = 没给（落缺省或当前页源）；给了就必须是声明类型且形合法（枚举在册），否则显式拒。」

依据 docs/core/design/BROWSER-TOOL.md「`expires` 不收字符串的理由：`Number("")` 是 `0`」

依据 docs/core/design/BROWSER-TOOL.md「`cookies set "path" must be a string starting with "/"`」

依据 docs/core/design/BROWSER-TOOL.md「`cookies set "<field>" must be a boolean (omit it for false)`」

依据 docs/core/design/BROWSER-TOOL.md「| `domain`（`get` ∥ `clear`） | 非空主机串 |」

### 修正轮五实施 · `domain` 端口判 + `storage` 全量面读不出（eng-coder · 2026-11-06）

**本 spawn 的任务面** = §2 修正轮五「留给实施面的两笔」（表 #3 ∥ #4），不含设计笔。设计侧两句已在盘（`docs/core/design/BROWSER-TOOL.md` §2.2 的「`domain` 不带端口」与「全量面回执畸形 ⇒ 明示错」两条），本段只做实现与用例。

**改了什么（四档，全在本 spawn 声明文件表内——零越界档）**

| 档 | 动作 | 当刻行数（量法：`readFileSync(f,"utf8").split("\n").length` · 2026-11-06） |
|---|---|---|
| `thincoder-core/browser/session-state.mjs` | 新增 `hostWithPort`（判法 = 单冒号 + 纯数字尾）∥ `badBareHost` 收成 guard 子句并加端口一判 ∥ `cookieSetError` 逐项拒句补 `no port` ∥ `actStorage` 全量面判 `res.entries` 非数组 ⇒ 明示错 ∥ 头注释补端口与「读不出」两条 | 450 |
| `thincoder-core/tools/browser.mjs` | `cookies` ∥ `domain` 两个 schema 描述补句（带端口 ⇒ 拒、不当作未给）∥ `validateArgs` 的 cookies 段注释补 U93 与「静默零」理由 | 207 |
| `thincoder-core/tool-docs/browser.md` | `cookies` 段补端口句 ∥ `storage` 段补「拿不到键表 ⇒ 报错、不报 `0 key(s)`」 | 56 |
| `docs/batches/2026-11-06-browser-session-storage.test.mjs` | 三处旧逐项拒句断言跟上新句 ∥ T50 新增 ⑱（U93 三格 + IPv6 正例）∥ T52 新增 U94 段（两域各一格 + store 未动） | 557 |

**两笔逐条对照**

| 笔 | 落点 | 判据面 |
|---|---|---|
| #3 端口判 | `badBareHost` 对 `domain`（`get` ∥ `clear`）与逐项 `cookies[].domain` 同一个判法；顶层走 `cookieDomainError`、逐项走 `cookieSetError`，两个入口（`validateArgs` ∥ 动作面）各拒一次，都在 `ensureSession` 与任何 `h.call` 之前 | ⑱：`domain:"localhost:3000"` 在 `get` ∥ `clear` 两形 ×（动作面 + 工具面）各拒；逐项 `set` 同拒且带 `no port`；`METHODS` 为空、store 两条未少；`domain:"::1"` 照旧放行（IPv6 有三段冒号，不在这一判内） |
| #4 读不出 | `actStorage` 的全量面在渲染计数之前判 `Array.isArray(res.entries)`，不成立 ⇒ `storage failed — the page returned no key list (<area>)` | U94：页侧只回 `{ok:true}` ⇒ 两域各拒一次（句子点名实际 area）、store 一个键未动；改前这一形回 `0 key(s)` |

**断言不是空转**：改前 `domain:"localhost:3000"` 两道形检都放行，`get` 回 `[cookies get] 0 cookie(s) [domain "localhost:3000"]`、`clear` 回 `0 removed`；改前缺 `entries` 走 `res.entries ?? []`，回 `0 key(s)`。两处 `assert.rejects` 在改前都会因未拒而红。

**实跑读数（四条命令 · 2026-11-06）**

| 面 | 命令 | 结果 |
|---|---|---|
| 变化面单元档（§2 本轮验收命令） | `node --test docs/batches/2026-11-06-browser-session-storage.test.mjs` | tests 4 ∥ pass 4 ∥ fail 0 |
| 批次冒烟档（真 Edge 147.0.3912.60） | `node docs/batches/2026-11-06-browser-session-storage.smoke.mjs` | 15/15 checks passed |
| 语法（cwd = `thincoder-core`） | `node scripts/check-syntax.mjs` | 295 file(s) OK |
| 文档门 | `doc_check(mode:"gate")`（范围 = `thincoder-core/tool-docs/browser.md` ∥ 本批档） | `DOC-CHECK GATE: PASS`（2 档全清，0 段有问题） |

集成三档按 §2 **不在本轮跑**（父侧收口那次仍是唯一发布门）。

**披露（逐条；我自报，非静默——接上一块的编号）**

| # | 事项 | 处置 ∥ 理由 |
|---|---|---|
| 26 | 顶层 `domain` 与逐项 `cookies[].domain` 共用 `badBareHost`，故端口判一落地，逐项拒句必须同批带上 `no port`，而顶层那句一字不动 | 设计字段表就是这么分的：顶层句「非空主机串」保持原样、逐项句带 `no port`。改顶层句会把既有 `依据` 的引文降级成引缺——同一规则的表述以「`依据` 可核」为准 |
| 27 | 单元档 557 行（+45），越 500 建议线 | 沿 §1 20:14 #7 的裁定：收口即删的档不按常驻档的尺寸纪律管。本段加的两组是 §2 点名的判据，删断言换行数是拿判据换排版 |
| 28 | ⑱ 里补了一条正例：`domain:"::1"` 照旧放行 | 只钉拒面会让人以为「含冒号就拒」。设计给的判法 = 单冒号 + 纯数字尾，IPv6 的合法形必须证明没被误伤 |
| 29 | 读数复量（本段当刻）：`session-state.mjs` 450 ∥ `tools/browser.mjs` 207 ∥ `thincoder-core/tool-docs/browser.md` 56 ∥ 单元档 557 | §2 读数表记 435 ∥ 206 ∥ 56（单元档记在 §1 20:14 #7 的 512）。§2 是设计笔，本段只报不改（D12：绝对读数住批档、可复跑） |

**上抛**

- [上抛·待裁] 端口判只覆盖 `<host>:<digits>`（设计钉的判法）。其他含冒号又不是 IPv6 的形（`localhost:` ∥ `host:abc` ∥ `a:b:c`）仍放行，落成一次零匹配过滤（`0 cookie(s)` ∥ `0 removed`）——正是这条门要杀的那一类「静默零」。**未自改**：设计把判法写死成单冒号 + 纯数字尾，放宽与收紧都是设计裁决；内部代码评审轮 1 的 🟡 就是这一条。请裁：补一句设计句（含冒号且非 IPv6 即拒），或维持现状。
- [上抛·知会] 单键 `storage get` 没有同款「读不出」判据（页侧回 `{ok:true}` 而不带 `found` ⇒ 回 `not set`）。设计那条句只写全量面，故本段不推宽。
- [上抛·知会] 单元档 T50 ⓞ 用正则读 `session-state.mjs` 的源码文本（零 `node:` import ∥ 零 fs 调用），是文本面代理而非行为断言；沿前几轮登记，本段未改。
- [上抛·知会] 单元档 557 行越 500 建议线（见披露 #27；§1 20:14 #7 已准不拆）。

**自检轮次与终态**

| 轮 | 谁 | 结果 | 处置 |
|---|---|---|---|
| 1 | 内部探索审计（explore，只读） | `divergence: 1 条`（med），内容 = 本段尚未写入 ⇒ 本表即其处置；代码面 0 条（两笔逐句核过、零越界档、集成 ∥ 冒烟 ∥ 实时断言零影响） | 已写本段。另报三条非偏差事实：端口判的残缺面（进上抛）∥ `[::1]:8080` 同形（同一句设计裁决）∥ 顶层 `domain` 措辞差（沿上一轮披露 #20） |
| 2 | 内部代码评审（advisor `type=code`）轮 1 | VERDICT `pass`：0 🔴 ∥ 1 🟡（未标 must-fix）∥ 3 🔵 | 🟡 = 端口判的残缺面 ⇒ 上抛（设计裁决）；🔵 三条 = 单键 storage 无同款判据（上抛）∥ 单元档源码文本断言（沿登记）∥ 读数陈旧（本段已复量，披露 #29） |

**终态 = `clean`**：0 项 must-fix 未处置；四条命令全绿；文档门 `PASS`。

**依据**（本轮实现所依据的契约原句）：

依据 docs/core/design/BROWSER-TOOL.md「判法 = 只含一个冒号且冒号后是纯数字；IPv6 字面量有多个冒号，不在这一道判内。」

依据 docs/core/design/BROWSER-TOOL.md「cookies set "<name>" domain must be a bare host such as "example.test" (no scheme, no path, no port)」

依据 docs/core/design/BROWSER-TOOL.md「Error: storage failed — the page returned no key list (<area>)」

## §6 验证与收口（父代理）

### 验证与收口（父侧 · 2026-11-06 20:30）

**父侧独立复跑**（不看实施席读数，本机实跑）：

| 面 | 命令 | 结果 |
|---|---|---|
| 变化面单元档 | `node --test docs/batches/2026-11-06-browser-session-storage.test.mjs` | **tests 4 · pass 4 · fail 0** |
| 常驻集成（本批三行） | `node --test test/integration/browser-session-state.test.mjs` | **tests 3 · pass 3 · fail 0** |
| 批次冒烟（真 Edge 147.0.3912.60） | `node docs/batches/2026-11-06-browser-session-storage.smoke.mjs` | **15/15 checks passed** |
| 文档门 | `doc_check(mode:"gate")` 五档 | **PASS** |

**行数权威读数**（量法 = `countContentLines`（`thincoder-core/doc-check/index.mjs` 单源），**不用手工尺子**）：

| 档 | 行数 | 软线 500 |
|---|---|---|
| `thincoder-core/browser/session-state.mjs` | **450** | 未越 |
| `thincoder-core/browser/session.mjs` | 474 | 未越 |
| `thincoder-core/browser/queue.mjs` | 201 | — |
| `thincoder-core/tools/browser.mjs` | 206 | 未越 |
| `thincoder-core/tool-docs/browser.md` | 55 | — |
| 批次单元档（收口删） | 556 | 越线，见下第 3 条 |
| `test/integration/browser-session-state.test.mjs` | 207 | — |
| `test/RTM.md` | 456 | — |

**§2 的读数表被本节取代**：那张表按 `split("\n").length` 量，与核尺子差一行（文件尾换行那个空串）。**同一份批档里两个数并存才是问题，一张被另一张明确取代不是**——本节为准。

**AC 覆盖（逐条坐落在哪）**：

| AC | 判据住哪 | 常驻？ |
|---|---|---|
| `AC-BT1`（立命） | 集成 `35-1` ①：`cookies get` 含 httpOnly ∧ `evaluate` 的 `document.cookie` 不含 | **是** |
| `AC-BT2` | 集成 `35-1` ②：跨域写 ⇒ 切源读得到（零开关） | **是** |
| `AC-BT3` | 集成 `35-1` ③：带域 `clear` ⇒ 该域回空、域外仍在 | **是** |
| `AC-BT4` | 集成 `35-2`：两域自分不串 | **是** |
| `AC-BT5` | 集成 `35-2`：换行 ∥ 引号 ∥ 中文 ∥ ≥2KB 逐字往返 | **是** |
| `AC-BT6` | 集成 `35-1` ④：回执零 `****` ∥ `••••`，值逐字相等 | **是** |
| `AC-BT7` | 集成 `35-3`：门面六形逐条为真 + 六形真跑 | **是** |

**七条全部有常驻判据**——这是评审轮 2 的 N3 与本批最后一轮裁定的落点。

**已知限界（照实入账，不假装没有）**：

1. **端口判法只覆盖 `<host>:<纯数字>`**：`localhost:` ∥ `host:abc` ∥ `a:b:c` 仍放行、仍静默回 `0 cookie(s)`。设计档 §2.2 置顶规则（「形合法」）原则上覆盖它们，但落实要改判法语义。**已入台账 `#2112`，不在本批修**——本批已修六轮，继续修是拿收口换完美。
2. **单键 `storage get` 无「读不出」判据**（回执 `{ok:true}` 会读成 `not set`）：与第 1 条同族，并入同一行台账。
3. **批次单元档 556 行越过 500 建议线**：**不拆**。理由：收口即删的档不按常驻档的尺寸纪律管；为一份活一小时的档拆文件，是把纪律用在它不管的东西上。
4. **集成集当刻 129 行**，窗口 ≈50–100，**超窗**。本批 +3 行（`35-1` ∥ `35-2` ∥ `35-3`），按「窗口是上界不是冻结线」照加；**裁减另立台账 `#2113`**，不在本批做。

**暂缓批复核**：无。

**⇒ 这批最该记住的一句**：**七轮里被推翻的，没有一轮是实现写错了——都是一种「输入形不对，行为却照走」**：`domain` ∥ `key` ∥ `area` ∥ `httpOnly` ∥ `secure` ∥ `sameSite` ∥ `expires` ∥ `path` ∥ `host:port` ∥ 空集合顶替读不出。**逐字段的清单必然漏，规则不漏**——这条是本批真正的产出，比那两个动作值钱。
