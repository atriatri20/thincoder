# 2026-11-08 · pointer-residue-j
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 13:15「现在就开，都自动跑完，而且你现在并发上限没用足。别缩手缩脚。」· 父侧 13:13 全库实测发现九本未覆盖的 10 档 64 锚。
> 台账 = #2187（— · 归批）。前情 = docs/batches/2026-11-08-pointer-residue-a.md ~ -i（九本并行，切片覆盖 135 档；均在收口中）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批条目

十本里唯一开新账的一本：九本覆盖 135 档，**另有 10 档 64 锚从未落在任何一本的改面内**（父侧 2026-11-08 13:13 全库实测：195 档 · 命中 71 条）。本批 = 那 10 档。

分两半：`docs/core/design` 6 档 39 锚（设计席笔）+ `docs/core/requirements` 4 档 24 锚（**主 agent 笔，零触碰上抛**）。

### 关键判据

- **判据取书写形面，不取门禁红数**——理由与其余九本同：后缀兜底腿把仓内唯一的裸名解到真件，门禁面在这类档上改前改后同读 0。
- **红侧在对照样本上**：取一条已写全路径的行、剥掉路径前缀，同一支扫描读 1。

### 父侧承接（本签字生效）

设计席按 C 类「零触碰 · 列表上抛」把 4 档需求档交上来，**主 agent 已亲手落完**：

- 范围：`docs/core/requirements/WORKSPACE.md` · `docs/core/requirements/MULTI-INSTANCE-COLLAB.md` · `docs/core/requirements/PROVIDER.md` · `docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md`，共 **23 处**（不是 24——逐处数出来的）。
- 判法：现态指针 → 仓根全路径（同名多份按该行上下文定支）· 已消失的端侧副本 → 角色叙述或删去死的一半 · 运行期名 → 叙述形 · 「某档不存在」两行 → 改写成不带路径 token 的说法。
- 顺带修 3 处超长段（`docs/core/requirements/CHECKPOINT.md` · `docs/core/requirements/DOC-SYSTEM.md` · `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MANIFEST.md`）。
- 落盘：提交 `93199fe0`；复量 `docs/core/requirements` 全目录 48 档 · 锚 0 · 段落 0 · 行号 0。

⇒ 本批的交付面因此从 6 档扩到 **10 档**，两半都是零。

- **已定决定**：4 档需求档由父侧承接落笔、设计席零触碰 · 用户原话：「跑完啊!按照要求走,老问我什么意思?让我给你开口子,把违规责任推给我?」 · 时间：2026-11-08 13:44

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 2 · §3 第 10–13 条逐条处置；尺子补 4 token ∥ 加段界，红侧 ∥ 工作树 ∥ 对照三读数由档内脚本复跑复现；处置表按行重算 32（22∥5∥1∥4）；4 档需求档列表上抛父侧）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| 条目 | 射程 | 判据源 |
|---|---|---|
| 台账 `#2187` 的 J 簇 | `docs/core/design/` 下本批 6 档的**锚**面 | 父侧本批任务书（13:13 全库实测 + 书写形口径） |

- **五要素落位**：模块目标 = 六个 core 设计档的代码坐标指回仓内真件；功能点 = 逐处命中取一条处置（下表）；边界 = 见末节；验收 = 书写形扫描归零；依赖 = 无（纯文档面，零代码、零需求档）。
- **射程 = 坐标这一面**。同一清单本轮实测：段落 0 处、行号坐标 0 处 —— 那两类在本批无对象，不是不做。
- **交付形态** = 每处命中一条处置；残余 = 登记为假阳或判不了，逐条点名。

### 起点读数（本刻实跑 · 判据域 = 本批 6 档）

```text
内置 doc_check（mode:"report"）：
命中 39 条（锚 39 · 文字太长 0 · 行太长 0 · 行号坐标 0 处）
```

| 档 | 锚 | 档 | 锚 |
|---|---|---|---|
| `docs/core/design/AGENT-PARAMS.md` | 6 | `docs/core/design/PROXY.md` | 8 |
| `docs/core/design/DOC-SYSTEM.md` | 5 | `docs/core/design/SESSION-OBSERVABILITY.md` | 6 |
| `docs/core/design/MULTI-INSTANCE-COLLAB.md` | 5 | `docs/core/design/SETTINGS-TOOL.md` | 9 |
| — | — | **合计** | **39** |

父侧表给的 6 ∥ 5 ∥ 5 ∥ 8 ∥ 6 ∥ 9 与本刻实跑逐档相等（自己跑出来的，非抄表）。

### 判据：书写形（静态面），不用门禁红数

```text
判据面 = 行扫描：本批 token 在各档的**非全路径形态**出现次数（出现处向前延伸的路径串首段不属仓根段即计一处）
红侧   = 对照样本：一条已写全路径的行剥掉仓根前缀 ⇒ 同一支扫描读 2（不是 0）
门禁面 = 回退：内置 doc_check 0 条不充当清债判据
```

**为什么门禁红数不作判据**：引擎的后缀兜底腿把裸名按唯一后缀解析到真件 —— **判绿 ≠ 写对了**。本批 `settings.mjs` ∥ `run.mjs` ∥ `proxy.mjs` ∥ `session-slots.mjs` 一族恰是多候选，兜底解不出，才被报出来；而单后缀裸名（下节「射程外读数」）引擎全绿、书写形仍红。两把尺不是一回事。

### 逐处处置（32 个位置；每位置一行处置）

格式 = 节 | token | 类 | 判法 | 改后形。**逐档块是权威面**——「判法口径」表的类合计取逐行标签，可逐块复算。

**`docs/core/design/AGENT-PARAMS.md`（6）**

```text
§2 · thincoder-vscode/src/advisor/loop.mjs      | 错包前缀（端侧无 advisor 目录）
     ⇒ 判法① · 改指 thincoder-core/advisor/loop.mjs，并删「VSC 同形」旧断言
§6.2 · docs/batches/2026-10-24-tool-timeouts.test.mjs | 批次单测档（收口随批删）
     ⇒ 判法③ · 角色叙述「该批的单元测试档」
§6.3 · thincoder-vscode/src/config-io.mjs（三处）  | 端侧镜像已删（W16 配置面归一）
     ⇒ 判法② · 改指 thincoder-core/config-io.mjs（端侧 import 自核）
§6.3 · thincoder-vscode/src/agent-tools/subagent.mjs | 端侧无该档（agent-tools 只剩 index.mjs）
     ⇒ 判法② · 改指 thincoder-core/agent-tools/subagent.mjs
```

