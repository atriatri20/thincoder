/**
 * 2026-10-13-sandbox-exec-rebuild-base.test.mjs — thincoder-server 批内单测件（sandbox-exec-rebuild 批 · 底座可换增补——
 * 服务面：派生构建 ∥ 私有仓凭据；名随批档 · 住 docs/batches/ · 不入仓套件 · 随批留存）。
 * 运行（自 thincoder/ 仓根）：node --test docs/batches/2026-10-13-sandbox-exec-rebuild-base.test.mjs
 *
 * 射程（判据源 = 批档 §2 增补块 + docs/server/design/sandbox/EXECUTION.md §8/§13；腿 ↔ 用例在括号）：
 *  N71（派生 tag 内容寻址 ∥ Dockerfile 逐行（乙档三段）∥ 就位四步逐条 ∥ 构建体 = 单 Dockerfile tar ∥ 审计 image_derive）
 *  ∥ N72①（tag 在场 ⇒ 零构建——缓存命中零审计）∥ N72②（缺省腿假件契约：无绑定 ⇒ 零派生调用 ∥ 零新审计行）
 *  ∥ B74（供体缺人话 ∥ 层失败两形 ⇒ 日志尾 + 处置句）∥ B75（形非法 ⇒ 零外呼）
 *  ∥ E56（拉取败 ⇒ 400 携原文 + 凭据句；不可达 ⇒ 502）∥ E57（构建流错 ⇒ 400；超时 ⇒ 502 + 重试幂等句）
 *  ∥ 凭据面（归一/形校验 ∥ 加密落库 ∥ 零回显 ∥ 四端点 CRUD ∥ 审计两 kind ∥ X-Registry-Auth 组装 ∥ 拉取注入审计 auth 键）。
 * 假件 = 注入假 Docker 客户端（derive 链）∥ 假 fetch（拉取路由）∥ 进程内库（凭据表自建段 = `IF NOT EXISTS` 幂等——v22 段已落 ⇒ 恒空转；
 * 列集同形兜底（可空性/列位以迁移链为准）——自建只为件可单跳直跑）。
 * 舱界：建盒链 ④ / 工作区 `baseImage` PATCH / derive 端点 = 执行面舱写面（跨舱集成腿随父侧收口轮）——本件只测本舱面内。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { existsSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const CRYPTO = await load("thincoder-server/src/store/credential-crypto.mjs")
const CONFIG = await load("thincoder-server/src/ops/config.mjs")
const SERVER = await load("thincoder-server/src/gateway/server.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const DOCKER = await load("thincoder-server/src/sandbox/docker.mjs")
const REGISTRY = await load("thincoder-server/src/sandbox/registry.mjs")
const CREDS = await load("thincoder-server/src/sandbox/registry-creds.mjs")
const CRED_ROUTES = await load("thincoder-server/src/sandbox/registry-cred-routes.mjs")
const IMAGE_ROUTES = await load("thincoder-server/src/sandbox/image-routes.mjs")
const DERIVE = await load("thincoder-server/src/sandbox/derive.mjs")

const PASSWORD = "password-123"
const TEMP = mkdtempSync(join(tmpdir(), "tc-exec-rebuild-base-"))

// ── 夹具：库 ∥ 配置 ∥ 假 Docker 客户端 ∥ tar 读 ∥ 假 fetch ∥ 进程内应用 ────────────────────────────

/** 进程内库（migrate 链在盘）+ 凭据表补齐（`IF NOT EXISTS`——v22 段已落 ⇒ 幂等空转；列形同 v22 段七列，件可单跳直跑）。 */
function openDb() {
  const db = DB.openDatabase(":memory:")
  db.exec(`CREATE TABLE IF NOT EXISTS registry_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    secret_cipher TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    created_by INTEGER
  )`)
  return db
}

const configs = new Map()
/** 临时配置（数据目录 = TEMP——密钥文件 `credentials.key` 落此，与库面同源）。 */
function tempConfig(tag) {
  if (!configs.has(tag)) configs.set(tag, CONFIG.validateConfig({ host: "127.0.0.1", db: join(TEMP, `${tag}.db`) }))
  return configs.get(tag)
}

/** 假 Docker 客户端（derive 链——逐条记录调用；`refs` = ref → 镜像 Id）。 */
function fakeClient({ refs = {}, pullImpl = null, buildImpl = null } = {}) {
  const calls = []
  const store = new Map(Object.entries(refs))
  return {
    calls,
    async imageDetail(ref) {
      calls.push({ op: "imageDetail", ref })
      if (!store.has(ref)) {
        throw new DOCKER.DockerError("api", `Docker API 404：No such image: ${ref}`, { status: 404, apiMessage: `No such image: ${ref}` })
      }
      return { status: 200, json: { Id: store.get(ref) }, text: "" }
    },
    async pullImage(image, tag, options = {}) {
      calls.push({ op: "pullImage", image, tag, options })
      if (pullImpl) return pullImpl({ image, tag, options })
      store.set(`${image}:${tag}`, "sha256:pulled")
      return { status: 200, json: null, text: "" }
    },
    async buildImage(tag, tar, options = {}) {
      calls.push({ op: "buildImage", tag, tar, options })
      if (buildImpl) return buildImpl({ tag, tar, options })
      return { status: 200, json: null, text: `${JSON.stringify({ stream: "Successfully built" })}\r\n` }
    },
  }
}

