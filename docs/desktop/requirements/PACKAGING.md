# 桌面需求 · 打包与发行（PACKAGING）

> **卷**：桌面端需求分卷之「打包与发行」——**D12 ∥ D32 ∥ D40 ∥ D41 ∥ D42**（5 条）。
> **总览 ∥ D 表索引**：`docs/desktop/requirements/PROJECT.md`（D1–D42 全表查卷口；模块目标 / 定位 / 界面形态 / 边界 / 非功能 / 验收 / 依赖）。**同族设计档**：`docs/desktop/design/PACKAGING.md`。

## 功能点

| # | 功能点 | 判据（可机检） |
|---|---|---|
| D12 | 发行面 | 三平台（Windows / macOS / Linux）可安装可启动的产物；版本与升级路径（细目留设计轮）；**交付分期 = 阶段一 Windows 产物（打包链 + 安装包 + 官网下载）；macOS ∥ Linux 产物随阶段二（构建机后补）** |
| D32 | 发行渠道 | **桌面三平台版本**（Windows ∥ macOS ∥ Linux）**发布到官网（thincoder.com）供下载**；另发布到 **Windows 商店 ∥ Snap 商店**；**MAS（Mac App Store）明确不做**（沙箱与产品本质冲突——用户明裁「MAS就算了」）；实现形待设计——前置 = 打包链落定（`electron-builder.yml` 未落）；商店账号（Partner Center ∥ Apple Developer）= 用户动作；阶段一 = 打包链落定（`electron-builder.yml`）+ **Windows 安装包** + **官网（thincoder.com）下载**；阶段二（后）= 应用商店（Windows 商店 ∥ Snap）+ 其余平台产物（macOS ∥ Linux——构建机后补）；证书 = 已购并验活（GlobalSign EV `CN=Shanghai Xinbo Technology Co., Ltd.` · eToken/SafeNet 形）——阶段一 = **签名就绪**设计（**主路径 = 实签**；token 缺席 ⇒ 跳过 + 明示）；构建期 = UKey 在位 + PIN |
| D40 | 自动更新 | 启动自检（延时一次）⇒ 发现新版本**后台静默下载**（不打断会话）⇒ 下载完成**提示重启安装**（菜单项 ∥ 通知双面）∥ 或**退出时自动安装**；手动「检查更新…」随时可用；覆盖安装兜底。**【分期】feed = 官网托管（`downloads/` 三件——`latest.yml` 末传 ∥ prune 豁免）；Linux/mac ∥ 商店后加（承 D32）** |
| D41 | 官网桌面面 | 官网（thincoder.com）含桌面版介绍与下载：**desktop 专页**（安装 ∥ 开始使用 ∥ 界面 ∥ 模型与配置 ∥ 自动更新 ∥ 系统要求）∥ `download.html` 桌面卡 + 系统要求行 ∥ 导航 ∥ 首页 ∥ 关于 ∥ 更新日志触点 ∥ **feed 托管（`downloads/`）**；**版本面三处对盘**（源 `package.json` = 安装包名 = 站点版本面——承 `docs/RELEASE.md` §6.1）。**【分期】仅 Windows 下载版——Linux/mac ∥ 商店后加** |
| D42 | Linux 桌面产物 | **AppImage**（免安装单文件——主）**+ deb**（Debian/Ubuntu 系安装包）双产物；**官网（thincoder.com）下载页提供**（承 D32/D41 版式——桌面卡加 Linux 区块 + 系统要求行）；**自动更新 = AppImage 跟随 D40 口径**（官网 feed 增 `latest-linux.yml`——上传序与对盘判据同三件面）∥ **deb = 系统包管理器手动升级**（无自动更新）；**构建通道 = 内网构建机**（代号 ha-proxy · Ubuntu 22.04 · 源树实建 + 产物校验 + 随发布窗上传；配方 = 设计档 §2.11.1）；**备用** = GitHub Actions（`.github/workflows/linux-build.yml` 在册——账单锁待解，零动）；**验收** = 可自动面（check-dist Linux 侧 + AppImage 结构提取读数）∥ 人工面（用户 Linux 真机走查）∥ 发布窗（AppImage 自动更新链）；**【边界】rpm ∥ Snap ∥ macOS 不在本片（后加）** |
