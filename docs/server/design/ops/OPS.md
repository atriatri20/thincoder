# Thincoder Server · 运维面（ops/OPS）

> 板块 = server ∥ 本档 = ops 域（配置 ∥ 首启引导 ∥ 运维 CLI ∥ 部署面 ∥ 启动/停机/日志 ∥ 可靠性面：备份恢复 ∥ 指标与告警 ∥ 容量与降级）；板总览 = `PROJECT.md`（文档地图 = §3）。
> 本域回指 = `PROJECT.md` §7（默认内网部署；公网部署须开 `tls` ∥ AC-7⑦ 引导幂等——机制 = 本档 §2）。

## 1. 配置面（`config.json`）

```json
{
  "host": "192.168.1.10",
  "port": 8787,
  "db": "data/gateway.db",
  "autoUpdate": "notify",
  "trustProxy": false,
  "usageRetentionDays": 90,
  "alert": { "webhookUrl": "https://hooks.example.com/thincoder-server" },
  "bootstrap": { "username": "admin", "password": "env:TC_SERVER_ADMIN_PASSWORD" },
  "providers": [
    { "preset": "deepseek", "apiKey": "env:DEEPSEEK_API_KEY" },
    { "preset": "qwen", "name": "bailian", "apiKey": "env:DASHSCOPE_API_KEY", "models": ["qwen3.5-plus", "qwen3.7-max"] },
    { "name": "internal", "baseURL": "http://10.0.0.9:8000/v1", "apiKey": "", "models": ["deepseek-v3"] }
  ],
  "embedding": { "baseURL": "http://10.0.0.5:11434/v1", "model": "bge-m3" }
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `host` | 是 | 监听地址：**默认内网部署**填内网接口地址（如 `192.168.x.x` ∥ `10.x.x.x`）；公网部署须同时开 `tls` 段（机制 = `gateway/PUBLICNET.md` §2）；填 `0.0.0.0` 时启动警告（仅单接口机可接受） |
| `port` | 否 | 缺省 `8787` |
| `db` | 否 | SQLite 库路径（相对 = 本配置档所在目录）；缺省 `data/gateway.db` |
| `autoUpdate` | 否 | 更新档位：`false`（关——零检查） ∥ `"notify"`（检查 + 日志） ∥ `"auto"`（检查 + 自装）；缺省 `"notify"`；非法值 ⇒ 拒启（机制 = §5.4） |
| `trustProxy` | 否 | 客户端 IP 口径：`false`（缺省——IP = 连接对端地址） ∥ `true`（读 `X-Real-IP` 头——仅当服务前置于可信代理；直连 ∥ 内置 TLS 部署保持 `false`）；登录防爆破 IP 维消费（`accounts/ACCOUNTS.md` §2） |
| `proxy` | 否 | 上游出口代理（形 = `{ "uri": "http://host:port" }`——代理目标本体，非门槛）：在场时仅**逐渠 `proxy: true`** 的 provider 上游请求（chat 转发 ∥ 模型发现）经此代理（逐渠独立——无全局闸）；缺省/缺位 = 零代理；非对象形态（数组 ∥ 数字）∥ `uri` 非法（非字符串 ∥ 空串 ∥ 非 URL ∥ scheme 非 `http:`——仅 `http:` 收）⇒ 拒启（fail-closed）；启动 warn 两条（触发/文案 = `gateway/API.md` §6 KD-SV-55）——① 明文 `http:` uri（密钥外发提示）∥ ② 任一条目旗 `true` 而 `uri` 缺位（直连——旗未生效）；改动生效 = 重启（配置文件不热载——§10 在案）；机制全文 = `gateway/API.md` §6 KD-SV-55 |
| `usageRetentionDays` | 否 | 保留窗（天；**用量（含 `usage_daily`/`quota_counters` 两派生表）与审计事件同窗**——单一旋钮）：正整数 ∥ `null`（不限——保留全量）；缺省 `90`；非正整数 ∥ 非法值 ⇒ 拒启（机制 = `metering/METERING.md` §1 ∥ `accounts/ACCOUNTS.md` §2.1） |
| `tls` | 否 | 内置 TLS 段六键：`enabled` ∥ `certPath` ∥ `keyPath`（相对 = 配置档目录） ∥ `publicHost` ∥ `publicPort`（缺省 `443`——只被重定向 `Location` 消费） ∥ `redirectPort`（`null` = 不开重定向）；缺位 = 明文 HTTP（零行为变化）；启用期证书不可读/非法 ⇒ 拒启；生效 = 重启；机制 = `gateway/PUBLICNET.md` §2 |
| `rateLimits` | 否 | 匿名入口限流：`enabled`（缺省 `true`） ∥ `authPerMin`（缺省 `20`） ∥ `publicPerMin`（缺省 `120`）；固定窗 60 s、粒度 = IP × 端点类；超限 429 `rate_limit_error` + `Retry-After`；生效 = 重启；机制 = `gateway/PUBLICNET.md` §2 |
| `alert` | 否 | 告警 webhook（可靠性批——暂缓，机制未落）：形 = `{ "webhookUrl": "http(s)://…" }`；出场非对象 ∥ `webhookUrl` 非法（非字符串 ∥ 空 ∥ 非 URL ∥ scheme 非 http(s)）⇒ 拒启（fail-closed）；缺省/缺位 = 告警投递禁用（服务照常）；投递 = JSON POST（超时 5s ∥ 失败仅日志 ∥ 去抖 10 分钟窗）；生效 = 重启（配置文件不热载——§10 在案）；控制台写面 = 「服务配置」卡告警行（`alertWebhookUrl`——`""` ⇒ 删段） |
| `bootstrap` | 否 | 首启引导凭据（`username` ∥ `password`——支持 `env:`）；仅零 admin 时消费（§2——幂等） |
| `providers[]` | 否 | **首启种子**（一次性导入——矩阵见下；此后控制台管理——`gateway/API.md` §2.2）。**两种条目形**：预设形（`preset` = 预设名——缺省字段展开，见下）∥ 手写形（`name` ∥ `baseURL` ∥ `models` 自备）。两形共有字段：`name`（预设形可省——缺省 = 预设名） ∥ `baseURL`（OpenAI 兼容根——预设形可省） ∥ `apiKey`（可空——空则不发 Authorization 头；支持 `env:` 引用——载入不解析，引用保形） ∥ `models`（开放清单——预设形可省；**条目两形**：字符串 = 上游模型名（无别名）∥ 对象 `{ name, alias }`（配别名——对外标识 = alias）；无别名时对外标识 = `provider/model`；KD-SV-59；控制台编辑位 = 服务模型页「别名」组——`webui/ADMIN.md` §2.1③） ∥ `proxy`（布尔——true = 该渠上游请求经代理；缺省/非真 = 直连——机制 = `gateway/API.md` §6 KD-SV-55） |
| `embedding` | 否 | 嵌入引擎（旁路进程——内网）接入段：`baseURL` ∥ `model` ∥ `apiKey`（选填——本地引擎常无鉴权）。**缺位 ∥ `null` = 禁用态**（服务照常起 + 启动警告一条——`/v1/embeddings` ⇒ 404 `model_not_found` 消息明示未配置；控制台向量卡「未配置」态可创建——见下「配置写面」）；**在场 ⇒ 严格校验**（`baseURL` 须 http(s) ∥ `model` 非空串——非法 ⇒ 拒启）；机制全文 = §8 KD-SV-57 |

- 字符串值支持 `env:变量名` 前缀（加载期解析；变量缺位 ⇒ 启动失败）——真实 key 可只住环境变量。**例外 = `providers[].apiKey`**：载入/种子期不解析（引用保形）；解析 = provider 注册表构建期——缺位 ⇒ 启动拒启 ∥ 保存 400（`gateway/API.md` §2.2）。
- 更新源 = 环境变量 `NPM_CONFIG_REGISTRY`（可指内网镜像——npm 同名配置；自检与自装同源）；缺省 `https://registry.npmjs.org`（机制 = §5.4）。
- **预设形（内建 provider 预设）**：条目给 `preset` = 预设名 ⇒ 缺省字段由预设表展开——`name` 缺省 = 预设名；`baseURL` ∥ `models` 缺省取预设值（预设表零 `model` 键——`models` 无缺省；条目未自备 `models` ⇒ 空清单，经「模型发现」面勾选**）；
  条目自带者**覆盖**预设值（区域端点 ∥ 自选中继清单）；`apiKey` 只住条目（预设表零密钥）。未知预设名 ⇒ 拒启（fail-closed——报错列可用名）。落点 = `thincoder-server/src/ops/presets.mjs`（静态表 + 展开函数；§6 在册）。
- **预设双消费面**：① 配置种子（预设形条目——上条）；② 控制台「从预设快速添加」起手（同表单源——`gateway/API.md` §2.2）。
- **预设覆盖范围（起步 21 家）**：抄录自 `thincoder-core/config-presets.mjs`（**只读参考面**——自持表（快照——KD-SV-17 ∥ 引核口径 KD-SV-78）；对照取数 = 只读、非运行期依赖）的 OpenAI 兼容子集：
  `deepseek` ∥ `kimi` ∥ `kimi-code` ∥ `glm` ∥ `glm-code` ∥ `qwen` ∥ `qwenplan` ∥ `mimo` ∥ `mimoplan` ∥ `openai` ∥ `gemini-openai` ∥
  `grok` ∥ `mistral` ∥ `volcengine` ∥ `hunyuan` ∥ `tokenhub` ∥ `huawei` ∥ `siliconflow` ∥ `openrouter` ∥ `groq` ∥ `opencode-go`。
  排除 4 家：`claude` ∥ `gemini` ∥ `opencode-go-anthropic`（`format` 面——非 OpenAI 协议）∥ `minimax`（`chatPath` 面——非标准路径；本服务转发固定 `baseURL` + `/chat/completions`）。每键只载 `{ baseURL }`（不消费 `thinking`/`reasoningEffort`/`maxTokens` 一族——客户端侧参数）。
