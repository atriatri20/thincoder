/**
 * agent-tools/batch-skeleton.mjs — 批次档骨架模板 + 裁定锚 + 轮次块 + 段内容判据（KD-4 拆分档）。
 *
 * 本档是纯常量/纯函数单源（零副作用、零 fs）的**上半**：create 骨架模板（`batchSkeleton`）· 裁定行锚
 * （`VERDICT_PASS_LINE` / `VERDICT_CHANGES_LINE` / `verdictGapOf`）· 轮次块形态与计数
 * （`ROUND_HEADING_RE` / `countRoundBlocks` / `lastRoundBlock` / `nextRoundNumber`）· 状态行计划
 * （`statusResetPlan` / `statusPassPlan`）· 段内容判据（`sectionContentState`）∥ 「不适用」声明痕迹检测 ·
 * 档头台账行补编号（`appendLedgerNoToHeader`——与骨架的台账行同址：行形一处单源）。
 *
 * 下半（词表 / 段白名单 / 段头与状态行形态 / **段解析** / 状态行读写三件 / 段头区位置与计数三件）
 * 住 `batch-segment-vocab.mjs`，本档 import 消费并**原样再导出**——十个 `.mjs` 消费者的 import 行零改。依赖单向：
 * `batch-segment-vocab ← 本档 ← 其余批次档`（本档不 import 任何批次档上层）。
 *
 * 状态行解析（`readBatchStatusLine`）的判定字面住下半档：冻结门与 lifecycle（status/close 写入、
 * 在飞批扫描）消费**同一个解析器**——解析单源即 gate 与三 action 的判定字面零漂移。
 *
 * 段标题定位（`sectionHeaderRe`）同住下半档：append 段尾定位与 status/close 段头区状态行定位
 * 消费**同一个段头正则**——`## §N` 形态单源（`## §20` 不误命中 §2）。段解析本体
 * （`sectionBodyLines` ∥ `sectionHeaderZoneEntries`）随状态行读面同住下半档：段行集只有一份实现，
 * 本档按名 import 回来（复制一份 = 判据出现第二份字面）。
 *
 * F11-C：**骨架死占位枚举**（`TEMPLATE_PLACEHOLDERS`）与残留扫描纯函数（`findPlaceholderResidue`）
 * 住下半档——与骨架模板共址即判据不会与模板脱节；本档 `batchSkeleton` 仍是对外产出口。
 */
import {
  STATUS_LINE_RE, STATUS_WORDS, sectionHeaderRe, sectionBodyLines, readSectionStatusWord, zoneStatusCount,
} from "./batch-segment-vocab.mjs"

// 搬去 batch-segment-vocab.mjs 的导出名原样再出口（二十三个经新档 re-export 的名字之一族）——
// 既有 import 面（batch.mjs / batch-lifecycle.mjs / batch-read.mjs / batch-reopen.mjs / batch-gate.mjs /
// batch-closeout.mjs / design-token.mjs / advisor.mjs / batch-ledger-bind.mjs / ledger-close-proof.mjs）零改。
export {
  STATUS_WORDS, STATUS_WORD_ALIASES, SEGMENT_BY_ROLE, SEGMENT_BY_ROLE_NORMAL, DEPTH0_SEGMENTS,
  STATUS_LINE_RE, sectionHeaderRe, isBatchRecord, TEMPLATE_PLACEHOLDERS,
  findPlaceholderResidue, placeholderResidueError,
  readBatchStatusLine, updateSectionStatusLine, readSectionStatusWord,
  zoneStatusLines, zoneStatusCount, firstZoneStatusLineRange,
  reviewWritableSegment, sectionThreeDesignTrackError,
} from "./batch-segment-vocab.mjs"

/**
 * 轮次块标题形态（**写面与读面的单源正则**）：§3 的轮次块只由工具戳
 * `### 轮次 N（评审子代理）` 标题——写入面 `batch-record-write.mjs` 丢弃调用方自带的同名行、按本形态计数
 * 生成 N；读面（结算写块前取 N、写后回读点数）读同一形态。两份正则必漂，故只留这一处
 * （`docs/core/design/ADVISOR-GUARDS.md` §1.2 判据 2）。`### 轮次与发现（…）` 骨架行不匹配。
 */
export const ROUND_HEADING_RE = /^### 轮次 \d+（评审子代理）/

/**
 * §N 段内轮次块计数（纯函数 · 零 fs）：段体逐行测 `ROUND_HEADING_RE`。段头缺失 ⇒ 0。
 * 消费点两处、同一形态：`batch-record-write.mjs`（写入面生成下一轮 N）∥ `design-token.mjs`
 * （结算写块前取 N、写后回读确认这一块真落进了 §3）。
 * @param {string} src — 批档全文
 * @param {number|string} [seg] — 段号（缺省 3——轮次块只落 §3）
 * @returns {number} 段内轮次块数
 */
