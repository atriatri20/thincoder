#!/usr/bin/env node
/**
 * sandbox-probe.mjs — 红队探针执行器（留守腿 P1 ∥ P5–P10 ∥ P13 ∥ P14；判据表 = `docs/server/design/sandbox/SANDBOX.md` §11 ∥ 机制全文 = `sandbox/EXECUTION.md` §10；sandbox-exec-rebuild 批）.
 *
 * 跑法（server 机侧）：`node deploy/sandbox-probe.mjs --server <base> --admin <user:pass> [--node <名|址>] [--repo <仓址>] [--p14]`
 * 前置：一在线节点。 读数三径：
 *   ① 服务端 = HTTP（登录/总览/工作区——`--admin` 会话）；
 *   ② 盒内 = **一次性探针容器**（同镜像/同网络/同挂载/同资源限制——克隆盒容器；`Cmd` = 探针命令；读 `logs` + `State.ExitCode`；用毕即删——**零 `docker exec`**）；
 *   ③ 宿主文件 = 一次性容器 + 宿主文件只读挂载（P1 对照读数——零 SSH 凭据依赖；设计句「宿主读数 = SSH」的意图 = 取得宿主同一读数）；
 *      本形**读不到**的读数（宿主**活态**类——如内核/进程态读数）**不静默略过**：P 表内无此类行（P1 宿主面 = `/etc/passwd` 文件读数）；后续如新增此类行 ⇒ 经既有服务端通道取，否则输出如实标「此形不可读 ⇒ SKIP」（父侧 2026-10-14 回裁条件 a）。
 * 执行器自建探针工作区（无 ⇒ 建）。
 * 出：逐条 PASS/FAIL/SKIP + 汇总；**退出码 = 0（无 FAIL）∥ 1（有 FAIL）∥ 2（环境级错误——服务端不可达/登录失败）**。SKIP 如实（缺节点/缺前置——零假 PASS）。
 * 纪律：秘密面结构形（形态扫描——真值不下行）∥ 探针容器用毕即删（含失败路径）∥ 自建工作区不自动销毁（破坏性动作归人）。
 */
import { createDockerClient } from "../src/sandbox/docker.mjs"

const USAGE = "用法：node deploy/sandbox-probe.mjs --server <base> --admin <user:pass> [--node <名|址>] [--repo <仓址>] [--p14]"

// ── 探针脚本（容器内 `node -e`；输出末行 `__PROBE__{json}`——`{ ok, skip?, detail }`）────────────

/** 网络连通试（容器内共用片段）。 */
const SCRIPT_CONNECT_HELPERS = `
const net = require('node:net');
const tryConnect = (host, port, timeoutMs) => new Promise((resolve) => {
  const sock = net.connect({ host, port });
  const done = (ok, code) => { sock.destroy(); resolve({ ok, code }) };
  sock.setTimeout(timeoutMs || 3000);
  sock.on('connect', () => done(true, 'connected'));
  sock.on('timeout', () => done(false, 'timeout'));
  sock.on('error', (e) => done(false, (e && e.code) || String((e && e.message) || e)));
});
const emit = (out) => console.log('__PROBE__' + JSON.stringify(out));
`

/** P1：盒内 /etc/passwd ∥ 宿主 /etc/passwd（只读挂载 `/host-passwd`）——宿主人类窗（UID ∈ [1000, 65533]）账号零命中盒内。 */
const SCRIPT_P1 = `${SCRIPT_CONNECT_HELPERS}
const fs = require('node:fs');
const read = (p) => { try { return fs.readFileSync(p, 'utf8') } catch (e) { return null } };
const parse = (text) => String(text || '').split('\\n').filter(Boolean).map((line) => line.split(':')).filter((p) => p.length > 6).map((p) => ({ name: p[0], uid: Number(p[2]) })).filter((a) => Number.isInteger(a.uid));
const box = parse(read('/etc/passwd'));
const host = parse(read('/host-passwd'));
if (host.length === 0) { emit({ ok: false, skip: '宿主 /etc/passwd 不可读（挂载腿缺）', detail: 'box=' + box.map((a) => a.name + ':' + a.uid).join(',') }); }
else {
  const window = (rows) => rows.filter((a) => a.uid >= 1000 && a.uid <= 65533);
  const hostHuman = window(host);
  const boxNames = new Set(box.map((a) => a.name));
  const hits = hostHuman.filter((a) => boxNames.has(a.name));
  emit({ ok: hits.length === 0, detail: 'hostHuman=[' + hostHuman.map((a) => a.name + ':' + a.uid).join(',') + '] boxWindow=[' + window(box).map((a) => a.name + ':' + a.uid).join(',') + '] hits=[' + hits.map((a) => a.name).join(',') + ']' });
}
`

