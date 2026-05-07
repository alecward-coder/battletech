# SPEC-008 — Role & Legitimacy Framework (Universal Agency Model)

**System:** SYS-008 Legitimacy & Reputation (broader scope than the tracker name implies — see placement note)
**Document type:** World / Reality Spec
**Document version:** v1.0 (Foundational) — supersedes v0.5 placeholder
**Status:** Design-Complete / Tunable Parameters Pending
**Depends on:** SYS-001 Time, SYS-003 ComStar, SYS-006 Information & Knowledge
**Related:** SPEC-007 Authority & Governance, SPEC-005 Order Transmission, `play-pirate-mercenary.md`

---

## TL;DR

Anyone can attempt almost anything. The system **does not block actions** — it determines the **world response profile**: how far effects propagate, who notices, who gets blamed, how fast consequences arrive, and whether authority is acknowledged.

**Power is not binary.** Power is *acknowledged influence under conditions of resistance.*

Six universal state variables (per actor): Legitimacy, Heat, Visibility, Recognition Network, Enforcement Capacity, Governance Bandwidth. Five-tier vertical agency ladder (Tier 0 infrastructure stewards → Tier 4 individuals). Every action produces two parallel trails: a Physical Effects Trail (what happened) and an Informational Effects Trail (what others believe happened) — and the *informational trail* is what drives legitimacy/heat changes and response timing.

Roles are **states with inertia**, not classes — transitions cost legitimacy + heat trades, recognition events, and territory changes. Past states leave lasting trust + risk modifiers.

> *"Power in this universe is not defined by what you control, but by how widely your actions are acknowledged before they are resisted."*

---

## 1. System purpose

This framework defines what kinds of actors can exist, what it means for them to act, and how the world responds. It applies universally to:

- Tier 0 infrastructure stewards (e.g., ComStar-like systems).
- Sovereign factions.
- Sub-faction authorities.
- Mercenary organizations.
- Pirate bands.
- Individuals / civilians.

This is a **reality rule set**, not a gameplay loop. It is the substrate gameplay loops must respect.

## 2. Core principle

**Anyone can attempt almost anything.** The system does not block actions. It determines the **world response profile**:

- **Propagation:** how far effects spread through institutions and space.
- **Detection:** who notices, at what resolution, with what confidence.
- **Attribution:** who gets blamed/credited (or whether blame is ambiguous).
- **Response:** how quickly, how strongly, and through which channels consequences arrive.
- **Recognition:** whether authority is tolerated, contested, or rejected.

**Power = acknowledged influence under conditions of resistance.**

## 3. Universal state variables

Every actor maintains these continuous values (normalized 0–100 unless noted). Values may be **hidden, partially-known, or misestimated** by other actors (per SPEC-006 truth/belief separation).

### 3.1 Legitimacy (L)
Degree to which the actor is recognized as a valid participant in formal systems.
- Enables: stable contracts, diplomacy, governance, supply, recruitment.
- Reduces: reaction volatility from external actors.
- Improves: "benefit of the doubt" — *lowers attribution certainty against them*.

### 3.2 Heat (H)
Degree to which the actor is attracting attention as a threat / pattern.
- Increases: detection rate, scrutiny intensity.
- Increases: likelihood of coordinated suppression.
- Increases: existential risk (hard counters, assassinations, interdictions).

### 3.3 Visibility (V)
How **observable** the actor's activities are in practice (not intent).
- Driven by footprint: comms, logistics, signature, witnesses, scale.
- The bridge between *what happened* and *what others believe happened*.

### 3.4 Recognition Network (RN)
Set of entities willing to treat the actor as "real" (trade, negotiate, obey). **Implemented as a graph relationship**, not a scalar:
- RN edges have `trust` + `dependency` + `fear` components.
- Legitimacy is the **aggregate effect of RN health**, not a replacement for it.

### 3.5 Enforcement Capacity (EC)
Ability to impose consequences on others (directly or indirectly).
- Military, legal, economic, informational, infrastructural.
- Often determines whether legitimacy "sticks" or collapses under challenge.

