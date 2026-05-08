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

## Deployment

This repo uses GitHub Actions to deploy `apps-script/` to the live Apps
Script project automatically. Workflow lives at
[`.github/workflows/deploy-apps-script.yml`](.github/workflows/deploy-apps-script.yml).

**On every push to `main` that touches `apps-script/**`:**
1. The workflow installs `@google/clasp` on a Node 22 runner.
2. Writes the `CLASPRC_JSON` GitHub secret (the `~/.clasprc.json` that
   `clasp login` produces) to disk so clasp is authenticated.
3. Runs `clasp push --force` to upload the local source to the Apps
   Script project.
4. Runs `clasp deploy -i "<deployment-id>" -d "Auto-deploy from
   GitHub (<sha>)"` — pinned to the existing deployment so the
   user-facing `/exec` URL stays stable.

**One-time secret setup (browser-only — no local CLI needed):**
- The `CLASPRC_JSON` token is reusable across repos. If you already
  have it set on another repo (e.g. wsrca), copy that secret value
  into this repo's settings:
  github.com/alecward-coder/battletech → Settings → Secrets and
  variables → Actions → New repository secret → name
  `CLASPRC_JSON`, value = your existing token.
- Once the secret is in place, the next push to `main` that touches
  `apps-script/` triggers an auto-deploy.

**Manual run:** the workflow also supports `workflow_dispatch` — you
can trigger a deploy from the Actions tab without a code change.

### Deployment-ID pinning

`clasp deploy -i <id>` pins the deploy to a specific deployment so
the `/exec` URL never changes. Without `-i`, every run would create a
new deployment with a fresh URL and users would hit the old one
forever.

The deployment ID currently pinned in the workflow:
`AKfycbzdamWe2nQMByg7i-SzTTed1Ia3M2odED21DUsvsgvvBg1RU6hBW1D1DB2kE6uwXQUL`.

To find / replace it: Apps Script editor → Deploy → Manage
deployments → copy the deployment ID of the row you want to pin to.

## Local commands (optional)

If you do happen to use clasp locally:

```sh
npm install
npx clasp login
npm run pull   # = cd apps-script && clasp pull
npm run push   # = cd apps-script && clasp push --force
```

| Command | What it does |
|---|---|
| `npm run pull` | Pull the latest Apps Script source from Drive into `apps-script/` |
| `npm run push` | Push local `apps-script/` changes back to the Apps Script project |
| `npm run deploy` | Create a new versioned web-app deployment |
| `npm run open` | Open the Apps Script editor in a browser |
| `npm run open:sheet` | Open the live game spreadsheet |
| `npm run logs` | Tail the Apps Script execution logs |

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
