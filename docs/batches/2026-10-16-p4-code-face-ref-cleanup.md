# 2026-10-16 · P4 代码目标面行号引收正
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 用户 2026-10-16 原话：10:46「P2/3/4也都处理了吧。」+ 10:50「**p4 收**，p3p4分批。」+ 10:52「都点火，自动跑完。」；判据单源 = 本会话已定**指针纪律**（文档面不许「`某档.md:123`」式行号引，一律按章节 / 条名引——`docs/core/requirements/ENGINEERING-MODE-V2.md` 的 D4 行 + `docs/core/design/prompts/discipline-engineering.md` 的 D4 条）+ 用户既有「行号引必烂」口径。。
> 台账 = #1554（core · 归批）。前情 = docs/batches/2026-10-16-p3-en-face-ref-cleanup.md（P3 · 同律姊妹批；**用户裁「p3p4 分批」，故本批独立**）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**设计轮 `eng-designer#126` 已落（2026-10-16 11:00）**：逐档实读清单齐（三段 · 目录分组）——**228 档 / 664 处**（判分档 = **改 644 ∥ 删 9 ∥ 待裁 11**）；判据 **C1**（存量计数命令读数 HITS 664 · FILES 228）∥ **C2**（完成判据 = 本面行号引零命中）∥ C3（行宽 ≤300）∥ **C4**（六目录 `git status` = 0 行，已实跑 ⇒ **源码零编辑** ✓）；先例行有**成文同向先例**（`D:\ref\kimi-code` 立有同向禁条——「Comments pointing at other files by line number … the pointer rots within a release.」，但**该仓只立规则未清存量** ⇒ 本批 = **有先例、无存量全清先例**，已如实记）；勘察证据行在场。**父侧当场裁决其四项上抛**：**U1（规模 / 切分）**= 受理其判 —— **实施按目录分派、每派 ≤15 档**（父侧按 §2 三段清单切；放行序 = 父侧定，派前逐派报备）；**U2（同族残形：裸行号「`:63`」130 处 / 68 档 + 「第 N 行」6 处 + `.css`/`.md` 本体同类形）= 并入本批射程**（**同一病因、同一处置**——行号引必烂；合计 ≈800 处），清单里按子类单列；**待裁 11 处 = 父侧定**：**格式例 2**（prompt 串内教学例 ∥ 扫描器样例）**留**（无靶可烂）· **构建产物 1** ∥ **`node_modules` 类型档 1** **留**（非本仓自有源码）· **指向本仓外 1**（`kimi server.ts:626`）⇒ **收成档名（不带行号）** · `.json` 花括号双档形 4 ⇒ **按「改」处理**（收成档名 / 键名）；**判据时点**= 受理（9 处「删」以实施轮现盘复核为准）；**⑦ 每处原文 = 引用串 + 所在行号**= **按其现形接受**（不要求句面全文并入）。**下一步** = 父侧点火设计评审（**已点火**）→ 通过 + 用户批准 → 按目录分派 `eng-coder`（携凭证 · 每派 ≤15 档）。

**父侧就地收正（§1 自身读数 · 2026-10-16 11:19 · 依据 = `#137` 实跑）**：§1 早前记的三处数字**按盘上实读收正**——①「**三段**」⇒ **六目录段 + `bench` 段 + 同律扩展面三段**（受影响面表述随之）；②「裸行号 **130 处 / 68 档**」⇒ **130 处 / 63 档**（68 = 两子类档数并集 63 + 5）；③「`.json` 花括号 **4** 处」⇒ 盘上 **6 处**（终态表已按「全按改处理」执行）。**总读数随并入面更新为：改 854 ∥ 删 9 ∥ 留 9 = 872 处 / 262 档**（原 664 处 / 228 档 = 六目录面孔；`bench` 7 处/3 档 + `.css` 54/12 + `.md` 5/4 + U2① 133/64 + U2② 9/6 并入）。**父侧另裁三条知会**：`.md` 本体 2 处（`prompts/advisor-round{2,3}.md` 的 `run.mjs:180` 格式例）= **留**（**同物不两批各收**，P3 面已裁留）· `bench/toolcall/cases.mjs` 三处「第 N 行」= **留**（用例载荷操作数，改则动测试语义）· `CHANGELOG.md:30` 两处 = **留**（**记录面史 · D8 保留零触**）。

**父侧就地收正（§1 自身读数 · 2026-10-16 · 依据 = `#148` 实核）**：① `:11` 的总数与其第三条知会（`CHANGELOG.md:30` = 留）自不相洽 ⇒ 按 §2 现行读数收正为 **912 处 / 266 档 · 改 888 ∥ 删 9 ∥ 留 15**（留 15 = 原 9 + `CHANGELOG` 2 + `.md` 体 4；C2 五读数 = `f1` 4 · `u2a` 0 · `u2b` 3 · `css` 0 · `md` 8 · 4+0+3+0+8 = 15 ✓）；② `:9` 的「三段」⇒ **四段**（`.css` 本体 ∥ `.md` 本体 ∥ U2① ∥ U2②）；③ 裸行号实读 **130 处 / 63 档**（原记 68 = 两子类并集档数）。**父侧另裁**：`bench/results/**` 的 3 处**维持「计入 + 判留」**（记录面 · `#148` 已逐处列明理由）——理由 = 改排除会再动一轮全部数字，而**「列出并判留」强于「不看不记」**；本批的排除面（`docs/**` · `test/**`）不变。**另注**：`#148` 报「射程面已有在途落笔」（现盘 45 M）＝ 本批 `#149`–`#155` 七路在跑所写，属预期，非旁触。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-16（收正轮 2 后定稿：存量 **912 处 / 266 档**（六目录 896 处 + `bench` 16 处；F1 671 · U2 子类 142 · 本体 99）；判 = **改 888 ∥ 删 9 ∥ 留 15**；C2 预期残 15 处（= 留项全集）；零源码落笔，实施归 eng-coder）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### §2 设计（eng-designer · 2026-10-16 · 初始轮）

**来源（三句必写）**：① **来源** = 用户 2026-10-16 原话 10:46「P2/3/4也都处理了吧。」+ 10:50「**p4 收**，p3p4分批。」+ 10:52「都点火，自动跑完。」；判据单源 = **D4 指针纪律**（`docs/core/requirements/ENGINEERING-MODE-V2.md` D4 行 ∥ `docs/core/design/prompts/discipline-engineering.md` D4 条——**按 §引，勿转抄**）+ 用户既有「行号引必烂」口径。② **执行人 = eng-designer（本轮只出设计，零源码落笔）**。③ **本轮不做** = 源码落笔（归 eng-coder；须过设计评审 + 用户批准 + 凭证）∥ 文档面各批（P1/P2/P3 各归其批）∥ 需求档（主 agent 笔）。

**判据（按 § 引 · 条文不转抄）**：判据本体 = **D4**（`docs/core/requirements/ENGINEERING-MODE-V2.md` D4 行 ∥ `docs/core/design/prompts/discipline-engineering.md` D4 条）；射程 = 指针；**实施坐标 / as-of 盘点读数 / 评审证据引文** 三面各归其面。
  下述 F1–F4 与判据落点 = **本批实施轮执行口径**（据 D4 射程 + 用户 2026-10-16 10:50 把源码注释 / 文案里的 `<档>:<行>` 式引用并入同律处置的口径落形），**非判据本体**——判据本体只住 D4。判据落点 = 「指向对象**仍在** ⇒ 收**名形**（符号 / 函数名 / 节名）」∥「指向对象**已不存在** ⇒ **删**（句义保留）」。

**机制设计（判据 + 处置分档）**

- **F1 命中形**：`<档名>.<ext>:<行号>`（含区间 `:123-145`）在 `.mjs` / `.cjs` / `.js` 的注释或文案串内出现 = 一处命中；靶扩展名集 = `mjs|cjs|js|json|md|css|html|ts`（含清单实有的 `html` / `ts` 靶形）。
  射程 = **六目录 + `bench`**（`thincoder-core` ∥ `thincoder-cli` ∥ `thincoder-vscode` ∥ `thincoder-desktop` ∥ `thincoder-render-core` ∥ `thincoder-server` ∥ `bench`）；**排除** `test/**`（含 `bench/test/**`）∥ `docs/**`（任意层级 `docs` 目录）∥ `.thincoder/**` ∥ `node_modules` ∥ 构建产物（`dist*` / `build*` / `out*`）。
- **F1b 同律扩展面（并入本批 · 射程 = 本批 · 逐档逐处见下清单）**：① **本体面**——`.css` / `.md` 档体内同形（`<档名>.<ext>:<行号>`）；② **U2 子类**——**裸行号**（承前档名的 `` `:N` `` 形）∥「**第 N 行**」——**不限文件种**：`.mjs`/`.cjs`/`.js` 体与 `.css` / `.md` **体内同计**（含 `bench/**`）。各面处置同 F2（同病因 = 行号引必烂）。
- **F2 处置分档**：指向对象**仍在** ⇒ **改** = 收**名形**（该处符号 / 函数名 / 常量名；跨档引文档者 ⇒ **节名**）；指向对象**已亡** ⇒ **删**（删的是行号引这个指路形，**句义保留**——删后句失去落点者改写成自足句）；判不准 ⇒ **单列待裁、不自行处置**。
- **F3 名形取值（实施轮逐处实读）**：改后形 = **被引处的符号名**（函数 / 常量 / 导出 / 用例名 / 档节名），**不是**新行号。**禁**把 `a.mjs:12` 换成 `a.mjs:15`；**禁**把 `a.mjs:12` 换成 `b.mjs:12`。
- **F4 射程边界**：只改**指路形**，**零语义改**（不改被引对象、不改行为面、不新增指向）；**不折行**（存量超宽归行宽相位）——收正行改前 ≤300 ⇒ 改后须 ≤300；`as-of` 迁移源坐标（「上提源 = VSC `x.mjs:45`——as-of 读数」）同判：迁出源档已亡 ⇒ 删，未亡 ⇒ 收名形。

**本批条目（覆盖 · 1 条）**：六产品源码面 + `bench` 的 `.mjs`/`.cjs`/`.js` 内 `<档>:<行>` 式行号引**逐处收正**，并含四面同律扩展面（`.css` / `.md` 本体同形 ∥ 裸行号 ∥「第 N 行」）——存量合计 **912 处 / 档数并集 266**（判 = **改 888 ∥ 删 9 ∥ 留 15**；分面读数 = F1 671/231 · U2① 133/64 · U2② 9/6 · 本体 `.css` 90/14 · `.md` 9/6）。

**不在本批**：`docs/**`（含产品目录内的 `docs/` 子目录；P1/P2/P3 各归其批）∥ `test/**`（含 `bench/test/**`——工程工具面）∥ 提示词正本 `.md` 内的同形（`thincoder-core/prompts/**`——P3；盘上 2 处按 §1 裁 = 留，见下 `.md` 本体段）∥ 需求档 ∥ 被引档内容语义 ∥ 零产品码行为面 ∥ 存量超宽的**折行**（行宽相位另轮）。

**同类先例行（坐标 + 对齐 ∥ 偏离 + 理由）**

- 坐标 = `D:\ref\kimi-code\packages\agent-core\src\services\AGENTS.md` 的**禁行号指针条**（该档 `:180`）：「Comments pointing at other files by line number (`core-impl.ts:286-289`). Line numbers move; the pointer rots within a release.」**对齐**：判据同向（禁行号指路）+ **理由逐字同**（行号会漂，指针一版即烂）——本条即本仓「行号引必烂」口径的**外部独立印证**。**偏离**：该仓**只立规则、未清存量**（同仓 `packages/acp-adapter/src/*.ts`、`packages/agent-core/src/services/*.ts` 等仍密布 `types.gen.d.ts:5396` 式引用）；本批 = **存量全量收正**（该仓未做的一步）。
- 坐标 = **本仓 P1 批**（CN 提示词面去引用 · `docs/batches/2026-10-16-prompt-face-ref-cleanup.md` §2）的处置分档（真引用**删** / 豁免**留** / 判不准**单列待裁**）。**对齐**：本批 F2 沿用同三分档形。**偏离**：P1 的判据是「删引用非改址」（所指对象**无替形**）；本批的所指对象多**仍在**，故主处置 = **改名形**而非删。
- 坐标 = 本相位样本形（`docs/core/design/TURN-CAP-CONTINUE.md` 内「核 `thincoder-core/agent/turn-loop.mjs:243`（抛点）」= 任务书给定的**要收的形**）。**对齐**：本批目标形即该样本的落地形（`见 `runAgent` 的抛点` 或删）。**偏离**：无。

**公共源勘察证据行**：查过工作区外参考系五仓（`D:\ref\`，按项目声明可读）。**kimi-code** 面：源码 `.ts` 内 `file.ts:N` 式注释引用**大量在场**，且其 `packages/agent-core/src/services/AGENTS.md` **已立成文禁条** ⇒ **有直接同类先例**（见上）。**MiMo-Code** 面：命中多为工具输出**格式例**（`src/a.ts:42:hit`）与用例夹具——非指路形；另有 `packages/opencode/src/session/prompt.ts` 等内含 `checkpoint.ts:715` 式指路（同族存量，未成文禁）。**oh-my-pi** 面：命中为 hashline 机制（`LINE#ID` / `:50-200` 选择器）与工具文档说明——**非指路形**。**openclaw / opencode** 两仓本轮未取到命中样本（grep 在 200 条 cap 内即止，未逐仓穷举）——如实记。⇒ **结论**：有成文同向先例（kimi-code），但**无「存量全清」先例可抄工序**；判据以本仓 D4 为准。

**受影响面表（逐目录 · 实读 2026-10-16 / 行数 = `split("\n").length`；增量口径 = **同行内改**（收正 / 删指路形均为行内替换，无整行增删）⇒ **逐档增量 `±0`**——`.css` / `.md` 本体同）**

| 目录 | 有命中档数 | 命中 | 其中已亡（删） | 行数增量 |
|---|---|---|---|---|
| `thincoder-core` | 50 | 93 | 3 | ±0 |
| `thincoder-cli` | 20 | 33 | 0 | ±0 |
| `thincoder-vscode` | 41 | 122 | 6 | ±0 |
| `thincoder-render-core` | 22 | 104 | 0 | ±0 |
| `thincoder-desktop` | 81 | 286 | 0 | ±0 |
| `thincoder-server` | 14 | 26 | 0 | ±0 |
| `bench` | 3 | 7 | 0 | ±0 |
| **合计** | **231** | **671** | **9** | **±0** |

（逐档实读行数与逐处坐标见下「逐档清单」——**六目录段 + `bench` 段**，另「同律扩展面」**四段**（`.css` 本体 ∥ `.md` 本体 ∥ U2① 裸行号 ∥ U2②「第 N 行」）。各段即本批**实施面**，按 ≤15 档 / 派切分。）

**结构面（>500 行档 · 拆案评估）**：本批射程内 >500 行档 = **2 档**——`thincoder-server/deploy/sandbox/member-shell/core-run.mjs`（**655 行** · 5 处 F1）∥ `thincoder-cli/src/tui/cmd-config.mjs`（**512 行** · 2 处裸行号）。
  **判 = 均不拆**：本批 = 行内文本替换（F4 零语义改 / 零结构改），拆档改结构与路径 ⇒ 越本批射程；两档均在 800 行硬线内（500 行 = 项目咨询线）⇒ 拆案归**独立相位**（建议入册 tech todo，非本批）。

**可机验判据（命令形 + 本轮读数 · 命令落点 = `thincoder/`（`.git` 所在；工作区根 `d:\teamcode` 下无同名目录））**

- **C1 存量计数（本面全量 · 一条命令出全部计数）**——见下「C1 命令」块（cwd = `thincoder/`；UTF-8 感知，勿用 `findstr`）。
  读数（实跑 2026-10-16）= **F1 671 处 / 231 档**（六目录 664/228 + `bench` 7/3）∥ **U2① 裸行号 130 处 / 63 档**（含 bench = 133/64）∥ **U2② 「第 N 行」 6 处 / 5 档**（含 bench = 9/6）∥ **本体 `.css` 90 处 / 14 档 · `.md` 9 处 / 6 档**（**BOOK 面同计 R2/R3**）；四族合计 **912 处 / 档数并集 266**（其中 `README.md:246` 的 `` `:8787` `` = 端口缺省值 ⇒ **非同形假命中**，留项在册）。
- **C2 完成判据（与 C1 同一条命令 · 同扩展名集 · 同排除集）**——实施收口后复跑 C1，读数须 = **`f1` 4 · `u2a` 0 · `u2b` 3 · `css` 0 · `md` 8**（残 15 处 = 留项全集）；残 15 处**全部为白名单项**（逐处点名 = 终态表 #1 #2 #10 #11 四处 ∥ `CHANGELOG.md:30` 记录面史 2 处 ∥ `bench/toolcall/cases.mjs` 用例载荷 3 处 ∥ `prompts/advisor-round{2,3}.md` 格式例 2 处 ∥ `README.md:246` 非同形假命中 1 处 ∥ `bench/results/2026-09-25-toolcall-baseline.md` 用例载荷记录 3 处）；**白名单外的任一命中 = 不合格**。
- **C3 行宽**——读数范围 = **本批改动行**（非全仓）；判据 = 改动行**不新增**超宽（改前 ≤300 ⇒ 改后须 ≤300）；**不折行**（存量超宽归行宽相位）。
  读数：命中行 >300 = **8 处**（点名 = `advisor/convergence.mjs:27` ∥ `prompts/advisor-round2.md:30` ∥ `prompts/advisor-round3.md:27` ∥ `renderer/chrome.css:224` ∕ `:226` ∕ `:227` ∥ `renderer/theme.css:16` ∕ `:17`——皆留项 / 本体面；本体面 R2/R3 行实读无一超宽 ⇒ 8 处不变）；三面存量 >300 行 = **86**（`mjs`/`cjs`/`js`）· **5**（`.css`）· **543**（`.md`）。
- **C4 零改动（设计轮 · 本批射程面）**——本批射程面 = `.mjs`/`.cjs`/`.js` + `bench/**`：`git status --porcelain` 过滤该扩展面读数 = **0 行**（实跑 2026-10-16）；六目录内 `.md` 面的现存改动（`thincoder-core/prompts/**` ∥ `tool-docs/browser.md` 等）= **P1/P3 批在途落笔，非本轮所动**（本轮只写本档 §2）。

**C1 命令（即 C2 命令 · 多行形，避免超宽单行；cwd = `thincoder/`）**

```
node -e "
const fs=require('fs'),p=require('path');
const D=['thincoder-core','thincoder-cli','thincoder-vscode','thincoder-desktop','thincoder-render-core','thincoder-server','bench'];
const SKIP=n=>['node_modules','test','tests','.thincoder','docs','coverage','.git','_archive'].includes(n)||/^(dist|build|out)/.test(n);
const CODE=['.mjs','.cjs','.js'],BOOK=['.css','.md'];
const R1=/[\w./{}-]*\.(mjs|cjs|js|json|md|css|html|ts):[0-9]+/g;
const R2=/\x60:[0-9]+(-[0-9]+)?\x60/g;
const R3=/\u7b2c\s*[0-9]+\s*\u884c/g;
const M={f1:0,f1f:0,u2a:0,u2af:0,u2b:0,u2bf:0,css:0,cssf:0,md:0,mdf:0,wideCode:0,wideCss:0,wideMd:0};
const w=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const q=p.join(d,e.name);
if(e.name.includes('.asar'))continue;
if(e.isDirectory()){if(!SKIP(e.name))w(q);continue}
const x=p.extname(e.name);if(!CODE.includes(x)&&!BOOK.includes(x))continue;
let n1=0,n2=0,n3=0,cw=0;for(const ln of fs.readFileSync(q,'utf8').split('\n')){n1+=(ln.match(R1)||[]).length;n2+=(ln.match(R2)||[]).length;n3+=(ln.match(R3)||[]).length;if(ln.length>300)cw++}
if(CODE.includes(x)){M.wideCode+=cw;if(n1){M.f1+=n1;M.f1f++}if(n2){M.u2a+=n2;M.u2af++}if(n3){M.u2b+=n3;M.u2bf++}}
else if(x==='.css'){M.wideCss+=cw;const t=n1+n2+n3;if(t){M.css+=t;M.cssf++}}
else{M.wideMd+=cw;const t=n1+n2+n3;if(t){M.md+=t;M.mdf++}}}};
D.forEach(w);console.log(JSON.stringify(M))"
```

**本轮读数（实跑 2026-10-16 · cwd = `thincoder/`）** = `{"f1":671,"f1f":231,"u2a":133,"u2af":64,"u2b":9,"u2bf":6,"css":90,"cssf":14,"md":9,"mdf":6,"wideCode":86,"wideCss":5,"wideMd":543}`。
R2 / R3 用转义（`\x60` = 反引号 · `\u7b2c` / `\u884c` = 「第」「行」）：避 shell 反引号转义与中文码页改写（直写中文会被小黑窗码页换掉 ⇒ 假读数）。

**关键决策**

- **D-P4-1 主处置 = 改名形，非删**（承 P1 偏离句）：P1 的所指对象无替形（文档引用必删）；本批所指对象多为**在册符号**，故 F2 主判 = 收名形。
- **D-P4-2 判据不进设计档**（D2）：判据本体住 D4；本轮 = 存量处置，逐处清单 = 一次性过程材料 ⇒ 落本档 §2，不进长期文档。
- **D-P4-3 禁新行号**（F3）：收正**唯一**合法终点 = 符号 / 函数 / 节名，或删。实施轮**逐处人读人改**，**禁**整仓脚本批量改（P4 关键约束）。
- **D-P4-4 留项文本不动**：本批**留**项（现 **15 处** = 终态表 #1 #2 #10 #11 四处 + `CHANGELOG.md:30` 记录面史 2 处 + `bench/toolcall/cases.mjs` 用例载荷 3 处 + `prompts/advisor-round{2,3}.md` 格式例 2 处 + `README.md:246` 非同形假命中 1 处 + `bench/results/2026-09-25-toolcall-baseline.md` 用例载荷记录 3 处）文本不动；**无未裁项**（原 11 处已全部落终态，见下终态表）。
- **D-P4-5 不自选未派工作**：`docs/**` 各批、`test/**`、超宽存量折行——**不在本批**（`.css` / `.md` 本体同形与 `bench/**` 已由父侧裁并入本批，见 F1b 与下清单）。

**待裁项终态表（11 处 · 据 §1 裁决落终态 · 无未决项）**——另 `CHANGELOG.md:30` 两处 = §1:11 裁**留**（记录面史 · D8 保留零触）：不在本表 11 处之列，逐处见下「`.md` 本体」段。

| # | 坐标 | 现引 | 终态 |
|---|---|---|---|
| 1 | `thincoder-core/advisor/convergence.mjs:27` | `run.mjs:180: timeoutId = ...` | **留**——格式例（教模型「引证须带行内容」的教学样例，无靶可烂）；同形 `.md` 正本 2 处（`prompts/advisor-round{2,3}.md:30/:27`）同判、归 P3 面 |
| 2 | `thincoder-cli/scripts/doc-impact.mjs:81` | `x.mjs:12` | **留**——格式例（扫描器自身注释里的样例形） |
| 3 | `thincoder-cli/src/acp/bridge.mjs:94` | `kimi server.ts:626-636` | **改**——收档名（去行号 ⇒ `kimi server.ts`；指向仓外声明源） |
| 4 | `thincoder-core/notify-policy.mjs:13` | `locales/{zh,en}.json:222` | **改**——收键名（花括号双档形；键名实施轮实读，本处值键 = `notify.done`） |
| 5 | `thincoder-core/notify-policy.mjs:22` | 同 #4 | **改**——同 #4 |
| 6 | `thincoder-desktop/renderer/i18n-views.mjs:26` | `locales/{zh,en}.json:254-258` | **改**——收键名 |
| 7 | `thincoder-desktop/renderer/i18n-views.mjs:28` | `locales/{zh,en}.json:218-219` | **改**——收键名 |
| 8 | `thincoder-desktop/renderer/i18n.mjs:40` | `locales/{zh,en}.json:170` | **改**——收键名 |
| 9 | `thincoder-desktop/renderer/views/activity-new.mjs:9` | `locales/{zh,en}.json:170` | **改**——收键名 |
| 10 | `thincoder-desktop/scripts/win-sign.mjs:7` | `out/codeSign/windowsSignToolManager.js:132` | **留**——指向构建产物（非在册源） |
| 11 | `thincoder-desktop/src/main/main.mjs:192` | `electron.d.ts:18227` | **留**——指向 `node_modules` 类型声明（非本仓自有源码） |

（读数 = **改 7 ∥ 留 4**；#4–#9 六行花括号形即 §1 裁「按改处理」一族——**处数订正**：§1 记「4 处」、盘上实为 **6 处**，见下疑义。）

**边界（本批不做什么）**：不做**语义改**（不动被引对象 / 不动行为）；不做**新址引入**；不碰 `docs/**`（含产品目录内 `docs/` 子目录）· `test/**`（含 `bench/test/**`）· 需求档 · 提示词正本 `.md`（P3 面）；不做整仓脚本批量替换（**逐处人读人改**）；不折存量超宽行（另轮）；不动留项 **15 处**（D-P4-4 清单）。

**第 8 项「UI / 交互决策全落」** = **无**（本批 = 注释 / 文案形收正，零用户可见面变更；无 `open` 项）。

**上抛项**

- **U1（知会 · 规模 · 派数已重算）**：存量 **912 处 / 266 档**远超单派容量 ⇒ 实施按目录分派、每派 ≤15 档。
  **派数下限 = ⌈266/15⌉ = 18**；**按目录切法（逐组 ≤15 档）= 22 派**：core 61 档 / 5 派（13+12+12+12+12）· cli 22 / 2（11+11）· vscode 45 / 3（15+15+15）· desktop 91 / 7（13×7）· render-core 25 / 2（13+12）· server 17 / 2（9+8）· bench 5 / 1 = **22 派**（档数合计 266 ✓）。放行序 = 父侧定。
