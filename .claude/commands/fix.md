---
description: Diagnose and fix a specific bug or UI problem (usage: /fix the pay button stays disabled)
argument-hint: <description of the problem>
---

Problem reported: **$ARGUMENTS**

1. Reproduce it: identify the page/URL and steps, and read the relevant page module plus the shared modules it uses.
2. Explain the root cause in 1–3 sentences before changing code.
3. Make the smallest fix that follows `CLAUDE.md` conventions. Do not refactor unrelated code or add features.
4. Tell me exactly how to verify the fix in the browser.
5. If the fix changes behavior described in a spec or a decision, note it in `docs/PROGRESS.md`.
