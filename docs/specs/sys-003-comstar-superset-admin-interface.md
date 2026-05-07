# SPEC-003 — ComStar Superset Admin Interface

**System:** SYS-003 ComStar Meta-Faction
**Category:** Foundational
**Status:** Active
**Document version:** v1.0 (Superset Definition) — supersedes v0.5 placeholder
**Depends on:** SYS-001 Time, SYS-002 Universal Character System
**Consumes:** SYS-004 Map & Navigation, SYS-005 Order & Messaging, SYS-006 Information & Knowledge, SYS-007 Authority & Governance
**Derived by:** every other playable faction UI (by subtraction)

---

## TL;DR

ComStar's UI is the **superset** of all faction control surfaces. Every other playable actor's UI is built from this one **by restriction** (subtraction), never by addition. No faction may have a control type that isn't already present here.

ComStar is the maximal actor — it touches information, timing, legitimacy, and infrastructure layers, primarily through **indirect influence**, not direct force. It sees patterns and aggregates, never guaranteed outcomes. Power is constrained by attention capacity, latency, exposure/attribution risk, and the regeneration/decay of unique resources (HPG Monopoly Integrity, Neutrality Credibility, Secrecy/Opacity, System Attention Capacity).

ComStar doesn't lose by conquest — it loses by systemic collapse: monopoly broken, neutrality disbelieved, infrastructure unsustainable, cohesion fractured, exposure cascade.

> *"ComStar does not rule the galaxy. It manages the conditions under which the galaxy fails to rule itself."*

---

## 1. System purpose

The ComStar Operations & Admin Interface defines the complete set of player-facing controls, resources, and feedback mechanisms available to any actor in the simulation, **using ComStar as the maximal reference implementation**.

This interface answers: *"What can be touched, measured, adjusted, spent, delayed, risked, or sacrificed in this universe?"*

All other faction interfaces are derived by restricting permissions, visibility, scope, and cost curves from this superset. **No new control types are introduced for lesser factions.**

## 2. Core design principles

### 2.1 Superset-first architecture
- Implement this control surface first.
- Derive every other actor UI by **subtraction (feature gates)**, not by adding bespoke controls.

### 2.2 ComStar as maximal actor
ComStar interacts with every systemic layer (information, timing, legitimacy, infrastructure, attention), primarily via **indirect influence** rather than direct force.

### 2.3 Patterns, not certainties
ComStar receives privileged indicators and aggregates, but never perfect outcomes or guaranteed future decisions.

### 2.4 Action costs are the game
Power is constrained by:
- Attention capacity (what can be acted on this tick/turn).
- Latency and transmission constraints.
- Exposure / attribution / legitimacy risk.
- Regeneration / decay of unique resources.

## 3. User-experience outcome

The interface must allow a player (or AI controller) to:

- Observe system-wide state through indicators and alerts.
- Allocate limited governance attention.
- Adjust message routing and confirmation rules.
- Spend / restore secrecy and credibility through tradeoffs.
- Manage infrastructure readiness and redundancy.
- Take indirect actions that shape other actors without "hard override."
- See consequences as measurable deltas in stability, latency, risk, and faction trajectories.

## 4. Control domains (modules)

Each domain is a distinct UI module + data feed + action set.

### 4.1 Information & Messaging Oversight
**Observables:** HPG network load (global + per-route); message priority distribution; confirmation latency (avg, variance, tail); routing redundancy / SPOFs; network health (uptime, degradation, sabotage likelihood).
**Actions:** Modify priority bands and quotas; introduce/reduce latency variance; reroute or add redundancy; deprioritize / throttle categories; trigger audits / integrity sweeps (costs attention + risk).

### 4.2 System Stability & Balance Monitoring
**Observables:** Faction power deltas (trend + acceleration); conflict intensity (per region + global); collapse risk indicators; overconsolidation warnings; instability band visualization.
**Actions:** Permit escalation or dampen it (friction control); selectively stabilize chokepoints (logistics / info); "pressure release" interventions (limited, plausibly deniable); abstention as explicit stance.

### 4.3 Resource Management
**Observables:** Credits; industrial throughput (available vs committed); energy / fuel; personnel capacity; military readiness pools; secrecy / opacity reserves.
**Actions:** Rebudget allocations; shift readiness posture; convert resources (with efficiency loss); lock / hold reserves for contingency.

### 4.4 Personnel & Institutional Management
**Observables:** Adept / specialist allocation by function; training pipeline capacity + bottlenecks; internal cohesion metrics; doctrine integrity; compartmentalization effectiveness.
**Actions:** Reassign staff between domains; expand / contract training throughput (long-latency); tighten compartments (less leak risk, more inefficiency); conduct internal containment.