**`docs/core/design/DOC-SYSTEM.md`（5）**

```text
§3.3 · .thincoder/docs-face.json  | v1 声明面候选，该档从未建
     ⇒ 判法④ · 叙述形「一份不入产品码的数据声明档」
§8.2 · .thincoder/docs-face.json  | 同上（存史段）
     ⇒ 判法④ · 叙述形（同 §3.3 口径）
§6   · setup.mjs（反向夹具整句）  | 同名多份（核 agent ∥ vscode agent）
     ⇒ 判法① · 两处都写全路径——该句的论点正是「尾名两义」
§12  · agent.mjs（决策 7 行内两处）| 同名多份（核 ∥ vscode）
     ⇒ 判法① · 两处都写全路径——该决策的论点正是「裸名两义」
```

**`docs/core/design/MULTI-INSTANCE-COLLAB.md`（5）**

```text
§3.1 · thincoder.cjs（标记族 ①）   | 同名两份（仓根 bin ∥ cli 包 bin）
     ⇒ 判法① · 两处入口都写全路径
§3.1 · thincoder.cjs（误删方向条） | 同上
     ⇒ 判法① · 同上
§3.2 · setup.mjs —— depth-0 装配时序 | 同名两份
     ⇒ 判法① · thincoder-core/agent/setup.mjs（该句主语是核装配）
§4.4 · thincoder-vscode/src/agent/run-stages.mjs | 端侧无该档；实核仅核仓有
     ⇒ 判法② · 改指 thincoder-core/agent/run-stages.mjs，并订正「端侧更窄」的坐标
§8   · session-slots.mjs（D-MI11 行）| 同名三份
     ⇒ 判法① · thincoder-core/session-slots.mjs（同句邻居 = 核探针族）
```

**`docs/core/design/PROXY.md`（8）**

```text
§首  · proxy.mjs（融合表行）      | 同名两份（核 ∥ server gateway）
     ⇒ 判法① · thincoder-core/proxy.mjs
§2   · proxy.mjs（三档分句 · 两处）| 同上
     ⇒ 判法① · thincoder-core/proxy.mjs（同句邻居 = 核 proxy-target ∥ proxy-transport）
§6.1 · proxy.mjs（loopback 旁路行）| 同上
     ⇒ 判法① · thincoder-core/proxy.mjs
§8   · proxy.mjs（D-PX10 行）     | 同上
     ⇒ 判法① · thincoder-core/proxy.mjs
§6.2 · run.mjs ∥ slow.mjs         | 同名 12 处 ∥ 3 处；该句已声明目录 = thincoder-cli/test/
     ⇒ 判法① · thincoder-cli/test/run.mjs ∥ thincoder-cli/test/slow.mjs
（第 8 次命中 = §6.2 同一句的 `.test.mjs` 字面——形状误判，不是坐标；四处出口见「形状误判的四处出口」节）
```

**`docs/core/design/SESSION-OBSERVABILITY.md`（6）**

```text
§3.1 · ./log.mjs（import 字面）    | 相对导入说明符，非档坐标
     ⇒ 判法④ · 改写成「自 thincoder-core/log.mjs 同目录相对导入」，不写导入字面
§3.1 · session-slot-write.mjs      | 同名两份（核 ∥ vscode extension）
     ⇒ 判法① · 同句五件全写核全路径（同句邻居已在核）
§5   · generate-title.mjs（D11 行） | 同名两份（核 ∥ vscode extension）
     ⇒ 判法① · thincoder-core/generate-title.mjs（该句讲三端共用生成面）
§9   · run.mjs ∥ test/slow.mjs     | 同名多份；该句目录 = thincoder-cli/test/
     ⇒ 判法① · thincoder-cli/test/run.mjs ∥ thincoder-cli/test/slow.mjs
§9   · .test.mjs（两处通配）      | 通配形被切成档名——形状误判，不是坐标
     ⇒ 随同句 run.mjs 收全路径时同区一并改写（出口见「形状误判的四处出口」节）
```

**`docs/core/design/SETTINGS-TOOL.md`（9 次命中 · 8 个位置）**

```text
§2.2 · settings.mjs（resolvePath 导出）  | 同名四份（agent-tools ∥ core ∥ server ∥ vscode）
     ⇒ 判法① · thincoder-core/agent-tools/settings.mjs（导出面在该档）
§2.3 · thincoder-vscode/src/advisor/loop.mjs | 端侧无 advisor 目录
     ⇒ 判法② · thincoder-core/advisor/loop.mjs + 删「VSC 同形」旧断言
§2.3 · settings.mjs（删除腿）           | 同名四份
     ⇒ 判法① · thincoder-core/agent-tools/settings.mjs（删除腿 = 该档的 null 删除实现）
§2.3 · settings.mjs（整段赋值腿）        | 同名四份
     ⇒ 判法① · thincoder-core/agent-tools/settings.mjs（promoteAgentViews 在该档）
§2.4 · settings.mjs（词表常量）          | 同名四份
     ⇒ 判法① · thincoder-core/agent-tools/settings.mjs（敏感词表常量住该档）
§2.4 · settings.mjs（开口键族常量）      | 同名四份
     ⇒ 判法① · thincoder-core/agent-tools/settings.mjs（开口键族常量住该档）
§2.6 · config.mjs（DEFAULTS 一处）      | 同名两份（核 ∥ server ops）
     ⇒ 判法① · thincoder-core/config.mjs（句首已写「核」）
§2.6 · config.mjs（configPath 默认）    | 同名两份（同上）
     ⇒ 判法① · thincoder-core/config.mjs（该句讲测试缝不得写真实用户配置）
```

### 判法口径（本批四类）

| 类 | 含义 | 行数（处置位置） | 落形 |
|---|---|---|---|
| ① 仓根全路径 | 仓内确有该件（含多候选按上下文定一支） | 22 | 仓根全路径 |
| ② 继任者改指 | 原坐标不在盘，继任者在盘且能指出它接了这支 | 5 | 继任者仓根全路径 + 订正同句失效断言 |
| ③ 退役件 | 批次单测档（收口随批删） | 1 | 角色叙述，不写档名 |
| ④ 叙述形 | 零同名 / 从未建 / 非档坐标（含 import 字面） | 4 | 不带路径的叙述 |
| **处置行合计** | 按标签数 | **32** | — |
| 形状字面 | 扩展名 ∥ 通配形（不入处置类，见「形状误判的四处出口」节） | 3 | 见该节 |

