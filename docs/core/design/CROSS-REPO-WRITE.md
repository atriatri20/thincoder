# 跨仓写权（设计）

> 板 = core。本档拥有「写在别人的目录里、账记在本仓」这一机制：声明面（`index.writableRepos`）· 写门判据点源的选择 · 记账归属 · 提示词与工具面。
> 键的形态与校验单源 = `docs/core/design/MANIFEST.md` §2.2；写门其余判据（号四情形 ∥ 项目声明 ∥ 工作区窄口）单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 / §2.3.1——本档只写它与**跨仓目标**相交的那一部分。

## 1. 做法与理由

一句：在写方 manifest 声明一张「可写外部目录表」，写门对一个落在表内的目标改判「号取写方台账」——目标仓不参与授权，其账上也不留痕。

用户裁定三条（逐字）：

- 「在各仓的manifest加一个可以写的外部项目配置，对那边的更改就可以在本仓记账。」
- 「不存在偷偷改，偷偷改的限制我们会在 git 的权限上控制，能提交就是允许他改。」
- 键名「这个键的名字含义不是很清晰，最好重新取一个，逻辑我基本同意。」→ 采认候选 `writableRepos`（与 `publicRepos` 成对：一个读名单、一个写名单）。
- **收窄一条**（2026-11-09，用户答「可以」就「表非空时窄口加一条前置」那条修法）：**表非空时，窄口加一条前置——目标必须落在表内某声明根内**；表为空（未声明）⇒ 窄口维持现状。（实现落点：表内目标由判序 ① 取走，窄口只剩「表为空」一支——见 §2.2 判序 ⑤。）同一条裁定把「表外 ⇒ 拒」扩成**无条件**：传了 `project` 的一笔，目标属另一个项目而不在表内 ⇒ 直接拒，**不再回落到目标仓的账**（替换，不是兜底）。
  病灶两句：窄口不看表（把一个仓的子目录声明进去，等于对那张表什么都没收）；`表外` 原先只在「目标仓查无此行」时才拒，于是声明了写方也照样走得通目标仓那条路。
- **声明须自证 · 一（同日用户裁）**：「传了 `project` 的笔，只能走声明的那本账——声明解析不出来，就是这笔写无法自证，应当拒，不是静默忽略声明。」⇒ 判序 ⓪。
- **声明须自证 · 二（同裁）**：「『读不出』不是『没声明』——前者是未知，后者是明确的空。」⇒ 第三句（表不可读）。
  两条都不是新增防线，而是把「未知」从「空」里分出来。
- **适用面一刀切**（同日父侧裁定）：本判序对**凡带定位参数、带 `project` 的写型入口**一律成立——写盘七件 ∥ `execute` 的 `workdir`。理由：两处是同一个洞（带了 `project` 却仍去判目标仓的账），分两批收，第一批落地后洞仍开着，读者却以为规则已经生效。

**现行写门为什么不认这个形**（实读 `thincoder-core/agent/write-gate-ledger.mjs`）：每个目标先 `const root = resolveProjectRoot(p)` 取到**目标自己的**项目根，紧接着 `const at = await ledgerRowAt(root, parsed.no ?? null, cache)` 只查那一个根。目标属另一个项目 ⇒ 号只能取那个项目的账 ⇒ 记账落在目标仓——与用户裁的归属相反。

**最近先例（逐项对齐 ∥ 偏离）**

- **工作区根窄口**（`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1）：同为「判据点换源」的条件形。
  **对齐**：① 口子开在门体取根那一步；② 条件形——不成立照拒，没有「推不出就放过」的默认；③ 拒文逐条分开写，读得出是哪一条没成立；④ 只在工程模式 ∧ `depth = 0` 内。
  **偏离两处**：① 判据是**声明表的包含关系**，不是会话锚子树；② 目标**可以已属另一个项目**——那是本口子的主场景，窄口只处理「取不到项目根」。
- **`index.publicRepos` 的键形**（`docs/core/design/MANIFEST.md` §2.2 同名条）：值形 / 归一 / 基数 = 项目根，逐字复用 `thincoder-core/declaration.mjs` 的 `normalizePathList` 与 `declaredPublicRoots` 的取基法。
  **偏离一处**：两键**不互派**——读名单不自动成为写名单（理由 = KD-X4）。

**三问（新件的既有件答案）**

- `declaredWritableRoots`：`existing: thincoder-core/declaration.mjs` 的 `declaredPublicRoots`——形、取基、归一全同（`normalizePathList` + 项目根取基），本批照它写第二个（键不同、机制一份）。`none found` 面：`thincoder-core/agent/write-gate-ledger.mjs` 的取根处只有 `resolveDeclaredRoot`（取的是写方根，不是声明表），声明表的解析在门里无既有件。
- 两条新拒文：`none found: thincoder-core/agent/write-gate-ledger.mjs` 的拒文常量区（`caseNotAProject` 等既有串）——无一句说的是「目标属另一个项目而表未声明」或「窄口不覆盖该目标」（后者记在 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1 的三问节）。两句都是新语义，故新增；命名与既有 `case…` 同形。
- **消费面**：两条拒文的调用方只有 `ledgerBindWriteConflict` 一处，本批不新增导出。

**勘察行（查过的源 ∥ 结论）**

① `thincoder-core/agent/write-gate-ledger.mjs` 实读 ⇒ 取根与查账两行如上；拒文组装已按情形分成四个函数（`ledgerRefusal` / `ledgerNoProjectRefusal` / `ledgerUnreadableRefusal`），加一种情形不必动旧串。
② `thincoder-core/manifest-schema.mjs` 实读 ⇒ `DEFAULT_MANIFEST.index` 现七子键、`MANIFEST_SCHEMA.nestedKeys.index` 由它派生（写面白名单因此自动含新键）；`index.publicRepos` 的校验形 = 数组层 fail-closed、元素层宽容。
③ `thincoder-core/declaration.mjs` 实读 ⇒ `normalizePathList` 已是公开单源；`declaredPublicRoots(cwd)` 基数 = `decl.root`（项目根）。
④ `thincoder-core/tool-docs/manifest.md` 实读 ⇒ 键目录节末尾的节点计数句 `the 16 writable nodes (3 whole keys + docRoot's 6 sub-keys + index's 7 sub-keys)`；同节的写面白名单句已写「or a sub-key of docRoot / index」。
⑤ `thincoder-core/prompts/discipline-engineering.md` 实读 ⇒「Docs & ledger repo-self-contained」第 6 条 `**Out-of-repo changes: two cases, split by this repo's index.writableRepos**`。
⑥ `test/rtm/guard.md` 实读 ⇒ 故事 12 在盘，用例行**十六行、编号到 `12-17`**（`12-11` 已删——行数少于末号）⇒ 下一个空号 = `12-18`。
⑦ 工作目录外公共源 = **未勘察**：本机制不作任何外部系统断言（无仓外声明源可查）。

**数据面**：声明表是名单，判据不依赖任何行的取值 ⇒ 无需读数据（没有「多少行 / 字段填没填」这类断言）。

## 2. 接口契约

### 2.1 声明面：`index.writableRepos`