/** ustar 单件读（与 `dockerfileTar` 独立复算——校验和/字段/收尾逐项）。 */
function readTarSingle(buffer) {
  const name = buffer.subarray(0, 100).toString("utf8").replace(/\0.*$/, "")
  const size = Number.parseInt(buffer.subarray(124, 136).toString("utf8").replace(/\0/g, "").replace(/^0+/, "") || "0", 8)
  const typeflag = buffer.subarray(156, 157).toString("utf8")
  const magic = buffer.subarray(257, 262).toString("utf8")
  const declared = Number.parseInt(buffer.subarray(148, 154).toString("utf8"), 8)
  let sum = 0
  for (let i = 0; i < 512; i++) sum += i >= 148 && i < 156 ? 32 : buffer[i]
  return {
    name,
    size,
    typeflag,
    magic,
    checksumOk: declared === sum,
    content: buffer.subarray(512, 512 + size).toString("utf8"),
    tailZero: buffer.subarray(512 + size).every((byte) => byte === 0),
  }
}

/** 取抛（以抛收场——出 = 错对象；未抛 ⇒ 断言失败）。 */
async function thrown(fn) {
  try {
    await fn()
  } catch (e) {
    return e
  }
  assert.fail("预期抛错——未抛")
}

/** 假 fetch（拉取路由面——记录调用；恒 200 空流）。 */
function recordEngine() {
  const calls = []
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, method: options.method ?? "GET", headers: options.headers ?? null })
    return { status: 200, text: async () => "", arrayBuffer: async () => new ArrayBuffer(0) }
  }
  return { calls, fetchImpl }
}

async function call(base, method, path, { body, cookie } = {}) {
  const headers = { "content-type": "application/json" }
  if (cookie) headers.cookie = cookie
  const res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {
    /* 非 JSON 体：以 text 判 */
  }
  return { status: res.status, text, json, setCookies: res.headers.getSetCookie?.() ?? [] }
}

/** 进程内应用（账号面 + 凭据面 + 镜像族面；假 fetch 注入拉取面）。 */
async function startApp({ fetchImpl } = {}) {
  const db = openDb()
  await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  await MEMBERS.createMember(db, { username: "bob", role: "user", password: PASSWORD })
  const config = tempConfig("app")
  const routes = SERVER.createRouteTable()
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  CRED_ROUTES.registerRegistryCredRoutes(routes, { db, config })
  IMAGE_ROUTES.registerImageRoutes(routes, { db, config, ...(fetchImpl ? { fetchImpl } : {}) })
  const server = SERVER.createGatewayServer({ config, routes, log: null })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  const base = `http://127.0.0.1:${server.address().port}`
  const login = async (username) => {
    const res = await call(base, "POST", "/api/login", { body: { username, password: PASSWORD } })
    const line = res.setCookies.find((item) => item.startsWith(`${SESSION.SESSION_COOKIE}=`)) ?? null
    return line ? line.split(";")[0] : null
  }
  return {
    db,
    config,
    base,
    adminCookie: await login("admin"),
    userCookie: await login("bob"),
    audits: (kind) => db.prepare("SELECT * FROM audit_events WHERE type = 'sandbox_event' ORDER BY id").all().filter((row) => JSON.parse(row.detail ?? "{}").kind === kind),
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      db.close()
    },
  }
}

// ── 凭据纯函数（归一 ∥ 判据 ∥ X-Registry-Auth 组装）────────────────────────────────────────

