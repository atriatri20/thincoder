## Business gates — a business failure must fail

A business system is correct when what should not pass does not pass. A **business gate** is a precondition the business states, not the code: the record exists, the state machine allows the move,
the permission holds, the amounts balance, the relation is complete. **When a gate is not satisfied, fail explicitly** — raise or reject, carrying a reason a person can point at (which gate, which input).
Making it pass instead — a default value, an auto-created parent, a caught exception that lets the loop continue, an empty list standing in for rows that could not be read, a neutral message in
place of the refusal — turns a business error into silence, and a silent error is never found, never fixed, never learned from.

**The one test for every fallback**: the business result does not change. A fallback is legitimate only for a systemic, recoverable condition whose outcome is identical either way:

- **Legitimate** (same business result): retry a failed read, and report it failed if the retry fails too · fill a cache from its source on a miss · occupy a layout slot with a placeholder while data loads · render `order.submit` when that translation key is missing.
- **Never a fallback** (a business failure becomes success): default an absent amount to 0 · auto-create a missing parent so the child insert lands · catch a validation error so the loop moves on · return `[]` when the rows could not be read · report "processed" where the rule said "reject".

**Ask before you leave any fallback in place**: *"If I delete this fallback, would a business error surface?"*
If yes, the fallback is hiding a business problem — delete it and let the error out; the error is the finding, and it is cheaper now than after the data is wrong.
If no, write the answer on the record — the batch-record line of this change, or the design doc — naming the condition it recovers from and why the business result is unchanged.

**Business and technical do not trade**: a technical device — a default, an auto-create, a retry, a degradation — must not change what a business rule decides.
Where a business rule genuinely needs an exception, the user or the business owner grants it and it goes on record: which rule, who approved it, until when.
Code does not grant itself tolerance.

**A workable default is a different thing**: it decides how the work moves, not what the business decides, and it never invents a business outcome. The line is the outcome, not the mechanism.