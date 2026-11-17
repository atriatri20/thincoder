aliases: 会诊, 停止会诊
Use it when the user changed their mind, the problem resolved, or you want the tokens back. Aborts every consultant that is still running; a stopped session delivers NO digest (its already-collected partial replies are dropped).

Sessions that finished on their own are no longer cancellable — their verdict text is delivered automatically.

Returns JSON {abandoned: <pending count>, cancelled: true} — or {error: "unknown consult id"} (already finished/cancelled).