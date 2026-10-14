/**
 * views-sandbox-volumes.mjs — 沙盒页·卷区件（webui/SANDBOX.md §2.1①；sandbox-volumes 批——台账 #1291）：
 * 数据卷表（名 ∥ 创建时间 ∥ 操作：删除——节点行展开内，容器区之后）∥ 删除确认窗（后果句——`confirmModal` 复用；
 * 在用卷 ⇒ 服务端 400 就地在窗内呈——窗不关可重试）∥ 展开懒加载（读败 ⇒ 行内人话——区级失败不掀页）+ 容器动作后随取
 * （页装配层 `reset`——首用即建：新卷随容器动作上表）。契约 = gateway/API.md §2.5 卷族两行；文案经 `t()`（`webui/I18N.md` §2.1）；
 * 渲染一律节点 + textContent（零拼串）。
 * 单元测试档直测面 = `createVolumeSection`（桩 ctx + 假 fetch 路由表）。
 */
import { mapError, t } from "./i18n.mjs"
import { confirmModal, submitThen } from "./modal.mjs"

/** 卷区段（缓存自持——展开懒加载；容器动作后页装配层 `reset` 重取）。 */
export function createVolumeSection(ctx) {
  const { h } = ctx
  const cache = new Map() // 节点 id ⇒ { volumes } ∥ { error }

  /** 区渲染（展开行内——容器区之后）。`reload` = 页数据重取 ∥ `refresh` = 立即重渲（页守卫展开态）。 */
  function area(runner, { reload, refresh }) {
    const box = h("div", { class: "stack-box" })
    const cached = cache.get(runner.id)
    if (cached === undefined || cached.loading === true) {
      if (cached === undefined) {
        cache.set(runner.id, { loading: true }) // 占位（两区并发重渲不重取）
        ctx.api(`/api/admin/sandbox/runners/${runner.id}/volumes`).then((data) => {
          cache.set(runner.id, { volumes: data?.volumes ?? [] })
          refresh()
        }).catch((error) => {
          cache.set(runner.id, { error: mapError(error) })
          refresh()
        })
      }
      box.append(h("p", { class: "hint", text: t("common.loading") }))
      return box
    }
    box.append(h("h4", { text: t("admin.sandbox.volumesTitle") }))
    if (cached.error !== undefined) {
      box.append(h("p", { class: "hint error", text: cached.error })) // 区级失败不掀页（B65——再展开重取可重试）
      return box
    }
    if (cached.volumes.length === 0) {
      box.append(h("p", { class: "hint", text: t("admin.sandbox.volumesEmpty") }))
      return box
    }
    const invalidate = () => { cache.delete(runner.id); reload() } // 失缓存重取 = 界面上新
    const headers = [t("admin.sandbox.name"), t("admin.sandbox.colCreated"), t("admin.sandbox.colActions")]
    const rows = cached.volumes.map((volume) => h("tr", {},
      h("td", { text: ctx.fmtValue(volume.name) }),
      h("td", { text: volume.createdAt ? ctx.fmtTs(volume.createdAt) : "—" }),
      h("td", {}, h("button", { type: "button", class: "tiny", text: t("admin.sandbox.remove"), onclick: () => openRemoveVolumeModal(ctx, { runner, volume, reload: invalidate }) }))))
    box.append(h("div", { class: "table-wrap" },
      h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...rows))))
    return box
  }

  /** 失缓存（容器动作后页装配层随取——§2.1①「容器动作后卷区随取」；首用即建 ⇒ 清单随动）。 */
  function reset(runner) {
    cache.delete(runner.id)
  }

  return { area, reset }
}

/** 删除卷确认窗（后果句「卷内数据一并消失」；在用卷 ⇒ 服务端 400 就地在窗内呈——窗不关可重试）。 */
function openRemoveVolumeModal(ctx, { runner, volume, reload }) {
  const { modal, note, confirmBtn } = confirmModal(ctx, {
    title: "admin.sandbox.volumeDeleteTitle",
    bodyText: "admin.sandbox.volumeDeleteConfirm",
    bodyParams: { name: volume.name },
    confirmText: t("admin.sandbox.remove"),
    submit: () => submitThen(ctx, {
      note, button: confirmBtn, modal, reload,
      call: () => ctx.api(`/api/admin/sandbox/runners/${runner.id}/volumes/${encodeURIComponent(volume.name)}`, { method: "DELETE" }),
      flash: t("admin.sandbox.volumeDeleted", { name: volume.name }),
    }),
  })
}
