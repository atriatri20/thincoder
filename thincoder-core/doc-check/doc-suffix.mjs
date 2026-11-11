/**
 * doc-check/doc-suffix.mjs — **后缀兜底在本面的接线族**（判据本体不在这里）。
 *
 * 判据单源 = `docs/core/design/PATH-RESOLUTION.md` §2.8（「解得到就通，不判「你要的那一处」」）；
 * 分拆落点 = 归批档 §2 的机读清单。**只搬不改**：搬前搬后 `doc_check` 两模式报面与判决逐字相等。
 *
 * 三件（一件事一处，消费面 = `./anchors.mjs` 的三条抽取分支，只 import、零字面复制）：
 * ① `recordSuffix` —— `how:"suffix"` 的指针逐处进读数桶（`suffixHits`）。后缀证明「能定位」，不证明
 *    「是你想指的那个」——不标它就混进绿里（§2.8 护栏一：`report` 面出读数行 + 按 token 去重的清单）。
 * ② `quoteJudged` ∥ `sectionJudged` —— `引缺` ∥ `节缺` 断言的是「**那一份**档里有没有这一段 / 这一节」；
 *    多解（`multi`）时目标不定，就没有可断言的主语，两条都不判。拿代表处去判，仓里多一份同名档就会把
 *    一条正确的引文判红——与立题同一条病：判的是仓库，不是引用。
 * ③ **多解不进报面**：载荷里的 `multi` 只供 ② 取式——不列候选、不报数、不出一行（用户 2026-11-12 00:37）。
 *    本档不产任何行：它只回答「这一段判不判」，报面句形单源 = `./report-blocks.mjs`。
 */

/** 第 6′ 步解出来的指针逐处记账（`at` = `{file, line, token}`；`abs` = 层给的代表处，只作读数）。 */
export function recordSuffix(suffixHits, r, at) {
  if (r.how !== "suffix") return
  suffixHits.push({ ...at, abs: r.abs })
}

/** 引文面：多解不判（`引缺` 没有主语）；单解 ∥ 非后缀来源照判。 */
export const quoteJudged = (r) => r.multi !== true

/** 节在盘：多解不判（`节缺` 没有主语）；无节指示 ⇒ 也没有可判的节。 */
export const sectionJudged = (r, num) => num !== null && r.multi !== true
