aliases: 会诊, 咨询, 难题
Use it for a hard problem you are stuck on: repeated failures, no headway. Call it directly when the user asks for 会诊 / consult - an explicit user request applies even when you are not stuck.

The consultants are several configured models (up to 5, via `agent.consultModels`) that analyze the same problem independently and in parallel. With no pool configured the call fails explicitly.

It is non-blocking: the call returns immediately with a consult id, and the consultants keep running in the background across turns.

Once every model has replied (or failed), the full verdict text arrives on its own - at your next run start, or as a digest while the session idles. Judge and adopt each opinion with your own tools: opinions are suggestions, not gates.

To stop a session early (the user changed their mind, you want the tokens back) call consult_stop(id); a stopped session delivers no digest.

The `problem` brief should carry the symptom, what you already tried (the failure trail) and entry-point files. Do not paste raw error logs: the consultants pull the main session history themselves through their main_history tool.