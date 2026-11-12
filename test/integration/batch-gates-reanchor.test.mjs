/**
 * batch-gates-reanchor.test.mjs — 集成用例 14-1 ∥ 14-2 ∥ 14-3 ∥ 14-4 ∥ 14-5 ∥ 14-8 ∥ 14-13 ∥ 14-14
 * （RTM CLI 端故事 14「评审过、完成清单收口、重开回、被取代冻结」）。
 *
 * 判据原文 = `test/rtm/batch-ledger.md` 第 14 节；机制 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.5 / §2.6 /
 * §2.6.1 / §2.7 / §2.13 与 `docs/core/design/LEDGER.md` §10。**进入口 = 父侧工具面**（`batch` / `ledger` / `write`）——断言业务可观察结果
 * （拒 ∥ 写入、回执行、行状态、产品码可写性）。14-1 的第二支是 `§3` 写入闸（`R-G3`）：无裁定行的 `§3`
 * 在写的那一刻就拒，存量无裁定块仍由 `§5` 门报出来。
 *
 * 切点 = **这个决定由谁做**：本档八例的决定由**批档状态门**做（评审门 · 锚批门 · 收口漏列与 §1 同序 · 补关冻结 · 被取代冻结）；
 * 由台账行迁移规则做的六例在 `batch-gates-ledger.test.mjs`。共用夹具住同目录 `batch-gates-fixture.mjs`。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/batch-gates-reanchor.test.mjs`
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { ledgerTool } from "../../thincoder-core/ledger-tools.mjs"
import {
  REC, agentOf, cleanupTemp, ctx0, freshRecord, ledgerAdd, ledgerUpdate, makeProject, parent, pushToSettling, recOf, review, rowsOf, workOf,
} from "./batch-gates-fixture.mjs"

after(cleanupTemp)

test("CLI 14-1 无裁定行的 §3 写不进去（R-G3）；存量无裁定块仍拒 append §5（R-G2b）；补一块携 VERDICT: pass ⇒ 放行", async () => {
  const root = await freshRecord("14-1")
  const coder = batchTool(REC)
  const ctx = { depth: 1, agent: { ...agentOf(root, { designSlot: false }), _role: "eng-coder", _batchDoc: REC } }
  await assert.rejects(() => coder.execute({ action: "append", segment: "§5", text: "先写实现" }, ctx), (e) => /§5 append refused/.test(e.message))
  // ① 工具写一笔无裁定行的 §3 ⇒ 当场拒（R-G3）：字节零改、轮次号不消耗（块数不变）
  const before = readFileSync(recOf(root), "utf8")
  const blocksOf = (s) => s.split("\n").filter((l) => /^### 轮次 \d+（评审子代理）/.test(l)).length
  await assert.rejects(
    () => review(root).execute({ action: "append", segment: "§3", text: "方案可行，另附两条补记。" }, { agent: agentOf(root) }),
    (e) => /§3 append refused/.test(e.message)
      && e.message.includes("VERDICT: pass") && e.message.includes("VERDICT: changes-required")
      && /no round number was consumed/.test(e.message),
  )
  const afterRefusal = readFileSync(recOf(root), "utf8")
  assert.equal(afterRefusal, before, "拒写：档字节逐字节不变")
  assert.equal(blocksOf(afterRefusal), blocksOf(before), "拒写：轮次块数不变（N 未消耗）")
  // ② 存量无裁定块（夹具直写、不经工具）⇒ `append §5` 仍拒（R-G2b：门所依赖的那个块自己没说结论）
  writeFileSync(
    recOf(root),
    afterRefusal
      .replace("## §3 设计评审（评审子代理）\n\n轮次 1 的发现与结论。",
        "## §3 设计评审（评审子代理）\n**状态行**：评审通过\n\n### 轮次 1（评审子代理）\n\n存量块：只有散文，没有裁定行。"),
  )
  assert.match(readFileSync(recOf(root), "utf8"), /\*\*状态行\*\*：评审通过/, "夹具：状态词已过判据 1")
  await assert.rejects(
    () => coder.execute({ action: "append", segment: "§5", text: "先写实现" }, ctx),
    (e) => /last §3 round block carries no pass verdict/.test(e.message) && /块内裁定 = 无裁定行/.test(e.message),
  )
  // ③ 末块携 pass 裁定 ⇒ 两判据同过，写入
  await review(root).execute({ action: "append", segment: "§3", text: "结论：通过。\n\nVERDICT: pass" }, { agent: agentOf(root) })
  assert.match(await coder.execute({ action: "append", segment: "§5", text: "实现落地" }, ctx), /appended/)
})

test("CLI 14-2 §3 非 pass ⇒ close 拒，回执含 `§3 状态行 =`；§1 状态行字节不变", async () => {
  const root = await freshRecord("14-2")
  const before = readFileSync(recOf(root), "utf8").match(/\*\*状态行\*\*：.*/)[0]
  await assert.rejects(
    () => parent.execute({ action: "close", path: recOf(root) }, ctx0(root)),
    (e) => /§3 状态行 = （无状态行），须 = 评审通过/.test(e.message),
  )
  assert.equal(readFileSync(recOf(root), "utf8").match(/\*\*状态行\*\*：.*/)[0], before, "§1 状态行字节不变")
})