test("凭据纯函数：主机归一（Hub 别名 ⇒ docker.io）∥ 镜像主机判据 ∥ X-Registry-Auth 组装（Hub 特例）", () => {
  assert.equal(CREDS.normalizeRegistryHost("  INDEX.DOCKER.IO "), "docker.io", "Hub 别名 ⇒ 归一 + 小写")
  assert.equal(CREDS.normalizeRegistryHost("hub.docker.com"), "docker.io")
  assert.equal(CREDS.normalizeRegistryHost("GHCR.io"), "ghcr.io")
  assert.equal(CREDS.normalizeRegistryHost("registry:5000"), "registry:5000", "含端口主机逐值")
  const badCases = [
    ["", /不可为空/],
    ["https://ghcr.io", /scheme/],
    ["ghcr.io/foo", /scheme|路径/],
    ["ghcr .io", /空白/],
    ["ghcr.io:99999", /端口/],
    ["x".repeat(201), /超长/],
  ]
  for (const [bad, pattern] of badCases) assert.throws(() => CREDS.normalizeRegistryHost(bad), pattern, `形非法：${bad.slice(0, 24)}`)
  assert.equal(CREDS.registryHostOfImage("nginx"), "docker.io", "裸名 ⇒ Hub")
  assert.equal(CREDS.registryHostOfImage("nginx:latest"), "docker.io", "单段带标签 ⇒ 剥标签后判 Hub（引擎同口径）")
  assert.equal(CREDS.registryHostOfImage("library/nginx"), "docker.io", "无主机段路径 ⇒ Hub")
  assert.equal(CREDS.registryHostOfImage("ghcr.io/acme/app"), "ghcr.io")
  assert.equal(CREDS.registryHostOfImage("ghcr.io/acme/app:v1"), "ghcr.io", "带标签主机引用（剥标签不误切主机）")
  assert.equal(CREDS.registryHostOfImage("registry:5000/foo/bar"), "registry:5000", "含端口主机段 ⇒ 主机")
  assert.equal(CREDS.registryHostOfImage("registry:5000/foo/bar:v1"), "registry:5000", "含端口主机段 + 标签")
  assert.equal(CREDS.registryHostOfImage("localhost/foo"), "localhost")
  const hub = JSON.parse(Buffer.from(CREDS.registryAuthHeader({ username: "u", secret: "s", host: "docker.io" }), "base64url").toString("utf8"))
  assert.deepEqual(hub, { username: "u", password: "s", serveraddress: "https://index.docker.io/v1/" }, "Hub 特例 serveraddress")
  const other = JSON.parse(Buffer.from(CREDS.registryAuthHeader({ username: "u", secret: "s", host: "ghcr.io" }), "base64url").toString("utf8"))
  assert.equal(other.serveraddress, "ghcr.io", "非 Hub ⇒ 主机逐值")
  const urnsafe = CREDS.registryAuthHeader({ username: "u", secret: "口令测试·密码", host: "ghcr.io" })
  assert.match(urnsafe, /^[A-Za-z0-9_-]+=*$/, "base64url 字母表（设计 API.md §2.5——无 `+`/`/`）")
  assert.equal(JSON.parse(Buffer.from(urnsafe, "base64url").toString("utf8")).password, "口令测试·密码", "非 ASCII 口令往返逐值")
  assert.notEqual(urnsafe, Buffer.from(JSON.stringify({ username: "u", password: "口令测试·密码", serveraddress: "ghcr.io" }), "utf8").toString("base64"), "与标准 base64 口径相异（非同一表）")
})

// ── 凭据 CRUD（加密落库 ∥ updated_at 两径 ∥ 撞主机/空提交 ⇒ 抛 ∥ 零回显）─────────────────────

test("凭据 CRUD（模块面）：加密落库 ∥ updated_at（裁定 B 写面维护）∥ 撞主机/空提交 ⇒ 抛 ∥ 视图零秘密", async () => {
  const db = openDb()
  const config = tempConfig("crud")
  const t0 = () => 1690000000000
  const row = CREDS.insertRegistryCredential(db, { host: "GHCR.io", username: "robot", secret: "tok-abc", now: t0, config })
  assert.deepEqual([row.host, row.username], ["ghcr.io", "robot"], "主机归一（小写）")
  assert.notEqual(row.secret_cipher, "tok-abc", "密文落库（≠ 明文）")
  assert.ok(String(row.secret_cipher).length > 0, "密文在场")
  assert.ok(!String(row.secret_cipher).includes("tok-abc"), "密文不含明文")
  assert.equal(row.updated_at, row.created_at, "插入 ⇒ updated_at 随 created_at 同拍")
  const key = CRYPTO.loadOrCreateCredentialKey(CRYPTO.credentialKeyPath(config))
  assert.equal(CRYPTO.decryptSecret(row.secret_cipher, key), "tok-abc", "AES-256-GCM 往返逐值")
  const view = CREDS.credentialView(row)
  assert.deepEqual(Object.keys(view).sort(), ["createdAt", "host", "id", "updatedAt", "username"], "视图键集（零秘密字段）")
  assert.ok(!JSON.stringify(view).includes("tok-abc"), "视图零秘密值")

  CREDS.insertRegistryCredential(db, { host: "docker.io", username: "u1", secret: "s1", now: t0, config })
  const dupErr = await thrown(() => CREDS.insertRegistryCredential(db, { host: "INDEX.DOCKER.IO", username: "u2", secret: "s2", now: t0, config }))
  assert.match(dupErr.message, /已有凭据/, "Hub 别名同判 ⇒ 撞主机人话")

  const before = db.prepare("SELECT * FROM registry_credentials WHERE host = 'ghcr.io'").get()
  const t1 = () => 1690000999000
  const patched = CREDS.updateRegistryCredential(db, before.id, { secret: "tok-xyz" }, { now: t1, config })
  assert.notEqual(patched.secret_cipher, before.secret_cipher, "secret 重设 ⇒ 密文重写")
  assert.equal(CRYPTO.decryptSecret(patched.secret_cipher, key), "tok-xyz", "重写后往返逐值")
  assert.equal(patched.updated_at, new Date(t1()).toISOString(), "updated_at 刷新（update 径）")
  assert.equal(patched.created_at, before.created_at, "created_at 不动")
  const emptyErr = await thrown(() => CREDS.updateRegistryCredential(db, before.id, {}, { config }))
  assert.match(emptyErr.message, /至少一键/, "空提交 ⇒ 抛")
  const clashErr = await thrown(() => CREDS.updateRegistryCredential(db, before.id, { host: "index.docker.io" }, { config }))
  assert.match(clashErr.message, /已有凭据/, "改 host 撞主机 ⇒ 抛（库零变）")
  const badHostErr = await thrown(() => CREDS.insertRegistryCredential(db, { host: "https://ghcr.io", username: "u", secret: "s", config }))
  assert.match(badHostErr.message, /scheme/, "host 含 scheme ⇒ 抛")

  const removed = CREDS.revokeRegistryCredential(db, before.id)
  assert.equal(removed.host, "ghcr.io", "删 ⇒ 出被删行（审计取 host）")
  const goneErr = await thrown(() => CREDS.revokeRegistryCredential(db, before.id))
  assert.equal(goneErr.code, "not_found", "二次删 ⇒ 404（HttpError）")
  const list = CREDS.listRegistryCredentials(db)
  assert.deepEqual(list.map((item) => item.host), ["docker.io"], "列表余一行")
  assert.ok(!JSON.stringify(list).includes("s1"), "列表零秘密")
})

