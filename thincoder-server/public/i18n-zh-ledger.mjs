/**
 * i18n-zh-ledger.mjs — 控制台文案表·中文·团队台账族（webui/LEDGER.md §3——KD-SV-51 拆表；team-ledger 批·台账 #1206）：
 * 域界 = 键二级前缀（`me.ledger.*`——`.one` 变体随基键）；门面 = `i18n-zh.mjs`（八部件展开合体 + `Object.freeze`——`ZH` 导出名不变）。
 * 键族 = 页题/筛选/六态/列头/空错态/详情与编辑弹窗/新建弹窗/行内动作/审计词面（四 kind ∥ 两面）；键序 = 页内相对序。
 * 本档 = zh 族（唯一 CJK 载体——零 CJK 机检口径 `webui/I18N.md` §4 AC-14：扫描面按前缀排除 `i18n-zh*` ∥ `i18n-en*`）。
 */
export const ZH_LEDGER = Object.freeze({
  // ── 我的·团队台账（页 ∥ 表 ∥ 弹窗——webui/LEDGER.md §2.1） ─────────────────────
  "me.ledger.title": "团队台账",
  "me.ledger.create": "新建",
  "me.ledger.noWritable": "需先加入项目",
  "me.ledger.filterRepo": "仓",
  "me.ledger.filterRepoAll": "全部仓",
  "me.ledger.filterStatus": "状态",
  "me.ledger.filterStatusAll": "全部状态",
  "me.ledger.filterOwner": "负责人",
  "me.ledger.filterOwnerPh": "按用户名精确匹配",
  "me.ledger.filterClear": "清除",
  "me.ledger.col.id": "编号",
  "me.ledger.col.repo": "仓",
  "me.ledger.col.title": "标题",
  "me.ledger.col.status": "状态",
  "me.ledger.col.owner": "负责人",
  "me.ledger.col.updated": "更新",
  "me.ledger.col.actions": "操作",
  "me.ledger.aged": "老化",
  "me.ledger.empty": "暂无台账条目",
  "me.ledger.emptyHint": "团队台账为空——点「新建」记一条（登录后全队共享）",
  "me.ledger.emptyFiltered": "没有符合条件的条目",
  "me.ledger.emptyFilteredHint": "换一组筛选条件，或点「清除」复位",
  "me.ledger.loadFailed": "台账加载失败",

  // ── 六态词（值 = 数据值——ledger/LEDGER.md §3；枚举外原值兜底） ─────────────────
  "me.ledger.status.discuss": "待讨论",
  "me.ledger.status.design": "待设计",
  "me.ledger.status.inflight": "在途",
  "me.ledger.status.closeout": "待核销",
  "me.ledger.status.closed": "已核销",
  "me.ledger.status.withdrawn": "已废弃",

  // ── 详情/编辑弹窗（行点击——详情段恒显 ∥ 编辑段仅 canWrite） ────────────────────
  "me.ledger.detailTitle": "台账条目",
  "me.ledger.detail.createdBy": "创建者",
  "me.ledger.detail.created": "创建时间",
  "me.ledger.detail.updated": "更新时间",
  "me.ledger.detail.body": "正文",
  "me.ledger.editTitle": "编辑",
  "me.ledger.edit.repoLabel": "仓（不可改）",
  "me.ledger.edit.titleLabel": "标题",
  "me.ledger.edit.bodyLabel": "正文",
  "me.ledger.edit.ownerLabel": "负责人",
  "me.ledger.edit.statusLabel": "状态",
  "me.ledger.save": "保存",
  "me.ledger.saved": "已保存",

  // ── 行内动作（仅 canWrite 渲；撤回 = 非原生 confirm + 后果句） ───────────────────
  "me.ledger.close": "收口",
  "me.ledger.closed": "已收口",
  "me.ledger.withdraw": "撤回",
  "me.ledger.withdrawTitle": "撤回条目",
  "me.ledger.withdrawConfirm": "撤回后条目不再列出（行保留）。",
  "me.ledger.withdrawSubmit": "撤回",
  "me.ledger.withdrawn": "已撤回",

  // ── 新建弹窗（仓选单 = 可写项目；负责人缺省 = 自己） ────────────────────────────
  "me.ledger.createTitle": "新建台账条目",
  "me.ledger.create.repoLabel": "仓",
  "me.ledger.create.titleLabel": "标题",
  "me.ledger.create.titlePh": "一句话说清要做什么",
  "me.ledger.create.bodyLabel": "正文",
  "me.ledger.create.ownerLabel": "负责人",
  "me.ledger.create.ownerPh": "留空 = 自己",
  "me.ledger.create.submit": "新建",
  "me.ledger.created": "已新建条目",
  "me.ledger.titleRequired": "标题不可为空",

  // ── 审计面词面（`ledger_event` detail——四 kind ∥ 两面；views-audit.mjs 消费） ──
  "me.ledger.kind.create": "新建",
  "me.ledger.kind.edit": "编辑",
  "me.ledger.kind.close": "收口",
  "me.ledger.kind.withdraw": "撤回",
  "me.ledger.surface.console": "控制台",
  "me.ledger.surface.client": "客户端",
})
