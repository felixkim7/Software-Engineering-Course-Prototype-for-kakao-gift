---
description: Check a finished phase against its acceptance criteria and update PROGRESS.md (usage: /review-phase 2)
argument-hint: <phase number 0-6>
---

Review **Phase $ARGUMENTS**.

1. Open the spec in `docs/phases/phase-$ARGUMENTS-*.md` and go through **every** acceptance criterion.
   For each one, say PASS / FAIL / NEEDS MANUAL CHECK, with one line of evidence
   (file + function, or the exact steps I should click in the browser).
2. Check `CLAUDE.md` conventions on the files changed in this phase:
   - no hard-coded colors (tokens only), no `alert/confirm/prompt`, user text escaped,
     state changes via `store.js` / `state-machine.js`, no file over ~300 lines,
     screen ID + use case header comment present.
3. **Visual fidelity:** for each screen built in this phase that has a reference screenshot, compare it with the screenshot element by element (order, sizes, colors, spacing, font size/weight, icons, copy). List every difference. If you can't see the rendered page, ask me for a 390px-wide screenshot of it. Fix the differences, or record intentional deviations in PROGRESS.md.
4. Grep for leftover `console.log`, `TODO`, and dead code.
5. Fix FAIL items that are small and clearly within scope; list bigger ones instead of fixing them.
6. Update `docs/PROGRESS.md`: tick the phase if everything passes, add a phase log entry,
   record decisions, and list known issues.
7. Suggest a git commit message in the form `phase-$ARGUMENTS: <summary>`.