- **漂移纪律（快照非活链）**：CLI 表更新后由后续批**手工同步**本表（同步笔 = 表 ∥ 本名单行 ∥ 漂移件三处同改）；漂移检 = 单元测试档断言（server 键集 = CLI 表 OpenAI 兼容子集 ∥ 同键 `baseURL` 逐值相等——重跑批档件即报）；取数 = 单元测试档只读引入核表（import ∥ 解析皆可——只读对照、非运行期依赖，引核口径 KD-SV-78——运行期面零涉）。
- **种子导入矩阵（`providers[]` × 库——控制台为常态管理面）**：库空 + 段在场 ⇒ 首启导入（日志 `providers_imported`——`env:` 引用**原样保形**入库）；库空 + 段缺/空 ⇒ 允许（启动警告「零 provider——控制台添加」）；库非空 + 段在场 ⇒ **忽略 + 警告**（`providers_config_ignored`——库为准，提示清理该段）；库非空 + 段缺 ⇒ 正常。
- **幂等与边角**：导入后库非空 ⇒ 不再导；控制台删空后若段仍在 ⇒ 重启按矩阵重导（配置段 = 「初始种子」口径——不再需要请移除该段）。
- **种子导入残 nuance**：种子导入 = 一次性；导入后库行留存（**无回滚**——要撤 = 控制台手删）；`env:` 引用解析 = 注册表构建期 ⇒ **先修好环境变量再入库**（否则入库即拒启——修复 = 补变量后重启）。
- **provider 密钥形态（库面）**：明文 ∥ `env:` 引用并存（明文 = 部署机文件权限自担；引用 = 秘密只住环境）；界面回显掩码（规则 = `gateway/API.md` §2.2）；**永不入日志**。
- **条目校验单源** = `thincoder-server/src/ops/config.mjs` 导出（`validateProviderEntry` ∥ `validateProviderEntries`）——三径调用：配置载入 ∥ 启动构建/种子 ∥ 控制台保存（`gateway/API.md` §2.2）；**别名校验**（KD-SV-59）：非空 ∥ 不含斜杠 ∥ 无首尾空白；
  **全服唯一**（别名 vs 别名 ⇒ 拒启/保存 400——唯一性三径同助手）；**别名与带前缀名形上不相交**（别名无斜杠 ∥ 前缀名含斜杠 ⇒ 唯一撞法互斥）。
- **启动校验（fail-closed）**：`host` 缺失 ∥ 种子/库内 provider `name` 缺/空 ∥ `name` 含 `/` ∥ `name` 重名（providers 间） ∥ **同 provider 内**模型重名 ∥ `baseURL` 非 http(s) ∥ **未知预设名** ∥ `trustProxy` 非布尔 ∥ `usageRetentionDays` 非正整数且非 `null`
  ∥ `tls` 段非法（非对象 ∥ 数组 ∥ `enabled` 非布尔 ∥ 启用期证书不可读或上下文建不出 ∥ `publicHost`/`publicPort`/`redirectPort` 非法 ∥ `redirectPort` = `port`） ∥ `rateLimits` 段非法（非对象 ∥ 数组 ∥ `enabled` 非布尔 ∥ 两阈值越界）
  ∥ `embedding` 在场非对象 ∥ 在场缺 `baseURL`/`model`（或 `baseURL` 非 http(s)）
  ∥ **别名非法**（空 ∥ 含斜杠 ∥ 首尾空白 ∥ 跨 provider 重名）
  ⇒ 非零退出 + 明确报错；`bootstrap` 在场时 `password` ≥8 字符（否则启动失败）。**零 provider = 允许态**（服务照常起 + 警告；控制台/种子为两条配置路径）。
  **零 embedding = 允许态**——嵌入面禁用 + 启动警告一条（「嵌入引擎未配置（config.json 缺 embedding 段）——/v1/embeddings 禁用；配置后重启生效」）；机制全文 = §8 KD-SV-57。
- provider `name` 校验缘由（对外标识 = `provider/model` 首斜杠切分）：`name` 缺/空 ∥ 含 `/` ⇒ 前缀形不可解析（清单列示而派发 404）；`name` 重名 ⇒ 派发歧义。
- 对外模型标识 = **别名（配了）∥ `provider/model`（未配）**——别名 = 唯一显示名与请求名（KD-SV-59）；未配时 = `provider/model`（**首斜杠切分**——首段 = provider `name` ∥ 余段 = 上游模型名（可含斜杠）；两段非空；裸名不解析（别名形除外）；**同名模型跨 provider 并存且各自可达**）；`/v1/models` = 对外标识清单。
- 模板 = `thincoder-server/config.example.json`（已落盘——预设形 ∥ 手写形并存）；真档 = `thincoder-server/config.json`（部署机本地——不入 git）。
- provider key 轮换 = 控制台改 provider 并保存（**保存即热生效**——机制 = `gateway/API.md` §2.2）。
- **配置写面（控制台——`#/admin/system`「服务配置」卡（含 `proxy.uri` 行 + 连通测试块——`webui/SYSTEM.md` §2.2） + 向量卡）**：可写项 = `autoUpdate` ∥ `trustProxy` ∥ `usageRetentionDays` ∥ `proxy.uri`（顶层段） ∥ `embedding.{baseURL,model,apiKey}` ∥ `alert.webhookUrl`（顶层段——可靠性批；`""` ⇒ 删段）
  ∥ `tls.{enabled,certPath,keyPath,publicHost,publicPort,redirectPort}`（顶层段——证书只存路径，内容永不回显） ∥ `rateLimits.{enabled,authPerMin,publicPerMin}`（顶层段）；
  只读展示 = `host` ∥ `port` ∥ `db`（部署拓扑项——改端口 = 自断连接 ∥ 改库 = 迁移动作；**定则例外显式说明**：不做写面）+ `bootstrap`（一次性——口令永不回显）+ `providers[]`（指针：常态管理 = 控制台 Provider 页）。
  读写形 = **文件面**（读 = config.json 现值（缺省回填展示） ∥ 写 = 读改写）；
  写路径 = ① 白名单（未知键 ⇒ 400）→ ② 合并原档（**保未知键**；`proxyUri: ""` ⇒ 删 `proxy` 段）→ ③ 门 = `resolveEnvRefs` + `validateConfig`（**载入面等价两跳**——写入的文件必可载入；不过 ⇒ 400 原报文，文件零变）→ ④ 原子写（同目录 tmp ⇒ `rename` 覆盖；写盘形 = 2 空格缩进 + 末尾换行——与现档同形）→ ⑤ 审计 `config_update`（detail = 键名清单；值永不入）。
  **生效 = 重启**（统一标注——配置文件不热载 §10 不破；不做运行态注入）。单写者（进程内同步读改写 + 部署模型单实例；跨进程并发 = 不做）。**写面前提 = 配置档所在目录可写**（容器路 = 配置目录级可写挂载——§5.1；裸机 = 部署者自管）。端点 = `gateway/API.md` §2.4；决策 = §8 KD-SV-56。
  **`embedding` 缺段创建**：缺段档保存向量卡 ⇒ 子键合并自动建段（从无到有——同一 PATCH）；缺段档 PATCH 他键照常过门（校验门容缺段——载入面等价两跳）；部分子键（仅 `baseURL` ∥ 仅 `model`）⇒ 400（在场须完整——载入门判）；控制台删除/清空 `embedding` 段 = 不做（编辑配置文件；PATCH `embedding: null` ⇒ 400）。机制全文 = §8 KD-SV-57。

## 2. 首启引导（幂等）

- 启动时库中零 `admin` 且 `bootstrap` 配置在场 ⇒ 建首个 admin（配置口令即初始密码；建后可从配置撤除——已存在不再读取）。
- 零 admin 且未配置 ⇒ 启动告警（服务器照常起——CLI `member add --role admin` 可补建）。
- 非零 admin ⇒ 引导整体跳过（不重建 ∥ 不改密——幂等口径）——KD-SV-15（§8）。

## 3. 运维 CLI（服务器本机运行）

```text
node src/ops/cli.mjs --config <配置档> <命令>
  member add <name> [--username <u>] [--role admin|user] [--password <pw>]   # 建成员（缺省 username = name ∥ user；无 --password ⇒ 生成临时密码打印一次）
  member list                           # 成员 + 角色 + 分模型覆盖数 + 本月已用
  member quota <name> <model> <N|none>  # 设分模型覆盖（model = 对外标识；none = 删覆盖）
  member passwd <name> [--password <pw>]  # 重置密码（本机兜底；无 --password ⇒ 生成打印一次）
  key issue <member>                    # 签发——全文只打印一次（+ key id）
  key revoke <id|hint>                  # 吊销（立即生效）
  key list [--member <m>]               # 提示形清单（无明文）
  usage reconcile [--month YYYY-MM] [--fix]  # 派生两表对账重算（vs 明细；--fix = 覆写）
```

- 落点 = `thincoder-server/src/ops/cli.mjs`（已落盘）；直开库（不经 HTTP）——服务器本机兜底。
- 与页面（`accounts/ACCOUNTS.md` §3 端点表）同库同语义（同一散列/吊销/轮转/重置口径）——页面 = 常态管理面，CLI = 本机通道。
- **审计**：改动类命令（`member add` ∥ `member passwd` ∥ `key issue` ∥ `key revoke`）各记一条审计事件（`actor = "cli"`——目录与列形 = `accounts/ACCOUNTS.md` §2.1）。

## 4. 启动/停机与日志

- 启动 = `thincoder-server/bin/thincoder-server.mjs`（已落盘）：argv（`--config`）→ 配置加载/校验 → 首启引导 → 开库/迁移（`store/STORE.md` §3）→ **保留清理（用量 + 审计事件：启动一次 + 24h 周期——`metering/METERING.md` §1 ∥ `accounts/ACCOUNTS.md` §2.1）** →
  **provider 运行时引导（种子导入 ∥ 注册表构建——§1）** → 路由族注册 → 项目同步调度器（60s 周期——`gateway/API.md` §2.9）→ 终端 hub → **告警 watchdog（60s 周期——可靠性批暂缓，未落；webhook 缺省 ⇒ 零行为）** → `node:http` 监听 → 就绪日志（`ready` 行含 `version` 字段——§5.4(g)）→ 盒 ticker（30s——§5.10）→ 更新自检（启动即检一次 + 6h——§5.4(a)）。
- 停机 = SIGINT/SIGTERM ⇒ 优雅收尾（停收新连 ∥ 清周期定时器（更新循环 ∥ 保留清理 ∥ 盒 ticker ∥ 项目同步 ∥ watchdog 同法） ∥ 收终端 ∥ 收 MCP 会话 ∥ 关闭库）。
  周期集合与装配断言逐条对齐 = §4.1「面 → 不变量对照」。
- 日志 = `thincoder-server/src/ops/log.mjs`（已落盘）：单行 JSON 到 stdout（逐请求一行 + 启动/引导/错误事件）；采集/落盘 = 部署面（§5——裸机 journald ∥ 容器 docker logs）。
- 启动失败（catch 段）⇒ `startup_failed` 日志 + 告警尽力投递（`alert.webhookUrl` 在案时——可靠性批暂缓，未落；投递失败仅 warn——进程退出码 1 不变）。
- **入口判据（bin 垫片形）**：主入口判定 = `argv[1]` 经 `realpathSync` 解析后与 `import.meta.url` 比对——npm 全局装（POSIX）= bin 符号链接形：`argv[1]` 为符号链接路径而 `import.meta.url` 为真身路径，不解析 ⇒ 判据恒假 ⇒ **静默退出 0**（`run` 从不执行）；路径不可解析 ⇒ 抛（显式报错——不静默）；模块被 import（非主入口）⇒ `run` 不自动执行（供测试导入）。判据行最终形（`:12` 邻增 import ∥ `:176`）：

```js
import { realpathSync } from "node:fs"
// 入口判据：argv[1] 先经 realpath 解析再比——npm 全局装（POSIX）bin = 符号链接形：argv[1] 非真身路径，不解析 ⇒ 判据恒假 ⇒ 静默退出 0；不可解析 ⇒ 抛（显式，不静默）。
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) await run()
```