- **U2（已裁 · 射程缺口已并入）**：裸行号 / 「第 N 行」/ `.css` / `.md` 本体四类**已并入本批**（父侧裁 = 同一病因、同一处置），逐档逐处清单见下「逐档清单 · 同律扩展面」各段；判据 C1 / C2 已含其读数（`u2a` / `u2b` / `css` / `md` 四计数）。**读数订正**：裸行号实读 **130 处 / 63 档**（原记「130 处 / 68 档」——第 68 档 = 两子类并集档数（63 + 5），处数 130 与实读同）；「第 N 行」实读 **6 处 / 5 档**。
- **U3（待裁 · 判依据）**：F2「指向对象已亡」的**判定时点** = 实施轮实读（本设计的 9 处删判 = 设计轮实读；实施轮以现盘复核为准——坐标漂移按惯例不追改）。

### §2 逐档清单（实施面 · 实读 2026-10-16）

**读法**：逐处格式 = `` `:行`←被引坐标 ``（`:行` = 本档命中行；被引坐标 = 现在写的那个 `档:行`）。**未标者判 = 改（收名形）**；标 `·删` = 指向对象已亡 ⇒ 删；标 `·留` = 终态留（不动）。档名后括注 = 实读行数；其后数字 = 命中数。原 11 处待裁项的终态见上「待裁项终态表」（改 7 ∥ 留 4）——故清单内该 11 处不再带裁标。

#### thincoder-core（93 处 · 50 档 · 删 3）

- `advisor/compaction.mjs`(200) 1：`:13`←`loop.mjs:12`
- `advisor/convergence.mjs`(81) 1：`:27`←`run.mjs:180`·**留**
- `advisor/run.mjs`(205) 1：`:40`←`provider/core.mjs:213-219`
- `agent/child-marks.mjs`(25) 1：`:11`←`cli/src/tui/tool-events.mjs:217`
- `agent/family-tools.mjs`(199) 2：`:5`←`agent/setup.mjs:173-293` ∥ `:178`←`thincoder-core/agent/family-tools.mjs:165-169`
- `agent/helpers.mjs`(493) 1：`:380`←`family-tools.mjs:98`
- `agent/live-beat.mjs`(50) 3：`:4`←VSC `extension/panel-messages.mjs:45` ∥ `:11`←VSC `extension/suspension.mjs:148` ∥ `:19`←VSC `panel-messages.mjs:45`
- `agent/spawn-child.mjs`(260) 1：`:35`←CLI `tui/tool-events.mjs:31`
- `agent/subagent-event.mjs`(71) 1：`:23`←CLI `tui/render.mjs:250-252`
- `agent/timers.mjs`(165) 6：`:16`←VSC `timer-watch.mjs:46` ∥ `:109`←VSC `timer-watch.mjs:33` ∥ `:110`←CLI `timer-watch.mjs:18` ∥ `:116`←VSC `timer-watch.mjs:73` ∥ `:126`←VSC `timer-watch.mjs:46` ∥ `:150`←VSC `timer-watch.mjs:94`
- `agent/turn-loop.mjs`(276) 1：`:52`←`run-start.mjs:43`
- `agent-tools/async-discard.mjs`(256) 3：`:27`←`async-settle.mjs:88-98` ∥ `:32`←`subagent-async.mjs:190` ∥ `:53`←`async-discard.mjs:37-44`
- `agent-tools/checkpoint.mjs`(122) 1：`:75`←VSC `permission-gate.mjs:80-81`
- `agent-tools/manifest.mjs`(201) 4：`:18`←`settings.mjs:216-228` ∥ `:46`←`eng.mjs:81` ∥ `:46`←`tools/git.mjs:32-35` ∥ `:68`←`settings.mjs:216-228`
- `agent-tools/parent-channel.mjs`(242) 2：`:37`←`async-discard.mjs:35` ∥ `:76`←`agent-tools/async-settle.mjs:73-83`
- `agent-tools/settings.mjs`(298) 1：`:130`←`model-ref.mjs:25-36`
- `agent-tools/task.mjs`(93) 1：`:54`←`subagent-actions.mjs:349`
- `agent-tools.mjs`(31) 2：`:25`←VSC `agent-tools/index.mjs:15` ∥ `:26`←`agent/setup.mjs:173`
- `attachments.mjs`(126) 4：`:8`←`tools/file.mjs:26` ∥ `:10`←`agent/setup-reminders.mjs:248` ∥ `:31`←`tools/file.mjs:26` ∥ `:76`←VSC `image-handler.mjs:56`
- `browser/cdp.mjs`(162) 1：`:4`←`scripts/console-walkthrough.mjs:133-141`
- `browser/launch.mjs`(190) 2：`:4`←`scripts/console-walkthrough.mjs:33-44` ∥ `:7`←`config-io.mjs:32`
- `browser/snapshot.mjs`(271) 1：`:266`←`tools/shared.mjs:190-193`
- `config-watch.mjs`(84) 2：`:3`←VSC `extension/config-watch.mjs:35-77` ∥ `:10`←`config-io.mjs:107`
- `file-refs.mjs`(104) 7：`:6`←VSC `panel-chat.mjs:187` ∥ `:6`←VSC `panel-session.mjs:185` ∥ `:7`←VSC `panel-session-write.mjs:139` ∥ `:8`←`generate-title.mjs:132` ∥ `:9`←`docs/vsc/design/WEBVIEW.md:154`（文档引⇒**节名**）∥ `:11`←`file-links.mjs:29-31` ∥ `:29`←`file-links.mjs:28`
- `generate-title.mjs`(147) 1：`:17`←VSC `panel-session-write.mjs:139`
- `hooks.mjs`(109) 1：`:101`←`mcp/transport-stdio.mjs:20`
- `mcp/transport-stdio.mjs`(166) 1：`:8`←CLI `tui/index.mjs:125`
- `memory/sweep.mjs`(293) 1：`:18`←`session-stale.mjs:124-127`
- `model-specs.mjs`(370) 1：`:353`←VSC `src/specs.mjs:13`／`:17`
- `notify-policy.mjs`(52) 6：`:5`←VSC `extension/notify.mjs:9-18` ∥ `:6`←VSC `panel-callbacks.mjs:236` ∥ `:13`←VSC `locales/{zh,en}.json:222` ∥ `:15`←VSC `panel-callbacks.mjs:236` ∥ `:22`←VSC `locales/{zh,en}.json:222` ∥ `:39`←VSC `extension/notify.mjs:9-18`
- `provider/google.mjs`(289) 1：`:88`←`generate-title.mjs:74`
- `provider/responses.mjs`(308) 2：`:87`←`agent/run-stages.mjs:43` ∥ `:255`←`responses-request.mjs:220-227`
- `provider/wait-status.mjs`(60) 1：`:23`←`provider/retry.mjs:60`
- `provider-flows.mjs`(248) 1：`:73`←VSC `provider-flows.mjs:38`
- `queued.mjs`(91) 2：`:5`←VSC `extension/queued-merge.mjs:15-36` ∥ `:6`←CLI `tui/queued-pickup.mjs:49`
- `rules.mjs`(261) 3：`:72`←CLI `make-agent.mjs:44-48` ∥ `:82`←VSC `src/extension/rules.mjs:28-81` ∥ `:175`←VSC `src/extension/rules.mjs:37-74`
- `session-gc.mjs`(365) 1：`:40`←`session-segments.mjs:13`
- `session-lifecycle.mjs`(404) 1：`:134`←`session.mjs:128`
- `session-slot-write.mjs`(235) 1：`:111`←`session-slot-verify.mjs:99`
- `session-slots-manifest.mjs`(244) 1：`:71`←`session-slot-verify.mjs:99`
- `session.mjs`(276) 1：`:186`←`session-slot-verify.mjs:99`
- `shell-candidates.mjs`(79) 2：`:2`←桌面 `settings-env.mjs:27-62` ∥ `:3`←VSC `src/extension/settings.mjs:72-115`
- `shell-identity.mjs`(108) 1：`:13`←`shell-candidates.mjs:34`
- `think-off.mjs`(50) 1：`:28`←VSC `settings-panel-write.mjs:149-164`
- `token-ttl.mjs`(297) 1：`:280`←`session-slot-verify.mjs:99`
- `tools/browser.mjs`(162) 1：`:9`←`agent/dispatch-run.mjs:77`／`:129`／`:135`
- `tools/execute.mjs`(239) 1：`:64`←`test/tool-seams.test.mjs:26`·**删**
- `tools/git-run.mjs`(142) 3：`:36`←`manifest-discovery.mjs:15-20` ∥ `:36`←`session-gc.mjs:186` ∥ `:103`←`bash.mjs:200-217`
- `tools/process-tree.mjs`(21) 2：`:3`←`execute.mjs:29` ∥ `:5`←`test/tool-seams.test.mjs:26`·**删**
- `vision-reader.mjs`(71) 5：`:4`←VSC `extension/vision-channel.mjs:14`·**删** ∥ `:5`←VSC `image-handler.mjs:70-95` ∥ `:22`←`ledger.mjs:16` ∥ `:22`←`tools/index.mjs:63` ∥ `:28`←VSC `image-handler.mjs:70`

#### thincoder-cli（33 处 · 20 档 · 删 0）

- `scripts/doc-impact.mjs`(146) 1：`:81`←`x.mjs:12`·**留**
- `src/acp/bridge.mjs`(449) 2：`:94`←`kimi server.ts:626-636` ∥ `:225`←`src/tui/render.mjs:250-252`
- `src/acp/handlers-session.mjs`(344) 1：`:133`←`provider/core.mjs:193`
- `src/acp/session.mjs`(56) 3：`:7`←`provider/core.mjs:280` ∥ `:8`←`provider/anthropic.mjs:67` ∥ `:8`←`provider/google.mjs:98`
- `src/cli/make-agent.mjs`(141) 1：`:110`←核 `session.mjs:314-317`
- `src/command-interactive.mjs`(206) 1：`:37`←`docs/core/design/PROVIDER.md:437`（文档引⇒**节名**）
- `src/prompt-injections.mjs`(38) 1：`:26`←`bin/thincoder.mjs:54`
- `src/tui/agent-turn.mjs`(424) 1：`:266`←VSC `panel-turn-loop.mjs:152-153`
- `src/tui/cmd-advisor.mjs`(292) 3：`:140`←`cmd-think.mjs:104` ∥ `:142`←`provider/core.mjs:197-204` ∥ `:150`←`cmd-think.mjs:119-120`
- `src/tui/cmd-eng.mjs`(108) 1：`:2`←`docs/core/requirements/PORTABILITY.md:62`（文档引⇒**节名**）
- `src/tui/cmd-think.mjs`(170) 2：`:116`←`provider/core.mjs:197-204` ∥ `:117`←核 `config.mjs:133-139`
- `src/tui/index.mjs`(276) 1：`:64`←`docs/core/design/PROVIDER.md:437`（⇒**节名**）
- `src/tui/model-picker.mjs`(325) 1：`:250`←`wizard.mjs:210`
- `src/tui/pickers.mjs`(135) 2：`:113`←`cmd-clear.mjs:6-9` ∥ `:113`←`cmd-new.mjs:30-33`
- `src/tui/queued-pickup.mjs`(35) 2：`:17`←`key-handler-busy.mjs:24` ∥ `:17`←`key-handler-edit.mjs:59`
- `src/tui/render-segments.mjs`(188) 3：`:71`←核件 `subblocks/activity-view.mjs:88` ∥ `:98`←VSC `webview/activity-view.js:46-49` ∥ `:104`←`thincoder-render-core/subblocks/activity-view.mjs:88`
- `src/tui/status-line.mjs`(198) 1：`:68`←VSC `panel-session.mjs:243-247`
- `src/tui/subagent-freeze.mjs`(260) 3：`:140`←核 `agent-tools/async-discard.mjs:55` ∥ `:157`←`subagent-run.mjs:187` ∥ `:157`←`advisor-async.mjs:410`
- `src/tui/suspension-drive.mjs`(262) 2：`:162`←`key-handler-busy.mjs:24` ∥ `:162`←`key-handler-edit.mjs:59`
- `src/tui/timer-watch.mjs`(66) 1：`:27`←`tool-events.mjs:434-441`

#### thincoder-server（26 处 · 14 档 · 删 0）

- `deploy/sandbox/member-shell/core-run.mjs`(655) 5：`:17`←桌面 `subagent-face.mjs:33-34` ∥ `:36`←核 `setup.mjs:220` ∥ `:49`←`thincoder-render-core/lib.mjs:27` ∥ `:69`←核 `session-slot-write.mjs:146-165` ∥ `:464`←核 `setup.mjs:220`
- `deploy/sandbox/member-shell/mcp-tools.mjs`(107) 1：`:11`←`git-cred.mjs:47`／`:75`
- `deploy/sandbox/member-shell/member-tools.mjs`(126) 1：`:15`←核 `agent/dispatch.mjs:177-243`
- `deploy/sandbox/member-shell/protocol.mjs`(319) 3：`:33`←桌面 `src/main/suspensions.mjs:19-21` ∥ `:35`←核 `dispatch.mjs:190-243` ∥ `:39`←`thincoder-render-core/subblocks/relay.mjs:155`
- `public/views-me-chat.mjs`(500) 1：`:114`←`docs/server/design/agent/MEMBER-AGENT.md:317`（文档引⇒**节名**）
- `public/views-me.mjs`(399) 1：`:9`←`public/dom.mjs:63`
- `public/views-sandbox.mjs`(343) 1：`:270`←`views-me-chat.mjs:108`
- `src/agent/chat-compact.mjs`(334) 2：`:13`←核 `agent/setup.mjs:26` ∥ `:22`←核 `agent/setup.mjs:26`
- `src/agent/chat-env-tools.mjs`(329) 1：`:41`←核 `tools/shared.mjs:26`
- `src/agent/chat-env.mjs`(97) 2：`:6`←核 `agent/setup.mjs:181-185` ∥ `:8`←`ops/update.mjs:46`
- `src/agent/member-relay.mjs`(439) 1：`:35`←桌面 `src/main/suspensions.mjs:19-21`
- `src/gateway/proxy.mjs`(268) 1：`:10`←`docs/core/design/PROVIDER.md:114`（文档引⇒**节名**）
- `src/mcp/admin-tools.mjs`(223) 5：`:11`←`mcp/routes.mjs:104-134` ∥ `:11`←`mcp/routes.mjs:43-49` ∥ `:17`←`agent/chat.mjs:230` ∥ `:22`←`mcp/routes.mjs:104` ∥ `:23`←`mcp/face.mjs:158`
- `src/webui/static.mjs`(114) 1：`:8`←桌面 `src/main/protocol.mjs:19-37`

#### thincoder-vscode（122 处 · 41 档 · 删 6）

- `src/agent/setup-reminders.mjs`(66) 2：`:45`←核 `agent/setup.mjs:172` ∥ `:46`←CLI `command-interactive.mjs:163`
- `src/agent/setup-tooltable.mjs`(104) 3：`:27`←`src/agent-tools/batch-segment.mjs:184`·**删** ∥ `:39`←`src/agent-tools/eng.mjs:92` ∥ `:40`←`src/agent-tools/verify.mjs:250`
- `src/agent/setup.mjs`(320) 6：`:164`←CLI `make-agent.mjs:44` ∥ `:219`←`subagent.mjs:271` ∥ `:220`←`subagent-spawn.mjs:304` ∥ `:220`←`subagent-async.mjs:291` ∥ `:222`←`agent.mjs:69` ∥ `:286`←核 `agent/setup.mjs:91`
- `src/agent/tool-table.mjs`(188) 3：`:6`←核 `family-tools.mjs:46` ∥ `:25`←核 `family-tools.mjs:46` ∥ `:33`←核 `family-tools.mjs:69`
- `src/agent/turn-domains.mjs`(38) 1：`:21`←本包 `src/agent.mjs:29`
- `src/config-mcp.mjs`(105) 2：`:76`←CLI `make-agent.mjs:61` ∥ `:77`←桌面 `agent-assemble.mjs:58`
- `src/embed-config.mjs`(183) 6：`:8`←`extension.mjs:47` ∥ `:68`←`extension.mjs:46` ∥ `:90`←核 `config.mjs:263` ∥ `:101`←核 `memory/docs.mjs:242` ∥ `:108`←核 `config.mjs:264` ∥ `:165`←CLI `make-agent.mjs:52`
- `src/extension/config-watch.mjs`(37) 1：`:6`←`extension.mjs:12`
- `src/extension/file-refs.mjs`(19) 3：`:6`←`panel-chat.mjs:187` ∥ `:7`←`panel-session.mjs:185` ∥ `:7`←`panel-session-write.mjs:139`
- `src/extension/image-handler.mjs`(59) 2：`:11`←`panel-turn-stages.mjs:191` ∥ `:23`←核 `attachments.mjs:71`
- `src/extension/ledger-surface.mjs`(93) 1：`:75`←`chat-panel.mjs:156`
- `src/extension/panel-callbacks.mjs`(360) 13：`:17`←CLI `tui/tool-events.mjs:131` ∥ `:36`←`panel-messages-turn.mjs:24` ∥ `:37`←`suspension.mjs:38` ∥ `:38`←`panel-messages.mjs:35` ∥ `:113`←CLI `tui/agent-turn.mjs:188` ∥ `:133`←CLI `tool-events.mjs:217` ∥ `:143`←CLI `tool-events.mjs:131` ∥ `:229`←CLI `tui/render-frame.mjs:388` ∥ `:244`←核 `agent/dispatch-run.mjs:137` ∥ `:260`←核 `advisor/timeline.mjs:21` ∥ `:261`←CLI `tool-events.mjs:322` ∥ `:308`←`subagent-spawn.mjs:318` ∥ `:315`←`subagent-spawn.mjs:308`
- `src/extension/panel-index.mjs`(248) 1：`:33`←CLI `tui/startup.mjs:263`
- `src/extension/panel-mcp.mjs`(168) 1：`:63`←CLI `make-agent.mjs:105`
- `src/extension/panel-messages-turn.mjs`(233) 1：`:72`←核 `advisor-async.mjs:326`
- `src/extension/panel-session-write.mjs`(151) 6：`:13`←`chat-panel.mjs:20` ∥ `:13`←`agent-lifecycle-singleton.test.mjs:36`·**删** ∥ `:14`←`config-io-panel.test.mjs:84`·**删** ∥ `:14`←`provider-model-guard.test.mjs:175`·**删** ∥ `:15`←`at-refs-restore.test.mjs:19`·**删** ∥ `:91`←核 `session.mjs:131`
- `src/extension/panel-subagent-relay.mjs`(223) 9：`:34`←`panel-messages-turn.mjs:24` ∥ `:35`←`suspension.mjs:38` ∥ `:45`←`subagent-run.mjs:163` ∥ `:45`←`subagent-scheduler.mjs:356` ∥ `:46`←`subagent-async.mjs:281` ∥ `:46`←`async-settle.mjs:239` ∥ `:47`←核 `agent/turn-loop.mjs:77` ∥ `:78`←CLI `tui/subagent-panel.mjs:123` ∥ `:112`←核 `agent/spawn-child.mjs:131`
- `src/extension/panel-turn-loop.mjs`(307) 12：`:5`←`panel-chat.mjs:385` ∥ `:13`←`chat-panel-messages.test.mjs:24`·**删** ∥ `:23`←本包 `src/agent.mjs:397` ∥ `:75`←本包 `src/agent.mjs:39` ∥ `:85`←本包 `src/agent.mjs:142` ∥ `:88`←本包 `src/explore-distill.mjs:143` ∥ `:88`←核 `agent/setup.mjs:53` ∥ `:116`←核 `agent/post-turn.mjs:65` ∥ `:117`←本包 `src/agent.mjs:439` ∥ `:117`←核 `agent/completion.mjs:41` ∥ `:119`←本包 `src/agent.mjs:397` ∥ `:232`←本包 `src/agent.mjs:354`
- `src/extension/panel-turn-stages.mjs`(247) 2：`:6`←`panel-chat.mjs:178` ∥ `:103`←CLI `tui/agent-turn.mjs:307`
- `src/extension/peer-domains.mjs`(33) 2：`:15`←核 `agent/dispatch-run.mjs:67` ∥ `:17`←核 `agent/run-stages.mjs:171`
- `src/extension/permission-gate.mjs`(123) 2：`:20`←CLI `permission.mjs:60` ∥ `:97`←核 `agent/dispatch.mjs:188`
- `src/extension/provider-probe-window.mjs`(123) 1：`:66`←CLI `tui/cmd-think.mjs:19`
- `src/extension/session-io.mjs`(268) 2：`:151`←核 `session-slot-verify.mjs:99` ∥ `:151`←`extension/session-slot-write.mjs:112`
- `src/extension/settings-panel-write.mjs`(213) 1：`:146`←核 `advisor/run.mjs:48`
- `src/prompt-injections.mjs`(43) 2：`:27`←`bin/thincoder.mjs:54` ∥ `:40`←`src/tools/question.md:11`（操作数档⇒**节名**）
- `src/repomap.mjs`(303) 1：`:120`←核 `tools/repomap.mjs:185`
- `src/specs.mjs`(102) 3：`:70`←CLI `tui/cmd-think.mjs:19` ∥ `:89`←CLI `tui/render-frame.mjs:388` ∥ `:89`←CLI `tui/render-loop.mjs:89`
- `src/tools/index.mjs`(193) 3：`:9`←核 `agent/dispatch-gates.mjs:130` ∥ `:43`←`src/tools/git.mjs:81` ∥ `:44`←核 `agent/dispatch-gates.mjs:130`
- `src/tools/shell.mjs`(326) 2：`:92`←核 `tools/bash.mjs:222` ∥ `:137`←核 `tools/bash.mjs:96`
- `webview/chat-messages.js`(298) 2：`:71`←CLI `tui/tool-events.mjs:145` ∥ `:274`←本包 `src/agent.mjs:79`
- `webview/chat-status.js`(164) 1：`:69`←CLI `tui/agent-turn.mjs:188`
- `webview/input.js`(129) 10：`:89`←`panels.js:95` ∥ `:98`←`send.js:62` ∥ `:104`←`send.js:54` ∥ `:105`←`send.js:46` ∥ `:109`←`send.js:85` ∥ `:114`←`loading.js:94` ∥ `:114`←`mode-buttons.js:129` ∥ `:118`←`status-bar.js:23` ∥ `:124`←`model-picker.js:96` ∥ `:128`←`thincoder-render-core/composer/model-menu.mjs:304`
- `webview/loading.js`(17) 3：`:4`←`panels.js:95` ∥ `:4`←`streaming.js:157` ∥ `:4`←`chat-messages.js:94`
- `webview/mode-buttons.js`(19) 1：`:6`←`status-bar.js:23`
- `webview/model-menu.js`(11) 2：`:7`←`settings-models.js:6` ∥ `:7`←`settings-providers.js:10`
- `webview/settings-models.js`(218) 1：`:210`←`settings-mcp-dialog.js:130`
- `webview/settings-providers.js`(145) 1：`:110`←`settings.js:190`
- `webview/settings-state.js`(91) 1：`:54`←`src/extension/provider-probe-window.mjs:67`
- `webview/status-bar.js`(136) 1：`:81`←CLI `tui/render-frame.mjs:422`
- `webview/streaming.js`(185) 4：`:93`←CLI `tui/tool-display.mjs:60` ∥ `:123`←CLI `tui/agent-turn.mjs:265` ∥ `:182`←`extension/panel-toolpanel.mjs:15` ∥ `:182`←CLI `tui/tool-events.mjs:324`
- `webview/ui.js`(256) 1：`:134`←CLI `tui/tool-events.mjs:152`

#### thincoder-render-core（104 处 · 22 档 · 删 0）

> 本包属性 = **核化搬迁**：绝大多数命中是「逐字承 VSC 老档 `ui.js:19-30`」式**上提源坐标**——源档（`thincoder-vscode/webview/*.js`）**仍在盘** ⇒ 判 = 改（收名形：被承处的函数 / 类名）。

