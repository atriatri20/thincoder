# deploy/sandbox/Dockerfile — 盒镜像（缺省 tag `thincoder-sandbox:1`——sandbox/RUNNER.md §3；KD-SV-73）
#
# 构建（**上下文 = 仓根**——member-face-chat 批 · `sandbox/EXECUTION.md` §8 件位契约；核/壳离线取件）：
#   docker build -f thincoder-server/deploy/sandbox/Dockerfile -t thincoder-sandbox:1 .
#
# 面（§3 参数表）：非 root（node:24-slim 内置 `node` 用户 = uid/gid 1000——容器以 `--user 1000:1000` 落形，
# 与卷属主对齐）；工具链 = git/curl（默认单 github/gitee/registry.npmjs.org 拉取与调试刚需；ca-certificates = curl 的
# TLS 信任面——`--no-install-recommends` 下需显式装）；HOME = /workspace/home（注入 env；卷内建）、
# WORKDIR = /workspace（唯一卷挂载点）。
# 盒内运行时（member-face-chat 批——EXECUTION.md §8）：核件同件（`@thincoder/core`——构建期本地
# 安装 ⇒ `/opt/thincoder/app/node_modules/@thincoder/core`）∥ 壳件（`deploy/sandbox/member-shell/**`
# ⇒ `/opt/thincoder/app/shell`）∥ git 凭据助手登记（`git-credential-thincoder` 入 PATH +
# `credential.helper`——拉取/推送共用单形，KD-SV-204）∥ CMD = 壳起（容器起即连 server；env 契约 =
# 建盒参数集注入：`OPENAI_BASE_URL`/`OPENAI_API_KEY`/`TC_SERVER_URL`/`HOME`）。
# 派生取件（KD-SV-185）= `COPY --from=<标准镜像> /opt/thincoder/app /opt/thincoder/app`（零第二核源）。
FROM node:24-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends git curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# 核件（构建期本地安装——包体来自上下文，零 registry 依赖、离线可构建；版本与 server 同源钉住）
COPY thincoder-core /tmp/build/thincoder-core
RUN cd /tmp/build/thincoder-core \
 && npm pack --silent \
 && mkdir -p /opt/thincoder/app \
 && npm i --prefix /opt/thincoder/app /tmp/build/thincoder-core/thincoder-core-*.tgz --no-audit --no-fund \
 && rm -rf /tmp/build

# 壳件（件位契约：壳 = /opt/thincoder/app/shell/**；CMD 同指）+ 助手登记（git 按名解析 `credential.helper`）
COPY thincoder-server/deploy/sandbox/member-shell /opt/thincoder/app/shell
RUN chmod +x /opt/thincoder/app/shell/git-cred.mjs \
 && ln -sf /opt/thincoder/app/shell/git-cred.mjs /usr/local/bin/git-credential-thincoder \
 && git config --system credential.helper thincoder \
 && chown -R 1000:1000 /opt/thincoder/app

WORKDIR /workspace
USER 1000:1000
CMD ["node", "/opt/thincoder/app/shell/index.mjs"]
