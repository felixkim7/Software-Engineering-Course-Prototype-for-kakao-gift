# KakaoTalk Gift (선물하기) To-Be — Screen Prototype

Front-end-only clickable prototype for Sogang University CSE4115 Software Engineering,
Team Assignment 1 ("재구축 서비스 정의"). Built with vanilla HTML, CSS and JavaScript.

## Run

1. Open this folder in VS Code.
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `prototype/index.html` → **Open with Live Server**.
   *(Alternative: `npx serve prototype` and open the printed URL.)*

ES modules don't work from `file://`, so always use a local server.

The demo hub (`prototype/index.html`) has role cards, **데모 데이터 초기화** (reset), failure toggles
for the alternate flows, and a component gallery (`prototype/index.html#gallery` opens it directly).

## Folder overview

```
prototype/
  index.html            demo hub (SCR-00)
  buyer/ recipient/     mobile screens in a phone frame
  seller/               desktop seller center
  assets/css/           tokens.css (all colors/sizes) · base · components · overlays · layout-mobile · layout-desktop
  assets/js/core/       store, seed-data, state-machine, format, strings, recommend
  assets/js/services/   mock payment / messaging / delivery / export
  assets/js/ui/         components, overlays, icons, data-table, gallery
  assets/js/pages/      one module per HTML page
  assets/img/           images cropped from docs/reference-screens/
tools/
  crop-screens.py       re-crop images:  python tools/crop-screens.py   (needs Pillow)
  check-core.mjs        core logic self-check:  node tools/check-core.mjs
```

## Development with Claude Code

- `CLAUDE.md` — project rules Claude Code reads automatically.
- `docs/requirements.md` — actors, use cases, screen list and traceability.
- `docs/data-model.md` — entities, gift state machine, mock services.
- `docs/reference-screens/` — **put screenshots of the real KakaoTalk Gift app here** (naming guide inside).
- `docs/design-system.md` — visual fidelity rules, how to extract `docs/visual-spec.md`, components.
- `docs/phases/` — one spec per development phase (0–6).
- `docs/PROGRESS.md` — what's done, decisions, known issues.

Slash commands in Claude Code:

| Command | Use |
|---|---|
| `/start-phase 0` | Begin a phase (reads spec, proposes a plan, then builds) |
| `/review-phase 0` | Check acceptance criteria, update PROGRESS.md |
| `/fix <problem>` | Targeted bug fix |

Suggested loop per phase: `/start-phase N` → approve plan → check in browser →
`/review-phase N` → `git commit` → `/clear` → next phase.
