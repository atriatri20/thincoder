Drive a real browser the tool starts itself: a headless (default) or visible system Edge/Chrome in an isolated profile.

Not a takeover — it never attaches to a browser you already have open and needs no extension. Multi-step and stateful: `navigate`, `snapshot`, then act on the element references the snapshot returns.

**Route to browser instead of fetch:**
- content that only exists after JS runs, or behind interaction (login, click, form, scroll) → browser
- move a login state in, manufacture a test state, or assert the login took effect → cookies (browser-level, any origin) / storage (page origin only)
- static page / API / raw file → fetch (cheaper, no browser process)
- web search → websearch

{{knowledge:tool-browser}}