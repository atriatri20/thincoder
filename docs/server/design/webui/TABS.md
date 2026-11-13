# Server 公共标签页 · 设计

> 壳 = `WEBUI.md`；消费面 = `SANDBOX.md`、`PROJECTS.md`。
> 最近先例：公共 modal。对齐 = 路由无关、键盘可达、面板保活。
> 勘察证据：已读 createTabs、ARIA、懒建和地址子段。相关 = 当前 tabs。

## 1. 组件

createTabs(ctx,{tabs,initial,onChange}) 返回 root/active，tab 项含稳定 id、labelKey 和 build。

使用 tablist/tab/tabpanel、aria-selected、aria-controls/labelledby 和 roving tabindex；点按、左右循环、Home/End 可用。

面板首激活构建一次，之后 hidden 切换并保活。组件不读写 hash。

## 2. 消费

沙盒页分运行面与镜像/镜像源，管理项目页分项目与 Git 源。页面将选中 id 写入 hash 子段，刷新/分享可恢复，非法值回首项。

数据随面板首激活读取，已有表单和弹窗状态不因标签切换丢失。

## 3. 验证

验证初始回落、懒建次数、键盘/ARIA、面板保活、hash 恢复和原功能回归。
