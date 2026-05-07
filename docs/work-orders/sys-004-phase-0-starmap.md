# Phase 0 Work Order — Starmap Mechanics + Systems Points Data Artifact

**Type:** Implementation Work Order (UI + data prep)
**Status:** Active / Must-Deliver
**System:** SYS-004 Map & Navigation
**Related specs:**
- [`docs/specs/sys-004-egocentric-relational-starmap.md`](../specs/sys-004-egocentric-relational-starmap.md) (v1.0)
- [`docs/specs/sys-004-map-core-integration.md`](../specs/sys-004-map-core-integration.md) (canon-in / engine-out philosophy)

---

## 1. Objective

Build the Phase 0 starmap mechanics using a clean, engine-friendly data file generated from SUCKit-derived reference data.

**Phase 0 is map mechanics only:** render systems as points + names, support basic interaction, prove we can navigate a stable map. **No factions, no ownership, no jump links, no overlays.**

## 2. Inputs the user will provide

- **Reference data source** — access to the user's SUCKit copy (Google Sheet link) and/or a downloaded reference snapshot (`.xlsx` or `.csv`). Inspect this source to locate the correct system name + coordinate columns.
- **Specs** — the two SPEC-004 documents linked above.

## 3. Required deliverables

### Deliverable A — Engine-native map points file

Create a new, code-friendly "systems points" artifact derived from the reference data.

- **File name:** `systems_points_v0` (extension and exact location per repo structure; default JSON is fine).
- **Required record fields (minimum contract):**
  - `id` — stable identifier.
  - `name` — display label.
  - `x` — numeric.
  - `y` — numeric.
- **Rules:**
  - The runtime UI **must load only this compiled artifact**, not the spreadsheet.
  - IDs must be **stable / deterministic**. Prefer an existing stable system identifier if present; otherwise derive deterministically from name.
  - Clean / normalize: trim whitespace, ensure `x`/`y` numeric, drop invalid rows, ensure IDs unique.

**Goal:** the first canonical artifact our mapping stack depends on going forward.

### Deliverable B — Phase 0 interactive map prototype

A working interactive prototype that loads `systems_points_v0` and supports:

**Interaction:**
- Pan: click + drag background.
- Zoom: mouse wheel / trackpad.
- Single click on a system: select + highlight + show name in an info area.
- Hover tooltip: show system name (optional if click info is strong).
- Double click: recenter viewport on the clicked system (move camera/view so the system becomes centered).

**Rendering:**
- Render systems as nodes (dots / icons).
- Render selected node clearly.
- Labels are **not required** for all nodes at once; hover/selection is fine.

**Non-goals — do not implement:**
- Jump adjacency.
- Distance rings.
- Fog-of-war / intel freshness.
- Ownership / political overlays.
- Egocentric projection (recomputing relational angles).

Phase 0 is "get a navigable starfield of named nodes working."

## 4. Acceptance criteria (Phase 0 is "done" when…)

- [ ] Opening the prototype immediately shows plotted systems from `systems_points_v0`.
- [ ] Pan and zoom feel smooth.
- [ ] Clicking a node selects it and displays its name.
- [ ] Double-click recenters the viewport on that node.
- [ ] The prototype does not require access to the spreadsheet at runtime.
- [ ] `systems_points_v0` is generated **deterministically** from the supplied reference file.

## 5. Implementation notes / constraints

- **Treat SUCKit as raw source material only.** We are not adopting its schema.
- This phase establishes the map foundation for later systems (jump graph, egocentric projection, overlays).
- Keep architecture clean so Phase 1 can add jump-distance rings and adjacency without refactors.
- All code in this project comes from Claude (the user's standing rule). Do not paste code from other AI tools into the repo.

## 6. What the user needs back

- Confirm which reference tab/columns were used (`name` / `x` / `y` + any ID column) so the extraction is reproducible.
- Deliver the compiled `systems_points_v0` artifact and the runnable Phase 0 prototype.

## 7. Phase 1 preview (NOT for Phase 0)

For context only — do not build:

- Compute BFS hop distances from the current center.
- Render distance rings.
- Add adjacency-line toggle.
- Implement deterministic relational projection (`r = hopDistance × RING_SPACING`, `θ` from a stable seed per center).
- "Terran View" and "Return to Home" anchor buttons.

These come after Phase 0 lands.