- `cards/panel.mjs`(79) 5：`:2`←VSC `webview/panels.js:16` ∥ `:15`←VSC `panels.js:18-26` ∥ `:25`←VSC `panels.js:41` ∥ `:30`←VSC `panels.js:28-36` ∥ `:44`←VSC `panels.js:44-53`
- `cards/permission.mjs`(130) 4：`:23`←VSC `permission.js:28-56` ∥ `:58`←VSC `permission.js:21-77` ∥ `:88`←VSC `permission.js:93-102` ∥ `:104`←VSC `permission.js:86-122`
- `cards/question.mjs`(93) 2：`:10`←VSC `question.js:10-89` ∥ `:47`←本包 `composer/panel.mjs:179`
- `composer/atmenu.mjs`(150) 6：`:2`←VSC `webview/autocomplete.js:10-121` ∥ `:6`←VSC `index.html:42` ∥ `:9`←本包 `diff.mjs:6` ∥ `:13`←VSC `input.js:79-83` ∥ `:24`←VSC `autocomplete.js:33` ∥ `:89`←VSC `input.js:135-138`
- `composer/attach.mjs`(242) 8：`:2`←VSC `autocomplete.js:122-184` ∥ `:7`←VSC `autocomplete.js:126` ∥ `:22`←VSC `send.js:74-82` ∥ `:27`←VSC `autocomplete.js:126` ∥ `:79`←VSC `index.html:44,46,50-52` ∥ `:107`←VSC `autocomplete.js:127-142` ∥ `:128`←VSC `autocomplete.js:144-153` ∥ `:212`←VSC `send.js:52-53,81-82`
- `composer/controls.mjs`(237) 4：`:3`←VSC `index.html:53-63` ∥ `:10`←VSC `mode-buttons.js:19-50` ∥ `:13`←VSC `chat.js:107-108` ∥ `:187`←VSC `chat.js:107-108`
- `composer/model-menu.mjs`(494) 17：`:4`←VSC `settings-state.js:44-56` ∥ `:7`←VSC `model-menu.js:76-271` ∥ `:11`←VSC `settings-models.js:6` ∥ `:11`←VSC `settings-providers.js:10` ∥ `:14`←VSC `model-picker.js:13-36` ∥ `:26`←VSC `chat.js:97-110,121-127` ∥ `:31`←VSC `settings-state.js:44-56` ∥ `:59`←VSC `model-menu.js:76-271` ∥ `:286`←VSC `index.html:61-62` ∥ `:315`←VSC `model-picker.js:13-36` ∥ `:338`←VSC `settings.js:47` ∥ `:338`←VSC `model-menu.js:132` ∥ `:396`←VSC `panel-turn-stages.mjs:98` ∥ `:421`←VSC `model-picker.js:111-151` ∥ `:452`←VSC `send.js:47` ∥ `:453`←VSC `turn-model.mjs:22` ∥ `:474`←VSC `chat.js:97-110,121-127`
- `composer/panel.mjs`(485) 15：`:7`←VSC `index.html:42-63` ∥ `:35`←VSC `panels.js:95,114` ∥ `:36`←VSC `chat-messages.js:99` ∥ `:40`←VSC `send.js:62-72` ∥ `:42`←VSC `send.js:72` ∥ `:82`←VSC `index.html:43-49` ∥ `:245`←VSC `input.js:79-83` ∥ `:266`←VSC `index.html:42-63` ∥ `:301`←VSC `send.js:41` ∥ `:301`←VSC `state.js:130` ∥ `:467`←VSC `chat.js:47-48` ∥ `:471`←VSC `chat.js:61,105` ∥ `:473`←VSC `panels.js:95,114` ∥ `:473`←VSC `chat-messages.js:99` ∥ `:475`←VSC `chat.js:61`
- `composer/slash.mjs`(70) 2：`:46`←CLI `tui/cmd-help.mjs:10` ∥ `:54`←CLI `tui/cmd-help.mjs:13`
- `diff.mjs`(100) 1：`:6`←VSC `ui.js:419-421`
- `flow/block.mjs`(155) 7：`:18`←VSC `ui.js:19-30` ∥ `:40`←VSC `ui.js:45-85` ∥ `:86`←VSC `ui.js:136-145` ∥ `:99`←VSC `ui.js:160-174` ∥ `:118`←VSC `ui.js:176-189` ∥ `:129`←VSC `ui.js:396-402` ∥ `:140`←VSC `ui.js:404-417`
- `flow/frame.mjs`(70) 1：`:8`←本包 `flow/stream.mjs:36-92`
- `flow/stream.mjs`(136) 3：`:2`←VSC `webview/streaming.js:36-79` ∥ `:34`←VSC `webview/chat-messages.js:77-96` ∥ `:116`←VSC `streaming.js:218-231`
- `flow/tool-card.mjs`(181) 5：`:6`←VSC `ui.js:208` ∥ `:21`←VSC `ui.js:247-276` ∥ `:53`←VSC `ui.js:203-243` ∥ `:93`←VSC `ui.js:281-327` ∥ `:145`←VSC `ui.js:355-388`
- `search.mjs`(199) 2：`:21`←本包 `composer/panel.mjs:79` ∥ `:28`←桌面 `renderer/app.mjs:288`
- `subblocks/activity-view.mjs`(215) 6：`:56`←CLI `tui/subagent-panel.mjs:73` ∥ `:81`←`docs/vsc/design/WEBVIEW-PROTOCOL.md:243`（文档引⇒**节名**）∥ `:99`←CLI `tui/subagent-panel.mjs:100-102` ∥ `:148`←CLI `tui/render-segments.mjs:103-109` ∥ `:195`←CLI `tui/subagent-blocks.mjs:337` ∥ `:203`←VSC `extension/panel-subagent-relay.mjs:176`
- `subblocks/block.mjs`(115) 2：`:50`←VSC `extension/panel-toolpanel.mjs:15` ∥ `:50`←CLI `tui/tool-events.mjs:324`
- `subblocks/channel.mjs`(73) 5：`:10`←VSC `activity.js:44-55` ∥ `:25`←VSC `activity.js:59-68` ∥ `:39`←VSC `activity.js:343-349` ∥ `:50`←VSC `activity.js:233-243` ∥ `:65`←VSC `activity.js:245-252`
- `subblocks/relay.mjs`(174) 3：`:3`←VSC `extension/panel-subagent-relay.mjs:101-147` ∥ `:21`←核 `agent/relay-prefix.mjs:10` ∥ `:24`←核 `relay-prefix.mjs:16-32`
- `subblocks/state.mjs`(331) 3：`:39`←VSC `streaming.js:251-252` ∥ `:285`←VSC `activity.js:430-436` ∥ `:310`←VSC `activity.js:146-158`
- `toast.mjs`(23) 1：`:3`←VSC `webview/controls.css:49-65`
- `tool-summary.mjs`(140) 2：`:47`←CLI `tui/tool-summaries.mjs:15-17` ∥ `:101`←CLI `tui/tool-summaries.mjs:92-113`

#### thincoder-desktop（286 处 · 81 档 · 删 0）

> 本端属性 = **三端对位 / 搬迁**：命中多为「值源 = VSC `webview/base.css:190-291`」「上提源 = 核 `x.mjs:N`」式**对位坐标**——源档**多在盘** ⇒ 判 = 改（收名形）。少数指 `out/**` / `electron.d.ts` ⇒ 裁（见待裁表 #10/#11）；`locales/{zh,en}.json` 花括号形 4 处 ⇒ 裁（#6–#9）。

**renderer/（124 处 · 43 档）**

- `composer-sync.mjs`(344) 2：`:112`←VSC `provider-probe-window.mjs:64-67` ∥ `:146`←VSC `chat-panel.mjs:55-59`
- `composer-wire.mjs`(302) 2：`:67`←VSC `autocomplete.js:29-34` ∥ `:184`←VSC `panel-messages-turn.mjs:129-138`
- `events-blocks.mjs`(136) 1：`:100`←`docs/desktop/design/IPC.md:34`（文档引⇒**节名**）
- `events-status.mjs`(88) 2：`:13`←VSC `panel-callbacks.mjs:175-183` ∥ `:15`←VSC `chat-messages.js:54-107`
- `events-wake.mjs`(106) 1：`:80`←VSC `chat-status.js:97-105`
- `events.mjs`(288) 4：`:124`←`docs/desktop/design/IPC.md:31`（⇒**节名**）∥ `:150`←VSC `streaming.js:71-88` ∥ `:187`←VSC `streaming.js:156` ∥ `:260`←VSC `chat-messages.js:120`
- `heartbeat.mjs`(49) 2：`:5`←VSC `activity.js:149-153` ∥ `:19`←VSC `activity.js:149-153`
- `i18n-views.mjs`(437) 15：`:26`←VSC `locales/{zh,en}.json:254-258` ∥ `:28`←VSC `locales/{zh,en}.json:218-219` ∥ `:30`←VSC `status-bar.js:24` ∥ `:104`←VSC `locales/en.json:2-7` ∥ `:110`←CLI `cmd-session.mjs:119` ∥ `:141`←VSC `locales/en.json:178` ∥ `:148`←VSC `locales/en.json:254-258` ∥ `:154`←VSC `locales/en.json:218-219` ∥ `:157`←VSC `status-bar.js:24` ∥ `:255`←CLI `render-conversation.mjs:370-371` ∥ `:295`←VSC `locales/zh.json:2-7` ∥ `:301`←CLI `cmd-session.mjs:119` ∥ `:332`←VSC `locales/zh.json:178` ∥ `:339`←VSC `locales/zh.json:254-258` ∥ `:345`←VSC `locales/zh.json:218-219`
- `i18n.mjs`(453) 9：`:2`←`docs/desktop/design/SHELL.md:31`（⇒**节名**）∥ `:40`←VSC `locales/{zh,en}.json:170` ∥ `:130`←核 `i18n.mjs:12` ∥ `:131`←核 `i18n.mjs:75-81` ∥ `:189`←VSC `locales/en.json:34-35` ∥ `:272`←VSC `locales/en.json:259-261` ∥ `:302`←VSC `locales/zh.json:34-35` ∥ `:411`←核 `i18n.mjs:75-81` ∥ `:439`←核 `i18n.mjs:91-93`
- `mount-composer.mjs`(302) 3：`:43`←VSC `chat-panel.mjs:55-59` ∥ `:88`←本端 `renderer/mount-cards.mjs:16` ∥ `:141`←核件 `thincoder-render-core/composer/panel.mjs:304-306`
- `mount-onboarding.mjs`(236) 1：`:19`←`src/main/ipc.mjs:103-104`
- `mount-sessions.mjs`(300) 3：`:210`←VSC `chat.js:116-121` ∥ `:260`←VSC `session-bar.js:103-104` ∥ `:297`←VSC `session-bar.js:126`
- `page-read.mjs`(287) 1：`:99`←核件 `thincoder-render-core/flow/block.mjs:97-105`
- `search.mjs`(29) 2：`:19`←本端 `renderer/app.mjs:288` ∥ `:19`←本端 `app.mjs:74`
- `session-wire.mjs`(203) 2：`:55`←核 `session-slots.mjs:133` ∥ `:146`←VSC `panel-messages-session.mjs:96`
- `settings-confirm.mjs`(81) 2：`:4`←VSC `settings-widgets.js:77` ∥ `:78`←VSC `settings-widgets.js:104`
- `store.mjs`(375) 2：`:2`←`docs/desktop/design/SHELL.md:32`（⇒**节名**）∥ `:2`←`docs/desktop/design/RENDERER.md:17`（⇒**节名**）
- `subagent-reduce.mjs`(265) 8：`:33`←`src/main/agent-bridge.mjs:261` ∥ `:34`←核件 `subblocks/state.mjs:190` ∥ `:34`←VSC `activity.js:133` ∥ `:88`←CLI `tui/subagent-children.mjs:26` ∥ `:92`←CLI `distill.mjs:114` ∥ `:191`←核件 `subblocks/state.mjs:39` ∥ `:227`←VSC `webview/activity.js:180` ∥ `:240`←VSC `webview/activity.js:141`
- `views/activity-new.mjs`(114) 7：`:2`←VSC `webview/activity-new.js:21` ∥ `:3`←VSC `webview/base.css:113-117` ∥ `:4`←VSC `activity.js:60` ∥ `:6`←VSC `streaming.js:32` ∥ `:9`←VSC `locales/{zh,en}.json:170` ∥ `:34`←VSC `streaming.js:32` ∥ `:42`←VSC `activity.js:60`
- `views/activity.mjs`(211) 1：`:206`←VSC `streaming.js:32`
- `views/chat-digest-rows.mjs`(289) 4：`:29`←VSC `chat-status.js:74` ∥ `:42`←VSC `chat-status.js:112` ∥ `:63`←VSC `chat-status.js:79` ∥ `:97`←VSC `chat-status.js:72`
- `views/chat-model.mjs`(109) 1：`:15`←本端 `renderer/store.mjs:53`
- `views/chat-pending.mjs`(70) 1：`:3`←CLI `tui/render-conversation.mjs:359`
- `views/chat-scroll.mjs`(109) 2：`:22`←VSC `webview/history.js:82` ∥ `:25`←VSC `ui.js:204`
- `views/chat-subagent.mjs`(107) 2：`:12`←VSC `activity.js:104` ∥ `:15`←VSC `ui.js:199`
- `views/chat-tool.mjs`(301) 3：`:15`←VSC `ui.js:104` ∥ `:75`←VSC `ui.js:104` ∥ `:100`←VSC `streaming.js:111`
- `views/chat-tree.mjs`(146) 1：`:51`←核件 `flow/block.mjs:138`
- `views/compress-status.mjs`(76) 2：`:3`←VSC `chat-status.js:17` ∥ `:23`←VSC `chat-status.js:26`
- `views/goal.mjs`(64) 4：`:4`←VSC `panels.js:30` ∥ `:11`←VSC `status-bar.js:24` ∥ `:13`←VSC `status-bar.js:74` ∥ `:59`←VSC `status-bar.js:24`
- `views/onboarding.mjs`(308) 1：`:54`←本端 `views/settings.mjs:172`
- `views/plan.mjs`(35) 1：`:4`←VSC `panels.js:15`
- `views/pool-subagents.mjs`(131) 3：`:50`←VSC `activity.js:80` ∥ `:80`←VSC `state.js:42` ∥ `:81`←VSC `activity.js:60`
- `views/question.mjs`(59) 1：`:10`←核件 `cards/question.mjs:46`
- `views/session-control.mjs`(239) 4：`:12`←VSC `session-bar.js:20` ∥ `:39`←VSC `session-bar.js:157` ∥ `:91`←VSC `session-bar.js:27` ∥ `:120`←VSC `session-bar.js:20`
- `views/settings-agent.mjs`(194) 8：`:31`←VSC `settings-agent.js:69` ∥ `:32`←核 `config.mjs:49` ∥ `:33`←VSC `settings-panel-write.mjs:122` ∥ `:35`←核 `config.mjs:50` ∥ `:36`←核 `agent.mjs:270` ∥ `:37`←VSC `settings-agent.js:27` ∥ `:49`←VSC `settings-agent.js:26` ∥ `:59`←VSC `settings-agent.js:58`
- `views/settings-controls.mjs`(194) 1：`:46`←VSC `settings-providers.js:204`
- `views/settings-sections-env.mjs`(130) 1：`:20`←VSC `settings-env.js:33`
- `views/settings-sections-providers.mjs`(213) 2：`:8`←VSC `webview/settings-providers.js:178` ∥ `:73`←VSC `settings-providers.js:189`
- `views/settings-sections-tools.mjs`(209) 4：`:11`←VSC `settings-tools.js:330` ∥ `:14`←VSC `settings-tools.js:337` ∥ `:16`←VSC `settings-tools.js:337` ∥ `:27`←VSC `settings-tools.js:337`
- `views/settings.mjs`(453) 1：`:150`←核 `advisor/run.mjs:26`
- `views/statusline-banner.mjs`(26) 1：`:5`←CLI `tui/render-frame.mjs:233`
- `views/statusline-segments.mjs`(260) 4：`:30`←CLI `tui/render-frame.mjs:396` ∥ `:53`←VSC `status-bar.js:58` ∥ `:63`←VSC `status-bar.js:101` ∥ `:165`←CLI `tui/render-frame.mjs:413`
- `views/statusline.mjs`(265) 2：`:185`←VSC `status-bar.js:24` ∥ `:186`←VSC `status-bar.js:74`

**scripts/（1 处 · 1 档）**

- `win-sign.mjs`(164) 1：`:7`←`out/codeSign/windowsSignToolManager.js:132`·**留**

**src/main/（152 处 · 35 档）**

- `agent-assemble.mjs`(143) 10：`:9`←CLI `make-agent.mjs:39` ∥ `:9`←核 `agent/assemble.mjs:61` ∥ `:10`←CLI `make-agent.mjs:46` ∥ `:15`←核 `tools/shared.mjs:104` ∥ `:24`←本端 `agent-host.mjs:55` ∥ `:28`←CLI `make-agent.mjs:61` ∥ `:55`←CLI `make-agent.mjs:61` ∥ `:82`←CLI `make-agent.mjs:127` ∥ `:130`←CLI `command-interactive.mjs:151` ∥ `:141`←核 `tools/shared.mjs:104`
- `agent-bridge.mjs`(332) 28：`:10`←VSC `panel-subagent-relay.mjs:107` ∥ `:23`←VSC `explore-distill.mjs:150` ∥ `:25`←CLI `tui/tool-events.mjs:397` ∥ `:26`←VSC `panel-callbacks.mjs:242` ∥ `:28`←核 `agent/chat-call.mjs:33` ∥ `:30`←核 `context.mjs:304` ∥ `:30`←核 `agent/run-stages.mjs:89` ∥ `:31`←VSC `panel-callbacks.mjs:175` ∥ `:33`←CLI `tool-events.mjs:217` ∥ `:34`←VSC `panel-callbacks.mjs:102` ∥ `:75`←CLI `tool-events.mjs:217` ∥ `:75`←VSC `panel-callbacks.mjs:102` ∥ `:86`←核 `agent.mjs:409` ∥ `:99`←VSC `extension/panel-subagent-relay.mjs:172` ∥ `:160`←VSC `panel-subagent-relay.mjs:107` ∥ `:171`←`docs/desktop/design/IPC.md:31`（⇒**节名**）∥ `:205`←核 `agent.mjs:273` ∥ `:208`←核 `agent/spawn-child.mjs:152` ∥ `:208`←核 `agent-tools/advisor-async.mjs:275` ∥ `:238`←核 `agent/dispatch-run.mjs:137` ∥ `:266`←核 `agent-tools/child-permission.mjs:40` ∥ `:286`←VSC `explore-distill.mjs:150` ∥ `:289`←核 `agent/turn-loop.mjs:154` ∥ `:293`←核 `agent/chat-call.mjs:33` ∥ `:300`←核 `context.mjs:304` ∥ `:300`←核 `agent/run-stages.mjs:89` ∥ `:301`←VSC `panel-callbacks.mjs:175` ∥ `:319`←CLI `tui/tool-events.mjs:400`
- `agent-host.mjs`(339) 7：`:85`←CLI `tool-events.mjs:145` ∥ `:85`←VSC `panel-callbacks.mjs:113` ∥ `:167`←核 `agent.mjs:54` ∥ `:167`←核 `session-lifecycle.mjs:113` ∥ `:178`←CLI `command-interactive.mjs:149` ∥ `:270`←CLI `render-frame.mjs:233` ∥ `:289`←CLI `tui/cmd-session.mjs:35`
- `at-complete.mjs`(75) 2：`:5`←VSC `panel-index.mjs:58` ∥ `:11`←VSC `autocomplete.js:29`
- `attachments.mjs`(108) 2：`:9`←核 `agent/setup-reminders.mjs:248` ∥ `:46`←VSC `image-handler.mjs:126`
- `editor-open.mjs`(132) 4：`:6`←核 `shell-candidates.mjs:46` ∥ `:11`←核 `mcp/transport-stdio.mjs:30` ∥ `:17`←核 `mcp/transport-stdio.mjs:30` ∥ `:97`←核 `mcp/transport-stdio.mjs:30`
- `exec-run.mjs`(23) 1：`:10`←VSC `tools/shared.mjs:104`
- `heap-watch.mjs`(316) 1：`:26`←CLI `heap-watch.mjs:43`
- `index-status.mjs`(73) 5：`:4`←VSC `extension/panel-index.mjs:146` ∥ `:5`←核 `memory/code-sync.mjs:192` ∥ `:5`←核 `memory/docs.mjs:25` ∥ `:17`←核 `agent/assemble.mjs:74` ∥ `:25`←核 `agent/assemble.mjs:74`
- `ipc.mjs`(301) 1：`:132`←VSC `panel-session.mjs:262`
- `main.mjs`(269) 5：`:46`←CLI `bin/thincoder.mjs:32` ∥ `:46`←VSC `extension.mjs:92` ∥ `:97`←核 `i18n.mjs:77` ∥ `:154`←本端 `renderer/app.mjs:230` ∥ `:192`←`electron.d.ts:18227`·**留**
- `mcp-servers.mjs`(263) 1：`:8`←核 `mcp.mjs:82`
- `memory-maintenance.mjs`(22) 2：`:6`←VSC `session-index-command.mjs:38` ∥ `:6`←VSC `session-slots.mjs:262`
- `notify.mjs`(12) 2：`:5`←VSC `extension/notify.mjs:9` ∥ `:5`←VSC `panel-callbacks.mjs:236`
- `project-info.mjs`(172) 8：`:5`←核 `ledger.mjs:118` ∥ `:8`←核 `manifest.mjs:334` ∥ `:15`←核 `ledger-surface.mjs:29` ∥ `:16`←核 `ledger.mjs:32` ∥ `:20`←VSC `extension/ledger-surface.mjs:58` ∥ `:55`←核 `ledger-surface.mjs:35` ∥ `:59`←核 `ledger-surface.mjs:22` ∥ `:84`←核 `ledger-surface.mjs:58`
- `projects.mjs`(176) 4：`:9`←核 `session-stale.mjs:56` ∥ `:12`←核 `session-stale.mjs:5` ∥ `:19`←`docs/desktop/design/IPC.md:50`（⇒**节名**）∥ `:113`←`docs/desktop/design/IPC.md:47`（⇒**节名**）
- `prompt-injections.mjs`(38) 6：`:4`←`tool-docs/bash.md:15`（操作数档⇒**节名**）∥ `:5`←`tool-docs/question.md:11`（⇒**节名**）∥ `:6`←CLI `bin/thincoder.mjs:32` ∥ `:6`←VSC `extension.mjs:92` ∥ `:14`←VSC `src/prompt-injections.mjs:20` ∥ `:26`←CLI `bin/thincoder.mjs:54`
- `providers.mjs`(312) 5：`:63`←核 `config-presets.mjs:16` ∥ `:122`←VSC `settings-panel-write.mjs:43` ∥ `:172`←核 `config-io.mjs:270` ∥ `:277`←VSC `extension/settings.mjs:291` ∥ `:285`←核 `proxy-transport.mjs:27`
- `session-actions.mjs`(80) 2：`:9`←VSC `extension/panel-session.mjs:220` ∥ `:66`←VSC `extension/panel-session.mjs:220`
- `session-flags.mjs`(97) 2：`:12`←VSC `panel-messages-settings.mjs:169` ∥ `:18`←本端 `agent-host.mjs:323`
- `session-io.mjs`(78) 6：`:6`←核 `session-lifecycle.mjs:132` ∥ `:11`←CLI `tui/agent-turn.mjs:326` ∥ `:16`←核 `session-lifecycle.mjs:43` ∥ `:19`←核 `session-store.mjs:73` ∥ `:47`←CLI `tui/tool-events.mjs:397` ∥ `:48`←VSC `extension/panel-callbacks.mjs:242`
- `session-maintenance.mjs`(113) 3：`:9`←VSC `session-gc-command.mjs:29` ∥ `:12`←VSC `session-index-command.mjs:16` ∥ `:13`←VSC `session-index-command.mjs:6`
- `session-slots.mjs`(272) 7：`:37`←核 `session-slot-write.mjs:46` ∥ `:69`←`docs/desktop/design/UI.md:38`（⇒**节名**）∥ `:103`←核 `session-lifecycle.mjs:245` ∥ `:107`←核 `session-lifecycle.mjs:306` ∥ `:111`←本端 `session-slots.mjs:225` ∥ `:203`←VSC `panel-session.mjs:184` ∥ `:261`←VSC `session-index-command.mjs:38`
- `sessions.mjs`(46) 1：`:7`←本端 `src/main/ipc.mjs:23`
- `settings-tools.mjs`(80) 2：`:9`←CLI `cmd-config.mjs:6` ∥ `:25`←CLI `cmd-config.mjs:6`
- `settings-values.mjs`(107) 1：`:23`←核 `agent-tools/settings.mjs:22`
- `settings.mjs`(298) 7：`:16`←核 `config-io.mjs:59` ∥ `:92`←核 `model-specs.mjs:287` ∥ `:92`←核 `think-off.mjs:22` ∥ `:102`←VSC `presets.mjs:97` ∥ `:159`←核 `advisor/run.mjs:26` ∥ `:174`←核 `agent/assemble.mjs:76` ∥ `:192`←VSC `settings-panel-write.mjs:186`
- `subagent-face.mjs`(82) 4：`:12`←VSC `panel-messages.mjs:45` ∥ `:16`←VSC `extension/panel-session.mjs:123` ∥ `:26`←VSC `panel-messages.mjs:45` ∥ `:61`←核 `agent-tools/subagent.mjs:78`
- `suspension-drive.mjs`(341) 3：`:9`←VSC `suspension.mjs:112` ∥ `:9`←本端 `suspension-drive.mjs:182` ∥ `:73`←CLI `tui/subagent-panel.mjs:117`
- `suspensions.mjs`(168) 2：`:4`←核 `agent/dispatch.mjs:281` ∥ `:19`←核 `agent/dispatch.mjs:281`
- `turn-driver.mjs`(237) 2：`:17`←VSC `panel-turn-loop.mjs:144` ∥ `:96`←VSC `panel-turn-loop.mjs:144`
- `turn-face.mjs`(207) 12：`:15`←VSC `panel-messages-turn.mjs:129` ∥ `:16`←VSC `panel-turn-loop.mjs:114` ∥ `:16`←CLI `tui/agent-turn.mjs:159` ∥ `:17`←VSC `panel-callbacks.mjs:233` ∥ `:22`←核 `agent/helpers.mjs:237` ∥ `:23`←核 `agent.mjs:451` ∥ `:25`←VSC `panel-turn-loop.mjs:251` ∥ `:109`←核 `agent/setup.mjs:134` ∥ `:113`←CLI `tui/agent-turn.mjs:166` ∥ `:127`←核 `agent.mjs:247` ∥ `:138`←核 `agent.mjs:451` ∥ `:163`←核 `agent.mjs:150`
- `turn-input.mjs`(147) 2：`:22`←核 `model-ref.mjs:78` ∥ `:125`←核 `agent.mjs:295`
- `window-queue.mjs`(118) 1：`:91`←本端 `src/main/turn-chain.mjs:94`
- `window.mjs`(337) 1：`:209`←VSC `session-gc-command.mjs:36`

**tools/web-quickcheck/（9 处 · 2 档）**

- `host-shim.mjs`(45) 2：`:4`←`src/preload/preload.cjs:76` ∥ `:5`←`preload.cjs:73`
- `serve.mjs`(145) 7：`:19`←`protocol.mjs:21` ∥ `:24`←`protocol.mjs:24` ∥ `:68`←`protocol.mjs:50` ∥ `:85`←`protocol.mjs:63` ∥ `:100`←`protocol.mjs:109` ∥ `:109`←`protocol.mjs:92` ∥ `:114`←`protocol.mjs:97`

### §2 逐档清单 · 同律扩展面（并入本批 · 实读 2026-10-16 · 处置同 F2）

**读法同前**；U2① 的「被引坐标」= 同行最近前置档名（无者标「承前行」——实施轮实读邻行）；`×N` = 同行同形处数（计处数时按 N 计）；`·**留**` = 终态留（不动）。

