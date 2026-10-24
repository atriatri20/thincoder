# Thincoder Server · 客户端接入（client/CLIENT）

> 板块 = server ∥ 本档 = client 域（客户面登录 ∥ 客户端 token ∥ `/api/client/*` 数据面命名空间骨架）；板总览 = `PROJECT.md`（文档地图 = §3）。
> 需求单源 = `docs/server/requirements/PROJECT.md`（功能点 31 ∥ AC-31）；本域回指 = `PROJECT.md` §7（AC-31 判据 = 本档 §4）。
> 端侧机制单源 = `docs/core/design/TEAM.md`（登录流程 ∥ 派生 provider ∥ 三端同构——本档不复制）。

## 1. 客户端 token 面

- **形**：登录 token = **一枚具名成员 key**（落 `api_keys` 表——形 `sk-tc-` + 32 字节随机 base64url；存储 = `sha256(明文)` hex；明文仅登录响应回显一次——同 key 签发语义）。全文 = §5 KD-SV-61。
- **端标签**：落 `api_keys.name`（如 `CLI@台式机`；端侧生成 ∥ 服务端校验沿用 key 名口径——trim 后 ≤40 字符；缺省/空 ⇒ 默认名助手 `key-N`——单源 = `accounts/ACCOUNTS.md` §1.1）。
- **不设过期**：`api_keys` 无过期列——天然成立；**逐请求查库**（KD-SV-11 不变——吊销下一次请求即判）。
- **签发 ∥ 吊销**：每次登录签发一枚（**不受 20 上限**——沿「轮转 ∥ CLI 不受限」先例，`accounts/ACCOUNTS.md` §1.1）；退出 = 吊销该枚（软删——行保留）；不自动清理旧 token（「列表可撤销」= 用户面机制——口径①）。
- **轮换（端侧可达——team-token-rotation 批 · 台账 #1238）**：`POST /api/client/rotate` = **单把换发**——吊销当前登录 token（`revokeKey`——逐请求查库 ⇒ 旧 token 下一请求即 401）+ 同标签重签一枚（`issueKey`——`name` = 原值）；**不动同成员他枚**（逐端各持一枚——非全换，KD-SV-63）；新明文一次性回显（同登录语义）。
- **已认账（token 生命周期——口径①）**：累积可预期（每次登录一枚 ∥ 无过期 ∥ 不自动清理）——清理 = 用户面（key 列表逐把吊销——§1「列表可撤销」面）；换 server 重登（单登录态覆盖）⇒ 旧 server 的 token 不在本机——撤销径 = 旧 server 控制台 key 列表（`webui/ME.md` §2.1 ∥ `GET /api/me` ∥ CLI `key revoke`）。
- **兼作 `/v1` 凭据**：同一 token 两用——`/api/client/*`（数据面，本档）∥ `/v1/*`（模型面，`gateway/API.md` §2）；校验单源 = `verifyKey`（账号 key 面）；客户端面门面 = 复用 `requireApiKey`（`thincoder-server/src/gateway/routes.mjs:25`）。**无第二校验面**。
- **列表可撤销**：token 即具名 key——列表/吊销面 = 既有「我的 · key」页（`webui/ME.md` §2.1）∥ `GET /api/me` 成员行 key 清单 ∥ CLI `key list` / `key revoke`（`ops/OPS.md` §3）；**零新列表端点**。
- **与控制台会话面关系**：`sessions` 表（浏览器 cookie 面——KD-SV-12）**零改、零复用**——客户端登录不落 `sessions` 表；两族凭证物理分离（cookie ∥ `Authorization: Bearer`）保持（理由 = §5 KD-SV-61）。
- **审计**：登录成/败 = 既有 `login_success` / `login_failure`（detail 携 `surface:"client"`）；签发/吊销/轮换 = 既有 `key_issue` / `key_revoke` / `key_rotate`（detail 同携 surface）；**审计零增型**（零迁移——现行型面 = **十七型**（v24——`accounts/ACCOUNTS.md` §2.1），不因本面增型）。

## 2. 端点表（`/api/client/*`——数据面命名空间骨架）

（错误形 = `gateway/API.md` §3 全码复用——**零新码**；写端点仅收 `application/json`，其它 content-type ⇒ 400——分派层统一）

