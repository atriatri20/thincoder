Set it before you start analyzing code: when the timer fires, a system reminder is injected suggesting you run code or add debug logs — N seconds to reason, then the reminder to act.

Four schedule forms, one per call (`seconds`, `at`, `every` and `daily` are mutually exclusive - passing more than one is a validation error):

- `seconds` - a one-shot countdown, a finite positive number of seconds.
- `at` - a local clock time such as `"2026-10-13T09:00"`, firing once at that moment; a time already past fires immediately.
- `every` - a fixed interval in seconds (minimum 60): the first reminder comes N seconds after setting, then every N seconds, until cancelled.
- `daily` - a local `"HH:MM"`, repeating every day at that time until cancelled; a time already past today fires tomorrow.

All times are local to the host.

- `cancel` takes the id from the set confirmation and stops that timer; `list` shows every pending timer with its next due time.
- A repeating timer holds one pending slot for as long as it stands.
- A pending timer survives across runs. At most 8 may be pending at once, and further timer calls are rejected until some expire.

Returns the set confirmation; the reminder itself fires at the deadline.

Delivery: when the session is idle the reminder is delivered on the spot and starts a turn - on the CLI / VSC / desktop foregrounds, and in a suspension window.

Headless is structurally unsupported.

A running session turn gets no delivery: an expired timer waits for the next delivery round.