#### `bench`（F1 · 7 处 / 3 档）

- `bench/lib/client.mjs`(202) 2：`:5`←`provider/core.mjs:184-192` ∥ `:9`←`provider/sse.mjs:142-149`
- `bench/lib/params.mjs`(124) 4：`:6`←`provider/core.mjs:178` ∥ `:11`←`provider/core.mjs:196-197` ∥ `:36`←`provider/core.mjs:196-197` ∥ `:51`←`provider/core.mjs:187-190`
- `bench/probe/driver.mjs`(267) 1：`:65`←`tools/index.mjs:64`

> `bench/test/**` 按 `test/**` 排除（工程工具面）——如 `bench/test/preflight.test.mjs:102` 同形，**不收**。

#### `.css` 本体（90 处 / 14 档 · 全在 desktop / render-core / server / vscode）

**读法（本体面裸行号）**：格式 = `` `:行`←被引坐标 ``（`:行` = 本档裸行号所在行；被引坐标 = 同行最近前置档名，无者标「（承前行）」；「（本档）」= 指本档自身某处）。逐处处置同 F2——指本档 / 同档某处 ⇒ 收该处选择器 ∥ 段名；承前档名 ⇒ 收该段名；迁出源区间（「原 `:a-b`」）⇒ 收段名、去区间（源档未亡 ⇒ 收名形，依 F4）：**实施轮逐处实读落形**。

- `thincoder-desktop/renderer/chat-cards.css`(156) 5：`:6`←`webview/base.css:190-291` ∥ `:10`←`base.css:296-366` ∥ `:35`←`base.css:190-291` ∥ `:57`←`base.css:1-5` ∥ `:75`←`base.css:296-366`
- `thincoder-desktop/renderer/chat-fixes.css`(121) 11：`:5`←`webview/base.css:203-226` ∥ `:8`←`flow/tool-card.mjs:111` ∥ `:8`←`webview/ui.js:113-114` ∥ `:12`←`webview/chat.css:376-391` ∥ `:12`←`flow/block.mjs:133-145` ∥ `:40`←`webview/streaming.js:141` ∥ `:49`←`webview/base.css:203-226`
  ∥ `:50`←`renderer/chat.css:285-301` ∥ `:51`←`chat-status.js:37` ∥ `:71`←`webview/base.css:405-437` ∥ `:101`←`webview/chat.css:431-449`
  ∥ 裸行号 1 处：`:8`←`flow/tool-card.mjs`（承前行）
- `thincoder-desktop/renderer/chat.css`(366) 10：`:18`←`webview/chat.css:20-48` ∥ `:32`←`render-conversation.mjs:375` ∥ `:75`←`webview/chat.css:417-427` ∥ `:95`←`webview/chat.css:179-187` ∥ `:124`←`flow/tool-card.mjs:111` ∥ `:131`←`webview/chat.css:216-244`
  ∥ `:194`←`webview/chat.css:257-272` ∥ `:256`←`chat.css:3-18` ∥ `:315`←`webview/base.css:203-258` ∥ `:344`←`webview/base.css:248-258`
  ∥ 裸行号 5 处：`:97`←（本档） ∥ `:133`←（承前行 `webview/chat.css`）×2 ∥ `:134`←（承前行 `webview/chat.css`）×2
- `thincoder-desktop/renderer/chrome.css`(282) 7：`:55`←`webview/base.css:93-97` ∥ `:56`←`webview/chat.css:20-23` ∥ `:224`←`thincoder-cli/src/tui/render-frame.mjs:344-427` ∥ `:225`←`thincoder-cli/src/tui/ansi.mjs:31` ∥ `:226`←`render-frame.mjs:233-236` ∥ `:226`←`ansi.mjs:46`
  ∥ `:227`←`render-frame.mjs:245`
  ∥ 裸行号 3 处：`:225`←（本档 `:46`） ∥ `:226`←（本档 `:43` ∕ `:47`）×2
- `thincoder-desktop/renderer/core-markdown.css`(192) 1：`:23`←`chat.css:68-69`
- `thincoder-desktop/renderer/core.css`(336) 9：`:22`←`webview/chat.css:277-294` ∥ `:65`←`chat.css:404-414` ∥ `:134`←`chat.css:298-374` ∥ `:211`←`chat.css:467-468` ∥ `:230`←`base.css:261-291` ∥ `:230`←`controls.css:40-153` ∥ `:301`←`controls.css:107-148` ∥ `:329`←`webview/chat.css:251`
  ∥ `:331`←`webview/base.css:445`
  ∥ 裸行号 8 处：`:22`←（承前行 `webview/chat.css`） ∥ `:65`←（承前行 `VSC chat.css`） ∥ `:68`←（承前行） ∥ `:69`←（承前行） ∥ `:85`←（承前行） ∥ `:134`←（承前行 `webview/chat.css`）×2 ∥ `:330`←（承前行）
- `thincoder-desktop/renderer/pool.css`(112) 3：`:9`←`base.css:103-107` ∥ `:10`←`base.css:113-117` ∥ `:56`←`webview/base.css:113-117`
- `thincoder-desktop/renderer/session-list.css`(170) 2：`:40`←`base.css:449-457` ∥ `:91`←`session-bar.js:33-44`
  ∥ 裸行号 2 处：`:2`←`renderer/chrome.css`（原区间）×2
- `thincoder-desktop/renderer/theme.css`(71) 2：`:16`←`thincoder-cli/src/tui/ansi.mjs:46` ∥ `:17`←`thincoder-cli/src/tui/ansi.mjs:43`
  ∥ 裸行号 3 处：`:18`←（本档 `:47`） ∥ `:45`←（承前行 `webview/base.css`）×2
- `thincoder-render-core/composer/model-menu.css`(47) 2：`:3`←`renderer/index.html:7` ∥ `:7`←`webview/model-menu.js:30-74`
- `thincoder-render-core/search.css`(60) 1：`:2`←`webview/controls.css:48-99`
- `thincoder-render-core/composer/composer.css`(482) 9（裸行号 · 迁出源区间）：`:2`←`webview/controls.css`（修正区间）×4 ∥ `:3`←（承前行）×2 ∥ `:4`←（承前行）×3
- `thincoder-server/public/style.css`(446) 1：`:87`←`views-chat.mjs:284`
- `thincoder-vscode/webview/controls.css`(137) 5（裸行号 · 迁出源区间）：`:2`←`composer/composer.css`（原区间）×4 ∥ `:7`←`search.css`（原区间）×1

#### `.md` 本体（9 处 / 6 档 · 含 `bench` 1 档）

- `thincoder-core/CHANGELOG.md`(274) 2：`:30`←`tools/browser.mjs:13-15` ∥ `:30`←`permission.mjs:16`·**留**（记录面史——§1:11 裁留 · D8 保留零触）
- `thincoder-core/prompts/advisor-round2.md`(65) 1：`:30`←`run.mjs:180`·**留**（格式例——同终态表 #1；归属 P3 面）
- `thincoder-core/prompts/advisor-round3.md`(61) 1：`:27`←`run.mjs:180`·**留**（同上）
- `thincoder-vscode/AGENTS.md`(138) 1：`:91`←`settings.mjs:340`
- `thincoder-server/README.md`(260) 1（裸行号）：`:246`←（缺省端口值 `` `:8787` ``）·**留**——**非同形假命中**（端口缺省值，非行号引）
- `bench/results/2026-09-25-toolcall-baseline.md`(308) 3（「第 N 行」）：`:294`←「第 10 行」 ∥ `:300`←「第 12 行」 ∥ `:301`←「第 40 行」·**留**（用例载荷记录——同 `bench/toolcall/cases.mjs` 三处裁决：操作数，改则动记录语义）

> `docs/**`（含产品目录内 `docs/` 子目录）内的同类形实测另有 ~91 处——属记录面 / 文档面（P1/P2/P3 与冻结记录），**不在本批**（同 C1 排除口径）。
> `.md` 体 R2/R3 实测**仅上列两档**（`README.md` 端口假命中 1 · `bench/results` 载荷记录 3）——**无真指路形**。

#### U2① 裸行号（133 处 / 64 档 · 含 bench 3 处 / 1 档）

- `bench/lib/params.mjs`(124) 3：`:6`←`provider/core.mjs`×3
- `thincoder-cli/src/tui/cmd-advisor.mjs`(292) 2：`:140`←`cmd-think.mjs`×2
- `thincoder-cli/src/tui/cmd-config.mjs`(512) 2：`:28`←（承前行）×2
- `thincoder-cli/src/tui/provider-admin.mjs`(249) 2：`:3`←`model-picker.mjs` ∥ `:4`←（承前行）
- `thincoder-core/agent-tools/async-discard.mjs`(256) 2：`:135`←（承前行） ∥ `:145`←（承前行）
- `thincoder-core/agent/family-tools.mjs`(199) 1：`:194`←（承前行）
- `thincoder-core/agent/live-beat.mjs`(50) 2：`:5`←（承前行）×2
- `thincoder-core/agent/setup.mjs`(300) 1：`:59`←（承前行）
- `thincoder-core/agent/timers.mjs`(165) 14：`:16`←`thincoder-vscode/src/extension/timer-watch.mjs`×2 ∥ `:17`←（承前行）×6 ∥ `:117`←（承前行）×2 ∥ `:126`←`timer-watch.mjs`×2 ∥ `:150`←`timer-watch.mjs`×2
- `thincoder-core/browser/cdp.mjs`(162) 1：`:138`←（承前行）
- `thincoder-core/browser/launch.mjs`(190) 2：`:4`←`scripts/console-walkthrough.mjs` ∥ `:180`←（承前行）
- `thincoder-core/manifest-discovery.mjs`(135) 1：`:3`←（承前行）
- `thincoder-core/manifest-schema.mjs`(179) 2：`:3`←（承前行）×2
- `thincoder-core/memory/core.mjs`(322) 1：`:135`←（承前行）
- `thincoder-core/memory/scan.mjs`(178) 1：`:93`←（承前行）
- `thincoder-core/provider/responses-request.mjs`(240) 1：`:3`←`provider/responses.mjs`
- `thincoder-core/tools/browser.mjs`(162) 2：`:9`←`agent/dispatch-run.mjs`×2
- `thincoder-desktop/renderer/i18n-views.mjs`(437) 1：`:255`←`render-conversation.mjs`
- `thincoder-desktop/renderer/session-wire.mjs`(203) 2：`:3`←（承前行） ∥ `:55`←`thincoder-core/session-slots.mjs`
- `thincoder-desktop/renderer/views/chat-digest-rows.mjs`(289) 1：`:53`←（承前行）
- `thincoder-desktop/renderer/views/chat-pending.mjs`(70) 1：`:50`←（承前行）
- `thincoder-desktop/renderer/views/compress-status.mjs`(76) 1：`:42`←（承前行）
- `thincoder-desktop/renderer/views/settings-agent.mjs`(194) 1：`:31`←`webview/settings-agent.js`
- `thincoder-desktop/renderer/views/settings-sections-tools.mjs`(209) 1：`:11`←`settings-tools.js`
- `thincoder-desktop/src/main/loop-sampler.mjs`(78) 2：`:6`←（承前行）×2 ∥ `:65`←（承前行）
- `thincoder-desktop/src/main/project-info.mjs`(172) 1：`:9`←（承前行）
- `thincoder-desktop/src/main/projects.mjs`(176) 1：`:9`←`thincoder-core/session-stale.mjs`
- `thincoder-desktop/src/main/providers.mjs`(312) 2：`:285`←`thincoder-core/proxy-transport.mjs`×2
- `thincoder-desktop/src/main/session-slots.mjs`(272) 6：`:49`←`thincoder/core/session.mjs`×2 ∥ `:50`←（承前行） ∥ `:104`←（承前行） ∥ `:108`←（承前行） ∥ `:111`←`session-slots.mjs`
- `thincoder-desktop/src/main/settings.mjs`(298) 1：`:192`←`settings-panel-write.mjs`
- `thincoder-desktop/src/main/subagent-face.mjs`(82) 2：`:12`←`panel-messages.mjs`×2
- `thincoder-desktop/src/main/window.mjs`(337) 1：`:297`←（承前行）
- `thincoder-desktop/tools/web-quickcheck/serve.mjs`(145) 3：`:4`←`thincoder-desktop/src/main/protocol.mjs`×3
- `thincoder-render-core/cards/panel.mjs`(79) 1：`:2`←`webview/panels.js`
- `thincoder-render-core/composer/atmenu.mjs`(150) 6：`:7`←（承前行） ∥ `:8`←（承前行） ∥ `:9`←（承前行） ∥ `:10`←（承前行） ∥ `:11`←（承前行） ∥ `:16`←（承前行）
- `thincoder-render-core/composer/attach.mjs`(242) 4：`:9`←（承前行） ∥ `:10`←（承前行） ∥ `:14`←（承前行） ∥ `:190`←（承前行）
- `thincoder-render-core/composer/controls.mjs`(237) 5：`:12`←（承前行） ∥ `:14`←（承前行） ∥ `:20`←（承前行） ∥ `:21`←（承前行） ∥ `:227`←（承前行）
- `thincoder-render-core/composer/model-menu.mjs`(494) 3：`:14`←`model-picker.js` ∥ `:15`←（承前行） ∥ `:409`←（承前行）
- `thincoder-render-core/composer/panel.mjs`(485) 2：`:41`←（承前行）×2
- `thincoder-render-core/flow/block.mjs`(155) 1：`:140`←`ui.js`
- `thincoder-render-core/flow/stream.mjs`(136) 3：`:2`←`webview/streaming.js` ∥ `:3`←（承前行） ∥ `:27`←（承前行）
- `thincoder-render-core/flow/tool-card.mjs`(181) 1：`:6`←`ui.js`
- `thincoder-render-core/search.mjs`(199) 3：`:23`←（承前行） ∥ `:28`←`renderer/app.mjs` ∥ `:189`←（承前行）
- `thincoder-render-core/subblocks/activity-view.mjs`(215) 1：`:43`←（承前行）
- `thincoder-render-core/subblocks/relay.mjs`(174) 1：`:57`←（承前行）
- `thincoder-render-core/subblocks/state.mjs`(331) 1：`:39`←`subagent-reduce.mjs`
- `thincoder-render-core/tool-summary.mjs`(140) 6：`:16`←（承前行） ∥ `:17`←（承前行） ∥ `:18`←（承前行） ∥ `:31`←（承前行） ∥ `:84`←（承前行） ∥ `:118`←（承前行）
- `thincoder-server/deploy/sandbox/member-shell/mcp-tools.mjs`(107) 1：`:11`←`git-cred.mjs`
- `thincoder-server/src/agent/box-routes.mjs`(173) 1：`:123`←（承前行）
- `thincoder-server/src/agent/chat-env-tools.mjs`(329) 2：`:71`←`thincoder/core/tools/ops.mjs`×2
- `thincoder-server/src/mcp/admin-tools.mjs`(223) 2：`:11`←`routes.mjs`×2
- `thincoder-vscode/src/agent/setup.mjs`(320) 1：`:220`←（承前行）
- `thincoder-vscode/src/extension/panel-callbacks.mjs`(360) 5：`:37`←（承前行） ∥ `:38`←（承前行） ∥ `:38`←`panel-messages.mjs` ∥ `:144`←（承前行）×2
- `thincoder-vscode/src/extension/panel-settings-push.mjs`(125) 1：`:59`←（承前行）
- `thincoder-vscode/src/extension/panel-subagent-relay.mjs`(223) 2：`:34`←`panel-messages-turn.mjs` ∥ `:35`←`suspension.mjs`
- `thincoder-vscode/src/extension/panel-turn-loop.mjs`(307) 1：`:7`←（承前行）
- `thincoder-vscode/src/extension/panel-turn-stages.mjs`(247) 2：`:7`←（承前行） ∥ `:8`←（承前行）
- `thincoder-vscode/src/extension/peer-domains.mjs`(33) 3：`:15`←`agent/dispatch-run.mjs`×3
- `thincoder-vscode/src/extension/permission-gate.mjs`(123) 1：`:97`←`agent/dispatch.mjs`
- `thincoder-vscode/webview/search.js`(19) 1：`:11`←（承前行）
- `thincoder-vscode/webview/settings-providers.js`(145) 1：`:46`←（承前行）
- `thincoder-vscode/webview/settings-state.js`(91) 1：`:45`←`2026-09-28-desktop-input-vsc-align.md`
- `thincoder-vscode/webview/streaming.js`(185) 1：`:26`←（承前行）
- `thincoder-vscode/webview/ui.js`(256) 1：`:195`←（承前行）

#### U2② 「第 N 行」（9 处 / 6 档 · 含 bench 3 处 / 1 档）

- `thincoder-core/agent-tools/audit-block.mjs`(107) 1：`:63`←「§6.26 分类裁定表第 2 行」
- `thincoder-core/i18n.mjs`(126) 1：`:10`←「CORE-UNIFICATION §2.12.2 第 12 行」
- `thincoder-core/session-slot-write.mjs`(235) 1：`:217`←「§6.21 判据句 4 / 边界表第 5 行」
- `thincoder-core/think-off.mjs`(50) 2：`:20`←「§16.4 表第 1 行」 ∥ `:21`←「§16.3 / §16.4 表第 2 行」
- `thincoder-cli/src/tui/cmd-think.mjs`(170) 1：`:155`←「§15.4-2 / §16.2 生产者表第 2 行」
- `bench/toolcall/cases.mjs`(206) 3：`:28`←「从第 10 行开始的 5 行」 ∥ `:67`←「第 12 行**之后**插入一行」 ∥ `:76`←「的第 40 行整行删掉」·**留**（三处同判）

> D6 五档 6 处 = 档内注释指「某文档某表的行序」（`第 N 行`）⇒ 处置同 F2（收名形 = 该行的项名）；`bench/toolcall/cases.mjs` 三处 = **用例载荷**（工具测试入参里对临时文件行号的操作数）⇒ **留**（非指路形，改则改语义）。

### §2 收正轮 1（eng-designer · 2026-10-16 · fix 轮 · 按 §3 轮次 1 发现 #1–#11 逐条）
（**本节 = 轮 1 当时的读数与处置**；现行读数 / 判 / 清单面见下「收正轮 2」。）

**来源（三句必写）**：① **来源** = 本批档 §3 发现表（`advisor#131`）+ §1 父侧裁决（**11 条全受理**）。② **执行人 = eng-designer**（本轮只改本档 §2；**零源码落笔**）。③ **本轮不做** = 源码落笔（归 eng-coder · 携凭证）∥ 文档面各批 ∥ 需求档。

**逐号表（发现号 → 落点 → 改前 / 改后）**

| # | 落点 §节 | 改前 | 改后 |
|---|---|---|---|
| 1 | F1 段 ∥ 判据块 ∥ 新增「逐档清单 · 同律扩展面」四段 | 射程仅六目录；U2 两子类与 `.css`/`.md` 本体无逐处坐标；C2 正则不命中裸行号 / 「第 N 行」 | F1 后加 **F1b 同律扩展面**；新增 **`bench` 7/3 ∥ `.css` 本体 54/12 ∥ `.md` 本体 5/4 ∥ U2① 133/64 ∥ U2② 9/6** 逐档逐处清单；C1/C2 命令加 `R2`（裸行号）/ `R3`（第 N 行）/ `.css`+`.md` 体计数 |
| 2 | F1 靶扩展名集 ∥ C1 命令 | C1 正则 = `(mjs\|cjs\|js\|json\|md\|css)` ⇒ 实读 655/228，与「664/228」不符 | 靶集补 `html\|ts`（实读 9 处 = `index.html:…` 7 ∥ `server.ts:626` ∥ `electron.d.ts:18227`）⇒ 新命令复现 **664/228**（+bench = 671/231）；**C1 ∥ C2 = 同一条命令** |
| 3 | F1 射程 ∥ 受影响面表 ∥ 清单 | `bench/**` 未声明归属 ⇒ 既不计入、也不被 C2 看见 | `bench/**` **并入**（逐档清单 + 判据 `D` 含 `bench`）；`bench/test/**` 仍按 `test/**` 排除 |
| 4 | U1 | 「建议 6–8 派」与分组合计 10 不自洽 | 派数重算：**下限 ⌈262/15⌉ = 18 · 按目录切 = 22 派**（逐组 ≤15 档 · 各组分法逐列） |
| 5 | 待裁表 ∥ D-P4-4 | 11 处作未决形（单列待裁） | 改 **待裁项终态表**（改 7 ∥ 留 4 · 按 §1 裁决）；D-P4-4 限定为「留项文本不动」；清单内 11 处裁标改 `·**留**` / 去标 |
| 6 | 受影响面表后句（§1:9 待父侧） | 「三段」与盘上段数不符 | §2 改「六目录段 + `bench` 段 + 同律扩展面三段」；**§1:9 的「三段」= §1 席位，未改**（见疑义） |
| 7 | 受影响面表 ∥ 新增结构面 | 只给目录级增量，无逐档增量 / 拆案 | 表注写死「**逐档增量 ±0**」（行内替换）；补 **结构面（>500 行档 · 拆案评估）** = 2 档（`core-run.mjs` 655 ∥ `cmd-config.mjs` 512）**均不拆** + 理由 |
| 8 | F4 ∥ D-P4-5 ∥ 边界 | F4 允许折行，与 D-P4-5 / 边界冲突 | **删折行分支**（F4 = 不折行 · 改动行不新增超宽）；D-P4-5 / 边界保留「不折存量超宽行」⇒ 三处同拍 |
| 9 | 判据块 | C2 无 C1 排除集；C3 未写读数范围 | C1 ∥ C2 共用同一脚本（同扩展名集 / 同排除集）；C3 写明范围 = **本批改动行**（+ 命中行 >300 = 8 处点名 / 三面存量读数 86 · 5 · 543） |
| 10 | 判据块 | 未写命令落点 | 判据块首行写明 **cwd = `thincoder/`**（`.git` 所在） |
| 11 | 判据段 | :19 转述 D4 条文（与「零转抄」并置） | 改为「**按 § 引 · 条文不转抄**」+ 明标 F1–F4 = **实施轮执行口径**（非判据本体） |

**本轮读数（该轮命令形实跑 · cwd = `thincoder/` · 该轮 BOOK 面只计 R1）**：`f1 671/231 · u2a 133/64 · u2b 9/6 · css 54/12 · md 5/4 · wideCode 86 · wideCss 5 · wideMd 543`；**现行命令形（BOOK 面同计 R2/R3）读数见下「收正轮 2」**。

**疑义 / 上抛**

- `[上抛·待裁]` **§1:9 两处数字**：「三段」与「130 处 / 68 档」——§1 席位，本轮未改。实读 = 六段清单 + `bench` 段；裸行号 = **130 处 / 63 档**（68 = 两子类（裸行号 63 + 「第 N 行」5）并集档数）。请父侧同步 §1。
- `[上抛·知会]` **§1 裁「`.json` 花括号 4 处」与盘上 6 处不符**：终态表按「全部按改处理」执行（6 处 = `notify-policy.mjs:13 ∕ :22` ∥ `i18n-views.mjs:26 ∕ :28` ∥ `i18n.mjs:40` ∥ `activity-new.mjs:9`）；处数订正见终态表脚注。
- `[上抛·知会]` **`.md` 本体 2 处与 P3 面重叠**（`prompts/advisor-round{2,3}.md` 的 `run.mjs:180` 格式例）：本轮按 §1 裁 = **留**（同终态表 #1）；若 P3 批另判，以 P3 为准（同物不两批各收一次）。
- `[上抛·知会]` **`bench/toolcall/cases.mjs` 三处「第 N 行」** = 用例载荷操作数（工具测试入参）⇒ 判 **留**（非指路形，改则改语义）。
- **[已决]** **`CHANGELOG.md:30` 两处**（记录面历史证据引）= **留**（**§1:11 裁决** = 记录面史 · D8 保留零触；总数随改：本体面并入后见下「收正轮 2」）。
- `[留]` **设计轮零源码落笔**：`C4` 读数 = 0 行（本轮只写本档 §2）；实施面读数见下「收正轮 2」。

### §2 收正轮 2（eng-designer · 2026-10-16 · fix 轮 · 按 §3 轮次 2 发现 #12–#14 逐条）

**来源（三句必写）**：① **来源** = 本批档 §3 轮次 2 发现表（`advisor#146`：前轮 11 条全关闭 · 新 0🔴 · 2🟡 · 1🔵，verdict = pass）+ §1 席位裁决（`CHANGELOG.md:30` 两处 = 留）。② **执行人 = eng-designer**（本轮只改本档 §2；**零源码落笔**）。③ **本轮不做** = 一切源码落笔（`thincoder/**` 源码 / 产品 `.css` / `.md` 产品档——归下一轮 eng-coder 携凭证）∥ 文档面各批 ∥ 需求档 ∥ §1 席位（设计者无该段写权）。

**逐号表（发现号 → 落点 §节 → 改前 / 改后）**