// ── N71：派生构建全链（就位四步逐条 ∥ Dockerfile 逐行 ∥ tar 体 ∥ 审计）─────────────────────────

test("N71 派生构建全链：就位四步逐条 ∥ Dockerfile 逐行（乙档三段）∥ 单 Dockerfile tar ∥ tag 内容寻址 ∥ 审计 image_derive", async () => {
  const db = openDb()
  const config = tempConfig("n71")
  const row = CREDS.insertRegistryCredential(db, { host: "docker.io", username: "robot", secret: "s3cret-token", now: () => 1690000000000, config })
  const hit = CREDS.authForImageRef(db, "nginx", { config })
  assert.ok(hit && hit.host === "docker.io" && typeof hit.auth === "string", "Hub 裸名命中 docker.io 凭据（供拉取注入）")

  const client = fakeClient({ refs: { "thincoder-sandbox:1": "sha256:std" } })
  const out = await DERIVE.ensureDerivedImage(client, {
    baseRef: "nginx:latest",
    standardImage: "thincoder-sandbox:1",
    registryAuth: hit.auth,
    audit: { db, actor: "admin", actorId: 1, runnerId: 7, workspaceId: 3 },
    now: () => 1690000000000,
  })

  assert.deepEqual(client.calls.map((item) => item.op), ["imageDetail", "pullImage", "imageDetail", "imageDetail", "imageDetail", "buildImage"], "就位四步序列逐条")
  const pull = client.calls[1]
  assert.deepEqual([pull.image, pull.tag], ["nginx", "latest"], "拉取入参 = 解析后名/签")
  assert.equal(pull.options.auth, hit.auth, "拉取携 X-Registry-Auth（命中凭据的头逐值）")
  assert.equal(client.calls[3].ref, "thincoder-sandbox:1", "读标准镜像（供体）")
  const expectedTag = `thincoder-sandbox:base-${createHash("sha256").update("nginx:latest|sha256:pulled|sha256:std").digest("hex").slice(0, 12)}`
  assert.equal(client.calls[4].ref, expectedTag, "tag 探 = 内容寻址值")
  const build = client.calls[5]
  assert.equal(build.tag, expectedTag, "构建 tag 逐值")
  assert.equal(build.options.timeoutMs, 10 * 60 * 1000, "构建超时 = 10 分钟专用常量")

  const tar = readTarSingle(build.tar)
  assert.ok(tar.checksumOk, "tar 校验和合（独立复算）")
  assert.deepEqual([tar.name, tar.typeflag, tar.magic], ["Dockerfile", "0", "ustar"], "构建体 = 单件 Dockerfile（ustar）")
  assert.equal(tar.size, Buffer.byteLength(tar.content), "size 字段逐值")
  assert.ok(tar.tailZero, "收尾零块在")
  assert.deepEqual(tar.content.trimEnd().split("\n"), [
    "FROM nginx:latest",
    "COPY --from=thincoder-sandbox:1 /usr/local/bin/node /usr/local/bin/node",
    'RUN test -x /usr/local/bin/node && /usr/local/bin/node -e "process.exit(Number(process.versions.node.split(\'.\')[0]) >= 24 ? 0 : 1)"',
    "COPY --from=thincoder-sandbox:1 /opt/thincoder/app /opt/thincoder/app",
    "USER 1000:1000",
    "WORKDIR /workspace",
    'CMD ["/usr/local/bin/node","/opt/thincoder/app/shell/index.mjs"]',
  ], "Dockerfile 逐行（乙档三段 + USER/WORKDIR/CMD）")

  assert.deepEqual(out, { base: "nginx:latest", tag: expectedTag, cached: false, pulled: true }, "响应 = 实构 + 已拉（四键）")
  const audits = db.prepare("SELECT * FROM audit_events").all()
  assert.equal(audits.length, 1, "审计一行（仅实构才落）")
  assert.deepEqual(JSON.parse(audits[0].detail), { kind: "image_derive", runnerId: 7, workspaceId: 3, base: "nginx:latest", tag: expectedTag, cached: false, pulled: true }, "detail 键集逐值")
  assert.equal(row.host, "docker.io", "凭据行在场（引用）")
})