### 4.1 装配面的持久断言（回归护栏）

- **最近先例**：包内测试面 = `thincoder-server/test/rc-resolve.mjs`（模块解析守卫，`node --test` 直跑）；跑法先例 = `thincoder-core/test/run.mjs:1-49`（`test/*.test.mjs` 单层收集 → `npm test`）。本档沿用「包内 `test/` ＋ `node --test`」，不改惯例；装配面探针缝无先例（缝形自定，理由见下）。
- **调研证据**：查过 `thincoder-server/test/`（现只有 `rc-resolve.mjs`——零装配面断言）、`thincoder-server/package.json`（无 `scripts.test`）、`thincoder-core/test/run.mjs`（跑法）；无同形先例。
- **现状缺口**：装配面（`thincoder-server/bin/thincoder-server.mjs`，实读 **241** 行）的验证只有进程内驱 `run()` 的整链冒烟——跑完即弃，不留常驻断言。删掉一处装配行（周期 ticker ∥ 路由族注册 ∥ 终端 hub 接线 ∥ 保留清理周期 ∥ 更新自检周期 ∥ 项目同步调度），全套测试仍绿 ⇒ **静默失效**。
- **落地形态**：常驻测试位 = `thincoder-server/test/assembly.test.mjs`（`node --test`）；断言 = **行为断言**（进程内驱 `run()` 跑一遍看结果），不读设计档查句子。
- **运行点**：命令 = `cd thincoder-server && npm test`——本批新增 `thincoder-server/package.json` 的 `"test": "node --test test/*.test.mjs"`（包内现无 `test` 脚本，实读）。**入发布门**：`prepublishOnly` 链尾追加 `&& npm test`（现链 = 3×`node --check`）。
- **寿命档位**：本档 = **常驻回归档**——§5.1「单元测试档不入任何门 ∥ 随批收口零留存」纪律的**显式例外**。理由：它是装配面唯一的持久断言，删掉即「删一行仍全绿」复发；一般单元测试档随批删除的纪律不变（`#1346` 的用例档仍属后者）。
- **产品面改动 = 族表驱动重构 ＋ 探针缝 ＋ 停机句柄**（三件同批）：族表驱动 = 路由族注册收进 `ROUTE_FAMILIES` 表循环（A1） ∥ 停机句柄 = `stop` 暴露清周期入口（A3） ∥ 探针缝 = `run(argv, log, { update = {}, onAssembled })`——装配完成、`listen` 前调用
  `onAssembled({ routes, server, redirectServer, config, timers, families, terminalHub, stop })`：
  `routes` = 路由表 · `server` = http 实例 · `redirectServer` = 重定向监听句柄（未开重定向 ⇒ `null`） · `config` = 载入后配置 · `timers` = 本次装配的周期句柄表（键 `prune` ∥ `box`）· `families` = 装配面自身的路由族表 · `terminalHub` = 终端 hub 实例 · `stop` = 优雅停机句柄。缺省不传 ⇒ 生产行为逐字不变。
- **钉住的不变量七条**（每条以「删掉对应装配行 ⇒ 该档必红」为准）：

| # | 不变量 | 断言形 | 删掉什么它会红 |
|---|---|---|---|
| A1 | 路由族全覆盖 | 装配面按 `ROUTE_FAMILIES` 表（`{ name, probe, register }`）循环注册；探针载荷 `families` = 该表。断言两条：① 逐族 `probe` 端点在 `routes` 中命中，且 `probe` 两两不重（不手抄清单）；② **集合面锚点** = `families.length === 22`——`22` 是测试档内**写死的独立常量**（不读表、不从 `families` 推算）；注册与断言同源时删掉整族表行，① 同步缩水仍绿，只有 ② 红。新增族 ⇒ 手动改常量（红即提醒入表） | 表内任一整族行（`families.length` 22 → 21） ∥ 表内任一 `register` 项 ∥ 任一注册函数体内的 `routes.add` 行 |
| A2 | 周期器件在册 | 拦截 `globalThis.setInterval`：装配后四个周期值在场——`USAGE_PRUNE_INTERVAL_MS`（24h）∥ `TICK_INTERVAL_MS`（30s）∥ 项目同步周期（60s）∥ `UPDATE_INTERVAL_MS`（6h） | 保留清理 `:139` ∥ 盒 ticker `:213` ∥ `projectSync.start()` `:197` ∥ `updater.start()` `:216` |
| A3 | 优雅停机清周期 | 经探针 `stop("SIGINT")` 触发：A2 记下的四个句柄全部进入清除面（`clearInterval` 或其 `stop()`），残留活周期 = 0 | `stop()` 的 `updater?.stop()` `:105` ∥ `clearInterval(pruneTimer)` `:107` ∥ `clearInterval(boxTicker)` `:111` ∥ `projectSync?.stop()` `:114` |
| A4 | 监听与自环接线 | 装配后**有界轮询** `server.listening`（≤2s · 步 10ms）；成立后 `server.address().port` = 配置端口，且真打 `GET /healthz` 得 200 | `serverRef = server` `:205` ∥ 监听块 `:207-210` |
| A5 | 终端 hub 接线 | `server.listeners("upgrade")` 恰 1 条且 `=== terminalHub.handleUpgrade`；另发一次带 `Upgrade` 头的裸请求，收到 hub 的响应（非连接重置） | `upgrade: terminalHub.handleUpgrade` 实参 `:204` ∥ `createTerminalHub` `:203` |
| A6 | 更新自检在册 | 经 `run` 第三参 `update` 替身（§5.4(c) 注入口径）：启动即检一次（替身被调恰 1 次）；`autoUpdate: false` ⇒ 零调用；停机后零再检 | `updater = createUpdater(...)` `:215` ∥ `updater.start()` `:216` |
| A7 | TLS 附加面在册 | `tls.redirectPort` 在场 ⇒ 探针载荷 `redirectServer` 非 `null`、`address().port` = `redirectPort`；触发 `stop()` 后该 server 已关闭；`SIGHUP` 监听断**基线增量恰 1**——装配前记 `base = process.listenerCount("SIGHUP")`，装配后断 `process.listenerCount("SIGHUP") - base === 1`（跨用例残留不兜底：删注册行 ⇒ 增量 0 ⇒ 红） | 第二监听装配行 ∥ `SIGHUP` 注册行 ∥ `stop()` 内的 `redirectServer.close()` |

- **面 → 不变量对照**（`:121` 自列的静默失效面逐条有归宿，无豁免项）：

| 装配面 | 不变量 |
|---|---|
| 周期 ticker（盒 30s） | A2 ∥ A3 |
| 路由族注册 | A1 |
| 终端 hub 接线 | A5 |
| 保留清理周期（24h） | A2 ∥ A3 |
| 更新自检周期（启动即检 + 6h） | A2 ∥ A6 |
| 项目同步调度（60s） | A2 ∥ A3 |
| 监听 ∥ 自环取数 | A4 |
| TLS 附加面（重定向监听 ∥ `SIGHUP` 注册） | A7 |

- **夹具规格**（用例侧；全部临时件，`finally` 复原）：
  - `config`：临时目录写 `config.json`（`host: "127.0.0.1"` · 端口 = 下面取的临时值 · `db` = 临时路径 · `autoUpdate: "notify"` · 零 `providers`；A7 用例另加 `tls` 段 = `enabled: true` ∥ `certPath`/`keyPath` 指向证书夹具 ∥ `publicHost: "localhost"` ∥ `redirectPort` = 第二端口）；`finally` 删目录。
  - 证书夹具：入库测试 PEM 放 `thincoder-server/test/fixtures/tls/`（`cert.pem` ∥ `key.pem`——自签、长期有效、只作测试材料）；测试期不现生成（零新包）。
  - 第二端口：`redirectPort` 先 `net.createServer().listen(0)` 读 OS 分配端口 ⇒ 关闭 ⇒ 再用（不写固定值；须 ≠ 配置端口——校验拒 `redirectPort = port`）。
  - 监听器复原：装配前快照 `process.listeners("SIGHUP")`；用例 `finally` 按差集 `removeListener` 摘掉装配期新增的监听——跨用例不堆积，A7 的「基线增量 = 1」因此不被残留污染。
  - 全局缝：装配前保存 `globalThis.setInterval` ∥ `clearInterval` 原值，替身记录（句柄 · 延迟）；`finally` 原值复原。
  - 触发面：A3 用探针 `stop`——**不用** `process.emit("SIGINT")`（监听器会在同进程跨用例堆积）。
- **反证义务**：实施轮必须逐条做「临时删一行 ⇒ 跑该档 ⇒ 红 ⇒ 恢复」，读数落实施记录；未做反证的不变量视为未验证。
- **机检基线**：`node scripts/doc-check.mjs --root .` 对比开工基线（悬空 ∥ 行宽逐档零新增），读数落实施记录。
- **边界**：不测业务端点语义（各域自有测试档）；不引入外部依赖（零新包）；不钉业务数据。


## 5. 部署面（两路统一：版本身份 = npm 包；容器 = 壳；守护两路：systemd ∥ 容器 restart）

### 5.1 分发（两路——版本身份 = npm 包 `@thincoder/server`，唯一真相）

- **版本身份 = npm 包**（两路同源）：升级 = 装 npm 新版 + 重启（§5.4）；**镜像 tag 不承担版本语义**（tag 只标壳——除 Node 基座换代外无需重建镜像）。
- **npm 路（包体就绪——发布动作 = 发布面轮）**：`thincoder-server/package.json` 转可发布形——撤 `private` ∥ 包名 = `@thincoder/server`（拟——发布轮验 registry 占用/scope 权限；更优命名可上抛） ∥ `bin` = `thincoder-server`
  ∥ `engines` node>=24 ∥ `prepublishOnly` 门禁 = 3×`node --check`（`bin` ∥ `src/ops/update.mjs` ∥ `deploy/converge.mjs`）→ `npm test`（**唯一例外** = §4.1 的常驻装配回归档——它要阻一件事，红即不发布）；其余**单元测试档不入任何门**（随批收口用后即删、零留存）。
  - `files` 白名单 = bin ∥ src ∥ public ∥ config.example.json ∥ README.md（`deploy/` 档组 = 仓内部署面——不入包）。