| 方法 + 路径 | 鉴权 | 语义 |
|---|---|---|
| `POST /api/client/login` | 公开 | 端侧直登：`{username, password, label?}` ⇒ 200 `{ok:true, token, member:{id,name,username,role}}`（token 明文一次性）；失败 ⇒ 401 `invalid_credentials`（同措辞——防枚举面保持）；锁定期 ⇒ 429 `too_many_attempts` + `Retry-After`（沿 `login-guard` 双维锁——`accounts/ACCOUNTS.md` §2）；体非法 ∥ 缺字段 ∥ label 非法 ⇒ 400 `invalid_request_error` |
| `POST /api/client/logout` | 登录 token | 退出：吊销当前 token 对应 key 行（`revokeKey`——立即生效）⇒ 200 `{ok:true}`；无 ∥ 无效 token ⇒ 401 `invalid_api_key`（端侧视同「已失效」——照清本地） |
| `POST /api/client/rotate` | 登录 token | 轮换当前登录 token（**单把换发**——KD-SV-63）：吊销当枚（`revokeKey`——立即生效，旧 token 下一请求即 401）+ 同标签重签一枚（`issueKey`——`name` = 原值）⇒ 200 `{ok:true, token}`（新明文一次性——同登录回显语义）；零体（不读体）；无 ∥ 无效 token ⇒ 401 `invalid_api_key`（零变更——审计零行） |
| `GET /api/client/me` | 登录 token | 当前登录读数：`{member:{id,name,username,role}, token:{label, createdAt}}`——供端侧校验 token 仍有效 ∥ 当前态显示 |

- **命名空间**：客户端数据面 = `/api/client/*`（`EVOLUTION.md` §2 决策点「客户端数据面命名空间」钉死）；后续团队面（台账 ∥ 记忆 ∥ 在场 ∥ 会话）同命名空间扩端点——各面设计轮落。
- **角色**：本阶段零角色判定（任何成员可用）；admin 专属面 = 后续各面自定。
- **注册面**：`thincoder-server/bin/thincoder-server.mjs` 一行注册（沿既有注册行制——装配面 = `registerClientRoutes`（**既有**——`thincoder-server/src/client/routes.mjs:28` 导出在册；本批 rotate 入同一注册面，零新注册行））。
- **判权口径**：无 ∥ 无效 token ⇒ 401 `invalid_api_key`（三态不区分——防信息泄露，沿 /v1 面）。

## 3. 本域文件与行数预算（本域族行）

| 档 | 行数 | 职责 |
|---|---|---|
| `thincoder-server/src/client/routes.mjs`（已落） | **77 ⇒ ≈92**（+15——rotate 处理器 ≈13 ∥ 档头一句；复用 members/keys/guard/audit 单源——零改） | 客户端面（§1 ∥ §2——login ∥ logout ∥ rotate ∥ me 四处理） |
| `thincoder-server/bin/thincoder-server.mjs`（已落盘） | **≈184** | 装配面 |
| **小计** | **≈276**（92 + 184） | —— |

- `thincoder-server/package.json`（30 行）：`prepublishOnly` = 3×`node --check` 单行（`bin/thincoder-server.mjs` ∥ `src/ops/update.mjs` ∥ `deploy/converge.mjs`——现读）；**批内单测不入链**（现行纪律——见下行）；**store 域零改**（本域零迁移——结构版本现读 v24）。
- 单元测试档：客户端接入单元测试档（服务端面——估 ≈260 行）；**本批（轮换）单元测试档**：`docs/batches/2026-10-15-team-token-rotation.test.mjs`（≈**320**——服务端面 + 核面 + 三端结构机检）。
  **入链判定 = 不入链**——本件跨面（服务端 + 核 + 三端结构），沿「跨面件无宿主产品链」先例（`docs/core/design/TEAM.md` §4）；现行纪律 = 批内单测随批档归档、不进产品链（`docs/core/design/TESTING.md`）⇒ **零随正**（`package.json` `prepublishOnly` 保持 3×`node --check`；门禁件数断言件现无在盘件）。

## 4. 验收判据（机检——回指 AC-31）

