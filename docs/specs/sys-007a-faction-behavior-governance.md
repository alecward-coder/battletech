# SPEC-007A — Faction Behavior & Governance System

**System:** SYS-007 Authority & Governance — **companion** to SPEC-007 (Authority, Autonomy & Governance Framework)
**Document type:** System Placeholder Spec
**Document version:** v0.5 (Identified / Incomplete by Design)
**Status:** Scaffolded — to be expanded
**Depends on:** SYS-001 Time, SYS-002 Universal Character System, SYS-006 Information & Knowledge
**Related:** SPEC-007 (Authority capacity, decay, partial compliance), SPEC-005 Order Transmission, SPEC-003 / SPEC-003B ComStar

---

## TL;DR

Where SPEC-007 covers **how authority is exercised** (capacity, decay-with-distance, partial compliance), this companion spec covers **how factions form intent in the first place**: the motivation axes that bias behavior, the finite per-turn Governance Capacity that limits action volume, and the administrative-region / autonomy mechanics that let factions scale beyond their direct attention.

Seven persistent motivation axes per faction (PDD, TSP, CVI, EED, ACD, TRT, IR) — semi-stable, drift slowly. Governance Capacity = executive attention + bureaucratic throughput + planning bandwidth, spent on issuing orders, modifying regions, intervening, responding to crises. Administrative regions trade direct control for sustainability: they reduce per-turn governance load but increase variance.

**Autonomy Pressure** rises with jump distance from capital, time since intervention, information staleness, and cultural divergence. It cannot be eliminated — only suppressed (costs Governance Capacity) or accommodated (converts to local autonomy benefits).

> *"Factions are not omniscient rulers. They are motivated, capacity-limited actors governing through distance, time, and imperfect control."*

---

## 1. System purpose

Defines how **non-ComStar factions**:
- Form strategic intent.
- Allocate limited governance attention.
- Balance centralization versus delegation.
- Express political, economic, and military priorities.

This system establishes **behavioral structure and constraints** but does not yet define detailed AI decision logic.

## 2. Core concept

Factions are motivated but constrained actors. They do not:
- Act optimally.
- Control all territory directly.
- Respond instantly across space.

Behavior emerges from:
- Internal motivation priorities.
- Governance Capacity limits.
- Distance from centers of authority.
- Information freshness and reliability (per SPEC-006).

## 3. Motivation axes (foundational variables)

Each faction has persistent motivation values, normalized 0–100. **They bias behavior but do not prescribe exact actions.**

| Axis | Code | Meaning |
|---|---|---|
| Power Dominance Drive | **PDD** | Desire to become or remain the primary political-military power. |
| Territorial Security Preference | **TSP** | Preference for compact, defensible territory vs expansive holdings. |
| Civilizational Value Index | **CVI** | Willingness to preserve civilian life, infrastructure, long-term stability. |
| Economic Extraction Drive | **EED** | Preference for short-term resource extraction vs sustainable growth. |
| Authority Centralization Desire | **ACD** | Tolerance for delegation and autonomy vs insistence on centralized control. |
| Technological Risk Tolerance | **TRT** | Willingness to pursue experimental, destabilizing, or unproven technology. |
| Ideological Rigidity | **IR** | Flexibility vs dogmatism in diplomacy, law, and governance. |

Motivation values are **semi-stable** and may **drift slowly over time**.

## 4. Governance Capacity (GC)

Each faction has a **finite per-turn Governance Capacity**.

GC represents:
- Executive attention.
- Bureaucratic throughput.
- Planning bandwidth.

GC is spent to:
- Issue orders.
- Establish or modify administrative regions.
- Intervene in autonomous areas.
- Respond to crises.
- Coordinate large-scale actions.

**GC is independent of ComStar and transmission mechanics.** It's the upstream budget that decides what intent gets formulated; SPEC-005 then handles delivery; SPEC-007 handles execution-side decay.

## 5. Administrative structure & delegation

### 5.1 Administrative regions

Factions may group systems into administrative regions (duchies, principalities, sectors, marches).

**Creating or modifying a region:**
- Consumes Governance Capacity.
- Requires order transmission (SPEC-005 bootstrap order).
- Reduces long-term governance load.

**Regions:**
- Handle routine local governance automatically.
- Reduce per-turn intervention requirements.
- Increase local economic efficiency.
- Reduce **precision** of direct control (the tradeoff).

### 5.2 Degree of autonomy

Granted autonomy is influenced by **Authority Centralization Desire (ACD)**.

| ACD level | Mandates | Intervention frequency | Governance load | Variance |
|---|---|---|---|---|
| **High** | Narrow | Frequent | Higher | Lower |
| **Low** | Broad | Rare | Lower | Higher (greater resilience but more divergence) |

## 6. Distance & autonomy pressure

Each system generates **Autonomy Pressure** based on:
- Jump distance from faction capital (per SPEC-004 hop count).
- Time since last direct intervention.
- Information freshness (per SPEC-006).
- Cultural or political divergence.

Autonomy Pressure:
- **Cannot be eliminated.**
- Must be suppressed or accommodated.

Suppression costs Governance Capacity. **Accommodation** converts pressure into local autonomy benefits (efficiency, loyalty, stability).

## 7. System interfaces

**Interfaces with:**
- SPEC-005 Order Transmission — execution of intent (orders are GC's output).
- SPEC-003 / SPEC-003B ComStar — indirect pressure effects.
- SPEC-004 Egocentric Relational Starmap — effective distance.
- Economic and stability systems — outcomes of governance.

**Does not interface with:** tactical combat resolution; message routing or latency; ComStar decision logic.

## 8. Explicit non-goals

This specification does not yet define:
- AI decision trees.
- Tactical heuristics.
- Optimal play strategies.
- House-specific scripted behavior.

Those belong in a future Faction AI Logic Specification.

## 9. Design statement

> *"Factions are not omniscient rulers.*
> *They are motivated, capacity-limited actors governing through distance, time, and imperfect control."*

---

## Reconciliation with SPEC-007

SPEC-007 §3 says authority capacity is a single scalar that **emerges from characters** holding authority roles, **not owned by factions**.

This spec's "Governance Capacity" is the **same scalar** seen from the faction's perspective. Implementation rule:

> The faction's GC at any tick is computed as an aggregation function over its currently-instantiated authority-role characters' relevant traits (`leadership`, `discipline`, `social_warmth`, `stress` modifiers, etc. from SPEC-002), weighted by role and assignment. **GC is derived, not stored.**

When a faction "spends GC" to issue an order, the cost is debited from a per-tick budget that resets next tick. The budget itself is the aggregate authority-capacity over the relevant time window.

This keeps SPEC-007's "authority emerges from characters" rule intact while giving SPEC-007A the faction-level scalar it needs.

## Couplings

| To | What flows |
|---|---|
| **SPEC-005** | GC budget gates how many orders can be formulated this tick; order types have GC costs (bootstrap = high, doctrine = moderate, intervention = high). |
| **SPEC-006** | Information freshness feeds Autonomy Pressure (stale info → higher pressure). |
| **SPEC-007** | Authority decay rules consume the orders SPEC-007A produced. |
| **SPEC-008** | Motivation axes (especially CVI, IR) feed legitimacy/heat trades — high CVI factions accumulate legitimacy through "public good" actions; high EED factions trade legitimacy for short-term gain. |

## What a placeholder spec means

v0.5 = the structure is set, the variables are named, the interface points are stable. **Concrete formulas** (drift rates, GC computation, motivation→behavior bias functions, autonomy pressure curves) are deferred to a v1.0 expansion when implementation begins.
