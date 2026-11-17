# Desktop 打包与发行 · 设计

> 需求 = `docs/desktop/requirements/PACKAGING.md`。
> 最近先例：`PORTABILITY.md` 的随包资源与 `docs/RELEASE.md` 的发布流程。对齐 = 源树物化、产物可验证。
> 勘察证据：已读 electron-builder 配置、check-dist、签名、更新和 Linux 分流。相关 = 当前发行面。

## 1. 构建

electron-builder.yml 声明 appId/productName/artifactName、平台目标、files 白名单和 generic feed。

prepackage 从源树物化 @thincoder/core 与 render-core，包含 prompts/tool-docs；postpackage 跑 check-dist 并恢复 dev-link。

check-dist 验证核包版本、preload、renderer、安装包、更新索引与 sha512，缺失即失败。

## 2. 签名与更新

win-sign hook 在证书可用时实签，缺席明示；发布版本必须核验实际签名。

update.mjs 在打包且非 smoke 时检查更新，autoDownload 后台下载，菜单/通知提示重启，autoInstallOnAppQuit 或 quitAndInstall 安装。失败不阻断应用。

feed 上传顺序为安装包、blockmap、更新索引，防止索引先于包可见。deb 不进入 AppImage 自动更新面。

## 3. 官网与版本

站点桌面页、下载卡、导航、关于和更新日志按发布流程更新；downloads 不被站点 prune 误删。

版本以 desktop package.json 为源，产物名、feed、站点一致。发布和站点写由用户授权。

## 4. 验证

自动验证包内容与结构，目标平台验证安装、启动、更新和卸载。Linux 另验证 AppImage 更新与 deb 不自动更新；macOS 结果按实际构建记录。