// ── N72①：缓存命中（零构建 ∥ 零审计）──────────────────────────────────────────────────────────

test("N72① 缓存命中：派生 tag 在场 ⇒ 采用（cached:true）∥ 零构建调用 ∥ 零审计", async () => {
  const db = openDb()
  const tag = DERIVE.deriveTag("nginx:latest", "sha256:base", "sha256:std")
  const client = fakeClient({ refs: { "nginx:latest": "sha256:base", "thincoder-sandbox:1": "sha256:std", [tag]: "sha256:derived" } })
  const out = await DERIVE.ensureDerivedImage(client, { baseRef: "nginx:latest", standardImage: "thincoder-sandbox:1", audit: { db, actor: "admin" } })
  assert.deepEqual(out, { base: "nginx:latest", tag, cached: true, pulled: false }, "缓存命中（pulled:false——零拉取）")
  assert.equal(client.calls.filter((item) => item.op === "buildImage").length, 0, "零构建调用")
  assert.equal(client.calls.filter((item) => item.op === "pullImage").length, 0, "零拉取调用")
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n, 0, "缓存命中不落审计（零噪声）")
})

// ── N72②：缺省腿（假件契约——无绑定 ⇒ 零派生调用 ∥ 零新审计行）──────────────────────────────────

test("N72② 缺省腿（假件契约）：无绑定 ⇒ customBaseOf = null ⇒ 跳过镜像就位 ⇒ 参数集逐值不变 ∥ 零新审计行", async () => {
  assert.equal(DERIVE.customBaseOf({ base_image: null }), null, "NULL ⇒ 标准镜像")
  assert.equal(DERIVE.customBaseOf({}), null, "缺列/缺键 ⇒ 标准镜像")
  assert.equal(DERIVE.customBaseOf({ base_image: "   " }), null, "空白 ⇒ 标准镜像")
  assert.equal(DERIVE.customBaseOf({ base_image: "nginx:latest" }), "nginx:latest", "有绑定 ⇒ 自定义引用")
  const db = openDb()
  const client = fakeClient({ refs: { "thincoder-sandbox:1": "sha256:std" } })
  const settingsImage = "thincoder-sandbox:1"
  // 消费契约形（建盒链 ④ 决策点——执行面舱调用）：无绑定 ⇒ 不进派生链，Image 恒 = settings.image
  for (const workspace of [{ base_image: null }, { base_image: null }, { base_image: "" }]) {
    const base = DERIVE.customBaseOf(workspace)
    const image = base === null ? settingsImage : (await DERIVE.ensureDerivedImage(client, { baseRef: base, standardImage: settingsImage })).tag
    assert.equal(image, settingsImage, "参数集 Image = settings.image 逐值")
  }
  assert.equal(client.calls.length, 0, "缺省腿 ⇒ 零新增调用（调用计数不变）")
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n, 0, "缺省腿 ⇒ 零新审计行")
})

// ── B74 ∥ E57：构建失败两形（层失败 ⇒ 日志尾 + 处置句）─────────────────────────────────────────

test("B74/E57 层失败两形：构建流错误（客户端抛 ∥ 返流内 error）⇒ 400 人话含日志尾 + 处置句 ∥ 零审计", async () => {
  const logTail = "The command '/bin/sh -c test -x /usr/local/bin/node' returned a non-zero code: 127"
  const cases = [
    {
      name: "客户端抛（api 形——status 记 200）",
      buildImpl: () => {
        throw new DOCKER.DockerError("api", `引擎构建失败：${logTail}`, { status: 200, apiMessage: logTail })
      },
    },
    {
      name: "返流内 errorDetail（200 流）",
      buildImpl: () => ({ status: 200, json: null, text: `${JSON.stringify({ stream: "Step 3/7" })}\r\n${JSON.stringify({ errorDetail: { message: logTail }, error: logTail })}\r\n` }),
    },
  ]
  for (const item of cases) {
    const db = openDb()
    const client = fakeClient({ refs: { "nginx:latest": "sha256:base", "thincoder-sandbox:1": "sha256:std" }, buildImpl: item.buildImpl })
    const err = await thrown(() => DERIVE.ensureDerivedImage(client, { baseRef: "nginx:latest", standardImage: "thincoder-sandbox:1", audit: { db, actor: "admin" } }))
    assert.ok(err instanceof DERIVE.DeriveError, `域错（${item.name}）`)
    assert.match(err.message, /派生构建失败/, "步名在场")
    assert.ok(err.message.includes("returned a non-zero code: 127"), "日志尾逐句在场")
    assert.ok(err.message.includes(DERIVE.RUN_HINT), "处置句（musl/Alpine/shell）在场")
    const mapped = DERIVE.deriveFailure(err)
    assert.deepEqual([mapped.status, mapped.code], [400, "invalid_request_error"], "映射 400")
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n, 0, "失败不落审计")
  }
})

