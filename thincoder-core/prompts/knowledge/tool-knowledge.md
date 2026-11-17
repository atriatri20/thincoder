aliases: 知识, 主题, 检索知识, 查主题
Pure-reference topics are never inlined into system prompts.

Actions: `list` shows globally unique topic ids and titles; `search` returns bounded locating snippets; `get` returns the complete topic by exact id.

Search splits the query on whitespace, lowercases each word, trims the punctuation at both ends of each word and then drops high-frequency function words (`the`, `of`, `a`, `的`, `了` …).
A word's inner characters stay as written, so `doc?` searches `doc` while `doc-check` is searched whole.
A query left with no word fails explicitly and names `query` — type a concrete noun instead of retrying the same shape.
Every remaining word matching the id, the title, an alias or the body puts that topic in the result (OR — not all words must match).
Ranking: title-level hits first (a distinct word hitting the id, the title or an alias), then total hits, then id ascending.

A topic's first line may carry `aliases: word, word` — near-synonyms, Chinese included. Aliases are metadata, never part of the body a `get` returns; they exist so a Chinese query can find an English-id topic.

Results are capped at 10 topics and 6,000 characters, so a wide query cannot swallow the window.
The envelope reports `matched` (topics that matched), `shown` (topics returned) and `truncated` — never read a short list as "these are all the matches".
No match returns an explicit empty result that names the next step: retry with one English keyword, or run `list` for every topic id first.

Search only to locate: read `get` before acting on a rule. Unknown actions, missing arguments, unknown topics and duplicate ids fail explicitly; no match is an explicit empty result.