- **npm 路装机 = 前缀式**（自升前提）：`NPM_CONFIG_PREFIX` 指**服务账号可写目录**（建议 `/opt/thincoder-server/.npm-global`——与配置/数据同根）⇒ 装机（`npm i -g @thincoder/server`）与自升（服务进程内——§5.4）同前缀、免 sudo 重写；安放后该根目录整归服务账号（`chown -R`）。
- **Docker 路 = 壳镜像**（`thincoder-server/Dockerfile`——重设计）：基座 `node:24-slim` + 引导层（`thincoder-server/deploy/docker-entrypoint.sh`（已落盘 7 行） ∥ `thincoder-server/deploy/converge.mjs`（已落盘 197 行））；**App 代码由 npm 取装**——镜像本体只含壳（不带版本身份）。
- **构建期预装 = 上下文包体**（离线可运行性）：构建上下文（= **仓根**——`docker build -f thincoder-server/Dockerfile … .`）内 `npm pack` 双包（`thincoder-server` + `thincoder-render-core`——同各 `files` 白名单形）
  ⇒ `npm i -g` 一次装两包入镜像前缀（`/home/node/.npm-global`——node 账号自有）；**构建须 registry**（`@thincoder/core` 不在上下文 ⇒ `npm i -g` 随包解析须 registry——`@thincoder/render-core` 的 `^0.1.0` 由本地 tgz 满足；**构建非离线**）；预装版 = 构建时树版本（离线兜底副本——非版本身份，tag 不随）。
  - **依赖形 = 版本区间（零 `file:`）**（#1353）：`@thincoder/core` = `^0.10.7` ∥ `@thincoder/render-core` = `^0.1.0`——registry 包形随 `npm i -g` 解析（`file:` 形使 `npm i -g <tgz>` 失败且包不可发布；实证 = 双 tgz 装前缀 exit 0「added 3 packages」零 stub）；构建期双包预装（上行）= 离线兜底副本，与区间形并存（本地 tgz 满足 range）；**发布前置 = `@thincoder/render-core` 首发 registry**（当刻 registry 无此包——404，发布轮执行）。
- **运行期收敛**（entrypoint 口径——**重跑壳 = 收敛到配置版本：不留旧、不漂移**）：`TC_SERVER_VERSION`（env）三态——空 = 运行已装版本（零网络）∥ `x.y.z` = 钉（已装即用；缺则装；装不上 ⇒ 拒启）∥ `latest` = 追新（查 registry；不可达 ⇒ 回退已装 + 警告）；判定表 = §5.4（d）。
- **装位 ∥ 权限**：装位 = 镜像前缀（node 账号自有——自升可写）∥ `ENV PATH` 含 `<前缀>/bin`（入口 `exec thincoder-server` 依赖——或入口改用前缀绝对路径）；运行 = `USER node`（非 root）；`VOLUME /app/data` 保留——bind 卷须对容器内 node 账号可写（`chown 1000:1000 ./data` ∥ `./config`；uid 以镜像为准——官方基座 `useradd --uid 1000`）。
- **壳与 Node 基座**：基座 node:24 与包 `engines`（node>=24）同源；**Node 换代 = 重建镜像**（自升不动基座；触发 = 包 `engines` 变更）。
- Docker 配套随动：**仓根** `.dockerignore`（白名单两包；`thincoder-server/.dockerignore` 不再生效——上下文迁仓根后不复读取）+ `thincoder-server/docker-compose.yml`（样例——重写）：

```yaml
services:
  server:
    image: <registry>/thincoder-server:<tag>   # 待定占位（壳 tag——不含版本语义）
    restart: unless-stopped                     # 容器路守护（无 systemd 依赖）；崩溃自愈 ∥ 开机自起
    # healthcheck：继承自镜像（Dockerfile HEALTHCHECK——§5.9；docker compose ps 可见 (healthy)）
    environment:
      - TC_SERVER_VERSION=${TC_SERVER_VERSION:-}   # 钉死 = 写 x.y.z；留空（缺省空串）= 按镜像预装运行（离线）
      # - NPM_CONFIG_REGISTRY=http://<内网镜像>/          # 更新源（选填——§5.4）
    ports:
      - "8787:8787"                               # TLS 面（开 tls 段则同端口只讲 TLS——§5.6）
      - "8443:8443"                               # 重定向面（tls.redirectPort = 8443；可选）
    volumes:
      - ./config:/app/config                    # 配置目录（目录级 rw——写面原子写（同目录 tmp ⇒ `rename`）须之；须 chown 1000:1000）
      - ./certs:/app/certs:ro                   # 证书/私钥（只读；路径写进 tls.certPath ∥ tls.keyPath）
      - ./data:/app/data                        # SQLite 库（db 写 `/app/data/gateway.db`）；须 chown 1000:1000（部署清单 ③）
    env_file: .env
```

- **容器路配置形（写面前提）**：配置档 = `/app/config/config.json`（entrypoint 传 `--config`——`thincoder-server/deploy/docker-entrypoint.sh`）；挂载 = `./config` **目录级 rw**——单文件挂载下原子写（同目录 tmp ⇒ `rename`）换不了挂载点 ⇒ 保存必失败；容器路 `db` 取**绝对值** `/app/data/gateway.db`（配置档在 `/app/config`——相对形会落配置目录内）。
- **随正件（防泄面）**：`thincoder-server/.dockerignore` 添 `config/` ∥ `.env` ∥ `.env.*` ∥ `backups/`（构建上下文排除——自仓构建场景；密钥/口令永不入镜像层；`backups/` 为旧布局备份默认落位） ∥ 仓根 `.gitignore` 添 `thincoder-server/config/` ∥ `thincoder-server/backups/`（自仓运行场景——旧布局备份落位；库全量）∥ `.env` 行补 `.env.*` 变体（两防泄通道口径对称）。
- **既有部署迁移（单文件挂载 ⇒ 目录级）**：配置档移入 `./config/` ∥ 卷两行随正 ∥ `db` 改绝对形 ∥ `chown -R 1000:1000 ./config` ⇒ `docker compose up -d`。

- **待定占位**：镜像 registry ∥ 镜像名 ∥ tag（部署时确认——tag 不含版本语义）。

### 5.2 守护（两路并列——升级链的依赖面：进程退出 ⇒ 重起拾新版）

- **裸机路 = systemd**（npm 前缀式装机）：模板 = `thincoder-server/deploy/thincoder-server.service`（已落盘——随动）——`Restart=always` ∥ 开机自启（`enable`）。
- unit env（自升前提）= `NPM_CONFIG_PREFIX=<前缀>`（自升子进程同前缀——§5.1） ∥ `NPM_CONFIG_CACHE=<缓存目录>`（服务账号家目录缺位时 npm 缓存有落点）；`ExecStart=<前缀>/bin/thincoder-server --config <配置档>`（全局垫片）。
- 裸机日志 = stdout 单行 JSON 由 journald 收（`journalctl -u thincoder-server`）；安放 = 拷 unit 到 `/etc/systemd/system/` → `daemon-reload` → `systemctl enable --now thincoder-server`。
- **容器路 = restart 策略**（无 systemd 依赖）：`restart: unless-stopped`；日志 = `docker logs`；**收敛链 = 容器重起重跑壳引导**（自升成功 ⇒ 应用退出 ⇒ docker 重起 ⇒ converge 按 `TC_SERVER_VERSION` 收敛——§5.4）。
- **重起拾新版链（两路同律）**：进程退出（退出码 0 亦然）⇒ 守护重起 ⇒ 入口读到的 = 前缀内实际安装版本。
- **崩溃循环遏制**（可靠性批——口径说明）：systemd 默认起爆窗（10s 内 5 次起爆 ⇒ 停止重试；`systemctl status` 可见）∥ docker restart = 指数退避；进程起不来期间可见面 = journald/docker logs（`startup_failed` 告警为尽力投递——可靠性批暂缓，未落）。

### 5.3 配置（两路同）

- `config.json`（机本地 ∥ 不入 git）+ env（provider keys ∥ `bootstrap` 口令——首启建 admin 后可撤）；裸机路 env 落点 = systemd `EnvironmentFile`（缺省 `/etc/thincoder-server.env`——unit 模板在册）；容器路 = compose 卷（配置目录 + 数据——§5.1）+ `env_file: .env`。
- **部署面 env（更新/收敛族——机制 = §5.4）**：`TC_SERVER_VERSION`（容器路——壳收敛目标）∥ `NPM_CONFIG_REGISTRY`（更新源——自检与自装同源）∥ `NPM_CONFIG_PREFIX`（裸机——装机/自升前缀）∥ `NPM_CONFIG_CACHE`（裸机——npm 缓存落点）；更新档位 = `autoUpdate`（config 字段——§1，非 env）。

### 5.4 升级/回滚（两路同法：版本回指 + 重启）

- **（a）自检**：服务内周期自检——启动即检一次 + 每 6 小时（interval = 实现常量；不设配置项）；请求 = `<registry>/@thincoder%2fserver/latest`（直连 registry——scheme 随 `NPM_CONFIG_REGISTRY`（http(s) 皆可）；`%2f` 编码形；超时 5s 沿 CLI 先例）；**失败/404 静默**（与「无新版」同面——不打扰）；更新源 = `NPM_CONFIG_REGISTRY`（§5.3）。
- **（b）档位**（`autoUpdate`——§1；默认值论证）：`false` = 零检查（离线 ∥ 审计场景）；`"notify"` = 检查 + 日志（`update_available`——可见但不越权：**缺省**）；`"auto"` = 检查 + 自装（免值守——opt-in）。**抑制**：容器内 `TC_SERVER_VERSION` 为钉（非空且非 `latest`）⇒ 自装抑制（生效 = notify + 启动一条说明——升级 = 改钉值；防与壳收敛互搏）。
- **（c）自升执行器**：`npm i -g @thincoder/server@<版号>`（版号 = 检查所得具体值——防标签竞态；`--no-audit --no-fund`）子进程（超时 120s）；成功判据 = 退出码 0 ∧ 复读版本变更 ⇒ **走既有优雅停机路径**（`shutdown`——`signal: "self-update"`；停收新连 ∥ 在途至多 10s ∥ 关库）⇒ 退出 ⇒ 守护重起拾新版；
  **失败/超时恒保留旧版运行**（warn `update_install_failed`——含重装提示；下轮再检；可靠性批：同点接线告警投递——`onInstallFailed` 回调，缺省 null 零行为）；**注入口径**（单元测试档替身）：npm 命令 ∥ 前缀 ∥ 周期/超时常量走可覆盖参数 + `??` 缺省（缺省 = 生产行为不变；测试内 finally 复原）。
- **（d）容器收敛判定表**（`TC_SERVER_VERSION` × 已装——`converge.mjs`）：

| `TC_SERVER_VERSION` | 已装 | 行为 |
|---|---|---|
| 空（缺位 ∥ 空串） | 有 | 直接运行（零网络）——按镜像预装/已装运行；重建回预装版（追新请用 `latest`） |
| 空 | 无 | 拒启（未装 App 且未给 `TC_SERVER_VERSION`） |
| `x.y.z` | = x.y.z | 直接运行 |
| `x.y.z` | ≠ | 装 `x.y.z`（超时 120s）⇒ 复读校验 ⇒ 运行；装不上 ⇒ 拒启（三选修复：联网重试 ∥ 改钉值 ∥ 回滚旧值）——不漂移 |
| `latest` | 有 | 查 registry（超时 30s）：已最新 ⇒ 运行；有新 ⇒ 装 ⇒ 运行（**装失败/超时 ⇒ 回退已装 + 警告**）；不可达 ⇒ 回退已装 + 警告 |
| `latest` | 无 | 可达 ⇒ 装 ⇒ 运行（**装失败/超时 ⇒ 拒启**——无已装可跑）；不可达 ⇒ 拒启 |