test("CLI 14-3 换会话不绕过锚批门：OPEN 拒并指回 batch close，CLOSED 且无槽会话放行；放弃边在 OPEN 档拒并点出退回出路", async () => {
  const root = makeProject("14-3")
  writeFileSync(join(root, "docs/batches/open.md"), "# 未收口批\n\n## §1 讨论（主 agent）\n**状态行**：进行中\n")
  writeFileSync(join(root, "docs/batches/closed.md"), "# 已收口批\n\n## §1 讨论（主 agent）\n**状态行**：已收口 2026-11-11\n")
  // 真 `ledger` 工具入口；ctx 里没有任何槽 / designId（= 换了一个会话）——换人不换门
  const ctx = { depth: 0, agent: { cwd: root, config: { agent: { engineering: true } } } }
  const pendingRow = (taskBook, title) => {
    const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title, task_book: taskBook, trigger: "归批", evidence: "工作完成证据" }, boundary: root })
    for (const status of ["待设计", "在途", "待核销"]) ledgerUpdate({ cwd: root, id, patch: { status }, boundary: root })
    return id
  }
  // 拒：未收口档下凭工作证据也不得单独结算
  const blocked = pendingRow("docs/batches/open.md", "未收口行")
  const blockedBefore = rowsOf(root).find((r) => r.id === blocked)
  await assert.rejects(
    () => ledgerTool.execute({ action: "close", id: blocked, status: "已核销" }, ctx),
    (e) => /批档未收口/.test(e.message) && /batch close/.test(e.message),
  )
  assert.deepEqual(rowsOf(root).find((r) => r.id === blocked), blockedBefore, "拒后整行不变")
  // 放：已收口档下同一无槽会话照旧可核销
  const id = pendingRow("docs/batches/closed.md", "合格行")
  const out = JSON.parse(await ledgerTool.execute({ action: "close", id, status: "已核销" }, ctx))
  assert.deepEqual(out, { id, status: "已核销" })
  assert.equal(rowsOf(root).find((r) => r.id === id).status, "已核销")
  // 放弃边：未收口档下不得直接放弃活跃行，拒文给两步出路
  const live = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "在途行", task_book: "docs/batches/open.md", trigger: "归批" }, boundary: root })
  for (const status of ["待设计", "在途"]) ledgerUpdate({ cwd: root, id: live, patch: { status }, boundary: root })
  await assert.rejects(
    () => ledgerTool.execute({ action: "close", id: live, status: "已废弃" }, ctx),
    (e) => /不得直接放弃活跃行/.test(e.message) && /先退回 待讨论/.test(e.message),
  )
  assert.equal(rowsOf(root).find((r) => r.id === live).status, "在途")
})

