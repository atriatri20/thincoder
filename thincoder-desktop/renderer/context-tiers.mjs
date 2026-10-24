/**
 * context-tiers.mjs — 上下文窗口 ∕ 最大输出 Token 的**常见档位**表 + 档位 `select` 构造（2026-10-10 · 模型参数能力批
 * 四轮 ∕ 五轮 · 用户裁定：「上下文窗口可以增加各下拉框，可以快速输入一些特定档位的参数，不然有些人输入会有点困难，
 * 还得看多少位数」+「下拉框要和别的统一样式」）。
 *
 * **形态 = 快填 `select` + 值持有 `input` 两件**（五轮改形 —— 原 `datalist` 废）：
 *   - `datalist` 的弹层由浏览器原生绘制，**CSS 无法着色** ⇒ 与全站 `select`（`renderer/beauty.css`
 *     `select { appearance: base-select }` + `::picker(select)` 卡形）不同族，用户裁定打回。
 *   - 改 `select` ⇒ 自动吃全站统一样式（零本档样式）；但 `select` 不能承载任意值，而上下文有大量
 *     **非整档实值**（`1_050_000` ∕ `1_048_576` ∕ `524_288`…）⇒ 故 **`select` 只当快填菜单、`input` 仍是
 *     唯一值持有者**：选档位 ⇒ 写进紧邻输入框；想填任意值 ⇒ 直接在输入框打字。两全且无新增状态
 *     （`select` 选完自复位 —— 它不持有值，重绘无「谁是真值」歧义）。
 *   - **配对不变量**：档位 `select` 恒为其值输入框的**紧邻后继兄弟**（`previousElementSibling` 解析 ——
 *     三处布局各不相同，靠邻接而非 id ∕ name 定位；id 在渠道表单两形间是重复的，不可用）。
 *
 * 单一来源（本档零第二副本）：消费面 = ①「编辑模型配置」弹窗（`views/settings-sections-modelparams.mjs`，
 * **token** 单位：上下文 ∕ 最大输出两字段）②渠道表单（`views/settings-controls.mjs`）与渠道行内 ctx 编辑态
 * （`views/settings-sections-providers.mjs`，**K** 单位）。
 *
 * 口径注（十进制 ∕ K 两族各自的**显示**约定）：token 档用**十进制**（`1_000_000` = `1M`，与 `contextKBadge`
 * 徽标口径一致——用户心智即「128K ∕ 1M」这类标称值）；K 档用 **K 本身**（`128` = 128K；核 `providerSpec`
 * 按 ×1024 换算 ⇒ `1024` 档 = 恰 1 MiB）。档位项文本 = `友好名 · 精确值`（选之前就看得到会填进什么）。
 * 纪律：零 DOM（描述符树）；零 `node:` ∕ 零裸包（渲染面静态闭包判据）；零 i18n 键（文案由调用面注入）。
 */

/** 常见上下文窗口档位（**token**；`label` = 下拉友好名，`value` = 精确数字）。 */
export const CONTEXT_TOKEN_TIERS = Object.freeze([
  { value: "32000", label: "32K" },
  { value: "64000", label: "64K" },
  { value: "128000", label: "128K" },
  { value: "200000", label: "200K" },
  { value: "256000", label: "256K" },
  { value: "512000", label: "512K" },
  { value: "1000000", label: "1M" },
  { value: "2000000", label: "2M" },
])

/** 常见最大输出档位（**token**）。 */
export const MAX_OUTPUT_TIERS = Object.freeze([
  { value: "8000", label: "8K" },
  { value: "16000", label: "16K" },
  { value: "32000", label: "32K" },
  { value: "64000", label: "64K" },
  { value: "128000", label: "128K" },
  { value: "256000", label: "256K" },
  { value: "384000", label: "384K" },
])

/** 常见上下文窗口档位（**K 单位** —— 渠道级字段口径；`1024` = 恰 1 MiB）。 */
export const CONTEXT_K_TIERS = Object.freeze([
  { value: "32", label: "32K" },
  { value: "64", label: "64K" },
  { value: "128", label: "128K" },
  { value: "200", label: "200K" },
  { value: "256", label: "256K" },
  { value: "512", label: "512K" },
  { value: "1024", label: "1M" },
])

/**
 * 档位 `select`（快填菜单）：首项 = 空值占位（`placeholder` 词由调用面注入 —— 本档零 i18n），
 * 余项 = 档位（文本 `友好名 · 精确值`）。`onChange` 由调用面挂（单一实现 = 出口族 `onPickTier` ——
 * 按「紧邻后继兄弟」不变量解析值输入框）。
 * @param {{tiers: readonly {value:string,label:string}[], className: string, label: string, placeholder: string, props?: object}} spec
 */
export function tierSelectNode({ tiers, className, label, placeholder, props = {} }) {
  return {
    tag: "select",
    props: { class: className, "data-tier-select": "", "aria-label": label, ...props },
    children: [
      { tag: "option", props: { value: "" }, children: [placeholder] },
      ...tiers.map((tier) => ({ tag: "option", props: { value: tier.value }, children: [`${tier.label} · ${tier.value}`] })),
    ],
  }
}