- **（e）手工升级/回滚**（两路同法「版本回指 + 重启」）：
  - 裸机：升 = `npm i -g @thincoder/server@<新版>`（前缀式——§5.2）+ `systemctl restart thincoder-server`；回滚 = 装回旧版号 + restart。**注意**：`autoUpdate:"auto"` 时回滚会被下轮自检再自装——长期停留旧版 ⇒ 改 `false`/`"notify"`。
  - 容器：升 = 改 `TC_SERVER_VERSION`（或 `latest`）+ `docker compose up -d`（重跑壳收敛）；回滚 = 钉回旧版 + `up -d`（离线可指镜像预装版 = 构建时树版本）。
  - **共同注意**：升级不动数据（库文件零触）；库迁移只进不退（回滚前建议先备份——§5.5，可先跑演练脚本验证该快照）；自升窗内遇停机 ⇒ 半装窗风险（恢复 = 重装命令在日志与文档）。
- **（f）失败安全链**（绝不 brick——fail-closed 与消息在案）：自装失败/超时 ⇒ 旧版照常运行（进程不退）∥ 半装窗 ⇒ 旧进程内存内照常服务（树受损时恢复 = 重装）；装后启动失败 ⇒ 守护重起循环（systemd 起爆窗内失败态 ∥ docker 重起——日志可见）⇒ 回滚 = 版本回指 + 重启；容器钉版不可得 ⇒ **拒启**（重起循环使其可见——不静默漂移）。
- **（g）版本可见性**：启动日志 `ready` 行含 `version`（= 前缀内实际安装版本——journald/docker logs 直读；升级核对 = 重起读 ready 行）；容器收敛行 `converge: version=<v> source=<installed|installed-now|fallback>`。
  **形态选型**：ready 行字段（**选定**——零新面：无新端点 ∥ 无响应头改动）；轻端点（否——新面 ∥ 健康语义膨胀）∥ 响应头（否——热路径每响应加字段）；**控制台可见面 = `GET /api/system`**（KD-SV-24——同一进程内状态；两消费方：部署面 = ready 行 ∥ 控制台 = 端点）。
- **（h）前置声明（发布面接线点）**：`@thincoder/server` 发布前 ⇒ registry 查询 404 ⇒ **自检恒「无新版」（静默）**——机制就绪、接线在发布面轮（发布后自生效，无需改动）。

### 5.5 备份与恢复（在线快照 ∥ WAL 检查点 ∥ 恢复演练 ∥ RPO/RTO）

- 工具 = `thincoder-server/deploy/backup.mjs`（86 行）：`node deploy/backup.mjs --config <配置档> [--out <目录>]` ⇒ `<out>/gateway-<时间戳>.db`（`--out` 缺省 = 配置档旁 `backups/`）。
- 机制（三步一体）：① **在线快照** = node:sqlite `backup()`（WAL 安全、免停写窗；与运行实例并存；源库只读开——零触；node 自带——零外部工具）→
  ② **快照自检**（新增）：只读开快照 ⇒ `PRAGMA integrity_check` = `ok` ∧ `user_version` 可读 ∧ 关键表可查（`members` ∥ `api_keys` ∥ `usage`）——任一不过 ⇒ 退出 1（坏快照留盘——排障）→
  ③ **WAL 检查点**（新增）：对源库 `PRAGMA wal_checkpoint(TRUNCATE)`——成功 ⇒ WAL 复位（限额兜底）；busy ⇒ warn 续行（快照已得——不判失败）。
- 退出码：0 = 快照生成且自检过（stdout 一行 = 产物路径——可管道消费）∥ 1 = 失败（stderr 说明 + 告警投递，见下）。
- **失败告警**（可靠性批暂缓，未落）：快照生成失败 ∥ 自检不过 ⇒ `alert.webhookUrl` 在案时 POST `{ source:"thincoder-server/backup", event:"backup_failed", … }`（本档自含海报——零 App 依赖；投递失败仅 stderr 一行——不反噬退出码）；成功不投递（零噪声）。
- **RPO/RTO 声明**（口径 = 机制推导 + 实测回填，非拍数）：
  - RPO（进程崩溃）= **0**——WAL 提交即持久，重起自恢复；**掉电** = 丢最后若干提交（`synchronous=NORMAL`——计量档位在册，`store/db.mjs:322`）；
  - RPO（整机/介质丢失）= **最新快照龄**——定时器样例每日 ⇒ **≤24h**（调频 = 改 `OnCalendar`；频次越高 RPO 越小、盘占用越高）；
  - RTO = 恢复四步「停服 → 快照替换库 + 清 `-wal`/`-shm` 伴档 → 起服 → `/healthz` 200」——脚本段实测（演练读数 `copy_ms`+`verify_ms`）+ 人工段读数（收口轮真机回填）。
- **恢复演练**（可跑流程：`deploy/restore-drill.mjs`（≈170 行））：
  - 运行：`node deploy/restore-drill.mjs --config <配置档> [--backup <快照>] [--dir <演练目录>]`（缺省快照 = 配置档旁 `backups/` 最新 `gateway-*.db` ∥ 演练目录 = 配置档旁 `restore-drill/`）；
  - 步 = ① 定位快照（缺 ⇒ 退出 1「无快照可演练」）② 复制到演练目录（同名覆盖——演练目录专用）③ 只读开 + 三判据（`integrity_check`=`ok` ∥ `user_version` 数值可读 ∥ 关键表行数可读）④ 对源比对（源库可读 ⇒ `members`/`providers` 行数与 `user_version` 逐一相等；源不可读 ⇒ 跳 + 注行）⑤ 读数与退出码；
  - **判据**：全过 ⇒ 退出 0，stdout `PASS` + `copy_ms ∥ verify_ms` + 各表行数（= RTO 脚本段实测源）∥ **失败判据**：任一不过 ⇒ 退出 1 + `FAIL: <原因>`（演练副本留盘——排障）；
  - 周期建议：随发布 ∥ 季度（部署方流程——脚本即判据；不设 timer，按需执行）。
- 定时器样例（systemd——README §9 全文）：`thincoder-server-backup.service`（`Type=oneshot`；`ExecStart=node <deploy>/backup.mjs --config <配置档>`）+ `thincoder-server-backup.timer`（`OnCalendar=daily` ∥ `Persistent=true`）。
- 容器路 = 宿主对卷内库执行同命令：`docker compose exec server node /app/deploy/backup.mjs --config /app/config/config.json --out /app/data/backups`（镜像含 `deploy/`；产物落卷）。
- **恢复步**（README §9 备份节成文）：停服 → 以快照替换库（`gateway-<时间戳>.db` ⇒ `data/gateway.db`）+ 清 `-wal`/`-shm` 伴档 → 起服；换库前建议先跑演练脚本（对同一快照——判据过了再换）。
- **WAL 归档口径（KD-SV-79）**：SQLite 的 WAL **不可独立重放**（分段归档 = PostgreSQL 语义）——本仓形态 = **快照（一致点）+ 检查点（限额复位）**；「归档」实义 = 快照序列本身（每个快照 = 完整一致归档件）。
- **环境回退**：若 `backup()` 环境核验不过 ⇒ 回退 = 停写窗快照方案（README 明示）。
- 边界：进程内自动备份面不做（备份 = 部署侧面）；轮转/保留 = 部署方自管（不做）。

### 5.6 TLS 内置与证书轮换（登录防护 IP 维接线）

- **形态** = 服务自身实现 TLS（`node:https` + 证书；零第三方运行期依赖）：配置 = 配置档 `tls` 段（`enabled` ∥ `certPath` ∥ `keyPath` ∥ `publicHost` ∥ `publicPort` ∥ `redirectPort`）；缺 `tls` 段 ⇒ 明文 HTTP（现行为零变）。机制全文 = `gateway/PUBLICNET.md` §2，完整示例段 = README §11。
- **证书轮换** = 换文件后 `kill -HUP <pid>`（重读并 `setSecureContext`）；重载失败保留旧上下文继续服务，落审计 `security_event`/`cert_reload_failed`。
- **HTTP→HTTPS** = `tls.redirectPort` 在场时起第二个监听：308 + `Location` 主机取 `tls.publicHost`（不读 `Host` 头——零站外重定向面）。
- `trustProxy: true` 只在服务前置于**可信**代理时使用（直连部署 ∥ 内置 TLS 部署保持 `false`）；内置 TLS 下客户端 IP = 连接对端地址。

### 5.7 首部署清单（两版）

- **npm 路**（6 步）：① 装 Node ≥24 → ② 以服务账号装机（`NPM_CONFIG_PREFIX` 指可写前缀——§5.1；自升前提）→ ③ `config.example.json` ⇒ `config.json` + env（provider keys ∥ bootstrap 口令）→ ④ 首启（env 建首个 admin）→ ⑤ unit 安放（ExecStart = 前缀垫片——§5.2）+ `enable --now` → ⑥ 验收 = 携团队 key `curl /v1/models` ⇒ 200（key = 首启 admin 登录后自助签发）。
- **Docker 路**（7 步）：① 装 Docker → ② `docker build -f thincoder-server/Dockerfile -t <registry>/thincoder-server:<tag> .`（构建上下文 = **仓根**——console-chat-align 批收正；壳化——构建期预装上下文包体（`@thincoder/core` 不在上下文 ⇒ `npm i -g` 须 registry——构建非离线）；registry ∥ 镜像名 ∥ tag = 待定占位——§5.1）。
  - 续（③–⑦）：③ 备 `config/`（内含 `config.json`——目录须对 node 账号可写：`chown 1000:1000 ./config`；`db` 写绝对形 `/app/data/gateway.db`）+ `data/`（`chown 1000:1000`——node 账号）+ `.env`（`TC_SERVER_VERSION` 可选——§5.4(d)）
    → ④ `docker compose up -d` → ⑤ 首启日志确认（converge 行 + env 建首个 admin；`docker compose ps` 可见 `(healthy)`——§5.9）→ ⑥ 验收同 npm 路（端口 `8787`）→ ⑦ 升级/回滚 = 改 `TC_SERVER_VERSION` + `up -d`（§5.4(e)）。
- **TLS 追加（可选段，容器路）**：① 证书放宿主 `./certs/`（`fullchain.pem` ∥ `privkey.pem`）
  → ② compose 挂 `./certs:/app/certs:ro` + 端口加 `"8443:8443"`
  → ③ `config.json` 写 `tls` 六键（`enabled: true` ∥ `certPath: /app/certs/fullchain.pem` ∥ `keyPath: /app/certs/privkey.pem` ∥ `publicHost` ∥ `publicPort: 443` ∥ `redirectPort: 8443`）
  → ④ `docker compose up -d` → ⑤ 验收 = `docker compose ps` 见 `(healthy)` + `curl -k https://localhost:8787/healthz` 得 200 + `curl -I http://localhost:8443/` 得 308。

### 5.8 目标机/OS

- 内网 Linux 服务器（具体机与 OS 以部署时确认；若 Windows ⇒ 裸机守护面换写法——部署时定）。

### 5.9 健康检查（探活面——契约 = `gateway/API.md` §2.3 ∥ KD-SV-23）

