# Project conventions

Small project-wide standards that apply across systems.

## Code labeling: `[SYS-XXX]` tags

Every chunk of code that implements a system should be labeled with the system's ID. Lets a quick `grep -r "\[SYS-004\]" apps-script/` show exactly what's been built for that system, without rereading whole files.

### File / module header (top of any file primarily owned by one system)

```js
/* =========================================================
   SYS-004 | Map & Navigation | Foundational | Active | P0
   Parent: SYS-001
   Lens: Egocentric 2D
   Notes: Authoritative map state, navigation, view transforms,
          selection, pan/zoom, route planning.
   ========================================================= */
```

### Function-level tag (above any function doing system responsibilities)

```js
// [SYS-004] Map & Navigation (P0) | Egocentric 2D
function renderMapFrame() { ... }
```

### Inline block label (around clusters inside a larger function)

```js
// ===== [SYS-004] Map & Navigation: input -> map interaction =====
//   ...map click / drag / zoom logic...
// ===== [/SYS-004] =====
```

### What gets a `[SYS-004]` tag (example)

Tag if the code does any of:

- Coordinate transforms (world ↔ screen, scaling, offset, camera, zoom).
- Navigation actions (set course, set waypoint, pan/zoom, focus target, jump-to system).
- Map state (selected node/system, hovered object, visible layers, fog/visibility staleness display).
- Rendering / layout (draw nodes, links, grids; label placement; culling; clustering).
- Map input (pointer handlers, drag-select, click-away deselect, keyboard nav).
- Pathfinding / route selection (the route on the map; the travel-time math may belong to another SYS).

Don't tag SYS-004 for: pure simulation, time advancement, character logic, message routing.

### Multiple systems in one function

Tag both, with clear inline blocks. Example:

```js
// ===== [SYS-004] selected system context =====
const sys = getSelectedSystem();
// ===== [/SYS-004] =====

// ===== [SYS-005] dispatch order based on selection =====
sendOrder(sys.id, 'investigate');
// ===== [/SYS-005] =====
```

---

## In-universe calendar reference

The simulation's clock unit is `SIM_TIME_TICKS` (see SPEC-001). When formatting for player UI, use Terran Calendar.

| Item | Reference |
|---|---|
| Calendar | Terran Calendar (TC) — functionally Gregorian. Sources sometimes label with "TC" suffix. |
| Time of day standard | Terran Standard Time (TST) — equivalent to GMT/UTC. |
| Universe span (commonly playable) | ~2082 (Terran Alliance / earliest interstellar) → ~3152 (ilClan era / current canon present). About 1,070 years. |
| First successful K-F jump (test) | 2107 |
| First crewed FTL transit | February 2108 (Raymond Bache, Sol jump points) |
| First crewed interstellar jump | December 2108 (TAS Pathfinder → Tau Ceti) |
| First BattleMech | 2439 — MCK-5S Mackie, first live-fire trial 5 February 2439 near Yakima, Terra |
| Star League collapse / "default era" of current sim | ~2786 TC (matches `SIM_TIME_TICKS = 21,367,229,774` in the live sheet) |

Local worlds may keep their own day/year cycles, but interstellar coordination and record-keeping uses TC/TST.

---

## Status / priority vocabulary

Used in the project tracker and in spec frontmatter — keep these consistent.

**Status:**
- `Locked` — design frozen; implementation may continue.
- `Active` — under active design or build.
- `Planned` — design is intentional; implementation hasn't started.
- `Backlog` — known need, deliberately deferred.

**Priority:**
- `P0` — foundational, blocking other systems.
- `P1` — strategic, depends on P0.
- `P2` — strategic, downstream.
- `P3` — tactical, deliberately late.

**Spec maturity:**
- `Stable` — formal spec, design considered settled.
- `Active` — formal spec exists, may still be evolving.
- `Pending` — no formal spec, only discussion.
