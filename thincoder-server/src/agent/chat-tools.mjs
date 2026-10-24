/**
 * chat-tools.mjs — 管理面工具面八件（`agent/ADMIN-AGENT.md` §12 ∥ KD-SV-90/136；admin-agent-chat 批——台账 #1254）：
 * `members`（六动词）∥ `providers`（五）∥ `models`（六——`test` = 模型测试，model-test-tool 批；机制 = `agent/ADMIN-AGENT.md` §12.1）∥ `usage`（summary ∥ rows）∥ `audit`（query）∥ `runners`（list ∥ add ∥ remove ∥ revoke_credential）
 * ∥ `docker`（十动词——**绑定 = 注册节点**；未在册 ⇒ 工具级错误回灌）∥ `exec`（SSH——**绑定 = 主机表行**，本批——KD-SV-136；凭据 = 行密列，缺 ⇒ 工具级错误人话）。
 *
 * 口径（KD-SV-90）：**进程内直取域件**（零 HTTP 回环——KD-SV-82 延续）；**写链与控制台路由同函数**（provider 写面 = `gateway/provider-admin.mjs`
 * 共享写函数 ∥ 成员重置链 = `accounts/members.mjs` 的 `resetMemberPassword` ∥ 节点删除链 = `sandbox/registry.mjs` 的 `deleteRunnerChain`——
 * 两调用点单源）；每次动作落审计行 = **驱动层**职责（`chat.mjs` 逐调用一条 `agent_event`/`chat_call`——本档不写审计，零双记 KD-SV-91）；
 * 工具结果形 = `{ ok, … }`（结构化；错误 ⇒ `ok: false` + 人话 `message`——回灌模型自纠，**回合不停**）。
 * 密钥面：provider 回显走 `maskApiKey`（明文不出）；`exec`（SSH）**入 chat**（凭据 = 主机表行密列，经弹窗录入——文本非通道；KD-SV-136），结果/摘要/subject 同链过 `hosts.mjs` 掩蔽（行凭据值零入四面）。
 */
import { queryAudit } from "../accounts/audit.mjs"
import { getKeyById, revokeKey } from "../accounts/keys.mjs"
import {
  createMember, findMemberById, findMemberByName, findMemberByUsername, listMembers, mergeMemberModelDisables, mergeMemberModelQuotas,
  parseModelDisables, parseModelQuotas, resetMemberPassword,
} from "../accounts/members.mjs"
import { addProviderEntry, discoverProviderModels, maskApiKey, removeProviderEntry, updateProviderEntry } from "../gateway/provider-admin.mjs"
import { proxyFetch } from "../gateway/proxy.mjs"
import { listProviderEntries, modelEntriesOf } from "../gateway/providers.mjs"
import { usageSummary } from "../metering/report.mjs"
import { queryUsage } from "../metering/usage.mjs"
import { clientForRunner, normalizeDockerAddress, selfCheckDocker } from "../sandbox/docker.mjs"
import { execOnHost, revokeHostCredential } from "../sandbox/hosts.mjs"
import { deleteRunnerChain, insertRunner, listRunners, normalizeRunnerName, runnerByRef, runnerRowOr404, sshMetaOf } from "../sandbox/registry.mjs"
import { SSH_COMMAND_TIMEOUT_S } from "../sandbox/ssh.mjs"
import { DOCKER_OPS, assertDockerOp, runDockerOp } from "./docker-ops.mjs"
import { MODEL_TEST_PROBE_TEXT, MODEL_TEST_PROMPT_MAX, MODEL_TEST_TIMEOUT_S, MODEL_TEST_TIMEOUT_S_MAX, modelTestSummaryOf, runModelTest } from "./model-test.mjs"

/** 工具名全集（八件——§12 表；断言）。 */
export const CHAT_TOOL_NAMES = Object.freeze(["members", "providers", "models", "usage", "audit", "runners", "docker", "exec"])

/** 各工具动词集（§12 逐行——参数校验先于动作；断言）。 */
export const CHAT_TOOL_OPS = Object.freeze({
  members: Object.freeze(["list", "create", "reset_password", "revoke_key", "set_quota", "set_disables"]),
  providers: Object.freeze(["list", "add", "update", "remove", "discover"]),
  models: Object.freeze(["list", "enable", "disable", "settings", "alias", "test"]),
  usage: Object.freeze(["summary", "rows"]),
  audit: Object.freeze(["query"]),
  runners: Object.freeze(["list", "add", "remove", "revoke_credential"]),
})

/** 只读判类（KD-SV-225——管理族逐动词只读表；免 = 各读类动词，余问；`docker`/`exec`/未知件 ⇒ 写类）。 */
export const CHAT_READONLY_OPS = Object.freeze({
  members: Object.freeze(["list"]),
  providers: Object.freeze(["list"]),
  models: Object.freeze(["list"]),
  usage: Object.freeze(["summary", "rows"]),
  audit: Object.freeze(["query"]),
  runners: Object.freeze(["list"]),
})

/** 工具面判类维（审批门挡单源——§11.5∥KD-SV-225）：`true` = 读类（零弹）∥ `false` = 写类（弹卡）。 */
export function readonlyOf(name, args = {}) {
  const ops = CHAT_READONLY_OPS[name]
  return ops !== undefined && ops.includes(String(args?.op ?? ""))
}

