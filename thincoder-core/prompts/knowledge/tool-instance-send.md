Parameters: sessionId (required, no default — an id from instance_list) · text (required, no default — the message body) · re (optional — the requestId this message answers, a non-empty string of at most 128 chars; omit it for a first message).

Returns { requestId, target: { sessionId, end }, status: "delivered-to-inbox" }. requestId is the inbox message id — pass it as re when you answer back.

The target takes the message only when it has no turn in flight: during its turn the message waits in the inbox (never injected mid-turn) and starts a new normal user turn afterwards.

An unreachable target (no such session / exited / unverifiable / inbox not writable) fails the call with the target and the reason named — nothing is queued for later and nothing is dropped silently.

Delivering does not make the target your subordinate: it may ignore the message or answer "I won't".