| 需求 AC | 设计级判据 | 载体 |
|---|---|---|
| AC-31①（三端登录入口在册） | 端侧面 = `docs/core/design/TEAM.md` §5；服务面 = login 端点三态（200 ∥ 401 ∥ 429——§6 用例 N37/B27） | 单元测试档 + 收口轮 |
| AC-31②（token 落本地 ∥ 明文密码零落盘） | login 200 携 `token`（仅一次回显）∥ 服务端库存 hash（实读 `api_keys.key_hash` 行在场）∥ 端侧零密码字段（`docs/core/design/TEAM.md` §5） | 单元测试档 |
| AC-31③（登录后自动 provider——模型可用） | 服务面：该 token 对 `/v1/models` 与 `/v1/chat/completions` 可用（同 key 面判据——`gateway/API.md` §2）；端侧派生条目面 = `docs/core/design/TEAM.md` §5 | 单元测试档 + 收口轮 |
| AC-31④（未登录 ⇒ 团队各面不启用） | 端侧登录态门 = `docs/core/design/TEAM.md` §5；服务面 = 无 token 请求 `/api/client/*` ⇒ 401 | 单元测试档 + 收口轮 |
| AC-31⑤（退出 ⇒ 登录 token 吊销（`api_keys` 行）+ 团队面关闭） | logout ⇒ 该 token 下一次 `/api/client/*` 与 `/v1/*` 请求 ⇒ 401（吊销即判——无缓存）；端侧关闭面 = `docs/core/design/TEAM.md` §5 | 单元测试档 + 收口轮 |
| （本批——轮换增判据；需求档回笔 = 主 agent：AC-31 后补行） | rotate ⇒ 200 携新 token ∥ 旧 token 下一请求（`/api/client/me` ∥ `/v1/models`）⇒ 401 ∥ `api_keys` 双行（旧 `revoked` ∥ 新 `active`——名同）∥ 审计 `key_rotate` 单行（`surface:"client"`）；无 ∥ 无效 token ⇒ 401（零变更） | 单元测试档 |

## 5. 关键决策（本域）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-61 | **客户端 token = 一枚具名成员 key**（`api_keys` 行；端标签落 `name`；无过期天然；`/api/client/*` 与 `/v1/*` 同源校验） | ① token 须兼作 /v1 凭据（AC-31③「模型可用」）——校验/记账/配额/归因全链零改（`usage.key_id` 引用天然成立）；② 「不设过期」= api_keys 无过期列（零改）；③ 「端标签 + 列表可撤销」= `name` + 既有列表面（`/api/me` ∥ key 页 ∥ CLI）——零新设施；④ 单秘密（一次登录一枚——口径①） |
| KD-SV-62 | **客户端数据面命名空间 = `/api/client/*`**（骨架 = login ∥ logout ∥ rotate ∥ me；鉴权 = 登录 token（Bearer——`requireApiKey` 单源复用）） | ① `EVOLUTION.md` §2「客户端数据面命名空间」决策点钉死——后续团队四面同空间扩；② 鉴权单源 = 账号 key 校验——零第二校验面；③ 与 `/api/*`（会话 cookie 面）∥ `/v1/*`（模型面）三分清晰 |

## 6. 用例（本域 · 单元测试档）

| # | 用例 | 判据 |
|---|---|---|
| N37 | login 成功 ⇒ 200 携 token；`api_keys` 新行（name = label ∥ key_hash = sha256(token)）；审计 `login_success` + `key_issue` 各一行 | 单元测试档 |
| B27 | 错密码 ∥ 不存在用户 ⇒ 401 同措辞；5 连败 ⇒ 429 + `Retry-After`；label 缺省 ⇒ 默认名 `key-N`；label >40 字符 ⇒ 400 | 单元测试档 |
| E28 | logout ⇒ 吊销；再请求（`/api/client/me` ∥ `/v1/models`）⇒ 401；已吊销再 logout ⇒ 401（端侧清本地语义） | 单元测试档 |
| N39 | token 兼用：`GET /api/client/me` ∥ `GET /v1/models` 同 token 皆 200 | 单元测试档 |
| N40 | rotate 成 ⇒ 200 携新 token；旧 token 下一请求（`/api/client/me` ∥ `/v1/models`）⇒ 401；`api_keys` 双行（旧 revoked ∥ 新 active——名同）；审计 `key_rotate` 一行（`surface:"client"`） | 单元测试档 |
| E29 | 无 ∥ 无效 token 调 rotate ⇒ 401 `invalid_api_key`（库零变——审计零行）；非 JSON 体 ⇒ 400 | 单元测试档 |

## 7. 本域边界（不做）

