# 2026-10-14 · egress nft 探针 sudo 安全修复
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-14 · 来源 = 探针 #5 真机实证（2026-10-14 02:41）：建盒链③「出站闸下发失败（nft 探针，exit=1）：sudo: command: command not found」；台账 #1410。
> 台账 = #1410（server · 缺陷修）。前情 = 无（独立轮——轻通道缺陷修；姊妹轮 = 2026-10-14-quota-chattr-fix）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**笔 1 · egress nft 探针 sudo 安全修复 + 非零容忍（2026-10-14 02:4x——探针 #5 真机实证）**

- **披露（轻通道 · 判据②缺陷修）**：建盒链③恒败——`egress.mjs:254` 探针命令 `command -v nft` 为 **shell 内建**，sudo 前缀（`box.mjs:91` `sudo -S ${command}`）把它当二进制执行 ⇒ `sudo: command: command not found`（探针，exit=1）。
- **同根第二处**：探针未带 `allowNonZero`（`egress.mjs:245`）⇒ 即使 nft 真缺席也会抛，**iptables 备径 = 死码**——与档头：「`command -v nft` 探（无 ⇒ iptables 备径…）」的设计语义相抵。
- **改动**：`egress.mjs:254-255` 探针 = `sh -c 'command -v nft'`（sudo 安全）＋ `{ allowNonZero: true }`（缺席 ⇒ 备径）。
- **红绿对**：`docs/batches/2026-10-14-egress-probe-fix.test.mjs`——修前 L1（探针 exit=1 ⇒ 抛）∥ L2（裸内建开头）**双红** ⇒ 修后 **2/2 绿**；`node --check` 过。
- **波及**：闸下发探针面（nft 在场径行为不变；缺 nft ⇒ 备径由死码转活）；可 revert（单档一处）。

**补记（2026-10-14 02:5x · 父侧复跑发现）**：本笔连带随正旧档假件一处——`docs/batches/2026-10-13-sandbox-exec-rebuild.test.mjs:85` 假件按**旧探针命令**精确匹配（`command -v nft`），新形态（`sh -c &apos;command -v nft&apos;`）未认 ⇒ 该档 N65 腿红；已随正为新形态（行内注）。复跑该档 = **26/26 绿**（另含 E54 两处版本无关化随正——见 docker 轮 §1）。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>
## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**验证与收口（2026-10-14 · 父侧）**：① 验证 = 红绿对 2/2 ∥ `node --check` 过 ∥ 真机复证 = 探针 #6（.5 重建后）；② §2 = 不适用（缺陷修——沿既有设计语义）；③ 独立评审 = 待用户点火裁；④ §4 = 随报（用户在场）；⑤ 部署 = .5 重建 + 探针 #6；⑥ 台账 #1410——评审/批准落定后销行。
