# SPEC-004A — Map Core Integration & Scenario Foundation

**System:** SYS-004 Map & Navigation (companion to SPEC-004 the UI spec)
**Document type:** Design / Implementation Bridge
**Status:** Active – Foundational
**Depends on:** SYS-001 Time
**Related:** SPEC-004 Egocentric Relational Starmap Interface, SPEC-003 ComStar Superset Admin Interface

---

## TL;DR

How canonical star-system data gets ingested, normalized, and used as the foundational map layer. The map is a **relational graph**, not a physical simulation — it's the substrate everything else (distance, time, order latency, authority decay, visibility, scenario init) reads from.

**Canon-in, engine-out is the rule.** SUCKit (the Sarna Unified Cartography Kit) is a **raw input feed**, not a runtime dependency. We compile it once into engine-native artifacts (`systems.json`, `jump_edges.json`, optional `canon_owners.json`, or one combined `map_core.bundle.json`); the UI and simulation only ever read those compiled artifacts.

Scenarios are **overlays** keyed by `system_id` (ownership, legitimacy, intel state). The base graph never changes; only overlays do.

> *"If distance is correct, the universe is correct."*

---

## 1. Purpose

Defines how canonical star system data is ingested, normalized, and used as the foundational map layer for the game universe.

The map is treated as a **relational graph**, not a physical simulation, and serves as the substrate for distance, time, order latency, authority decay, visibility, and scenario initialization.

## 2. Canonical data source

**Primary:** Sarna Unified Cartography Kit (SUCKit, official). The user maintains a personal copy in Drive.

**Usage policy:**
- Canon data defines **initial conditions only**.
- No future state is forced to follow canon outcomes.
- All political, territorial, and technological data is mutable after start.

## 3. Map core model

### 3.1 Star system node

```
{
  "system_id": "string (stable, canonical)",
  "name": "string",
  "abstract_coordinates": { "x": "number", "y": "number" },  // projection only
  "jump_links": ["system_id", "..."],
  "tags": ["capital", "hub", "periphery", "..."],
  "metadata": { ... }
}
```

`abstract_coordinates` are **strictly for projection / anchoring / spatial bucketing**. Distance never uses them.

### 3.2 Jump route edge

- Bidirectional traversal.
- Base cost = 1 jump.
- Optional modifiers (risk, instability, interdiction — future).

**Distance is measured exclusively in jump count, not Euclidean space.**

## 4. Distance & time semantics

- Jump count = primary distance metric.
- Derived systems all depend on jump count: order transmission delay, information freshness decay, governance authority decay, response timing.
- Shortest-path resolution must be **deterministic**.

## 5. Egocentric projection rule

The map is rendered relative to a selected center system (full UI behavior in SPEC-004). The projection layer:
- Prevents omniscient "god maps."
- Enables role-based visibility.
- Supports fog of war.
- Allows ComStar to have a different projection model.

## 6. Scenario integration

A scenario defines: start date, initial system ownership, initial legitimacy relationships, technology availability, AI doctrine presets, ComStar posture.

**The map itself remains constant; only overlays change.**

## 7. Multi-lens compatibility

The map must support strategic (turn/tick), operational (battle resolution), and embodied (pilot-level) lenses. **All lenses reference the same underlying map graph.**

## 8. Non-goals (this parcel)

UI styling, combat mechanics, AI behavior trees, political event scripting, balance tuning.

## 9. Implementation note

First implementation milestone:
- Load canonical systems and jump routes.
- Build internal graph representation.
- Support recentering and jump-distance queries.

---

## Ingest & normalization contract

### Source policy

- **SUCKit is input, not a dependency.** The game runs on a compiled artifact.
- UI + simulation only ever read the compiled artifacts, never the spreadsheet.

### Internal canonical schema (engine-facing)

Define one internal format. UI/simulation never touch raw spreadsheets.

**SystemNode**
```
{
  "system_id": "string",
  "name": "string",
  "coords": { "x": "number", "y": "number" },   // for projection only
  "tags": ["string"],
  "metadata": { "capital": "bool", "hub": "bool", "periphery": "bool" }
}
```

**JumpEdge**
```
{ "a": "system_id", "b": "system_id", "base_cost": 1 }
```

**GraphBundle**
```
{
  "version": "string",
  "source": { "suckit_version": "string|nil", "generated_at": "iso8601" },
  "systems": [ SystemNode ],
  "edges":   [ JumpEdge ]
}
```

### Normalization rules

| Rule | Why |
|---|---|
| Stable IDs | If SUCKit uses multiple identifiers, pick one as canonical and keep a mapping table in the build report. |
| Undirected adjacency | All edges bidirectional. Ingest deduplicates `(a,b) == (b,a)`. |
| Dangling references | Missing endpoint → ingest fails loudly (or quarantines into an errors report — never silently drops). |
| Disconnected components | Allowed. Engine returns `null` / `∞` for cross-component distance queries. |

