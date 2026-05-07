# SYS-004 — Map & Navigation (discussion + reveal_year derivation)

**Primary system:** SYS-004 Map & Navigation
**Status:** Active – Foundational, P0
**Depends on:** SYS-001 Time
**Lens:** Egocentric 2D
**Source:** ChatGPT design conversation (filed per the user's "label conversations by SYS" convention)

---

## TL;DR

The starmap already exists in-game (Phase 0). Open work is mostly:

1. **Make it time-aware** — systems should appear/disappear based on a `reveal_year` so a 2786 player doesn't see worlds that aren't canonically discovered yet.
2. **Define the formal SYS-004 spec** — current concept is scattered; needs consolidation into rendering, camera, selection, route planning, navigation UI, and overlay subsystems (SYS-004A through SYS-004F).

Both items are tractable. The reveal_year derivation has **already been executed** — the live `Systems` sheet shows every row with `reveal_year`, `canon_certainty=inferred`, `source_note="Earliest non-U year in SUCKit export"`, exactly as specified in the brief below.

---

## What already exists

From the Apps Script source the user shared:

```js
// Web app entry — serves the map UI
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Phase 0 Starmap')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Reads the Systems tab, returns {id, name, x, y} per row
function getSystems() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Systems');
  var data = sheet.getDataRange().getValues();
  var systems = [];
  for (var i = 1; i < data.length; i++) {
    systems.push({
      id:   data[i][0],
      name: data[i][1],
      x:    data[i][2],
      y:    data[i][3]
    });
  }
  return systems;
}
```

Confirmed present:
- HTML web-app entry point.
- Server-side data access for the Systems sheet.
- Coordinate plotting (x/y).
- System identity (id, name).
- (From SYS-001 work) per-user `SIM_TIME_TICKS` persistence via `PropertiesService.getUserProperties()`.

Not yet present (or not yet visible to me):
- Camera controls (pan / zoom).
- System selection / focus.
- Route plotting.
- Reachable-range visualization (jump radius).
- Overlay framework (faction colors, era filter, etc.).
- Time-gated visibility — though the **data** for it is now in the sheet.
- Pathfinding handoff to a movement system.

## Subsystem decomposition (proposed)

| Subsystem | Scope |
|---|---|
| SYS-004A Map Rendering | Draw nodes, links, grids; label placement; culling; clustering |
| SYS-004B Camera Controls | Pan, zoom, focus, viewport transforms (world ↔ screen) |
| SYS-004C Selection & Focus | Hovered / selected system, click-away deselect, drag-select |
| SYS-004D Route Planning | Jump-radius reachability, multi-jump pathing, route preview |
| SYS-004E Navigation UI | Set-course controls, waypointing, course commit (handoff to time-aware movement events) |
| SYS-004F Overlay & Filter System | Faction control, era filter (uses `reveal_year`), visibility status, fog/staleness from SYS-006 |

Not all need to be separate code modules — but tagging them this way lets us track coverage when implementing.

## Code-labeling convention used here

Per the project standard (see [`docs/conventions.md`](../conventions.md)), map/navigation code is labeled with `[SYS-004]` tags so a quick grep shows what's been built. Example pattern applied to the existing code:

```js
// ─────────────────────────────────────────────────────────────
// [SYS-004] Map & Navigation | Foundational | Active | P0
// Parent: SYS-001 | Lens: Egocentric 2D
// Server entry + data access for starmap rendering (Phase 0)
// ─────────────────────────────────────────────────────────────

/** [SYS-004] Map & Navigation (P0) | Egocentric 2D
 * Web app entry point serving the map UI. */
function doGet() { ... }

/** [SYS-004] Map & Navigation (P0) | Egocentric 2D
 * Returns system coordinates for map plotting. */
function getSystems() { ... }
```

What counts as `[SYS-004]`: coordinate transforms, navigation actions, map state, rendering/layout, map input, route/path selection. What does not: pure simulation.

---

## The reveal_year problem and resolution

### Problem

There are ~3,175 BattleTech canonical star systems. Showing all of them on the map regardless of in-game date is an anachronism — a 2786 player should not see worlds that don't appear in maps until the Clan Invasion era. There is no single canon "discovery date" table; per-system Sarna entries are inconsistent (some say "first survey 2133", many say "colonized during the 24th century"). Manual research on 3,175 systems is infeasible.

### Schema decision

The game needs a hard, single trigger field. Distinguish:

- **`reveal_year`** — gameplay trigger; the year the system becomes visible on the map. Always populated. The engine reads this and only this for visibility decisions.
- **`known_from_year`** — earliest canon/historical year the system is known. May match `reveal_year` or differ (lore vs gameplay).
- **`known_to_year`** — optional. For systems that become "lost" or drop off practical maps; supports re-discovery rules.
- **`visibility_status`** — `normal` | `hidden` | `lost` | `rumored` | `disabled`. Treated as a flag/override; the year-based logic is primary.
- **`canon_certainty`** — `exact` | `approx` | `era-only` | `inferred` | `unknown`.
- **`source_note`** — free text recording how the date was derived.

Engine logic:

```
if visibility_status == 'disabled':
    don't show
elif current_year < reveal_year:
    don't show
elif known_to_year is set and current_year > known_to_year:
    hide unless rediscovery rule applies
else:
    show
```

### Bulk derivation rule (executed)

Use the **Sarna Unified Cartography Kit (SUCKit)** "Systems CSV Export" sheet. It has the standard four metadata columns (`systemID`, `systemName`, `x`, `y`) followed by historical visibility columns labeled by year (`2271`, `2317`, …, `3050a`, …, `3152`). Each cell is either `U` (unknown / unmapped) or a faction ownership string (`FWL|Marik Commonwealth`).

Rule:

> `reveal_year` = the earliest year column whose value is **not blank and not `U`**.

Spot-checks (verified):
- A Place → 2750
- Aalzorg → 2750
- Abadan → 2271

Defaults applied to all rows:
- `visibility_status = normal`
- `canon_certainty = inferred`
- `source_note = "Earliest non-U year in SUCKit export"`

For rows with no non-`U` year anywhere: `reveal_year` blank, `visibility_status = hidden`, `canon_certainty = unknown`, `source_note = "No non-U year found in SUCKit export"`.

### Status

**Done.** The live `Systems` sheet contains exactly this output. The full Sarna Unified Cartography Kit workbook lives in Drive (separate from the game sheet) as the source of truth for the derivation.

---

## Implementation brief (kept for reference)

The Claude-ready brief that produced the data above — kept here so it can be re-run on schema changes or new SUCKit releases.

### Goal
Generate `reveal_year` for every system in the master list by scanning the historical map-year columns in the SUCKit workbook.

### Source
- **Workbook:** `Sarna Unified Cartography Kit (Official).xlsx` (Drive).
- **Sheet:** `Systems CSV Export`.
- **Layout:** first 4 columns = `systemID`, `systemName`, `x`, `y`. All remaining columns = year-labeled visibility columns.

### Cell semantics
- `U` → not visible / not present in that year.
- Blank → also treat as not visible.
- Anything else (faction ownership string) → visible.

### Algorithm
```
for each row in sheet:
    reveal_year = null
    for each year_column in left-to-right order after x/y:
        v = row[year_column]
        if v is not blank and v != "U":
            reveal_year = year_column   # preserve as-is, e.g. "3050a"
            break

    if reveal_year is set:
        visibility_status = "normal"
        canon_certainty   = "inferred"
        source_note       = "Earliest non-U year in SUCKit export"
    else:
        visibility_status = "hidden"
        canon_certainty   = "unknown"
        source_note       = "No non-U year found in SUCKit export"

    write { system_id, system_name, system_x, system_y,
            reveal_year, known_from_year, known_to_year,
            visibility_status, canon_certainty, source_note }
```

### Handling notes
- **Year headers may be mixed types** — some are integers (`2271`), some are floats (`2317.0`), some are tagged (`3050a`). Treat them as opaque tokens; preserve verbatim.
- **Don't auto-normalize** `3050a` to `3050` unless explicitly instructed — special markers carry meaning.
- **Faction ownership values are not relevant** for reveal timing, only their presence.
- **Match against existing systems** by `system_id` first, fallback to exact `system_name`. Do not match on coordinates.
- **Preserve coordinates exactly** — no rounding.

### Scope
- This is a **bulk gameplay-support pass**, not a deep lore audit.
- `known_from_year` stays blank for now — researched per-system later for marquee worlds.
- `reveal_year` is the sole trigger field the engine reads.

---

## Cross-references

- `docs/specs/sys-001-time-simulation-clock.md` — provides the `SIM_TIME` clock that drives `current_year` for the visibility check.
- `docs/conventions.md` — the `[SYS-XXX]` code-labeling convention; in-universe calendar (Gregorian / Terran Calendar TC).
- The full SYS-004 spec is **still to be written** — this discussion plus the live code is the input.

## Open items

1. Formal SYS-004 spec — consolidate the subsystem decomposition above into a `docs/specs/sys-004-...` parcel.
2. Time-aware visibility wiring — `getSystems()` doesn't currently filter by `reveal_year`. Either filter server-side, or return all and let the client filter on the current year.
3. `current_year` derivation — how does the client know the current year? Probably a thin formatter over `SIM_TIME_TICKS` (TC year). Decide on the formatter location (server vs client).