- 不做 token 过期/续期 ∥ 不做逐端吊销之外的复杂度 ∥ 不做授权码/device-flow（已搁置） ∥ 不做离线缓存（需求 §3）。
- 轮换边界（team-token-rotation 批）：不做全换（他端 token ∥ 沙盒工作区 key 不动——KD-SV-63）∥ 不做改名（标签沿用）∥ 不做控制台新面（webui 零改——新明文须落端侧 config，控制台无投递径；列表新旧两行自然可见）。
- 不做客户端面角色/管理端点（后续面自定） ∥ 不做控制台新页（口径④——控制台未登录自然不可见）。
- 不做登录 token 与手工 key 的区分列（登录 token 在既有 key 列表自然可见；如需区分标记 ⇒ 另轮）。
- 不触 `sessions` 表 ∥ 不触登录守卫/审计机制 ∥ 零迁移。

## 8. 上抛/余项（本域——R50 逐字）

> 服务端设计档 `design/PROJECT.md` §9 同类行 = 保位 stub（指向本节）。

| # | 项 | 类型 | 处置建议 |
|---|---|---|---|
| R50 | **需求读法披露 + 随正件 + 部署收尾**：① 披露（需求读法——供复核）：§2:31①「复用既有账号/密码散列与会话机制」本设计读法 = 复用散列校验 + 登录守卫 + token 签发（**`sessions` 表不用**——浏览器 cookie 面专属；客户端 token 落 `api_keys`，理由 = token 须兼作 /v1 凭据 ∥ 无过期 ∥ 记账归因——KD-SV-61）；如用户本意 = 复用 `sessions` 表 ⇒ 翻案点（与「不设过期」「模型可用」两条相抵面需重裁）∥ ② 披露（存储面）：token 明文落 `~/.thincoder/config.json`（0600 先例——沿 provider apiKey 口径；keychain 不用）；登录 token 在控制台「我的 · key」页自然可见（不设区分列——如需标记 ⇒ 另轮）∥ ③ 披露（能力面）：CLI 密码隐藏回显 = 新建能力（非 TTY 回落 stdin 行读——脚本化直登径）；端标签自动生成（≤40 裁剪）∥ ④ 随正件（父侧落）：`thincoder-server/package.json`——门禁链撤除（`prepublishOnly` = 3×`node --check`；批内单测不入链）；批内单测件随用后即删退场∥ ⑤ 部署收尾（父侧执行）：server 侧零迁移零配置——新代码部署（镜像/进程重建）+ 三端拾新版本；收口轮实走（CLI/VSC/桌面各一轮：登录 → 模型可用 → 退出） | 披露（上抛——如无异议按设计实施；部署收尾 = 父侧） | 评审/用户复核 |
| R51 | **team-token-rotation 批（本域轮换面）——回笔与随正**：① 需求档回笔（主 agent 笔）：server 需求 AC-31 增轮换判据行（旧即失效 ∥ 新可用 ∥ 单把换发）；端侧需求两处「轮换 = 待立端点」句随正（vsc `requirements/WEBVIEW.md` F-W21 ∥ desktop `requirements/PROJECT.md` 团队卡行）∥ ② 随正件（本席——同拍，D5 窗遇他批在评则顺延）：`gateway/API.md` :15 索引行（已落）∥ `docs/vsc/design/SETTINGS.md` §2.20 ∥ `docs/vsc/design/WEBVIEW.md` :247 ∥ `docs/desktop/design/SETTINGS.md` :324 ∥ `docs/desktop/design/UI.md` :424 ∥ `docs/desktop/design/IPC.md` §2 团队族行 + 白名单（53 ⇒ 54）∥ `docs/cli/design/CLI-ENTRY.md` §2 `team` 行 ∥ `docs/cli/design/TUI-COMMANDS.md` §5.5 ∥ `thincoder-server/package.json`（**零改登记**——入链判定 = 不入链；`prepublishOnly` 保持 3×`node --check` 单行）∥ 门禁件数断言件（现无在盘件——零随正）∥ `accounts/ACCOUNTS.md` 四处（**收正时点 = 实施轮同拍**——`:62` `{ keyHint }` ⇒ `{ keyHint, surface? }` ∥ `:14` 审计列增 `key_rotate` ∥ `:84-86` surface 族列/写点计数随正 ∥ `:127` 端点枚举 ⇒ 四端点）∥ ③ 披露：控制台（webui）零改——轮换 = 端侧动作（新明文须落端侧 config；控制台无投递径）；控制台既有 key 列表自然反映新旧两行 | 披露（上抛——如无异议按设计实施） | 评审/用户复核 |
