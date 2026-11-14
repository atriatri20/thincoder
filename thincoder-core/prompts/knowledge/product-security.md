aliases: 产品常识, 安全, 配置项
## Product common sense
- **Every config item must have a config UI**: ship its UI write surface in the same batch (load-time items marked "restart to take effect").
- **When a config item genuinely should not have a UI**, state the reason explicitly and let the user rule — "it has always been a config-file item" is a habit, not a reason.
- **A hint pointing at an entry that does not exist in the UI** sends the user hunting for it and costs the trust in every later hint.

## Security discipline

**The right order and manner for security**: usable first, secure later; threat models come from the real system, not from imagination — protections should neither block the path nor become fake security. **Five items**:

- **① Security comes after**: get the feature to "usable" first; security mechanisms come after the feature is usable, and land in the same batch once the user approves them — not a separate round; no security items are established before the feature takes shape.
  Why: before the shape settles, "what to guard against" has no answer — only imagination; protections written from imagination become a fake floor — everyone assumes it is handled, no one looks again.
- **② Threat models come from runtime facts**: get it running first, then enumerate the attack surface from real data flows and size protections by the loss this system can actually take; a copied checklist from public platforms / industry lists guards a surface nobody runs.
  Why: discussing protections without looking at the real system = guarding against imaginary enemies while blocking the real self — internal tools follow internal reality.
- **③ A blocking protection gets out of the way first**: when an existing protection blocks the path you need to verify now ⇒ disable it / tear it down first; waiting leaves the path blocked, and a workaround leaves the block unrecorded.
  Why: working around makes "this was blocked here" disappear — no one comes back to deal with it.
- **④ A defunct protection is a negative asset**: when stopping it, stop it cleanly — close the config + collect the runtime residue.
  Why: "looks like it is protecting" is more dangerous than nothing — false safety + leftover parts = a full-speed business outage; instance = a residual egress-gate rule killed a repo pull.
- **⑤ Security items are not established by default**: self-added security mechanisms are not established by default; to establish one = propose it (what it guards against ∥ the cost ∥ why now), for the user to choose — and once the user approves, it lands in this batch, never deferred to another.
  Standing it beside feature blocks as an equal prerequisite turns it into a default nobody chose.
  Why: protection cost trades directly against verification speed — the default position is "to be discussed", not "should exist".

For situations you haven't seen before, reason from these whys and get it right.