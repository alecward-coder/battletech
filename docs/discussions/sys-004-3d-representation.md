# SYS-004 — 3D representation & Z-axis modeling

**Primary system:** SYS-004 Map & Navigation
**Status:** Exploratory — design decisions not yet locked
**Source:** ChatGPT design conversation
**Sibling:** [`sys-004-map-and-navigation.md`](sys-004-map-and-navigation.md) — broader SYS-004 discussion + reveal_year derivation

---

## TL;DR

The Sarna canon coordinates are XY only. The current map is therefore a 2D projection of an implicitly-3D system (every star has `z = 0`). With only XY, **infinite valid 3D configurations** project to the same 2D picture — there is no way to recover canon Z because canon never defined it.

That doesn't block us. We just need to be honest about what's canonical vs synthetic:

- **Navigation = XY** (canonical, like a Mercator chart for sailors).
- **Visualization = XY + synthetic Z** (aesthetic, like a globe — different tool for a different job).

Recommended approach for the volumetric layer: a **puffed-disk** with thickness budget ±50–100 LY, where Z grows with distance from Sol (Earth/Terra at center) and can optionally be biased by faction sector ("orange wedges") and founding date (older worlds flatter, frontier worlds puffier). Render in 2D with depth encoded as color + opacity + tooltip — no actual 3D scene needed.

The Inner Sphere is ~500 LY radius — a tiny neighborhood inside a Milky Way ~100,000 LY across and ~1,000–2,000 LY thick. There's plenty of room for visible thickness without contradicting "the galaxy is a disk."

---

## Key insights

### 1. Current map is `z = 0` for everything

The existing plot — XY only — is mathematically equivalent to a 3D dataset where every system has `z = 0`. A flat disk with zero thickness. Not "wrong"; just an implicit modeling choice baked into decades of canon for usability reasons.

### 2. XY alone cannot uniquely determine Z

Infinite Z assignments project to the same XY map. So:
- Cannot recover "true" Z from the data we have.
- Can invent a consistent Z that doesn't break anything visual.
- Whether it breaks anything *mechanical* depends on whether Z affects 3D distances used in gameplay (jump range, travel time).

### 3. Two-layer model: navigation vs visualization

| Layer | Coordinates | Used for | Authoritative? |
|---|---|---|---|
| Navigation | XY only (canon Sarna) | Borders, jump-range checks, route logic, Inner Sphere shape | Yes — this is the "chart" |
| Visualization | XY + synthetic Z | Egocentric view, depth feel, "looks like real space" | No — it's the "globe" |

This is exactly the Mercator-vs-globe split. Mercator is great for navigation, terrible for shape; globe is the opposite. We use both, for different purposes.

### 4. Galaxy-scale sanity check

- Milky Way: ~100,000 LY across, ~1,000–2,000 LY thick (disk).
- Inner Sphere explored region: ~500 LY radius from Terra.

So even a generous ±100 LY thickness on the explored bubble is well within the galaxy's natural disk thickness. "Galaxy is flat" doesn't constrain the local volume meaningfully.

### 5. The "orange wedges" intuition is correct

Current 2D faction borders look like ugly pie slices (sectors centered on Terra). The 3D version is naturally **wedges of an orange** — pie slices with thickness. The trick is to do it without forcing a globe model that creates an artificial "north pole" of the Inner Sphere.

Solution: use a **local coordinate frame** where the canonical plane is the equator and Z is just thickness around it. Territories become wedge **volumes** around the plane, not spherical caps. No poles.

---

## Recommended Z-assignment formula (the "puffed disk")

### Inputs (already available)
- `(x_i, y_i)` per system from canon.
- `R_IS` = max radius of any system in the dataset (i.e. the canonical "edge" of the Inner Sphere).
- Optional: faction ownership at the relevant year (already in SUCKit data).
- Optional: founding/colonization date (`reveal_year` is a usable proxy).

### Tunable parameters

| Parameter | Suggested range | Effect |
|---|---|---|
| `Z_max` | 50 LY (subtle) – 100 LY (noticeable) | Total thickness budget |
| `p` | 1.0 – 2.0 | Higher = flatter core, puffier periphery |
| `noise_kind` | smoothed | Coherent regions vs static |
| `house_tilt_amplitude` | 0 – 0.3 × Z_max | Strength of "orange wedge" effect |

### Formula

For each system at canonical `(x_i, y_i)`:

```
r_i        = sqrt(x_i^2 + y_i^2)              // distance from Sol
theta_i    = atan2(y_i, x_i)                  // bearing from Sol
z_max_i    = Z_max * (r_i / R_IS)^p           // thickness budget at this radius

// Base puff (random per-system noise in [-1, +1], smoothed across neighbors)
z_i        = z_max_i * smoothed_noise(i)

// Optional house wedge bias (theta_house = sector center for the owning faction)
z_i       += house_tilt_amplitude * z_max_i * cos(theta_i - theta_house(i))

// Optional age refinement (older worlds flatter, frontier worlds puffier)
F_i        = frontier_ness(reveal_year_i)     // 0..1
z_i       *= 0.3 + 0.7 * F_i                  // core stays flat, frontier puffs
```

**Result:** a coherent volumetric structure that respects the canonical 2D layout, gives factions believable 3D wedges, and reflects historical expansion.

### Why this works
- `(x_i, y_i)` never change → 2D map is byte-identical to today.
- Z grows with distance from Sol → matches the user's "funnel" intuition (core dense, frontier puffier).
- `smoothed_noise` ensures neighboring systems have similar Z → no static, you get coherent regions and corridors.
- House tilt creates "orange wedge" volumes without forcing a globe.
- Age weighting makes the inner Hegemony feel old and flat, the rim feel new and puffed.

---

## Visualization options (rendered in 2D, no 3D scene required)

### Option A — Encode depth on the existing XY plot (recommended starting point)

- Plot at canonical `(x, y)`.
- Color hue → sign of `z` (above plane vs below).
- Opacity or marker size → `|z|`.
- Tooltip → exact `z` and "true 3D distance from selected system."
- 2D map is visually unchanged; depth is undeniably present.

Zero gameplay impact. Pure metadata layer.

### Option B — "One-jump bubble" using true 3D distance

When the player picks a system and asks "what can I jump to from here?":

- Compute `d_3D` for every other system using synthetic Z.
- Highlight all systems with `d_3D ≤ jump_range`.

The highlighted set, drawn on the 2D map, will be an **irregular blob** — not a clean circle. Some near-XY systems drop out (their `dz` was big). Some farther-XY systems stay in (their `dz` happened to be small). Looks like a 3D sphere projected onto a plane, which is exactly the "Mercator distortion" feel the user wanted.

### Option C — Egocentric "HUD sphere"

Draw a circle around the selected system as a "range dome". For each neighbor:

- Radius from center = true `d_3D`.
- Angle = XY bearing.
- Color/opacity = `dz` (above/below plane).

Reads like looking at a sphere from the bridge, but it's still a 2D overlay that recomputes on every selection. Pairs naturally with the egocentric Phase 0 lens already in the architecture (SYS-004, "Egocentric 2D").

---

## Versioned rollout (matches the user's "shape it slowly" plan)

| Version | Adds | Effect |
|---|---|---|
| v1 | Puff by radius only (formula minus house + age terms) | Quick, "looks good" baseline |
| v2 | + founding-date weighting via `reveal_year` | Inner Sphere feels old/flat, frontier feels new/puffed |
| v3 | + House sector bias | "Orange wedge" political volumes |
| v4 | + jump-corridor preservation constraint | Each system's k-nearest XY neighbors stay reachable in 3D — keeps gameplay sane |

Start with v1; layer in v2/v3/v4 as desired. Each version is a one-pass recomputation of `z_i`; the underlying XY data never changes.

---

## What NOT to do

- **Don't redefine the canonical XY** to inject Z. The 2D map is the navigational ground truth; we're augmenting it, not replacing it.
- **Don't use synthetic Z for jump-range checks** until we explicitly decide to. Until then, jump range stays a 2D check (Option A is safe; Option B requires a deliberate "we're using 3D for gameplay" decision).
- **Don't force a globe model** with poles. Use a local coordinate frame around the canonical plane (the disk is the equator; Z is thickness, not latitude).
- **Don't claim canon-accuracy.** Be explicit in any UI/copy: "Vertical dispersion is a synthetic visualization layer; canonical positions are 2D."

---

## Open decisions (need user input)

1. **Thickness budget** — `Z_max = 50 LY` (subtle) or `100 LY` (very noticeable)?
2. **Z affects gameplay?** Cosmetic-only (Option A), or does jump range use 3D distance (Option B/C)?
3. **Faction wedges (v3)** — yes / no / later?
4. **Founding-date weighting (v2)** — use `reveal_year` directly as a proxy for "frontier-ness", or wait for proper `known_from_year` data?
5. **Visualization mode** — start with Option A and stay there, or build A and C side-by-side?

---

## Cross-references

- [`sys-004-map-and-navigation.md`](sys-004-map-and-navigation.md) — the broader SYS-004 discussion (subsystem decomposition, code labels, reveal_year derivation).
- `schema/tables.sql` — the `systems` table currently has `system_x`, `system_y` only. Adding synthetic `system_z` would be a single nullable column.
- `docs/conventions.md` — `[SYS-004]` code-tag convention applies to anything implementing this.