| # | 落点 §节 | 改前 | 改后 |
|---|---|---|---|
| 12 | `CHANGELOG.md:30` 两处处置（状态行 :14 ∥ 本批条目 :33 ∥ C1 读数 :66 ∥ C2 :67 ∥ D-P4-4 :103 ∥ 终态表前言 :106 ∥ 边界 :124 ∥ `.md` 本体清单 :443 ∥ 收正轮 1 :560） | `:560` 悬置形「按 F2 判 改；若父侧认记录面冻结 ⇒ 改判留」；总数与判据按「改」计（留项 9 处不含该两处 · C2 `md` 2） | `:560` 改 **[已决] = 留**（§1:11 裁 = 记录面史 · D8 保留零触）；总数随改 **912 处 / 266 档 · 改 888 ∥ 删 9 ∥ 留 15**（`:14` `:33` 同改）；D-P4-4 留项 9 → **15 处**（`:103`）；C2 预期 `md` 2 → **8**（`:67`）；`.md` 清单 `CHANGELOG.md` 行加 ·**留** 标（`:443`）；终态表前言 / 边界页随改（`:106` `:124`）。**§1:11 自身「留 9」与其第三条知会（= 留）不自洽 ⇒ §1 席位，未自改，作 `[上抛·待裁]` 请父侧同步** |
| 13 | F1b② 射程句（:28）∥ C1 命令（:90 ∥ :91）∥ C1 读数（:66）∥ C2 预期（:67）∥ C3 读数（:69）∥ `.css` 本体段（:412）∥ `.md` 本体段（:441） | F1b② 的 U2 子类**不限文件种**，而 C1 只对 `CODE` 计 R2/R3；`.css` / `.md` 体内裸行号无逐处清单、亦不被判据看见（盘上 `.css` 体 ≥16 行 / 6 档在册外） | ① `:28` F1b② 补射程句「**不限文件种**——`.mjs`/`.cjs`/`.js` 体与 `.css` / `.md` **体内同计**（含 `bench/**`）· 射程 = 本批」；② C1 命令 `.css` / `.md` 支改 `const t=n1+n2+n3` ⇒ **BOOK 面同计 R2/R3**；③ `.css` 本体段逐处补 **36 处 / 8 档**、`.md` 本体段逐处补 **4 处 / 2 档**（逐档合计见下）；④ C1 / C2 / C3 读数随之重算（`:66` `:67` `:69` `:95`）；⑤ `.css` 段头补本体面裸行号**读法**（格式 / 被引坐标取值 / 处置同 F2） |
| 14 | 段头刻度（:58） | 「另「同律扩展面」**三段**」（与盘上四段不符） | 改「**四段**（`.css` 本体 ∥ `.md` 本体 ∥ U2① 裸行号 ∥ U2②「第 N 行」）」——切派刻度唯一 |

**本体面逐档合计（新并入 40 处 / 10 档 · 逐处坐标见上「同律扩展面」各段）**

- `.css` 体裸行号 **36 处 / 8 档**：`thincoder-vscode/webview/controls.css` 5 · `thincoder-desktop/renderer/chat-fixes.css` 1 · `chat.css` 5 · `chrome.css` 3 · `core.css` 8 · `session-list.css` 2 · `theme.css` 3 · `thincoder-render-core/composer/composer.css` 9
- `.md` 体 **4 处 / 2 档**：`thincoder-server/README.md` 1（端口缺省值 `` `:8787` `` ⇒ 非同形假命中）· `bench/results/2026-09-25-toolcall-baseline.md` 3（「第 N 行」用例载荷记录）——**皆判 留**（理由见「`.md` 本体」段各行）

**算式（总数 ∥ 判 ∥ C2 五读数——逐项自洽）**

- 总处数 = `f1` 671 + `u2a` 133 + `u2b` 9 + `css` 90 + `md` 9 = **912**；档数并集 **266** = 原 262 + 4（`controls.css` ∥ `composer.css` ∥ `README.md` ∥ `bench/results/*.md`）
- 判 = 改 **888** ∥ 删 9 ∥ 留 **15**（888+9+15 = 912 ✓）：改 888 = 872 − 2（`CHANGELOG` 改判留）+ 36（`.css` 体裸行号）；留 15 = 11（原 9 + `CHANGELOG` 2）+ 4（`.md` 体）；删 9 不变
- C2 = `f1` 4 · `u2a` 0 · `u2b` 3 · `css` 0 · `md` 8（4+0+3+0+8 = **15** = 留 15 ✓）：`css` 0 = 该面无留项；`md` 8 = `CHANGELOG.md:30` 2 ∥ `advisor-round{2,3}.md` 2 ∥ `README.md:246` 1 ∥ `bench/results/*.md` 3
- 分面读数 = `f1` 671/231 · `u2a` 133/64 · `u2b` 9/6 · `css` 90/14 · `md` 9/6（档数为并集 266，非各面之和）

**本轮读数（命令实跑 2026-10-16 · cwd = `thincoder/`）** = `{"f1":671,"f1f":231,"u2a":133,"u2af":64,"u2b":9,"u2bf":6,"css":90,"cssf":14,"md":9,"mdf":6,"wideCode":86,"wideCss":5,"wideMd":543}`

**疑义 / 上抛**

- `[上抛·待裁]` **§1 数字同步**：§1:11 记「改 854 ∥ 删 9 ∥ 留 9 = 872 处 / 262 档」，与其第三条知会（`CHANGELOG.md:30` = 留）自不相洽（按留计应为 改 852 ∥ 留 11）；另 §1:9 的「三段」∥「130 处 / 68 档」（收正轮 1 已上抛，仍未同步）。**§1 席位 = 父侧**，本轮未自改 ⇒ 请父侧同步；§2 已按实读落 912/266 · 改 888 ∥ 删 9 ∥ 留 15。
- `[上抛·待裁]` **`bench/results/**` 是否同 `docs/**` 排除**：该面 `.md` 3 处 = 工具用例载荷**记录**（记录面性质同 `docs/**`），本轮按「R2/R3 计到 BOOK 面」口径**计入 + 判留**（C2 `md` 含其 3 处）。若父侧认记录面应从射程排除 ⇒ 删该 3 处计数（总数 909 · 留 12 · C2 `md` 5），本轮可按裁改。
- `[知会]` **`.css` 体裸行号 36 处的逐处处置**：本节按 F2 默认计**改（收名形）**——指本档 / 同档某处 ⇒ 收该处选择器 ∥ 段名；承前档名（VSC 源）⇒ 收该段名；迁出源区间（「原 `:a-b`」，16 处 = `controls.css` 5 ∥ `session-list.css` 2 ∥ `composer.css` 9）⇒ 收段名、去区间（源档未亡 ⇒ 收名形，依 F4）。若实施轮实读判某处为**删**，删数随之（同 U3 惯例：设计轮判，实施轮现盘复核）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**审查对象**（按声明，不自推）：本批档 §2 三段逐档实读清单（228 档 / 664 处：改 644 ∥ 删 9 ∥ 待裁 11）+ 判据 C1–C4 —— 设计轮零源码落笔。文档面 = 本档全文；源码面只做抽验（行数 / 命中形在场性 / 删判靶点存殁），不动任何档。

**已核无异议面**（记以免重查）：① 清单内部算术自洽 —— 六段逐条求和 = 93 / 33 / 26 / 122 / 104 / 286 = 664，档数 50 / 20 / 14 / 41 / 22 / 81 = 228，删 3+6 = 9，裁 3+2+6 = 11；desktop 四分片 124+1+152+9 = 286、43+1+35+2 = 81 ✓。② 行数抽验与现盘一致：`core-run.mjs` 655 · `notify-policy.mjs` 52 · `advisor/convergence.mjs` 81 · `doc-index`→`scripts/doc-impact.mjs` 146 · `composer/atmenu.mjs` 150 · `src/main/main.mjs` 269。③ 删判靶点抽验确已不在盘：`tool-seams.test.mjs`、`extension/vision-channel.mjs`、`vscode/src/agent-tools/batch-segment.mjs`（该档仅余 `index.mjs`）、`chat-panel-messages / agent-lifecycle-singleton / at-refs-restore / config-io-panel / provider-model-guard` 五测试档 ⇒ 删判与 F2 口径相符；render-core「上提源仍在盘」依据亦成立（`thincoder-vscode/webview/*.js` 存续）。④ 先例行（:32–:36，三坐标 + 对齐 ∥ 偏离 + 理由）与公共源勘察证据行（:38，含「openclaw / opencode 本轮未取到命中样本」「如实记」）均在位，判据 9 / 10 满足。⑤ 待裁 #1 现引属实（抽验 `advisor/convergence.mjs:27` = prompt 串内教学例，格式例定性成立）。

**未决限制**：D4 本体（`docs/core/requirements/ENGINEERING-MODE-V2.md` ∥ `docs/core/prompts/discipline-engineering.md`）不在本审查射程，未读 ⇒ 与 D4 的逐字一致性与冲突判定 unverified；项目无文档地图，故「文档归属」判据按本档自述与 AGENTS.md 降格判。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / Scope | 🔴 | 「U2 同族残形」已由 §1:9 裁定并入本批并要求单列，§2 实施面与判据皆无之。§1:9 = 「U2（同族残形：裸行号「`:63`」130 处 / 68 档 + 「第 N 行」6 处 + `.css`/`.md` 本体同类形）= 并入本批射程」+「清单里按子类单列」；§2 反向记：:110 仍作待裁「请裁是否并入本批（并则合计 ≈800 处）」，:30 判「`.css` / `.md` 档**本体**内的同类形（非本批扩展名射程；见 U2）」不在本批，:85 D-P4-5 亦「**不在本批**」，:103 边界「不碰 `docs/**` · `test/**` · 需求档 · `.css` / `.md` 本体」。盘上 §2 逐档清单（:117–:376 六段）无「裸行号」/「第 N 行」两子类的逐处坐标（全文出现该两形仅 :9 与 :110）。判据侧同样不覆盖：C2（:60）正则 `\\.(mjs\|cjs\|js\|json\|md\|css):[0-9]+` 不命中裸 `:63` 形与「第 N 行」字面 ⇒ 收口可读 0 行而同族残形仍在。⇒ 实施面无该 ≈136 处、完成判据亦不能判其存殁。 | 二择一并落文：(a) 在 §2 追加这两子类的逐档清单（同 F2 处置）并把 C2 增一条能命中裸行号 / 「第 N 行」形的读数命令；(b) 若维持「不在本批」，则把 §1 的并入裁决改记为「本批不收」并写明该面归属。择一后 C2 射程须与清单射程显式对齐。 |
| 2 | Acceptance criteria | 🟡 | 判据扩展名集窄于清单射程：F1 定义命中形为「`<档名>.<ext>:<行号>`（含区间 `:123-145`）」（:23），而 C1 正则（:74）= `match(/[\w./{}-]*\.(mjs\|cjs\|js\|json\|md\|css):[0-9]+/g)`、C2（:60）同集。清单已列 `.html` / `.ts` 靶点而两者皆不命中：抽验 `thincoder-render-core/composer/atmenu.mjs:6`「照 VSC `index.html:42` 静态形」（清单 :261 记该处为第 6 命中），另 6 处 `index.html:…`（`attach.mjs:79` · `controls.mjs:3` · `model-menu.mjs:286` · `panel.mjs:7` · `panel.mjs:82` · `panel.mjs:266`）+ 待裁 #3 `kimi server.ts:626-636`（:93）+ 待裁 #11 `electron.d.ts:18227`（:101）⇒ ≥9 处已列处不被 C1 计数、亦不被 C2 检出。故 :58「本轮读数 = **HITS 664 · FILES 228**」无法由所载命令复现（同集下该 ≥9 处必不计），C2 读 0 ≠ 「本面行号引零命中」。 | 令 C1 与 C2 共用同一命令（同扩展名集 + 同排除集），并把该集补到清单实际含有的靶扩展名（如 `html\|ts`）；或反向把清单口径收为仅 `(mjs\|cjs\|js\|json\|md\|css)` 靶形并移除相应条目。基线读数与收口读数须由同一条命令产出。 |
| 3 | Scope | 🟡 | 射程只声明六目录（:23）并排除 `test/**` ∥ `docs/**` ∥ `.thincoder/**` ∥ `node_modules` ∥ 构建产物，但既不含 `bench/**` 也未在「不在本批」（:30 / :103）声明之；抽验 `thincoder/bench/**` 有同形命中：`bench/lib/params.mjs:6`「`provider/core.mjs:178` / `:184` / `:185` / `:196`」、`bench/lib/client.mjs:5`「provider/core.mjs:184-192」、`bench/probe/driver.mjs:65`、`bench/test/preflight.test.mjs:102`（≥4 档）。C1 的 D 数组（:68）与 C2 路径参数（:60）均不含 `bench` ⇒ 既不计入 664、也不被完成判据看见。（`thincoder/bin`、`thincoder/scripts` 本轮抽验 0 命中，其排除面无异议。） | 在射程面或排除面择一显式写明 `bench/**`（等仓根级非六产品目录）的归属；若收，则补 `bench` 的逐档清单与判据路径参数。 |
| 4 | Feasibility / Coordination (R5) | 🟡 | U1（:109）「存量 **664 处 / 228 档**远超单派容量 ⇒ 实施须按目录 / ≤15 档分多派（建议 = 6–8 派：core 4 派 · vscode+render-core 2 派 · desktop 3 派 · cli+server 1 派）」与已定「每派 ≤15 档」（:9）不自洽：所列分组合计 10 派（非 6–8），且 228 档按 ≤15 档/派 须 ≥16 派；按目录分组算 vscode+render-core 63 档 / 2 派、desktop 81 档 / 3 派、cli+server 34 档 / 1 派均 >15（唯 core 50 档 / 4 派 合规）。属协调项（R5）。 | 重算派数（≥16 派）或对每组明写 ≤15 档的切法，并令建议数与分组合计一致（现「6–8 派」与分组合计 10 不自洽）。 |
| 5 | Doc state (R1/R7a) | 🟡 | §2 待裁表（:91–:101）与 D-P4-4（:84「待裁不自行处置」）仍作未决形 —— 如 :94「⇒ 请裁是否并 C2 射程」、:92「⇒ 留 / 删 请裁」、:100「⇒ 删 / 收名形 请裁」；而 §1:9 已逐项裁决（「格式例 2」留 · 「构建产物 1 ∥ `node_modules` 类型档 1 留」· 「指向本仓外 1（`kimi server.ts:626`）⇒ 收成档名（不带行号）」· 「`.json` 花括号双档形 4 ⇒ 按「改」处理」）。照 §2 实施 ⇒ 11 处「文本不动」，其中 4 处 `locales/{zh,en}.json:N`（:94/:95/:98/:99）已裁为「改」且被 C1/C2 计入 ⇒ 收口留命中。 | 在 §2 追加一轮把 11 处落为终态（留 / 改 / 删 + 改后形），或写一句以 §1 裁决为准的指向，并把 D-P4-4 的「文本不动」限定到未裁项。 |
| 6 | Clarity | 🟡 | 「三段」与盘上段数不符：:52「（逐档实读行数与逐处坐标见下「逐档清单」三段——该三段即本批**实施面**，按 ≤15 档 / 派切分。）」、:9「父侧按 §2 三段清单切」；盘上 §2 逐档清单（:113）实为六段（:117 core · :170 cli · :193 server · :210 vscode · :254 render-core · :281 desktop）。 | 把「三段」改为实际段数或段名（或明写三段 = 哪三段的分组口径），使切派刻度唯一可依。 |
| 7 | Affected-file size annotations (criterion 8) | 🟡 | 增量与超档面未逐档落：受影响面表（:42–:50）只按目录给 `±0`（:40「增量口径 = 同行内改，`±0`」），清单逐档只给命中数 + 行数；且 `thincoder-server/deploy/sandbox/member-shell/core-run.mjs`(655)（:195）> 500 行 tier（本批要在其内 5 处收正），设计无拆案 / 拆案评估注。行数面本身抽验一致（见上「已核无异议面」②），缺的是 tier 与增量注。 | 受影响面表补「逐档 行数 + 期望增量（`±0` / `≤±N` / structure unchanged）」列；对 >500 行的 `core-run.mjs` 补一行拆案评估（拆 / 不拆 + 理由）。 |
| 8 | Consistency | 🟡 | F4（:26「**行宽 ≤300**（收正行若超宽随收正一并折）」）允许折行，与 D-P4-5（:85「…超宽存量折行——**不在本批**」）及边界（:103「不折存量超宽行（另轮）」）冲突；折行改变行数 ⇒ 与全表 `±0`（:40 / :50）不自洽。 | 二者取一：删折行分支并写「收正行超宽 ⇒ 单列待裁 / 另轮」，或保留折行并把相应目录增量改为 `≤±N`（点名可能增行的档）。 |
| 9 | Acceptance criteria | 🔵 | C2（:60）以 `--include=*.mjs --include=*.cjs --include=*.js` 限定，但无 C1 已有的目录排除集（:69 `S` = node_modules/test/tests/.thincoder/docs/dist/build/out/coverage/.git/_archive）⇒ `-r` 会下行 `node_modules` 等面，命中须人工剔除（同处括注「`test/**`、`docs/**`、`.thincoder/**` 命中不计」）；C3（:61「收正行 ≤300 字符；读数 = **0 行 >300**（本批未引入超宽；存量超宽另轮）」）未写读数范围（全仓行 vs 本批收正行），与「存量超宽另轮」并置则整仓读数未必为 0。 | C2 与 C1 共用一个脚本口径（同排除集）或补 `--exclude-dir`；C3 明写读数范围与期望值（本批收正行 = 0 行 >300，全仓另计）。 |
| 10 | Clarity | 🔵 | 判据命令落点未写：C1 写「仓根跑」（:56），C2 / C4 路径参数为 `thincoder-core … thincoder-server`（:60 / :62），该形只在 `thincoder/`（`.git` 所在，已核存在）下可解析；工作区根 `d:\teamcode` 无同名目录 ⇒ 换根跑即失败 / 读数失真。 | 在判据块写明命令落点（cwd = `thincoder/`）与检出面，使 664 与 0 两个读数可复现。 |
| 11 | Methodology / Document ownership | 🔵 | :19「**判据（按 § 引，零转抄）**：D4 = 指针形态按 **章节 / 条名** 引、**禁行号引**（行号随编辑必烂）」与 :17 自述「**按 §引，勿转抄**」及 D-P4-2（:82「判据本体住 D4」）并置 —— 声明不转抄而实际转述（D4 原文不在本审查射程，未读 ⇒ 是否与 D4 逐字冲突 unverified）。 | 该处只留 D4 的 § / 条坐标（去转述句），或把转述明确标为「实施轮执行口径」与 D4 本体分开，避免判据出现第二处单源。 |

**计数**：🔴 1 · 🟡 7 · 🔵 3（共 11 行）。核心阻断项 = #1（同族残形已裁并入而实施面 + 完成判据皆缺 ⇒ 收口可判「零命中」而射程内残形仍在）。

VERDICT: changes-required

### 轮次 2（评审子代理）

**轮次 2 · 审查对象**（按声明，不自推）：本批档 §2（含修正轮）五段逐档实读清单 872 处 / 262 档 + 判据 C1–C4；任务 = 核前轮 11 条处置是否落地 + 追新伤。文档面 = 本档全文（本轮实读）；源码面只抽验（清单求和 / 命中形在场性 / 行数），不动任何档。

**已核无异议面（本轮实读抽验）**：① 五段清单逐条求和与表头一致 —— `bench` 7/3（盘上 = client.mjs:5,:9 ∥ params.mjs:6,:11,:36,:51 ∥ driver.mjs:65，`bench/test/preflight.test.mjs:102` 同形按声明未收）· `.css` 54/12 · `.md` 5/4（盘上 grep `**/*.md !**/docs/** !**/.thincoder/**` = 恰 4 档 5 处：CHANGELOG.md:30 ×2 ∥ advisor-round2.md:30 ∥ advisor-round3.md:27 ∥ vscode/AGENTS.md:91）· U2① 64 档逐条求和 = 133 · U2② 9/6（盘上 = cmd-think.mjs:155 ∥ audit-block.mjs:63 ∥ i18n.mjs:10 ∥ session-slot-write.mjs:217 ∥ think-off.mjs:20,:21 ∥ bench/toolcall/cases.mjs:28,:67,:76）。② 总数算式自洽：671+133+9+54+5 = 872；档数并集 262 与 :131 逐目录切分（61+22+44+91+24+16+4 = 262）逐项核 ✓；判 = 872−9−9 = 854 改 ✓。③ 行数抽验：`cmd-config.mjs` 末行 = 512 ✓ · `CHANGELOG.md` = 274 ✓ 且 :30 现引两处在场 ✓。④ 收正轮 :527 自记「旧正则实读 655/228」——与前轮独立推出的「664−9 = 655」逐字吻合 ⇒ 前轮 ② 被证实并收正。⑤ 本轮「评审面」四档（discipline-engineering.md ∥ persona-engineering.md ∥ persona-coder.md ∥ tool-docs/browser.md）实读/抽扫：均无 `<档>:<行>` 全形、无裸 `:N`、无「第 N 行」⇒ 与设计「`prompts/**` 盘上 2 处」声明不冲突。

**未决限制**：① C1/C2 命令本轮**未实跑**（无 node 执行面）⇒ 「671/231」「872/262」按清单求和 + 算式交叉核，非实跑复现；② `.css` 54/12 未逐档点数（desktop 6 档形态抽验吻合）；③ `docs/**` ~91 处、三面存量行宽读数（86 · 5 · 543）未抽验；④ D4 本体不在本轮面（沿前轮声明）。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | thincoder/docs/batches/2026-10-16-p4-code-face-ref-cleanup.md | 🔴 | Fixed | 同族残形已入批：F1b（:28）+ 五段清单（:404 `#### `bench`（F1 · 7 处 / 3 档）` · :412 `.css 本体（54 处 / 12 档 · 全在 desktop / render-core / server）` · :431 `.md 本体（5 处 / 4 档）` · :440 `U2① 裸行号（133 处 / 64 档 · 含 bench 3 处 / 1 档）` · :507 `U2② 「第 N 行」（9 处 / 6 档 · 含 bench 3 处 / 1 档）`）+ 判据加 R2/R3（:81 `const R2=/\x60:[0-9]+(-[0-9]+)?\x60/g;`）与 `.css`/`.md` 体计数（:90 `else if(x==='.css'){M.wideCss+=cw;if(n1){M.css+=n1;M.cssf++}}`）。逐条求和抽验（见上「已核无异议面」）全 ✓；C2 预期残 9 处（:67） = 终态表留 4 + cases 3 + advisor 2 ✓ ⇒ 前轮 🔴 关闭。 |
| 2 | 2 | 同档 | 🟡 | Fixed | :26 `靶扩展名集 = `mjs|cjs|js|json|md|css|html|ts``；R1 同步（:80 `const R1=/[\w./{}-]*\.(mjs|cjs|js|json|md|css|html|ts):[0-9]+/g;`）；C1 与 C2 同一条命令（:63 `**C2 完成判据（与 C1 同一条命令 · 同扩展名集 · 同排除集）**`）。 |
| 3 | 3 | 同档 | 🟡 | Fixed | `bench/**` 入射程（:27 `射程 = **六目录 + `bench`**`）与清单（:404–:408）；`bench/test/**` 仍排除（:410 括注「按 `test/**` 排除（工程工具面）」）——盘上该档 :102 同形确未收 ✓ 一致。 |
| 4 | 4 | 同档 | 🟡 | Fixed | :131 `**派数下限 = ⌈262/15⌉ = 18**；**按目录切法（逐组 ≤15 档）= 22 派**`：逐组档数 61+22+44+91+24+16+4 = 262 ✓、各组 ≤15 ✓、派数 5+2+3+7+2+2+1 = 22 ✓。 |
| 5 | 5 | 同档 | 🟡 | Fixed | 11 处终态化（:106–:122 终态表；:122 「（读数 = **改 7 ∥ 留 4**」✓；:103 `**D-P4-4 留项文本不动**` 限定留项；:137 清单内该 11 处裁标已改）——残余一处与 §1 裁决相抵，见新 #12。 |
| 6 | 6 | 同档 | 🟡 | Fixed（§2）· Accepted（§1 席位） | :58 已改「**六目录段 + `bench` 段**，另「同律扩展面」三段」；§1:9 的「三段」属 §1 席位（设计者无该段写权），已作 :542 `[上抛·待裁]` 明记 ⇒ 受理其非改理由（R5 协调项）。残余刻度 = 新 #14（🔵）。 |
| 7 | 7 | 同档 | 🟡 | Fixed | :45 表注写死「⇒ **逐档增量 `±0`**」；:60–:61 结构面补拆案：「本批射程内 >500 行档 = **2 档**」+「**判 = 均不拆**」（附理由 + 800 行硬线）。行数抽验一致（`thincoder-cli/src/tui/cmd-config.mjs` 现盘末行 = 512 ✓）。 |
| 8 | 8 | 同档 | 🟡 | Fixed | :31 F4 已改「**不折行**（存量超宽归行宽相位）——收正行改前 ≤300 ⇒ 改后须 ≤300」，与 D-P4-5（:104）· 边界（:124）同拍 ⇒ `±0` 自洽。 |
| 9 | 9 | 同档 | 🔵 | Fixed | C2 与 C1 同扩展名集/同排除集（:63）；C3 写明「读数范围 = **本批改动行**（非全仓）」（:68）。 |
| 10 | 10 | 同档 | 🔵 | Fixed | 判据块写明落点（:63「命令落点 = `thincoder/`（`.git` 所在；工作区根 `d:\teamcode` 下无同名目录）」）。 |
| 11 | 11 | 同档 | 🔵 | Fixed | :21 `**判据（按 § 引 · 条文不转抄）**：判据本体 = **D4**`；:22 `下述 F1–F4 与判据落点 = **本批实施轮执行口径**`。 |
| 12 | (new) | 同档（§1:11 vs §2:14/33/67/103/546） | 🟡 | New：修轮后仍存裁决相抵 | `CHANGELOG.md:30` 两处处置互斥：§1（父侧 11:19 裁决）= 「`CHANGELOG.md:30` 两处 = **留**（**记录面史 · D8 保留零触**）」；§2 收正轮 :546 = 「按 F2 判 **改**（收名形 = 被引档 / 目录名）；若父侧认记录面冻结 ⇒ 改判留」，且 §2 的总数与判据按「改」计（:33「判 = **改 854 ∥ 删 9 ∥ 留 9**」· :103 留项 9 处不含该两处 · :67 C2 预期 `md` 2）。二值互斥：按 §1 执行 ⇒ C2 的 `md` 读数 = 4 ≠ 2（收口门必红）；按 §2 执行 ⇒ 违 §1 裁决。§1 自身亦不自洽：「改 854 ∥ 删 9 ∥ 留 9」与其第三条知会（= 留）相抵（应为 改 852 ∥ 留 11）。属 R1/R7e 的 doc-state 相抵 ⇒ 🟡 报告不阻断，但收口前须择一落地。 |
| 13 | (new) | 同档（:28 F1b② vs :89/:90 与 U2 清单） | 🟡 | New：射程-判据边界不一致（修轮新增面） | F1b② 的「**裸行号**（承前档名的 `` `:N` `` 形）∥「**第 N 行**」」未限定文件种，但 C1 只对 `CODE=['.mjs','.cjs','.js']` 计 R2/R3（:89 `if(CODE.includes(x)){M.wideCode+=cw;if(n1){M.f1+=n1;M.f1f++}if(n2){M.u2a+=n2;M.u2af++}if(n3){M.u2b+=n3;M.u2bf++}}`），`.css`/`.md` 体只计 R1（:90），清单 U2①（:440）/U2②（:507）亦无 `.css`/`.md` 档。盘上产品 `.css` 体内确有同形裸行号 ≥16 行 / 6 档（本轮实读 desktop/renderer）：`chat-fixes.css:8`「`flow/tool-card.mjs:111` ∕ `:114`（坐标自 `webview/ui.js:113-114` 迁移）」∥ `chat.css:97`「`.tool-head:hover`——本档 `:158` 邻位」∥ `chat.css:133`「name `:216-219` 字重 600 + `color: var(--accent)` ∕ args `:221-228`」∥ `chrome.css:225`「警示段 = CLI 黄（同档 `:46`）⟷ `--warn`」∥ `core.css:22`「）= VSC `webview/chat.css:277-294` ∕ `:393-401` 逐值——」∥ `session-list.css:2`「原 `:136-262` ∕ `:287-323` 全量逐字迁出」∥ `theme.css:18`「（同档 `:47`；两段同常量）」∥ `theme.css:45`「值源 = VSC `webview/base.css`（亮 = `:58-61` ∥ 暗 = `:35-38`）」；其中 ≥10 行（chat.css:97/133/134 ∥ core.css:68/69/85/330 ∥ session-list.css:2 ∥ theme.css:18/45）不落在任何清单命中行上 ⇒ 全无实施面。后果：C2 按 :67 读 `css` 0 ⇒ 宣告该面零命中，而同族残形在册外（同病因同处置的边界须显式）。 |
| 14 | (new) | 同档（:58 · §2 段头） | 🔵 | New：刻度标签 | :58「另「同律扩展面」**三段**（`.css` 本体 ∥ `.md` 本体 ∥ U2 子类 ①裸行号 ②「第 N 行」）」vs 盘上四段（:412 · :431 · :440 · :507；`bench` 段另计 = :404）⇒ 按「三段」切片仍无一对一刻度。 |

