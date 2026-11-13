/**
 * events-flags.mjs — 会话旗标的纯状态归约。
 * 页读、写回执与 ev:flags 共用 applyFlags；mode 是唯一工作模式状态。
 * 旧 engineering 只在 mode 缺席时读取迁移，不写回渲染状态。
 */

export const WORK_MODES = Object.freeze(["minimal", "normal", "engineering"])
const BOOLEAN_FIELDS = ["planMode", "autoApprove", "advisorGuard"]

/** 读取唯一 mode；旧布尔仅在 mode 键缺席时参与迁移。 */
export function modeOfFlags(flags, fallback = "normal") {
  if (flags !== null && typeof flags === "object" && Object.hasOwn(flags, "mode")) {
    return WORK_MODES.includes(flags.mode) ? flags.mode : fallback
  }
  if (flags !== null && typeof flags === "object" && typeof flags.engineering === "boolean") {
    return flags.engineering ? "engineering" : "normal"
  }
  return fallback
}

/** 对象读数同值判：同键同值时保留原引用，避免无意义重绘。 */
export function sameRecord(a, b) {
  if (a === null || typeof a !== "object" || b === null || typeof b !== "object") return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every((key) => Object.is(a[key], b[key]))
}

/** 写入一个会话的旗标切片；任一在册字段非法即整笔拒收。 */
export function applyFlags(state, key, flags) {
  if (flags === null || typeof flags !== "object" || Array.isArray(flags)) return state
  if (typeof key !== "string" || key === "") return state
  if (Object.hasOwn(flags, "mode") && !WORK_MODES.includes(flags.mode)) return state
  if (BOOLEAN_FIELDS.some((field) => Object.hasOwn(flags, field) && typeof flags[field] !== "boolean")) return state
  if (Object.hasOwn(flags, "engineering") && typeof flags.engineering !== "boolean") return state

  const record = {}
  for (const field of BOOLEAN_FIELDS) if (typeof flags[field] === "boolean") record[field] = flags[field]
  if (Object.hasOwn(flags, "mode") || typeof flags.engineering === "boolean") record.mode = modeOfFlags(flags)
  const table = state.sessionFlags ?? {}
  if (sameRecord(table[key], record)) return state
  return { ...state, sessionFlags: { ...table, [key]: record } }
}

export function onFlags(state, ev) {
  return applyFlags(state, ev?.key, ev?.flags)
}
