aliases: 实例列表, 多实例, 跨实例
Any cwd — a target in another repository is addressable.

Returns [{ sessionId, end, cwd, pid }]; never includes self; pure read — writes nothing.

Only sessions that have a pickup face register here, so a headless session (one-shot chat / ACP / direct runAgent) never appears.