### 3.6 Governance Bandwidth (GB)
How much attention the actor can allocate to managing complexity.
- Limits how much territory or institutional breadth the actor can sustain.
- Failure modes: overextension, incoherence, delegation drift.

## 4. Legitimacy ↔ Heat (interacting pressures)

Not opposites — **coupled pressures**:

- Legitimacy can **mask** heat (lower attribution certainty, delay response).
- Heat can **erode** legitimacy (fear, sanctions, withdrawal of recognition).

Some actions convert:
- "Public good" acts → trade heat down for legitimacy up.
- "Predation" acts → trade legitimacy down for heat up.
- "Denial & stealth" → keep heat low while legitimacy remains low.

**Important rule:** *Heat accumulates faster than legitimacy, but legitimacy decays slower than heat (unless exposed as fraud).*

## 5. Vertical agency ladder

Tiers defined by **propagation ceiling and response channels available**, not by unit count.

| Tier | Examples | Scope | Failure modes |
|---|---|---|---|
| **0 — Infrastructure Steward** | ComStar-like systems | Acts through information, timing, recognition, system access; highest propagation ceiling, lowest direct force footprint | Exposure, loss of indispensability, network-level legitimacy collapse |
| **1 — Sovereign Faction** | Great Houses, major states | Multi-system; doctrine, law, war declarations, macro logistics; high propagation, slow feedback, high inertia | Overextension, legitimacy fracture, internal governance collapse |
| **2 — Sub-Faction Authority** | Dukes, sector governors, march lords | Regional; executes/interprets doctrine locally; medium propagation, faster local feedback, high "interpretation drift" | Revolt, recall, isolation, legitimacy contestation |
| **3a — Mercenary** | Legible armed orgs | Contracts, reputation, negotiable legitimacy; propagation mediated by patrons + market access | Blacklisting, insolvency, betrayal, reputation collapse |
| **3b — Pirate** | Illegible armed bands | Predation, deniable networks, mobility, concealment; survival depends on heat management | Exposure, coordinated retaliation, internal fragmentation |
| **4 — Individuals / Civilians** | Any single person | Minimal propagation, maximal immediacy; can be **catalytic** (assassination, leak, inspiration, sabotage) | Elimination, capture, irrelevance, disbelief |

## 6. Action propagation model

Every action produces **two parallel trails**:

### 6.1 Physical Effects Trail (PET)
What actually happens in the material world: damage, movement, deaths, trade, occupation.

### 6.2 Informational Effects Trail (IET)
What others **believe** happened: reports, rumors, intercepted messages, official statements.

**The IET determines legitimacy/heat movement and response timing.** This is the SYS-006 truth-vs-belief split applied at the system level.

### Propagation depends on
- Actor Tier (T).
- Action Scale (S).
- Visibility (V).
- Transmission Quality (Q) — see SPEC-005 Order/Comms.
- Institutional Distance (ID) — bureaucratic hops.
- Physical Distance (PD) — jump distance / travel time.
- Competing Narratives / Fog (FN).

**Core rule:**
- Higher tiers: **longer propagation, slower feedback**, stronger "institutional damping."
- Lower tiers: **shorter propagation, faster feedback**, sharper volatility.

## 7. Detection, attribution, and response

### 7.1 Detection
Probability of being noticed and **logged as "a pattern,"** not just "an incident." Increases with:
- Repeated actions.
- Higher visibility.
- Predictable routes.
- Larger footprint.
- Louder comms.
- Higher existing heat.

### 7.2 Attribution
Probability the action is **pinned to a specific actor**. Decreases with:
- Deniability.
- Proxies.
- False flags.
- Disrupted comms.
- Low witness reliability.
- High legitimacy buffering (benefit of the doubt).

### 7.3 Response channels (soft → hard)