/** 用法面限制（§12）：`usage.rows` limit ≤ 100（控制台账为 ≤500——工具面收窄）。 */
export const TOOL_USAGE_LIMIT_MAX = 100

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function requireText(value, field, max = 200) {
  const text = typeof value === "string" ? value.trim() : ""
  if (text === "") throw new Error(`${field}必填`)
  if (text.length > max) throw new Error(`${field}超长（≤ ${max}）`)
  return text
}

function optionalText(value, field, max = 2000) {
  if (value === undefined || value === null || value === "") return null
  const text = typeof value === "string" ? value : String(value)
  if (text.length > max) throw new Error(`${field}超长（≤ ${max}）`)
  return text
}

/** `exec` 超时秒数上界（86 400 s = 24 h——父侧 2026-10-13 裁；`agent/ADMIN-AGENT.md` §12 `exec` 行）。
 *  依据 = 86 400 000 ms ≪ Node 计时器量程 2 147 483 647 ms（逾量程被归 1 ms——即刻假超时）＋单命令 24 h 以上超出本工具用途。 */
const TIMEOUT_S_MAX = 86400

/** 探针输入（`models.test`——§12.1①：缺省 = 内置探针句；逾 2000 字 ⇒ 工具级错误人话——**零外呼**）。 */
function probePromptOf(raw) {
  if (raw === undefined || raw === null || raw === "") return MODEL_TEST_PROBE_TEXT
  if (typeof raw !== "string") throw new Error(`prompt 须为字符串：${JSON.stringify(raw)}`)
  if (raw.length > MODEL_TEST_PROMPT_MAX) throw new Error(`prompt 超长（≤ ${MODEL_TEST_PROMPT_MAX} 字——探针输入；逾限拒发，零外呼）`)
  return raw
}

/** 探针预算秒数（`models.test`——§12.1①：缺省 60 ∥ 上界 600；非正/非数/越界 ⇒ 工具级错误人话——**零外呼**）。
 *  值域形沿 `exec` 同面先例（不 `Number` 收编——布尔/数字串/数组皆拒）；界值依据 = 设计轮定（单请求 10 分钟窗）。 */
function testTimeoutOf(raw) {
  if (raw === undefined || raw === null || raw === "") return MODEL_TEST_TIMEOUT_S
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) throw new Error(`timeoutS 非法：${String(raw)}（正数秒数；缺省 ${MODEL_TEST_TIMEOUT_S}）`)
  if (raw > MODEL_TEST_TIMEOUT_S_MAX) throw new Error(`超时上限 ${MODEL_TEST_TIMEOUT_S_MAX} 秒：timeoutS = ${String(raw)} 越界（缺省 ${MODEL_TEST_TIMEOUT_S}）`)
  return raw
}

/** `exec` 超时秒数（E61：非数/非正 ⇒ 工具级错误——不 `Number` 收编（布尔/数字串/数组皆拒）；越界 ⇒ 工具级错误人话「超时上限 24 小时」；缺省 = `ssh.mjs` 单源常量）。 */
function timeoutOf(raw) {
  if (raw === undefined || raw === null || raw === "") return SSH_COMMAND_TIMEOUT_S
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) throw new Error(`timeoutS 非法：${String(raw)}（正数秒数；缺省 ${SSH_COMMAND_TIMEOUT_S}）`)
  if (raw > TIMEOUT_S_MAX) throw new Error(`超时上限 24 小时：timeoutS = ${String(raw)} 越界（上界 ${TIMEOUT_S_MAX} 秒；缺省 ${SSH_COMMAND_TIMEOUT_S}）`)
  return raw
}

/**
 * 装配八工具（§12）：`db` = openDatabase 产物 ∥ `runtime` = gateway 注册行引导的**同一实例**（provider 写面换表——与路由同见）
 * ∥ `guard` = 登录守卫（重置链清计——装配面注入）∥ `fetchImpl` = Docker 传输注入面（单元测试档替身）
 * ∥ `config`（连接面 TLS 档材料解密——增补 #2）∥ `requestImpl`（`node:https` 假件缝）——两参沿节点面同链（明文行零涉）
 * ∥ `discoverFetchImpl` = 上游探针出口（缺省 = `proxyFetch`——与控制台 discover 同出口，代理旗判定不丢；测试替身走此参）。
 * `invoke(name, args)` 出 = **结果对象**（各动词自带字段，至少 `{ ok }`；失败 ⇒ `{ ok:false, message }`——不抛，交模型自纠）。
 * `summary` 面：docker 等结果自带则沿用，余由驱动层派生（`chat.summaryOfResult`——掩蔽 + 截断）。
 * 模型测试面（§12.1②）：`loopbackFor` = 出口描述子取件（装配面注入——`chatProviderOf`；出 `{ provider, upstream }`）∥
 * `modelTestFetch` = 探针传输假件缝（缺省 `fetch`）∥ `now` = 注入钟（`totalMs`/`ttfbMs`/`tps` 分母窗读时——单测逐值断言）；
 * 三缺位皆工具级错误人话（未接线/未登录/自环基址缺位——零外呼）。
 */