// ── B74：供体缺（人话「先备供体镜像」）─────────────────────────────────────────────────────────

test("B74 供体缺：标准镜像不在节点 ⇒ 停 + 人话「先备供体镜像」∥ 零构建 ∥ 零审计", async () => {
  const db = openDb()
  const client = fakeClient({ refs: { "nginx:latest": "sha256:base" } })
  const err = await thrown(() => DERIVE.ensureDerivedImage(client, { baseRef: "nginx:latest", standardImage: "thincoder-sandbox:1", audit: { db, actor: "admin" } }))
  assert.ok(err instanceof DERIVE.DeriveError)
  assert.ok(err.message.includes(DERIVE.SUPPLIER_HINT), "人话「先备供体镜像」在场")
  assert.equal(client.calls.filter((item) => item.op === "buildImage").length, 0, "零构建调用")
  assert.deepEqual([DERIVE.deriveFailure(err).status, DERIVE.deriveFailure(err).code], [400, "invalid_request_error"], "映射 400")
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n, 0, "失败不落审计")
})

// ── B75：形非法 ⇒ 零外呼 ─────────────────────────────────────────────────────────────────────

test("B75 形非法 ⇒ 零外呼：`@`（digest）∥ 空 ∥ 超长 ∥ 含空白/控制字符（引用守卫先于一切节点调用）", async () => {
  const client = fakeClient({})
  const badRefs = ["nginx@sha256:deadbeef", "", "x".repeat(300), "ngi nx:latest", "nginx:latest\u0000"]
  for (const bad of badRefs) {
    const err = await thrown(() => DERIVE.ensureDerivedImage(client, { baseRef: bad, standardImage: "thincoder-sandbox:1" }))
    assert.ok(err instanceof DERIVE.DeriveError, `形非法必抛（${bad.slice(0, 20) || "<空>"}）`)
  }
  assert.equal(client.calls.length, 0, "零节点调用（形校验先于一切外呼）")
  const badSupplier = await thrown(() => DERIVE.ensureDerivedImage(client, { baseRef: "nginx:latest", standardImage: "bad ref" }))
  assert.ok(badSupplier instanceof DERIVE.DeriveError, "供体引用含空白同拒")
  assert.equal(client.calls.length, 0, "仍零外呼")
})

// ── E56 ∥ E57：失败映射（400/502 两径）──────────────────────────────────────────────────────

test("E56/E57 失败映射：拉取败 ⇒ 400 携引擎原文 + 凭据句 ∥ 不可达 ⇒ 502 ∥ 构建超时 ⇒ 502 + 重试幂等句", async () => {
  const db = openDb()
  // E56 拉取败（凭据错——引擎 401 原文）
  const denied = fakeClient({
    refs: { "thincoder-sandbox:1": "sha256:std" },
    pullImpl: () => {
      throw new DOCKER.DockerError("api", "引擎拉取失败：unauthorized: incorrect username or password", { status: 401, apiMessage: "unauthorized: incorrect username or password" })
    },
  })
  const deniedErr = await thrown(() => DERIVE.ensureDerivedImage(denied, { baseRef: "private.registry:5000/app:v1", standardImage: "thincoder-sandbox:1", audit: { db, actor: "admin" } }))
  assert.ok(deniedErr instanceof DERIVE.DeriveError)
  assert.ok(deniedErr.message.includes("unauthorized: incorrect username or password"), "携引擎原文")
  assert.ok(deniedErr.message.includes("凭据不符？"), "凭据处置句在场")
  assert.deepEqual([DERIVE.deriveFailure(deniedErr).status, DERIVE.deriveFailure(deniedErr).code], [400, "invalid_request_error"], "拉取败 ⇒ 400")
  // E56 节点不可达 ⇒ 502（沿 E50 口径）
  const dead = {
    imageDetail: async () => {
      throw new DOCKER.DockerError("unreachable", "节点不可达：http://127.0.0.1:9（fetch failed）")
    },
    pullImage: async () => {},
    buildImage: async () => {},
  }
  const deadErr = await thrown(() => DERIVE.ensureDerivedImage(dead, { baseRef: "nginx:latest", standardImage: "thincoder-sandbox:1" }))
  assert.deepEqual([DERIVE.deriveFailure(deadErr).status, DERIVE.deriveFailure(deadErr).code], [502, "upstream_error"], "不可达 ⇒ 502")
  // E57 构建超时 ⇒ 502 + 如实句
  const slow = fakeClient({
    refs: { "nginx:latest": "sha256:base", "thincoder-sandbox:1": "sha256:std" },
    buildImpl: () => {
      throw new DOCKER.DockerError("timeout", "节点响应超时（600000ms）：http://node/v1.44/build")
    },
  })
  const slowErr = await thrown(() => DERIVE.ensureDerivedImage(slow, { baseRef: "nginx:latest", standardImage: "thincoder-sandbox:1", audit: { db, actor: "admin" } }))
  const mapped = DERIVE.deriveFailure(slowErr)
  assert.deepEqual([mapped.status, mapped.code], [502, "upstream_error"], "超时 ⇒ 502")
  assert.ok(mapped.message.includes("重试幂等"), "如实句（引擎侧可能仍在跑——重试幂等）")
  assert.equal(DERIVE.deriveFailure(new Error("unexpected")).status, 502, "非预期 ⇒ 502（沿 dockerFailure 兜底同形）")
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n, 0, "失败均不落审计")
})