export function countRoundBlocks(src, seg = 3) {
  if (typeof src !== "string") return 0
  const lines = sectionBodyLines(src, seg)
  if (lines === null) return 0
  return lines.filter((l) => ROUND_HEADING_RE.test(l)).length
}

/**
 * §N 段内**最后一个轮次块的文本**（纯函数 · 零 fs）：块首行 = 该 `### 轮次 N（评审子代理）` 标题行，
 * 块尾 = 段体末尾——本函数只取最后一块，故不需要「到下一块止」的切分（后随行都属该块）。
 * 消费面 = `§5` 写入门判据 2：「门所依赖的那个块，自己有没有说结论」（设计档
 * `BATCH-LEDGER-REVIEW-UNIFY.md` §2.6）。
 * **只切块、不判裁定**：裁定一律由两条既有锚判——`VERDICT_CHANGES_LINE`（本档）∥ `VERDICT_PASS_LINE`
 * （本档锚块），判定面不在这里。切块形态消费 `ROUND_HEADING_RE`
 * （与 `countRoundBlocks` / `nextRoundNumber` 同一份正则，不另写一套）。
 * @param {string} src — 批档全文
 * @param {number|string} [seg] — 段号（缺省 3——轮次块只落 §3）
 * @returns {string|null} 末块文本（含块首行）∥ `null`（段头缺失 ∥ 段内无块）
 */
export function lastRoundBlock(src, seg = 3) {
  if (typeof src !== "string") return null
  const lines = sectionBodyLines(src, seg)
  if (lines === null) return null
  let start = -1
  for (let i = 0; i < lines.length; i++) if (ROUND_HEADING_RE.test(lines[i])) start = i
  return start < 0 ? null : lines.slice(start).join("\n")
}

/**
 * 段内**下一轮**轮次号（`countRoundBlocks + 1` 的组合名——**不二次实现计数**）：写入面
 * （`batch-record-write.mjs` 的 `insertIntoSection` 盖戳 `### 轮次 N`）与打回重置（`statusResetPlan` 的留痕行
 * 「第 N 轮打回」）必须取同一个 N——各算一遍，将来改了 `ROUND_HEADING_RE` 就会一处变一处不变。
 * @param {string} src — 批档全文（写盘前）
 * @param {number|string} [seg] — 段号（缺省 3——轮次块只落 §3）
 * @returns {number} 本轮 N（1 起）
 */
export function nextRoundNumber(src, seg = 3) {
  return countRoundBlocks(src, seg) + 1
}

/**
 * 裁定行锚（**写入面与签发面共读一条正则**，2026-10-28 自 `design-token.mjs` 迁入）：打回重置
 * （`statusResetPlan`）判「本笔带不带打回裁定」，设计凭证裁定闸（`design-token.mjs` 的
 * `verdictGateFailure`）判「回执给没给打回」，两处读同一份锚形——锚只此一份，不复制到第二档、
 * 也不由两档各写一遍。四条锚（`_V_PRE` / `_V_SUF` / `VERDICT_CHANGES_LINE` / `VERDICT_PASS_LINE`）全住本档锚块——
 * 签发面、`§5` 写入门与通过置位经 import 同读，零复制（pass 锚迁入：置位判据住本档，留在签发面就要回 import 而成环）。
 * 本地化等价形（GitHub #32 / #14）：评审席用中文回执很常见，只认英文会让 pass 落成 `no-pass-line`、
 * 凭证永不签发；判据仍只认**整行逐字面**，不做「句中含『通过』」这类模糊匹配——那样会把「未通过」
 * 也放过（散文行内提及不触发）。
 * **两个中文分支的尾句号可省可带**（`结论：通过。` ∥ `VERDICT: 通过。` 同判 pass，打回侧同）：同一个锚、
 * 两条分支，对同一语义必须给同一结论——`VERDICT: 通过。` 判是而 `结论：通过。` 判否是锚内的不对称；
 * 打回侧缺它则 `结论：不通过。` 读成「无裁定行」⇒ `append §3` 误拒一笔真打回，且打回重置不触发。
 * 英文形不带句号（`VERDICT: pass。` 不认，与改前一致）；混合形（`**结论** = VERDICT: pass`）不是句号问题，
 * 是把两种写法混成第三种，仍不认。
 */
