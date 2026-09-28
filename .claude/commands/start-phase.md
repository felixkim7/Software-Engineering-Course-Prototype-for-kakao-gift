---
description: Start a development phase (usage: /start-phase 2)
argument-hint: <phase number 0-6>
---

We are starting **Phase $ARGUMENTS**.

1. Read `CLAUDE.md`, `docs/PROGRESS.md`, and the spec file in `docs/phases/` whose name starts with `phase-$ARGUMENTS-`.
2. Read every doc that spec lists under "Read first".
3. Open every screenshot listed in the spec's "Visual reference" section, plus `docs/visual-spec.md` (Phase 0: all screenshots). For each screen you will build, list its elements top to bottom as seen in the screenshot.
4. Check `docs/PROGRESS.md`: if an earlier phase is not ticked, or there are open "Known issues" that block this phase, stop and tell me before doing anything else.
5. Look at the existing code in `prototype/` you will build on (store, components, related pages) so you reuse instead of duplicating.
6. Post a plan:
   - files to create / modify, in order
   - which acceptance criteria each step addresses
   - any ambiguity in the spec and the assumption you propose
7. Wait for my OK, then implement step by step. After each step, tell me which URL to open to check it.
8. Do not implement anything from later phases.