// ── 凭据四端点（HTTP：CRUD ∥ 审计两 kind ∥ 零回显 ∥ 401/403）────────────────────────────────

test("凭据四端点（HTTP）：增/改/删/列 ∥ 审计 registry_credential_set/revoke 键集 ∥ 响应与审计零秘密 ∥ 401/403", async () => {
  const app = await startApp()
  try {
    const api = (method, path, options = {}) => call(app.base, method, path, { cookie: app.adminCookie, ...options })
    assert.deepEqual((await api("GET", "/api/admin/sandbox/registry-credentials")).json, { credentials: [] }, "空表")
    assert.equal((await call(app.base, "GET", "/api/admin/sandbox/registry-credentials")).status, 401, "无会话 ⇒ 401")
    assert.equal((await call(app.base, "GET", "/api/admin/sandbox/registry-credentials", { cookie: app.userCookie })).status, 403, "user 角色 ⇒ 403")

    const badHost = await api("POST", "/api/admin/sandbox/registry-credentials", { body: { host: "https://ghcr.io", username: "u", secret: "s" } })
    assert.equal(badHost.status, 400, "host 含 scheme ⇒ 400")
    const badSecret = await api("POST", "/api/admin/sandbox/registry-credentials", { body: { host: "ghcr.io", username: "u", secret: "  " } })
    assert.equal(badSecret.status, 400, "secret 空 ⇒ 400")
    assert.equal(app.db.prepare("SELECT COUNT(*) AS n FROM registry_credentials").get().n, 0, "拒 ⇒ 库零变")

    const created = await api("POST", "/api/admin/sandbox/registry-credentials", { body: { host: "GHCR.io", username: "robot", secret: "tok-123" } })
    assert.equal(created.status, 200)
    assert.deepEqual(Object.keys(created.json.credential).sort(), ["createdAt", "host", "id", "updatedAt", "username"], "响应键集（零秘密）")
    assert.deepEqual([created.json.credential.host, created.json.credential.username], ["ghcr.io", "robot"], "归一主机 + 用户名")
    assert.ok(!created.text.includes("tok-123"), "响应零秘密值")
    const cipher = app.db.prepare("SELECT secret_cipher FROM registry_credentials WHERE host = 'ghcr.io'").get().secret_cipher
    assert.ok(!cipher.includes("tok-123"), "库面密文（非明文）")

    const dup = await api("POST", "/api/admin/sandbox/registry-credentials", { body: { host: "index.docker.io", username: "u2", secret: "s2" } })
    assert.equal(dup.status, 200, "docker.io 另一主机可入")
    const dup2 = await api("POST", "/api/admin/sandbox/registry-credentials", { body: { host: "GHCR.IO", username: "u3", secret: "s3" } })
    assert.equal(dup2.status, 400, "撞主机 ⇒ 400")

    const list = await api("GET", "/api/admin/sandbox/registry-credentials")
    assert.deepEqual(list.json.credentials.map((item) => item.host), ["ghcr.io", "docker.io"], "列表 id 序")
    assert.ok(!list.text.includes("tok-123") && !list.text.includes("s2"), "列表零秘密")

    assert.equal((await api("PATCH", "/api/admin/sandbox/registry-credentials/999", { body: { username: "x" } })).status, 404, "不存在 ⇒ 404")
    const emptyPatch = await api("PATCH", `/api/admin/sandbox/registry-credentials/${created.json.credential.id}`, { body: {} })
    assert.equal(emptyPatch.status, 400, "空提交 ⇒ 400")
    const patched = await api("PATCH", `/api/admin/sandbox/registry-credentials/${created.json.credential.id}`, { body: { username: "robot2" } })
    assert.equal(patched.status, 200)
    assert.equal(patched.json.credential.username, "robot2", "键级改（出现键 = 应用）")
    const clash = await api("PATCH", `/api/admin/sandbox/registry-credentials/${created.json.credential.id}`, { body: { host: "docker.io" } })
    assert.equal(clash.status, 400, "改 host 撞主机 ⇒ 400")
    assert.equal(app.db.prepare("SELECT host FROM registry_credentials WHERE id = ?").get(created.json.credential.id).host, "ghcr.io", "撞主机 ⇒ 库零变")

    const revoked = await api("DELETE", `/api/admin/sandbox/registry-credentials/${created.json.credential.id}`)
    assert.deepEqual([revoked.status, revoked.json], [200, { ok: true }], "删 ⇒ { ok: true }")
    assert.equal((await api("DELETE", `/api/admin/sandbox/registry-credentials/${created.json.credential.id}`)).status, 404, "二次删 ⇒ 404")

    const sets = app.audits("registry_credential_set").map((row) => JSON.parse(row.detail))
    const revokes = app.audits("registry_credential_revoke").map((row) => JSON.parse(row.detail))
    assert.deepEqual(sets, [
      { kind: "registry_credential_set", host: "ghcr.io", username: "robot" },
      { kind: "registry_credential_set", host: "docker.io", username: "u2" },
      { kind: "registry_credential_set", host: "ghcr.io", username: "robot2" },
    ], "set 三行（增二 + 改一——detail 键集零秘密）")
    assert.deepEqual(revokes, [{ kind: "registry_credential_revoke", host: "ghcr.io" }], "revoke 一行（detail = kind+host）")
    assert.ok(!JSON.stringify(sets).includes("tok-123") && !JSON.stringify(sets).includes("s2"), "审计零秘密值")
  } finally {
    await app.close()
  }
})

