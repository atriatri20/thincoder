instance_list — read-only: list every live ThinCoder instance on this machine that can receive a cross-instance message (any cwd — a target in another repository is addressable).

Returns [{ sessionId, end, cwd, pid }]; never includes self; pure read — writes nothing.

Only sessions that have a pickup face register here, so a headless session (one-shot chat / ACP / direct runAgent) never appears.