export const _V_PRE = "^[ \\t]*[*_`]*[ \\t]*"
export const _V_SUF = "[ \\t]*[*_`]*[ \\t]*$"
export const VERDICT_CHANGES_LINE = new RegExp(
  _V_PRE + "(?:VERDICT:[ \\t]*(?:changes-required|不通过。?|需修改。?)|结论[:：][ \\t]*(?:不通过。?|需修改。?|changes-required))" + _V_SUF, "mi")
/** pass 裁定行锚（与打回锚同处同形）：签发面 ∥ `§5` 写入门判据 2 ∥ 通过置位三处同读；`design-token.mjs` 原样再导出。
 *  两锚的组合序只住下面一个函数 `verdictGapOf`——三个消费面经它取值，谁也不自写一遍顺序。 */
export const VERDICT_PASS_LINE = new RegExp(
  _V_PRE + "(?:VERDICT:[ \\t]*(?:pass|通过。?)|结论[:：][ \\t]*(?:通过。?|pass))" + _V_SUF, "mi")

/**
 * 裁定读数（**判据单源**——设计档 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.6.1）：值域四格 =
 * `null`（说了 pass）∥ `「无裁定行」` ∥ `「VERDICT: changes-required」` ∥ `「两者同携」`；判定序
 * **先打回、后 pass**（两行同携 ⇒ 判打回——同一份回执在两个面上不能结论相反）。
 * 三个消费面同读这一个函数，各自只做自己那一层的映射，不再各写一遍组合序：
 *  - `§5` 写入门判据 2（`batch-closeout.mjs` 的 `lastRoundVerdictGap`）——原样取四格；
 *  - `append §3` 写入闸（`batch-record-write.mjs`）——只拒 `「无裁定行」` ∥ `「两者同携」`，判打回的一笔照写；
 *  - 签发面（`design-token.mjs` 的 `verdictGateFailure`）——四格映回它原有的两个词
 *    （`changes-required` ∥ `no-pass-line`），对外说法零改。
 * 入参是**文本**而不是块：写面手上是「本笔净化后正文」，落档的就是它（每笔 `§3` 自成一块）——为复用切块
 * 函数把未落盘文本伪装成块，会把「段内无块」的 `null` 语义带进写面。
 * @param {string|null|undefined} text — 一段文本（本笔净化后正文 ∥ 末块正文 ∥ 评审回执）
 * @returns {string|null} 上方四格之一；非串 ⇒ `「无裁定行」`（无文本即无裁定，fail-closed）
 */
export function verdictGapOf(text) {
  if (typeof text !== "string") return "无裁定行"
  const changes = VERDICT_CHANGES_LINE.test(text)
  const pass = VERDICT_PASS_LINE.test(text)
  if (changes) return pass ? "两者同携" : "VERDICT: changes-required"
  return pass ? null : "无裁定行"
}

/**
 * 打回即重置的计划形（**纯函数 · 零 fs**；`batch-record-write.mjs` 与 `insertIntoSection` 在同一笔写盘里消费）。三合取全中
 * ⇒ `{ roundN, statusValue, traceLine }`，否则 `null`（零写 = 零回归）：① 本笔写 §3；② 本笔**净化后**正文命中
 * 打回裁定行（`VERDICT_CHANGES_LINE` 单源）；③ 写这一笔之前 §3 **段头区**状态行 = `STATUS_WORDS[3].done`
 * （**取词表，不写死字面**——写死则词表一改这条判据静默失效；读区与写面同一条定位面）。
 * 为什么必须机械：状态行是下游 `§5` 写入门 ∥ 收口门 ∥ 核销门③ 的唯一判据面；「评审记得把状态行改回去」
 * 是一条纪律，而纪律在打回那一轮最易漏。为什么第 ③ 条要「上一轮 = done」而非无条件：§3 已是 `进行中`
 * （本来写着「评审未完成」）⇒ 重置无事可做，零写零留痕；顺序交接的批（首轮 pass）因此不误伤。
 * 状态行值 = 关键词 + 括注（**不新增第三态词**：词表零扩即读侧零改）；留痕行把「上一轮 pass 被这一轮推翻」
 * 留在 §3 段体——重置不等于清空，否则读档的人会以为从没评过。权威规格 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.5。
 * @param {string} src — 写盘前的档全文
 * @param {number|string} seg — 本笔的目标段号
 * @param {string} body — 本笔净化后正文（凭证已剥、伪造戳已丢）
 * @param {string} date — 留痕行的日期戳 `YYYY-MM-DD`（调用方取 `todayLocal`——日期口径只一处）
 * @returns {{roundN:number, statusValue:string, traceLine:string}|null}
 */
