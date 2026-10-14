/**
 * i18n-zh-core.mjs — 控制台文案表·中文·核件词面（webui/I18N.md §2.1——KD-SV-51 拆表）：域界 = 核件发射键（管理面 chat
 * 呈现面消费——`thincoder-render-core` 原键名，注册经 `setStrings`）；门面 = `i18n-zh.mjs`（六部件展开合体 + `Object.freeze`——`ZH` 导出名不变）。
 * 值逐字同 VSC locales（`thincoder-vscode/locales/zh.json`——单元测试档逐键相等断言，漂移即红）；slash 族/`model.*`/`reasoning.*`/`toolbar.*`/`auto.*` 随桌面表
 * （`thincoder-desktop/renderer/i18n-views.mjs` 同键逐字——VSC 无该族；两壳同词；唯一新撰键 = `slash.desc.new`）。
 * 本档 = zh 族（唯一 CJK 载体——零 CJK 机检口径 §6 AC-14 按前缀排除）。
 */
export const ZH_CORE = Object.freeze({
  // ── 工具卡词面（管理面 chat——console-chat-align 批；`agent/ADMIN-AGENT.md` §11） ──────────────────────
  "tool.running": "执行中…",
  "tool.initial": "执行中…",
  "tool.truncated": "…（已截断于 64K——完整文本在历史中）",
  "tool.error": "错误",
  "tool.done": "完成",

  // ── 消息块与输入区词面（chat-shell-align 批——核件 `flow/block.mjs` ∥ `composer/*`） ────────
  "msg.user": "你",
  "msg.assistant": "ThinCoder",
  "input.placeholder": "向 ThinCoder 提问...（Shift+Enter 换行）",
  "input.busyPlaceholder": "主会话处理中——Enter 提交受限——可继续输入",
  "input.interruptPlaceholder": "中断 — 注入消息…（Enter 发送，Esc 取消）",
  "input.slotFull": "主会话处理中——排队已满 8 条消息，请等其处理完成后再发送",
  "queued.pending": "待发送 · 不打断当前执行，自动发送",
  "paste.unsupportedFormat": "仅支持 png / jpg / gif / webp 图片（收到 ${type}）",
  "composer.attach.tooLarge": "文件过大（上限 256 KB）：${name}",
  "composer.attach.tooMany": "文本附件过多（每回合最多 4 个）：${name}",
  "composer.attach.totalLimit": "本回合附件合计超过 512 KB：${name}",
  "composer.attach.binary": "非文本文件（二进制内容）：${name}",
  "composer.attach.unsupported": "不支持的文件类型：${name}",
  "composer.attach.readFailed": "无法读取文件：${name}",

  // ── 斜径与控件行词面（chat-shell-align 批——核件 `composer/slash.mjs` ∥ `model-menu.mjs` ∥ `controls.mjs`） ──
  "slash.unknown": "未知命令：${name}（/help 查看可用命令）",
  "slash.args": "此命令在此不接受参数",
  "slash.help.label": "❯ 帮助",
  "slash.desc.model": "选择模型并管理渠道",
  "slash.desc.new": "新建会话",
  "slash.desc.help": "本清单",
  "model.loading": "加载模型…",
  "model.filterPlaceholder": "过滤模型…",
  "model.noMatch": "没有匹配的模型",
  "model.addProvider": "+ 添加 provider…",
  "model.removeProvider": "− 移除 provider…",
  "model.setKey": "设置 API Key…",
  "model.noReasoning": "不支持推理",
  "model.noReasoningDesc": "关闭（不支持）",
  "model.reasoning": "推理深度",
  "reasoning.max": "最大",
  "reasoning.xhigh": "很高",
  "reasoning.high": "高",
  "reasoning.medium": "中",
  "reasoning.low": "低",
  "reasoning.minimal": "最小",
  "reasoning.none": "关闭",
  "reasoning.off": "关闭", // 核件哨兵档（model-menu.mjs:394-395 无档模型取 "off" 字面——键面补足，免裸键外泄）
  "reasoning.enabled": "推理",

  // ── 状态与兜底词面（chat-shell-align 批——同上消费面） ─────────────────────────
  "msg.copy": "复制",
  "msg.copied": "已复制！",
  "toolbar.autoApprove": "自动批准工具",
  "toolbar.planDisabled": "工程模式下禁用——工程模式本身即先设计后编码",
  "auto.confirmText": "AUTO 模式将执行所有工具调用——包括文件写入和 Shell 命令——不再逐一确认。",
  "auto.enable": "⚠ 启用 AUTO",
  "auto.cancel": "取消",
  "status.thinking": "思考中",
  "error.retry": "重试",
  "workspace.required": "请先打开文件夹——ThinCoder 需要一个工作区才能开工。",
  "workspace.requiredPlaceholder": "请先打开文件夹…",
})