test("CLI 14-4 batch close 漏列在写档前拒绝；completed 点名在途行同笔结清，未动行改挂条件", async () => {
  const root = await freshRecord("14-4")
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  const idle = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "没动" }, boundary: root })
  ledgerUpdate({ cwd: root, id: idle, patch: { task_book: REC }, boundary: root })
  const work = workOf(root)
  const ctx = ctx0(root)
  const beforeDoc = readFileSync(recOf(root), "utf8")
  const beforeRows = rowsOf(root)
  await assert.rejects(() => parent.execute({ action: "close", path: recOf(root), completed: [], closeEvidence: "证据" }, ctx), /completed 漏列在途行/)
  assert.equal(readFileSync(recOf(root), "utf8"), beforeDoc)
  assert.deepEqual(rowsOf(root), beforeRows)
  assert.equal(ctx.agent._engDesignTokens, undefined)

  const msg = await parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence: "本批把活做完并结算" }, ctx)
  assert.equal(rowsOf(root).find((r) => r.id === work.id).status, "已核销", "点名行同事务两跳至已核销")
  assert.equal(rowsOf(root).find((r) => r.id === idle).trigger, "条件")
  const lines = msg.split("\n").filter((l) => l.startsWith("[ledger reanchor]"))
  assert.equal(lines.length, 2)
  assert.match(lines[0], new RegExp(`#${work.id} 「g」 在途 → 待核销 → 已核销`), `在途起点那行：${msg}`)
  assert.match(lines[1], /本批未动行 → 条件 1 行/)
  assert.doesNotMatch(msg, /默认推进|认领行只有两种终局/)
  assert.match(msg, /\[ledger consistency\] 一致（本批 2 行）/, "回执末尾恒带一致性读数")
})

test("CLI 14-5 status 写 §1 已收口与 close 同序：漏列拒；点名后同笔结清并用同一 closeEvidence", async () => {
  const root = await freshRecord("14-5")
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  const work = workOf(root)
  const ctx = ctx0(root)
  const beforeDoc = readFileSync(recOf(root), "utf8")
  const beforeRows = rowsOf(root)
  const args = { action: "status", path: recOf(root), segment: "§1", value: "已收口", completed: [], closeEvidence: "证据" }
  await assert.rejects(() => parent.execute(args, ctx), /completed 漏列在途行/)
  assert.equal(readFileSync(recOf(root), "utf8"), beforeDoc)
  assert.deepEqual(rowsOf(root), beforeRows)
  assert.equal(ctx.agent._engDesignTokens, undefined)

  args.completed = [work.id]
  args.closeEvidence = "本批把活做完并结算"
  const msg = await parent.execute(args, ctx)
  assert.match(msg, new RegExp(`#${work.id} 「g」 在途 → 待核销 → 已核销`), `两路同序、同一回执形：${msg}`)
  assert.equal(rowsOf(root).find((r) => r.id === work.id).status, "已核销")
  assert.match(rowsOf(root).find((r) => r.id === work.id).evidence, /^收口 \d{4}-\d{2}-\d{2}：本批把活做完并结算$/)
  assert.doesNotMatch(msg, /默认推进|认领行只有两种终局/)
})

test("CLI 14-8 §3 已 pass 后同批打回 ⇒ 状态行重置、§5 拒；补一块携 pass 裁定的轮次块后放行", async () => {
  const root = await freshRecord("14-8")
  const coder = batchTool(REC)
  const ctx = { depth: 1, agent: { ...agentOf(root), _role: "eng-coder", _batchDoc: REC } }
  // 第 1 轮：评审真写一轮 pass（工具盖戳 `### 轮次 1`）⇒ 状态行 = 评审通过
  await review(root).execute({ action: "append", segment: "§3", text: "首选方案可行。\n\nVERDICT: pass" }, { agent: agentOf(root) })
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  // 第 2 轮：同一批判 changes-required ⇒ 工具同笔重置状态行 + 本轮块首留痕
  await review(root).execute({ action: "append", segment: "§3", text: "复核发现一处缺陷。\n\nVERDICT: changes-required" }, { agent: agentOf(root) })
  const src = readFileSync(recOf(root), "utf8")
  const s3 = src.slice(src.indexOf("## §3"), src.indexOf("## §4"))
  assert.match(s3, /\*\*状态行\*\*：进行中（第 2 轮打回）/, "档面：§3 状态行字节（不经解析）")
  assert.match(s3, /> 状态行重置：第 2 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · \d{4}-\d{2}-\d{2}/, "重置留痕在档")
  // §5 拒面 = 门打印的解析词（不是带括注的整串），§5 字节不变
  await assert.rejects(
    () => coder.execute({ action: "append", segment: "§5", text: "先写实现" }, ctx),
    (e) => /§3 状态行 = 进行中，须 = 评审通过/.test(e.message),
  )
  assert.equal(readFileSync(recOf(root), "utf8"), src, "§5 拒后档字节不变")
  // 评审再 pass：判据 2 要末块自己携 pass 裁定 ⇒ `status` 单写不足以开 `§5`（末块仍是携 changes-required 的那一块）
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  await assert.rejects(
    () => coder.execute({ action: "append", segment: "§5", text: "实现落地" }, ctx),
    (e) => /last §3 round block carries no pass verdict/.test(e.message) && /块内裁定 = VERDICT: changes-required/.test(e.message),
  )
  // 再 pass = 追加一块携 `VERDICT: pass` 的轮次块（块落进 §3 即可）⇒ 放行
  await review(root).execute({ action: "append", segment: "§3", text: "缺陷已修，结论改为通过。\n\nVERDICT: pass" }, { agent: agentOf(root) })
  assert.match(await coder.execute({ action: "append", segment: "§5", text: "实现落地" }, ctx), /appended/)
})