export function statusResetPlan(src, seg, body, date) {
  if (Number(seg) !== 3) return null
  if (typeof body !== "string" || !VERDICT_CHANGES_LINE.test(body)) return null
  if (readSectionStatusWord(src, 3) !== STATUS_WORDS[3].done) return null
  const roundN = nextRoundNumber(src, 3)
  const { open, done } = STATUS_WORDS[3]
  return {
    roundN,
    statusValue: `${open}（第 ${roundN} 轮打回）`,
    traceLine: `> 状态行重置：第 ${roundN} 轮打回（changes-required）· 上一轮状态行 = ${done} → ${open} · ${date}`,
  }
}

/**
 * 通过即置位（**纯函数 · 零 fs**；与 `statusResetPlan` 同签名同位置、同写面）= 「打回即重置」的对称另一半。三合取
 * ① 本笔写 §3 ② 净化后正文命中 `VERDICT_PASS_LINE` **且不命中** `VERDICT_CHANGES_LINE` ③ 写前 §3 **段头区**状态行
 * ≠ `STATUS_WORDS[3].done`（读区与写面同一条定位面——区外引述行不构成结论）⇒ `{ roundN, statusValue }`，否则 `null`。
 * 为什么必须机械：结算面（`design-token.mjs` 判据 2）读这一行，≠ 评审通过 就拒签——「评审记得补一次 `status`」是
 * 纪律，漏一次白跑一轮评审。为什么 ③ 与打回反向：打回要「上一轮 = done」（推翻已落的字），通过要「当前 ≠ done」
 * （补上没落的字）⇒ 两条计划天然互斥，不另立「同现即拒」判据面；② 排除打回行则因同携两行是自相矛盾的回执，签发面
 * 先打回后 pass ⇒ 同判打回（状态行与门同结论）。不写留痕行：块自己说了 pass，落进 §3 的块即记录（打回留痕是因为
 * 重置**抹掉**了一条已落的 pass）；`roundN` / `date` 无消费方，保留 = 同签名同形。权威规格 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.5。
 * @param {string} src — 写盘前的档全文
 * @param {number|string} seg — 本笔的目标段号
 * @param {string} body — 本笔净化后正文（凭证已剥、伪造戳已丢）
 * @param {string} date — 与 `statusResetPlan` 同签名（本方向无留痕行，不消费）
 * @returns {{roundN:number, statusValue:string}|null}
 */
export function statusPassPlan(src, seg, body, date) {
  if (Number(seg) !== 3) return null
  if (typeof body !== "string" || !VERDICT_PASS_LINE.test(body)) return null
  if (VERDICT_CHANGES_LINE.test(body)) return null
  if (readSectionStatusWord(src, 3) === STATUS_WORDS[3].done) return null
  return { roundN: nextRoundNumber(src, 3), statusValue: STATUS_WORDS[3].done }
}

/**
 * 正文写入同笔置完成词的计划形（**纯函数 · 零 fs**；`BATCH-RECORD.md` §4.12 ∥ §4.21 ∥ §7 D-BR43）：
 * `append`/`edit` 往 `§2`/`§5` 写入之后，同一笔把该段状态行置成它的完成词——`§2` ⇒ `设计完成`、
 * `§5` ⇒ `实施完成`。两态本就在 `STATUS_WORDS` 里（词表零扩），已是完成词则返回 `null`（幂等零写）。
 *
 * 只答 `§2` ∥ `§5`：`§3` 走上面两条裁定计划（`statusPassPlan` ∥ `statusResetPlan`——那条被动写不归本函数），
 * `§1`/`§4`/`§6` 没有完成词。
 *
 * 判空复用段内容判据 `sectionContentState`（排除空行 / 标题行 / 状态行 / 模板占位 /「不适用」行）：
 * 正文只有占位行或标题行 ⇒ 段仍是 `empty` ⇒ 状态行不动——把骨架占位当内容置成完成词，等于让
 * 「§5 写入门 ∥ 收口门 ∥ 核销门」读到一句没人写过的话。
 * 为什么必须机械：状态行是那三道门的唯一判据面，而「段属主记得回头调 `status`」是纪律，
 * 纪律在最忙的那一轮最先漏。
 * @param {string} src — 写入后的档全文（判的是这一笔写完之后的段内容）
 * @param {number|string} seg — 本笔的目标段号
 * @returns {{statusValue:string}|null} 要写的完成词 / 零写
 */