- 探针 = `GET /healthz`（无鉴权只读）：200 = `{ status:"ok", …, db:"ok" }`；db 探活失败 ⇒ 503 `degraded`。
- 容器路 = **Dockerfile `HEALTHCHECK` 单源**（interval 30s ∥ timeout 5s ∥ start-period 120s ∥ retries 3——start-period 覆盖壳收敛/装版窗）：
  `CMD node -e "const fs=require('node:fs');let c={};try{const raw=JSON.parse(fs.readFileSync('/app/config/config.json','utf8'));if(raw&&typeof raw==='object')c=raw}catch{};const h=(typeof c.host==='string'&&c.host!==''&&c.host!=='0.0.0.0')?c.host:'127.0.0.1';const p=Number.isInteger(c.port)?c.port:8787;const tlsOn=!!(c.tls&&c.tls.enabled===true);const mod=tlsOn?require('node:https'):require('node:http');const ok=(r)=>r.statusCode===200;const target=tlsOn?{host:h,port:p,path:'/healthz',rejectUnauthorized:false}:'http://'+h+':'+p+'/healthz';mod.get(target,(r)=>{r.resume();process.exit(ok(r)?0:1)}).on('error',()=>process.exit(1))"`；compose 不重复声明（镜像 healthcheck 自动继承——`docker ps` STATUS 可见 `(healthy)`）。**判定 = `statusCode === 200`**：`r` 是 `node:http` 的 `IncomingMessage`（同回调里按流用 `resume()`），`ok` 只在 fetch `Response` 上有；两支共用同一判定函数 `ok`，分支只选模块与目标形——不两处各写一遍。
- **探针取址 = 按配置**（#1426）：读 `/app/config/config.json` 的 `host`/`port`——`host` = `0.0.0.0` ∥ 空 ∥ 档缺 ⇒ `127.0.0.1`；`port` 非正整数 ∥ 缺 ⇒ `8787`；**`host`/`port` 改值零同步**（不再依赖 host 取 `0.0.0.0`——探针不再写死 `127.0.0.1:8787`）。
- **TLS 部署（`tls.enabled`）**：探针改走 `node:https` 且 `rejectUnauthorized: false`（只判「进程活着、能应答」，身份校验在客户端面；目标恒为本机）；同一端口只讲 TLS，明文探针会恒失败 ⇒ 容器恒 `unhealthy`（决策 = `gateway/PUBLICNET.md` §4 KD-PN-10）。
- `unhealthy` = **标注态**（restart 策略只按进程退出动作——healthcheck 不触发重起；「不健康即重起」= 外部工具，不做项）。
- 裸机路 = 手跑探活（`curl`——README §12 排障节）；systemd 不设独立探活（`Restart=always` 按退出主）。

### 5.10 沙盒 runner（执行面——接入与运维）

- **形态** = 远程 Docker API 节点：控制面直调 Docker API ∥ **主机侧一件**（卷的磁盘限额）= SSH 进主机执行 ∥ 集群化 = 用 Docker 自己的集群 ∥ 机器上不驻留我们的进程；**机制全文 = `sandbox/EXECUTION.md`**。
- **节点前置**：节点机 Docker 引擎须**监听 TCP**（`dockerd -H fd:// -H tcp://0.0.0.0:2375` systemd override）∥ server 机 → 节点 `:2375` 网络可达（安全组/防火墙面）；
  **TLS 档可选**（`sandbox/SANDBOX.md` §3 连接方式块——缺省明文不变 ∥ `https://` 地址 + 客户端证书三件 = 可选档；明文 2375 = 无鉴权 root 等价口——缺省限内网，不可信网内 ⇒ 开 TLS 档）；控制台容器面 = 建/启/停/删（机制 = `sandbox/SANDBOX.md` §3）。
- **派生前置（底座可换）**：标准镜像（`settings.image`）须在节点镜像店在场（缺 ⇒ 派生停 + 人话）；底座镜像来源 = 既有拉取面（镜像源族/一键拉取；`.6` Hub 不可达现实 ⇒ 经源或 `save|load` 搬运——`docs/TEST-ENV-ECS.md` §7 坑 8）；节点侧构建零额外前置（Docker API `POST /build` 原生）；构建资源面 = CPU/磁盘瞬时占用（薄层——秒级；如实告知）。
  **主机侧两件前提**：工作区根目录可写（`workspaceRoot`——缺省 `/var/lib/thincoder/workspaces`） ∥ 文件系统支持项目配额（xfs ∥ ext4——皆不可 ⇒ loopback 备 ∥ 再不可 ⇒ 建盒停 + 人话——`sandbox/EXECUTION.md` §4）。
- **接入** = 控制台「添加节点」（填 Docker API 地址——连通自检；失败逐句人话 + 审计行）∥ 删除节点（有容器 ⇒ 二选一「保留 ∥ 连删」；有承载工作区 ⇒ 二次确认）；**装机/主机运维 = 管理面 chat 内动作**（`exec`/`docker`/`runners` + 主机表凭据——任务式（托管接入）退场；机制全文 = `sandbox/SANDBOX.md` §3 接入面 ∥ `agent/ADMIN-AGENT.md` §12）。
- **主机 SSH 前提**：server 宿主/容器须有 `sshpass` 与 `openssh-client`（密码认证面——主机 `exec`/chat 装机用）；缺 ⇒ 报因「宿主缺 `sshpass`——密码认证不可用」；容器路 = 镜像已含（§6 Dockerfile 行）。
- **网络面**：盒流量在节点本机（不占 server 侧带宽——KD-SV-63 动机）。**细形**：节点侧入向 = `:2375`（Docker API——仅 server 机可达）∥ `:22`（SSH——仅 server 机可达）。
  server 侧入向零新增（DNS 闸面随出站闸退场删）；凭据面 = 主机表行（SSH——KD-SV-133）＋ Docker API 连接面（缺省明文/内网 ∥ **TLS 档可选**；`sandbox/SANDBOX.md` §3 连接方式块）。
- **连接面 TLS 档（可选）**：节点 dockerd 侧启用 TLS（`--tlsverify` ∥ 服务端证书/密钥 ∥ CA——材料 = 用户自备；在机）；**客户端三件（CA/客户端证书/客户端私钥）经控制台「连接方式」录入**（私钥 AES-256-GCM 落库、零回显——`sandbox/SANDBOX.md` §3）；切档/编辑 = **自检为门**（当刻可达才落库——失败零变）；明文缺省路径零行为变化；真机步骤（节点侧配置 + 自签材料）随 `docs/TEST-ENV-ECS.md` 随正件（父侧/实施轮）。

### 5.11 MCP 服务器（管理面）

- **运行面**：MCP 服务器由 **server 进程**建连——`stdio` 类 = server 同机子进程（容器路 = 镜像内环境：Node/npx 随镜像可得；python/uv 类服务器须宿主/镜像自备）∥ `http`/`ws` 类 = server 出向（**新出网目的地 = 用户配置**——零白名单，内网工具面口径）。
- **凭据**：`token`/`headers`/`env` 值 AES-256-GCM 落库 + 密列零回显（机制 = `mcp/MCP.md` §3.1）。
- **生命周期**：停机收尾关闭全部 MCP 会话（stdio 子进程杀树——`bin/thincoder-server.mjs`）；`kill -9` ⇒ 子进程残留（如实披露——`mcp/MCP.md` §12 R86③）。
- **运维读数**：探活 = 控制台行内动作（`POST /api/admin/mcp/probe`——零副作用）；失败原因就地人话。

## 6. 本域文件与行数预算（本域族行）

| 档 | 行数 | 职责 |
|---|---|---|
| `thincoder-server/bin/thincoder-server.mjs` | **241**（实读 2026-10-19；本批 ＋≈40——族表驱动 ＋ 探针缝 ＋ 停机句柄） | argv ∥ 配置加载 ∥ 首启引导 ∥ 启动 ∥ 停机 |
| `thincoder-server/test/assembly.test.mjs` | 新档 ≈220 | 装配面常驻断言（A1–A7 ＋ 反证注释——§4.1） |
| `thincoder-server/src/ops/config.mjs` | **360** | 读档 ∥ 校验（fail-closed） ∥ `env:` 解析 ∥ 缺省值 ∥ 预设展开接线 |
| `thincoder-server/src/ops/update.mjs` | **239** | 更新机制 |
| `thincoder-server/src/ops/presets.mjs` | **52** | 预设表（`SERVER_PRESETS`——起步 **21** 家 `{ baseURL }`；**2026-10-09 清除批：零 `model` 键**） ∥ 展开（`expandProviderEntry`：`name` 缺省 ∥ 覆盖 ∥ 未知预设拒启） |
| `thincoder-server/src/ops/log.mjs` | **35** | 单行 JSON 日志（stdout） |
| `thincoder-server/src/ops/cli.mjs` | **≈215** | 运维 CLI（成员/密钥/对账） |
| `thincoder-server/config.example.json` | **38** | 配置模板（无真 key——预设形 ∥ 手写形并存） |
| `thincoder-server/deploy/thincoder-server.service` | **34** | systemd unit 模板（裸机路——Restart=always ∥ 开机自启 ∥ journald） |
| `thincoder-server/deploy/docker-entrypoint.sh` | **7** | 容器入口（壳——`exec … --config /app/config/config.json`） |
| `thincoder-server/deploy/converge.mjs` | **197** | 壳引导收敛（零 App 依赖——自足） |
| `thincoder-server/Dockerfile` | **41**（实读 2026-10-19；本批探针换形 ≤+3） | 镜像构建（壳 + 构建期预装——§5.1） |
| `thincoder-server/.dockerignore` | **12** | 构建上下文排除（config.json ∥ config/ ∥ data ∥ docs ∥ .git） |
| `thincoder-server/docker-compose.yml` | **22** | 容器样例（端口 ∥ 卷（配置目录 rw ∥ 数据） ∥ env_file ∥ restart: unless-stopped） |
| `thincoder-server/deploy/backup.mjs` | **86** | 备份（命令化——定时器样例在 README §9） |
| `thincoder-server/deploy/sandbox/Dockerfile` | **46** | 沙盒盒镜像 |
| `thincoder-server/README.md` | **259** | 运维面：安装（npm ∥ Docker） ∥ 部署（systemd ∥ compose） ∥ 启动（首启引导） ∥ CLI 用法 ∥ 控制台 |
| **小计** | ——（逐档见上表） | —— |

## 7. 验收判据（机检）

