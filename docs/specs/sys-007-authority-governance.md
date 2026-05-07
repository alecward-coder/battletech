# SPEC-007 — Authority, Autonomy & Governance Framework

**System:** SYS-007 Authority & Governance
**Category:** Strategic (per project tracker) / "Foundational Strategic" per parcel header
**Status:** Active
**Depends on:** SYS-001 Time, SYS-002 Universal Character System, SYS-005 Order & Messaging, SYS-006 Information & Knowledge
**Related:** SYS-008 Legitimacy & Reputation (downstream)

---

## TL;DR

Authority is **finite, indirect, and exercised through people**. Institutions don't act — characters acting within structures do, and structures shape outcomes.

A single scalar **authority capacity** emerges from the characters holding governance roles (their count, competence, loyalty, fatigue). Capacity is not owned by factions; it's an emergent property of who's running things. Authority **decays with distance** (jump distance, comm latency, info staleness, regional instability). Fast comms reduce decay but never eliminate it.

Orders are **not outcomes** — they are interpreted locally, prioritized among competing demands, and may be partially/quietly noncomplied with (delay, soft enforcement, reinterpretation, deprioritization). Noncompliance is rarely explicit and often deniable.

Autonomy is a **structural condition**, not a failure state. Players influence it **indirectly** via policies, enforcement intensity, delegation structures, neglect/focus. High autonomy reduces central load but increases divergence risk; low autonomy raises brittleness when capacity is exceeded.

> *"Power does not flow instantly. Control weakens with distance. Orders degrade through people. Autonomy stabilizes until it diverges. Empires fail quietly before they fail loudly."*

---

## 1. Purpose

Defines how authority is exercised, weakened, delegated, and degraded across space, time, and people.

The system governs **whether orders are effectively carried out**, not whether they are issued. Power is constrained by governance capacity, distance, autonomy, and human factors.

## 2. Core principle

**Authority is finite, indirect, and exercised through people.**

- Institutions do not act.
- Characters act within structures.
- Structures shape outcomes.

## 3. Authority capacity

Authority capacity = the total complexity an actor can meaningfully govern.

### 3.1 Nature
- Single scalar.
- **Not owned directly by factions.**
- Emerges from characters holding authority roles.

### 3.2 Contributors
- Number of governing characters.
- Their competence.
- Obedience and loyalty.
- Fatigue and workload.
- Ideological alignment.
- Stability of their domain.

### 3.3 Overextension
When governance demand exceeds capacity:
- Delays increase.
- Misinterpretation rises.
- Selective compliance emerges.
- Enforcement weakens.
- Quiet decay begins.

**No explicit "overextension penalty."** The decay is emergent, not a bookkept debuff.

## 4. Distance & control decay

Authority decays with distance. Decay is influenced by:

- Jump distance.
- Communication latency.
- Information freshness.
- Local autonomy.
- Regional instability.

**Fast communication does not eliminate decay; it only reduces it.** The decay floor is human, not technological.

## 5. Autonomy

Autonomy is a **structural condition**, not a failure state.

### 5.1 Baseline
- All factions begin with culturally and historically defined autonomy levels.
- Governance structures are pre-existing at scenario start.

### 5.2 Policy influence (indirect)
Players influence autonomy via:
- Governance policies.
- Enforcement intensity.
- Delegation structures.
- Neglect or focus.

### 5.3 Tradeoffs

**Higher autonomy:**
- Reduces central authority load.
- Improves local responsiveness.
- Increases divergence risk.

**Lower autonomy:**
- Increases control burden.
- Raises brittleness.
- Amplifies failure when capacity is exceeded.

## 6. Governance structures

Factions operate through explicit governance structures:

- Centralized administration.
- Regional districts.
- Feudal delegation.
- Military governance.
- Corporate or religious oversight.

Structures define:
- Authority flow.
- Autonomy bounds.
- Failure modes.
- Response to stress.

## 7. Orders & compliance

**Orders are not outcomes.**

### 7.1 Interpretation
Orders are:
- Interpreted locally.
- Prioritized among competing demands.
- Constrained by capacity and context.

### 7.2 Partial compliance
Characters may:
- Delay execution.
- Soften enforcement.
- Reinterpret intent.
- Deprioritize without outright refusal.

**Noncompliance is rarely explicit and often deniable.** This is a feature, not a bug.

## 8. Character interaction

Authority is exercised through characters. Attributes influencing governance:

- Obedience.
- Competence.
- Ambition.
- Ideology.
- Fatigue.
- Loyalty.

Characters allocate their own action bandwidth and may diverge from superior intent without immediate detection.

## 9. Failure modes

Governance failure emerges systemically:

- Quiet corruption.
- Policy drift.
- Enforcement inconsistency.
- Regional divergence.
- Eventual rebellion.

**Failure visibility depends on information availability** (SYS-006). A central authority may not know it is failing until well after divergence has begun.

## 10. Interfaces with other systems

| System | Interaction |
|---|---|
| SYS-006 Information | Perception of control and failure — central authority sees what SYS-006 lets them see |
| SYS-002 Characters | Execution and interpretation of orders happen through individual characters |
| SYS-005 Orders | Propagation and delay of orders, including partial-compliance feedback |
| SYS-008 Legitimacy (downstream) | Erosion of legitimacy is a downstream consequence of governance failure |

**SYS-007 does NOT:**
- Resolve combat.
- Manage economy.
- Trigger rebellions directly (rebellion emerges; this system describes the conditions that lead to it).

## 11. Design statement

> *"Power does not flow instantly.*
> *Control weakens with distance.*
> *Orders degrade through people.*
> *Autonomy stabilizes until it diverges.*
> *Empires fail quietly before they fail loudly."*

---

## How this plugs in

- **Authority capacity** is computed from governing-character state (SYS-002 traits + SYS-012 fatigue/loyalty/morale modifiers). It is **not stored** directly on the faction; it is **derived**.
- **Decay-with-distance** uses SYS-001 ticks for latency and SYS-006 staleness for information freshness. The decay function reads, doesn't write, those systems.
- **Order interpretation** is the bridge to SYS-005 — an order arrives at a destination character; their decision to comply / delay / soften / reinterpret is governed here and emits events back into the SYS-005 ledger.
- **Failure modes** never fire as scripted events. They are observed by aggregating other systems' state (slow orders, divergent reports, missing compliance) and surfaced via SYS-006 to whichever observers are paying attention.

## Open question (from project tracker — Q-002, deferred)

**How much autonomy is optimal per faction type?**

This spec answers the *structural* question (autonomy is per-faction baseline + influenced indirectly) but leaves the *tuning* open. The "optimal per type" question is a tuning pass, not a design decision — defer until after the structural framework is implemented and we can observe what each level actually does.

## Status against the live schema

The live `Characters` table already carries the trait fields (`leadership`, `discipline`, `loyalty`, etc.) needed to compute authority capacity contributions. Missing pieces:

- **No `governance_structures` table** in the live sheet — needs to be added when implementing.
- **No `authority_role` flag** on characters that distinguishes "this character is a governing actor whose state contributes to capacity" from "this character is a regular person." The current `role` field can carry it but should be formalized.
- **No decay function** implementation — pure design until the SYS-006 events ledger lands (SYS-007 reads from it).