/** P5：fork 炸弹 ⇒ 被杀（pids 限到位 = 派生报 EAGAIN/ENOMEM；cap 内全成 ⇒ 限未生效）。 */
const SCRIPT_P5 = `
const { spawn } = require('node:child_process');
(async () => {
  let spawned = 0; let code = null; const CAP = 3000;
  await new Promise((resolve) => {
    const tick = () => {
      if (spawned >= CAP) return resolve();
      const child = spawn('sleep', ['30'], { stdio: 'ignore' });
      let settled = false;
      child.on('error', (e) => { if (!settled) { settled = true; code = (e && e.code) || String((e && e.message) || e); resolve() } });
      child.on('spawn', () => { if (!settled) { settled = true; spawned++; setImmediate(tick) } });
    };
    tick();
  });
  console.log('__PROBE__' + JSON.stringify({ ok: code !== null, detail: 'spawned=' + spawned + ' cap=' + CAP + ' err=' + (code || 'none') }));
})()
`

/** P6：根只读（写 `/` ⇒ 拒）+ 正向对照（`/workspace` 可写）。 */
const SCRIPT_P6 = `
const fs = require('node:fs');
const probe = (p) => { try { fs.writeFileSync(p, 'probe'); try { fs.unlinkSync(p) } catch (e) {} return { wrote: true, why: 'write-succeeded' } } catch (e) { return { wrote: false, why: (e && e.code) || String((e && e.message) || e) } } };
const root = probe('/tc-probe-root');
const workspace = probe('/workspace/.tc-probe-rw');
console.log('__PROBE__' + JSON.stringify({ ok: !root.wrote && workspace.wrote, detail: 'root=' + root.why + ' workspace=' + (workspace.wrote ? 'writable' : workspace.why) }));
`

/** P7：填盘 ⇒ ENOSPC（cap = 工作区 diskMb + 128 MiB——诊断上限，不得撑破节点盘；落件用毕即删）。 */
const SCRIPT_P7 = `
const fs = require('node:fs');
(async () => {
  const capMb = Number(process.env.TC_PROBE_FILL_CAP_MB || 0);
  const cap = capMb > 0 ? capMb * 1024 * 1024 : 256 * 1024 * 1024;
  const path = '/workspace/.tc-probe-fill';
  const chunk = Buffer.alloc(4 * 1024 * 1024, 1);
  let written = 0; let err = null;
  try {
    const fd = fs.openSync(path, 'w');
    while (written + chunk.length <= cap) { fs.writeSync(fd, chunk); written += chunk.length }
    fs.closeSync(fd);
  } catch (e) { err = e }
  try { fs.unlinkSync(path) } catch (e) {}
  console.log('__PROBE__' + JSON.stringify({ ok: err !== null && String((err && err.code) || err).indexOf('ENOSPC') >= 0, detail: 'written=' + written + ' err=' + (err ? ((err && err.code) || String(err.message || err)) : 'none') + ' (cap=' + cap + ')' }));
})()
`

/** P8：注入面正向在场（`OPENAI_BASE_URL` 网关 ∥ `OPENAI_API_KEY` = `sk-tc-…` 形态）+ 秘密零命中（真 provider key 形态扫描 ∥ 未注入敏感键名）。 */
const SCRIPT_P8 = `
const env = process.env;
const providerShapes = [/^sk-[A-Za-z0-9_-]{20,}$/, /^ghp_[A-Za-z0-9]{30,}$/, /^github_pat_/, /^AKIA[0-9A-Z]{16}$/, /^AIza[0-9A-Za-z_-]{30,}$/, /^xox[bp]-/, /^glpat-/];
const sensitive = /(_KEY|_TOKEN|_SECRET|_PASSWORD)$/;
const base = env.OPENAI_BASE_URL || '';
const key = env.OPENAI_API_KEY || '';
const shapeHits = Object.entries(env).filter(([k, v]) => {
  if (typeof v !== 'string') return false;
  if (k === 'OPENAI_API_KEY' && /^sk-tc-/.test(v)) return false;
  return providerShapes.some((re) => re.test(v));
}).map(([k]) => k);
const nameHits = Object.keys(env).filter((k) => sensitive.test(k) && k !== 'OPENAI_API_KEY');
const ok = /^https?:\\/\\//.test(base) && /^sk-tc-/.test(key) && shapeHits.length === 0 && nameHits.length === 0;
console.log('__PROBE__' + JSON.stringify({ ok, detail: 'OPENAI_BASE_URL=' + (base ? base : 'missing') + ' OPENAI_API_KEY=' + (/^sk-tc-/.test(key) ? 'sk-tc-…' : 'missing/bad') + ' shapeHits=[' + shapeHits.join(',') + '] nameHits=[' + nameHits.join(',') + ']' }));
`