| 需求 | 设计级判据 | 载体 |
|---|---|---|
| 非功能 · 部署口径 | 默认内网部署；公网部署须开 `tls`（启用 ⇒ 同端口 TLS，容器探针随之走 https——`gateway/PUBLICNET.md` §5 AC-PN-2 ∥ AC-PN-15）。`host` 必填（缺失 ⇒ 拒启——fail-closed）；`0.0.0.0` ⇒ 启动警告 | 单元测试档 + 收口轮 |
| AC-8（功能点 8——分发与部署） | `npm pack --dry-run` 通过（`files` 白名单齐 ∥ 零 install 步）∥ `docker build` 成功 + compose 起停通 ∥ systemd unit 安放可启（`systemd-analyze verify` ∥ `enable --now` 后 `is-active`——unit 模板 = §5.2） | 收口轮（真机；发布动作 = 发布面轮） |
| AC-9（功能点 9——provider 预设；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 预设形展开（`{"preset":"deepseek","apiKey":"env:X"}` ⇒ `name`=`deepseek` ∥ `baseURL`=预设值 ∥ `models`= 空（预设表零 `model` 键）⇒ 经「模型发现」勾选后 `/v1/models` 含 `deepseek/<选中模型>` ∥ 经 mock 上游完成一次请求）；未知预设名 ⇒ 拒启（报错列可用名）∥ `name` 缺省 = 预设名（显式者胜）∥ 条目覆盖 `baseURL`/`models` 生效 ∥ 手写形回归零变 ∥ 漂移件（CLI 表对照）绿 ∥ 名单含 `gemini-openai`（Google 官方 OpenAI 兼容端点——OpenAI 形入子集） | 单元测试档（349 行） |
| AC-10（功能点 10——自动更新；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 自检（假 registry ⇒ 触发 ∥ 404/失败 ⇒ 静默）∥ 档位三值语义 + 非法值拒启 ∥ 自升执行器（成功 ⇒ 优雅停机；失败/超时 ⇒ 不退 ∥ 旧版续跑）∥ 启动日志 `ready` 行含 `version` ∥ 容器收敛判定表（converge 矩阵）；`docker build` + 起停 = 收口轮真机 | 单元测试档（498 行）+ 收口轮 |
| AC-11（功能点 11——种子与生效面） | 种子四格（库空+段 ⇒ 导入且 `env:` 保形 ∥ 非空库+段 ⇒ 忽略 + 警告 ∥ 两空 ⇒ 允许起 + 警告「零 provider」）∥ 零 provider 允许态（`/v1/models` = 空清单 ∥ chat ⇒ 404）∥ `env:` 缺位（启动 ⇒ 拒启 ∥ 保存 ⇒ 400）；端到端判据全文 = `gateway/API.md` §5 AC-11 行 | 单元测试档 |
| AC-13（功能点 12——首版完备化⑤面与本域接线；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | ⑤ 部署文档：README 结构断言（成员接入节 ∥ TLS 内置完整段 ∥ 备份命令/定时器样例 ∥ 恢复步）∥ `thincoder-server/deploy/backup.mjs`（已落盘 86 行）实跑 ⇒ 快照生成 + 可开（含热库在线备份）∥ Dockerfile `HEALTHCHECK` 行在册；配置校验：`trustProxy` 非布尔 ∥ `usageRetentionDays` 非法 ⇒ 拒启 | 单元测试档 + 收口轮 |
| 功能点 8（分发与部署——npm 全局装启动链；缺陷 #1113） | 经符号链接（bin 垫片形 ∥ 目录连接形）调用入口 ⇒ 程序真执行（进入正常输出/错误路径——非静默退 0）；路径不可解析 ⇒ 显式报错（非静默）；普通 `node <真身路径>` 调用不回归 | 单元测试档（缺陷 #1113 件） |
| 上游代理（机制 = `gateway/API.md` §6 KD-SV-55） | 判定（旗 `proxy: true` ∧ 顶层 `proxy.uri` 在案 ⇒ 经代理；缺省 ∥ 无 uri ⇒ 直连——两条链同判定：chat 转发 ∥ 模型发现）；loopback 目标恒直连；假代理回放（CONNECT 命中 + SSE 逐块透传）；代理不可达 ⇒ 502 `upstream_error`；代理路径断连 ⇒ 中止上游 + 记 `status='aborted'`（§2.1 契约零回归）；启动 warn 两条（明文 `http:` ∥ 旗 `true` 缺 uri——触发/文案 = KD-SV-55）；迁移 v9（空库 9 ∥ v8 升 9 ∥ 幂等）；配置面：顶层 `proxy` 段校验（非法 ⇒ 拒启）∥ 条目 `proxy` 布尔判据（非布尔 ⇒ 拒启/400）∥ 管理面字段往返（POST/PATCH/GET）；控制台勾选（添加 ∥ 详情两窗） | 单元测试档 + 收口轮（浏览器实走） |
| AC-6（功能点 6——嵌入配置可选与禁用形态；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 缺 `embedding` 段（∥ 显式 `null`）⇒ 载入通过 + 警告恰一条（嵌入未配置）∥ 服务照常起（`/healthz` 200）∥ 缺段档创建（PATCH `embedding` ⇒ 建段 ⇒ 重启启用）∥ 在场非对象 ∥ 缺子键 ⇒ 拒启 ∥ 400（文件零变）；判据全文 = §9 B33/B34 ∥ E22 | 单元测试档 |
| AC-28（功能点 28——配置控制台写面；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 写路径机检（`config-admin.mjs` 导出直测）：白名单（未知键 ⇒ 400）∥ 合并保未知键（写回后非托管键原样）∥ 校验门（非法值 ⇒ 400 且文件字节零变；`env:` 缺位 ⇒ 400）∥ 原子写（tmp 零残留 ∥ rename 覆盖 ∥ 落盘形 = 2 空格缩进 + 末尾换行同现档）∥ 单写者（同步段无交错）∥ 生效标注统一「重启生效」∥ 审计行（`config_update` ∥ detail = 键名清单 ∥ 值零入）∥ 写后 GET 回读逐值（round-trip） | 单元测试档 |
| AC-29①③（功能点 29——配置形与唯一性：种子/配置面；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 条目两形（字符串 ∥ `{ name, alias }`）经三径校验同助手（载入 ∥ 启动构建/种子 ∥ 保存——`validateProviderEntry`/`validateProviderEntries`）∥ 别名非法（空 ∥ 含斜杠 ∥ 首尾空白 ∥ 跨 provider 重名）⇒ 拒启（配置面）∥ 400（保存径——库与运行时零变）∥ 种子条目别名原样入库（控制台可改——别名变更当即生效）；对外标识句 = §1（无斜杠裸名归别名形；`/v1/models` = 对外标识清单）；判据全文 = `gateway/API.md` §5 AC-29 行 | 单元测试档 + 收口轮 |
| 沙盒（需求 §5 沙盒块） | 控制面判据 = `sandbox/SANDBOX.md` §11（含红队探针 P1–P14 判据表）∥ 执行面判据 = `sandbox/EXECUTION.md` §12（三腿/三证 ∥ 闸/配额/DNS 闸/实时门）∥ 盒参数集 = `sandbox/EXECUTION.md` §3（KD-SV-73 逐项落地）∥ 迁移判据 = `store/STORE.md` §3 v11/v22 段 | 单元测试档 + 收口轮 |

## 8. 关键决策（本域）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-15 | **首启 admin 引导 = config `bootstrap` + 幂等**：仅零 admin 时依配置创建（`username` ∥ `password`——支持 `env:`）；建后配置可撤；零 admin 且未配置 ⇒ 启动告警；非零 ⇒ 跳过 | 「首启引导（env 或本机 CLI）」的需求形；幂等 = 只建不改（不覆盖已改口令）∥ 配置口令 ⇒ 操作者已知首密、零额外步骤 |
| KD-SV-17 | **provider 预设 = server 自持表（快照——起步 21 家 OpenAI 兼容子集）**：`thincoder-server/src/ops/presets.mjs`（已落盘 52 行）静态表 `{ baseURL }` × 展开（`name` 缺省 = 预设名 ∥ 条目覆盖 `baseURL`/`models` ∥ 未知预设名拒启）；漂移 = 手工同步 + 单元测试档断言 | 需求 = 免手写 `baseURL`（功能点 9——模型面走「发现」勾选）；自持 ⇒ 引核口径 KD-SV-78（运行时不 import core）∥ 表极小（≈45 行）∥ 快照口径 + 漂移件兜同步 |
| KD-SV-18 | **自动更新 = 两路统一 npm 版本身份（自检 + 档位 + 自升执行器；容器 = 壳）**：版本真相 = npm 包（镜像 tag 不承担版本语义）；自检 = registry `latest`（`NPM_CONFIG_REGISTRY` 可指内网镜像；失败/404 静默）；`autoUpdate` = `false ∥ "notify" ∥ "auto"`（缺省 `"notify"`——可见不越权；`"auto"` = opt-in）；自升 = `npm i -g @thincoder/server@<版号>` 子进程（超时 120s；成功 ∧ 复读校验 ⇒ 优雅停机 ⇒ 守护重起；失败 ⇒ 恒保留旧版）；容器 = 壳镜像（构建期上下文包体预装——离线可运行；`TC_SERVER_VERSION` 三态收敛：空/钉/`latest`；钉版抑制自装）；全文 = §5.4 | 用户令（两路统一 npm 路径 + 容器壳化）；「退出 ⇒ 重起」两路守护既有（unit `Restart=always` ∥ compose `restart: unless-stopped`）；零第三方依赖（fetch = node 内建 ∥ 自升走 npm CLI）；自持实现（先例语义参考 `thincoder-cli/src/upgrade.mjs:7-19`——零代码共享：跨包不可 import） |
| KD-SV-19 | **provider 配置面 = 库单源 + 保存即热生效**：控制台管理（`providers` 表——迁移 v2）；密钥落库（明文 ∥ `env:` 引用并存——引用保形）；`config.json` 的 `providers[]` 降为**一次性种子**（空库导入；非空库忽略 + 警告）；热生效 = 注册表重建 + 原子换表（在途请求 = 派发时快照） | 用户 2026-10-06 16:01 令（「不再只靠 `config.json` + 重启」）；库 = 运行期单源（迁移链 G2 断点）；热生效免重启（零守护依赖 ∥ 亚秒级）；`env:` 保形（密钥卫生——种子不物化秘密）；预设衔接 = 界面「从预设快速添加」复用 `presets.mjs`（KD-SV-17） |
| KD-SV-23 | **健康检查 = `GET /healthz`（无鉴权只读探活）**：`{ status, version, uptime, db }`（`SELECT 1` 一探）；db 故障 ⇒ 503 `degraded`；no-store；接线 = Dockerfile `HEALTHCHECK` 单源（compose 继承——§5.9；探针契约 = `gateway/API.md` §2.3） | 探针入口须零凭据（Docker/监控直调）；只读单探 = 零副作用；`version` 与 `ready` 行同源；接线单源 = 改一处 |
| KD-SV-24 | **版本/更新可见面 = `GET /api/system`（会话——两角色）+ 控制台（meta 槽 ∥ 系统页）**：`{ version, update: { mode, lastCheckAt, latest } }`——数据 = 更新器进程内状态（`getStatus()` 导出）；`latest` = 已见新版（无/未检/失败 ⇒ `null`——静默同面） | 浏览器不可读日志 ⇒ 控制台可见须 HTTP 数据面（#961「ready 行足」限定 = 部署面——两消费方不同，不相抵）；系统页 = admin（动作方）；meta 槽 = 全角色（版本非敏感） |
| KD-SV-25 | **部署文档完备 = README 定稿（TLS 内置完整段 ∥ 备份 = `deploy/backup.mjs`（已落盘 86 行）+ systemd 定时器样例）**：TLS 段 = `tls` 配置六键 ∥ 证书轮换（`SIGHUP`） ∥ 重定向（308）∥ 公网部署注意（安全组只开 443）；备份 = node:sqlite `backup()`（WAL 在线一致——免停写窗；零外部工具） | 用户 2026-10-19 令（「没有nginx，thincoder-server要自己实现tls」）；证书用户自备、服务只读路径；node 自带备份 = sqlite3 CLI 不保证在；在线备份 = 免停写、与运行实例并存 |
| KD-SV-53 | **bin 主入口判据 = `argv[1]` 经 `realpathSync` 解析后与 `import.meta.url` 比对（#1113）**：符号链接（npm 全局装（POSIX）垫片）∥ 目录连接（dev 树 junction）两形均可主入口执行；路径不可解析 ⇒ 抛（显式报错——不静默）；比较用 `node:fs` `realpathSync`（拼写保持面——与 ESM 装载器的模块 URL 解析同面；`.native` 会归一盘符/大小写——小写拼写调用恒假） | 缺陷双证（ECS：垫片形 = 零输出退 0、服务永不启动；真身直跑 = 真执行）+ 本机实证（2026-10-09：文件符号链接 ∥ junction 两形旧判据恒假、realpath 判据恒真） |
| KD-SV-56 | **配置控制台 = 文件面读写 + 重启生效 + 原子写 + 校验单源 + 单写者**：写端点 = `PATCH /api/admin/config`（白名单五键 ∥ 未知键 400 ∥ 合并保未知键 ∥ 载入面等价两跳门 ∥ 同目录 tmp ⇒ `rename` ∥ 审计 `config_update`）；读 = 文件面有效值（缺省回填 ∥ 密钥掩码）；`host`/`port`/`db` 只读展示（定则例外显式说明）；容器路写面前提 = 配置目录级可写挂载（§5.1） | 用户定则（「任何配置项必须有配置界面」）；文件面 = 单源不改（KD-SV-19 库面零涉）；原子写 = 半写零暴露（同目录 tmp ⇒ `rename`）；校验门复用载入单源（写入的文件必可载入）；单写者 = 部署模型单实例 |
| KD-SV-57 | **嵌入配置可选 = 禁用态 + 控制台可从无到有创建（用户令「这个约束不合理，不应该强制必须配置以后才能启动」）**：`embedding` 缺位 ∥ `null` ⇒ 归一 `null`（服务照常起 + 启动警告一条）；禁用语义 = `/v1/embeddings` ⇒ 404 `model_not_found`（消息明示未配置——**零新码**）；在场 ⇒ 严格校验保持（`baseURL` http(s) ∥ `model` 非空；部分子键 ⇒ 400）；控制台向量卡「未配置」态 + 保存创建（同一 PATCH——缺段合并建段）；全下游随动 = `/api/system.embedding.model = null` ∥ `GET /api/admin/embedding` 两值 `null` ∥ 探活无草稿 ⇒ 400（携草稿照常）；生效 = 重启 | 用户裁（强制配置「不合理」）；「服务照起 + 缺时明确禁用语义」= 目标形；错误码沿既有族（零新码纪律）；引擎可不在线语义不变（启动路径零探引擎——既有） |

