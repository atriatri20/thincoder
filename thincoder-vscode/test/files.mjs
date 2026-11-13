/**
 * files.mjs — 测试清单单一来源（`npm test` 单入口共用）。
 *
 * 单元档 = `test/<日期>-vsc-<主题>.test.mjs`（与本目录在册档同形）。
 * 与 `run.mjs` 的两道反查门互为一对：**在盘未登记 ⇒ 红**（盘上永不执行的档），**登记不在盘 ⇒ 红**
 * ——故建档与登记必须同一次落地。
 * 集成档 = 业务设立（窗口 50–100，索引 = 仓根 `test/RTM.md`），不在本清单。
 * 新增测试文件：在此登记。
 */
export default ["test/2026-10-19-vsc-reasoning-expanded.test.mjs", "test/2026-10-20-vsc-queue-band.test.mjs", "test/2026-10-20-vsc-subagent-think-label.test.mjs", "test/2026-10-21-vsc-nested-sub-label.test.mjs", "test/2026-10-21-vsc-stateword-flicker.test.mjs", "test/2026-11-06-vsc-settings-open-snapshots.test.mjs", "test/2026-11-06-vsc-settings-empty-no-write.test.mjs", "test/2026-11-06-vsc-settings-refill.test.mjs", "test/2026-11-06-vsc-turn-save-slots.test.mjs", "test/2026-11-06-vsc-settings-mask-face.test.mjs", "test/2026-11-06-vsc-live-tool-card.test.mjs", "test/2026-11-13-vsc-work-mode.test.mjs"]