### Determinism

Build artifact must be reproducible:
- Sort systems by `id`.
- Sort edges lexicographically (min/max endpoint ordering).
- Sort tags.
- Emit `snapshot_id` + hash of outputs.

Same inputs → byte-identical outputs.

### Distance API (engine surface)

```
getNeighbors(system_id)              -> system_id[]
getHopDistance(center_id, target_id) -> int | null
getHopRings(center_id, maxR)         -> { 1: [...], 2: [...], ... }
getShortestPath(center_id, target_id)-> system_id[] | null
```

Primary distance = BFS hop count. If variable edge costs land later, swap BFS → Dijkstra without changing the call surface.

Determinism via stable adjacency sort + stable BFS queue ordering.

### Performance plan (3k–5k systems)

If deriving edges from coordinates + a `JUMP_RANGE` threshold (Phase 1+):
- **Spatial bucketing** — bucket systems into cells of size `JUMP_RANGE`; each system only compares against its own bucket + 8 neighbors. Reduces O(n²) drastically and stays deterministic.
- Stable sort of neighbor lists by `(distance, system_id)` after computation.

---

## SUCKit-specific notes

(Filed because the user has a copy of the official SUCKit workbook in Drive and intends to use it as the seed for the Phase 0 build.)

### What SUCKit gives us

- **Non-canonical coordinates** by design (canon-adjacent / meta-source) reconciling published maps into a consistent 2D space.
- Distributed as a Google Sheet / `.xlsx`. Tabs include: Systems, Factions, Pathfinding, Coordinates Conversion, Export, etc.

### Critical ingest gotcha

Per the workbook's own version log (2026-01-04): **the data separator inside Systems-tab cells is `|` (pipe)**, not comma. CSV exports use comma as the row delimiter, but cell-level multi-values use `|`. The importer must not confuse the two.

### What to extract for Phase 0

Only what's needed to render dots + labels:
- Stable system identifier (prefer SUCKit's existing column if present; otherwise derive deterministically from name).
- Display name.
- 2D coordinate hint (`x`, `y`) — for projection seeding / spatial bucketing **only**.
- Optional: tags (capital, hub, periphery, region grouping) — helpful, not mandatory.

### What to extract for the scenario library

- **Canon owner-by-year** mapping — not as truth, but as a scenario seed table:

```
{
  "owners_by_year": {
    "3025": { "S000123": "FS", "S000456": "LC" },
    "3050": { "S000123": "FS", "S000456": "FC" }
  }
}
```

### What to ignore

Built-in pathfinding sheets / formulas (we re-derive deterministically), presentation fields meant for Sarna tooling, anything that implies post-start politics must follow canon.

### Build pipeline (conceptual; no code per the project's "code-from-Claude-only" rule)

1. Load SUCKit export (`.xlsx` or `.csv` with pipe-delimited multi-values inside cells).
2. Normalize IDs, names, coords, tags. Trim whitespace; coerce numeric `x`/`y`; drop invalid rows; ensure ID uniqueness.
3. Validate integrity (unique IDs, numeric coords, no orphan edges if importing edges).
4. Build jump edges (Phase 1+; not Phase 0).
5. Emit compiled artifacts + a build report.
6. Result: `systems.json`, `jump_edges.json` (Phase 1+), optional `canon_owners.json`, or single combined `map_core.bundle.json`.

---

## Phase 0 contract (links to the work order)

For the very first implementation pass, the only artifact is the **systems points file**:

```
{
  "schema_version": "starmap_points_v0",
  "systems": [
    { "id": "new_avalon", "name": "New Avalon", "x": 123.45, "y": -67.89 },
    { "id": "terra",      "name": "Terra",      "x": 0.0,    "y": 0.0    }
  ]
}
```

Just `id`, `name`, `x`, `y`. No factions, no jump links, no canon ownership, no overlays. Detail in `docs/work-orders/sys-004-phase-0-starmap.md`.

## Acceptance test (Milestone 0)

> *"Universe is correct if distance is correct."*

Pick 10 known systems and verify hop counts vs a reference output generated once (golden file). Pass = deterministic and matches.

## Cross-references

- `docs/specs/sys-004-egocentric-relational-starmap.md` — the UI spec this graph feeds.
- `docs/specs/sys-006-information-knowledge.md` — the `intel_confidence` / `last_updated_cycle` overlay contract.
- `docs/specs/sys-003-comstar-superset-admin-interface.md` — ComStar consumes this graph for its own (privileged) projection.
- `docs/work-orders/sys-004-phase-0-starmap.md` — actionable Phase 0 build task.
- `docs/discussions/sys-004-map-and-navigation.md` — broader SYS-004 discussion + the already-executed `reveal_year` derivation against SUCKit.
- `docs/discussions/sys-004-3d-representation.md` — the synthetic Z-axis layer that uses `coords` for visualization-only depth.