## 9. 用例（本域）

| # | 类 | 输入 | 预期输出 |
|---|---|---|---|
| B7 | 边界 | 零 admin 库 + `bootstrap` 配置在场，连续两次启动 | 第一次建 admin；第二次跳过（不重建 ∥ 不改密——幂等） |
| N12 | 正常 | 预设形条目（`{"preset":"deepseek","apiKey":"env:X"}`）载入 | `name`=`deepseek` ∥ `baseURL`=预设值 ∥ `models`= 空清单（预设表零 `model` 键）⇒ 经「模型发现」勾选后 `/v1/models` 含 `deepseek/<选中模型>` |
| N13 | 正常 | 预设形 + 条目覆盖（`name` ∥ `models` ∥ `baseURL` 自备） | 覆盖生效（预设值不吞条目字段）；派发与清单按条目展开 |
| B9 | 边界 | 同预设双条、均未给 `name` | 拒启（provider 名重名——`name` 缺省撞车） |
| E11 | 错误 | 未知预设名 | 拒启；报错列可用预设名 |
| N14 | 正常 | `autoUpdate:"notify"` + 假 registry 报新版 | 日志 `update_available`；进程继续运行（不自装） |
| N15 | 正常 | `"auto"` + 假 npm 装版成功（复读版本变更） | 走优雅停机（`shutdown`——`signal: "self-update"`；退出码 0） |
| B10 | 边界 | 检查 404/超时/网络失败 | 静默（无日志 ∥ 状态不变——与「无新版」同面） |
| B11 | 边界 | 装版子进程失败/超时 | 不退进程；warn `update_install_failed`；旧版续跑 |
| B12 | 边界 | 容器钉版（`TC_SERVER_VERSION=x.y.z`）+ `"auto"` | 自装抑制（生效 = notify；启动一条说明） |
| B13 | 边界 | 容器 `latest` + registry 不可达 | 回退已装版本运行 + 警告（不拒启） |
| E12 | 错误 | `autoUpdate` 非法值（如 `"yes"`） | 拒启（fail-closed） |
| E13 | 错误 | 容器钉版不可得（离线 + 未装该版） | 拒启；消息含三选修复 |
| N21 | 正常 | `node thincoder-server/deploy/backup.mjs --config <档>`（库在盘） | 快照文件生成（时间戳名）；可开（与源库行数一致） |
| B17 | 边界 | 服务运行中（热库 ∥ WAL）执行备份 | 快照一致可用（在线备份——无需停写）；源库零触 |
| E18 | 错误 | `usageRetentionDays` 非法（0 ∥ 负 ∥ 非数） | 拒启（fail-closed） |
| E19 | 错误 | `trustProxy` 非布尔 | 拒启（fail-closed） |
| B30 | 边界 | 经符号链接（bin 垫片形）∥ 目录连接形调用入口（无 `--config`）∥ 不可解析 `argv[1]`（伪构造：不存在路径 + 动态导入） | 程序真执行：`startup_failed` + 退 1（非静默退 0）；不可解析 ⇒ 显式报错（非静默——退非 0）；普通 `node <真身路径>` 调用同读数（不回归） |
| N22 | 正常 | 预设形条目（`{"preset":"gemini-openai","apiKey":"env:X"}`）载入 | `name`=`gemini-openai` ∥ `baseURL` = Google 官方 OpenAI 兼容端点（`https://generativelanguage.googleapis.com/v1beta/openai`）∥ `models` = 空清单 |
| B31 | 边界 | 条目 `proxy: true` + 顶层 `proxy` 段在场 + baseURL = loopback（127.0.0.1 mock） | 直连（loopback 旁路——假代理零命中）；同形非 loopback ⇒ 经代理 |
| E20 | 错误 | 顶层 `proxy` 非对象（数组 ∥ 数字）∥ 顶层 `proxy.uri` 非法（非字符串 ∥ 空串 ∥ 非 URL ∥ 裸串形 ∥ scheme 非 `http:`——仅 `http:` 收） | 拒启（fail-closed；报错提示规范形 `{ "uri": "http://host:port" }`） |
| E21 | 错误 | 条目 `proxy` 非布尔（如 `"yes"`） | 拒启（配置载入径）∥ 400（控制台保存径——库与运行时零变） |
| B32 | 边界 | 控制台 PATCH（`usageRetentionDays` ∥ `proxy.uri` ∥ `embedding.model`）⇒ 重启 | 启动按新值运行（保留清理窗/代理判定/引擎指向随动——文件面读写闭环）；未重启 ⇒ 运行值不变（重启生效标注语义） |
| B33 | 边界 | 配置档缺 `embedding` 段（∥ 显式 `null`）⇒ 载入 + 起服 | `loadConfig` 通过（warnings 恰含一条「嵌入引擎未配置」）；服务照常起（`/healthz` 200 ∥ `ready` 行在）——嵌入面禁用态 |
| B34 | 边界 | 缺段档 + admin PATCH `embedding:{baseURL,model}` ⇒ 重启 | 200（建段——原子写落盘）⇒ 重启后嵌入面启用（`/v1/embeddings` 照常 ∥ `/api/system.embedding.model` = 新值）；缺段档 PATCH 他键（`trustProxy`）⇒ 200（门容缺段） |
| E22 | 错误 | `embedding` 在场非对象（字符串 ∥ 数组 ∥ 数字）∥ PATCH `embedding:{baseURL}` 缺 `model` | 拒启（fail-closed）∥ 400（文件零变——在场须完整） |

## 10. 本域边界（不做的面）

- 日志落盘/轮转（裸机 = journald ∥ 容器 = docker logs——采集归各平台） ∥ **`config.json` 文件热载**（文件改动仍须重启；**provider 数据面 = 保存即热生效**——机制 = `gateway/API.md` §2.2） ∥ 证书签发/ACME 自动续期 ∥ 进程内自动备份/巡检面（备份 = 部署侧面：命令 + 定时器样例——§5.5） ∥ Windows 守护面（部署时定写法）——均不做。
- provider 管理面不做：本机 CLI 面 ∥ URL 白名单/出口限制（admin 自担）——归 `gateway/API.md` §8。
- 更新面不做：渠道（beta ∥ canary） ∥ 灰度分批 ∥ 多版本并存（A/B 双装 ∥ 秒切） ∥ 进程内热载 ∥ 认证型 registry 的自检凭据面（fetch 不带 npm 凭据——如内网镜像要求认证 ⇒ 自检静默不更新；自装经 npm 凭据面但需手工触发） ∥ 自动备份（回滚前备份 = 命令 + 定时器样例——§5.5）。
- 健康面不做：metrics/Prometheus ∥ 深度依赖探活 ∥ `unhealthy` 自动处置（探针接线 = §5.9）；证书签发/自动续期不做（证书用户自备——§5.6）；备份轮转/保留策略不做（部署方自管）。
- 配置控制台面不做：`config.json` 热载/运行态注入（生效 = 统一重启——§10 不破）∥ `host`/`port`/`db` 写面（部署拓扑项——只读展示；定则例外显式说明）∥ 配置版本史/回滚 ∥ 写前 `.bak` 备份（备份 = 部署侧面——§5.5）∥ 多实例并发写（部署模型 = 单写者）。
- 嵌入配置面不做：控制台删除/清空 `embedding` 段（缺段 = 编辑配置文件；界面仅创建/改值）∥ 嵌入面新错误码（404 `model_not_found` 复用——零新码）∥ 引擎进程起停管理（手动——不变）。
- 别名面不做（KD-SV-59）：配置/控制台面别名批量编辑 ∥ 别名历史（改别名当即生效）∥ 别名与带前缀名的交叉排歧（形上不相交——别名无斜杠）；机制全文 = `gateway/API.md` §6 KD-SV-59。
- 沙盒 runner 面不做：盒镜像内容治理（镜像 = 部署面）∥ 入站/端口转发 ∥ IPv6——全文 = `sandbox/SANDBOX.md` §15。