/** P9：跨盒（他盒卷路径 ⇒ ENOENT ∥ 他盒容器 IP ⇒ 不可达）；他盒 IP 不可得 ⇒ 该腿读不到 ⇒ 如实 SKIP（不假 PASS）。 */
const SCRIPT_P9 = `${SCRIPT_CONNECT_HELPERS}
const fs = require('node:fs');
(async () => {
  const root = process.env.TC_PROBE_WORKSPACE_ROOT || '/var/lib/thincoder/workspaces';
  const otherId = process.env.TC_PROBE_OTHER_ID || '';
  const otherIp = process.env.TC_PROBE_OTHER_IP || '';
  if (otherIp === '') { emit({ ok: false, skip: '他盒 IP 不可得（NetworkSettings 未回读数——此腿读不到）', detail: 'otherPath=' + root + '/' + otherId }); return }
  let pathCode = 'no-other';
  if (otherId) { try { fs.readdirSync(root + '/' + otherId); pathCode = 'readable' } catch (e) { pathCode = (e && e.code) || String((e && e.message) || e) } }
  const net = await tryConnect(otherIp, 80, 3000);
  emit({ ok: pathCode !== 'readable' && !net.ok, detail: 'otherPath=' + root + '/' + otherId + ' => ' + pathCode + '; otherIp=' + otherIp + ':80 => ' + net.code });
})()
`

/** P10：正常开发链（拉仓 ∥ 装依赖（有 package.json 才走）∥ 跑测试（`npm test --if-present`））——`TC_PROBE_REPO` 注入。 */
const SCRIPT_P10 = `
const { execSync } = require('node:child_process');
const steps = [];
const run = (label, cmd, timeout, cwd) => { try { const out = execSync(cmd, { cwd: cwd || '/workspace', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); steps.push(label + ':ok' + (out ? '(' + out.slice(0, 120) + ')' : '')); return true } catch (e) { const err = String((e && e.stderr ? e.stderr.toString() : '') || (e && e.message) || e).trim().slice(0, 240); steps.push(label + ':fail(' + err + ')'); return false } };
const has = (cmd) => { try { execSync('command -v ' + cmd, { stdio: 'ignore' }); return true } catch (e) { return false } };
const hasFile = (p) => { try { execSync('test -f ' + p, { stdio: 'ignore' }); return true } catch (e) { return false } };
const repo = process.env.TC_PROBE_REPO || '';
if (!has('git')) { console.log('__PROBE__' + JSON.stringify({ ok: false, skip: '镜像无 git（拉仓面不可达）', detail: steps.join(' | ') })); }
else {
  const dir = '/workspace/.tc-probe-repo';
  run('clean', 'rm -rf ' + dir, 60000);
  const cloned = run('clone', 'git clone --depth 1 ' + repo + ' ' + dir, 120000);
  let install = true;
  if (!cloned) install = false;
  else if (!hasFile(dir + '/package.json')) steps.push('install:skipped(no package.json)');
  else install = run('install', 'npm install --ignore-scripts --no-audit --no-fund', 300000, dir);
  const test = cloned ? run('test', 'npm test --if-present', 300000, dir) : false;
  console.log('__PROBE__' + JSON.stringify({ ok: cloned && install && test, detail: steps.join(' | ') }));
}
`