test("CLI 14-13 全归档批补关：close / status 两路都冻结并落 §1 追记行、台账行不变；在途行或额外半状态照拒；check 前后读形翻转", async () => {
  // 夹具 = 开批现场的存量形：先正常收口结清行，再重开（已核销不回收）⇒ 档 open、行全归档。
  const archivedRecord = async (tag) => {
    const root = await freshRecord(tag)
    await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
    const work = workOf(root)
    await parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence: "本批做完了" }, ctx0(root))
    await parent.execute({ action: "status", path: recOf(root), segment: "§1", value: "进行中", note: "复核后重关" }, ctx0(root))
    return { root, work }
  }
  const TRACE = /\*\*补关记录\*\*：\d{4}-\d{2}-\d{2} · 行集全归档（1 行）· §3\/§4\/§6 未补写 · 操作者 = 主 agent/

  // ① close 补关：冻结 + §1 段尾一行追记，台账行字节不变，check 的 open-but-settled 读形消失
  {
    const { root } = await archivedRecord("14-13-close")
    const before = readFileSync(recOf(root), "utf8")
    const rowsBefore = rowsOf(root)
    assert.match(await parent.execute({ action: "check", path: recOf(root) }, ctx0(root)), /open-but-settled/, "补关前该读形在")
    const msg = await parent.execute({ action: "close", path: recOf(root), completed: [], closeEvidence: "工作已由台账承认，仅补冻结" }, ctx0(root))
    assert.match(msg, /\[ledger repair\]/, `回执出补关段：${msg}`)
    const after = readFileSync(recOf(root), "utf8")
    assert.match(after, /已收口/, "§1 状态行冻结")
    assert.match(after, TRACE, "档面留一行追记（不靠瞬时回执）")
    assert.equal(after.split("\n").length, before.split("\n").length + 1, "只追加一行（行数 +1）")
    assert.deepEqual(rowsOf(root), rowsBefore, "补关不改台账行")
    assert.doesNotMatch(await parent.execute({ action: "check", path: recOf(root) }, ctx0(root)), /open-but-settled/, "补关后读形消失")
  }

  // ② status 写 §1 已收口 走同一分流
  {
    const { root } = await archivedRecord("14-13-status")
    const msg = await parent.execute({ action: "status", path: recOf(root), segment: "§1", value: "已收口", completed: [], closeEvidence: "补冻结" }, ctx0(root))
    assert.match(msg, /\[ledger repair\]/, `status 路同分流：${msg}`)
    assert.match(readFileSync(recOf(root), "utf8"), TRACE)
  }

  // ③ 仍有在途行 ⇒ 不是补关，链门照拒
  {
    const root = makeProject("14-13-live")
    await parent.execute({ action: "create", path: REC, topic: "g", source: "集成夹具" }, ctx0(root))
    const work = workOf(root)
    const before = readFileSync(recOf(root), "utf8")
    await assert.rejects(
      () => parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence: "证据" }, ctx0(root)),
      (e) => /收口链未跑完/.test(e.message) && /Missing: /.test(e.message),
    )
    assert.equal(readFileSync(recOf(root), "utf8"), before, "拒面无字节变")
    assert.equal(rowsOf(root).find((r) => r.id === work.id).status, "在途", "台账零写")
  }

  // ④ 全归档但档头号不在账（额外半状态）⇒ 补关拒，逐项点名并指回 check
  {
    const { root } = await archivedRecord("14-13-extra")
    writeFileSync(recOf(root), readFileSync(recOf(root), "utf8").replace(/^> 台账 = #\d+/m, "> 台账 = #9999"))
    const before = readFileSync(recOf(root), "utf8")
    await assert.rejects(
      () => parent.execute({ action: "close", path: recOf(root), completed: [], closeEvidence: "证据" }, ctx0(root)),
      (e) => /补关被拒/.test(e.message) && /header-row-missing/.test(e.message) && /open-but-settled/.test(e.message)
        && e.message.includes('batch({action:"check"})'),
    )
    assert.equal(readFileSync(recOf(root), "utf8"), before, "拒面无字节变")
  }
})