- **键位** = `index` 第八子键；**默认值** = `[]`。
- **值形** = 路径数组（项目根相对 ∥ 绝对同收，「从本仓根可解析」）；每项 = 一个**目录**。
- **归一** = `normalizePathList`（首部 `./` 剥离 · `\`→`/` · 去尾斜杠 · 空 ∥ 非串剔除 · 去重保序）——与 `index.excludePaths` / `index.publicRepos` 同一把尺，不写第二份。
- **校验** = **数组层 fail-closed**（非数组 ⇒ `errors` 点名 `index.writableRepos`）；**元素层宽容**（归一剔除）。与 `index.publicRepos` 同款：键写坏不该让整份 manifest 不可用。
- **解析层** = `declaredWritableRoots(cwd)` → 绝对根集：逐项 `resolve(声明项目的项目根, p)`、去重保序；缺省 `[]` ⇒ `[]`（零行为）。与 `declaredPublicRoots` 同形同基。
- **条目不受会话锚约束**：声明项可以是锚外任意目录（现场配置 `../v2-vibe-coding/v2` 就在锚外）。两处要分清：`W`（写方）**必须与会话锚相关**（§2.2 `W` 的三条件之一），声明**项**不受此限——它是声明方自选的授权面，真防线是 git 权限（用户 2026-11-09 17:05「能提交就是允许他改」），写面不设第二道锁。
- **语义 = 前缀包含**：目标绝对路径落在某个声明根内（**恰等** ∨ **后随 `/`**）即「已声明」。比较键 = `gateKey`（绝对化 + `/` 归一 + win32 大小写归一）——写门其余比较用的同一枚坐标。
- **不判存在性**：声明根不在盘时，它的前缀也含不住任何真实目标（目标本身在盘上必有目录树），故不另立存在性判据；与 `publicRepos` 解析层同口径（存在性归消费面）。
- **三条不做**：不认符号链接（不引 `realpathSync`——路径比较仍只有一枚坐标，同 §2.3.1 的代价）· 不判「是不是一个仓」（项是目录；不读目标的 `.git` ∥ manifest）· 不建依赖图、不做环检测（授权表不是依赖边：A↔B 互写不产生歧义）。

### 2.2 写门判据点源的选择（第三道门内新增一支）

每个目标独立走一遍；一笔写多目标 ⇒ 逐个判，任一拒 ⇒ 整笔拒、字节零动。

```text
p   = 本笔的一个目标（绝对路径，已 resolve）
W   = 本笔声明的写方项目：`project` 非空 ∧ `resolveDeclaredRoot(project, cwd)` 成立 ⇒ 该根
      （三条件：路径在盘 ∥ 是项目（带 `PROJECT-MANIFEST.json`）∥ 与会话锚相关）；任一条不成立 ⇒ W 无
tbl = W 有 ? declaredWritableRoots(W) : []      ← 既有件，签名零改（表不可用时它返回 `[]`）
ok  = W 有 ∧ readManifest(W).ok === true        ← 表可读性：`tbl` 只在 `ok` 为真时才有意义
R   = resolveProjectRoot(p)                       ← 现行单源，零改

