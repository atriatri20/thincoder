# Server 管理数据页 · 设计

> 壳 = `WEBUI.md`；数据 = `../gateway/API.md`、`../accounts/ACCOUNTS.md`、`../metering/METERING.md`。
> 最近先例：公共 dialog 与 VSC provider 表单。对齐 = 弹窗复用、同一读写链、草稿可测。
> 勘察证据：已读成员、服务模型、Provider 与 modal。相关 = 当前管理数据面。

## 1. 公共弹窗

modal.mjs 使用原生 dialog/showModal，openModal 统一头体脚、Esc/×、焦点和背景；单例，路由切换关闭，遮罩误点不关。

## 2. 成员

行开详情，支持新建、分模型配额、平台默认、本月已用、禁用即时写、key 吊销和密码重置。失败留在窗内，一次性秘密仅页级一次显示。

离表配置不误删，禁用失败回弹，键值非法不提交。

## 3. 服务模型与 Provider

服务模型由 providers 派生，配置开放/停用、RPM/TPM、配额、别名、展示说明与成本权重，均写同一 models/settings。

Provider 用添加/详情弹窗，预设或自定义，测试与发现使用当前草稿 key/proxy/baseURL。候选无手填，失败可重试；退役只提示，停用由服务模型页承担。

## 4. 验证

验证弹窗焦点、成员负例、模型全对象保存、别名保形、草稿探测和秘密零回显。