/** P13：键面（`mode=once` = 单次取状态（期望 200）∥ `mode=hold` = 轮询至 401（吊销即断））。 */
const SCRIPT_P13 = `
(async () => {
  const base = (process.env.OPENAI_BASE_URL || '').replace(/\\/$/, '');
  const key = process.env.OPENAI_API_KEY || '';
  const url = base + '/models';
  const once = async () => { try { const res = await fetch(url, { headers: { authorization: 'Bearer ' + key }, signal: AbortSignal.timeout(8000) }); return res.status } catch (e) { return 'err:' + ((e && e.name) || 'fetch') } };
  if ((process.env.TC_PROBE_KEY_MODE || 'once') === 'once') {
    const status = await once();
    console.log('__PROBE__' + JSON.stringify({ ok: status === 200, detail: 'GET /v1/models status=' + status }));
    return;
  }
  const started = Date.now(); const seq = []; let final = null;
  while (Date.now() - started < Number(process.env.TC_PROBE_WINDOW_MS || 90000)) {
    const status = await once(); seq.push(status);
    if (status === 401) { final = 401; break }
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log('__PROBE__' + JSON.stringify({ ok: final === 401, detail: 'seq=' + seq.join(',') }));
})()
`

// ── 探针脚本表面（批内单测档语法机检缝——逐条 vm 编译；无则改一处漏一处只能等真机跑才现）──

/** 探针脚本表（P1 ∥ P5–P10 ∥ P13 内嵌命令体——P14 走服务端 HTTP，无脚本）。 */
export const PROBE_SCRIPTS = Object.freeze({
  P1: SCRIPT_P1, P5: SCRIPT_P5, P6: SCRIPT_P6, P7: SCRIPT_P7,
  P8: SCRIPT_P8, P9: SCRIPT_P9, P10: SCRIPT_P10, P13: SCRIPT_P13,
})

// ── 执行器 ──────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { server: null, admin: null, node: null, repo: null, p14: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--server") args.server = argv[++i] ?? null
    else if (arg === "--admin") args.admin = argv[++i] ?? null
    else if (arg === "--node") args.node = argv[++i] ?? null
    else if (arg === "--repo") args.repo = argv[++i] ?? null
    else if (arg === "--p14") args.p14 = true
    else throw new Error(`未知参数：${arg}\n${USAGE}`)
  }
  if (!args.server || !args.admin) throw new Error(`缺 --server ∥ --admin\n${USAGE}`)
  return args
}

const rand = (n = 6) => Math.random().toString(16).slice(2, 2 + n)

/** 探针记录（逐条：PASS ∥ FAIL ∥ SKIP——SKIP 带因；零假 PASS）。 */
function makeReport() {
  const rows = []
  return {
    add(id, title, outcome, detail = "") {
      rows.push({ id, title, outcome, detail })
      const tag = outcome === "pass" ? "PASS" : outcome === "fail" ? "FAIL" : "SKIP"
      console.log(`[${tag}] ${id} ${title}${detail ? ` — ${detail}` : ""}`)
    },
    summary() {
      const count = (want) => rows.filter((row) => row.outcome === want).length
      console.log(`\n汇总：PASS ${count("pass")} ∥ FAIL ${count("fail")} ∥ SKIP ${count("skip")}（共 ${rows.length} 条）`)
      return count("fail") > 0 ? 1 : 0
    },
  }
}

