/**
 * model-menu-labels.mjs — 模型菜单 provider 行的短显示名（纯件 · 零 DOM）。
 * 先例 = `model-menu.mjs` 原位两件（`:48` `PROVIDER_SHORT` ∥ `:55` `shortName`）：preset 的 desc 是给添加表单用的长注解
 * （键兼容说明等），菜单行要的是短名。
 */
export const PROVIDER_SHORT = {
  deepseek: "DeepSeek", kimi: "Kimi", "kimi-code": "Kimi Code", glm: "GLM", "glm-code": "GLM Coding",
  qwen: "Qwen", qwenplan: "Qwen Plan", minimax: "MiniMax", openai: "OpenAI",
  claude: "Claude", gemini: "Gemini", grok: "Grok", mistral: "Mistral",
  volcengine: "Volcengine", hunyuan: "Hunyuan", siliconflow: "SiliconFlow",
  openrouter: "OpenRouter", groq: "Groq",
}
export function shortName(provider, group) {
  return PROVIDER_SHORT[provider] || (group && group.length > 22 ? provider : group) || provider
}
