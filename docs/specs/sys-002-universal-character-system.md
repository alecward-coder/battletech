# SPEC-002 — Universal Character & Population System

**System:** SYS-002 Universal Character System
**Category:** Foundational Data & Simulation Model
**Status:** Active – Foundational
**Depends on:** SYS-001 Time & Simulation Clock
**Related:** SYS-003 ComStar, SYS-005 Order & Messaging, SYS-006 Information & Knowledge, SYS-007 Authority, SYS-008 Legitimacy, SYS-012 Character Behavior & Cognition

---

## TL;DR

Every person in the simulation — ComStar leadership, faction rulers, soldiers, mercenaries, pirates, civilians — uses **one shared schema**. Differences come from (a) which attributes are populated, (b) which are assessed, (c) how much simulation attention they receive.

Most of the population is **latent** (statistical aggregates). Individuals are **instantiated on demand** when relevance crosses a threshold. Truth and observer-belief are stored separately so two factions can hold contradictory views of the same person.

Death has two pipelines (event-driven and natural-mortality batch) but a single resolution path.

> *"History is not made by abstractions. It is made by people whose capabilities are only partially known, whose authority decays with distance, and whose removal reshapes the universe even when no one is watching."*

---

## 1. Purpose

Defines a unified data model for all characters that exist within the simulation. Characters are persistent simulation actors who:

- exist in time
- may change roles
- may rise or fall in authority
- may be assessed, promoted, injured, reassigned, or killed
- may influence the simulation directly or indirectly

This system treats people as simulation entities, not narrative tokens.

## 2. Core principle

**All characters share the same schema.** Differences are expressed through which attributes are populated, which are assessed, and how much simulation attention they receive. No role uses a custom data model.

## 3. Latent population model

Most of the population exists in a latent state. Latent members are not instantiated as individual records — they are represented statistically, do not consume simulation resources, and may become instantiated when relevance thresholds are crossed.

Supports civilian masses, unremarkable soldiers, background administrators, demographic churn.

## 4. Character instantiation

Triggers may include: creation of a unit, assignment to a command role, promotion or vacancy, combat participation, political relevance, direct player interaction, assessment or investigation.

When instantiated:
- a persistent character record is created
- initial attributes are sampled from contextual distributions
- many attributes may remain null or unknown

**Instantiation does not imply full knowledge** — truth traits get sampled values, but `known_mask` starts mostly false. Observer beliefs live separately.

## 5. Character entity (core record)

### Identity
- `character_id` (unique, persistent)
- `name`
- `origin` (planet / system)
- `faction_affiliation` (nullable)
- `current_location` (system / unit / assignment)

### Status
- `life_state` — active | incapacitated | deceased
- `role_state` — civilian | military | political | mercenary | pirate | comstar | other
- `rank_title` (nullable)
- `assignment_id` (nullable)

### Temporal
- `birth_time` (SIM_TIME)
- `death_time` (nullable)
- `last_updated_time`

## 6. Attribute model

All attributes exist as shared columns across all characters. Attributes may be null. Null indicates *not assessed*, *not applicable*, or *not yet observed* — these are not equivalent and should be distinguishable in metadata when it matters.

Representative attributes: `leadership`, `tactical_skill`, `strategic_thinking`, `political_acumen`, `technical_aptitude`, `piloting_skill`, `physical_health`, `mental_resilience`, `loyalty`, `ambition`, `risk_tolerance`.

**Storage recommendation:** floats in `[0,1]` with population distributions per context. Convert to "0–100" only at the UI.

Attributes are populated gradually through assessment, experience, or inference.

## 7. Knowledge vs truth

**Character records represent objective truth.** Each observing actor (player, faction, ComStar) may possess a partial or distorted view of a character's attributes.

The boundary between truth and belief is owned by SYS-006 Information & Knowledge. Observer belief records reference the same `character_id` and carry their own:

- `belief_traits` (subset of trait keys this observer has assessed)
- `belief_confidence` per trait `[0,1]`
- `belief_bias` (systematic offsets, e.g. faction stereotyping)
- `visibility_state` — unknown | rumored | identified | profiled | fully_known

**Assessment** is an explicit operation that consumes capacity in other systems (ComStar ops, faction governance). It reveals some traits, reduces noise, and may introduce bias depending on observer capability + deception + ComStar interference.

## 8. Experience & progression

Characters change over time through experience accumulation, promotion/demotion, reassignment, ideological drift, injury or recovery, reputation shifts. Progression is **neither guaranteed nor linear**.

Recommended approach: store `experience_streams` (`combat_xp`, `command_xp`, `political_xp`, `technical_xp`, `trauma`) and let periodic updates influence traits. Avoids linear RPG feel while still allowing growth.

Examples:
- `leadership` rises faster with `command_xp`
- `tactical_skill` improves with `combat_xp` but caps without training
- `mental_resilience` can go up *or down* with `trauma` depending on personality + support

## 9. Lifecycle & aging

All characters age as SIM_TIME advances. Age is **derived dynamically** from `(SIM_TIME - birth_time)`. Age is not stored explicitly.

## 10. Death modes

### 10.1 Event-driven death
Triggered by explicit events: combat, assassination, accidents, disasters, execution, catastrophic failure. Resolves immediately at event resolution.

### 10.2 Natural mortality
Probabilistic, periodic, primarily age-driven, usually invisible unless affecting relevant characters.

## 11. Natural mortality checks

Performed at coarse strategic intervals (e.g. monthly). Apply only to **instantiated characters with `life_state = active`**. Latent population members are handled statistically and do not receive individual checks.

## 12. Mortality probability model

**Primary factor:** age bracket (dominant).

**Secondary modifiers (multiplicative, clamped):**
- `physical_health` — `health_mod = lerp(1.5, 0.7, physical_health)`
- accumulated injuries — `injury_mod = 1 + k * injury_score`
- chronic stress — `stress_mod = 1 + s * chronic_stress`
- role risk profile — `role_mod = 1 + r * role_risk_profile`

Final: `p = clamp(base_hazard(age) * health_mod * injury_mod * stress_mod * role_mod, 0, p_max)`.

Illustrative `base_hazard(age)` lookup (monthly hazard):

| Age band | Hazard |
|---|---|
| 0–9 | 0.00001 |
| 10–19 | 0.00001 |
| 20–29 | 0.00002 |
| 30–39 | 0.00005 |
| 40–49 | 0.0002 |
| 50–59 | 0.0008 |
| 60–69 | 0.003 |
| 70–79 | 0.01 |
| 80–89 | 0.03 |
| 90+ | 0.08 |

Young characters have near-zero probability. Probability increases monotonically with age.

## 13. Death resolution

When death occurs:
- `life_state → deceased`
- `death_time → SIM_TIME`
- character record persists permanently

Triggers downstream: vacancy creation, succession or reassignment, morale/legitimacy/stability effects.

**Both natural and event-driven deaths share the same resolution pipeline.** Both emit `CHARACTER_DIED` with a `cause` payload.

## 14. Scale & performance

Hard constraints:
- Truth records: thousands to tens of thousands.
- Knowledge records: potentially `O(truth × observers)` — **must be sparse**. Only create observer knowledge when there is contact or interest.
- Monthly mortality batch: iterate only `active_instantiated_ids`.
- Latent churn: update cells statistically (births, deaths, migration). No individuals.

The system supports millions of latent population members, thousands of instantiated characters, with minimal computational overhead.

## 15. Relationships to units & factions

Characters may belong to units, command units, advise organizations, defect between factions, operate independently.

**Units reference characters. Characters are never embedded inside unit data.**

Assignments are separate records (so "where they are" is independent of "what they are"):

```
{
  "assignment_id": "UUID",
  "kind": "unit_command|unit_staff|office|ship|facility|none",
  "ref_id": "string|null",
  "start_time": "SIM_TIME",
  "end_time": "SIM_TIME|null"
}
```