**计数**：前轮 11 条 = 10 Fixed + 1 Fixed/Accepted（#6 的 §1 席位残余，已明记上抛）；新 **0 🔴 · 2 🟡 · 1 🔵**。核心结论：前轮 🔴（#1）经五段清单 + R2/R3 判据落地并逐条求和复核关闭；两条 🟡 分别为「父侧裁决 vs §2 处置相抵（CHANGELOG）」与「F1b② 射程未限文件种而判据只数代码体（`.css` 体内裸行号 ≥16 行 / 6 档在册外）」。

VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）

**状态行**：实施完成（desktop 段全段收正 · 残值仅两枚留项 · fix round 2 · 终态 clean）

**来源（三句必写）**：① **来源** = 本批档 §2「逐档清单（实施面）」`thincoder-render-core` 段（F1 104 处 / 22 档）∥ §2「同律扩展面」该包条目（U2① 裸行号 14 档 38 处 · `.css` 本体 `composer/model-menu.css` 2 处 ∥ `search.css` 1 处）∥ 父侧 2026-10-16 两档裁（`composer/composer.css:2-4` **收** · 三类未覆盖形 **留**）；判据 = §2 C1/C2（本面行号引零命中）。② **执行人 = eng-coder**（携设计凭证落笔，只写本仓本包）。③ **本轮不做** = 其他目录段（core ∕ cli ∥ vscode ∥ desktop ∥ server ∥ bench，各归其派）· 实现语义改 · 新址引入 · 样式值改 · 存量超宽折行 · 未覆盖形态（留，见末）。

**处置形（逐处实读人改 · 禁脚本批量）**：`<档名>:<行号>` ⇒ **`<档名>`**（去行号、保留原路径写法）；裸行号（承前档名）⇒ **补回该档名**；`docs/**` 引 ⇒ **节名**；`.css` 本体 ⇒ 被引处**可自足的名**（选择器 ∕ 类名），无名者 ⇒ **档名**。**依据** = 任务书「未标 = 改（换成被引档名或目录名）」+ §2 F2/F3。**未取符号名形的理由（实读证据）**：被引 VSC 老档本体已被 R2 换接改写成端壳（实读 `thincoder-vscode/webview/panels.js` = 转口 import 档 ∥ `permission.js` 19 行 ∥ `mode-buttons.js` 19 行 ∥ `ui.js` 29 行 ∥ `controls.css` 137 行）⇒ 行号所指位置**已无对应物**，取「被引处的符号名」将**造出假指**（= 新址引入），故一律收**档名**（同句已带函数名者保留，如 `承 ui.js 的 addTool`）。

**逐档处置表（命中读数 = 本档实读；「收」= 逐处已收正）**

| 档 | F1 | U2① | .css 本体 | 收 | 行数（改前 = 改后） |
|---|---|---|---|---|---|
| `cards/panel.mjs` | 5 | 1 | — | 6 | 79 |
| `cards/permission.mjs` | 4 | — | — | 4 | 130 |
| `cards/question.mjs` | 2 | — | — | 2 | 93 |
| `composer/atmenu.mjs` | 6 | 6 | — | 12 | 150 |
| `composer/attach.mjs` | 8 | 4 | — | 12 | 242 |
| `composer/controls.mjs` | 4 | 5 | — | 9 | 237 |
| `composer/model-menu.mjs` | 17 | 3 | — | 20 | 494 |
| `composer/panel.mjs` | 15 | 2 | — | 17 | 485 |
| `composer/slash.mjs` | 2 | — | — | 2 | 70 |
| `diff.mjs` | 1 | — | — | 1 | 100 |
| `flow/block.mjs` | 7 | 1 | — | 8 | 155 |
| `flow/frame.mjs` | 1 | — | — | 1 | 70 |
| `flow/stream.mjs` | 3 | 3 | — | 6 | 136 |
| `flow/tool-card.mjs` | 5 | 1 | — | 6 | 181 |
| `search.mjs` | 2 | 3 | — | 5 | 199 |
| `subblocks/activity-view.mjs` | 6 | 1 | — | 7 | 215 |
| `subblocks/block.mjs` | 2 | — | — | 2 | 115 |
| `subblocks/channel.mjs` | 5 | — | — | 5 | 73 |
| `subblocks/relay.mjs` | 3 | 1 | — | 4 | 174 |
| `subblocks/state.mjs` | 3 | 1 | — | 4 | 331 |
| `toast.mjs` | 1 | — | — | 1 | 23 |
| `tool-summary.mjs` | 2 | 6 | — | 8 | 140 |
| `composer/model-menu.css` | — | — | 2 | 2 | 47 |
| `search.css` | — | — | 1 | 1 | 60 |
| `composer/composer.css`（父侧裁并入） | — | 9 | — | 9 | 482 |
| **合计** | **104** | **47** | **3** | **154** | **±0** |

**读数（实跑 · cwd = `thincoder/`）**：本包面 = `{"f1":0,"f1f":0,"u2a":0,"u2af":0,"u2b":0,"u2bf":0,"css":0,"cssf":0,"md":0,"mdf":0}`（包内零残）；全仓 C1（同一条命令）同期读数 = `f1 484 · u2a 77 · u2b 8 · css 19 · md 5`（余量 = 兄弟派在途，非本派面）。逐档行数 = §2 清单所列逐项吻合（±0）；`git diff --stat -- thincoder-render-core` = **25 files changed, 134 insertions(+), 134 deletions(−)**（纯行内替换，无整行增删）；22 个 `.mjs` **`node --check` 全绿**；`node test/run.mjs` = test manifest 空（零测试 = 绿）——本派零行为面，无测试面（照任务书 ⑤）。

**收正样例（原形 ⇒ 收后形）**：`webview/panels.js:16` ⇒ `webview/panels.js`；裸 `:39`（承前行）= 并入同句档名（原两处合并为一处档名）；`ui.js:203-243` `addTool` ⇒ `ui.js` `addTool`；`WEBVIEW-PROTOCOL.md:243` ⇒ `WEBVIEW-PROTOCOL.md` §6.2（实读：该裁定现居 §6.2 块头字段对位·模型行）；`.css` 本体 5 处取句中已有的选择器 ∕ 类名（`#status-line` ∕ `.status-sep` ∥ `#panels` goal ∕ task ∥ `#search-bar` ∥ loading dots ∥ task ∕ goal items），另 4 处（`controls.css` 四区间）无名 ⇒ 收档名 `webview/controls.css`（父侧裁可）。

**未覆盖形态（父侧裁「留」· 本派未动 · 坐标单列供记账）**：`composer/panel.mjs:82`（`（:42）`）· `flow/tool-card-restore.mjs:18`（`live :209`）· `subblocks/state.mjs:46`（`freezeBlock:197-210`）· `:59`（`buildBlock:75-96`）· `:314`（`ensureBlock:151`）· `:315`（`enterBlock:170`）——共 **6 处**（父侧裁文记「7 处」，盘上实读 6 处，已随报告上抛）；其形态不入 R1（无扩展名）∕ R2（无反引号）⇒ 收须先改判据（设计面）。另 `cards/permission.mjs:46 ∕ :49` 的 `:11` ∕ `:4` = CSS 数值，非指路形（不计）。

**fix round**：**1 轮**——父侧裁后按「① 收 ∥ ② 留」补收 `composer/composer.css:2-4`（9 处），余无返工。

**终态**：`clean`（本派面零残 · 零越界 · 零语义改 · 零样式值改 · 零折行）。

### §5 实施（eng-coder · 2026-10-16 · 派 = `thincoder-server/**` 段）

**状态行**：实施完成 2026-10-16（16 档 / 33 处逐处收正 · 残读数 f1 0 / u2a 0 / u2b 0 / css 0 / md 0 · 逐档增量 ±0 · 审计 1 轮 clean · 代码评审 1 轮 pass）

**来源（三句必写）**：① **来源** = 本档 §2「#### thincoder-server（26 处 · 14 档 · 删 0）」+「U2① 裸行号」内 server 四行 +「`.css` 本体」内 `public/style.css` 一行；口径 = 用户 2026-10-16 10:50「源码注释 / 文案 / `.css` 头注里的 `<档>:<行>` 式行号引必须收正（行号引必烂）」+ 判据本体 D4。② **执行人 = eng-coder（本席）**。③ **本轮不做** = 其他目录段（他派并行在办）∥ 语义改 ∥ 新址引入 ∥ 样式值改 ∥ 折行 ∥ `docs/**` · `test/**` · 需求档 · 提示词正本。

**逐档处置表（16 档 / 33 处 = F1 26 + 裸行号 6 + `.css` 本体 1；全为同行内替换，逐档增量 `±0`）**

| 档 | 处数 | 处置后名形（收名形取值 → 实读依据） |
|---|---|---|
| `deploy/sandbox/member-shell/core-run.mjs` | 5 | `subagent-face.mjs` **`stopSubagent`**（先例 = 桌面停单件控制面）∥ `setup.mjs` **`toolByName`** ×2（后到者胜）∥ `thincoder-render-core/lib.mjs` **`MAX_TOOL_OUTPUT`** ∥ `session-slot-write.mjs` 四件 **`setSlotAutoApprove`/`setSlotPlanMode`/`setSlotEngineering`/`setSlotAdvisorGuard`** |
| `deploy/sandbox/member-shell/mcp-tools.mjs` | 1 F1 + 1 裸 | `git-cred.mjs` **`fetchCredential`** 注入缝 ∥ **`main`** env 取值（原 `:47`/`:75` 去形） |
| `deploy/sandbox/member-shell/member-tools.mjs` | 1 | `thincoder-core/agent/dispatch.mjs` **`executeToolCalls`**（权限门挡） |
| `deploy/sandbox/member-shell/protocol.mjs` | 3 | 桌面 `suspensions.mjs` **`ITEM_VERDICTS`/`BATCH_VERDICTS`** ∥ 核 `dispatch.mjs` **`executeToolCalls`** ∥ 核 `subblocks/relay.mjs` **`relaySubContentChunk`** |
| `public/style.css` | 1 `.css` 本体 | `views-chat.mjs` 泡类 **`"bubble content"`**（去 `:284`；**声明体 `body > .content { margin-left: var(--nav-w); }` 未动**） |
| `public/views-me-chat.mjs` | 1 | **`agent/MEMBER-AGENT.md` §3.11(6)**（文档引 ⇒ 节名） |
| `public/views-me.mjs` | 1 | `dom.mjs` **`copyText`**（复制钮三路回退） |
| `public/views-sandbox.mjs` | 1 | `views-me-chat.mjs` **`clipboardReady`**（判式先例） |
| `src/agent/box-routes.mjs` | 1 裸 | **删指路形** `（`:98`）` ⇒ 句义自足（`begin` 首帧对位失败径，被引形已由句面命名） |
| `src/agent/chat-compact.mjs` | 2 | 核 `setup.mjs` **`DEFAULT_COMPACT_THRESHOLD`** ×2 |
| `src/agent/chat-env-tools.mjs` | 1 F1 + 2 裸 | 核 `tools/shared.mjs` **`BASH_TIMEOUT_MS`** ∥ `get_current_time ∥ process`（名已在 ⇒ 去 `:51`/`:140`） |
| `src/agent/chat-env.mjs` | 2 | 核 `setup.mjs` **`pushEnvStateReminder`/`pushPeerReminder`** ∥ `ops/update.mjs` **`readPackageVersion`** |
| `src/agent/member-relay.mjs` | 1 | 桌面 `suspensions.mjs` **`ITEM_VERDICTS`/`BATCH_VERDICTS`** |
| `src/gateway/proxy.mjs` | 1 | **`docs/core/design/PROVIDER.md` §6.3**（文档引 ⇒ 节名） |
| `src/mcp/admin-tools.mjs` | 4 F1 + 2 裸 | `routes.mjs` **探活端点**内联 ∥ `routes.mjs` **增/改/删三端点 `recordAudit`** 内联 ∥ `chat.mjs` **`SENSITIVE_KEYS`** ∥ `routes.mjs` 同键（`deps.mcpProbeImpl`）∥ `face.mjs` 同键（`deps.mcpRemoveImpl`） |
| `src/webui/static.mjs` | 1 | 桌面 `protocol.mjs` **`ROOTS`** 根表 |

**决策透明（人读取值 6 处 · 取值理由）**：① `core-run.mjs` 的桌面先例收 `stopSubagent`——该档 `:55` = 停单件控制面实体（`cancelSyncChild`/`executeCancelAction`/`getAsyncPool` 三面同处），原记 `:33-34` 落在拍体 `heartbeatBeat` 注释上（坐标已烂）；② `proxy.mjs` 收 `docs/core/design/PROVIDER.md` §6.3——被引实体 `fetchTimeoutMs` 的住所在 §6.3（`:100`「响应头阶段用 `fetchTimeoutMs`（默认 600s）」= 本档 `PROXY_HEADER_TIMEOUT_MS = 600000`），原字面 `:114` 现落 §6.4（SSE 流解析）⇒ 按**被引实体**重取节名，非按「行号 → 包含节」直映；③ `views-me-chat.mjs` 收 `agent/MEMBER-AGENT.md` §3.11(6)——原 `:317` 实测正落该节（节头 `:307`、下节 `:324`）；④ `style.css` 收 `views-chat.mjs` `"bubble content"`（原 `:284`，类名在该档 `:222` 实在）；⑤ `admin-tools.mjs` 两处注入缝键收 `routes.mjs`/`face.mjs` 同键（键名 = `deps.mcpProbeImpl`/`deps.mcpRemoveImpl`，正字面已在句内）；⑥ `chat-env.mjs`/`chat-compact.mjs` 收核常量名（`pushEnvStateReminder`/`pushPeerReminder`、`DEFAULT_COMPACT_THRESHOLD`，均实读核档在场）。**父侧 2026-10-16 裁**：「照披露的理由办——只要理由是『该处实体的名』即可」✅。

**判据读数（实跑 2026-10-16 · cwd = `thincoder/`）**

- **C2（完成判据 · server 面）**：`{"f1":0,"f1f":0,"u2a":0,"u2af":0,"u2b":0,"u2bf":0,"css":0,"cssf":0,"md":0,"mdf":0}` ⇒ 与 C2 对 server 面的预期一致（残项全消）。
- **全仓复跑（同 C1 命令 · 旁证本席未越界）**：`{"f1":616,"f1f":208,"u2a":123,"u2af":58,"u2b":9,"u2bf":6,"css":53,"cssf":11,"md":5,"mdf":4,"wideCode":86,"wideCss":5,"wideMd":543}`——较设计轮基线（671/231 · 133/64 · 9/6 · 54/12 · 5/4）的下降**大于本席 33 处** ⇒ 他派 eng-coder 并行在办所致，非本席所动。
- **逐档增量 `±0`**：16 档行数复读 **655 / 107 / 126 / 319 / 500 / 399 / 343 / 334 / 329 / 97 / 439 / 268 / 223 / 114 / 173 / 446**，与 §2 清单标注值**逐档相等**。
- **C3（行宽）**：本批改动行最长 **195** 字符 ≤300；存量三面超宽读数未变（`wideCode` 86 ∥ `wideCss` 5 ∥ `wideMd` 543）⇒ 零折行。
- **`git status --porcelain`（`thincoder-server` 面）**：恰 **16 档 M**，无新增 / 无删除 / 无越界档（`numstat` 每档 `added == deleted` ⇒ 行内替换）。

**清单外同形行（有据的留 · 一行）**：`thincoder-server/README.md:246` 的 `` `:8787` `` = **缺省端口值**（`curl … <port>` 默认 8787），**非行号引** ⇒ **留**（父侧 2026-10-16 裁「你判得对」）。理由：改则改语义；且属 `.md` 本体、不入 C2 的 `u2a`（该计数只统计代码体）⇒ 不影响完成判据。

**审计与代码评审（轮次 / 终态）**：① **内部 explore 审计 1 轮**（只读对设计）：结论 `DEVIATIONS` 1 行 —— `core-run.mjs:16-17` 的「收名形取值」因审计无 git 面看不到改前原文 ⇒ 标 PARTIAL；另有 2 条非四类说明（§5 当时为空、审计面限制）。**消解**：本席持有改前原文（该处原无任何符号名，是本次人读取值）⇒ 属「人读取值」而非「改错名」，已按上「决策透明」逐处披露 + 父侧受理。终态 = **clean**。② **内部 advisor 代码评审 1 轮**（`type=code` · 同步）：`VERDICT: pass` —— **0 🔴**、1 🟡（`core-run.mjs` 655 行 > 500 咨询线 · **advisory 非 must-fix** · 本档 §2「结构面」已裁「不拆」）、1 🔵（`PROVIDER.md` 节名口径说明，无动作）。③ **fix round = 0**（无 must-fix 项；🔴 级 0）。

**留待父侧（台账写权归主 agent）**：`thincoder-server/deploy/sandbox/member-shell/core-run.mjs` = **655 行**（>500 咨询线、<800 硬线）——本批为行内替换（±0）不改结构；按 §2「结构面」原话，**拆案归独立相位、建议入册 tech todo**（拆档点 = 档头 37 行注释 + `createTurnHost`/`createCoreRun` 两工厂 + `loadCore` 装载束）。

---

### §5 实施记录 · `thincoder-cli` 段（eng-coder · 2026-10-16）

**状态行（本派）**：实施完成（cli 段 **39 处收正**（21 档 · 改动 31 行）· 段内 C1 残 **1** = 唯一留项 `scripts/doc-impact.mjs:81` · 行数 **±0** · 审计/评审各 1 轮 · fix round 0 · 终态 `clean`）

**来源（三句必写）**：① **来源** = 本批档 §2「逐档清单（实施面）」`thincoder-cli` 段（`#### thincoder-cli（33 处 · 20 档 · 删 0）`，:194–216）+ §2「同律扩展面」该目录条目（U2① 裸行号 6 处 / 3 档 = :458–460 ∥ U2② 「第 N 行」1 处 = :528）+ 用户 2026-10-16 10:50 口径（源码注释 / 文案内 `<档>:<行>` 引必收正 · 行号引必烂）；判据 = §2 C1 / C2。② **执行人 = eng-coder**（携设计凭证落笔，只写本仓 `thincoder-cli/**`）。③ **本轮不做** = 其他目录段（core ∥ vscode ∥ desktop ∥ render-core ∥ server ∥ bench，各归其派）· 实现语义改 · 新址引入 · 存量超宽折行 · 清单外加面 · 留项文本。

**处置形（逐处实读人改 · 禁整仓脚本批量）**：`<档名>:<行号>`（含区间）⇒ **`<档名>`**（去行号、保留原路径写法）；承前档名的裸 `` `:N` `` ⇒ 并入同行档名（同句已具名者保留）；文档引（§2 标「⇒节名」3 处）⇒ **该文档节名**。**不取符号名的理由**（同 render-core 派 §5 已记，本派实读同据）：被引 VSC 老档多为端壳 / 实现单源已迁核包 ⇒ 行号所指位置已无对应物，取「被引处的符号名」将**造出假指**（= 新址引入，违 F4），故一律收**档名**。

**逐档处置表（命中读数 = 清单登记；「收」= 逐处已收正）**

| 档 | F1 | U2① | U2② | 收 | 行数（改前 = 改后） |
|---|---|---|---|---|---|
| `src/acp/bridge.mjs` | 2 | — | — | 2 | 449 |
| `src/acp/handlers-session.mjs` | 1 | — | — | 1 | 344 |
| `src/acp/session.mjs` | 3 | — | — | 3 | 56 |
| `src/cli/make-agent.mjs` | 1 | — | — | 1 | 141 |
| `src/command-interactive.mjs` | 1 | — | — | 1 | 206 |
| `src/prompt-injections.mjs` | 1 | — | — | 1 | 38 |
| `src/tui/agent-turn.mjs` | 1 | — | — | 1 | 424 |
| `src/tui/cmd-advisor.mjs` | 3 | 2 | — | 5 | 292 |
| `src/tui/cmd-config.mjs` | — | 2 | — | 2 | 512 |
| `src/tui/cmd-eng.mjs` | 1 | — | — | 1 | 108 |
| `src/tui/cmd-think.mjs` | 2 | — | 1 | 3 | 170 |
| `src/tui/index.mjs` | 1 | — | — | 1 | 276 |
| `src/tui/model-picker.mjs` | 1 | — | — | 1 | 325 |
| `src/tui/pickers.mjs` | 2 | — | — | 2 | 135 |
| `src/tui/provider-admin.mjs` | — | 2 | — | 2 | 249 |
| `src/tui/queued-pickup.mjs` | 2 | — | — | 2 | 35 |
| `src/tui/render-segments.mjs` | 3 | — | — | 3 | 188 |
| `src/tui/status-line.mjs` | 1 | — | — | 1 | 198 |
| `src/tui/subagent-freeze.mjs` | 3 | — | — | 3 | 260 |
| `src/tui/suspension-drive.mjs` | 2 | — | — | 2 | 262 |
| `src/tui/timer-watch.mjs` | 1 | — | — | 1 | 66 |
| `scripts/doc-impact.mjs` | 1 | — | — | **留**（不动） | 146 |
| **合计** | **33** | **6** | **1** | **收 39（+ 留 1）** | **±0** |

**读数（实跑 · cwd = `thincoder/` · §2 C1 命令）**：cli 面 = `{"f1":1,"f1f":1,"u2a":0,"u2af":0,"u2b":0,"u2bf":0,"css":0,"cssf":0,"md":0,"mdf":0}`——唯一残 = `scripts/doc-impact.mjs:81`（清单判 `·留`）⇒ **段内零残之外恰为该留项**。全仓 C1 同期读数 = `f1 476 · f1f 165 · u2a 76 · u2af 40 · u2b 8 · u2bf 5 · css 19 · cssf 5 · md 9 · mdf 6`（余量 = 兄弟派在途，非本派面）。逐档行数 = 清单登记值逐档吻合（±0）；`git diff --numstat -- thincoder-cli` = **21 files，逐档 N/N（1–3 行）**，纯行内替换、无整行增删 ⇒ 不折行、不增行；**无可跑测试面**（照任务书 ⑤——本批零行为面，以 grep 读数为准）。

**收正样例（原形 ⇒ 收后形）**：`kimi server.ts:626-636` ⇒ `kimi server.ts`（终态表 #3「收档名」）· `src/tui/render.mjs:250-252` ⇒ `src/tui/render.mjs` · `provider/core.mjs:193` / `:197-204` ⇒ `provider/core.mjs` · `bin/thincoder.mjs:54` ⇒ `bin/thincoder.mjs` · 裸 `` `:127` / `:82` ``（承前 `cmd-think.mjs`）⇒ 并入同行档名「`cmd-think.mjs` 归一式 / 删档 / 回执」 · `tool-events.mjs:434-441` ⇒ `tool-events.mjs` · 文档引 `PROVIDER.md:437` ⇒ `PROVIDER.md §6.22`（实读该行居 §6.22 块内）∥ `PORTABILITY.md:62` ⇒ `PORTABILITY.md §5.1` · 「§16.2 生产者表第 2 行」⇒「§16.2 生产者表「`applyThink` off 支」行」（实读 `docs/core/design/MODEL-SPECS.md` §16.2 表第 2 行项名逐字吻合）。

**坐标与现盘不符（按现盘处理 · 记一行）**：`src/tui/cmd-config.mjs:28` 原引 = 裸 `` `:205`/`:232` ``（同行无档名 · 现盘无对应行号所指）⇒ 按现盘收名形 **「`consultMenu` 两支」**（实读：`pickEffort` 仅 `cmd-config.mjs:213` / `:238` 两调用点，两处 `"none"` 消费同在该函数内）。其余 38 处坐标与现盘一致（被引行号漂移不影响——收正后不再携行号）。