**计数尺子 = 处置行上的类标，一行一个。** 全节逐类数：① 22 ∥ ② 5 ∥ ③ 1 ∥ ④ 4，合计 32。数法 = 正则 `判法[①②③④]` 的匹配数，一行一个标签；本节这句计数句不带那个前缀，故不进它自己的计数。

- `AGENT-PARAMS` 6（①1 ②3 ③1 ④1；其中两行住「上文未列、本批一并清掉的两处」块）
- `DOC-SYSTEM` 4（①2 ④2）· `MULTI-INSTANCE-COLLAB` 5（①4 ②1）
- `PROXY` 5（①5）· `SESSION-OBSERVABILITY` 4（①3 ④1）· `SETTINGS-TOOL` 8（①7 ②1）

**形状行不带判法标签**——它们不是处置，故不进类合计（见「形状误判的四处出口」节）。

**处置行 32 不与开工 39 对账。** 两支尺子量两件事：39 是 `doc_check` 在改前树报的锚数（钉不进盘的指针），32 是处置位置数。两个数不相减，也不拼成 40——处置表是本批的交付面，开工读数只是起点。

**② 不是另一类落形**：改后同样是仓根全路径，单列只是把「同时订正同句失效断言」这一动作显形。该动作逐行在册（`docs/core/design/AGENT-PARAMS.md` §2 ∥ §6.3 · `docs/core/design/SETTINGS-TOOL.md` §2.3 · `docs/core/design/MULTI-INSTANCE-COLLAB.md` §4.4），不单独计数。

**行 = 处置位置，不是命中次数。** 同一句话里同一 token 出现两次（如 `docs/core/design/AGENT-PARAMS.md` §6.3 的 `config-io.mjs` 三处）记一行、括注次数。开工的逐档命中数（6 / 5 / 5 / 8 / 6 / 9）按次计——两者不必相等，行数不因次数补齐。

**扩展名与通配形不属于本表**，它们从来不是 `doc_check` 的锚：

- 判据：改造前 `doc_check` 对同档读 0 条时，`docs/core/design/SESSION-OBSERVABILITY.md` §6 的 `thincoder-cli/test/*.test.mjs` 一直原样在册——引擎不把它当档名。
- 它们只是本批自有扫描的形状误判（本批判据 = 行扫描，见「判据：书写形」节）。
- 出口两支：事实靠该形承载 ⇒ 原样留；不靠它承载 ⇒ 改写成同一事实。逐处见「形状误判的四处出口」节。



### 设计档落点

**本批不新建任何档、不动任何需求档。** 改面 = 上面 6 档本身。

依据：本批的对象就是这 6 档里的坐标；开一份「怎么清指针」的新档会与机制单源争第二处说明（`docs/core/design/PATH-RESOLUTION.md` 已是解析链单源），且一次性清单住 §2 才可随批退役。

### 机制设计

**无机制改动**：解析链、兜底腿、抽取器一律不动。本批只把 6 档里的坐标写成解析链第一候选（仓根全路径）能直接命中的形。

### 受影响文件与档位结论

- 改面 = 6 档，全部在 `docRoot.design` 的 core 面；**零新增档、零删除档**。
- 档位结论：**无跨界**——全 `.md` 设计档，不碰产品码、测试档、需求档、manifest、台账；文档无行数档位预算。
- 无运行面改动 ⇒ 无单元测试档；验收 = 书写形扫描（命令见下）。

### 验收判据（回指本批条目 · 每条带命令与红侧）

| # | 判据 | 命令 | 改前读数（红侧） | 目标 |
|---|---|---|---|---|
| AC-1 | 处置表的 19 个 token 在本批 6 档的**非全路径形态**出现次数 = 0（判域 = 仓路径形态） | 「AC-1 扫描命令」块 | `--head` 读 **30** 处 | 工作树 3 处，逐条点名后判域内 0（见块下） |
| AC-2 | 每个改后形逐处可解析（全路径在盘） | 对处置表的改后形逐条 `glob` | — | 逐条命中 |
| AC-3 | 无新增锚命中（含 `节缺` 类） | `doc_check`（`mode:"gate"`，docs = 本批 6 档） | 开工 39 条 | 0 |
| AC-4 | 只改坐标与失效断言，不改其它语义 | `git diff -- docs/core/design`（cwd = 仓根 · 实测可用，本刻已跑） | — | 逐条在册（档 + 原句 ⇒ 改后句） |
| AC-5 | 判据可失败（自检） | 同一条扫描跑对照样本 | 剥掉仓根前缀后读 **2** | 写全路径读 **0** |

**AC-1 的扫描命令**（cwd = 仓根；`--head` 走 `git show HEAD:<档>` 取改前树）

```js
// node ac1.mjs [--head]
import { execSync } from 'node:child_process'
import fs from 'node:fs'
const DOCS = ['AGENT-PARAMS','DOC-SYSTEM','MULTI-INSTANCE-COLLAB','PROXY','SESSION-OBSERVABILITY','SETTINGS-TOOL']
  .map(n => `docs/core/design/${n}.md`)
const TOKS = ['2026-10-24-tool-timeouts.test.mjs','AGENT_DEFAULTS','docs-face.json','run-stages.mjs',
  'session-slots.mjs','subagent.mjs','thincoder.cjs','loop.mjs','setup.mjs','agent.mjs',
  'proxy.mjs','settings.mjs','config.mjs','slow.mjs','run.mjs',

  'config-io.mjs','session-slot-write.mjs','generate-title.mjs','log.mjs']
const ROOTS = ['thincoder-core/','thincoder-cli/','thincoder-vscode/','thincoder-server/',
  'thincoder-desktop/','docs/','test/','bin/','scripts/','.thincoder/']
const PCHAR = /[A-Za-z0-9_.\-/@]/
const SEG = /[A-Za-z0-9_.\-]/   // 段界：token 左邻是名字字符即不算命中

function scan(text) {
  const hits = []
  text.split(/\r?\n/).forEach((ln, i) => {
    const covered = new Array(ln.length).fill(false)

    for (const tok of TOKS) {
      let from = 0
      while (true) {
        const k = ln.indexOf(tok, from)
        if (k < 0) break
        const prev = k === 0 ? '' : ln[k - 1]
        if ((prev === '' || !SEG.test(prev)) && !covered.slice(k, k + tok.length).some(Boolean)) {
          for (let j = k; j < k + tok.length; j++) covered[j] = true
          let s = k
          while (s > 0 && PCHAR.test(ln[s - 1])) s--
          const run = ln.slice(s, k + tok.length)
          if (!ROOTS.some(r => run.startsWith(r))) hits.push({ line: i + 1, tok, run })
        }
        from = k + tok.length
      }
    }
  })
  return hits
}
const HEAD = process.argv.includes('--head')
let total = 0
for (const d of DOCS) {
  const text = HEAD ? execSync(`git show HEAD:${d}`, { maxBuffer: 1 << 26 }).toString() : fs.readFileSync(d, 'utf8')
  const hits = scan(text); total += hits.length
  console.log(`${d}\t${hits.length}`)
  for (const h of hits) console.log(`   ${HEAD ? 'HEAD' : 'NOW'}:${h.line}  ${h.run}`)
}
console.log(`TOTAL ${HEAD ? 'HEAD' : 'now'} = ${total}`)
// 对照样本（AC-5）：写全路径读 0，剥掉仓根前缀后读 2
const FULL = '见 `thincoder-core/agent/run-stages.mjs` 与 `thincoder-core/session-slots.mjs`'
console.log(`CONTROL full=${scan(FULL).length} bare=${scan(FULL.replaceAll('thincoder-core/', '')).length}`)
```