⓪ project 非空 ∧ W 无            ⇒ 拒          （声明不了项目 ⇒ 这笔无法自证；不回落 R 的账，也不进 ④）
① W 有 ∧ ok ∧ tbl 含 p          ⇒ 判据点 = W （表内目标，口子开出）
② W 有 ∧ R 有 ∧ key(R) ≠ key(W) ⇒ 拒          （外部目标：表外 ∥ !ok——**都不查 R 的账**）
③ R 有 ∧ (W 无 ∨ key(R) = key(W)) ⇒ 判据点 = R （同项目：表不参与；无 W 时是现行路，零改）
④ R 无 ∧ action=init             ⇒ **不可达**：`manifest` 整把不进本门（`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3），没有任何一笔以 `action:"init"` 到这一步；编号不重排（本节与同档 §5 AC-11 都按现号指 ⑤⑥）
⑤ R 无 ∧ W 有 ∧ ok ∧ tbl 为空   ⇒ 窄口 §2.3.1：既有四条**全中** ⇒ 判据点 = W
                                   tbl 非空 ⇒ 拒（第二句）——表内目标已被 ① 取走，这一支只剩表外；
                                   !ok ⇒ 拒（第三句）；既有四条的其余不成立 ⇒ 各落自己那句
⑥ 以上都不是                    ⇒ 现行拒绝（`unknown — no project owns this write's target`）
```

- **声明了目标 ≠ 给出了写方**：表里含该目标只是必要条件——判序 ① 还须本笔用 `project` 显式点名写方（`W` 由它取）。不传 `project` ⇒ `W` 无 ⇒ 无写方即无表可取、声明表不参与判：目标有根 ⇒ 落 ③（号在目标项目账上判，与改前逐字同），目标无根 ⇒ 落 ⑤ 窄口。用例 T2 与 T6 的输入都带 `project:<本仓根>`，正是这一条。
- **适用面 = 凡带定位参数、带 `project` 的写型入口**：写盘七件（路径来自 `toolTouchPaths`）· `execute` 的 `workdir`——两处的 `W` 都取自 `project`，`R` 都取目标自己的项目根，判序 ⓪①②⑤ 逐条对它们成立；拒文三句、清单单位、号四情形不分工具。实现落点 = `thincoder-core/agent/write-gate-ledger.mjs` 的 `ledgerGateTargets` 给 `execute` 那一支挂上 `fallbackDeclared`（该支的 `declared` 缺位回落零改；`manifest` 整把不在入口集，本门没有第二支）。依据 `thincoder-core/agent/write-gate-ledger.mjs`「return wd ? { paths: [wd], fallbackDeclared: declared } : onlyDeclared()」——不挂这一项，`claim.fallbackDeclared` 为空，门落到「无声明」那一格，表外目标照旧判 `R` 的账。
- **`W` 的三条校验一个也不是新写**：`resolveDeclaredRoot`（`thincoder-core/agent/write-gate-ledger.mjs`，既有、零改）首行 `existsSync` 判存在；`(a)` 支 `existsSync(join(start, MANIFEST_REL)) && underKey(start, cwd)` 一次判「是项目」与「与会话锚相关」；`(b)` 支由 `resolveLedgerRoot` 判同两件。依据 `thincoder-core/agent/write-gate-ledger.mjs`「existsSync(join(start, MANIFEST_REL)) && underKey(start, cwd)」。
- **`W` 取不到根时落哪一句（沿用 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1 拒文表，不新写）**：⓪ 先判——目标有根无根都是同那句 `declared project is not a project`（三支逐支如下），目标有根也不回到 ③。`W` 取得到根而目标无根 ⇒ 照走 ⑤ 窄口。
  - **路径不在盘**（`resolveDeclaredRoot` 首行 `existsSync` 不成立）⇒ 拒文表 ① 支：`declared project is not a project (…): "<声明>"` + `unknown — the declared project is not a project`。
  - **不是项目**（两支都取不到带 manifest 的根）⇒ 拒文表 ② 支：同上一句。
  - **与会话锚无关**（在盘、带 manifest，却在锚外）⇒ 拒文表 ③ 支：仍是同上一句。**这一句对本支名不副实，照承认**：该目录确实是一个项目，句头却称它「不是项目」；准确的那半是括注 `(no PROJECT-MANIFEST.json at this path or within the session anchor)`——它说的正是「该路径与会话锚这两处都没拿到可用的 manifest」。本批不改这句既有拒文（改它属另一件事），三支共用一句的代价记在这里。
- **为什么 ① 必须带这三条**：`W` 的 manifest 是 `declaredWritableRoots(W)` 的取基，`W` 的账是号的判据地——`W` 不校验成「与会话锚相关的真项目」，声明就能把判据点指到会话之外的任意目录，授权与记账一起绕开锚（`resolveDeclaredRoot` 首行注释记的正是这条教训：拼错的声明会被归到会话自己那个项目上）。
- **① 先于 ② / ③**：写方声明「我在写外部目录」时，目标是外部这件事由**声明表**判定，不由目标自己有没有 manifest 决定——同一个口子因此同时覆盖「外部项目带 manifest」与「外部目录不带 manifest」两形。
- **口子不豁免号**：判据点选定后，号照原样判（缺号 ∥ 非行号形 ∥ 不在盘 ∥ 非在途，四情形逐字零改）。
- **不覆盖的两形各有出路**：目标在本项目内 ⇒ ③；目标在外部而本笔没声明写方 ⇒ ③/④/⑥（现行）。
  后一半就是两分口径：不声明 ⇒ 只能用**目标仓自己的**台账号写它——那是目标仓自己的批，本仓的门既不代它设防、也不代它记账（键面同句 = `docs/core/design/MANIFEST.md` §2.2 的 `index.writableRepos` 条）。
- **面判与判据点正交**：①③不同处只在「号查谁的账」；面（文档面 ∥ 产品面）由**目标所属项目根**（`resolveProjectRoot(p)` 取到的 `R`）自己的 `docRoot` 判，写方 `W` 的 `docRoot` 与 `writableRepos` 都不参与。目标仓把 `docRoot.design` 指到第三处目录时，判面跟它走，不跟本仓走（§2.4）。
- **表内 ≠ 免门**：声明表只换判据点，不换门禁——目标落在目标仓的**文档面** ⇒ 设计门不问（本地亦然），写门照判号；落在**产品面** ⇒ 设计门要活设计槽、写门照判号。跨仓不是快速通道（§2.4）。

**拒文（新串，逐字）**

```text
case : target belongs to another project and index.writableRepos of the declared project does not declare it: "<path>"
list : unknown — the declared project does not own this write's target
```

第三句 = 写方 manifest 在盘而读不出可用声明（`index.writableRepos` 不可判）。整条拒文两行，各有自己的标签：

```text
case : the declared project's manifest is not usable — index.writableRepos cannot be read: "<path>"
tail : (declared project's manifest unreadable — <原错>)
```

- **出现面**：判序 ② 的外部目标 ∥ 判序 ⑤ 的窄口，两处共用这一句。
- **实现落点**：`thincoder-core/agent/write-gate-ledger.mjs` 的 `CASE_WRITABLE_UNREADABLE`（`<case>` 那一行）∥ `ledgerTableUnreadableRefusal`（两行的装配）。依据 `thincoder-core/agent/write-gate-ledger.mjs`「(declared project's manifest unreadable — ${error})」
- **尾行是第四种标签，不复用 `(ledger unreadable — <原错>)`**：那一行标的是**台账那一格**——这个根的账读不读得出来，输入 = `ledgerRowsOf` 的 `error`。
- **本格没开过台账**：问的是写方声明的什么，输入 = `readManifest(W).ok`。两格不相交（§2.4），标成台账那句会把读拒文的人引去查号，而号在这一格还没判过。
- **两行成分也不同**：`declared project's manifest unreadable` 说**谁的** manifest 读不出，`ledger unreadable` 说**哪本账**读不出。
- **不列在途清单**：读不出就没有清单，写 `none` 会把「读不到」说成「一条都没有」——与 `ledgerUnreadableRefusal` 同形（同样两行，只有尾行标签不同），清单单位仍是四形。

另有一句只属于窄口那一支（第五条件不成立）：

```text
case : target is not covered by index.writableRepos of the declared project — the workspace-root opening does not apply: "<path>"
list : unknown — no project owns this write's target
```

出现条件（可判形）：

- **第一句 = 判序 ②**：`W` 有 ∧ `R` 有 ∧ `key(R) ≠ key(W)` ∧ `tbl` 不含 `p`。**与 `R` 的账怎么答无关**——旧口径追加的合取「② 的判号结果落在 `no such row`」本批删掉，那一条正是回落到目标仓台账的臂。
- **第二句 = 判序 ⑤**：窄口既有四条成立之后，`tbl` 非空而目标不在表内。
- **前两句按「目标属不属于一个项目」分**：第一句点的是「目标属另一个项目」，`R` 不存在时这句话不成立——那一形归窄口，另给第二句。一句里两个结论会让读拒文的人分不清该改哪一边。
- **`W = R` 时前两句都不出**：目标落在写方自己的项目里，声明表不参与（判序 ③）。**写方树内另有一个带 manifest 的嵌套项目**时 `R ≠ W`，按「另一个项目」判——需在表内声明，或另起一笔不带 `project`（判序 ③）。
- **清单单位各按自己那一侧取**：第一句取 `unknown — the declared project does not own this write's target`（判据点本可在两个项目之间，列任一方的在途行都会把人引去改另一本账）；第二句取 `unknown — no project owns this write's target`（问题在目标与声明，不在号）。
- **声明缺位时不谈号**：② 先于号判——声明这一层不成立，号对不对无从谈起（与既有判序「项目先判」同一句话）。
- **⓪ 那一支（声明解析不出项目）**：`project` 给了而取不到根 ⇒ 拒，沿用拒文表 ①②③ 那组串（`declared project is not a project` · `unknown — the declared project is not a project`）。
  它先于表、先于号——没有写方就没有表、没有账可问。
- **表不可读那一支**：`R` 有 ∧ `key(R) ≠ key(W)` ⇒ 拒（第三句；行为与改前相同，变的是那句话不再断言「未声明」）。
  `R` 无 ⇒ 窄口不开（第三句）。
  `R = W` ⇒ 照走 ③（表不参与；本仓写不落第三句，两格之分见 §2.4）。
  `action:"init"` 那支已退场：判序 ④ 不可达（`manifest` 整把不进本门）。

**这一格的复现路径（出处）**：夹具 = 本仓根作写方 `W` + 另一 tmp 项目 `R`；`write` 写 `R` 内一份档、带本仓在途号、不带 `project` ⇒ 出 `row #N does not exist in this project's ledger`；同一笔加 `project:<W>` 而表未声明 ⇒ 出新串；把 `R` 目录写进 `index.writableRepos` 后同一笔放行。

**失败侧的读法（本批要的正是它）**：先在 `R` 的账里挂一条与 `W` 在途行**同号**的行，再跑「`project:<W>` + 表未声明 + 该号」那一笔——改前的结局是放行（回落到了 `R` 的账），改后仍出新串。两读不同才算这一条落地。

### 2.3 记账归属

- **台账行 = 写方项目的行**：判据 `ledgerRowAt(W, …)`，行状态仍须 `在途`，`task_book` 指写方批档。
- **目标仓零台账写、零批档写**：门只读 `W` 的 manifest 与 `W` 的账——`R` 的 manifest 在授权面上不被读；它另在两处被用到——归属判定（`resolveProjectRoot(p)`，只判存在性、不解内容）与面判（§2.4 的 `faceDetail` 按目标项目根读一次）。两处都**不参与授权、不被写**。
- **跨仓改了哪几份外部档** ⇒ 写方批档 §5 逐档记（写方记录义务）。**不加机械门**：门判得出「号在不在途」，判不出「记清了没有」，硬加一道文本匹配只是假门。
- 与需求档那句「任一产品的文档只承载自己的事项」不冲突（依据 `docs/core/requirements/ENGINEERING-MODE-V2.md`「任一产品的文档只承载自己的事项」）：跨仓写是**本仓自己的一件活**（它替本仓的哪条债服务），不是把另一个产品的事登记到本仓。

### 2.4 面判与门禁（外部仓与本地逐条一样）

面判单源 = `thincoder-core/agent/write-face.mjs` 的 `faceDetail`（本档实读）：先 `declarationForTarget(abs)` 取**目标自己**的项目根，再用那个根的 `docRoot` 判面。三种目标形态落三行：

| 目标形态 | 面（`reason`） | 门禁 |
|---|---|---|
| 在某项目根内 ∧ 命中该项目 `docRoot.<在册键>`（`REVIEW_ROOT_KEYS`：`design` ∥ `requirements` ∥ `specs` ∥ `modules` ∥ `batches` ∥ `standards`） | 文档面（`doc-root`） | 设计门**不问**（文档面 = 放行面，与本地同一处逐条相同）；写门仍判号 |
| 在某项目根内 ∧ 不在册 | 产品面（`product`，fail-closed） | 全链（要求 → 设计 → 评审 → 写门） |
| 祖先链无 manifest（声明的是不带 manifest 的普通目录） | 放行面（`out-of-jurisdiction`——辖界不是面） | 无文档门；写门仍判号（§2.2 ①） |

- **分类 ≠ 授权**：读目标仓的 `docRoot` 只回答「这处写入属于哪一类」，**放不放行始终只看写方 `index.writableRepos`**（§2.2 ①）。目标仓既不获得否决权、也不参与授权——单向声明一字未动。
- **判面用目标仓自己的声明**：目标仓把 `docRoot.design` 指向别处时，判面跟它走；`W` 的 `docRoot` 与 `writableRepos` 都不参与判面（§2.2「面判与判据点正交」）。
- **调用面按目标根读 manifest**：`faceDetail(absPath, manifest)` 的 `manifest` 缺省（`null`）即按目标项目根读（`readManifest(root)`）；传会话项目 `W` 的 manifest 会把本仓 `docRoot` 的值套到目标根的基上——调用面一律不传。`faceDetail` 本体零改，改动只在调用面。
- **代价照写**：跨仓写多一次 manifest 读（目标的）。换来的是「跨仓不是快速通道」——在外部仓改一份**产品面**文件与本地一样要过设计门（活设计槽），文档面则与本地一样不问设计门（§2.4 面表）。
- **风险与处置（不静默）**：目标项目无 manifest ⇒ 落第三行（出辖 ⇒ 放行面）；有 manifest 但**不可用**（坏 JSON / 形态非法——`readManifest` 读不到就补不出 `docRoot`，缺子键的档则由默认值补齐、仍是文档面）⇒ 文档面根集空 ⇒ 落第二行（产品面）。两种都不许静默当文档面放行，处置落在**单测缝**上：直接调 `faceDetail(<目标>)` 断言 `reason` 的取值（`doc-root` ∥ `product` ∥ `out-of-jurisdiction` ∥ `manifest-state`），面判这一层因此判得出来。
- **写方 manifest 不可用是另一件事**：目标仓的 manifest 读不动只改面判（上一条）；写方（声明项目）的读不动让**写权表**不可判 ⇒ 判序 ②∥⑤ 拒（§2.2 第三句）。两者不共用一个判据，也不读对方的 manifest。

- **「写权表不可判」与「台账库开不了」是两格，不相交**：前者问「写方声明的什么」（输入 = `readManifest(W).ok`，出口 = 第三句）；后者问「这个根的账读不读得出来」（出口 = `no ledger can be read for this project`）。

- **本仓写（`R = W`）不落第三句，但会撞台账那一格**：`ledgerRowsOf` 取行集前先读该根 manifest（依据 `thincoder-core/agent/write-gate-ledger.mjs`「if (!man?.ok) {」），读不出则行集取不出 ⇒ 拒。故「本仓写不受影响」只指 ②∥⑤ 那一刀不砍它，不指放行。
**不新增回执**：盘上没有一条路把 `reason` 报给调用方——设计门在非 `product` 处 `continue`（`thincoder-core/agent/dispatch.mjs` 逐字 `if (faceOf(abs) !== "product") continue`），`thincoder-core/tools/doc-write-gate.mjs` 在 `reason !== "doc-root"` 时静默 `judged:false`。为一个内部面判结果造回执属另一件事，不在本批范围。

### 2.5 提示词面与工具面（同批落；语义即定稿，逐字由实施席落笔）

| 落点 | 改哪一处 | 改成什么意思 |
|---|---|---|
| `thincoder-core/tool-docs/manifest.md` | 键目录节的节点计数句 | `16 writable nodes` → `17`；`index's 7 sub-keys` → `8` |
| 同上 | 键目录，紧随 `index.publicRepos` 那一条之后新增一条 | 键 = `index.writableRepos`：本仓**可以写进去**的外部项目目录（从本仓根可解析）= 写权表。表内的目标 ⇒ 号取**本仓**在途行、账记在本仓；不在表内 ⇒ 写门拒并点名本表。与 `index.publicRepos` 不互派（读名单 ≠ 写名单） |
| 同上（登记：零改） | 写面白名单句 `or a sub-key of docRoot / index` | 写面白名单由 schema 派生 ⇒ 新子键入 schema 即自动可写，那句零改 |
| `thincoder-core/prompts/persona-engineering.md` | 台账节第 ⑥ 条（需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.8 ⑥ 的落点）段内追加一句 | 目标属另一个项目时：把该项目目录（或其祖先目录）写进**本仓** `index.writableRepos`；`project` 仍写本仓根，`ledger:"#N"` 仍取本仓在途行——账记在本仓，才看得出这一笔替哪条债干活 |
| `thincoder-core/prompts/discipline-engineering.md` | 「Docs & ledger repo-self-contained」第 6 条（`**Out-of-repo changes: two cases, split by this repo's index.writableRepos**`） | 改两分：目标在本仓 `index.writableRepos` 内 ⇒ **照写、记账在本仓**（§2.3）；不在表内 ⇒ 仍停下上报，由主 agent 另起一轮去那个仓处置 |
| 同上 | 同节**第 5 条**（`**Subagents write only this repo**`，条内含 `writing anything outside this repo … = **violation**`） | 条末补一句指针：「（表内目标见第 6 条——那是本条的唯一例外）」——第 5 条与本批第 6 条对同一读者（该档同进 eng-coder ∥ eng-designer 提示栈）给出相反指令：一处说项外写盘即违例、一处说表内照写；按用户 2026-11-09 裁「改第 6 条」（该裁所指的条 = 现第 5 条 `Subagents write only this repo`），该条其余字面零改 |

## 3. 受影响文件清单

| 文件 | 改什么 |
|---|---|
| `thincoder-core/manifest-schema.mjs` | `DEFAULT_MANIFEST.index` 加 `writableRepos: []`；`validateManifest` 加该键的数组层 fail-closed 一段 |
| `thincoder-core/declaration.mjs` | 声明投影加 `index.writableRepos`（经 `normalizePathList`）；新导出 `declaredWritableRoots(cwd)`（同 `declaredPublicRoots` 形） |
| `thincoder-core/conventions.mjs` | 转口 `declaredWritableRoots` 一行 |
| `thincoder-core/agent/write-gate-ledger.mjs` | 判据点源的选择（§2.2）+ 两条新拒文 + 第三句（表不可读，走 `ledgerUnreadableRefusal` 形）；② 支删掉「查无此行才拒」那条回落臂（改为无条件拒）；⓪ 支（声明取根失败 ⇒ 拒，先于表与号）；表可读性（`readManifest(W).ok`，既有件）落进 T 那一值；`ledgerGateTargets` 的 `execute` 一支挂 `fallbackDeclared`（`manifest` 整把不在入口集，该支随退场删）；旧串零改 |
| `thincoder-core/tool-docs/manifest.md` | §2.5 前两行 |
| `thincoder-core/prompts/persona-engineering.md` | §2.5 台账节第 ⑥ 条 |
| `thincoder-core/prompts/discipline-engineering.md` | §2.5 的两行都落：第 7 条改写 + 同节第 6 条条末例外指针（盘上两笔均已落） |
| `docs/core/design/MANIFEST.md` | 键面 §2.2 的 `index.writableRepos` 条——本批已落 |
| `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | §2.3（判据点来源 · 写盘七件行 · 定位参数优先 · `project` 何时被读 · 「一笔写跨两个项目」两处加「不带 `project`」限定 · 清单单位四形 + 基串枚举 + 跨仓两支 `<case>` 指针）∥ §2.3.1（窄口判序 · 「有根不看声明」限定为不带 `project` · 拒文表 · 第五条件 = 表**可读且为空**才开（表非空 ∥ 表不可读两种都不开））∥ §5 R30 / R33 / R34 / R35 ∥ §6 用例表末两行（定位参数优先 ⇒ 表外拒）∥ §7 各一条跨仓「例外一处」句 |
| `test/rtm/guard.md` | 故事 12 的 `12-17` 补一格（目标仓同号在途行仍拒）；新增 `12-18` ∥ `12-19`；节注态数同步 |
| `test/integration/batch-live-batch-lock.test.mjs` | `12-17` 补一格 + `12-18` ∥ `12-19` 新用例 |
| 本批单测档（与批档同名同目录，名字形 = `<docRoot.batches>/<批档名>.test.mjs`；随收口删除） | 本批新增：`declaredWritableRoots` 归一 · `validateManifest` 的 fail-closed · 判序 ①–⑥ 逐支（直调 `ledgerBindWriteConflict`）· 两条新拒文逐字 · `faceDetail` 三值 |
| `PROJECT-MANIFEST.json` | 本仓要真写外部仓时由主 agent 经 `manifest write` 声明（本批不改盘） |

**tier 结论**：**无 tier 跨界**——无目录迁移、无模块边界挪动；本批新增的唯一档是本批单测档（与批档同名同目录，随收口删除，不是常驻件）。`declaration.mjs` 的新导出经 `conventions.mjs` 转口一行，与既有 `declaredPublicRoots` 同形，不是第二套解析。

**尺寸越线两处（点名 + 分拆方向）**：两个档过 500（设计器硬线；读数住批档 §2）——各须给分拆方案，方向如下；最终切点与档名由执行那一批定（判据单源 = `docs/core/standards/CODE-TIER.md`）。

- `test/integration/batch-live-batch-lock.test.mjs`：按故事号分档——`12-` 一族用例搬新档，本档留其余故事。
- `thincoder-core/agent/write-gate-ledger.mjs`：判序独立成档（`ledgerGateTargets` 的判序 ①–⑥ 各支），表可读性与两条拒文留本档。

其余在表 source ∥ test 档现行读数未过 500——不提分拆；在表 `.md` 档（工具描述 ∥ 提示词 ∥ RTM）不受行数限制（口径单源 = `docs/core/standards/CODE-TIER.md`的「对象」行；逐档读数住批档 §2 的读数块）。

**核法**：上表每个 source ∥ test 档各按行数量一次（`doc_check` 的 `lines` 读数）；档位判据与失败侧单源 = `docs/core/standards/CODE-TIER.md`，本档不另写阈值。读数住批档 §2，不入本档。

**取面入口的实读坐标（两条，均本批零改）**：

```text
thincoder-core/tools/doc-write-gate.mjs : import { faceDetail } from "../agent/write-face.mjs"
                                          faceDetail(target).reason !== "doc-root"  → 不传 manifest；非 doc-root ⇒ judged:false
thincoder-core/agent/dispatch.mjs       : import { faceOf } from "./write-face.mjs"
                                          if (faceOf(abs) !== "product") continue   → 不传 manifest
```

两处都**不在本批的文件清单里**：`faceDetail` 本体零改，两个调用方本来就不传 `manifest`，本批对它们一字未动（§2.4 的三行面表因此是复核结论，不是改动）。

**`files` 域不判项目外路径（2026-11-09 实读）**

- **读法（可复跑）**：`grep -rn "files" thincoder-core/agent/write-gate.mjs` = 1 命中——就是 `batchRecordWriteConflict` 拒文里那句 `companion files`；写门这一档没有第二处提到它，也没有一处拿它当路径准据。
- 门体判的只两件：`claim.paths`（来自工具参数）与项目根（`thincoder-core/agent/write-gate-ledger.mjs` 的 `ledgerGateTargets` ∥ `ledgerBindWriteConflict`）。
- **消费 `files` 的符号 = 排期器，不是写门**：`thincoder-core/agent-tools/subagent-scheduler.mjs` 的 `normalizeFileList` / `filesOverlap` / `effectiveFiles`（调用方 = `thincoder-core/agent-tools/subagent-spawn.mjs` 的 `prepareScheduling`），用途 = 重叠文件的写串行；同档 `filesBlockOf` 把它写进子代理提示时逐字注明 `This list is not an authorization boundary`。
- 结论：spawn 的 `files` 列表是排期输入（重叠文件的写串行），不是授权边界。跨仓写在实施席那条路上不被它堵。

## 4. 关键决策记录

| # | 决策 | 理由 / 拒掉的备选 |
|---|---|---|
| KD-X1 | 键位 = `index` 第八子键 | 复用四处：归一枚（`normalizePathList`）、基数（项目根）、写面白名单派生、键目录派生。拒掉顶层新键：值形虽可复用，却把「声明族」这一族的口撕成两个 |
| KD-X2 | 判据点 = **写方声明**，不是目标仓的反向许可 | 用户原话（「不存在偷偷改……能提交就是允许他改」）。拒掉「目标仓 manifest 加 writers 白名单」：跨两仓协商，任一仓改不动就死锁；且真防线在 git 权限 |
| KD-X3 | 表内即授权 = **前缀包含**，项是**目录**不是仓 | 「目标仓不参与授权」的直接推论——不读它的 `.git` ∥ manifest 才谈得上不参与。拒掉「逐项验是个仓」：多一次 fs 探，还把非仓目录的合法目标挡在外面 |
| KD-X4 | 与 `publicRepos` **不互派** | 读与写是两种风险，一个键的变化不该顺带改另一个键的授权面。拒掉「单键带 `{read,write}` 两位」：键面从名单变成记录，两种授权面挤进一处 |
| KD-X5 | 「差一条声明」独立成一句拒文（只在 `no such row` 那一格） | 复现路径见 §2.2。拒掉「沿用 `row #N does not exist in this project's ledger`」：读它的人会去查号，而门这一格只验过 `R` 那一本账（§2.2 那一格的三件）|
| KD-X6 | 面判 = **目标仓自己的声明**，门禁与本地逐条相同 | 用户裁定「外部仓的文档面与本地一样对待」。理由 = **分类 ≠ 授权**：读目标仓 `docRoot` 只回答「属于哪一类」，放不放行仍只看写方 `writableRepos`，目标仓不获否决权、单向声明不受影响。代价 = 多一次目标 manifest 读（§2.4） |
| KD-X7 | 提示词与工具面**同批**落（D11） | 用户 17:10 令「记得提示词和工具面一起改」；落语义不落逐字终稿（实施席落笔） |
| KD-X8 | 表外 ⇒ 拒，**无条件**：删掉「查目标仓台账、查到就放行」那条臂 | 用户 2026-11-09 20:34 裁「这是替换不是兜底……不留兼容分支」。理由：台账号按项目各自编号，两仓重号常见，于是「目标仓账上有同号在途行」被读成「这是目标仓自己的批」——声明了写方也照样走得通目标仓那条路，与「只能走声明的那本账」相反。拒掉「保留回落、只在查无此行时拒」（旧口径）：它把授权问题变成一个号存不存在的问题，读拒文的人会去查号 |
| KD-X9 | 窄口的表前置只在 `tbl` **非空**时生效 | 用户裁的修法原文「表非空时……；表为空（未声明）⇒ 窄口维持现状」。理由：写盘七件里没有项目根的那一形，表为空时全程都在写方自己的账上判，没有「回落到目标仓」可删；而 2026-11-08 那一格（工作区根写盘、锚下一个子项目声明）是项目指南记录的启动形，未声明的项目不该被这一批打死。代价照写：同为「空表」，② 拒而 ⑤ 放——两格不是一回事（一格有另一本账可回落，一格没有） |
| KD-X10 | 窄口那一支另给一句拒文，不复用「目标属另一个项目」那句 | 那一支的 `R` 不存在，句头「target belongs to another project」不成立；一句里两个结论会让读的人改错一边。清单单位取 `unknown — no project owns this write's target`（与窄口既有 ④⑤ 同款：问题在目标与声明，不在号） |
| KD-X11 | 适用面 = 凡带定位参数、带 `project` 的写型入口（写盘七件 ∥ `execute` 的 `workdir`），不另立第二批 | 父侧 2026-11-09 20:40 裁：三处是同一个洞（带了 `project` 却仍去判目标仓的账），分两批收，第一批落地后洞仍开着，而读者会以为规则已经生效。拒掉「先收写盘七件、`execute` 另批」——留一处就是一处正确、一处仍旧；也拒掉「设计档写了规则、`ledgerGateTargets` 不挂 `fallbackDeclared`」——两处不一致比两处都没写更坏 |
| KD-X12 | `project` 给了而声明解析不出项目 ⇒ **拒**（判序 ⓪），不按「无 W」处置 | 用户 2026-11-09 裁（§1）。取不到写方根就没有表可读，判序随即落 ③ 按**目标仓自己的账**判——随手填一个不存在的 `project:` 就能把收窄声明作废。拒掉备选「静默按无 W 走」：那是一次不需要报告的授权失败。拒文沿用既有 `declared project is not a project` 形 |
| KD-X13 | 写方 manifest **读不出** ⇒ 表不可判（不是表为空） | 用户 2026-11-09 裁（§1 第二条）。`declaredWritableRoots` 对不可用 manifest 返回 `[]`，于是「未知」被读成「明确的空」：② 那句断言 `does not declare it`（把未知说成已知没有），窄口那一支开出去之后由台账格替它发声（拒文说「账读不到」，而该修的是 manifest）。可读性由 `readManifest(W).ok` 判（既有件）；外部目标拒、本仓写不受影响。**两格改前都拒**——本决策换的是发话的格与句子，不是放行与否（两读之差见 AC-16）。拒掉备选「复用第一句」：它断言 `does not declare it`，读不出时那是未知，读者会去加声明而不是修 manifest |

## 5. 验收对照（判据回指本档 §2.1 / §2.2）

| # | 验收条 | 判据形态（一个读者照着判得出做没做到） |
|---|---|---|
| AC-1 | R1 键面落地 | `DEFAULT_MANIFEST.index.writableRepos` 存在且为 `[]`；`MANIFEST_SCHEMA.nestedKeys.index` 含它。缺该子键的档 ⇒ `readManifest` `ok:true` + 补 `[]` + `missingKeys` 含 `index.writableRepos`。`writableRepos:"x"` ⇒ `validateManifest` `ok:false` 且 `errors` 点名该键；`["./a/","",7,"a"]` ⇒ 归一 `["a"]` |
| AC-2 | R2 解析层 | `declaredWritableRoots(<项目>)` 逐项 = `resolve(<项目根>, 声明项)`、去重保序；声明 `[]` ∥ 缺键 ⇒ `[]`；同一夹具上它返回的项序与 `declaredPublicRoots` 同基同序（两键同值声明时逐项相等） |
| AC-3 | R3 口子开 | 写方 `W` 声明目标目录、带 `W` 的**在途**号、`project:<W>` ⇒ 写放行且字节落盘；同夹具把号换成 `W` 的 `已核销` 行 ⇒ 拒且 `errors` 点名该状态词、目标字节零变（sha256） |
| AC-4 | R4 未声明照拒 + 目标仓零影响 | 目标属另一项目、`W` 有声明而表不含 ⇒ 拒——**无条件**，目标仓账上有没有这个号都拒；拒文含 `target belongs to another project and index.writableRepos` 与 `does not declare it`。**负向锁**：同夹具**不带 `project`** ⇒ 与本批前逐字同（`row #N does not exist in this project's ledger`）。目标仓台账 `query` 前后逐行相等（门不写目标仓账） |
| AC-5 | R4 零回归 | 未声明 / 缺键 `index.writableRepos` 的档：**同项目写（钉成 `R = W`：本笔不带 `project`，或 `project` 恰是目标自己的项目根）** · `bash` ∥ `memory` ∥ `execute` 声明支 · 工作区窄口（12-16 两格 + 12-18 第一格：表空 ⇒ 维持现状）逐条与改前等值；`manifest` 三动作不属本格——它整把不进本门（行 = 12-15，判据单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3）。写方树内另一个带 manifest 的项目**不在此格**（`R ≠ W`，见 AC-14） |
| AC-6 | R6 提示词 / 工具面同拍 | `thincoder-core/tool-docs/manifest.md` 含 `16 writable nodes` 与 `index's 7 sub-keys`（= 3 整键 + `docRoot` 6 子键 + `index` 7 子键；两个数字随 schema 变，以 `MANIFEST_SCHEMA` 为准，键目录单源 = `docs/core/design/MANIFEST.md` §2.2），键目录含 `index.writableRepos` 一条；`thincoder-core/prompts/persona-engineering.md` 台账节含 `index.writableRepos` 且带「本仓」归属句；`thincoder-core/prompts/discipline-engineering.md` 第 7 条含 `index.writableRepos`（表内照写 ∥ 表外停下上报两句都在档） |
| AC-7 | R7 外部仓面判与本地等同（复核、零改） | 外部仓（有 manifest，`docRoot.design` = `<仓>/docs/design`）：① `<仓>/docs/design/x.md` 为目标 ⇒ 单测缝上 `faceDetail(<目标>).reason` = `doc-root`，**设计门不问**（文档面 = 放行面，与本地同一处逐条相同），写门仍按 §2.2 ① 判本仓号 ⇒ 带本仓在途号放行；② `<仓>/src/x.mjs` 为目标 ⇒ `reason` = `product`，设计门按产品面拦：无活设计槽 ⇒ 拒，带活设计槽 ⇒ 过；③ 声明目录祖先链无 manifest ⇒ `reason` = `out-of-jurisdiction`（辖界不是面，设计门不管——该句 `reason !== "product"` 即 `continue`），写门仍判号。`W` 的 `docRoot` 改成什么都改不动这三条结果 |
| AC-8 | R1 边界：读 ≠ 写 | 夹具：本仓 `index.publicRepos:["../other"]`、`index.writableRepos` 缺键；`../other` 带 `PROJECT-MANIFEST.json`（与 AC-9 的 B 同款——新串的出现条件要求 `R` 有）；目标 `<..>/other/src/x.mjs`；本仓在途号 + `project:<本仓根>` ⇒ 拒，新串点名 `index.writableRepos`。同一夹具把 `../other` 挪进 `writableRepos` ⇒ 同一笔放行。两格放行结果不同即成立 |
| AC-9 | R1 边界：不推导 | 夹具：会话锚下两个带 manifest 的兄弟项目 A（本仓）∥ B，`index.writableRepos` 缺键；目标 `<锚>/B/src/x.mjs`；A 的在途号 + `project:<A>` ⇒ 拒（② 无条件拒——与 B 的账上有没有同号行无关 ⇒ 新串）。把 `<锚>/B` 写进 A 的 `writableRepos` ⇒ 同一笔放行；工作区窄口两格逐字零变 |

**核法（可跑）**：单测档与批档同名同目录、随收口删除（`<docRoot.batches>/<批档名>.test.mjs`）；集成面 = 故事 12 那一档。跑法逐字如下（已路线 = 批档 §2 的读数行）：

```text
node --test docs/batches/2026-11-09-writable-repos-containment.test.mjs
node --test test/integration/batch-live-batch-lock.test.mjs
```AC-6 的字面读法 = `node` 行扫三档（每串 ≥1 命中）。

**不传递不造夹具**（需求 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.4 ∥ AC-3）：门只读 `W` 的 manifest——`W` 声明了 B，B 的 manifest 里就算写了 C 也读不到；C 内的目标照 ② 走 B 的账，查不到本仓号 ⇒ 新串。

**其余七条验收（AC-10 – AC-16）**

| # | 验收条 | 判据形态（一个读者照着判得出做没做到） |
|---|---|---|
| AC-10 | 表外**无条件拒**（本批的要害） | 夹具 = 写方 `W` ∥ 另一个项目 `R`；在 `R` 的账里挂一条与 `W` 在途行**同号**的行。目标 = `R` 里的一份 `.mjs` 档、`project:<W>`、该号、`tbl` 不含 `R` ⇒ 拒，拒文含 `target belongs to another project and index.writableRepos` 与 `does not declare it`；**清单单位取第四形** `unknown — the declared project does not own this write's target`（与 `none` 互斥；四形单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 的四形条）；目标字节零改（sha256）。改前同一笔放行——两读不同即成立 |
| AC-11 | 窄口的表前置（三格） | 同一非项目目标（锚内、无项目根）· 同一条 `W` 在途号 · `project:<W>`：① 写方 `readManifest(W).ok` 为真 ∧ `index.writableRepos` 缺键或空 ⇒ 放行、字节落盘（现状不动）；② 表非空且不含该目标 ⇒ 拒，拒文含 `target is not covered by index.writableRepos of the declared project` 与 `the workspace-root opening does not apply`，清单单位 `unknown — no project owns this write's target`；③ 把该目标目录写进表 ⇒ 放行、字节落盘（放行由判序 ① 决定——表内目标不经窄口，窄口只剩两条不开臂：表非空（拒文表 ⑦）∥ 表读不出（拒文表 ⑧））。三格任一与上面写的不符即不成立 |
| AC-12 | 适用面：`execute` 带 `workdir` 指向表外另一项目 ⇒ 拒 | 夹具 = 写方 `W` ∥ 另一个项目 `R`（`R` 的账里挂一条与 `W` 在途行**同号**的行）；`execute({code, workdir:<R>, project:<W>, ledger:"#<W 在途号>"})`、`tbl` 不含 `R` ⇒ 拒，拒文含 `target belongs to another project and index.writableRepos` 与 `does not declare it`，**脚本零执行**。改前同一笔按 `R` 的账判（同号在途 ⇒ 放行、脚本执行）——两读不同即成立；把 `R` 写进 `tbl` ⇒ 同一笔放行、脚本执行 |
| AC-14 | 写方树内的嵌套项目（`R ≠ W`） | 夹具 = 写方 `W`，它树内另有一个带 manifest 的项目 `N`，`N` 的账上挂一条与 `W` 在途行**同号**的行；目标 = `N` 里的一份 `.mjs`、该号、`project:<W>`、`tbl` 不含 `N` ⇒ **拒**（判序 ②）。改前这一笔在 `N` 的账上查到同号行 ⇒ 放行——两读不同即成立；把 `N` 写进 `tbl` ⇒ 放行、号在 `W` 的账上判 |
| AC-15 | 声明解析不出项目 ⇒ 拒（判序 ⓪） | 夹具 = 写方 `W` ∥ 另一个项目 `R`（`R` 账上挂一条与 `W` 在途行**同号**的行）；`project:"<盘上不存在的路径>"` + 该号、目标 = `R` 里一份 `.mjs` ⇒ 拒，拒文含 `declared project is not a project` 与 `unknown — the declared project is not a project`；目标字节零改（sha256）。**改前这一笔落 ③、在 `R` 的账上查到同号行 ⇒ 放行**——两读不同即成立。两子格：`project` 指向在盘但不是项目的目录 ∥ 与会话锚无关键的目录 ⇒ 同一句 |
| AC-16 | 写方 manifest 读不出 ⇒ 表不可判（改的是**哪一格发话**，不是放行与否） | 夹具：写方 `W` 的 `PROJECT-MANIFEST.json` 是坏 JSON（`readManifest` 判 `invalid`）；目标 = 锚内一份**取不到项目根**的档、`project:<W>` + `W` 在途号 ⇒ 拒，拒文含 `the declared project's manifest is not usable` 与 `index.writableRepos cannot be read`，尾行 `(declared project's manifest unreadable — …)`，**不列在途清单**；目标零改。**改前同一笔也拒**：窄口开出后 `ledgerRowsOf(W)` 读同一份坏 manifest 失败，落 `no ledger can be read for this project` 加 `(ledger unreadable — …)`。判据 = **两读的句子不同**——改后那句点写权表与该修 manifest，改前那句把人引去查号。三子格：目标属另一项目 `R` ⇒ 拒且拒文是第三句，**不含** `does not declare it`（改前拒在第一句 `does not declare it`——那句当时不看表读不读得出，把未知说成已知没有；两读只差句子，拒与不拒相同；夹具的 `R` 账无同号行，挂一条则改前那一笔会放行，那一形见 AC-10）；目标在 `W` 自己树内（`R = W`）⇒ ②∥⑤ 不开火、第三句不出现，号照 ③ 判 `W` 的账（`W` 的 manifest 读不出会先撞台账可读性那句，见 §2.4）；`project` 缺位 ⇒ 表不参与，旧口径零改。**「放行 → 拒」的红格不在本格**，那是判序 ⓪（AC-15） |

**需求 ④ 的 AC-5**（同 workspace 未声明 ⇒ 用本仓的账写拒）由 AC-5 的 `R = W` 格与 AC-14 承接：前者证同项目写零回归，后者证嵌套项目不回落。

**承接行 = AC-9 的拒格**（另一半由 AC-8 的拒格承接：读名单不授权写）：两格判的是同一件事——授权只来自 `W` 自己的表。门读 manifest 的入口只有 `W` 一处（§2.3），故「B 声明了 C」与「B 什么也没声明」在门前不可区分，同一格即覆盖需求 AC-3 的断言。判据由这两格给出，不加维度、不加用例。

**第 3 条不加例外指针（理由）**：第 3 条讲的是**本仓的文档**不往别人仓里写（也不把事项登记到别人的账上），与第 7 条「写别人的目录、账仍记在本仓」不是同一件事。故只补第 6 条那处指针，第 3 条一字不动。

## 6. 用例表（正常 / 边界 / 错误）

| # | 场景 | 输入 | 预期 |
|---|---|---|---|
| T1 | 正常：外部项目带 manifest，已声明 | `writableRepos:["../other"]` · 目标 `<..>/other/src/x.mjs` · 本仓在途号 · `project:<本仓根>` | 放行，字节落盘；本仓台账该行仍 `在途`；`other` 仓台账零变 |
| T2 | 正常：外部目录**不带** manifest，已声明 | `writableRepos:["../plain"]` · 目标 `<..>/plain/x.mjs` · 本仓在途号 · `project:<本仓根>` | 放行（口子覆盖「目标取不到项目根」这一形） |
| T3 | 边界：声明的是目标仓的祖先目录 | `writableRepos:[".."]` · 目标 `<上一级>/other/x.mjs` | 放行（前缀包含成立）——声明方自己选的授权面，机制不缩 |
| T4 | 边界：兄弟目录名同前缀 | `writableRepos:["../other-fork"]` · 目标 `<..>/other/x.mjs` | 拒（新串）——`other` 不匹配 `other-fork`（后随 `/` 才成立） |
| T5 | 错误：号本身有问题 | 表已声明 · 号 = 本仓 `待核销` 行 | 拒，点名 `待核销`（先修号；声明表不参与） |
| T6 | 错误：差一条声明 | 目标属另一项目 · 本仓在途号 · `project:<本仓根>` · 表未含 | 拒，新串点名 `index.writableRepos` |
| T7 | 错误：口子不豁免号 | 表已声明 · 目标放行形 · 不传 `ledger` | 拒，含 `no ledger number on this call` |
| T8 | 边界：目标在本项目内、表也恰含它 | `writableRepos:["src"]` · 目标 `<本仓>/src/x.mjs` · 本仓在途号 | 按本项目判（`W = R`，声明表不参与；结果与改前逐字同） |
| T9 | 错误：声明值写坏 | `index.writableRepos:"x"` | `validateManifest` 拒、`readManifest` `reason:'invalid'` ⇒ **表不可判**：外部目标拒（第三句）、本仓写不受影响（AC-16）——不按「无声明」处置 |
| T10 | 正常：外部仓在册文档目录 | 外部仓 manifest `docRoot.design` = `<仓>/docs/design`；目标 = `<仓>/docs/design/x.md`；本仓在途号 | 面判 `doc-root` ⇒ 设计门不问（与本地同一处相同）；写门仍按 §2.2 ① 判号 ⇒ 带本仓在途号则放行、字节落盘 |
| T11 | 边界：声明目录不在任何项目内 | `writableRepos:["../plain"]`，`../plain` 祖先链无 manifest；目标 = `<..>/plain/x.md` | 面判 `out-of-jurisdiction` ⇒ 放行面，单测断言 `faceDetail(<目标>).reason` = 该值；写门仍判号（§2.2 ①） |
| T13 | 边界：表外，而目标仓账上有**同号**在途行 | 写方 `W` ∥ 另一个项目 `R`，`R` 的账挂一条与 `W` 在途行同号的行；`writableRepos` 不含 `R`；目标 = `R` 里的一份 `.mjs`；`project:<W>` + 该号 | 拒（第一句），目标零改——**改前这一格放行**，它断的就是那条回落臂 |
| T14 | 错误：窄口 + 表非空而不含目标 | 工作区根锚、目标为锚根一份非项目档；`writableRepos:["../elsewhere"]`；`project:<锚下一子项目>` + 在途号 | 拒（第二句），含 `index.writableRepos` 与 `the workspace-root opening does not apply`；清单单位 `unknown — no project owns this write's target`；目标零改 |
| T15 | 边界：窄口 + 表为空 | 同 T14，但 `writableRepos` 缺键（= `[]`） | 放行、字节落盘——表为空时窄口维持现状（2026-11-08 那一格不动） |
| T16 | 正常：窄口 + 表含目标 | 同 T14，`writableRepos` 含该目标所在目录 | 放行、字节落盘；号仍在写方账上判 |
| T17 | 错误：`execute` 的 `workdir` 指向表外另一项目 | `writableRepos` 不含 `R` · `execute({code, workdir:<R>, project:<W>, ledger:"#<W 在途号>"})` | 拒（第一句），脚本零执行——判序 ② 对定位参数支同样成立 |
| T20 | 错误：`project` 指向盘上不存在的路径 | 目标 = 另一项目 `R` 里一份 `.mjs`（`R` 账上挂同号在途行）· `project:"<不存在的路径>"` · `W` 的在途号 | 拒，含 `declared project is not a project`——⓪ 先于表与号；改前这一格在 `R` 的账上查到同号行 ⇒ 放行 |
| T21 | 错误：窄口 + 写方 manifest 读不出 | 工作区根锚、目标 = 锚根一份非项目档；写方 `W` 的 manifest 是坏 JSON（`index.writableRepos` 读不出）；`project:<锚下一子项目>` + 在途号 | 拒，含 `the declared project's manifest is not usable`，不列在途清单；**改前同一笔也拒**（窄口开出后 `ledgerRowsOf(W)` 读同一份坏 manifest 失败，落 `no ledger can be read for this project` 加 `(ledger unreadable — …)`），两读之差在句子——改后那句点写权表与该修 manifest，改前那句把人引去查号（同 AC-16） |
| T12 | 边界：目标仓 manifest **不可用** | 外部仓 manifest 是坏 JSON（`readManifest` 判 `invalid`）；目标 = `<仓>/docs/design/x.md` | 文档面根集空 ⇒ 产品面（单测断言 `faceDetail(<目标>).reason` = `product`）——不静默放行。**原形（manifest 只写 `version` / `phase`）造不出来**：`readManifest` 经 `fillDefaults` 从 `DEFAULT_MANIFEST` 起补，缺的 `docRoot` 子键被默认值补回（依据 `thincoder-core/manifest-schema.mjs`「缺键补默认值（module 设计 §2.2 管线）：顶层缺键补默认、嵌套键（docRoot/index）」）⇒ 那份档仍判 `doc-root` |

## 7. 边界（本批不做）

- 不做目标仓的授权面：不在目标仓加 `writers` ∥ 白名单 ∥ 任何反向声明。
- 不做目标仓记账：目标仓台账零写、批档零写。
- 不做仓库识别：不读 `.git`、不引 `realpathSync`、不做跨盘挂载解析。
- 不做依赖图 ∥ 环检测：授权表不是依赖边。
- 不加第三个面值、不改 `faceDetail` 的出辖口径：外部仓的面仍只有文档面 ∥ 产品面两种，出辖仍是辖界（§2.4）。
- 不给目标仓任何授权面：读它的 `docRoot` 只用于分类（§2.4）。
- 不改 `publicRepos` 的读面语义（列了写 ≠ 列了读；反之亦然）。
- 不加机械门要求「跨仓记录写清改了哪几份档」（§2.3 末条）。
- 不改 `index` 其余六子键、`docRoot` 族判据、号四情形、工作区窄口四条（只在其后**加**第五条件：表**可读且为空**才开——表非空 ∥ 表不可读两种都不开）。
- 不代主 agent 改本仓 `PROJECT-MANIFEST.json`；机制落地不等于本仓已声明外部目录。
- 不做跨仓批的收口结构改造：一个批仍只对应一本批档、一个仓。第一笔真正的跨仓批会暴露交付面、台账核销、回滚都按单仓假设写的——那是下一件事，本批只解决「能不能写 + 记哪本账」（需求 ③ 的同一条边界）。

## 8. UI / 交互决策

无 UI。交互面 = 拒文与工具描述，逐字形态见 §2.2 与 §2.5，**无未定项**。
每条拒文末句给下一步：新串给两件（差的是 `index.writableRepos` 那条声明 ∥ 号仍在**声明项目**的账上判），旧串一字不改。

## 9. 集成测试设计（对 `test/rtm/guard.md` 的增量）

实读：`test/RTM.md` 是索引页（`## 故事索引表`），用例行住 `test/rtm/*.md`；故事 12 在 `test/rtm/guard.md`，用例行按编号排列（`12-11` 已删）。

- **破的行 = 1 = `12-17`**（**修订**，不新开号）：它原断「表外 + 目标仓查无此号 ⇒ 拒」——本批把拒提到查号之前，**原格照样通过，但通过的理由变了**，故该行补一格输入「目标仓账上挂一条同号在途行」：改前那笔放行、改后仍拒；业务可观察结果这才判得出来。
- **未破的行**：`12-16` 断锚子树那一口子（表为空 ⇒ 第五条件不参与）、`12-5` 断「无声明写工作区根目标 ⇒ 拒」与「表空 + 子项目声明 ⇒ 放行」，两行都靠「表为空 ⇒ 窄口维持现状」成立；`12-3` 断号四情形，号判法零改。
- **冗余的行 = 0**：没有一行断言「目标属另一个项目时号必须取那个项目的账」——那条路由 `12-13`（声明 A 项目、号取自 B 项目）覆盖的是**号取错**，不是**目标属谁**，两者业务结果不同。
- **缺的行 = 1 = `12-18`**（故事 12 下一个空号）：交互 = `write` 工具 ↔ 窄口 ∧ 写权表的交集（目标不属任何项目时，判据点还收不收）。业务可观察结果 = 同一个非项目目标、同一条本仓在途号：表为空 ⇒ 字节落盘（现状）；表非空且不含它 ⇒ 拒并点名 `index.writableRepos`；表非空且含它 ⇒ 字节落盘。进入口 = 父侧 `write` 工具（工程模式 depth-0）。服务条目 = 需求档 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.4 末条（逐字「**目标无项目根时，写权表仍然是界**」）——与 `12-19` 同取需求条目。
- **故事 12 节注**：态数随 `12-18` ∥ `12-19` 增 2（十六 ⇒ 十八；读数住批档 §2 的读数行，本档不转录）。
- **落法**：编号先写进 `test/rtm/guard.md` 故事 12（`12-17` 补格、新增 `12-18` ∥ `12-19`），再写用例标题于 `test/integration/batch-live-batch-lock.test.mjs`。
- **套件规模**：本批新增 2 行（`12-18` ∥ `12-19`）、修订 1 行（`12-17`）。量法（可复跑）= 正则 `^\|\s*\d+-\w+\s*\|` 数 `test/rtm/*.md` 的用例行；读数住批档 §2，不复述进本档。

**本批 delta（适用面：`execute` 的 `workdir` 支）**

- **破的行 = 0**：故事 12 无一行断言「`execute` 带 `workdir` ⇒ 按目标仓的账判号」；`12-15` 断的是 `manifest` 三动作不进本门（那一行已随该裁定改写，记账在 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9 的 `manifest` 块）。
- **冗余的行 = 0**。
- **缺的行 = 1 = `12-19`**（故事 12 下一个空号）：交互 = 父侧 `execute` 工具 ↔ 写门 ↔ 写权表；业务可观察结果 = `workdir` 指向表外另一项目 ⇒ 拒且脚本零执行，写进表内 ⇒ 放行；进入口 = 父侧工具调用（工程模式 depth-0）；服务条目 = 需求档 ②.4「入口一刀切」句。
- **为什么另立一行、不并进 `12-17`**：入口不同（`execute` 对 `write`），可观察结果也不同（脚本有没有跑，对「文件字节零改」）——并进去，这个入口就在零断言下存在。
- **落法**：编号先写进 `test/rtm/guard.md` 故事 12，再写用例标题于 `test/integration/batch-live-batch-lock.test.mjs`。

**判序 ⓪ ∥ 表不可读的 delta（这两支的 RTM 答复）**

- **破的行 = 0**：无一行断言「`project` 解析不出时按目标仓的账判」或「写方 manifest 读不出时窄口放行」；`12-13` 断的是声明无效被拒（那一条目标不属任何项目），本批不动它的结论。
- **冗余的行 = 0**。
- **缺的行 = 0**：两支是同一道门的两次失败，业务可观察结果与 `12-17`（表外拒）同形——「本仓号写在别人仓里被拒」这条用户可见结果已有行；两文的判据由本档 §5 的 AC-15 ∥ AC-16 在单测缝上判——AC-15 带红格（改前那一笔放行、改后拒）；AC-16 两读只差句子（拒与不拒相同，改前也拒），不带红格。若要把「声明自证」做成常驻集成格，编号从 `12-20` 起——那是一条新行，由父侧裁。