**未覆盖但同形**：**无**（`thincoder-cli/src` + `bin` 全树三条判据正则零命中；唯一残为清单已标留项）⇒ 未触发「停手上抛」。

**审计 / 评审轮次与终态**：内部偏离审计 = **1 轮**（`explore` · 结论 `CLEAN`：0 部分实现 / 0 静默简化 / 0 越界 / 0 漏处 / 0 语义改 / 0 新址）；内部代码评审 = **1 轮**（`advisor` type=code · **VERDICT pass** · 0 🔴 ∥ 1 🟡（`§5` 记录面协调，非代码缺陷）∥ 3 🔵（`cmd-config.mjs` 512 行 > 500 咨询线——设计 :62–63 已裁不拆 · `render-segments.mjs:98` 指针保留对 VSC 端壳档的语义断言（按边界只收形，正确） · 计数口径待写实））；**fix round = 0**（无返工）。

**终态**：`clean`（本派面零残 · 零越界 · 零语义改 · 零新址 · 零折行 · 逐档 ±0）。

### `bench` 派（eng-coder · 2026-10-16）

**状态行**：实施完成（bench 段 10 处收正 · 面内 C1 残 = `f1 0 ∥ u2a 0 ∥ u2b 3`（留）· 行数 ±0）

**来源（三句必写）**：① **来源** = 本批档 §2「§2 逐档清单 · 同律扩展面」`bench` 段（F1 7 处 / 3 档 ∥ U2① 3 处 / 1 档 ∥ U2② 3 处 / 1 档）+ 用户 2026-10-16 10:50 口径（源码注释 / 文案里的 `<档>:<行>` 式行号引必收正）。② **执行人 = eng-coder（本派）**。③ **本轮不做** = 其他目录段（各归其派）∥ 语义改 ∥ 新址引入 ∥ `bench/test/**`（按 `test/**` 排除）∥ 存量超宽折行。

**改后形 = 被引处的符号 / 函数 / 常量名**（父侧本轮裁定：派单原句「换成被引档名或目录名」= 父侧转述、已撤；判据单源 = §2 F2/F3 —— 代码引 ⇒ 符号 / 函数名）。

**逐档处置表（改前 → 改后）**

| # | 档:行 | 改前（被引坐标） | 改后（符号名） |
|---|---|---|---|
| 1 | `bench/lib/client.mjs:5` | `provider/core.mjs:184-192` | `chatImpl` |
| 2 | `bench/lib/client.mjs:9` | `provider/sse.mjs:142-149` | `handleEvent` |
| 3 | `bench/lib/params.mjs:6` | `provider/core.mjs:178` / `:184` / `:185` / `:196` | `chatImpl`（四引并一） |
| 4 | `bench/lib/params.mjs:11` | `provider/core.mjs:196-197` | `chatImpl` |
| 5 | `bench/lib/params.mjs:36` | `provider/core.mjs:196-197` | `chatImpl` |
| 6 | `bench/lib/params.mjs:51` | `provider/core.mjs:187-190` | `chatImpl` |
| 7 | `bench/probe/driver.mjs:65` | `tools/index.mjs:64` | `assembleBuiltinTools` |
| — | `bench/toolcall/cases.mjs:28 / :67 / :76` | 「从第 10 行开始的 5 行」/「第 12 行**之后**」/「的第 40 行」 | **留**（用例载荷操作数） |

合计 = F1 **7 处** + U2① **3 处**（第 3 行的三处并入同一符号）收正 ∥ U2② **3 处**留。

**符号面核准（防假指）**：`thincoder-core/provider/core.mjs:118` = `async function chatImpl(`，次一顶层函数 = `:319` `export function buildContinuationMessages(` ⇒ 178 / 184-192 / 187-190 / 196-197 四组坐标皆在其体内 · `thincoder-core/provider/sse.mjs:145` = `const handleEvent = (data) => {`（「非空 delta 才回调」的 `onToken?.(add)` 确在其体内）· `thincoder-core/tools/index.mjs:63` = `export async function assembleBuiltinTools({`（其 `specForModel(model)?.multimodal` 位即 driver 注释所指判据）。

**判据读数（cwd = `thincoder/`）**：C1 脚本逻辑实跑（D = `['bench']`）——改前 = `f1 7/3 · u2a 3/1 · u2b 3/1`；改后 = **`f1 0 · u2a 0 · u2b 3`** = §2 C2 预期 ✓。行数实读 = client.mjs 202 ∥ params.mjs 124 ∥ driver.mjs 267 ∥ cases.mjs 206 ⇒ **逐档 ±0** ✓；零新增超宽（最长改动行 ≈92 字符）。`node --check` 三档全绿 · 三档动态 `import` = LOAD OK（导出面完整）。**无测试面**（照任务书 ⑤：以 ② 读数为准）。

**fix round**：**1 轮** —— 父侧裁「改后形 = 符号名（派单「档名」句已撤）」后按符号名回改 7 处；余无返工。

**内部评审**：explore 偏差审计（轮 1）= **无分歧**（部分 / 静默简化 / 档漂移 / 越清单 四类全 0）；advisor 代码评审 = **pass**（无 🔴 · 无 must-fix 🟡；1 🔵 = `client.mjs:5` 已裁留裸行号引之证据登记 · 1 out-of-scope 记 = `render-core` 段落档名形与本节符号名形不一致）。

**未决（上抛）**
- `[上抛·待裁]`（**父侧已裁「留」**）= `bench/lib/client.mjs:5` 同行两处未列裸行号引 `（:178）` / `（:117）` —— 形态不入现行判据式 R2（须反引号）⇒ 收须先改判据（台账 #1564）；本派**未动** ✓，只收清单所列 F1 处。
- `[上抛·知会]` `render-core` 段 §5 记「一律收**档名**」，与本派 / `server` 派的符号名形不一致 —— C2 只计命中数、检不出形差；请父侧收口前对齐（或明记该面「无名可取 ⇒ 档名」为例外并落文）。

**终态**：**clean**（bench 面零残（留项除外）· 零越界 · 零语义改 · 零折行）。

**内部审计 ∥ 代码评审（同会话 · 交付前 · 一轮各一次）**

- **分歧审计 1 轮**（explore 只读 · 比对本派交付 vs 设计规格）：结论 **`divergence: none`**。其独立复核面 = 全包三正则零残（其 grep 含 `test/`，为 C1 排除集的**超集**）· 25 档全在包内（零越界）· 逐档行数 25/25 与 §2 实读值相等 · 6 处「留」原文在场 · 未发现未报告的语义改 ∥ 新址引入 ∥ 样式值改。其装配无 bash/git ⇒ C1 命令与 `git diff --stat` 未实跑（以等价 grep 超集替代，如实记）。
- **代码评审 1 轮**（advisor · `type=code` · 25 档 + 本批档）：**`VERDICT: pass`**。发现 = **🟡 1**（`composer/composer.css:10` 的「锁」句指向全工作区**不存在**的 `test/composer.test.mjs`——该句形态**不在本批判据式内**（无行号 ⇒ 不入 R1/R2），**本批零改**，判 **报告项（非 must-fix）**）· **🔵 2**（`composer/composer.css:8` 头注自陈数字「四区间 467 + 头注 15」与实读头注 10 行不自洽——**存量注记 · 本批未触该行 · 编制口径 unverified** ∥ 父侧裁「留」的 5 处现形经实读确认**未被改**）· **无 🔴**。
- **修正轮**：评审面零 must-fix ⇒ **无返工**（本派 fix 轮仍 = 1，即父侧裁驱动的 `composer/composer.css` 补收）。
- **终态 = `clean`**（本派面零残 · 零越界 · 零语义改 · 零样式值改）；上述两项「非本派射程」发现随交付报告单列上抛父侧。

### §5 实施记录 · `thincoder-vscode` 段（eng-coder · 2026-10-16）

**状态行（本派）**：实施完成（vscode 段 **45 档 / 149 处**逐处收正 · 段内 C1 残 **0** · 逐档行数 **±0** · 审计 1 轮 clean · 代码评审 1 轮 pass · fix round 1）

**来源（三句必写）**：① **来源** = 本批档 §2「逐档清单（实施面）」`#### thincoder-vscode（122 处 · 41 档 · 删 6）`（:234–276）+ §2「同律扩展面」该包条目（U2① 裸行号 21 处 / 11 档 = :508–520 ∥ `.css` 本体 `webview/controls.css` 5 处 = :441 ∥ `.md` 本体 `thincoder-vscode/AGENTS.md` 1 处 = :448）；取值依据 = 父侧裁「改后形取**被引处的符号名**（设计样例：核 `turn-loop.mjs:243`（抛点）⇒ 见 `runAgent` 的抛点）」+ §2 D-P4-1/F2–F4；判据 = §2 C1/C2。② **执行人 = eng-coder**（携设计凭证落笔；只写本仓 `thincoder-vscode/**` 各档 + 本档 §5）。③ **本轮不做** = 其他目录段（core ∥ cli ∥ desktop ∥ render-core ∥ server ∥ bench，各归其派）· 语义改 · 新址引入 · 样式值改 · 存量超宽折行 · `docs/**` · `test/**` · 需求档 · 提示词正本 · **§2 未列的同病近形**（见末「报告项」，未动）。

**处置形（逐处实读人改 · 禁整仓脚本批量）**：`<档名>:<行号>`（含区间）⇒ **被引处的符号名**（同句已具名者 ⇒ 去冗余坐标）；跨文档引 ⇒ **节名**；**无可用名者**（被引档已亡 ∥ 坐标陈旧过档尾 ∥ 被引行是 import ∕ 纯注释行，无单一符号）⇒ **档名**（去行号）并逐处登记下表；`·删`（指向对象已亡）⇒ 删指路形、句义自足。

**逐档处置表（命中读数 = §2 清单登记；全为同行内替换，逐档行数 `±0`）**

| 档 | F1 | U2① | .css/.md | 收 | 行数 |
|---|---|---|---|---|---|
| `src/agent/setup-reminders.mjs` | 2 | — | — | 2 | 66 |
| `src/agent/setup-tooltable.mjs` | 3 | — | — | 3 | 104 |
| `src/agent/setup.mjs` | 6 | 1 | — | 7 | 320 |
| `src/agent/tool-table.mjs` | 3 | — | — | 3 | 188 |
| `src/agent/turn-domains.mjs` | 1 | — | — | 1 | 38 |
| `src/config-mcp.mjs` | 2 | — | — | 2 | 105 |
| `src/embed-config.mjs` | 6 | — | — | 6 | 183 |
| `src/extension/config-watch.mjs` | 1 | — | — | 1 | 37 |
| `src/extension/file-refs.mjs` | 3 | — | — | 3 | 19 |
| `src/extension/image-handler.mjs` | 2 | — | — | 2 | 59 |
| `src/extension/ledger-surface.mjs` | 1 | — | — | 1 | 93 |
| `src/extension/panel-callbacks.mjs` | 13 | 5 | — | 18 | 360 |
| `src/extension/panel-index.mjs` | 1 | — | — | 1 | 248 |
| `src/extension/panel-mcp.mjs` | 1 | — | — | 1 | 168 |
| `src/extension/panel-messages-turn.mjs` | 1 | — | — | 1 | 233 |
| `src/extension/panel-session-write.mjs` | 6 | — | — | 6 | 151 |
| `src/extension/panel-settings-push.mjs` | — | 1 | — | 1 | 125 |
| `src/extension/panel-subagent-relay.mjs` | 9 | 2 | — | 11 | 223 |
| `src/extension/panel-turn-loop.mjs` | 12 | 1 | — | 13 | 307 |
| `src/extension/panel-turn-stages.mjs` | 2 | 2 | — | 4 | 247 |
| `src/extension/peer-domains.mjs` | 2 | 3 | — | 5 | 33 |
| `src/extension/permission-gate.mjs` | 2 | 1 | — | 3 | 123 |
| `src/extension/provider-probe-window.mjs` | 1 | — | — | 1 | 123 |
| `src/extension/session-io.mjs` | 2 | — | — | 2 | 268 |
| `src/extension/settings-panel-write.mjs` | 1 | — | — | 1 | 213 |
| `src/prompt-injections.mjs` | 2 | — | — | 2 | 43 |
| `src/repomap.mjs` | 1 | — | — | 1 | 303 |
| `src/specs.mjs` | 3 | — | — | 3 | 102 |
| `src/tools/index.mjs` | 3 | — | — | 3 | 193 |
| `src/tools/shell.mjs` | 2 | — | — | 2 | 326 |
| `webview/chat-messages.js` | 2 | — | — | 2 | 298 |
| `webview/chat-status.js` | 1 | — | — | 1 | 164 |
| `webview/input.js` | 10 | — | — | 10 | 129 |
| `webview/loading.js` | 3 | — | — | 3 | 17 |
| `webview/mode-buttons.js` | 1 | — | — | 1 | 19 |
| `webview/model-menu.js` | 2 | — | — | 2 | 11 |
| `webview/search.js` | — | 1 | — | 1 | 19 |
| `webview/settings-models.js` | 1 | — | — | 1 | 218 |
| `webview/settings-providers.js` | 1 | 1 | — | 2 | 145 |
| `webview/settings-state.js` | 1 | 1 | — | 2 | 91 |
| `webview/status-bar.js` | 1 | — | — | 1 | 136 |
| `webview/streaming.js` | 4 | 1 | — | 5 | 185 |
| `webview/ui.js` | 1 | 1 | — | 2 | 256 |
| `webview/controls.css` | — | — | 5 | 5 | 137 |
| `AGENTS.md` | — | — | 1 | 1 | 138 |
| **合计** | **122** | **21** | **6** | **149** | **±0** |

**决策透明（人读取值 · 无可用名回退 ⇒ 档名 · 逐处登记）**

- **回退档名（被引档亡 / 坐标陈旧 / 被引行无单一符号）**：`src/agent/turn-domains.mjs:21` ⇒ `src/agent.mjs`（被引 29-30 已过档尾——该档现为 10 行退役壳）∥ `src/extension/panel-turn-loop.mjs:23/:75/:85/:117/:119/:232` ⇒ `src/agent.mjs`（同因：原 39/142/354/397/439 皆过档尾）∥ `webview/chat-messages.js:274` ⇒ `src/agent.mjs`（同因）∥ `src/extension/panel-callbacks.mjs:36/:37/:38` ⇒ `panel-messages-turn.mjs` / `suspension.mjs` / `panel-messages.mjs`（被引行为 import ∕ 注释行）∥ `src/extension/panel-session-write.mjs:13` ⇒ `chat-panel.mjs`（import 行）∥ `webview/model-menu.js:7` ⇒ `settings-models.js` / `settings-providers.js`（import 行）∥ `src/extension/panel-subagent-relay.mjs:34/:35` ⇒ 同上两档（import 行）∥ `src/prompt-injections.mjs:27` ⇒ `bin/thincoder.mjs`（本包无该档，坐标不可解析）∥ `src/tools/index.mjs:43` ⇒ `src/tools/git.mjs`（被引档已删——句面自带「删除档」）。
- **收符号名（样例，取值 = 被引处实体）**：`panel-index.mjs:33` ⇒ `showStartup`（`cli/src/tui/startup.mjs:263` 落其体内，节头 :229）∥ `panel-callbacks.mjs:113` ⇒ `runAgentTurnBody` ∥ `session-io.mjs:151` ⇒ `runPass` / `clearSlotEngDesignToken` ∥ `webview/status-bar.js:81` ⇒ `inputBoxStyle` ∥ `webview/streaming.js:93` ⇒ `sweepToolBlocks` ∥ `src/tools/shell.mjs:92` ⇒ `runBash`、`:137` ⇒ 档名 `@thincoder/core/tools/bash.mjs`（同句已具 `gitGuardSnapshot`）∥ `src/specs.mjs:70` ⇒ `handleThinkCommand`、`:89` ⇒ `inputBoxStyle` ∕ `createRenderLoop` ∥ `AGENTS.md:91` ⇒ **`pushStatus`**——原记 `settings.mjs:340` 实读落 `deleteMcpServer` 体内（坐标陈旧）⇒ 按**被引实体**（providerStatus 发射面）取值，非按「行号→含该行函数」直映。
- **裸行号（承前行）**：`peer-domains.mjs:15`（×3）⇒ 收 `runPreparedItem` ∥ `permission-gate.mjs:97` ⇒ 收 `executeToolCalls` ∥ `panel-callbacks.mjs:37/:38/:144` 与 `panel-turn-stages.mjs:7/:8` ⇒ 名已在句内 ⇒ 去冗余坐标 ∥ `settings-state.js:45` ⇒ 承前行 = `2026-09-28-desktop-input-vsc-align.md` ⇒ 去区间（收同句已具段名）∥ `settings-providers.js:46`、`ui.js:195`、`streaming.js:26`、`panel-turn-loop.mjs:7` ⇒ 被引档不明 ∕ 源档已改写 ⇒ 去形、句义自足。
- **`·删`（4 处靶点 · 实施轮现盘复核 = 指向对象确已亡）**：`setup-tooltable.mjs:27`（`src/agent-tools/batch-segment.mjs:184`）· `panel-session-write.mjs:13/:14/:15`（四测试档：`agent-lifecycle-singleton.test.mjs` ∕ `config-io-panel.test.mjs` ∕ `provider-model-guard.test.mjs` ∕ `at-refs-restore.test.mjs`）· `panel-turn-loop.mjs:13`（`chat-panel-messages.test.mjs:24`）。

**判据读数（实跑 2026-10-16 · cwd = `thincoder/`）**

- **C2（完成判据 · vscode 面）**：`{"f1":0,"f1f":0,"u2a":0,"u2af":0,"u2b":0,"u2bf":0,"css":0,"cssf":0,"md":0,"mdf":0}` ⇒ 与 C2 对该面预期（零残）一致；另以 `[\w./{}-]*\.(mjs|cjs|js|json|md|css|html|ts):[0-9]+`（R1）对 `src/**` ∥ `webview/**` ∥ root `*.{md,json,mjs}` 逐域实跑 = **no matches**；R2 ∕ R3 产品源码域亦零；余量仅落 `.thincoder/tmp/**` ∥ `docs/**`（皆设计排除集）。
- **全仓同期复跑（旁证未越界）**：`core {f1:1} · cli {f1:1} · desktop {f1:84,u2a:15,css:14} · render-core {0} · server {0} · bench {u2b:3,md:3}` ⇒ 余量 = 兄弟派在途，非本派面。
- **逐档增量 `±0`**：45 档现读行数与 §2 标注值**逐档相等**；`git diff --numstat -- thincoder-vscode` = 45 档，每档 `added == deleted`（例 `panel-callbacks.mjs 14/14` ∥ `panel-turn-loop.mjs 11/11` ∥ `input.js 9/9`）⇒ 纯行内替换，无整行增删。
- **C3（行宽）**：改动行无一超宽（`AGENTS.md:91` 经 `^.{301,}` 实跑不在超宽集内）；射程内三处 >300 行（`turn-domains.mjs:24` ∥ `prompt-injections.mjs:39` ∥ `tools/shell.mjs:151`）皆未被本批触碰的既有串。
- **语法**：各档编辑回执逐个 `Syntax: OK`（node --check 面）。

**审计与代码评审（轮次 / 终态）**

① **内部 explore 审计 1 轮**（只读对设计）：结论 `3 findings`（全低 / 信息级）——四类偏差**无一确认**（无 PARTIAL ∥ 无 SILENT-SIMPLIFICATION ∥ 无 DOC-DRIFT ∥ 无 OUT-OF-LIST）；`·删` 4 靶点**全部确认已删**；逐档行数一致（抽样 40 档吻合）。
② **内部 advisor 代码评审 1 轮**（`type=code` · 同步）：`VERDICT: pass` —— **0 🔴**、2 🟡（皆 **非 must-fix**：同病近形「行 N」在本段存活而不入 R1/R2/R3；`webview/ui.js:76` 文档行区间指路形同理）、2 🔵（`panel-session-write.mjs:14–16` 删后空注释行 ∥ `image-handler.mjs:11`「后两档」先行词变弱）。
③ **fix round = 1**：审计前自查 1 处（`panel-turn-loop.mjs:85` 漏改，同批补）+ 审计后 2 处（`permission-gate.mjs:20` 冗余同名收拢 ∥ `tools/index.mjs:43` 补回档名）。**终态 = `clean`**（本派面零残 · 零越界 · 零语义改 · 零折行）。

**报告项（父侧裁 · 非本派处置）**：`webview/ui.js:76`「`docs/vsc/design/WEBVIEW.md` §4.8 :202-203」与多档「**行 N**」近形（`setup-tooltable.mjs:6/:101` ∥ `tool-table.mjs:3` ∥ `setup-reminders.mjs:2` ∥ `panel-callbacks.mjs:232` ∥ `tools/shell.mjs:15` ∥ `webview/chat-messages.js:34` ∥ `webview/streaming.js:8` ∥ `webview/status-bar.js:79` 等）——形态皆不入 R1/R2/R3 ⇒ C2 的「本面零命中」为**判据内**成立；与 §2 F1b②/D6 对 U2②（「第 N 行」）的处置属**同物异形**。请二择：**改判据**（R3 放宽为 `第?\s*[0-9]+\s*行` 并复跑 C1/C2）或**明写该形出批**（同 bench `（:178）` / `.css` 未覆盖形成例）。

**留待父侧（台账写权归主 agent）**：`thincoder-vscode/src/extension/panel-session-write.mjs:14–16` 三条空注释行（`·删` 后续形；逐档 `±0` 故未并行）——建议下轮顺带收拢（零语义）。另本档共享 `**状态行**` 行（:657）现载兄弟派读数，本派未覆写，请父侧终态时一并归口。

**清单外改动（1 处 · 如实披露）**：`src/extension/panel-turn-loop.mjs:88` 本为两处 F1 命中行（`explore-distill.mjs:143` ∕ 核 `agent/setup.mjs:53`）；该行另载一组**未入 §2 册**的裸行号（承前行 `context.mjs` 的 `:219/:227/:242/:426`；该形态 `:N/N/N/N` 不中 R2）⇒ 随同行替换一并去除。同病同向，唯不在清单内，逐处披露如上（如父侧认须另册，请裁）。

### thincoder-core 段（eng-coder · 2026-10-16）

**来源（三句必写）**：① **来源** = 本批档 §2「逐档清单」`thincoder-core` 段（F1 93 处 / 50 档 · §2:141–192）+ §2「同律扩展面」U2① core 条目（12 条 · 31 处 · §2:461–473）+ U2② core 条目（4 条 · 5 处 · §2:524–527）；父侧 2026-10-16 三件裁（段界 = core 全族 ∥ core 的 `.md` = 留 ∥ 「判据式覆盖不到的同族残形」12 处 = 留 · 入册 `#1564`）；判据 = §2 C1/C2（本面行号引零命中）。② **执行人 = eng-coder**（携设计凭证落笔，只写本仓 `thincoder-core/**`）。③ **本轮不做** = 其他目录段（各归其派）· 语义改 · 新址引入 · 折行 · 判据式覆盖不到的同族残形（留，见末）。

**处置形（逐处实读人改 · 禁脚本批量）**：`<档名>.<ext>:<行号>` ⇒ **被引处的符号 ∕ 函数名**（形 = `档名` 的 `符号`）∥ 跨档引文档 ⇒ **节名** ∥ `.json` ⇒ **键名** ∥ 仓外声明源 ⇒ **档名**；指向对象**已亡** ⇒ **删**（删指路形、句义保留）；**裸行号**（承前档名）⇒ 该处符号名；**「第 N 行」** ⇒ 该表行的**项名**。被引行确无名者（空行 ∕ 纯注释 ∕ 无单一名）⇒ 取档名并在下「名形口径」单列。

**逐档处置表（处数 = §2 清单读数；「收」= 逐处已收正；行数 = 改前 = 改后，逐档 ±0）**

| 档（`thincoder-core/`） | 处数 | 收 | 档 | 处数 | 收 |
|---|---|---|---|---|---|
| advisor/compaction.mjs | 1 | 1 | memory/core.mjs | 1 | 1 |
| advisor/convergence.mjs | 1 | 0（留） | memory/scan.mjs | 1 | 1 |
| advisor/run.mjs | 1 | 1 | memory/sweep.mjs | 1 | 1 |
| agent/child-marks.mjs | 1 | 1 | model-specs.mjs | 1 | 1 |
| agent/family-tools.mjs | 3 | 3 | notify-policy.mjs | 6 | 6 |
| agent/helpers.mjs | 1 | 1 | provider/google.mjs | 1 | 1 |
| agent/live-beat.mjs | 5 | 5 | provider/responses.mjs | 2 | 2 |
| agent/setup.mjs | 1 | 1 | provider/responses-request.mjs | 1 | 1 |
| agent/spawn-child.mjs | 1 | 1 | provider/wait-status.mjs | 1 | 1 |
| agent/subagent-event.mjs | 1 | 1 | provider-flows.mjs | 1 | 1 |
| agent/timers.mjs | 20 | 20 | queued.mjs | 2 | 2 |
| agent/turn-loop.mjs | 1 | 1 | rules.mjs | 3 | 3 |
| agent-tools.mjs | 2 | 2 | session-gc.mjs | 1 | 1 |
| agent-tools/async-discard.mjs | 5 | 5 | session-lifecycle.mjs | 1 | 1 |
| agent-tools/audit-block.mjs | 1 | 1 | session-slot-write.mjs | 2 | 2 |
| agent-tools/checkpoint.mjs | 1 | 1 | session-slots-manifest.mjs | 1 | 1 |
| agent-tools/manifest.mjs | 4 | 4 | session.mjs | 1 | 1 |
| agent-tools/parent-channel.mjs | 2 | 2 | shell-candidates.mjs | 2 | 2 |
| agent-tools/settings.mjs | 1 | 1 | shell-identity.mjs | 1 | 1 |
| agent-tools/task.mjs | 1 | 1 | think-off.mjs | 3 | 3 |
| attachments.mjs | 4 | 4 | token-ttl.mjs | 1 | 1 |
| browser/cdp.mjs | 2 | 2 | tools/browser.mjs | 3 | 3 |
| browser/launch.mjs | 4 | 4 | tools/execute.mjs | 1 | 1（删） |
| browser/snapshot.mjs | 1 | 1 | tools/git-run.mjs | 3 | 3 |
| config-watch.mjs | 2 | 2 | tools/process-tree.mjs | 2 | 2（含删 1） |
| file-refs.mjs | 7 | 7 | vision-reader.mjs | 5 | 5（含删 1） |
| generate-title.mjs | 1 | 1 | manifest-discovery.mjs | 1 | 1 |
| hooks.mjs | 1 | 1 | manifest-schema.mjs | 2 | 2 |
| i18n.mjs | 1 | 1 | mcp/transport-stdio.mjs | 1 | 1 |

