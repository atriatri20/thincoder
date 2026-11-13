A one-way channel to your PARENT (the agent that spawned you) - you are a subagent, so there is no user to ask. It queues a message on the parent's side: your turn is not interrupted and nothing is taken out of it.

- `kind: 'ask'` - a question whose answer changes your next step and that you cannot answer from the materials you can read (task book / design doc / repo). The parent replies with `subagent action:'send'`, and you receive it as an ordinary instruction at your next turn boundary. One ask at a time while a previous one still waits in the parent's queue.
  Read the materials first and carry the evidence you already checked (the file path plus the exact words you read) - the parent should not have to re-read for you.
- `kind: 'note'` - an FYI that needs no answer (a premise you found broken, a conflict you resolved and want visible early).
{{knowledge:tool-notify-parent}}