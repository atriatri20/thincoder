/** 状态行旗标段：PLAN/AUTO/ADVISOR 按布尔显示，MODE 显示三档当前值。 */
import { modeOfFlags } from "../events-flags.mjs"
import { t } from "../i18n.mjs"

export const BANNER_CODES = Object.freeze(["plan", "auto", "advisor", "mode"])
const FLAG_KEY = Object.freeze({ plan: "planMode", auto: "autoApprove", advisor: "advisorGuard" })

export function bannerSegments(flags) {
  const slice = flags !== null && typeof flags === "object" ? flags : {}
  const mode = modeOfFlags(slice, null)
  const out = BANNER_CODES.filter((code) => code !== "mode" && slice[FLAG_KEY[code]] === true && (code !== "plan" || mode !== "engineering"))
    .map((code) => ({ code, parts: [{ text: t(`status.banner.${code}`) }] }))
  if (mode !== null) out.push({ code: "mode", parts: [{ text: t("status.banner.mode", { mode }) }] })
  return out
}