async function login(base, admin) {
  const sep = admin.indexOf(":")
  if (sep <= 0) throw new Error("--admin 形 = <用户名>:<口令>")
  const res = await fetch(`${base}/api/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: admin.slice(0, sep), password: admin.slice(sep + 1) }),
  })
  if (res.status !== 200) throw new Error(`登录失败（HTTP ${res.status}）——核对 --admin`)
  const cookies = res.headers.getSetCookie?.() ?? []
  const session = cookies.map((line) => line.split(";")[0]).find((pair) => /session|tc_/.test(pair))
  if (!session) throw new Error("登录响应缺会话 cookie")
  return session
}

async function api(ctx, method, path, body) {
  const res = await fetch(`${ctx.base}${path}`, {
    method,
    headers: { "content-type": "application/json", cookie: ctx.cookie },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await res.text()
  let json = null
  try {
    json = text === "" ? null : JSON.parse(text)
  } catch {
    json = null
  }
  return { status: res.status, json, text }
}

/** 探针容器体（克隆盒容器：同镜像/同环境/同网络/同挂载/同资源限制；`cmd` = 探针命令；差量 = `extraBinds`/`extraEnv`）。 */
function probeBody(box, { cmd, extraBinds = [], extraEnv = [] }) {
  const host = box.HostConfig ?? {}
  return {
    Image: box.Config?.Image ?? box.Image,
    Cmd: cmd,
    Env: [...(box.Config?.Env ?? []), ...extraEnv],
    WorkingDir: box.Config?.WorkingDir ?? undefined,
    HostConfig: {
      Binds: [...(host.Binds ?? []), ...extraBinds],
      ReadonlyRootfs: host.ReadonlyRootfs === true,
      ...(host.Tmpfs ? { Tmpfs: host.Tmpfs } : {}),
      ...(host.CapDrop ? { CapDrop: host.CapDrop } : {}),
      ...(host.NetworkMode ? { NetworkMode: host.NetworkMode } : {}),
      ...(host.Dns ? { Dns: host.Dns } : {}),
      ...(host.Memory ? { Memory: host.Memory } : {}),
      ...(host.NanoCpus ? { NanoCpus: host.NanoCpus } : {}),
      ...(host.PidsLimit ? { PidsLimit: host.PidsLimit } : {}),
    },
  }
}

/** 起一个探针容器（不等待）；出 = 容器 id。 */
async function startProbe(ctx, spec) {
  const name = `tc-probe-${rand()}`
  const created = await ctx.client.createContainer(name, probeBody(ctx.box, spec))
  const id = created.json?.Id
  if (!id) throw new Error(`探针容器创建无 Id：${created.text}`)
  await ctx.client.startContainer(id)
  return id
}

/** 读探针容器结果（轮询至退出；出 = `{ exitCode, stdout }`；超窗 ⇒ 删容器 + 抛）。 */
async function readProbe(ctx, id, { timeoutMs = 60000 } = {}) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const state = await ctx.client.containerState(id)
    if (state.state.running === false) {
      const logs = await ctx.client.containerLogs(id, 2000)
      return { exitCode: state.state.exitCode, stdout: logs.logs }
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`探针容器超窗未退出（${timeoutMs}ms）`)
}

async function deleteProbe(ctx, id) {
  try {
    await ctx.client.deleteContainer(id, { force: true })
  } catch {
    /* 用毕即删尽力而为（残留由人工清理）——不反噬判据 */
  }
}

/** 起 + 等 + 删（常规一步探针）；出 = 探针输出解析。 */
async function runProbe(ctx, spec, { timeoutMs = 60000 } = {}) {
  const id = await startProbe(ctx, spec)
  try {
    const out = await readProbe(ctx, id, { timeoutMs })
    return parseProbeOutput(out)
  } finally {
    await deleteProbe(ctx, id)
  }
}

/** 解析探针输出（末行 `__PROBE__{json}`；判不出 ⇒ 原样呈）。 */
function parseProbeOutput({ exitCode, stdout }) {
  const lines = String(stdout ?? "").split(/\r?\n/).filter((line) => line.includes("__PROBE__"))
  if (lines.length === 0) return { ok: false, detail: `无探针输出（exit=${exitCode}）：${String(stdout ?? "").trim().slice(0, 400)}` }
  try {
    return JSON.parse(lines[lines.length - 1].slice(lines[lines.length - 1].indexOf("__PROBE__") + "__PROBE__".length))
  } catch (e) {
    return { ok: false, detail: `探针输出解析失败：${String(e?.message ?? e)}` }
  }
}

/** 盒容器名匹配（`tc-ws-<id>`——EXECUTION §3）。 */
const boxNameOf = (workspaceId) => `tc-ws-${Number(workspaceId)}`

/** 列节点容器（`all=1`）。 */
async function listContainers(ctx) {
  const res = await ctx.client.containers()
  return Array.isArray(res.json) ? res.json : []
}

/** 找盒容器（返回 inspect 形；缺 ⇒ null）。 */
async function findBox(ctx, workspaceId) {
  const hit = (await listContainers(ctx)).find((item) => String(item.Names?.[0] ?? "").replace(/^\//, "") === boxNameOf(workspaceId))
  if (!hit) return null
  const detail = await ctx.client.containerDetail(hit.Id)
  return detail.json ?? null
}

/** 等盒容器到位（建盒链为同步直调——登记/启动后短窗内应在；超窗 ⇒ null）。 */
async function waitBox(ctx, workspaceId, { timeoutMs = 90000, running = false } = {}) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const box = await findBox(ctx, workspaceId)
    if (box && (!running || box.State?.Running === true)) return box
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  return null
}

/** 确保一个探针工作区（无 ⇒ 经控制台 API 自建；不自动销毁：破坏性动作归人）。 */
async function ensureWorkspace(ctx, { exclude = null } = {}) {
  const list = await api(ctx, "GET", "/api/admin/sandbox/workspaces")
  const rows = Array.isArray(list.json?.workspaces) ? list.json.workspaces : []
  const mine = rows.filter((row) => row.runnerId === ctx.runner.id && row.id !== exclude)
  for (const row of mine) {
    const box = await findBox(ctx, row.id)
    if (box) return { workspace: row, box, created: false }
  }
  const created = await api(ctx, "POST", "/api/admin/sandbox/workspaces", { name: `probe-${rand(6)}`, ownerMemberId: ctx.ownerMemberId })
  if (created.status !== 200) throw new Error(`自建探针工作区失败（HTTP ${created.status}）：${created.text.slice(0, 300)}`)
  const workspace = created.json.workspace
  const box = await waitBox(ctx, workspace.id, { timeoutMs: 120000 })
  if (!box) throw new Error(`探针工作区已建（#${workspace.id}）但盒未到位——建盒链前置未就绪（配额/镜像）`)
  return { workspace, box, created: true }
}

/** 主流程。 */
async function main() {
  const args = parseArgs(process.argv.slice(2))
  const base = args.server.replace(/\/$/, "")
  const report = makeReport()

  let cookie
  try {
    cookie = await login(base, args.admin)
  } catch (e) {
    console.error(`环境级错误：${e?.message ?? e}`)
    return 2
  }
  const ctx = { base, cookie, runner: null, ownerMemberId: null, client: null, box: null, workspace: null, settings: null }

  // 节点择定（--node 名|址 ⇒ 精确匹配；缺省 = 首个在线者）
  const overview = await api(ctx, "GET", "/api/admin/sandbox/overview")
  if (overview.status !== 200) {
    console.error(`环境级错误：总览读数 HTTP ${overview.status}——${overview.text.slice(0, 200)}`)
    return 2
  }
  const runners = Array.isArray(overview.json?.runners) ? overview.json.runners : []
  const onlines = runners.filter((row) => row.online === true)
  const picked = args.node === null ? onlines[0] ?? null : runners.find((row) => row.name === args.node || row.address === args.node) ?? null
  if (args.node !== null && picked === null) report.add("P00", "节点择定", "fail", `--node ${args.node} 未在册`)
  else if (picked !== null && picked.online !== true) report.add("P00", "节点择定", "fail", `节点 ${picked.name} 离线（${picked.address}）`)
  else if (picked === null) report.add("P00", "节点择定", "skip", "无在线节点——盒内面（P1–P13）全 skip；服务端读数面（P14）可判")

  const nodePlain = picked !== null && picked.online === true && String(picked.address).startsWith("http://")
  if (picked !== null && picked.online === true && args.p14 === true) report.add("P00", "节点择定", "skip", "--p14 专跑（节点面不跑）")
  else if (picked !== null && picked.online === true && !nodePlain) {
    report.add("P00", "节点择定", "skip", `节点 ${picked.name} 为 TLS 档（${picked.address}）——本器零材料面（盒内探针径需明文 Docker API；TLS 档真机收口 = 控制台侧）`)
  }
  const plainNode = nodePlain && args.p14 !== true

  if (plainNode) {
    const apiVer = picked.selfCheck?.apiVer ?? null
    if (apiVer === null) {
      report.add("P00", "节点择定", "fail", `节点 ${picked.name} 缺协商版本读数（selfCheck.apiVer）`)
    } else {
      ctx.runner = picked
      ctx.client = createDockerClient({ baseUrl: picked.address, apiVer, readTimeoutMs: 30000 }) // 读超时 30s——填盘/P5 等高压腿下 3s 默认过紧（2026-10-14 真机实证 P7）
      const members = await api(ctx, "GET", "/api/members")
      const adminName = args.admin.slice(0, args.admin.indexOf(":"))
      ctx.ownerMemberId = (Array.isArray(members.json?.members) ? members.json.members : []).find((row) => row.username === adminName)?.id ?? null
      const settings = await api(ctx, "GET", "/api/admin/sandbox/settings")
      ctx.settings = settings.json?.settings ?? {}
      if (ctx.ownerMemberId === null) report.add("P00", "探针工作区", "skip", `无从取负责人（--admin 用户名不在成员表）——自建工作区腿缺`)
      else {
        try {
          const found = await ensureWorkspace(ctx)
          ctx.workspace = found.workspace
          ctx.box = found.box
          report.add("P00", "探针工作区", "pass", `工作区 #${found.workspace.id}（${found.workspace.name}）｜盒 ${boxNameOf(found.workspace.id)}${found.created ? "（本器自建）" : ""}`)
        } catch (e) {
          report.add("P00", "探针工作区", "skip", `${e?.message ?? e}`)
        }
      }
    }
  }

  const boxReady = ctx.box !== null && ctx.client !== null
  const boxSkip = boxReady ? null : args.p14 === true ? "--p14 专跑（节点面不跑）" : "无可用盒（前置：一在线明文节点 + 探针工作区）"

  // ── P1 ∥ P5–P8（盒内面；无盒 ⇒ SKIP 如实）─────────────────────────────────────────
  if (!boxReady) {
    for (const [id, title] of [
      ["P1", "宿主真实账号零命中盒内 /etc/passwd"],
      ["P5", "fork 炸弹 ⇒ 被杀"], ["P6", "根只读"], ["P7", "填盘 ⇒ ENOSPC"], ["P8", "注入面 + 秘密零命中"],
    ]) report.add(id, title, "skip", boxSkip)
  } else {
    const run = async (id, title, script, { extraBinds = [], extraEnv = [], timeoutMs = 60000 } = {}) => {
      try {
        const out = await runProbe(ctx, { cmd: ["/usr/local/bin/node", "-e", script], extraBinds, extraEnv }, { timeoutMs })
        report.add(id, title, out.skip ? "skip" : out.ok ? "pass" : "fail", out.skip ? `${out.skip}${out.detail ? `｜${out.detail}` : ""}` : out.detail ?? "")
      } catch (e) {
        report.add(id, title, "fail", `探针容器链失败：${e?.message ?? e}`)
      }
    }
    await run("P1", "宿主真实账号零命中盒内 /etc/passwd", SCRIPT_P1, { extraBinds: ["/etc/passwd:/host-passwd:ro"] })
    await run("P5", "fork 炸弹 ⇒ 被杀", SCRIPT_P5, { timeoutMs: 120000 })
    await run("P6", "根只读", SCRIPT_P6)
    const diskMb = Number(ctx.settings?.diskMb ?? 0)
    await run("P7", "填盘 ⇒ ENOSPC", SCRIPT_P7, { extraEnv: [`TC_PROBE_FILL_CAP_MB=${Number.isFinite(diskMb) && diskMb > 0 ? diskMb + 128 : 0}`], timeoutMs: 300000 })
    await run("P8", "注入面 + 秘密零命中", SCRIPT_P8)
  }

  // ── P9：跨盒 ────────────────────────────────────────────────────────────────
  if (!boxReady) report.add("P9", "跨盒（他盒卷路径 ENOENT ∥ 他盒 IP 不可达）", "skip", boxSkip)
  else {
    try {
      const second = await ensureWorkspace(ctx, { exclude: ctx.workspace.id })
      const ip = second.box?.NetworkSettings?.Networks
        ? Object.values(second.box.NetworkSettings.Networks).map((net) => net?.IPAddress).find((value) => typeof value === "string" && value !== "") ?? ""
        : ""
      const out = await runProbe(ctx, {
        cmd: ["/usr/local/bin/node", "-e", SCRIPT_P9],
        extraEnv: [`TC_PROBE_WORKSPACE_ROOT=${ctx.settings?.workspaceRoot ?? "/var/lib/thincoder/workspaces"}`, `TC_PROBE_OTHER_ID=${second.workspace.id}`, `TC_PROBE_OTHER_IP=${ip}`],
      }, { timeoutMs: 60000 })
      report.add("P9", "跨盒（他盒卷路径 ENOENT ∥ 他盒 IP 不可达）", out.skip ? "skip" : out.ok ? "pass" : "fail", out.detail ?? "")
    } catch (e) {
      report.add("P9", "跨盒（他盒卷路径 ENOENT ∥ 他盒 IP 不可达）", "skip", `${e?.message ?? e}`)
    }
  }

  // ── P10：正常开发链（前置 --repo）────────────────────────────────────────────
  if (!boxReady) report.add("P10", "正常开发链（拉仓 ∥ 装依赖 ∥ 跑测试）", "skip", boxSkip)
  else if (args.repo === null) report.add("P10", "正常开发链（拉仓 ∥ 装依赖 ∥ 跑测试）", "skip", "缺前置 --repo（可克隆仓地址）")
  else {
    const out = await runProbe(ctx, { cmd: ["/usr/local/bin/node", "-e", SCRIPT_P10], extraEnv: [`TC_PROBE_REPO=${args.repo}`] }, { timeoutMs: 420000 })
    report.add("P10", "正常开发链（拉仓 ∥ 装依赖 ∥ 跑测试）", out.skip ? "skip" : out.ok ? "pass" : "fail", out.skip ?? out.detail ?? "")
  }

  // ── P13：吊销 ⇒ 旧 key 即断 ∥ 新 key 可用 ─────────────────────────────────────
  if (!boxReady) report.add("P13", "吊销 ⇒ 旧 key 即断 ∥ 新 key 可用", "skip", boxSkip)
  else {
    let watchId = null
    try {
      watchId = await startProbe(ctx, {
        cmd: ["/usr/local/bin/node", "-e", SCRIPT_P13],
        extraEnv: ["TC_PROBE_KEY_MODE=hold", "TC_PROBE_WINDOW_MS=90000"],
      })
      await new Promise((resolve) => setTimeout(resolve, 6000)) // 基线窗（前两次必 200）
      const rotated = await api(ctx, "POST", `/api/admin/sandbox/workspaces/${ctx.workspace.id}/rotate-key`, {})
      if (rotated.status !== 200) throw new Error(`轮换失败（HTTP ${rotated.status}）：${rotated.text.slice(0, 200)}`)
      const oldOut = await readProbe(ctx, watchId, { timeoutMs: 120000 }).then(parseProbeOutput)
      const rebuilt = await waitBox(ctx, ctx.workspace.id, { timeoutMs: 240000, running: true })
      if (rebuilt === null) {
        report.add("P13", "吊销 ⇒ 旧 key 即断 ∥ 新 key 可用", "fail", `旧 key 即断=${oldOut.ok}（${oldOut.detail}）∥ 重建未到位（新 key 腿缺）`)
      } else {
        ctx.box = rebuilt
        const freshOut = await runProbe(ctx, { cmd: ["/usr/local/bin/node", "-e", SCRIPT_P13], extraEnv: ["TC_PROBE_KEY_MODE=once"] }, { timeoutMs: 60000 })
        report.add("P13", "吊销 ⇒ 旧 key 即断 ∥ 新 key 可用", oldOut.ok && freshOut.ok ? "pass" : "fail", `旧 key 即断=${oldOut.ok}（${oldOut.detail}）∥ 新 key 可用=${freshOut.ok}（${freshOut.detail}）`)
      }
    } catch (e) {
      report.add("P13", "吊销 ⇒ 旧 key 即断 ∥ 新 key 可用", "fail", `${e?.message ?? e}`)
    } finally {
      if (watchId !== null) await deleteProbe(ctx, watchId) // 用毕即删（含失败路径——头部纪律）
    }
  }

  // ── P14：服务端读数面（无可用节点 ⇒ 503 `sandbox_unavailable`）────────────────
  {
    const available = overview.json?.status === "available"
    if (available) {
      report.add("P14", "服务端读数面（无可用节点 ⇒ 503）", "skip", "节点在线——「无可用节点」场景未复现（断节点 ∥ 无节点实例上以 --p14 复跑为证；本行非假 PASS）")
    } else {
      const write = await api(ctx, "POST", "/api/admin/sandbox/workspaces", { name: `probe-p14-${rand(4)}`, ownerMemberId: ctx.ownerMemberId ?? 1 })
      const ok = write.status === 503 && write.json?.error?.code === "sandbox_unavailable"
      report.add("P14", "服务端读数面（无可用节点 ⇒ 503）", ok ? "pass" : "fail", `状态=${overview.json?.status}（${overview.json?.reason ?? ""}）｜写动作 HTTP ${write.status} ${write.json?.error?.code ?? write.text.slice(0, 120)}`)
    }
  }

  return report.summary()
}

const isEntry = process.argv[1] !== undefined && /[\\/]sandbox-probe\.mjs$/.test(process.argv[1])
if (isEntry) {
  main()
    .then((code) => {
      process.exitCode = code
    })
    .catch((e) => {
      console.error(`执行器未捕获错误：${e?.stack ?? e}`)
      process.exitCode = 2
    })
}