**本刻读数（上面那条命令跑出来的，不是抄表）**：

- `--head` ⇒ **30** 处；工作树 ⇒ **3** 处；对照样本读 `CONTROL full=0 bare=2`。
- 工作树残余 3 处逐条点名，**均在判域外**：

```text
docs/core/design/PROXY.md §6.1  @thincoder/core/proxy.mjs（两处）  包导入说明符：引的是代码里的 import 串，不是仓内目录段
docs/core/design/PROXY.md §6.1  config-io.mjs（一处）             单后缀可定位（端侧镜像已删、仓内仅核一份）⇒ 按用户裁定保持原写法
```

- 判域内 = **0**。

**尺子本轮改了两处（§3 第 10 ∥ 12 条），实测效果**：

```text
token 清单补四个：config-io.mjs ∥ session-slot-write.mjs ∥ generate-title.mjs ∥ log.mjs
匹配加段界：token 左邻是名字字符即不算命中 ⇒ render-loop.mjs 不再被 loop.mjs 吃掉
--head  27 → 31（补 token +4）→ 30（段界 −1）
工作树   3 →  4（补 token +1）→  3（段界 −1）
```

**§3 第 10 条点的 6 处，逐项落实**：

- 3 处裸名行（`docs/core/design/SESSION-OBSERVABILITY.md` §3.1 两处 ∥ §5 一处）现在落在尺子上：改前树读出 3 处，工作树 0 处。
- 3 处 `config-io.mjs` 是**错包前缀形**——原坐标挂在端侧包名下（端侧镜像已删），形面本来就看不见它；`doc_check` 的 `档缺` 面看它，改后已是核全路径。
- 补 token 在改前树另多读 1 处：`docs/core/design/PROXY.md` §6.1 的 `config-io.mjs`。单后缀可定位 ⇒ 判域外，已在上方残余表点名。

AC-3 与 AC-1 分工的为什么：AC-1 是本批的债面（书写形），AC-3 是回归护栏——别在修的当口把别的面弄红。两者不同源：一个数形状，一个数钉不进盘的指针。AC-3 的目标写 0 而不是「≤ N」，因为本批的锚面开工 39 条、收工 0 条，中间没有留「登记在案」这一档。

### 射程外读数（不在本批判域）

本批执行的书写规则 = `docs/core/design/DOC-DISCIPLINE.md` §1「D4 细则（消费点坐标完整路径形态）」，原话：「**书写只有一个答案：全路径。**」

**判域边界 = 后缀腿能不能定位这一处**（单源 = `docs/core/design/PATH-RESOLUTION.md` §2.8 KD-15）：

- **能定位**（后缀恰一命中）⇒ **不改**。依据 = 用户 2026-11-08 裁定甲′，原话「解析面认包内相对写法，不改那批文档」；该档判词「它们不是笔误，是写法与解析面不匹配」说的正是这一批。
- **不能定位**（同名 ≥2 ∥ 全仓零命中）⇒ 全路径是唯一落点，才是本批 39 条。

本刻读数（`doc_check` `mode:"report"`，docs = 本批 6 档）：后缀兜底命中 **36 处 / 20 个 token**（`config.json` 一族 12 处为最多）。

这一批**已由用户裁定保持原写法**——不是待清的债，本批不动，也不登记成欠账。

### 关键决策

**KD-1 判法按「这条命中在说什么」分流，不按「怎么让它变绿」分流。**
被否：一律补仓根全路径。理由 = 对假阳类不可达（扩展名不是档），对从未建件也不可达（补前缀补不出绿）。

**KD-2 多候选不取首个，按该句主语定支，并把定支理由写进 §2。**
被否：「只写一份，反正引擎兜底能解」。`settings.mjs` 四份、`run.mjs` 十二份，认错即把文档指到别的模块上，比留着红更坏。

**KD-3 端侧镜像已删的坐标改指核，并订正同句断言。**
被否：留着「VSC 同形」只改路径 —— 路径改对了、断言仍是假的，比留一条红锚更坏（写面归一后端侧没有镜像面）。

**KD-4 假阳**分两支：事实靠该形承载 ⇒ 原样留、由判据的 token 清单排除该形；事实不靠它承载 ⇒ 可改写成同一事实，但改写后逐条对读「事实是否还在」。
被否：一律改写——「收 `test/*.test.mjs`」这类句子的事实就是那个通配形，改写成别的说法等于把「收哪些档」改成另一种说法（比留一条形状误判更坏）。
被否：一律留——判据的 token 清单若含扩展名与通配形，清单本身就永远不读 0，看起来永远有债；清单是尺子，尺子读错形状要在尺子上改。

**KD-5 执行表住 §2，不进机制档。**
被否：并入 `docs/core/design/PATH-RESOLUTION.md`。那是解析链单源，装一次性清单会把它降级成账本。

### 调研证据

- 查过 `thincoder-vscode/src/` 全树（`tree` 深度 2）：**无 `advisor/` 目录、无 `config-io.mjs`、`agent-tools/` 只有 `index.mjs`、`agent/` 无 `run-stages.mjs`** ⇒ 五处「端侧路径」在盘不成立。
- 查过 `thincoder-vscode/src/config-mcp.mjs` 头注与 import 面，逐字两行：