// ── 拉取注入（审计 auth 布尔键两径 ∥ 解密失败 ⇒ 400 人话）─────────────────────────────────────

test("拉取注入：命中凭据 ⇒ 审计 auth:true ∥ 未命中 ⇒ auth:false ∥ 响应零改 ∥ 密文坏 ⇒ 400 人话", async () => {
  const engine = recordEngine()
  const app = await startApp({ fetchImpl: engine.fetchImpl })
  try {
    const runner = REGISTRY.insertRunner(app.db, { name: "node-base", address: "http://127.0.0.1:9", runtime: { apiVer: "1.44" } })
    const api = (method, path, options = {}) => call(app.base, method, path, { cookie: app.adminCookie, ...options })
    CREDS.insertRegistryCredential(app.db, { host: "docker.io", username: "u", secret: "s", now: () => 1, config: app.config })

    const hitPull = await api("POST", `/api/admin/sandbox/runners/${runner.id}/images/pull`, { body: { image: "nginx" } })
    assert.deepEqual([hitPull.status, hitPull.json], [200, { ok: true, image: "nginx", tag: "latest" }], "响应形零改")
    const missPull = await api("POST", `/api/admin/sandbox/runners/${runner.id}/images/pull`, { body: { image: "ghcr.io/acme/app:v1" } })
    assert.equal(missPull.status, 200, "未命中 ⇒ 匿名照走（现状零改）")
    assert.deepEqual(app.audits("image_pull").map((row) => JSON.parse(row.detail)), [
      { kind: "image_pull", runnerId: runner.id, image: "nginx:latest", auth: true },
      { kind: "image_pull", runnerId: runner.id, image: "ghcr.io/acme/app:v1", auth: false },
    ], "audit auth 布尔键两径逐值")
    assert.equal(engine.calls.length, 2, "两次拉取皆达引擎")
    const hitHeader = engine.calls[0].headers?.["x-registry-auth"] ?? null
    assert.ok(typeof hitHeader === "string" && hitHeader.length > 0, "命中凭据 ⇒ 携 X-Registry-Auth（真链：路由 → 凭据 → docker.mjs 传输）")
    assert.deepEqual(JSON.parse(Buffer.from(hitHeader, "base64url").toString("utf8")), { username: "u", password: "s", serveraddress: "https://index.docker.io/v1/" }, "头体逐键（base64url——Hub 特例）")
    assert.equal(engine.calls[0].url.includes("/images/create?fromImage=nginx&tag=latest"), true, "拉取 URL 逐值")
    assert.ok(!("x-registry-auth" in (engine.calls[1].headers ?? {})), "未命中 ⇒ 匿名（零该头）")

    app.db.prepare("UPDATE registry_credentials SET secret_cipher = ? WHERE host = 'docker.io'").run(`broken|${Buffer.alloc(16, 7).toString("base64")}|broken`)
    const broken = await api("POST", `/api/admin/sandbox/runners/${runner.id}/images/pull`, { body: { image: "nginx" } })
    assert.equal(broken.status, 400, "密文不可解 ⇒ 400")
    assert.match(broken.json.error.message, /凭据解密失败/, "人话指向重新录入")
    assert.equal(engine.calls.length, 2, "拒在引擎调用之前（零外呼）")
    assert.equal(app.audits("image_pull").length, 2, "失败不落审计")
  } finally {
    await app.close()
  }
})