export function statusDonePlan(src, seg) {
  const n = Number(seg)
  if (n !== 2 && n !== 5) return null
  const { done } = STATUS_WORDS[n]
  if (readSectionStatusWord(src, n) === done) return null
  // 段头区两条状态行 ⇒ 该段的状态读不出来（§4.21.4「恰一条才可读」）：此时零写，与 `status` 面对同一
  // 前置的结论一致（`batch-lifecycle.mjs` 的 `STATUS_LINE_AMBIGUOUS_ERROR` 同样拒）。可复现路径 = 人手工
  // 文件写在 §2 段头区留下第二条 `**状态行**：` 行，随后该段 append —— 被动写若照写，会重写第一条并
  // 留下第二条，读侧仍判 null：写了一个读不出来的字，比不写更坏。
  if (zoneStatusCount(src, n) > 1) return null
  if (sectionContentState(src, n) !== "content") return null
  return { statusValue: done }
}


/**
 * 「不适用」声明行形态（**声明机制已退役**——2026-11-02 用户裁定封掉这条口子）：形 = `> 不适用：§N —— <理由>`，
 * 理由非空（`\S.*` = 至少一个非空白字符起头）；识别域 = §1 段体。退役后本正则只服务**痕迹检测**
 * （`malformedInapplicableLine`）：`§1` 里还写着声明行的人当场被拒并读到「这条路没有了」，而不是静默当作没写。
 * 删掉它，残留的声明行就成了一句无人过问的散文——写它的人不会知道自己抄的是一条已停用的路。
 */
const INAPPLICABLE_RE = /^>\s*不适用[：:]\s*§(\d+)\s*——\s*(\S.*)$/
/** 可声明的段号集 = **空集**（声明机制退役）：任何段都不得声明不适用——§2 设计 / §3 评审 / §4 批准 /
 *  §6 验证各段一律要有内容，§5 段号豁免不参与链门。清空这一个常量即达成判据：窄网（`INAPPLICABLE_RE`）
 *  与宽网（`INAPPLICABLE_PREFIX_RE`）之下，凡 `§1` 出现声明行都是非法行；段内容判据只剩「有内容 / 没内容」
 *  两态。旧的可读面函数与 `not-applicable` 分支已随本批删除——不另立「恒 false 的插座」，插座留着就会被
 *  重新接上。 */
export const INAPPLICABLE_SEGMENTS = []
/** §1 声明行的识别前缀（痕迹扫描的宽网——行首命中它即违规，不再区分形合规与否）。 */
const INAPPLICABLE_PREFIX_RE = /^>\s*不适用/

/**
 * 段内容判据**单源**（§4.18-A closeout chain gate 的判空口径；D-BR30 判据单源——**不许两套**；
 * §4.13 的 §6 旧判据 `sectionSixHasContent` 改由本谓词承担——§6 为唯一缺段时拒串仍取旧函数）。
 * 返回**两态**：`content`（段体至少一行非排除类）∥ `empty`。旧第三态 `not-applicable` 随声明机制退役
 * （2026-11-02：任何段都不得声明不适用 ⇒ 这条事实没有第二个满足面，判据只剩「有内容 / 没内容」）。
 * 排除类（判空依据——「标题在、正文零行」判空）：空行 ∥ 标题行（`^#{1,6}\s`）∥ `**状态行**：` 行 ∥
 * `<§N 模板占位：…>` 行 ∥ 「不适用」声明行（判空口径零改——那类行是停用机制的痕迹，本来就不算内容）。
 * 口径收正注：旧 `sectionSixHasContent` 对「只有子标题（`### …`）」判非空；本谓词按 §4.18-A 判空
 * （子标题属排除类标题行）——设计档 §4.18-A 明文收窄。
 * @param {string} src — 档全文
 * @param {number|string} seg — 段号（§1–§6；§1 恒 `content`——主 agent 自述段不设前置）
 * @returns {"content"|"empty"} 段内容两态
 */
export function sectionContentState(src, seg) {
  const n = Number(seg)
  if (n === 1) return "content"
  const lines = sectionBodyLines(src, n)
  if (lines === null) return "empty" // 段头缺失 = 空（骨架由 create 一次预写；缺失即无内容）
  return lines.some((l) => NONEMPTY_RE.test(l) && !EXCLUDED_LINE_RE.test(l)) ? "content" : "empty"
}

/** 非空白行谓词（空行排除）。 */
const NONEMPTY_RE = /\S/
/** 排除类行判据：标题行（`^#{1,6}\s`）∥ `**状态行**：` 行 ∥ `<§N 模板占位：…>` 行 ∥ 「不适用」声明行
 *  （空行由 NONEMPTY_RE 单独排除——四类合一次判定）。 */
const EXCLUDED_LINE_RE = /^#{1,6}\s|^\s*\*\*状态行\*\*[：:]|^<§\d+ 模板占位[：:]|^>\s*不适用/

