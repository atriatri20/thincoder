# Desktop 输入区 · 需求

> 设计 = `docs/desktop/design/COMPOSER.md`。

## 1. 模型与档位

- **D6**：模型菜单按 provider 分组，选择单位是模型；候选来自当前可用渠道。
- effort 选项逐模型规格提供，会话槽保存 provider/model/effort。
- 显式改变模型时同拍写回 defaultModel；回声、切会话、自动回退和只改 effort 不触发写回。写失败可见且零乐观选中。

## 2. 素材

- **D13**：支持图片与当前文本/源码附件；类型、单档、数量和总量超限以及读取失败均明确提示。
- 文本附件按当前 `[Attached file]` 与 fenced 形式内联；图片按当前落盘/视觉降级路径，代码块复制可用。

## 3. 忙态与 slash

- **D25**：忙态按会话键入队，回执 queued；消费前不在消息流出块，待发送带可见。
- 步边界优先、回合尾和挂起 driver 兜底；满队拒绝并保留文本。附件随条目，消费时降级结果可见。
- **D34**：支持当前 model/auto/plan/minimal/normal/eng/help 与别名；/minimal 在 minimal↔normal、/eng 在 engineering↔normal、/normal 恒 normal；命令与对应按钮同一路径，未知命令不发送且保留文本。