test("CLI 14-14 对象已消失的批由 supersede 冻结：命名取代者、不伪造 §3/§4/§6；待核销结清、在途退回条件；四种拒面档账零改", async () => {
  // 现场形：一本 §5 空、永不实施的批，行 = 3 `待核销` + 8 `在途`（建档那一行也在途）。
  const liveRoot = async (tag) => {
    const root = await freshRecord(tag)
    const inFlight = []
    for (let n = 2; n <= 8; n++) {
      const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: `没做完 ${n}`, task_book: REC, trigger: "归批", evidence: "工作证据" }, boundary: root })
      for (const s of ["待设计", "在途"]) ledgerUpdate({ cwd: root, id, patch: { status: s }, boundary: root })
      inFlight.push(id)
    }
    const settling = [pushToSettling(root, "做完没结账 1"), pushToSettling(root, "做完没结账 2"), pushToSettling(root, "做完没结账 3")]
    writeFileSync(join(root, "docs/batches/succ.md"), "# 2026-11-11 · succ\n")
    return { root, inFlight, settling }
  }
  const { root, settling } = await liveRoot("14-14")
  const before = readFileSync(recOf(root), "utf8")
  const successor = "docs/batches/succ.md"
  const msg = await parent.execute({ action: "supersede", path: recOf(root), supersededBy: successor, completed: [], closeEvidence: "本批从未实施，由后继批接手" }, ctx0(root))
  const after = readFileSync(recOf(root), "utf8")
  // 档面：状态行（被取代）+ §1 段尾一行取代记录；§3 / §4 / §6 逐字节不变；此后 append 拒
  assert.match(after, /\*\*状态行\*\*：已收口 \d{4}-\d{2}-\d{2}（被取代）/, "状态行 = 已收口 <日期>（被取代）")
  assert.match(after, /\*\*取代记录\*\*：\d{4}-\d{2}-\d{2} · 由 docs\/batches\/succ\.md 取代 · 本批无实施记录（§5 未写）· §3\/§4\/§6 未补写 · 结算 3 行 · 改挂条件 8 行 · 操作者 = 主 agent/)
  assert.equal(after.split("\n").length, before.split("\n").length + 1, "档面只追加一行（除状态行外其余字节不变）")
  const cut = (s, seg) => s.slice(s.indexOf(`## ${seg}`), s.indexOf(`## ${seg}`) + 400)
  for (const seg of ["§3", "§4", "§6"]) assert.equal(cut(after, seg), cut(before, seg), `${seg} 字节不变（不补写）`)
  const coder = batchTool(REC)
  await assert.rejects(
    () => coder.execute({ action: "append", segment: "§5", text: "x" }, { depth: 1, agent: { ...agentOf(root), _role: "eng-coder", _batchDoc: REC } }),
    /已收口档不回改/,
  )
  // 台账：3 行结清为已核销（证据带收口前缀）；8 行退回待讨论并改挂条件（续启句入 resume_when，指针与执行者清空）
  const sentence = `原批 ${REC} 已收口，须另起批次接手`
  for (const id of settling) {
    const row = rowsOf(root).find((r) => r.id === id)
    assert.equal(row.status, "已核销", `#${id} 结清`)
    assert.match(row.evidence, /收口 \d{4}-\d{2}-\d{2}：本批从未实施，由后继批接手$/)
  }
  const retreated = rowsOf(root).filter((r) => r.status === "待讨论")
  assert.equal(retreated.length, 8)
  for (const row of retreated) {
    assert.equal(row.trigger, "条件")
    assert.equal(row.resume_when, sentence)
    assert.equal(row.task_book, null)
    assert.equal(row.executor, null)
  }
  assert.match(msg, /\[ledger supersede\] 被取代收口/, msg)
  assert.match(msg, /\[ledger consistency\] 一致/)
  assert.match(await parent.execute({ action: "check", path: recOf(root) }, ctx0(root)), /consistent = true/)

  // 四种拒面（各自档账零改）：取代者空白 ∥ 解不到 ∥ 指回本档 ∥ 行集全归档（指回 close / 补关）
  const { root: refuseRoot } = await liveRoot("14-14-refuse")
  const refuseBefore = readFileSync(recOf(refuseRoot), "utf8")
  const refuseRows = rowsOf(refuseRoot)
  const ctx = ctx0(refuseRoot)
  for (const [supersededBy, re] of [
    ["   ", /supersede refused \(successor\)/],
    ["docs/batches/2099-01-01-never-existed.md", /supersede refused \(successor unresolved\)/],
    [REC, /supersede refused \(self\)/],
  ]) {
    await assert.rejects(
      () => parent.execute({ action: "supersede", path: recOf(refuseRoot), supersededBy, completed: [], closeEvidence: "证据" }, ctx),
      (e) => re.test(e.message) && /Nothing was written\./.test(e.message),
      `拒面 ${JSON.stringify(supersededBy)}`,
    )
  }
  assert.equal(readFileSync(recOf(refuseRoot), "utf8"), refuseBefore, "拒面：档字节零改")
  assert.deepEqual(rowsOf(refuseRoot), refuseRows, "拒面：台账零改")
  // 全归档现场：先收口结行、再重开（已核销不回收）⇒ 档 open、行全归档 ⇒ 拒并指回 close
  const archivedRoot = await freshRecord("14-14-archived")
  await review(archivedRoot).execute({ action: "status", value: "评审通过" }, { agent: agentOf(archivedRoot) })
  const archivedWork = workOf(archivedRoot)
  await parent.execute({ action: "close", path: recOf(archivedRoot), completed: [archivedWork.id], closeEvidence: "本批做完了" }, ctx0(archivedRoot))
  await parent.execute({ action: "status", path: recOf(archivedRoot), segment: "§1", value: "进行中", note: "复核后重关" }, ctx0(archivedRoot))
  const archivedBefore = readFileSync(recOf(archivedRoot), "utf8")
  await assert.rejects(
    () => parent.execute({ action: "supersede", path: recOf(archivedRoot), supersededBy: "docs/batches/succ.md", completed: [], closeEvidence: "证据" }, ctx0(archivedRoot)),
    (e) => /supersede refused \(ledger supersede\)/.test(e.message) && /Use `close` \(all-archived records take the repair path/.test(e.message),
    "全归档 ⇒ 指回 close",
  )
  assert.equal(readFileSync(recOf(archivedRoot), "utf8"), archivedBefore)

  // completed 点名的正路：点名 1 条在途 ⇒ 它结清，其余 7 条退回
  const { root: namedRoot, inFlight } = await liveRoot("14-14-named")
  const named = inFlight[0]
  await parent.execute({ action: "supersede", path: recOf(namedRoot), supersededBy: successor, completed: [named], closeEvidence: "就这一条在本批做完了" }, ctx0(namedRoot))
  assert.equal(rowsOf(namedRoot).find((r) => r.id === named).status, "已核销", "点名那条结清")
  assert.equal(rowsOf(namedRoot).filter((r) => r.status === "待讨论").length, 7, "其余 7 条退回")
})