## 16. Relevance / attention score

Every potential instantiation gets a Relevance Score so the sim doesn't explode with "interesting" people. Inputs: role importance, proximity to player actions, proximity to power centers, involvement in high-impact events, investigation/assessment attention. Only instantiate if score ≥ threshold OR if forced by hard triggers (vacancy in key role).

## 17. Deception & counter-intelligence

Characters can have a **presentation layer** that observers see. This lets ComStar / factions run misdirection without rewriting truth. Presentation is just a knowledge-record-like overlay on top of truth, owned by the source character (or their handler).

## 18. Canonical events

The system emits and consumes a small set of typed events:

- `CHARACTER_INSTANTIATED`
- `CHARACTER_ASSIGNED`
- `CHARACTER_PROMOTED`
- `CHARACTER_INJURED`
- `CHARACTER_RECOVERED`
- `CHARACTER_DIED`
- `CHARACTER_DEFECTED`
- `CHARACTER_ASSESSED` (observer-specific)

Each event: `{ event_id, time, type, payload }`. Other parcels depend on these without tight coupling.

## 19. Minimal API surface

What other systems call:

- `instantiate_character(trigger_context) -> character_id`
- `assign_character(character_id, assignment_id)`
- `record_event_driven_death(character_id, cause_payload)`
- `batch_natural_mortality_check(sim_time) -> [death_events]`
- `assess_character(observer_id, character_id, method) -> knowledge_update`
- `get_truth(character_id)` — server-only
- `get_belief(observer_id, character_id)` — UI / gameplay-facing

## 20. Non-goals

This spec does NOT define UI presentation, dialogue systems, RPG skill trees, morality meters, balance tuning, or narrative scripting.

---

## Implementation notes

### Data shape — Character (truth)

```
{
  "character_id": "UUID",
  "name": "string|null",
  "sex": "M|F|X|null",
  "origin_system_id": "SystemID|null",
  "origin_planet_id": "PlanetID|null",
  "faction_id": "FactionID|null",
  "role_state": "civilian|military|political|mercenary|pirate|comstar|other",
  "rank_title": "string|null",
  "assignment_id": "AssignmentID|null",
  "current_location": { "kind": "system|planet|unit|facility|unknown", "ref_id": "string|null" },
  "life_state": "active|incapacitated|deceased",
  "birth_time": "SIM_TIME",
  "death_time": "SIM_TIME|null",
  "last_updated_time": "SIM_TIME",
  "traits": { "leadership": "float|null", "tactical_skill": "float|null", "...": "..." },
  "trait_meta": { "known_mask": "bitset", "confidence": "float[0..1]" },
  "injury_state": { "injury_score": "float>=0", "chronic_conditions": "int>=0" },
  "history_refs": { "event_ids": ["EventID", "..."] }
}
```

### Data shape — Latent population cell

```
{
  "cell_id": "UUID",
  "scope": { "system_id": "SystemID", "planet_id": "PlanetID|null" },
  "faction_id": "FactionID|null",
  "role_state": "civilian|military|admin|other",
  "age_band": "0-9|10-19|...|80+",
  "count": "int",
  "trait_distributions": {
    "leadership": { "dist": "beta", "a": 2.0, "b": 8.0 },
    "tactical_skill": { "dist": "beta", "a": 3.0, "b": 7.0 }
  },
  "churn": {
    "monthly_birth_rate": "float",
    "monthly_death_rate": "float",
    "migration_out_rate": "float",
    "migration_in_rate": "float"
  }
}
```

### Sampling rule (two-stage)

1. Pick a latent cell (weighted by relevance).
2. Sample individual traits from that cell's distributions, with role/faction modifiers and an optional "notable tail" chance for rare outliers.

### Schema in this repo

`schema/tables.sql` reflects this spec at the column level for the `characters` table. The behavioral extensions (personality, relationship edges, goals, memory) live under SPEC-005 (SYS-012) — see [`sys-012-character-behavior-cognition.md`](sys-012-character-behavior-cognition.md).
