# Server 终端核 · 设计

> 消费面 = `SANDBOX.md`；服务端终端会话 = `../sandbox/SANDBOX.md`。
> 最近先例：公共 modal 与原生 WebSocket。对齐 = 真 PTY、核件无控制台依赖、内容不落审计。
> 勘察证据：已读 VT 网格、DOM 渲染、键盘、传输与重连。相关 = 当前终端核。

## 1. 组件

terminal-core/vt/codec 负责 VT 解析、字符网格与编解码，terminal-render 负责脏行 DOM、光标、尺寸和键盘/IME，terminal-link 负责 WS、心跳和断开。

views-sandbox-terminal 提供管理容器终端弹窗、状态和重连；Esc 交给终端，不能误当关窗。

## 2. 能力

支持当前 xterm 子集：SGR、光标、擦除/插删、滚动区/备用屏、宽字符、DEC 线绘、键盘与 bracketed paste。

鼠标、图片、文件传输、OSC 52、持久化/重放和伪 PTY 降级不做。内容只走会话，不落库或日志。

## 3. 传输与尺寸

二进制帧携 PTY 字节，文本帧携 ready/exit/error/pong/resize/ping；心跳与判死按当前协议，重连建立新会话。

ResizeObserver 和实测 cell 计算 cols/rows，变化发送 resize。

## 4. 验证

纯件验证字节→网格、键码、宽字符和控制序列；真实容器验证 vim/top/bash/中文、断连与重连。