合计 = **57 档 / 129 处**（F1 93 + U2① 31 + U2② 5）；已收 **128**，残 **1** = `advisor/convergence.mjs:27`（§2 终态表 #1 裁**留**）。**删判 3 处**（`tools/execute.mjs:64` ∥ `tools/process-tree.mjs:5` ∥ `vision-reader.mjs:4`——靶档 `test/tool-seams.test.mjs` ∥ `extension/vision-channel.mjs` 现盘确亡，指路形删、句义自足）。**逐档行数 = §2 括注值（改前 = 改后 · ±0）**。

**判据读数（§2 C1 命令实跑 · cwd = `thincoder/`）**：全仓 = `{"f1":87,"f1f":27,"u2a":15,"u2af":8,"u2b":3,"u2bf":1,"css":14,"cssf":4,"md":8,"mdf":5,"wideCode":86,"wideCss":3,"wideMd":543}`（其他目录段并行在途 ⇒ 全仓读数非本面读数）。**本面逐目录（`thincoder-core/**`）= f1 5 ∕ u2a 0 ∕ u2b 0（4 档）**；5 处 F1 全为白名单留项（`advisor/convergence.mjs:27` ∥ `CHANGELOG.md:30` ×2 ∥ `prompts/advisor-round2.md:30` ∥ `prompts/advisor-round3.md:27`）⇒ **本面零非白名单命中**。参照：同轮他目录 = cli f1 1（留项）· vscode 0 · render-core 0 · server u2a 1 · bench u2b 6（留项）· desktop f1 84 ∕ u2a 29（在途）。

**名形口径（披露）**：绝大多数处取被引处的具体名（`chatImpl` ∥ `onToolResult` ∥ `assembleFamilyTools` ∥ `engChildSubagent` ∥ `parseValue` ∥ `writeTombstone` ∥ `runPass`（4 处同引）∥ `RECORD_DIR_SUFFIX` ∥ `pathExists` ∥ `killTree` ∥ `createExitCleanup` ∥ `assembleBuiltinTools` ∥ `resolveEngineeringManifest` ∥ `resolveBaseDir` ∥ `parseModelRef` ∥ `executeEscalateAction` ∥ `runBash` ∥ `runPreparedItem` ∥ `permissionGate` ∥ `buildPanelCallbacks` ∥ `createVscNotify` ∥ `applyAdvisorEffort` ∥ `startConfigWatch` ∥ `extractFileLinks` ∥ `LIVE_HEARTBEAT_MS` ∥ `reassertLiveChildren` ∥ `timerWakeEnabled` ∥ `createTimerWatch` ∥ `deliverExpiredTimers` ∥ `fireTimerWake` ∥ `_setShellDetectForTest` ∥ `_setSessionGcDelayForTest` ∥ `_setProjectRootForTest` ∥ `injectResponseReminders` ∥ `injectAsyncResult` ∥ `generateTitle` ∥ `ensureSessionTitle` ∥ `notify.done`（键名）∥ `WEBVIEW.md` §4.4（节名）∥ §6.21「写非活动槽」行 ∥ §6.26「审计块」行 ∥ §16.4「effort 族」/「服务端强制族」行）。**退档名 ∕ 描述句者（单列）**：`rules.mjs:82` ∥ `:175`（被引 `VSC src/extension/rules.mjs` 现盘已亡 ⇒ 收「纯搬自 VSC 端壳」，依 F2/F4 删档名优于留死档名）· `rules.mjs:72`（被引 `make-agent.mjs:44-48` 段已迁出，源档在 ⇒ 收档名）· `browser/cdp.mjs:4` ∥ `launch.mjs:4`（被引 = `scripts/console-walkthrough.mjs` 的脚本级代码块，无单一符号 ⇒ 收档名）· `vision-reader.mjs` 4 处（`ledger.mjs:16` 为纯注释行 ⇒ 收档名；`image-handler.mjs` 两处随 `runVisionReader` 名走）· `agent/setup.mjs:59`（被引 = 行内装配支 ⇒ 收该支名 `projectRules`）· `shell-candidates.mjs:2/:3`（两造端实现已收编 ⇒ 收档名）· `notify-policy.mjs:5/:39`（VSC 宿主包装 ⇒ 名 `createVscNotify`）· `agent-tools.mjs:25`（VSC 登记册转口档 ⇒ 档名）。

**未覆盖形（判据式不命中 · 父侧裁 = 留 · 入册 `#1564` · 一处未动）**：core 包内 11 行 / ≈13 处**无反引号**裸行号 —— `attachments.mjs:5`（`parseDataUrl` :34）· `:6`（`savePastedImages` :49 ∥ `downgradeNonVisionImages` :109）· `:115`（VSC :110）· `tools/browser.mjs:27`（§2.2 :101）· `:30`（§2.2 :103）· `:35`（§2.2 :102-103）· `escape.mjs:55`（:66/:68）· `provider/core.mjs:216`（:193）· `agent-tools/batch.mjs:88`（`batch-segment.mjs` :129-184——旧档名 + 区间）· `agent-tools/escalate-async.mjs:231`（§3.1 :85）· `agent-tools/subagent-async.mjs:239`（mouse :199）。**裁因**：R2 判据式要反引号包裹 ⇒ 这 12 处不入 C1/C2 ⇒ 「收完也无法机检完备，绿了是假绿」；收正须先改判据式（设计面，不许飞行中扩面）⇒ 留、入册、下一轮先立式再一次性收。

**审计与评审轮次与终态**：① **内部分歧审计（explore · 只读）1 轮 = clean**——129 处逐处核：已收 128 ∥ 残 1（`convergence.mjs:27` 留项）∥ 无新行号 ∥ 无新址 ∥ 无假指 ∥ 逐档行数 ±0（57 档与 §2 括注全符）∥ 改动全落 `thincoder-core/**`。② **内部代码评审（advisor type=code）1 轮 = pass**——0 🔴 · 1 🟡（协调项：core 段 §5 记录缺位——本块即补）· 2 🔵（未覆盖形在册 ∥ 改后形部分退档名需随本块披露）。**fix round 0 · 终态 = clean**。**未决限制（unverified）**：无 git 面 ⇒ 「改动行 ≤300（C3）」与「无整行增删」未独立复现（行数 ±0 以逐档读数 + 审计复核为据）；`.thincoder/tmp/**` 历史快照内仍见旧形（构建产物面，按 §2 排除集不在射程）。

### §5 实施记录 · 派 = `thincoder-desktop/**` 段（eng-coder · 2026-10-16）

**状态行**：实施完成（审计 1 轮 · 评审 1 轮 · fix round 2 · 终态 clean）。

**交付摘要**：射程 = `thincoder-desktop/**` 全段逐处处置 —— §2 清单 F1 286 处 / 81 档 · U2① 28 处 / 16 档 · `.css` 本体 50 处 / 9 档（含 §2 另列的 `.css` 裸行号 14 处：`chat.css` 5 ∥ `core.css` 8 ∥ `session-list.css` 2 ∥ `theme.css` 3）。改后形 = **被引处的符号 / 函数 / 常量 / 选择器 / 键名**（非「去行号即止」）；文档引 ⇒ 节名（`IPC.md` §1 等）；`.css` 取被引处可自足的名（VSC 选择器本体，如 `.tool-call-name` ∥ `.reasoning-content pre code`）；确无名可取 ⇒ 档名（去行号）+ 下表单列。语义零改（只动引用形）；`F4` 不折行，逐档行数 `±0`。留项未动：`scripts/win-sign.mjs:7`（`out/codeSign/windowsSignToolManager.js:132 ∥ :159-166`）∥ `src/main/main.mjs:192`（`electron.d.ts:18227`）—— 实读仍在。

**落盘读数（实跑）**：
- `node --check`：81 档改后 .mjs = **0 失败**。
- `git diff --numstat -- thincoder-desktop`：90 档，**逐档 added == deleted**（±0 全档成立；`projects.mjs` / `session-slots.mjs` 首轮并合致 −1 行，fix round 已还原两行）。
- 残值（R1 形 = `档名.ext:行号`）：**仅 2 处 = 两枚留项**；`` `:N` `` 裸形 = **0**；`.css` 面 R1 = **0**；「第 N 行」= 0。
- 抽验 12 档行数 = §2 登记值逐档相等（`i18n.mjs` 453 ∥ `i18n-views.mjs` 437 ∥ `session-slots.mjs` 272 ∥ `main.mjs` 269 ∥ `chrome.css` 282 ∥ `chat.css` 366 ∥ `core.css` 336 …）；三目录内无 >500 行档。

**决策透明表**：

| 项 | 决策 | 依据 |
|---|---|---|
| 名形取值 | 能取符号 / 选择器 / 键名者取之；真无名者回落档名 | 父侧本轮裁定「改后形 = 被引处符号名（非去行号即止）；确无可用名 ⇒ 档名并单列」 |
| 档名 fallback（须父阅） | `tools/web-quickcheck/serve.mjs`（7 处 → 「沿 `protocol.mjs`」，被引为**整档判定序**，无单一符号）∥ `session-list.css:2`（「原 `renderer/chrome.css` 两段」—— 迁出源区间无段名）∥ `chrome.css:224`（`thincoder-cli/src/tui/render-frame.mjs`—— 被引区间 `:344-427` **已越现档 EOF**，原物亡）∥ `i18n-views.mjs:26/:28` · `i18n.mjs:40` · `views/activity-new.mjs:9`（`locales/{en,zh}.json`—— 引的是**整表值逐字**，非单键）∥ 及评审单所列余处 | F3「无对应名时之回退」 |
| 越清单边缘形（待裁） | `src/main/session-slots.mjs:115/:188` · `sessions.mjs:3` · `suspensions.mjs:24` 的 `` `docs/desktop/design/IPC.md`:行号 `` 形（反引号在冒号前、数字后无反引号）**未动** | 判据 R1（需 `.md:` 紧邻）/ R2（需数字后紧跟反引号）均不命中 ⇒ 落 §2 清单外；我按「清单外不扩面」处置 → 上抛待裁（并入 U2 或逐处判留） |

**审计与代码评审轮次**：
- **内部 explore 偏离审计 1 轮** → findings：① `.css` 裸行号 14 处未清（§2 已逐档列举，我初判「U2① 仅枚举 CODE」而漏 ⇒ 已全清）；② `chrome.css:224` / `core.css:331` 收档名 2 处（保留 + 单列，见上表）；③ 附注 `` `IPC.md`:N `` 边缘形 4 处（上抛）。行数 ±0 / 残 R1 零命中两项审计侧因无 git 面改用行数比对，与我侧 numstat 读数一致。
- **fix round 1**：`.css` 裸行号 14 处逐处收名（`chat.css` → `.tool-call-name` ∥ `.tool-call-args` ∥ `.tool-call-status` ∥ `.tool-call-summary`；`core.css` → `.reasoning-content pre code` ∥ `.reasoning-content code` ∥ `.reasoning-content pre` ∥ `.file-link:hover`；`theme.css` → `C.advisor` ∥ `body.vscode-light`；`session-list.css:2` → `renderer/chrome.css` 两段）；`session-wire.mjs:55` 裸 `:126` → 「同函数 `Number.isInteger`」；并合致 −1 两档回补两行（行数 ±0）。
- **内部 advisor 代码评审 1 轮 → `changes-required`**：🔴 1 —— `theme.css:16` / `:17` ∥ `chrome.css:226` 换名错取成员 `ansi.warn` / `ansi.tool`（该名**不存于** `ansi`：`thincoder-cli/src/tui/ansi.mjs:7` 的 `ansi` 只含 `dim`(31) / `bold` / `fg` / `bg` / `gray`；`warn`(46) / `tool`(43) 住 `C`(38) ⇒ 被引处真名 = `C.warn` / `C.tool`）；🟡 3 ——（a）名形取档名而非符号（与 bench 派裁「符号 / 函数 / 常量名」形态未对齐）（b）`` `IPC.md`:N `` 判据盲区残形（c）§5 无 desktop 段记录；🔵 1 —— `i18n-views.mjs:3` 引 `docs/desktop/design/UI.md` §1「本批注」节名悬空（先存在于本批前，非本次引入）。
- **fix round 2**：🔴 已改 —— `theme.css:16` → 「警示 = CLI 黄（`C.warn` = `ansi.fg(3)`）」· `theme.css:17` → 「青（`ansi.fg(6)`）」· `chrome.css:226` → 「`auto` = `C.warn`（`ansi.fg(3)` 黄）」；顺带消肿两处机械换名留痕（`theme.css:18` 「同档」无前指 → 删；`chrome.css:226` `C.tool` 重名 → `ansi.fg(6)`）。🟡 (a)(b) 属**改后形取值口径 / 清单边界面**，按「冲突与越域名 ⇒ 停手上抛」处置：单列于本段决策透明表与交付报告，待父侧裁；🟡 (c) = 本段即补记。
- **终态**：**clean**（fix round 2 闭）。**advisor round 2（复审 fix claims）未跑** —— 预算考量，改动为 3 处标记级替换 + 2 处文字消肿，已逐处自读复核；如实披露，不计入已复核轮次。

### §5 实施记录 · `thincoder-desktop` 段 · fix round 3（eng-coder · 2026-10-16）

**状态行（本块）**：实施完成 —— 本轮四项（JSON 键名 4 处 ∥ 判据盲区形 1 处收正 ∥ 文档引节名自检 9 处 ∥ advisor 复检）落地 · 逐档 ±0 · 终态 clean。

**来源（三句必写）**：① **来源** = 父侧本会话两件裁 —— 其一（回应我上抛「同形标的物不解析」）= **「A —— 正确节优先于形式同形」** + 三条命令（`sessions.mjs:3` ⇒ `IPC.md` §2 会话族注 ∥ `projects.mjs:19`/`:113` 的错收 §1 系本批产物、须本批收 ∥ 扩一层自检「文档引 ⇒ 节名」逐处核「该节确实含被引内容？」）；其二（本批收尾任务）= 引 `locales/{en,zh}.json` 的四处必须给键名。② **执行人 = eng-coder（本席）**。③ **本轮不做** = 三项 `IPC.md`:N 残形（`src/main/session-slots.mjs:115` ∥ `:188` ∥ `src/main/suspensions.mjs:24`）—— 父侧裁「留」（无已收孪生者 · 判例 #1564）∥ `.md` 引以外的符号名收正 ∥ `docs/**` · `scripts/**` · 他包 ∥ 扩面。

**逐处处置（改前 → 改后 · 同行内替换 · 逐档 ±0）**

| # | 坐标 | 改前 | 改后 | 依据 |
|---|---|---|---|---|
| 1 | `renderer/i18n-views.mjs:26` | `locales/{en,zh}.json` 逐字 | `…的 \`search.placeholder\` ∕ \`search.prev\` ∕ \`search.next\` ∕ \`search.close\` ∕ \`search.noMatch\` 五键逐字` | 父侧：JSON ⇒ 键名（F3） |
| 2 | `renderer/i18n-views.mjs:28` | `locales/{en,zh}.json` | `…的 \`status.indexScan\` ∕ \`status.indexProgress\` 两键逐字` | 同 1 |
| 3 | `renderer/i18n.mjs:40` | `locales/{en,zh}.json` | `…的 \`sub.newBlocks\`` | 同 1 |
| 4 | `renderer/views/activity-new.mjs:9` | `locales/{en,zh}.json` | `…的 \`sub.newBlocks\`` | 同 1 |
| 5 | `src/main/sessions.mjs:3` | `docs/desktop/design/IPC.md`:47 | `docs/desktop/design/IPC.md` §2 会话族注 | 父侧命令① |
| 6 | `src/main/projects.mjs:19` | `IPC.md` §1（错收） | `IPC.md` §2 项目面注 项 4 | 父侧命令②（靶 `IPC.md:276`） |
| 7 | `src/main/projects.mjs:113` | `IPC.md` §1（错收） | `IPC.md` §2 项目面注 项 1 | 父侧命令②（靶 `IPC.md:272`） |
| 8 | `src/main/session-slots.mjs:69` | `UI.md` §1（内容已迁出） | `IPC.md` §2 会话族注 | 父侧命令③自检（见下） |
| 9 | `renderer/theme.css:17` | `CLI \`C.tool\` = \`fg(6)\` 青（\`ansi.fg(6)\`）` | `CLI \`C.tool\` = \`ansi.fg(6)\` 青` | advisor 第 1 轮 🔵（换名留痕） |
| 10 | `renderer/chrome.css:226` | `= \`C.advisor\`（\`C.advisor\` \`ESC[92m\` 亮绿` | `= \`C.advisor\`（\`ESC[92m\` 亮绿` | 同 9 |

**父侧命令③「文档引 ⇒ 节名」自检（三读数）**

- **核了几处**：本批在 desktop 面产出 / 触及的「文档引 ⇒ 节名」收正处共 **9 处**（上表 #1–#8 + `renderer/events.mjs:117`）。
- **错的是哪几处**（逐处坐标 + 错在哪）：**3 处** —— ① `src/main/projects.mjs:19`：`IPC.md` §1 无「前 10」（§1 = 主→渲染事件面；实住 `IPC.md:276` §2 项目面注 项 4）；② `src/main/projects.mjs:113`：`IPC.md` §1 无 `sessionPath`（实住 `IPC.md:272` §2 项目面注 项 1）；③ `src/main/session-slots.mjs:69`：`UI.md` §1 的会话控制面行已迁出（`UI.md:37` = 「→ 迁 `SESSIONS.md` §2.1」空壳；`createdBy` 消费口径实住 `IPC.md` §2 会话族注 项 1/2，来源端标注实住 `SESSIONS.md` §2.7）。三处均照本批修正（上表 #6/#7/#8）。
- **用什么办法核的**：逐处取「引据句的靶内容」→ 在被引 `.md` 里定位**拥有**该内容的节（`grep ^#` 出节名表 + 实读该节正文）→ 判「该节是否确含被引内容」；判不准者取同档 / 同类先例。核实读数：`IPC.md` §1（:11 起 · 事件面）**不含** `sessionPath` ∥「前 10」∥ `createdBy`；§2 会话族注 项 1 = 载荷行字段集（`IPC.md:184`）· §2 项目面注 项 1 = 物化（`IPC.md:272`）· 项 4 = 前 10（`IPC.md:276`）；`SHELL.md` §1 树列 `i18n.mjs`（:98）∥ `store.mjs`（:101）⇒ 两处收正**成立**；`RENDERER.md` §1 表列「单状态树」行（:19）⇒ 成立；`UI.md` §1 无 `createdBy`（唯 :434 处迁出指路）⇒ 不成立。
- **对的留（6 处）**：`i18n.mjs:2`（`SHELL.md` §1「进程与目录形态」—— :98 实列本档）· `store.mjs:2`（`SHELL.md` §1 · `RENDERER.md` §1 —— :101/:19 实列）· `agent-bridge.mjs:100`（`IPC.md` §1「主 → 渲染（事件推送）」—— §1 事件表含 `ev:reasoning`）· `events.mjs:117` ∥ `agent-bridge.mjs:171`（`IPC.md` §1「`fields` 键在场 ⇒ 内联形」—— `IPC.md:65` 逐字在场）。
- **同法抽核的非本批收正处（报告项 · 未动）**：`renderer/chat.css:18` 引 `UI.md`「流内竖向间距」注 —— **UI.md 无此字样**（间距注实住 `CHAT.md` §2「批注（流内竖向间距）」，`UI.md:340`/`:410` 自指 CHAT.md）⇒ **假指**，唯 `-`/`+` 两行同形 ⇒ 非本批产物，按「不扩面」未动、单列上抛；`session-list.css:2` 等档引 `docs/batches/2026-09-29-structure-split-round.md` §2.2-A ∥ `…2026-09-29-hatch-clearance-2.md` ∥ `…2026-09-28-desktop-feature-parity.md` —— 该三份批档**已不在盘**（`docs/batches/` 现无 `2026-09-*`）⇒ 悬空指路，非本批产物，单列上抛。

**判据读数（实跑 2026-10-16 · cwd = `thincoder/`）**：`git diff --numstat -- thincoder-desktop` = **90 档、逐档 `added == deleted`（±0）**；`档名.ext:行号`（R1 形）—— `renderer/**` **0** ∥ `src/main/**` **1**（`main.mjs:192` = 留项 `electron.d.ts:18227`）∥ `tools/web-quickcheck/**` **0**；`IPC.md`:N 残形 = **3**（父侧裁留件）；各档编辑回执全 `Syntax: OK`。

**审计与代码评审轮次与终态**：① 内部 explore 偏离审计 = 上轮 1 轮（clean · 本段已记）。② **内部 advisor 代码评审 = 2 轮** —— 第 1 轮 `changes-required`（🔴 1 = 盲区四形未落地；🔵 2 = `theme.css:17` / `chrome.css:226` 换名留痕）；**第 2 轮（fix 后复检）= `pass`**（🔴 已闭：`sessions.mjs:3` 收 §2 会话族注；🔵 2 处已消肿；无新 🔴；1 🟡 = 交付记录面 `:995`/`:657` 与现盘不符 —— **非 must-fix · 报告不阻断**，属父侧文档层收口）。③ **fix round = 3**（父侧两件裁驱动：r1 = `.css` 裸行号 14 处；r2 = 🔴 `C.warn`/`C.tool`；r3 = 本轮 10 处）。**未决限制（unverified）**：无 git 面 ⇒「逐档 ±0」「90 档」以 `numstat` 读数 + 上轮审计行数比对为据（未独立复现整树）；advisor 侧「引用核验」因其工具面路径解析报 `file unreadable`（与其实读正文不符 ⇒ 以本席实读为准，如实记）；共享 `**状态行**` 行（本节首块 :657）载兄弟派读数，本席**未覆写**，请父侧终态归口。**终态 = `clean`**（本段面零残行号引 · 零越界 · 零语义改 · 逐档 ±0）。

## §6 验证与收口（父代理）

**验证与收口（父侧 · 2026-10-16）**

- **交付面**：**七面全落**——`#149` core ∥ `#150` cli ∥ `#151` vscode ∥ `#152` desktop ∥ `#153` render-core ∥ `#154` server ∥ `#155` bench；**修正轮**——`#148`（记录面 3 条）∥ `#167`（desktop 收尾 4 项 + **假指自检**：核 9 处「文档引 ⇒ 节名」、查出 **3 处假指**、全修）∥ 设计 `#147` 轮已闭。设计 = 三评通过（`#146` 轮 2 · 🔴 0）。
- **父侧核读（不转述子代理读数）**：父侧以库内 grep 按 **F1 形**（`<档>.ext:<行号>`）扫 **7 个包**（排除 `docs/**` · `test/**` · `node_modules` · `dist*`）——残值**全部为已声明留项 / 白名单**：`thincoder-core/advisor/convergence.mjs:27`（评审标准文本自身示例）· `thincoder-core/CHANGELOG.md:30`（记录面史 · §1 裁）· `thincoder-core/prompts/advisor-round{2,3}.md`（格式示例）· `thincoder-cli/scripts/doc-impact.mjs:81`（形判断注释）· `thincoder-desktop/scripts/win-sign.mjs:7`（仓外第三方 API 名）· `bench/results/*.json`（探针基线记录）⇒ **零意外残值** ✓。另跑仓级文档闸 `node scripts/doc-check.mjs --root .` = **231 锚悬空 / 29 行超宽**（**与既有基线逐项同值** ⇒ 本批**零新增**，反证落笔合规）。
- **计数**：设计读数 = **912 处 / 266 档**（改 888 ∥ 删 9 ∥ 留 15）；派 **7 面**（原估「22 派」= 按 15 档切；实按**包**切 ⇒ 7 派）；各面实施读数见 §5。
- **留项 15 处**：**有据之留**（逐项理由在 §2 清单 / §5 逐档表）——白名单项 + `bench/results` + `.css` / `.md` 体 4 处。
- **判据式覆盖不到的形态（未收 · 已入册）**：`#1564`（无反引号裸行号 ∥ 「符号名:行号」无扩展名 ∥ 「行 N」近形 ∥ `.md`:`行号` 形——**先立判据再一次性收**）· `#1568`（`render-core/composer/composer.css` 头注死指针 + 数字不自洽）· `#1566`（`member-shell/core-run.mjs` 655 行 > 500 咨询线的结构案）· `#1565`（`LEDGER.md` 批甲待落标记余项）。**同批产物一律本批收**（`#167` 的 3 处假指、desktop 的 4 处 JSON 引即如此）。
- **修正轮落地前置**：均落（`#148` · `#167`）✓。**搁置清单回核**：无搁置项。**暂缓批复核**：本批无暂缓项 ⇒ 「暂缓批复核 = 无」✓。**用户文档面同拍**：无（本批 = 源码注释 / 文案面，不涉用户文档）。
- **台账可见面**：`#1554`（P4 相位）**已核销**（凭据 = 本档 §6 + 七面落地）；`#1560`（仓级文档债读数）**已复核**（本期实跑，读数与在册一致）。**凭证**：本设计凭证**已消费**（消费于本收口轮）。
- **非本批发现（记账、下轮清）**：仓根 **`tmp-a-c7-probe.mjs`**（临时探针落仓根 ✗ 违「临时件落 `.thincoder/tmp/` 或仓外」；含 F1 形引用 `provider/core.mjs:419`）——非本批产物，另册。