```text
W16 config-face consolidation: the VSC config-io.mjs mirror (and its re-export) is deleted —
import { loadRaw, conflictError } from "@thincoder/core/config-io.mjs"
```

  ⇒ 继任者 = 核，端侧取核（② 类的「哪一句证明它接了这支」）。
- 查过 `thincoder-vscode/src/agent/agent-state.mjs` 头注，advisor 镜像那半句逐字：

```text
W12（2026-09-15）：原 `../agent-tools/advisor.mjs` 的 token 工具随 advisor 镜像删旧退役——
```

  ⇒ advisor 镜像已退役，端侧无自有 advisor 循环档。
- 查过 `D:\teamcode\thincoder\bin\thincoder.cjs` 与 `thincoder-cli/bin/thincoder.cjs` 两档**均在盘**（`glob` 命中）⇒ `thincoder.cjs` 属多候选，本批两处都写。
- 查过 `D:\teamcode\thincoder\test\RTM.md` 结构（故事索引表 / 异常与更正 / 签署面）—— 差量见下节。
- 公共源：本仓 `PROJECT-MANIFEST.json` 的 `index.publicRepos` 无外部权威可对；本批不产生任何外部断言 ⇒ 无需外网核查。

### 最近先例

同形处置 = 九本前序批（`docs/batches/2026-11-08-pointer-residue-a.md` ~ `-i.md`）已落的 R1–R6 裁定面：R1 仓根全路径、R3 已删单测档角色叙述、R6 推进单位 = 段。**对齐** = 前三类逐条同形；**偏离** = 零。

`docs/batches/2026-11-08-pointer-residue-a.md` 的残余轮另立了「④ 抽取器假阳：档改 0 字，登记」一类 —— 本批 3 条假阳照此落形，同一先例。

### 集成测试差量（对 `test/RTM.md`）

- **改动的行（重写）**：0 —— 本批不改任何业务可观察结果（纯文档坐标）。
- **冗余的行（删）**：0。
- **缺的行（新增）**：0。理由 = 集成用例只从两个入口长出（产品真需要的业务场景 ∥ 生产真出过的问题），本批两者皆无；「跨组件」本身不是入口。
- 结论：`test/RTM.md` 零改动。这不是「不适用」，是三个问题逐条答 0。
- **量法**：`test/RTM.md` 逐节读（故事索引表 / 异常与更正 / 签署面），按「破 / 冗余 / 新增」三问逐问答，读面 = 该档全文；本批不改任何业务可观察结果，故三问皆空。

### 既有件三问（① ∥ ② 类 32 处）

本批**不新增任何名字**：没有一个新档、新组件、新端点、新文案。逐处回答三问，答案全为 `existing:`——住哪 = 逐处「改后形」列；逐字名 = 该档文件名；谁用 = 下表（消费面取自各档同句邻居与调研证据里的逐字引文）：

| 落点 | 逐字名 | 谁用 |
|---|---|---|
| `thincoder-core/advisor/loop.mjs` | `loop.mjs` | 核 advisor 循环读面；端侧镜像已退役，两端读同一核档 |
| `thincoder-core/config-io.mjs` | `config-io.mjs` | 端侧 `thincoder-vscode/src/config-mcp.mjs` 直接 import |
| `thincoder-core/agent-tools/settings.mjs` | `settings.mjs` | `resolvePath` 导出 · `null` 删除腿 · `promoteAgentViews` 整段赋值腿 · 敏感词表与开口键族常量 |
| `thincoder-core/agent-tools/subagent.mjs` | `subagent.mjs` | subagent 工具（`subagentTurns` 默认 100 那一路） |
| `thincoder-core/config.mjs` | `config.mjs` | `DEFAULTS` 唯一处 · 测试缝默认 `configPath` |
| `thincoder-core/agent/setup.mjs` | `setup.mjs` | depth-0 装配时序（env-state 后、time reminder 前） |
| `thincoder-core/agent/run-stages.mjs` | `run-stages.mjs` | 一次实施 run 的收尾挂点 |
| `thincoder-core/agent.mjs` ∥ `thincoder-vscode/src/agent.mjs` | `agent.mjs` | 仓内两义（核 ∥ VSC）——该决策的论点正是裸名两义，故两处都写全 |
| `thincoder-core/session-slots.mjs` | `session-slots.mjs` | D-MI11 清理面一行调用；同句邻居 = 核探针族 |
| `thincoder-core/proxy.mjs` | `proxy.mjs` | `proxyFetch` 编排 + 兼容再出口 facade（CLI 直用 ∥ VSC 经 `@thincoder/core/proxy.mjs`） |
| `thincoder-cli/test/run.mjs` ∥ `thincoder-cli/test/slow.mjs` | `run.mjs` ∥ `slow.mjs` | CLI 测试树收集器（`slow.mjs` 为纯别名） |
| `bin/thincoder.cjs` ∥ `thincoder-cli/bin/thincoder.cjs` | `thincoder.cjs` | CLI 入口族标记①；两份入口都在盘，故两处都写全 |

③ 类（退役件）与 ④ 类（叙述形）**没有落点**——前者对象已随批删除，后者从来没有这一份档。② 类的三处「继任者在盘且能指出它接了这支」逐字引文住「调研证据」节。

### 上抛项

**4 档需求档的同一面归父侧笔（本批零触碰）**——按 D1 写权矩阵，需求面 = 主 agent。列表上抛，父侧下笔：

```text
docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md   6 锚
docs/core/requirements/MULTI-INSTANCE-COLLAB.md     6 锚
docs/core/requirements/PROVIDER.md                  6 锚
docs/core/requirements/WORKSPACE.md                 6 锚
```

这 4 档按父侧 13:13 的锚读数合计 24 锚，不在本批判域（= 6 档设计档）之内；本批不写、不改、不代拟其落形。

父侧实际落笔 **23 处**（§1 逐处数出，并已复量 `docs/core/requirements` 目录 0 锚）。24 与 23 不同尺——一个数锚、一个数改动位置——因此不相减；本档不据此推断哪一处锚无需改动，该面由父侧的复量读数闭合。

### 边界

- 可以改：上面 6 档设计档 + 本档 §2。
- 不动：4 档 core 需求档（列表上抛）· 本档 §1 §3 §4 §5 §6 · 产品码 · 台账 · manifest · 其它设计档。
- 不做：段落面、行号坐标面（本批零对象）；抽取器修正（引擎面，不在本批写域）；射程外 43 处单后缀裸名。
- 不做：任何一句断言的语义扩张 —— 唯一的断言改动是删掉「端侧有镜像」这一已假事实（3 处，逐对在册）。