### 4.5 Infrastructure & Asset Control
**Observables:** HPG station status (health, security, throughput); secure-world status; depot / stockpile status; fleet storage + readiness + detectability; redundancy / hardening levels.
**Actions:** Harden assets; deprioritize / sacrifice lower-value nodes; reconfigure depot / fleet readiness; deploy maintenance surges (improves health, raises exposure footprint).

### 4.6 Risk & Exposure Management
**Observables:** Visibility risk; attribution risk; salvage exposure (material evidence leakage); narrative plausibility; retaliation likelihood (per faction, per region).
**Actions:** Spend secrecy reserves (masking / misdirection / compartments); reduce operation tempo to recover plausibility; "let losses happen" to avoid patterns; initiate damage control / narrative resets.

## 5. Action model (unified)

### 5.1 Categories
- **A. Allocation** — reassign personnel / attention; shift monitoring focus; redistribute resources; harden or deprioritize assets.
- **B. Influence** — adjust message priority bands; introduce / normalize latency variance; allow / dampen escalation; withhold / delay confirmations (policy-driven, not absolute).
- **C. Preservation** — spend secrecy reserves; sacrifice lower-level assets; initiate internal containment; reduce system load to recover stability.
- **D. Abstention** — explicit non-intervention stance; allow limited losses by design; choose not to correct imbalance.

### 5.2 Action costs (must be explicit)
Every action must declare:
- **Governance Attention** cost (immediate capacity).
- **Resource** cost (credits / throughput / fuel / personnel readiness).
- **Time-to-effect** (latency).
- **Risk delta** (visibility / attribution / retaliation).
- **Side effects** (stability drift, network load changes, doctrine strain).

### 5.3 Resolution
- Actions never "flip states instantly" unless the target system already supports instant changes.
- Most actions apply as **modifiers** to underlying simulation systems (messaging, stability, infrastructure, faction behavior).

## 6. ComStar resource model

### 6.1 Shared (with factions)
Credits • Industrial throughput • Energy / fuel • Personnel capacity • Military readiness.

### 6.2 Unique (ComStar-specific)
- **HPG Monopoly Integrity**
- **Neutrality Credibility**
- **Secrecy / Opacity**
- **System Attention Capacity**

### 6.3 Regeneration & decay
Each unique resource must define:
- Regeneration conditions (what restores it).
- Decay triggers (what erodes it).
- Shock events (step drops).
- Threshold effects (phase transitions, capability loss).

## 7. Visibility & information privilege

### 7.1 Visibility types
- **Direct telemetry** (HPG health, internal staffing, asset readiness).
- **Aggregates and trends** (power deltas, conflict intensity, collapse risk).
- **Inference indicators** (latent instability, intent patterns).

### 7.2 Explicit limits
ComStar **cannot see**:
- Guaranteed outcomes.
- Exact future choices of other players.
- Perfect intelligence on hidden assets.
- "Hard truth" about fog-of-war elements.

### 7.3 Information freshness
All telemetry must declare update cadence, transmission delay, confidence rating, and degradation under sabotage / overload — consistent with SPEC-006 §15-ext (qualitative tags only, never numeric trust).

## 8. Failure states & pressure (non-conquest loss)

ComStar failure is **systemic, not territorial**.

### 8.1 Failure conditions
- Loss of HPG monopoly integrity (functional monopoly broken).
- Collapse of neutrality credibility (widespread disbelief).
- Infrastructure unsustainability (cannot maintain network / assets).
- Internal cohesion failure (factional fracture).
- Exposure cascade (pattern revealed; attribution spikes).

### 8.2 Consequences
- Phase transitions (capability unlocks / locks shift).
- Fragmentation of control domains.
- Loss of meta-faction status (becomes "normal actor" or splinters).

## 9. Derived faction interfaces (subtraction system)

### 9.1 Derivation rule
To create any non-ComStar playable actor UI:
- Remove control domains entirely OR restrict to subset panels.
- Restrict visibility (telemetry types, freshness, confidence).
- Limit action categories (e.g., no messaging influence).
- Alter cost curves (more expensive, slower, riskier).
- Lock unique resources (not present, or renamed equivalents).

### 9.2 Non-introduction constraint
No faction may have a control type not present in the ComStar superset. They may have unique flavor implementations, but the **control primitives must match**.

### 9.3 Permission flags (required)
Every panel and action must be gateable by:
- `DomainAccess` — which modules exist.
- `TelemetryAccess` — which observables appear.
- `ActionAccess` — which action schemas are permitted.
- `ScopeAccess` — which regions / assets can be targeted.
- `CostProfile` — curves and caps.

## 10. System interfaces (integration contracts)

