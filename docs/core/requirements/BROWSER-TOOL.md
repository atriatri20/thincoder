# 浏览器工具（BROWSER-TOOL）· 需求

> 设计 = `docs/core/design/BROWSER-TOOL.md`。

## 1. 范围

browser 自启系统 Edge/Chrome 的独立 profile，经 CDP 操作真实页面。支持有头/无头，不接管用户已开浏览器，不依赖扩展或第三方自动化库。

## 2. 动作

当前动作 = navigate/snapshot/click/type/evaluate/wait/screenshot/close/press/hover/wheel/mouse/drag/touch/insert/clipboard/cookies/storage。

- 多轮保持页面、登录态和引用。
- snapshot 给紧凑元素清单、稳定 ref、几何与视口状态。
- 输入支持真实键、指针、拖拽、触摸、文本/IME 与剪贴板。
- cookies/storage 支持当前 get/set/clear、域和 area 规则。
- 写操作按当前权限分类；cookies/storage 是当前免审测试态面。

## 3. 共享与生命周期

全机共享当前浏览器池，首个实例决定 headless，后续不兼容请求沿用并提示。各实例有自己的标签页，最后释放才尝试关闭。

启动、动作和等待都有硬预算；自启预算与动作预算分开。外部关闭可感知，后续可重开。

async 动作立即 ack，经统一后台摘要与 wait_for/process 管理。

## 4. 数据与失败

页面内容是不可信数据。password 输入不回显；cookie/storage 回执按当前显式工具契约返回值，不写日志。

非法参数、读写失败、Cookie 未实际落地和存储清单读取失败都显式报错，不把读失败当空集合。

## 5. 验收

验证自启/发现、双模式、共享池、所有动作、引用 stale、超时、外部关闭、异步、httpOnly Cookie、跨域、storage 隔离、剪贴板与隐私。