/**
 * 声明行拒绝句（§4.18-A J3——**声明机制已退役**：`§1` 段体出现任何 `> 不适用` 行 ⇒ 拒）：
 * 拒文说清三件——声明这条路没有了 ∥ 每段各自要有内容（§5 豁免）∥ 点名违规行。
 * 措辞不再给「合法声明形」——给形 = 给一条可照抄的路，而本批封的正是这条路。
 * @param {string} line — 违规行原文
 * @returns {string} 完整拒绝句（调用方 throw new Error(...)）
 */
export function inapplicableDeclarationError(line) {
  return "batch: `不适用` 声明已停用（inapplicability declaration retired）— no declaration is accepted: " +
    "§2 / §3 / §4 / §6 must each carry content (§5 exempt). " +
    `Offending line: ${line}. Nothing was written.`
}

/**
 * §1 声明行机械扫描（链门前置判据——**出现即拒**，不静默）：识别域 = §1 段体。
 * 段号集 `INAPPLICABLE_SEGMENTS` 已清空 ⇒ `includes` 恒 false ⇒ 行首命中 `^>\s*不适用` 的每一行
 * （形合规与否一律）都是违规行，返回首个。本函数现在是**停用机制的痕迹检测器**，不是合法形校验器。
 * @param {string} src — 档全文
 * @returns {string|null} 首个声明行原文 / null
 */
export function malformedInapplicableLine(src) {
  for (const l of sectionBodyLines(src, 1) ?? []) {
    if (!INAPPLICABLE_PREFIX_RE.test(l)) continue
    const m = INAPPLICABLE_RE.exec(l)
    if (!m || !INAPPLICABLE_SEGMENTS.includes(Number(m[1]))) return l
  }
  return null
}

/**
 * §N 段内「`**状态行**：` 行存在性」判据（#422③——close 对无状态行档自建机读位的**采集面**：
 * 与 readBatchStatusLine 的「值可解析」正交——无行 ⇒ 可自建；有行而值不可解析 ⇒ 仍 fail-closed）。
 * 段界定消费 sectionHeaderRe（同单源——`## §20` 不误命中 `§2`）。
 * @param {string} src — 档全文
 * @param {number|string} seg — 段号
 * @returns {boolean} 段内是否存在形态匹配行（段头缺失同判 false）
 */
export function sectionHasStatusLine(src, seg) {
  const hdr = sectionHeaderRe(seg).exec(src)
  if (!hdr) return false
  const nextRe = /^## §\d/gm
  nextRe.lastIndex = hdr.index + hdr[0].length
  const next = nextRe.exec(src)
  const body = src.slice(hdr.index + hdr[0].length, next ? next.index : src.length)
  return body.split(/\r?\n/).some((line) => STATUS_LINE_RE.test(line))
}

/**
 * create 骨架模板（BATCH-RECORD.md §4.10 行为规格的**代码单源**——红线：模板只覆盖骨架与占位，不模板化内容）：
 * `## §1–§6` 段头（含职责署名）+ 档头 boilerplate（**两句形**：六段一段一作者句 + 每段只有一个作者句（作者对本段可 `append` 加内容 ∥ 可 `edit` 就地改，§4.10「档头两句」/ §4.19），加编制行 + 台账/前情指针行）+ §1 段内
 * **状态行**（gate 合法关键字「进行中」，**纯关键词、不带括注**——括注由主 agent 人工写；整行不含「已收口」
 * ——gate 已收口优先，骨架行不得携带冻结词）+ **§2 状态占位句**（由 §4.12 的被动写覆盖）+ 各段模板子标题占位。已知实参替换：date / topic / **source** / prev（§4.11 参数面 +
 * F11-B——source 必填、prev 入值过幂等剥前缀，归一化在 lifecycle 面）；`baseSha` = create 建档前取的**批起快照提交号**（全树快照，含未跟踪 ∥ 未提交的改动，建好挂
 * `refs/thincoder/baseline/<批档名>`）或「未取到（原因）」——两者都自动落 §1；`ledger` = **必填**（2026-10-27 起建档
 * 同拍建台账行——真实行号由绑定事务回填，永不落回 `#<编号>` 占位）；`board` 可选（未给 ⇒ 括注写 `—`——`board`
 * 是分类不是身份，不拒）。本批改形删除（F11-B）：旧 `# …（<BATCH-ID>）` 后缀与 `来源 = <讨论来源>` 占位实参化。
 * 模式取形（§4.16——普通模式变体**四处替换**、余行逐字同；`mode` 缺省 = "engineering"）：
 * ① 汇总行 §2/§5 标签；② `## §2` 段头；③ §2 状态占位句；④ `## §5` 段头。
 */