**Consumes outputs from:**
- ComStar System Layer (balance / stability engine outputs).
- SYS-005 Order Transmission & Messaging (latency / receipt / interpretation lifecycle).
- SYS-004 Egocentric Relational Starmap (system graph + distances + relational projection).
- SYS-007 Faction Behavior & Governance (intent formation + attention constraints).
- SYS-006 Information & Knowledge (privileged-but-not-omniscient access per SPEC-006 §10).

**Does NOT:**
- Replace simulation logic.
- Override player agency directly.
- Execute tactical combat resolution.

Instead, it applies **modifiers and constraints** that the simulation resolves.

## 11. UI requirements (functional, not visual)

### 11.1 Global views
- **Dashboard** — high-level indicators + alerts + trending deltas.
- **Map View** — egocentric relational starmap overlay with selectable targets.
- **Network View** — HPG throughput / latency / redundancy visualization.
- **Risk View** — visibility / attribution / plausibility meters + thresholds.
- **Operations Queue** — pending actions, time-to-effect, cancellation rules (if allowed).

### 11.2 Targeting requirements
Every action must support:
- Target scope selection (system / region / route / asset / faction aggregate).
- Display of expected cost + risk delta **before commit**.
- Display of uncertainty (confidence bands) where applicable.

### 11.3 Feedback requirements
After resolution, the UI must show:
- What changed (deltas).
- When it took effect (timeline).
- What it cost (resources / attention).
- What risks increased / decreased.
- What new alerts were triggered.

## 12. Data & telemetry contract (minimum)

For each domain module, define:
- Observable list (name, units, update cadence, confidence).
- Alert triggers (thresholds, trend alerts, anomaly alerts).
- Action hooks (what system receives the modifier).
- Logging requirements (for replay / debug).

## 13. Acceptance criteria (MVP)

The ComStar Superset Interface is "implemented" when:

**A. A player can open the ComStar UI and view:**
- Messaging health + latency.
- Global stability metrics + overconsolidation alerts.
- Resources (shared + unique) with regen / decay indicators.
- Infrastructure and readiness states.
- Risk meters (visibility / attribution / plausibility).

**B. A player can execute at least one action from each category** (Allocation, Influence, Preservation, Abstention).

**C. Actions incur:**
- Attention cost.
- Resource cost.
- Time-to-effect.
- Measurable downstream deltas in at least one integrated system.

**D. A "Derived Faction" can be created solely by restriction flags**, with modules removed / restricted, visibility reduced, costs increased / shifted, and **no new controls added**.

## 14. Explicit non-goals

- Visual style, layout, or art direction.
- AI automation logic for ComStar decision-making.
- Balance tuning values or thresholds (only their existence).
- Victory conditions.
- Era-specific rulesets or historical event scripts.

## 15. Design statement

> *"ComStar does not rule the galaxy.*
> *It manages the conditions under which the galaxy fails to rule itself."*

---

## How this couples in (cross-system notes)

| Connection | Notes |
|---|---|
| **SPEC-006 §10** — "ComStar is asymmetrically informed, not omniscient" | This spec's §7.2 enforces that constraint at the UI layer. ComStar telemetry is privileged but always degrades under sabotage / overload, surfaces qualitative confidence (per §15-ext), and never reveals guaranteed outcomes. |
| **SPEC-007 §3** — "Authority capacity is a single scalar that emerges from characters" | ComStar's *System Attention Capacity* is the same idea applied to ComStar specifically. Implementation should derive it from staffed roles (SYS-002 characters), not store it on a faction record. |
| **SPEC-005 §10** — Engine vs data layer separation | Same hard separation applies here: action schemas, cost calculations, and modifier resolution are engine code; the data layer is which controls are unlocked, what observables exist, and what their current values are. |
| **SPEC-001 §7** — Action time-cost declaration | Every ComStar action must declare time-to-effect per §5.2 — directly inheriting the time-kernel discipline. |
| **Subtraction-based faction UIs** | `DomainAccess`, `TelemetryAccess`, `ActionAccess`, `ScopeAccess`, `CostProfile` are the five gates. A new faction is just a filled-in permission profile, not a new code path. |

## Status against the live state

- **No UI exists yet** beyond the Phase-0 starmap. This spec is design-complete, implementation-pending.
- **Halden's character record** (`char_001` ComStar Liaison) is already seeded — useful as the in-fiction "voice" of the player's interface to ComStar (or, if the player *is* ComStar, the staff archetype this spec's roles refer to).
- **Permission-flag scaffolding** doesn't exist yet — needs to be added as part of the first implementation pass. Suggest a `permissions/` namespace with one config file per faction profile.
- **Telemetry contract** (§12) is the natural place to start any implementation: pick one domain (4.1 Information & Messaging is the most directly tied to existing systems) and stand up its observable list + one action from each category before generalizing.
