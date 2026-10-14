/**
 * i18n-en-core.mjs — 控制台文案表·英文·核件词面（webui/I18N.md §2.1——KD-SV-51 拆表；zh 档同源镜像）。
 * 域界/值源/门面口径 = `i18n-zh-core.mjs` 件头（单源）；en 面零 CJK（占位符与 zh 逐键一致）。
 */
export const EN_CORE = Object.freeze({
  // ── 工具卡词面（管理面 chat——console-chat-align 批；`agent/ADMIN-AGENT.md` §11） ──────────────────────
  "tool.running": "running…",
  "tool.initial": "Running…",
  "tool.truncated": "… (truncated at 64K — full text in history)",
  "tool.error": "error",
  "tool.done": "done",

  // ── 消息块与输入区词面（chat-shell-align 批——核件 `flow/block.mjs` ∥ `composer/*`） ────────
  "msg.user": "You",
  "msg.assistant": "ThinCoder",
  "input.placeholder": "Ask ThinCoder... (Shift+Enter for new line)",
  "input.busyPlaceholder": "Main session busy — Enter submit is restricted — you can keep typing",
  "input.interruptPlaceholder": "Interrupt — inject a message… (Enter to send, Esc to cancel)",
  "input.slotFull": "Task running — the queue is full (8 messages); wait for them to be processed before submitting again.",
  "queued.pending": "Queued — sent automatically, no interruption",
  "paste.unsupportedFormat": "Only png / jpg / gif / webp images are supported (got ${type})",
  "composer.attach.tooLarge": "File too large (max 256 KB): ${name}",
  "composer.attach.tooMany": "Too many text attachments (max 4): ${name}",
  "composer.attach.totalLimit": "Attachment total exceeds 512 KB for this turn: ${name}",
  "composer.attach.binary": "Not a text file (binary content): ${name}",
  "composer.attach.unsupported": "Unsupported file type: ${name}",
  "composer.attach.readFailed": "Could not read file: ${name}",

  // ── 斜径与控件行词面（chat-shell-align 批——核件 `composer/slash.mjs` ∥ `model-menu.mjs` ∥ `controls.mjs`） ──
  "slash.unknown": "Unknown command: ${name} (/help for available commands)",
  "slash.args": "This command does not take arguments here",
  "slash.help.label": "❯ Help",
  "slash.desc.model": "select model & manage providers",
  "slash.desc.new": "start a new chat",
  "slash.desc.help": "this list",
  "model.loading": "Loading models…",
  "model.filterPlaceholder": "Filter models…",
  "model.noMatch": "No models match",
  "model.addProvider": "+ Add provider…",
  "model.removeProvider": "− Remove provider…",
  "model.setKey": "API Key…",
  "model.noReasoning": "No reasoning",
  "model.noReasoningDesc": "Off (not supported)",
  "model.reasoning": "Reasoning",
  "reasoning.max": "Maximum",
  "reasoning.xhigh": "Extra High",
  "reasoning.high": "High",
  "reasoning.medium": "Medium",
  "reasoning.low": "Low",
  "reasoning.minimal": "Minimal",
  "reasoning.none": "Off",
  "reasoning.off": "Off", // 核件哨兵档（model-menu.mjs:394-395 无档模型取 "off" 字面——键面补足，免裸键外泄）
  "reasoning.enabled": "Reasoning",

  // ── 状态与兜底词面（chat-shell-align 批——同上消费面） ─────────────────────────
  "msg.copy": "Copy",
  "msg.copied": "Copied!",
  "toolbar.autoApprove": "Auto-approve tools",
  "toolbar.planDisabled": "Disabled in engineering mode — engineering already runs design-before-code",
  "auto.confirmText": "AUTO mode executes ALL tool calls — including file writes and shell commands — without asking for approval.",
  "auto.enable": "⚠ Enable AUTO",
  "auto.cancel": "Cancel",
  "status.thinking": "Thinking",
  "error.retry": "Retry",
  "workspace.required": "Open a folder first — ThinCoder needs a workspace to work in.",
  "workspace.requiredPlaceholder": "Open a folder to start…",
})