export function batchSkeleton({ date, topic, source, prev, baseSha, ledger = null, board = null, mode = "engineering" }) {
  if (typeof baseSha !== "string" || baseSha.trim() === "") {
    throw new Error("batchSkeleton: baseSha is required — pass the pre-create HEAD, or 未取到（<原因>） when git cannot supply it.")
  }
  const normal = mode === "normal"
  const designerSeat = normal ? "主 agent" : "eng-designer" // ① 汇总行 §2 标签 ∥ ② §2 段头
  const implementerSeat = normal ? "实施者：主 agent ∥ coder" : "eng-coder" // ① 汇总行 §5 标签 ∥ ④ §5 段头
  return [
    `# ${date} · ${topic}`,
    `> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（${designerSeat}）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（${implementerSeat}）· §6 验证与收口（父代理）。`,
    `> 每段只有一个作者：作者的段可 \`append\` 加内容、可就地改（\`edit\`）；非作者一概拒。`,
    `> 编制：主 agent · ${date} · 来源 = ${source}。`,
    `> 台账 = ${ledger ?? "#<编号>"}（${board ?? (ledger ? "—" : "<板块>")} · 归批）。前情 = ${prev}。`,
    "## §1 讨论（主 agent）",
    // §1 状态行骨架写**纯「进行中」**：括注由主 agent 人工写（§4.10）。骨架不产一个没有机制会清的假占位
    // ——`§2`/`§5` 的占位句会被 §4.12 的被动写覆盖，`§1` 的括注没有任何机制会清，留在每一本新档上就是
    // 一句陪着整批跑完的假话。
    `**状态行**：${STATUS_WORDS[1].open}`,
    `批起 sha = ${baseSha}`,
    "<§1 模板占位：本批条目 / 关键判据 / 授权口径>",
    `## §2 批次任务与设计（${designerSeat}）`,
    `**状态行**：（${normal ? "主 agent" : "eng-designer"} 写入时更新）`, // ③ §2 状态占位句
    // 空行分隔**不是排版偏好**：doc_check 的段判据把「相邻非空正文行」并成一段，三行相连就是一段 381 字
    // （> 300）——工具建出的每一本批档都会在自己的收口门里因 §2 占位而拒。占位行各自成段；
    // 单行自身也须留在 300 字以内（同一阈值）——往这句里加话之前先量一遍。
    "",
    "<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>",
    "",
    // 机读清单的**形单源**：写在这里、不落成真表——模板一旦落成真表，§2 在建档时就已算「有内容」，
    // ① 链门的「§2 真跑过」那一支就对工具建出的档永久失效（改前 §2 只有状态行与占位行，两者都在排除类里）。
    // 门 = `batch-tier-gate.mjs` 的 `assertTierPlan`：改动面里有**在盘码档**时就逐档核第三列读数
    // （缺行 ∥ 缺数 ∥ 与批起快照不符 ⇒ 拒）；有越线档时另核第二列方案。**缺这一块不算拒因**——
    // 拒的是「每个码档都缺它那一行读数」。
    // 一行一档、只列**代码档（源 ∥ 单测）**——`.md` 零行数义务不列（`docs/core/standards/CODE-TIER.md` §1）；
    // 本批自己的单测档（收口第 ③ 臂要求删净，到档位臂已不在盘）也不列。
    // 示例档用**在盘**的档：写一个不存在的档名，下一批照抄就必被自己的收口门拒。
    // 阈值语义不在本档复述（娘家 = `docs/core/standards/CODE-TIER.md` §2 ①；落步闭集 = `batch-tier-gate.mjs` 的 `STEP_WORDS`）。
    "<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>",
    "",
    "## §3 设计评审（评审子代理）",
    "## §4 用户批准（主 agent）",
    `## §5 实施记录（${implementerSeat}）`,
    "## §6 验证与收口（父代理）",
    "",
  ].join("\n")
}

/** 档头 `台账` 行识别形（行首 `>` + `台账` + `=`）——判定域 = **档头域**（档首至首个 `## §N` 段头前，
 *  与 F11-C 的死占位扫描同域：段体里引述的同一行不是档头行）。 */
const LEDGER_HEADER_RE = /^>\s*台账\s*=/
/** 台账编号枚（`#12` 形）；与模板占位 `#<编号>` 天然不同形（占位不是编号）。 */
const LEDGER_NO_RE = /#\d+/g
/** 档头缺行拒串（`attach` 的拒面之一——本动作只**延展**既有档头行，不造行：造行是 create 的事）。 */
const LEDGER_HEADER_MISSING_ERROR = "batch: the record has no `> 台账 = …` line in its header zone — attach only extends an existing header 台账 line and never creates one (creating a record, header included, is create's job). Fix the header by file edit first. Nothing was written."
/** 档头行无可接编号位拒串（既无 `#<编号>` 也无真编号——无处可接，不猜形）。 */
const LEDGER_HEADER_NO_SLOT_ERROR = "batch: the record's header 台账 line carries neither a ledger number nor the `#<编号>` placeholder — there is no slot to extend, and attach does not invent one. Fix that line by file edit first. Nothing was written."