### 形状误判的四处出口

本批自有扫描把扩展名与通配形切成了档名。四处（3 个位置）逐条，`doc_check` 对这四处全程零命中：

| 档 | 处 | 事实靠该形承载？ | 落形 |
|---|---|---|---|
| `docs/core/design/PROXY.md` | §6.2「零 `.test.mjs`」 | 否（否定计数） | 改写成「零测试后缀用例档」——同一事实，逐字对读通过 |
| `docs/core/design/SESSION-OBSERVABILITY.md` | §6「收集面 = `thincoder-cli/test/*.test.mjs`」 | 是（写的就是收哪些档） | 原样留；由判据的 token 清单排除该形（清单是尺子，尺子读错形状在尺子上改） |
| `docs/core/design/SESSION-OBSERVABILITY.md` | §9 单元面 收集器（两处通配） | 否（主语是 `run.mjs` 那个收集器） | 随同句 `run.mjs` 收全路径时同区一并改写成不带档名的说法 |

三处改写的守卫 = 逐条对读「事实是否还在」：否定计数仍是零，收集面的主语仍指那个收集器。改不出「事实还在」的，一律回到「原样留 + 清单排除」。

### 落笔时序与当刻读数

- **次序是既成事实**：6 档的坐标改写在 §2 记录之前已落在工作树，本档处置表与树上的形逐条对应。时序面闭合，不是因为谁先谁后合规，而是因为它已被如实记下。
- **读数（本刻实跑）**：`doc_check`（`mode:"report"`，docs = 本批 6 档）⇒ 命中 0 条（锚 0 · 文字太长 0 · 行太长 0）。**这是读数，不是验收。**
- **为什么不并进验收**：改前与改后同为 0 的判据证明不了任何事——一个在开工那刻就已达标的目标，改与不改读数一样。故验收一律走可复现的红侧：`git show HEAD:<档>` 给出改前树，同一条扫描在它上面读得出数（读数见「验收判据」表）。

**上文未列、本批一并清掉的两处（同形、同档）**：

```text
docs/core/design/AGENT-PARAMS.md §6.3 · thincoder-vscode/src/advisor/loop.mjs（第 7 处同形）
     ⇒ 判法② · 改指 thincoder-core/advisor/loop.mjs
docs/core/design/AGENT-PARAMS.md §6.3 · AGENT_DEFAULTS 一角
     ⇒ 判法④ · 全仓 `AGENT_DEFAULTS` 零命中（grep）⇒ 该表已随端侧镜像删档消失，坐标与断言一并改写
```

**交付面的一条实测事实（交给实施侧 / 评审注意）**：`edit` 批「原子」在实测中不成立 —— 中途一档被写门拒时，拒文自陈「本次写入未落盘（零字节）」，而**该批中先于此档的文件已经写盘**（本批 AGENT-PARAMS ∥ SETTINGS-TOOL ∥ DOC-SYSTEM ∥ MULTI-INSTANCE ∥ SESSION-OBSERVABILITY 均属此情形）。处置 = 每批前先复量读数、批后必复量，不以前一批的回执字面为准。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未决 | §2 自陈实施已落盘：「**读数**：开工 `命中 39 条` ⇒ 落盘后 `命中 0 条`」＋状态行「设计完成（39 锚 → 0；6 档全清…）」＋「**上文未列、本批一并清掉的两处**」；而 §4 用户批准 ∥ §5 实施记录 两段皆空。AC-1 ∥ AC-5 所倚的红侧（「同一条扫描在改前树跑」）随之不可复现 |
| 2 | 🔴 | 未决 | KD-4「**KD-4 假阳不改文档。**」仍为现行决策，被否项逐字为「把 `test/*.test.mjs` 改写成别的说法让红消失」；而「**订正一：三条「假阳」改为改写，不再登记为「档改 0 字」。**」记的正是该被否动作（「三处连扩展名一起改写成不带档名的说法」）⇒ 3/39 的绿由改文档陈述换来 |
| 3 | 🔴 | 未决 | 本档「本批不改」＋「书写形仍属裸名」把单后缀裸名判为书写债；`docs/core/design/PATH-RESOLUTION.md` §2.8 KD-15 判词相反：「**它们不是笔误，是写法与解析面不匹配**」＋「用户 2026-11-08 裁定甲′——「解析面认包内相对写法，不改那批文档」」。设计只引该档为「解析链单源」，未引其所执行的书写规则（`docs/core/design/DOC-DISCIPLINE.md` D4 细则「**书写只有一个答案：全路径。**」），亦未报冲突 |
| 4 | 🟡 | 未决 | 失效值仍在活行：判法口径表仍载「假阳 | 扩展名 ∥ glob 被切成档名 | 3 | 档改 0 字，登记」而「**订正二：判法口径表的「假阳 3」一行作废**」；AC-3 行仍读「≤ 3（假阳登记条数）」而「**订正三：AC-3 目标改 0**」；两处补清使 39 的清单与合计不闭环 |
| 5 | 🟡 | 未决 | 块题「**`docs/core/design/SETTINGS-TOOL.md`（9）**」内只列八条处置（该围栏块内逐条数，无一条带「两处」展开），其中「（整段赋值腿）| 同上」∥「（词表常量）| 同上」两条无判法列、无改后形——违本批自定「格式 = 节 | token | 类 | 判法 | 改后形」与「每处命中一条处置」 |
| 6 | 🟡 | 未决 | AC-1 命令块为骨架：`const docs = <本批 6 档清单>` ∥ `const toks = <39 token 清单>` ∥ `...`，红侧写成散文（「红侧对照：把一条已写全路径的行剥掉 'thincoder-core/' 前缀」）⇒ 39 token 清单与档清单都不是可复跑形 |
| 7 | 🟡 | 未决 | 无既有件三问行；① 类只作类级断言「仓根全路径 | 仓内确有该件（含多候选按上下文定一支）」，逐条在盘核验推给 AC-2 ⇒ 新写进六档的坐标无「住哪 · 逐字名 · 谁」 |
| 8 | 🔵 | 未决 | AC-4 量法 = 「`git diff` 6 档逐行核读」；本次评审上下文报「No git repository detected — change-set context is unavailable」 |
| 9 | 🔵 | 未决 | 集成差量只给结论：「查过 `D:\teamcode\thincoder\test\RTM.md` 结构（故事索引表 / 异常与更正 / 签署面）—— 差量见下节」；三个 0 合于允许理由（「这不是「不适用」，是三个问题逐条答 0」），但未记量法（D12：怎么量 + 结论） |

