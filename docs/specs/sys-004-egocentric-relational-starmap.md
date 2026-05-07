# SPEC-004 — Egocentric Relational Starmap Interface

**System:** SYS-004 Map & Navigation
**Document version:** v1.0 (Foundational)
**Status:** Design-Complete / Implementation-Pending
**Depends on:** SYS-001 Time
**Related:** SPEC-004A Map Core Integration & Scenario Foundation (companion spec — `sys-004-map-core-integration.md`), SPEC-003 ComStar Superset Admin Interface, SPEC-006 Information & Knowledge

---

## TL;DR

A 2D interactive map that represents a 3D interstellar environment through **relational projection**, not physical simulation. Always centered on a selected system; **distance = jump count**, not light-years; angle = relational embedding so neighboring topology clusters together visually.

Recomputes dynamically when the center changes (double-click a system → it becomes the new origin). Maintains orientation through stable reference anchors (Terran view + faction home). Fog of war affects **data freshness, not geometry** — known systems are always visible; what degrades is intel confidence and last-update age.

> *"This map does not show where things are. It shows how they relate — from where you stand."*

---

## 1. System purpose

The Egocentric Relational Starmap is a 2D interactive visualization representing a 3D interstellar environment through **relational projection**, not physical simulation.

The map:
- Is always centered on a selected system.
- Displays other systems based on jump distance and relational proximity.
- Recomputes dynamically when the center changes.
- Is fully interactive (clickable, navigable, explorable).

Must allow a human player to:
- Click on any visible system.
- Re-center the map from that system's point of view.
- Maintain orientation through stable reference anchors.

## 2. Core design principles

1. The map represents **relationships**, not literal space.
2. **Distance = jump count**, not kilometers.
3. The map is **egocentric**, not absolute.
4. Orientation is preserved through reference anchors.
5. All interaction must be **visible and immediate**.
6. **No true 3D rendering** is used.

## 3. Data model (required inputs)

### 3.1 System object

Each star system must contain at minimum:

```
{
  "id": "string",
  "name": "string",
  "jump_neighbors": ["system_id", "..."],
  "jump_distance_cache": { "system_id": integer },
  "owner_faction": "string | null",
  "last_updated_cycle": integer,
  "intel_confidence": float (0.0–1.0)
}
```

Jump distances may be precomputed or calculated on demand.

## 4. Map projection model

### 4.1 Coordinate system
2D Cartesian using polar projection.
- Center system = `(0, 0)`.
- Other systems plotted via `x = r * cos(θ)`, `y = r * sin(θ)`.

### 4.2 Radius (distance)
`r = number_of_jumps_from_center`.

This implicitly encodes travel time, risk, cost, and logistics overhead. **No additional distance units are used.**

### 4.3 Angle (relational proximity)
Angles are assigned to minimize contradiction between system relationships:
- Systems close to each other appear near each other angularly.
- Systems far from each other separate angularly.
- Clusters emerge naturally.

Implementation may use force-directed layout, weighted angular sorting, iterative relaxation, or deterministic seeding for stability.

⚠️ Algorithm choice is implementation-flexible.
⚠️ Result must be **stable and readable**, not physically accurate.

## 5. Interaction model

### 5.1 Input actions

| Action | Result |
|---|---|
| Single click on system | Select system (highlight + info panel) |
| Double click on system | Re-center map on that system |
| Click & drag | Pan map (no re-centering) |
| Scroll / pinch | Zoom in/out |
| Button: "Return to Home" | Re-center on faction core |
| Button: "Terran View" | Re-center on Terra |

**Double-click behavior is mandatory** for intuitive exploration.

### 5.2 Re-centering behavior

When a system becomes the new center:
- Map recomputes positions.
- Selected system moves to `(0,0)`.
- All other systems reposition relative to it.
- Animation is **smooth, not instant**.
- Orientation anchors remain visible.

## 6. Orientation & stability features

### 6.1 Universal Reference View (Terran View)
- Terra is a global reference anchor.
- Available to all factions.
- Acts as the "north star" of the map.
- Reflects ComStar's canonical perspective.
- Provides a shared spatial baseline.

### 6.2 Faction Home Anchor
Each faction has:
- A defined "core system" or region.
- A UI control to snap back to it.
- A visual boundary or highlight.

## 7. Fog of war & information age

### 7.1 Visibility rules
- All known systems are always visible.
- Fog of war never hides system existence.
- **Fog affects data freshness, not geometry.**

### 7.2 System information degradation
Each system displays:
- "Last updated: X cycles ago"
- Intel confidence: low / medium / high

Quality degrades with: distance, time, ComStar interference, lack of local assets. Local or owned systems are always most accurate.