/** 档头 `台账` 行定位（读写共用）：只认首个 `## §N` 之前的档头域；CRLF 的行尾单独留住。 */
function ledgerHeaderLineOf(src) {
  const lines = src.split("\n")
  const firstSection = lines.findIndex((line) => /^## §\d/.test(line))
  const limit = firstSection < 0 ? lines.length : firstSection
  const idx = lines.findIndex((line, i) => i < limit && LEDGER_HEADER_RE.test(line))
  if (idx < 0) return null
  const cr = lines[idx].endsWith("\r") ? "\r" : ""
  return { lines, idx, cr, text: cr ? lines[idx].slice(0, -1) : lines[idx] }
}

/** 号集合切分（读写共用）：第一个 `（` 起的括注组不参与，前置列表逐枚取 `#\d+`。 */
function ledgerNumberMatches(text) {
  const open = text.indexOf("（")
  return [...text.slice(0, open < 0 ? text.length : open).matchAll(LEDGER_NO_RE)]
}

/**
 * 档头 `台账` 行号集只读解析器（§2.17 `headerRows` 的单源）：与 `appendLedgerNoToHeader`
 * 共用 `ledgerHeaderLineOf` 与 `ledgerNumberMatches`，档头语法只此一份。无档头行 ⇒ 空集。
 * @param {string} src — 批档全文
 * @returns {number[]} 档头登记的台账行号（保持登记顺序）
 */
export function readLedgerHeaderNumbers(src) {
  if (typeof src !== "string") return []
  const header = ledgerHeaderLineOf(src)
  return header ? ledgerNumberMatches(header.text).map((m) => Number(m[0].slice(1))) : []
}

/**
 * 档头 `台账` 行补编号（设计档 §4.21.3「档头拆分的规则」——纯函数 · 零 fs）。
 * 行形 = `> 台账 = #a · #b（core · 归批）。前情 = …`；四条规则：
 *  ① **先剔括注组**：行内第一个 `（` 起整组不参与拆分——`·` 也是括注组内的分隔符（`core · 归批`），
 *    不剔就把它读成两枚编号。② **再拆编号列表**：括注组之前的串逐枚取 `#\d+`，其余段（空白 / 残留符）跳过、不据此拒。
 *  ③ **追加在列表尾**（新编号接在末枚之后），括注组位置不动。④ **已是列表成员** ⇒ 零写 + `already: true`（幂等）。
 * 档头仍带 `#<编号>` 死占位 ⇒ 占位**就地换成真编号**（这正是「把死占位换成真编号」的那条通道——F11-C 随之放行）。
 * @param {string} src — 档全文
 * @param {number} n — 台账行号（正整数）
 * @returns {{src:string, already:boolean, line:string}} 新全文 ∥ 是否已在列表（`already` ⇒ `src` 逐字未变）∥
 *  改写后的档头行原文（回执用；`already` 时为现形）
 */
export function appendLedgerNoToHeader(src, n) {
  const no = Number(n)
  if (!Number.isInteger(no) || no <= 0) {
    throw new Error(`batch: a ledger entry number is required to extend the header 台账 line — got ${JSON.stringify(n ?? null)}. Nothing was written.`)
  }
  const header = ledgerHeaderLineOf(src)
  if (!header) throw new Error(LEDGER_HEADER_MISSING_ERROR)
  const { lines, idx, cr, text } = header
  const open = text.indexOf("（")
  const preEnd = open < 0 ? text.length : open
  const pre = text.slice(0, preEnd)
  const nums = ledgerNumberMatches(text)
  if (nums.some((m) => Number(m[0].slice(1)) === no)) return { src, already: true, line: text }
  let next
  if (nums.length) {
    const last = nums[nums.length - 1]
    const after = last.index + last[0].length
    next = `${pre.slice(0, after)} · #${no}${pre.slice(after)}${text.slice(preEnd)}`
  } else if (pre.includes("#<编号>")) {
    next = `${pre.replace("#<编号>", `#${no}`)}${text.slice(preEnd)}`
  } else {
    throw new Error(LEDGER_HEADER_NO_SLOT_ERROR)
  }
  lines[idx] = next + cr
  return { src: lines.join("\n"), already: false, line: next }
}