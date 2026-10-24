# Thincoder Server — 容器镜像（壳——ops/OPS.md §5.1）：node:24-slim 基座 + 引导层（deploy/*）。
# 版本身份 = npm 包（`@thincoder/server`——镜像 tag 不承担版本语义）；构建期以上下文包体预装（npm pack ⇒ 前缀——
# 上下文双包本地 tgz 直装；`@thincoder/core` 不在上下文 ⇒ 须 registry（非离线））；运行期由壳引导按 TC_SERVER_VERSION 收敛（§5.4(d)）。
# 构建（上下文 = 仓根——console-chat-align 批起）：docker build -f thincoder-server/Dockerfile -t <registry>/thincoder-server:<tag> .
# 双包（同批）：上下文含两包（`thincoder-server` + `thincoder-render-core`）——构建期一次装两包（`@thincoder/render-core` 的 `^0.1.0` 由本地 tgz 满足；`thincoder-server` 的 `@thincoder/core` 依赖须 registry）。
# 升级/回滚 = 改 TC_SERVER_VERSION + docker compose up -d（重跑壳收敛——§5.4(e)）；重建镜像 = 换 Node 基座/壳时。
FROM node:24-slim

# 主机运维宿主前提（sandbox/SANDBOX.md §3 ∥ ops/OPS.md §5.10——镜像侧）：SSH 传输 = 系统 openssh（KD-SV-85）；
# 密码认证 = sshpass（`-e` 环境变量口径）；缺 ⇒ exec 密码认证分支报「宿主缺 sshpass」（人话——宿主前提检查在案）。
RUN apt-get update && apt-get install -y --no-install-recommends openssh-client sshpass && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 前缀 = node 账号自有（运行期收敛/自升可写——§5.1）；PATH 含前缀 bin（入口 exec thincoder-server 依赖）
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global \
    NPM_CONFIG_CACHE=/home/node/.npm-cache \
    PATH=/home/node/.npm-global/bin:$PATH

# 构建期预装：上下文双包体（npm pack——files 白名单）⇒ 前缀（本地 tgz 一次装两包；`@thincoder/core` 须 registry——构建非离线）
COPY thincoder-server /tmp/build/thincoder-server/
COPY thincoder-render-core /tmp/build/thincoder-render-core/
RUN mkdir -p /app/data && chown -R node:node /app /tmp/build /home/node
USER node
RUN cd /tmp/build/thincoder-server && npm pack --silent && cd ../thincoder-render-core && npm pack --silent && cd .. && npm i -g ./thincoder-server/*.tgz ./thincoder-render-core/*.tgz --no-audit --no-fund && rm -rf /tmp/build

# 引导层（壳——converge.mjs ∥ docker-entrypoint.sh）
COPY --chown=node:node thincoder-server/deploy/ /app/deploy/
RUN chmod +x /app/deploy/docker-entrypoint.sh

EXPOSE 8787
VOLUME /app/data

# 健康检查（探活面——ops/OPS.md §5.9 ∥ KD-SV-23）：`GET /healthz`（无鉴权只读）；间隔 30s ∥ 超时 5s ∥
# 启动宽限 120s（覆盖壳收敛/装版窗）∥ 重试 3；compose 不重复声明（镜像 healthcheck 自动继承——docker ps 可见
# `(healthy)`）。**探针按配置取址**（#1426）：读 `/app/config/config.json` 的 `host`/`port`——`host` = `0.0.0.0` ∥
# 空 ∥ 档缺 ⇒ `127.0.0.1`，`port` 缺省 `8787`；`host`/`port` 改值零同步（不再依赖 host 取 `0.0.0.0`）。
# **`tls.enabled` ⇒ 走 `node:https`**（`rejectUnauthorized: false`——只探活不验身份；同一端口只讲 TLS，明文探针恒失败）。
# **判定 = `statusCode === 200`**（`r` 是 `IncomingMessage`，没有 fetch `Response.ok`）——两支共用同一判定函数。
# `unhealthy` = 标注态（restart 策略只按进程退出动作——不触发重起）。
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 CMD node -e "const fs=require('node:fs');let c={};try{const raw=JSON.parse(fs.readFileSync('/app/config/config.json','utf8'));if(raw&&typeof raw==='object')c=raw}catch{};const h=(typeof c.host==='string'&&c.host!==''&&c.host!=='0.0.0.0')?c.host:'127.0.0.1';const p=Number.isInteger(c.port)?c.port:8787;const tlsOn=!!(c.tls&&c.tls.enabled===true);const mod=tlsOn?require('node:https'):require('node:http');const ok=(r)=>r.statusCode===200;const target=tlsOn?{host:h,port:p,path:'/healthz',rejectUnauthorized:false}:'http://'+h+':'+p+'/healthz';mod.get(target,(r)=>{r.resume();process.exit(ok(r)?0:1)}).on('error',()=>process.exit(1))"

ENTRYPOINT ["/app/deploy/docker-entrypoint.sh"]