1. Narrative pressure (propaganda, discrediting, rumor).
2. Economic pressure (sanctions, blocked trade, bounty escalation).
3. Legal pressure (warrants, asset seizure, arrest authority).
4. Infrastructural pressure (comms restriction, jump access denial, inspections).
5. Covert action (assassination, sabotage, infiltration).
6. Overt force (raids, blockades, punitive expeditions, annexation).

Which channels are available depends on responder tier, their legitimacy constraints, their enforcement capacity, their current governance bandwidth, and public tolerance thresholds.

## 8. Role transitions (non-class-locked)

Actors are **states with inertia**, not fixed classes.

Pathways:
- Accumulate legitimacy (build RN, provide stability, win recognition).
- Reduce heat (go dark, relocate, proxy actions, narrative suppression).
- Acquire territory (physical control → administrative claim → recognition attempt).
- Gain formal recognition (treaties, charters, patron sponsorship).
- Convert via crisis (collapse creates openings for illegible actors to become legible).

**Lasting modifiers:**
- Past piracy creates permanent "stain risk" even after recognition.
- Past legitimacy creates residual deference even after a fall (until disproven).
- Betrayal creates long half-life distrust across RN edges.

(Detailed role-specific transitions for mercenary ↔ pirate ↔ warlord ↔ sovereign are in `play-pirate-mercenary.md` §8.)

## 9. ComStar-like relationship (structural)

A Tier 0 infrastructure steward does **not define roles**; it shapes the ecosystem of recognition by:
- Monitoring patterns (heat sensing).
- Modulating transmission (timing, fidelity, access).
- Influencing recognition events (who gets treated as legitimate, and when).
- Applying stabilizers against runaway dominance or systemic collapse.

All actors exist under its **resolution gradient**:
- High-tier actors: coarse but constant monitoring.
- Low-tier actors: intermittent but sharp attention spikes when heat rises.

## 10. Explicit non-goals

Player loops or UI, resources or economy tuning, AI decision logic, faction-specific mechanics, victory conditions. Those are derived documents that must remain **consistent with this framework**.

## 11. Design statement

> *"Power in this universe is not defined by what you control,*
> *but by how widely your actions are acknowledged before they are resisted."*

---

## Integration hooks (where this plugs in)

| System | What it provides to / consumes from SYS-008 |
|---|---|
| **SPEC-005 Order Transmission & Messaging** | Provides Q (transmission quality), latency, distortion, interception. |
| **SPEC-007 Authority & Governance** | Provides GB constraints, doctrinal biases, tolerance thresholds. SPEC-007's "authority capacity" is the same scalar as this spec's GB, viewed from the inside-the-faction perspective. |
| **SPEC-003 ComStar Superset / SPEC-003B Balance Engine** | Tier 0 modulation of recognition and communication surfaces. |
| **SYS-010 Economy / SYS-009 Logistics (future)** | Determines how legitimacy enables supply, and how sanctions/heat choke it. |
| **SPEC-004 Map / SPEC-004A Map Core** | Provides PD/ID distances and network topology that shape propagation. |
| **SPEC-006 Information & Knowledge** | The IET (Informational Effects Trail) is built directly on SPEC-006 records. Every action that produces effects emits an event into the SPEC-006 ledger; that ledger's propagation rules feed back into legitimacy/heat. |

## Placement note

The project tracker names this system **"Legitimacy & Reputation"** — that title is narrower than what this spec actually covers (universal agency model, including the ladder, propagation, response channels, and role transitions). Two reasonable resolutions:

1. **Treat the project-tracker name as a sub-aspect** — Legitimacy & Reputation is the most player-facing piece of a broader Role & Legitimacy framework. Spec keeps this scope; tracker name is a UI label.
2. **Rename the tracker entry** to "Role & Legitimacy" to match.

Recommendation: option 2 the next time the tracker is touched. No code consequences either way.

## Open follow-up

The user's ChatGPT session offered to write a dedicated **"Heat & Legitimacy Dynamics"** subsystem as the next spec — concrete decay rates, thresholds, conversion-action formulas — to make this from "philosophical" to "directly simmable." Worth doing once we want to implement.