## 8. UI requirements

### 8.1 Minimum visual elements
- System nodes (icons).
- Lines or arcs showing jump adjacency (optional toggle).
- Distance rings (1 jump, 2 jumps, etc.).
- Highlight for selected system.
- Tooltip or side panel for system data.

### 8.2 Performance
- Layout recompute < 250 ms.
- Zoom/pan must be fluid.
- No layout jitter between recomputes.

## 9. Implementation phase order (mandatory)

| Phase | Scope |
|---|---|
| **1** Static Map Rendering | Load systems, render egocentric projection, no interaction |
| **2** Selection & Tooltips | Click to select, show system info |
| **3** Re-centering Logic | Double-click to re-center, animate transition |
| **4** Orientation Anchors | Home snap, Terran view |
| **5** Fog of War Overlay | Data freshness, confidence indicators |

## 10. Engineer guidance

- This map is a **projection, not a simulation**.
- Stability > realism.
- Player comprehension > physical accuracy.
- Determinism > randomness.
- Debug overlays must exist for: jump distances, angular ordering, layout stress.

## 11. Design truth statement

> *"This map does not show where things are.*
> *It shows how they relate — from where you stand."*

---

## Proposed extensions (not yet adopted)

The following sharpen the spec without changing intent. Adopt explicitly before treating as authoritative.

### §3-ext — Viewport scope (prevents "render the whole galaxy")

Add `MAX_RENDER_RADIUS` (jumps): integer, default 6–8. Only systems with `jump_distance ≤ MAX_RENDER_RADIUS` are rendered for the current view. Keeps performance stable and layout readable.

### §3-ext — Distance authority

`jump_neighbors` is **canonical topology**. `jump_distance_cache` is optional and may be missing/stale. Distances for the current center are computed via BFS each recenter (fast); optionally written to a per-center cache:

```
distanceCacheByCenter[centerId][systemId] = hops
```

### §4-ext — Deterministic layout (anti-jitter rule)

"No layout jitter" needs a mechanical rule:

- Deterministic per-center seed: `seed = hash(centerId)`.
- Same inputs + same seed → same angular ordering.
- Persist last computed angles per center; reuse as starting conditions:

```
angleMemory[centerId][systemId] = theta
```

This prevents the "everything wiggles every time" problem.

### §4-ext — Reference layout algorithm

Cheap, fast, deterministic, produces "relational topology" vibes:

1. BFS from center → hop distance for all reachable systems.
2. Place by rings: `r = hopDistance × RING_SPACING`.
3. Initial θ assignment (deterministic):
   - For each ring, sort by primary key = "shared neighbors with already-placed nodes"; tie-break by `hash(systemId)`.
4. Optional θ relaxation (10–30 iterations, radius fixed) to reduce edge crossings + collision.
5. Save θ into `angleMemory[centerId]` for next time.

### §8-ext — Node collision + label rules

- Nodes have a minimum screen-space separation (collision pass).
- Labels show on hover + selected; optional toggle to "show all labels" (off by default).

### §5-ext — Recenter transition specification

- Animation duration: **250–450 ms**, ease-in-out.
- During animation: nodes interpolate from old `(x,y)` to new `(x,y)`.
- Selection state: double-click both **recenters and selects** the new center.

### §7-ext — Fog-of-war UI specifics

Geometry never changes from fog-of-war. Node appearance is affected by:
- `intel_confidence` → opacity or outline strength.
- `cycles_since_update = currentCycle - last_updated_cycle` → badge / ring / tooltip field.

---

## Acceptance checklist (Phase 1–5 collectively)

The implementation is "done" when, opening the prototype:
- Rings + nodes render correctly.
- Hover tooltip works.
- Click selects + side panel updates.
- Double-click recenters with smooth animation.
- Pan + zoom work.
- "Terran View" and "Return to Home" snap instantly.
- Recenter to the same system twice → layout looks identical (no jitter).
- Adjacency-line toggle and hop-distance label toggle both work.
- Fog-of-war changes visuals + info only, never positions.

## Status against the live state

The live Apps Script project already implements Phase 1 (static rendering) at the most basic level — `getSystems()` returns `{id, name, x, y}` and the client plots them. This spec subsumes and extends that: **xy is not a usable data shape long-term** because the projection model needs `jump_neighbors` (topology), not just coordinates. SUCKit's Sarna-derived `(x, y)` data is still useful — see SPEC-004A — but as **projection seed / spatial bucketing** input, not as the runtime distance metric.

Phase 0 work order for the first implementation pass: see `docs/work-orders/sys-004-phase-0-starmap.md`.