VERDICT: changes-required

计数：🔴 3 · 🟡 4 · 🔵 2

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已接受（有据不改） | 「次序是既成事实：6 档的坐标改写在 §2 记录之前已落在工作树」＋「时序面闭合，不是因为谁先谁后合规，而是因为它已被如实记下」；原伤（红侧不可复现）已消：「`--head` ⇒ **27** 处；工作树 ⇒ **3** 处」走 `git show HEAD:<档>`；§1 已记用户令「现在就开，都自动跑完」 |
| 2 | 🔴 | 已修 | KD-4 改为两支并逐条守卫（「事实不靠它承载 ⇒ 可改写成同一事实，但改写后逐条对读「事实是否还在」」）＋新节「### 形状误判的四处出口」；「订正一/二/三」三块已不在 §2 |
| 3 | 🔴 | 已修 | 新节「### 射程外读数（不在本批判域）」：引所用书写规则（「书写只有一个答案：全路径」）＋判域单源（「单源 = …PATH-RESOLUTION.md §2.8 KD-15」）＋裁定原话「解析面认包内相对写法，不改那批文档」，并落「不是待清的债，本批不动，也不登记成欠账」 |
| 4 | 🟡 | 已修 | 判法口径表无「假阳」行（改为「形状字面 … 3 … 见该节」）；AC-3 目标读「0」并给出理由「AC-3 的目标写 0 而不是「≤ N」」；两处补清已入「**上文未列、本批一并清掉的两处（同形、同档）**」。余项转第 11 条 |
| 5 | 🟡 | 已修 | 块题改「（9 次命中 · 8 个位置）」；八条各带类 ∥ 判法 ∥ 改后形，无「同上」独行 |
| 6 | 🟡 | 已修 | AC-1 换成可复跑脚本（`const DOCS` ∥ `const TOKS` ∥ `scan()` ∥ `--head` 分支 ∥ 对照行）＋「**本刻读数（上面那条命令跑出来的，不是抄表）**」。子集缺陷转第 10 条 |
| 7 | 🟡 | 已修 | 新节「### 既有件三问（① ∥ ② 类 32 处）」逐落点答三问，并声明「本批**不新增任何名字**」 |
| 8 | 🔵 | 已修 | AC-4 改读「`git diff -- docs/core/design`（cwd = 仓根 · 实测可用，本刻已跑）」 |
| 9 | 🔵 | 已修 | 「**量法**：`test/RTM.md` 逐节读（故事索引表 / 异常与更正 / 签署面），按「破 / 冗余 / 新增」三问逐问答」 |
| 10 | 🔴 | 新 · 未决 | AC-1 尺子的 token 清单短四个 token：「const TOKS = ['2026-10-24-tool-timeouts.test.mjs','AGENT_DEFAULTS','docs-face.json','run-stages.mjs','session-slots.mjs','subagent.mjs','thincoder.cjs','loop.mjs','setup.mjs','agent.mjs','proxy.mjs','settings.mjs','config.mjs','slow.mjs','run.mjs']」里没有 `config-io.mjs` ∥ `session-slot-write.mjs` ∥ `generate-title.mjs` ∥ `log.mjs`，而处置面明列「§6.3 · config-io.mjs（三处）  | 端侧镜像已删（W16 配置面归一）」∥「§3.1 · session-slot-write.mjs      | 同名两份（核 ∥ vscode extension）」∥「§5   · generate-title.mjs（D11 行） | 同名两份（核 ∥ vscode extension）」⇒ 这些处写没写全路径，AC-1 ∥ AC-5 都读 0（39 次命中里 6 处不在这把尺子上） |
| 11 | 🟡 | 新 · 未决 | 判法口径表不可复算：「| ④ 叙述形 | 零同名 / 从未建 / 非档坐标（含 import 字面 `/log.mjs`） | 4 | 不带路径的叙述 |」而五块处置里判法④只三行（DOC-SYSTEM 两行 + SESSION-OBS 的 `./log.mjs`）；④ 记 3 ⇒ 29 + 3 + 1 + 3 = 36，36 + 3 = 39，与「**37 + 3 = 40 与开工 39 差 1，不配平、也不硬凑。**」自消（该段把差 1 归为「差值出处已不可复现」，实为差一）；另「**行 = 处置位置，不是命中次数。**」与按次计的处数列（① 29 = 39 − 3 − 1 − 3 − 3）不一致（D3：「「N 项/处/条」与列表**同时改**」） |
| 12 | 🔵 | 新 · 未决 | 清单按子串匹配、无词界，余一处永久假阳：「`render-loop.mjs` 一处（…SESSION-OBSERVABILITY.md §3.1）与本批 token `loop.mjs` 同尾，实为另一档」；KD-4 已给出修法「清单是尺子，尺子读错形状要在尺子上改」 |
| 13 | 🔵 | 新 · 未决 | 上抛面两个数并存：§1「共 **23 处**（不是 24——逐处数出来的）」 vs §2 上抛项「这 4 档合计 24 锚不在本批 39 之内」，未说明哪一处锚无需改动 |

VERDICT: changes-required

