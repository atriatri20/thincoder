/**
 * i18n-en-ledger.mjs — 控制台文案表·English·团队台账族（webui/LEDGER.md §3——KD-SV-51 拆表；team-ledger 批·台账 #1206）：
 * 域界 = 键二级前缀（`me.ledger.*`——`.one` 变体随基键）；门面 = `i18n-en.mjs`（八部件展开合体 + `Object.freeze`——`EN` 导出名不变）。
 * 键族 = 页题/筛选/六态/列头/空错态/详情与编辑弹窗/新建弹窗/行内动作/审计词面（四 kind ∥ 两面）；键序 = zh 表逐键对位。
 * 本档 = en 族（零 CJK——零 CJK 机检口径 `webui/I18N.md` §4 AC-14：扫描面按前缀排除 `i18n-zh*` ∥ `i18n-en*`）。
 */
export const EN_LEDGER = Object.freeze({
  // ── Page / table / modals (webui/LEDGER.md §2.1) ───────────────────────────
  "me.ledger.title": "Team ledger",
  "me.ledger.create": "New",
  "me.ledger.noWritable": "Join a project first",
  "me.ledger.filterRepo": "Repo",
  "me.ledger.filterRepoAll": "All repos",
  "me.ledger.filterStatus": "Status",
  "me.ledger.filterStatusAll": "All statuses",
  "me.ledger.filterOwner": "Owner",
  "me.ledger.filterOwnerPh": "Exact username",
  "me.ledger.filterClear": "Clear",
  "me.ledger.col.id": "ID",
  "me.ledger.col.repo": "Repo",
  "me.ledger.col.title": "Title",
  "me.ledger.col.status": "Status",
  "me.ledger.col.owner": "Owner",
  "me.ledger.col.updated": "Updated",
  "me.ledger.col.actions": "Actions",
  "me.ledger.aged": "Aging",
  "me.ledger.empty": "No ledger items yet",
  "me.ledger.emptyHint": "The team ledger is empty — click New to add one (shared with the team).",
  "me.ledger.emptyFiltered": "No items match the filters",
  "me.ledger.emptyFilteredHint": "Adjust the filters, or click Clear to reset.",
  "me.ledger.loadFailed": "Failed to load the ledger",

  // ── Six statuses (value = data value — ledger/LEDGER.md §3; unknown falls back to raw) ──
  "me.ledger.status.discuss": "Pending discussion",
  "me.ledger.status.design": "Pending design",
  "me.ledger.status.inflight": "In progress",
  "me.ledger.status.closeout": "Pending closeout",
  "me.ledger.status.closed": "Closed",
  "me.ledger.status.withdrawn": "Withdrawn",

  // ── Detail / edit modal (row click — detail always shown; edit only when canWrite) ──
  "me.ledger.detailTitle": "Ledger item",
  "me.ledger.detail.createdBy": "Created by",
  "me.ledger.detail.created": "Created",
  "me.ledger.detail.updated": "Updated",
  "me.ledger.detail.body": "Body",
  "me.ledger.editTitle": "Edit",
  "me.ledger.edit.repoLabel": "Repo (read-only)",
  "me.ledger.edit.titleLabel": "Title",
  "me.ledger.edit.bodyLabel": "Body",
  "me.ledger.edit.ownerLabel": "Owner",
  "me.ledger.edit.statusLabel": "Status",
  "me.ledger.save": "Save",
  "me.ledger.saved": "Saved",

  // ── Row actions (rendered only when canWrite; withdraw = non-native confirm + consequence) ──
  "me.ledger.close": "Close out",
  "me.ledger.closed": "Closed out",
  "me.ledger.withdraw": "Withdraw",
  "me.ledger.withdrawTitle": "Withdraw item",
  "me.ledger.withdrawConfirm": "Withdrawn items are no longer listed (the row is kept).",
  "me.ledger.withdrawSubmit": "Withdraw",
  "me.ledger.withdrawn": "Withdrawn",

  // ── Create modal (repo select = writable projects; owner defaults to yourself) ──
  "me.ledger.createTitle": "New ledger item",
  "me.ledger.create.repoLabel": "Repo",
  "me.ledger.create.titleLabel": "Title",
  "me.ledger.create.titlePh": "One line on what needs doing",
  "me.ledger.create.bodyLabel": "Body",
  "me.ledger.create.ownerLabel": "Owner",
  "me.ledger.create.ownerPh": "Blank = yourself",
  "me.ledger.create.submit": "Create",
  "me.ledger.created": "Item created",
  "me.ledger.titleRequired": "Title is required",

  // ── Audit vocabulary (`ledger_event` detail — four kinds × two surfaces; consumed by views-audit.mjs) ──
  "me.ledger.kind.create": "Created",
  "me.ledger.kind.edit": "Edited",
  "me.ledger.kind.close": "Closed out",
  "me.ledger.kind.withdraw": "Withdrawn",
  "me.ledger.surface.console": "Console",
  "me.ledger.surface.client": "Client",
})
