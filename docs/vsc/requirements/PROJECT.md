# VSC 产品定性（PROJECT）· 需求 — VSC 部分

> 部分 = **vsc**（`docs/vsc/`）；本档 = VSC 端产品定性与专有面需求（界面 / 入口 / 审批 / webview 形态 / 会话流时序）。
> 产品级定性与跨产品共享契约 = `docs/core/requirements/PROJECT.md`（切分规则见其 §5.2，本档不重述，D2）。

## 1. 总体定位

VS Code 扩展 = ThinCoder 产品族的独立产品之一（与 CLI 同级——关系与共享契约见 `docs/core/requirements/PROJECT.md`）。
本档登记**仅本端**的产品决策与需求：界面形态、宿主入口、审批面、webview 实现形态，以及 webview 面的待设计需求。

## 2. 本端产品决策（已定）

| 项 | 决策 | 备注 |
|---|---|---|
| 界面 | VS Code Webview（iframe） | HTML/CSS/JS，`postMessage` 通信——机制权威 = `WEBVIEW.md`（同层三档） |
| 入口 | `extension.mjs` → `activate()` | 标准 VS Code 扩展激活模式 |
| 宿主 API | VS Code Extension API | 零 npm 运行时依赖的宿主面（产品族定性 = `docs/core/requirements/PROJECT.md §2`） |
| LLM 调用 | 原生 `fetch` + SSE 流式 | OpenAI 兼容协议，支持 reasoning / thinking |
| 工具审批 | `autoApprove` 会话级槽位字段，默认 `false` | AUTO 按钮 / approve-all 翻转；agent 循环 live 读取，mid-turn 立即生效 |
| 模型能力 | 核规格表 + 端侧增补面（现体 = 核 `thincoder-core/model-specs.mjs`） | MODEL_SPECS 表由核维护，端侧仅 `reasoningEffortDefault` 增补面（preset 表权威 = CLI——见 core 档 C3） |
| Session 标题 | LLM 自动生成（首条消息后触发） | 失败静默降级为截断消息 |
| 协议 transport | 三协议均已实现 | 核 `thincoder-core/provider/**`（openai / anthropic / google——契约 = core 档 C4） |
| 模型选择 webview 形态 | hover flyout 子菜单 | 两级语义对齐 CLI（契约 = core 档 C5）；webview 无键盘导航 ⇒ 主下拉列 provider 行 + hover 弹出模型子菜单 |
| 安全边界 | 透明 + 默认保守 + 信任用户判断 | 不搞命令级沙箱；开启 AUTO 时弹一次性警告；审计靠 git + 聊天历史（不建独立审计日志）；prompt injection 防御 v2 再议 |
| Multi-root 策略 | 目标 = 所有文件夹对 Agent 可见 | 锚 = 显式选定并记忆（多根首开弹拍一次；未选定 ⇒ `folders[0]` 兜底 + 面板钮标「· 未选定」——用户知道限制）；单根/无工作区零变（`design/PROJECT-SWITCHER.md`） |
| 无工作区文件夹 | **拒启 agent + 明确提示**（不得静默回落 `process.cwd()`——快捷方式启动语义下 = VS Code 安装目录 ✗ 更新即清空）| 用户裁定「b，但是要给提示」；设计 = `design/PROJECT-SWITCHER.md` §4.1 |
| Webview 技术选型 | vanilla JS | 约 5000+ 行仍不值得引入框架；撑不住了再迁 |
| 国际化 | 中英双语 | `locales/en.json` + `locales/zh.json`；UI 文本集中 i18n 常量文件，webview 启动注入 |

## 3. 待设计需求：会话流时序对齐 CLI

> owning board = **webview 面**（panel/webview——P2 专有面）。

## 5. 越档面指针

> 越档面（**>500 行咨询线 / >800 行硬限**）的**处理记录与拆分规划单源** = `docs/vsc/design/VSC-DEBT.md`（本档不重述——D2）；判定句见 §6 **N-P3**（越档 ⇒ 结构拆分并保持对外缝）。本节的职责 = 指针一职。

## 6. 工程标准债

| # | 维度 | 标准 | 度量方式（判定句） |
|---|---|---|---|
| **N-P1** | 测试归册 | VSC 用例凡**单跑 >500 ms** 者一律归册（`slow(`——**纯别名**，随集成测试同跑，无拦截线）；`npm test`（单入口）全绿 | 逐例单跑读数 + `npm test`（单入口）全绿 |
| **N-P2** | 读数留档 | 慢例归册前后**逐例**单跑读数在案（例名 · ms · 处置），不作推断计数 | 读数表逐例一行（同例复跑两次读数均列） |
| **N-P3** | 体量硬限 | 产品树**任一档 ≤800 行**（`wc -l`）——**限源 / 测试文件**（纯 `.md` 文档档不入本判据——用户裁定 · `docs/core/design/DOC-DISCIPLINE.md` §3.7）；越档 ⇒ 结构拆分并保持对外缝（既有导出名 / 调用点零改） | 逐档 `wc -l` ≤800（源 / 测试文件）+ 既有用例零回归 |

