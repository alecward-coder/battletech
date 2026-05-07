# BattleTech

A simulation/game project built on Google Sheets + Google Apps Script. This repo
mirrors the Apps Script source and the spreadsheet schema so the project lives
in version control rather than only inside Drive.

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full system map and
design pillars. The short version: twelve numbered systems (`SYS-001` through
`SYS-012`) layered Foundational → Strategic → Tactical, each owning a slice of
the simulation (time, characters, ComStar, map, messaging, information, …).

## Repo layout

```
apps-script/         Google Apps Script source (populated by `npm run pull`)
schema/              SQL schema + ER diagram for the spreadsheet tables
seeds/               CSV exports of the live spreadsheet (regenerated)
docs/                Architecture and design notes
tools/               Helper scripts (sheet exporters, etc.)
Reactor Core Continuum.mp3   Starmap background audio
```

## Linked Google assets

| Asset | ID |
|---|---|
| Apps Script project | `1jeptQ7j6081OonGVxIXDlAMpJXQwmklcWyhovfFOy_6gbWTPQlZNXo2I` |
| Game spreadsheet (data) | `1nr-9ln8iWfK_ajDYpi7csVOfvfJKy_5IUxUrgB7EfD4` |
| Project spreadsheet (tracker) | `13PdRUOw80mngycq1RmD7VFDo58wmkKCnNIbgo52r1Nk` |

The script ID above is already wired up in `.clasp.json`.

## One-time setup

```sh
npm install
npx clasp login        # opens a browser for Google OAuth
npm run pull           # writes Apps Script source into apps-script/
git add apps-script/
git commit -m "Pull Apps Script source"
```

## Day-to-day

| Command | What it does |
|---|---|
| `npm run pull` | Pull the latest Apps Script source from Drive into `apps-script/` |
| `npm run push` | Push local `apps-script/` changes back to the Apps Script project |
| `npm run deploy` | Create a new versioned web-app deployment |
| `npm run open` | Open the Apps Script editor in a browser |
| `npm run open:sheet` | Open the live game spreadsheet |
| `npm run logs` | Tail the Apps Script execution logs |

Edit either in the Apps Script editor or in your local IDE — just remember to
`pull` before editing locally and `push` after.

## Refreshing the seed data

The CSVs under `seeds/` are exports of the live spreadsheet, kept in git so the
schema and a snapshot of the data round-trip through code review.

To refresh:

1. Paste the contents of `tools/ExportSheetToCsv.gs` into the Apps Script
   project (one-time).
2. Run `exportAllSheetsToCsv()` from the Apps Script editor. It writes one
   `.csv` per tab into a Drive folder and prints the folder URL.
3. Download the CSVs and replace the files under `seeds/`.
4. Commit.

## Status

- **Phase A (this branch)** — clasp scaffolding, schema docs, README. Apps
  Script source still needs to be pulled by the project owner.
- **Phase B (next)** — implement `SYS-006 Information & Knowledge`. See the
  plan in `/root/.claude/plans/what-other-functionality-can-virtual-stream.md`
  (local to the dev session) or `docs/architecture.md` for the system summary.