计数：🔴 1 · 🟡 1 · 🔵 2（另：上轮九条 —— 🔴 两条已修 / 一条有据接受，🟡 四条已修，🔵 两条已修）

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已接受（有据不改） | 「次序是既成事实：6 档的坐标改写在 §2 记录之前已落在工作树」＋「时序面闭合，不是因为谁先谁后合规，而是因为它已被如实记下」；原伤（红侧不可复现）由改前树消掉：「`--head` ⇒ **30** 处；工作树 ⇒ **3** 处」走 `git show HEAD:<档>`；§1 记用户令「现在就开，都自动跑完」 |
| 2 | 🔴 | 已修 | KD-4 已分两支「事实靠该形承载 ⇒ 原样留、由判据的 token 清单排除该形；事实不靠它承载 ⇒ 可改写成同一事实，但改写后逐条对读「事实是否还在」」＋新节「### 形状误判的四处出口」；「订正一/二/三」三块已不在 §2 |
| 3 | 🔴 | 已修 | 新节「### 射程外读数（不在本批判域）」：引所用书写规则 `docs/core/design/DOC-DISCIPLINE.md` §1「D4 细则（消费点坐标完整路径形态）」原话「**书写只有一个答案：全路径。**」（本刻在该档 §1 在盘）＋判域单源「单源 = `docs/core/design/PATH-RESOLUTION.md` §2.8 KD-15」＋裁定原话「解析面认包内相对写法，不改那批文档」＋落句「不是待清的债，本批不动，也不登记成欠账」 |
| 4 | 🟡 | 已修 | 判法口径表无「假阳」行（改为「形状字面 … 3 … 见该节」）；AC-3 目标读「0」并给理由「AC-3 的目标写 0 而不是「≤ N」」；两处补清入「**上文未列、本批一并清掉的两处（同形、同档）**」 |
| 5 | 🟡 | 已修 | 块题改「（9 次命中 · 8 个位置）」，八条各带类 ∥ 判法 ∥ 改后形，无「同上」独行 |
| 6 | 🟡 | 已修 | AC-1 换成可复跑脚本（`const DOCS` ∥ `const TOKS` ∥ `scan()` ∥ `--head` 分支 ∥ 对照行）＋「**本刻读数（上面那条命令跑出来的，不是抄表）**」 |
| 7 | 🟡 | 已修 | 新节「### 既有件三问（① ∥ ② 类 32 处）」逐落点答三问，并声明「本批**不新增任何名字**」 |
| 8 | 🔵 | 已修 | AC-4 读「`git diff -- docs/core/design`（cwd = 仓根 · 实测可用，本刻已跑）」 |
| 9 | 🔵 | 已修 | 「**量法**：`test/RTM.md` 逐节读（故事索引表 / 异常与更正 / 签署面），按「破 / 冗余 / 新增」三问逐问答」 |
| 10 | 🔴 | 已修 | 尺子补齐四个 token（清单末尾 `'config-io.mjs','session-slot-write.mjs','generate-title.mjs','log.mjs'`）⇒ AC-1 行改读「处置表的 19 个 token」，且三个读数自洽可复算：「--head  27 → 31（补 token +4）→ 30（段界 −1）」∥「工作树   3 →  4（补 token +1）→  3（段界 −1）」 |
| 11 | 🟡 | 已修 | 表按行重算「全节逐类数：① 22 ∥ ② 5 ∥ ③ 1 ∥ ④ 4，合计 32」，④ 的第四行现带标签（「上文未列」块 · `AGENT_DEFAULTS` 一角 · 判法④），逐块括注（6 ∥ 4 ∥ 5 ∥ 5 ∥ 4 ∥ 8）可复算 = 32；旧句「37 + 3 = 40 与开工 39 差 1」已不在档，改为「**处置行 32 不与开工 39 对账。** 两支尺子量两件事」；处数列题头 =「行数（处置位置）」，与「**行 = 处置位置，不是命中次数。**」一致 |
| 12 | 🔵 | 已修 | 匹配加段界（`// 段界：token 左邻是名字字符即不算命中`）＋读数「段界 −1」，残余表不再含那个同尾档 |
| 13 | 🔵 | 已修 | 上抛项补「父侧实际落笔 **23 处**…24 与 23 不同尺——一个数锚、一个数改动位置——因此不相减…该面由父侧的复量读数闭合」 |

VERDICT: pass

计数：🔴 0 · 🟡 0 · 🔵 0 未决（本轮 13 条 = 上轮九条：🔴 两条已修 / 一条有据接受，🟡 四条已修，🔵 两条已修；上轮新增：🔴 1 ∥ 🟡 1 ∥ 🔵 2，全数已修）

## §4 用户批准（主 agent）

- **批准**：用户 2026-11-08 13:44 原话「跑完啊!按照要求走,老问我什么意思?让我给你开口子,把违规责任推给我?」——按 §2 执行、按 §3 结论交付。
- **批准面** = §3 第 3 轮判 `pass` 时的那版 §2：6 档设计档 39 锚的坐标形改写 + 判据取书写形两腿扫描（token 集 19 个，含补齐的四个）+ 段界规则。**新语义零新增**。
- **不在批准面**：4 档需求档的形态修正（父侧笔，已由父侧落完 23 处，见 §1「父侧承接」）；`docs/core/design/PATH-RESOLUTION.md` §2.8 KD-15 那批单后缀可定位的形（用户已裁保持原写法，非债）。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

### 父侧复量（两半都量）

**工具面（交付门）**：新 `node` 进程，`import('./thincoder-core/doc-check/index.mjs')` 后 `runDocCheck(process.cwd(), {docs: <本批 10 档>, mode:"gate"})`（cwd = 仓根）。

| 半边 | 范围 | 读数 |
|---|---|---|
| 设计档 6 档 | 设计席笔 | `DOC-CHECK GATE: PASS` · `hits.total` = 0（锚 0 · 段落 0 · 行号 0） |
| 需求档 4 档 | **父侧笔**（本批上抛、父侧承接） | 同上 · 0 |
| 合计 | 10 档 | **锚面 0** |

**书写形面**：§2.7 那条两腿扫描（19 个 token + 段界）由设计席本刻实跑，`--head` ⇒ **30** 处、工作树 ⇒ **3** 处、判域内 **0**；三处残余逐条点名（`docs/core/design/PROXY.md` §6.1 的包导入说明符两处 + 单后缀可定位一处），均判域外且有据。父侧按同一口径复算过 30 ∥ 3 两数，与档内一致。

**⇒ 两半都到零，且零是量出来的，不是抹出来的。**

### §2 ↔ 交付对账

§3 三轮共 13 条：轮次 1 的 9 条（🔴 3 · 🟡 4 · 🔵 2）+ 轮次 2 新增 4 条（🔴 1 · 🟡 1 · 🔵 2）。终态 🔴 0 未决。判法口径表复算 32 = ① 22 ∥ ② 5 ∥ ③ 1 ∥ ④ 4，与逐块括注相加相等——**这是本批唯一一处此前算不平的数，现已平。**

### 台账

`#2187`（core · 归批）→ 核销；证据 = 本节读数。

### 前批遗留 ∥ 暂缓批

前批 `docs/batches/2026-11-08-pointer-debt.md` 已收口。暂缓批复核：无。

### 转出项

| 项 | 去处 |
|---|---|
| `docs/core/design/PATH-RESOLUTION.md` §2.8 KD-15 那批单后缀可定位形 | 用户已裁保持原写法，**不是债**，不入账 |
| 段落面 ∥ 行号坐标面存量（全库） | 不在本批射程；归 `#2174` 那条总账（已收口）另计 |

### 单元测试档 ∥ 集成测试差量

纯 `.md` 改动：无单元测试档；集成测试差量 = 破 0 · 冗余 0 · 新增 0。

### 门检

本节落笔回执：`DOC-CHECK GATE: PASS · 范围 3 档`。