export function createChatTools({ db, runtime = null, config = {}, env = process.env, fetchImpl = fetch, requestImpl = null, discoverFetchImpl = proxyFetch, guard = null, log = null, actor = "admin", actorId = null, execImpl = null, loopbackFor = null, modelTestFetch = null, now = Date.now } = {}) {
  if (!db) throw new Error("createChatTools：缺少 db（openDatabase 产物）")
  const providerCtx = { db, runtime, config, env, fetchImpl: discoverFetchImpl, log }

  /** 成员寻址（id ∥ 用户名 ∥ 展示名——§3 寻址口径）。 */
  function resolveMember(raw, field = "member") {
    if (raw === undefined || raw === null || raw === "") throw new Error(`${field}必填（成员 id ∥ 用户名 ∥ 展示名）`)
    if (typeof raw === "number" || /^\d+$/.test(String(raw))) {
      const hit = findMemberById(db, Number(raw))
      if (hit) return hit
    }
    return findMemberByUsername(db, String(raw)) ?? findMemberByName(db, String(raw)) ?? (() => { throw new Error(`成员不存在：${String(raw)}`) })()
  }

  /** 节点寻址（名 ∥ 地址两形——**单源 = `registry.runnerByRef`**（`docker`/`exec` 两工具同判，未在册/歧义 ⇒ 工具级错误）。 */
  function resolveNode(raw) {
    return runnerByRef(db, raw)
  }

  /** provider 条目定位（id ∥ 名——§12 providers/models 两工具共用）。 */
  function resolveProvider(raw, field = "provider") {
    if (raw === undefined || raw === null || raw === "") throw new Error(`${field}必填（provider id ∥ 名）`)
    const entries = listProviderEntries(db)
    const hit = entries.find((entry) => entry.id === Number(raw)) ?? entries.find((entry) => entry.name === String(raw))
    if (!hit) throw new Error(`provider 不存在：${String(raw)}（先 providers.list 查在册）`)
    return hit
  }

  /** 开放模型定位（上游名 ∥ 别名——§12 models 行；未开放 ⇒ 工具级错误）。 */
  function locateModel(entries, providerName, ref) {
    const target = requireText(ref, "model（上游模型名 ∥ 别名）", 200)
    for (const { name, alias } of modelEntriesOf(entries.models)) {
      if (name === target || alias === target) return name
    }
    throw new Error(`模型不在该 provider 的开放清单：${providerName}/${target}（先 models.list 查在册）`)
  }

  /** 对外标识（别名 ∥ `provider/model`——§12.1③ 读数 `model` ∥ 审计 `subject` 同值；与 `models.list` 行同式）。 */
  function externalModelOf(providerName, name, item) {
    return item?.alias ?? `${providerName}/${name}`
  }

  /** 成员过滤取值（使用量/审计两工具——同控制台口径：全数字 ⇒ id；否则按用户名/展示名；未命中 ⇒ -1 空集哨兵）。 */
  function memberFilterOf(raw) {
    if (raw === undefined || raw === null || raw === "") return null
    if (/^\d+$/.test(String(raw))) return Number(raw)
    const hit = findMemberByUsername(db, String(raw)) ?? findMemberByName(db, String(raw))
    return hit ? hit.id : -1
  }

  function timeOf(raw, field) {
    if (raw === undefined || raw === null || raw === "") return null
    const value = Number(raw)
    if (!Number.isFinite(value)) throw new Error(`${field} 非法：${String(raw)}（unix ms）`)
    return value
  }

  function endpointOf(raw) {
    if (raw === undefined || raw === null || raw === "") return null
    if (raw === "chat" || raw === "embeddings") return raw
    throw new Error(`endpoint 非法：${String(raw)}（chat ∥ embeddings）`)
  }

  // ── ① members（六动词——§12 行）──────────────────────────────────────────────
  async function membersOp(op, args) {
    switch (op) {
      case "list": {
        const members = listMembers(db).map((member) => ({
          id: member.id,
          name: member.name,
          username: member.username,
          role: member.role,
          modelQuotas: parseModelQuotas(member.model_quotas_json),
          modelDisables: parseModelDisables(member.model_disabled_json),
        }))
        return { ok: true, summary: `成员 ${members.length} 人`, members }
      }
      case "create": {
        const { member, password } = await createMember(db, { username: args.username, name: args.name ?? null, role: args.role ?? "user" })
        return { ok: true, summary: `已建成员 ${member.name}（${member.role}）`, member: { id: member.id, name: member.name, username: member.username, role: member.role }, tempPassword: password }
      }
      case "reset_password": {
        const member = resolveMember(args.member)
        const tempPassword = await resetMemberPassword(db, member, { guard }) // 重置链单源（改密 + 清计 + 会话吊销——与路由同函数）
        return { ok: true, summary: `已重置 ${member.name} 的密码（旧密即失效；临时密码一次性回显）`, id: member.id, name: member.name, tempPassword }
      }
      case "revoke_key": {
        const member = resolveMember(args.member)
        const keyId = Number(args.keyId ?? args.key)
        const key = Number.isInteger(keyId) ? getKeyById(db, keyId) : null
        if (!key || key.member_id !== member.id) throw new Error(`key 不存在或不属该成员：${String(args.keyId ?? args.key)}（先看成员 key 清单）`)
        revokeKey(db, key.id) // 立即生效；已吊销 ⇒ 幂等（软删纪律）
        return { ok: true, summary: `已吊销 ${member.name} 的 key（${key.key_hint}）`, id: member.id, keyId: key.id, keyHint: key.key_hint }
      }
      case "set_quota": {
        const member = resolveMember(args.member)
        const updated = mergeMemberModelQuotas(db, member.id, args.quotas) // 键级合并（null = 删键；键形/值校验单源）
        return { ok: true, summary: `已更新 ${member.name} 的分模型覆盖`, id: updated.id, modelQuotas: parseModelQuotas(updated.model_quotas_json) }
      }
      case "set_disables": {
        const member = resolveMember(args.member)
        const updated = mergeMemberModelDisables(db, member.id, args.disables) // 键级合并（true = 禁用；null = 删键）
        return { ok: true, summary: `已更新 ${member.name} 的模型禁用集`, id: updated.id, modelDisables: parseModelDisables(updated.model_disabled_json) }
      }
      default:
        return { ok: false, message: `未知 members 动词：${String(op)}（${CHAT_TOOL_OPS.members.join(" ∥ ")}）` }
    }
  }

  // ── ② providers（五动词——写链与控制台同函数）────────────────────────────────
  async function providersOp(op, args) {
    switch (op) {
      case "list": {
        const providers = listProviderEntries(db).map((entry) => ({
          id: entry.id,
          name: entry.name,
          baseURL: entry.baseURL,
          apiKey: maskApiKey(entry.apiKey), // 回显形——明文不出库面（§2.2 同源）
          models: entry.models,
          settings: entry.settings,
          modelMeta: entry.modelMeta,
          proxy: entry.proxy,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        }))
        return { ok: true, summary: `provider ${providers.length} 家`, providers }
      }
      case "add": {
        const { id, entry } = addProviderEntry(providerCtx, {
          name: args.name,
          baseURL: args.baseURL,
          apiKey: args.apiKey ?? "",
          models: args.models ?? [],
          proxy: args.proxy,
          modelMeta: args.modelMeta,
        })
        return { ok: true, summary: `已新增 provider ${entry.name}（#${id}）`, id, name: entry.name }
      }
      case "update": {
        const row = resolveProvider(args.id ?? args.provider)
        const { id, entry } = updateProviderEntry(providerCtx, row.id, {
          name: args.name,
          baseURL: args.baseURL,
          apiKey: args.apiKey,
          models: args.models,
          proxy: args.proxy,
          settings: args.settings,
          modelMeta: args.modelMeta,
        })
        return { ok: true, summary: `已更新 provider ${entry.name}（#${id}）`, id, name: entry.name }
      }
      case "remove": {
        const row = resolveProvider(args.id ?? args.provider)
        const out = removeProviderEntry(providerCtx, row.id)
        return { ok: true, summary: `已删除 provider ${out.name}（#${out.id}）——用量行零触`, id: out.id, name: out.name }
      }
      case "discover": {
        const { models, modelMeta } = await discoverProviderModels(providerCtx, { baseURL: args.baseURL, apiKey: args.apiKey, providerId: args.providerId, proxy: args.proxy })
        return { ok: true, summary: `发现模型 ${models.length} 个（草稿——不落库）`, models, modelMeta }
      }
      default:
        return { ok: false, message: `未知 providers 动词：${String(op)}（${CHAT_TOOL_OPS.providers.join(" ∥ ")}）` }
    }
  }

  // ── ③ models（六动词——读改写走 provider 写链，单源校验；`test` = 模型测试执行器 `model-test.mjs`）──
  async function modelsOp(op, args, ctx = {}) {
    switch (op) {
      case "list": {
        const rows = []
        for (const entry of listProviderEntries(db)) {
          if (args.provider !== undefined && args.provider !== null && args.provider !== "" && entry.name !== String(args.provider) && entry.id !== Number(args.provider)) continue
          for (const item of modelEntriesOf(entry.models)) {
            rows.push({ provider: entry.name, model: item.name, alias: item.alias, external: externalModelOf(entry.name, item.name, item), settings: entry.settings?.[item.name] ?? null })
          }
        }
        return { ok: true, summary: `开放模型 ${rows.length} 个`, models: rows }
      }
      case "enable": {
        const entry = resolveProvider(args.provider)
        const name = requireText(args.model, "model（上游模型名）", 200)
        if (modelEntriesOf(entry.models).some((item) => item.name === name)) {
          return { ok: true, summary: `模型已在开放清单：${entry.name}/${name}`, id: entry.id, models: entry.models }
        }
        const out = updateProviderEntry(providerCtx, entry.id, { models: [...entry.models, name] })
        return { ok: true, summary: `已开放 ${entry.name}/${name}`, id: out.id, models: out.entry.models }
      }
      case "disable": {
        const entry = resolveProvider(args.provider)
        const name = locateModel(entry, entry.name, args.model)
        const rest = entry.models.filter((item) => {
          const parsed = modelEntriesOf([item])[0]
          return !(parsed && parsed.name === name)
        })
        const out = updateProviderEntry(providerCtx, entry.id, { models: rest })
        return { ok: true, summary: `已停开放 ${entry.name}/${name}`, id: out.id, models: out.entry.models }
      }
      case "settings": {
        const entry = resolveProvider(args.provider)
        const name = locateModel(entry, entry.name, args.model)
        const patch = args.settings
        if (!isPlainObject(patch)) throw new Error("settings 须为对象（{ rpm ∥ tpm ∥ costIn ∥ costOut ∥ note ∥ quotaTokens }——值 null = 清该项）")
        const current = isPlainObject(entry.settings?.[name]) ? entry.settings[name] : {}
        const merged = { ...current }
        for (const [key, value] of Object.entries(patch)) {
          if (value === null) delete merged[key]
          else merged[key] = value
        }
        const out = updateProviderEntry(providerCtx, entry.id, { settings: { ...entry.settings, [name]: merged } }) // 子字段级合并（值形校验单源）
        return { ok: true, summary: `已更新 ${entry.name}/${name} 的模型设置`, id: out.id, settings: out.entry.settings?.[name] ?? null }
      }
      case "alias": {
        const entry = resolveProvider(args.provider)
        const name = locateModel(entry, entry.name, args.model)
        const alias = optionalText(args.alias, "alias", 200)
        const next = entry.models.map((item) => {
          const parsed = modelEntriesOf([item])[0]
          if (!parsed || parsed.name !== name) return item
          if (alias === null) return name // 清除别名 ⇒ 回落字符串形（归一无别名）
          if (alias.includes("/")) throw new Error(`别名不可含「/」：${alias}`)
          return { name, alias }
        })
        // 别名全服唯一（含本次）走写链单源校验——撞 ⇒ 400（此处转工具级错误）
        const out = updateProviderEntry(providerCtx, entry.id, { models: next })
        return { ok: true, summary: alias === null ? `已清除 ${entry.name}/${name} 的别名` : `已设别名 ${alias} ⇒ ${entry.name}/${name}`, id: out.id, models: out.entry.models }
      }
      case "test": {
        const entry = resolveProvider(args.provider)
        let name
        try {
          name = locateModel(entry, entry.name, args.model)
        } catch (e) {
          // 未配/草稿值 ⇒ 工具级错误（§12.1①/E62①——**零外呼**）；划界句：草稿试连 = Provider 页「测试连接」面（AC-18）
          throw new Error(`${e?.message ?? String(e)}；草稿值不走本工具——未保存的渠道请到 Provider 页「测试连接」`)
        }
        const external = externalModelOf(entry.name, name, modelEntriesOf(entry.models).find((item) => item.name === name))
        const prompt = probePromptOf(args.prompt) // 入参校验腿（E62⑥——零外呼 ∥ 库零变）
        const timeoutS = testTimeoutOf(args.timeoutS)
        if (typeof loopbackFor !== "function") throw new Error("模型测试未接线（缺出口装配缝）——请检查工具面装配（该分支不应出现）")
        const { provider } = await loopbackFor(external) // 出口描述子同源（§16.2——sk 缺位/自环基址缺位 ⇒ 抛 ⇒ 工具级错误人话）
        const readings = await runModelTest({
          baseURL: provider.baseURL,
          apiKey: provider.apiKey,
          model: provider.model, // 外标（网关链派发口径——读数 `model` 同值）
          prompt,
          timeoutS,
          fetchImpl: modelTestFetch ?? fetch,
          now,
          signal: ctx?.signal ?? null, // 回合中止信号透传（§12.1②——中止即断开探针）
          log,
        })
        return { ok: true, summary: modelTestSummaryOf(readings), subject: external, ...readings } // 读数产出恒 ok:true（服务坏 ≠ 工具失败）
      }
      default:
        return { ok: false, message: `未知 models 动词：${String(op)}（${CHAT_TOOL_OPS.models.join(" ∥ ")}）` }
    }
  }

  // ── ④ usage（summary ∥ rows）∥ ⑤ audit（query）∥ ⑥ runners（四动词——`revoke_credential` = admin-chat-creds-merge 批）──
  function usageOp(op, args) {
    const filters = {
      memberId: memberFilterOf(args.member),
      model: args.model === undefined || args.model === null || args.model === "" ? null : String(args.model),
      endpoint: endpointOf(args.endpoint),
      from: timeOf(args.from, "from"),
      to: timeOf(args.to, "to"),
    }
    if (op === "summary") {
      const { totals, byModel, byMember } = usageSummary(db, filters)
      return { ok: true, summary: `聚合读数：请求 ${totals.requests} ∥ 计费 tokens ${totals.totalTokens}`, totals, byModel, byMember }
    }
    if (op === "rows") {
      const raw = args.limit === undefined || args.limit === null || args.limit === "" ? TOOL_USAGE_LIMIT_MAX : Number(args.limit)
      if (!Number.isInteger(raw) || raw < 1) throw new Error(`limit 非法：${String(args.limit)}（正整数 ≤ ${TOOL_USAGE_LIMIT_MAX}）`)
      const limit = Math.min(raw, TOOL_USAGE_LIMIT_MAX)
      const rows = queryUsage(db, { ...filters, limit })
      return { ok: true, summary: `用量明细 ${rows.length} 行（limit ≤ ${TOOL_USAGE_LIMIT_MAX}）`, rows }
    }
    return { ok: false, message: `未知 usage 动词：${String(op)}（${CHAT_TOOL_OPS.usage.join(" ∥ ")}）` }
  }

  function auditOp(op, args) {
    if (op !== "query") return { ok: false, message: `未知 audit 动词：${String(op)}（${CHAT_TOOL_OPS.audit.join(" ∥ ")}）` }
    const limit = args.limit === undefined || args.limit === null || args.limit === "" ? undefined : Number(args.limit)
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) throw new Error(`limit 非法：${String(args.limit)}（正整数 ≤ 500）`)
    const events = queryAudit(db, {
      type: args.type === undefined || args.type === null || args.type === "" ? null : String(args.type), // 枚举校验归 queryAudit（非法 ⇒ 工具级错误）
      memberId: memberFilterOf(args.member),
      from: timeOf(args.from, "from"),
      to: timeOf(args.to, "to"),
      ...(limit === undefined ? {} : { limit }),
    })
    return { ok: true, summary: `审计事件 ${events.length} 行（倒序）`, events }
  }

  async function runnersOp(op, args) {
    switch (op) {
      case "list": {
        const runners = listRunners(db)
        return { ok: true, summary: `注册节点 ${runners.length} 个`, runners }
      }
      case "add": {
        const name = normalizeRunnerName(args.name)
        const address = normalizeDockerAddress(args.address)
        if (db.prepare("SELECT id FROM sandbox_runners WHERE name = ?").get(name)) throw new Error(`节点名已存在：${name}（换一个名字，或先 runners.remove 清理旧登记）`)
        const check = await selfCheckDocker({ address, fetchImpl, config, requestImpl })
        const row = insertRunner(db, { name, address: check.baseUrl, runtime: check.readings })
        return { ok: true, summary: `已登记节点 ${row.name}（#${row.id} @ ${row.address}）`, runner: { id: row.id, name: row.name, address: row.address, status: row.status, selfCheck: check.readings, createdAt: row.created_at } }
      }
      case "remove": {
        const runner = runnerRowOr404(db, args.id) // 不存在 ⇒ 工具级错误
        const containers = args.containers === undefined || args.containers === null || args.containers === "" ? undefined : args.containers
        const out = await deleteRunnerChain(db, runner, { containers, confirm: args.confirm === true }, { fetchImpl, config, requestImpl })
        return { ok: true, summary: `已删除节点 ${out.name}（保留容器 ${out.kept} ∥ 连删 ${out.removed}）`, id: out.id, name: out.name, kept: out.kept, removed: out.removed }
      }
      case "revoke_credential": {
        const runner = runnerRowOr404(db, args.id) // 不存在 ⇒ 工具级错误
        let updated
        try {
          updated = revokeHostCredential(db, runner, { actor, actorId, now: () => Date.now() }) // 域行（`host_credential_revoke`）随落——加 chat 侧 `chat_call` = **两行**（凭据类例外——KD-SV-91）；零秘密
        } catch (e) {
          throw new Error(e?.message ?? String(e)) // 无凭据在留 ⇒ 工具级错误人话
        }
        return { ok: true, summary: `已撤销主机「${updated.name}」的 SSH 凭据（服务器侧零化——目标机账号须到机处置）`, id: updated.id, name: updated.name, ssh: sshMetaOf(updated) }
      }
      default:
        return { ok: false, message: `未知 runners 动词：${String(op)}（${CHAT_TOOL_OPS.runners.join(" ∥ ")}）` }
    }
  }

  /** `exec`（SSH——§12 exec 行）：绑定 = 主机表行（`resolveNode` 单源）；凭据 = 行密列（缺 ⇒ 工具级错误人话）；出 = `{ ok, exitCode, stdout, stderr, summary, subject }`。
   *  命令非零退出 ⇒ `ok:true`（退出码在结果内）；传输级失败 ⇒ 抛（`invoke` catch 转 `{ ok:false, message }`——B79）。掩蔽/私钥清理 = `hosts.mjs` 单源。 */
  async function execOp(args) {
    const node = resolveNode(args.host)
    const command = requireText(args.command, "command（命令原文）", 8000) // E61：空串/超长 ⇒ 工具级错误（零 ssh 调用）
    return await execOnHost(node, { command, timeoutS: timeoutOf(args.timeoutS) }, { config, ...(execImpl === null ? {} : { execImpl }) })
  }

  /** 工具调用入口（不抛——未知工具/动词/参数不合 ⇒ `{ ok:false, message }`；命令面错误同收）。 */
  async function invoke(name, args = {}, ctx = {}) {
    try {
      const params = isPlainObject(args) ? args : {}
      if (!CHAT_TOOL_NAMES.includes(name)) return { ok: false, message: `未知工具：${String(name)}（${CHAT_TOOL_NAMES.join(" ∥ ")}）` }
      if (name === "docker") {
        const op = assertDockerOp(requireText(params.op, "op（Docker 动词）", 40))
        const node = resolveNode(params.host)
        const client = clientForRunner(node, { fetchImpl, config, requestImpl })
        const out = await runDockerOp({ client, op, args: params.args ?? {} }) // 动词语义单源（任务面同函数）
        const head = `节点 ${node.name}（${node.address}）docker ${op} ⇒ ${out.resultCode}`
        const preview = typeof out.data === "string" ? `；${out.data.slice(0, 200)}` : ""
        return { ok: true, summary: `${head}${preview}`, resultCode: out.resultCode, data: out.data }
      }
      const op = params.op === undefined || params.op === null || params.op === "" ? null : String(params.op)
      if (name === "exec") return await execOp(params)
      if (op === null) return { ok: false, message: `缺 op（${name} 的动词：${(CHAT_TOOL_OPS[name] ?? []).join(" ∥ ")}）` }
      if (name === "members") return await membersOp(op, params)
      if (name === "providers") return await providersOp(op, params)
      if (name === "models") return await modelsOp(op, params, ctx)
      if (name === "usage") return usageOp(op, params)
      if (name === "audit") return auditOp(op, params)
      if (name === "runners") return await runnersOp(op, params)
      return { ok: false, message: `未知工具：${String(name)}` }
    } catch (e) {
      return { ok: false, message: e?.message ?? String(e) }
    }
  }

  /** 逐件 schema 构造（名 ∥ 描述 ∥ 属性表 ∥ 必填——八件同构；行压义不压）。 */
  const fn = (name, description, properties, required = ["op"]) => ({ type: "function", function: { name, description, parameters: { type: "object", properties, required } } })
  /** 长描述拼接（行宽 ≤300——单行不越线）。 */
  const desc = (...parts) => parts.join("")

  const schemas = [
    fn("members", `成员管理（控制台成员页同函数）。动词：${CHAT_TOOL_OPS.members.join(" ∥ ")}。create ⟮username,name?,role?⟯ 会生成一次性临时密码（请转告用户）；reset_password ⟮member⟯ 改密 + 清登录锁 + 吊销该成员会话；revoke_key ⟮member,keyId⟯；set_quota ⟮member,quotas⟯ ∥ set_disables ⟮member,disables⟯ 为键级合并（null = 删键）。`, {
      op: { type: "string", enum: CHAT_TOOL_OPS.members, description: "动词" },
      member: { type: "string", description: "成员（id ∥ 用户名 ∥ 展示名）" },
      keyId: { type: "number", description: "revoke_key：key id" },
      username: { type: "string", description: "create：登录名" },
      name: { type: "string", description: "create：展示名（缺省 = 登录名）" },
      role: { type: "string", enum: ["admin", "user"], description: "create：角色（缺省 user）" },
      quotas: { type: "object", description: "set_quota：{ \"<对外标识（别名 ∥ provider/model）>\": N|null }" },
      disables: { type: "object", description: "set_disables：{ \"<对外标识>\": true|null }" },
    }),
    fn("providers", desc(
      "provider 管理（控制台 Provider 页同函数——保存即热生效）。动词：", CHAT_TOOL_OPS.providers.join(" ∥ "),
      "。add ⟮name,baseURL,apiKey?,models?,proxy?,modelMeta?⟯；update ⟮id,name?,baseURL?,apiKey?,models?,proxy?,settings?（键级合并）,modelMeta?⟯（缺省 = 不动；apiKey 回显为掩码，明文不回）；",
      "remove ⟮id⟯；discover ⟮baseURL,apiKey?,providerId?,proxy?⟯ 探上游 /models（不落库）。",
    ), {
      op: { type: "string", enum: CHAT_TOOL_OPS.providers, description: "动词" },
      id: { type: "number", description: "provider id（update ∥ remove）" },
      name: { type: "string", description: "provider 名（对外标识前缀）" },
      baseURL: { type: "string", description: "OpenAI 兼容根（如 https://api.example.com/v1）" },
      apiKey: { type: "string", description: "密钥明文 ∥ env:NAME 引用（只入库；回显恒掩码）" },
      models: { type: "array", description: "开放模型清单（字符串 ∥ { name, alias }）", items: { type: ["string", "object"] } },
      proxy: { type: "boolean", description: "上游请求是否走服务器代理串" },
      settings: { type: "object", description: "模型设置映射 { \"<上游模型名>\": { rpm ∥ tpm ∥ costIn ∥ costOut ∥ note ∥ quotaTokens } }" },
      modelMeta: { type: "object", description: "模型元数据留存图（白名单四字段）" },
      providerId: { type: "number", description: "discover：取库内该 provider 的 key/代理旗兜底" },
    }),
    fn("models", desc(
      "服务模型面（控制台服务模型页同函数——保存即热生效）。动词：", CHAT_TOOL_OPS.models.join(" ∥ "),
      "。enable ⟮provider,model⟯ 加开放；disable ⟮provider,model⟯ 减项；settings ⟮provider,model,settings⟯ 子字段级合并（",
      "{ rpm ∥ tpm ∥ costIn ∥ costOut ∥ note ∥ quotaTokens }，值 null = 清该项）；alias ⟮provider,model,alias⟯ 设/清别名（alias 空 = 清除；全服唯一）；",
      "test ⟮provider,model,prompt?,timeoutS?⟯ 对**已配渠道点名**发一次真实调用（经网关链——照常记账并计配额），归一五读数：",
      "状态（正常/超时/HTTP 错误/响应不可用/流中断）∥ 错误原文 ∥ 总耗时 ∥ 首字节延迟 ∥ 吞吐（tokens/s；usage 缺 ⇒ null）。",
      "未保存的草稿值不走本工具（用 Provider 页「测试连接」）。",
    ), {
      op: { type: "string", enum: CHAT_TOOL_OPS.models, description: "动词" },
      provider: { type: "string", description: "provider 名 ∥ id" },
      model: { type: "string", description: "模型（enable = 上游模型名；余动词 = 上游名 ∥ 别名）" },
      settings: { type: "object", description: "settings：{ rpm ∥ tpm ∥ costIn ∥ costOut ∥ note ∥ quotaTokens }" },
      alias: { type: "string", description: "alias：别名（空 ∥ null = 清除）" },
      prompt: { type: "string", description: `test：探针输入（缺省「${MODEL_TEST_PROBE_TEXT}」；≤ ${MODEL_TEST_PROMPT_MAX} 字）` },
      timeoutS: { type: "number", description: `test：探针预算秒数（缺省 ${MODEL_TEST_TIMEOUT_S}——正数，上界 ${MODEL_TEST_TIMEOUT_S_MAX}）` },
    }),
    fn("usage", `用量报表（控制台用量页同源）。动词：${CHAT_TOOL_OPS.usage.join(" ∥ ")}。summary 出 totals/byModel/byMember；rows 出逐行明细（limit ≤ ${TOOL_USAGE_LIMIT_MAX}）。过滤：member（id ∥ 用户名 ∥ 展示名）∥ model（对外标识）∥ endpoint（chat ∥ embeddings）∥ from/to（unix ms）。`, {
      op: { type: "string", enum: CHAT_TOOL_OPS.usage, description: "动词" },
      member: { type: "string", description: "成员过滤" },
      model: { type: "string", description: "模型过滤（对外标识）" },
      endpoint: { type: "string", enum: ["chat", "embeddings"], description: "端点过滤" },
      from: { type: "number", description: "起始时刻（unix ms）" },
      to: { type: "number", description: "结束时刻（unix ms）" },
      limit: { type: "number", description: `rows：行数（≤ ${TOOL_USAGE_LIMIT_MAX}）` },
    }),
    fn("audit", `审计事件查询（控制台审计页同函数，倒序）。动词：${CHAT_TOOL_OPS.audit.join(" ∥ ")}。过滤：type（十三型枚举）∥ member ∥ from/to（unix ms）∥ limit（≤ 500）。`, {
      op: { type: "string", enum: CHAT_TOOL_OPS.audit, description: "动词" },
      type: { type: "string", description: "事件型（如 agent_event ∥ sandbox_event ∥ login_failure ⋯）" },
      member: { type: "string", description: "成员过滤（actor ∥ target）" },
      from: { type: "number", description: "起始时刻（unix ms）" },
      to: { type: "number", description: "结束时刻（unix ms）" },
      limit: { type: "number", description: "行数（≤ 500）" },
    }),
    fn("runners", `运行节点管理（控制台沙盒页运行面同函数）。动词：${CHAT_TOOL_OPS.runners.join(" ∥ ")}。list；add ⟮name,address⟯（连通自检 + 落行）；remove ⟮id,containers?,confirm?⟯——有承载工作区须 confirm:true；节点上有容器须选 containers: "keep"（原样留机）∥ "remove"（逐个强删）；revoke_credential ⟮id⟯（撤销该主机的 SSH 凭据——服务器侧零化）；list 行携 ssh 元数据（用户/端口/认证形/凭据状态——零秘密）。`, {
      op: { type: "string", enum: CHAT_TOOL_OPS.runners, description: "动词" },
      name: { type: "string", description: "add：节点名（≤ 40）" },
      address: { type: "string", description: "add：Docker API 地址（如 10.0.0.5:2375）" },
      id: { type: "number", description: "remove ∥ revoke_credential：节点 id" },
      containers: { type: "string", enum: ["keep", "remove"], description: "remove：容器处置" },
      confirm: { type: "boolean", description: "remove：确认丢弃承载工作区绑定" },
    }),
    fn("docker", `对**已注册节点**的 Docker API 执行一个动词（与控制台容器面同一客户端）。动词：${DOCKER_OPS.join(" ∥ ")}。host = 注册节点名 ∥ 地址（未在册 ⇒ 报错——先 runners.list/add）。args 逐动词：{ image, tag } ∥ { name, body } ∥ { id } ∥ { all }。`, {
      host: { type: "string", description: "注册节点（名 ∥ 地址）" },
      op: { type: "string", enum: DOCKER_OPS, description: "Docker 动词" },
      args: { type: "object", description: "动词参数（如 { image, tag } ∥ { name, body } ∥ { id } ∥ { all }）" },
    }, ["host", "op"]),
    fn("exec", `在**已注册主机**上执行一条命令（SSH——非交互、逐条；回读退出码与 stdout/stderr）。host = 主机行（注册节点名 ∥ 地址；未在册 ⇒ 报错）；凭据 = 该主机的 SSH 凭据（未登记 ⇒ 报错——到「主机凭据」弹窗录入；不要请用户把凭据发在聊天里）。需要提权时用 \`sudo -S <命令>\`（口令由系统注入 stdin，不要写进口令）。命令非零退出不是工具失败（退出码在结果内）。`, {
      host: { type: "string", description: "主机（注册节点名 ∥ 地址）" },
      command: { type: "string", description: "要执行的命令原文" },
      timeoutS: { type: "number", description: `超时秒数（缺省 ${SSH_COMMAND_TIMEOUT_S}——正数，上界 ${TIMEOUT_S_MAX} = 24 小时）` },
    }, ["host", "command"]),
  ]

  return {
    names: CHAT_TOOL_NAMES,
    ops: CHAT_TOOL_OPS,
    schemas,
    readonlyOf, // 判类维（§11.5——写类工具走审批门）
    invoke,
  }
}
