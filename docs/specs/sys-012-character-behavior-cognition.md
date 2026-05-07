# SPEC-005 — Character Behavior, Memory & Goals Layer

**System:** SYS-012 Character Behavior & Cognition
**Category:** Foundational
**Status:** Active
**Last updated:** 2026-03-23
**Depends on:** SYS-001 Time, SYS-002 Universal Character System, SYS-006 Information & Knowledge
**Related:** SYS-003 ComStar, SYS-005 Order & Messaging, SYS-007 Authority, SYS-008 Legitimacy

---

## TL;DR

The behavioral layer that makes characters feel real **without** turning them into scripted dialogue. Characters are stateful entities; their outward behavior emerges from personality, mood, multi-axis relationships, layered memory (short / long / working), and goals.

**The AI is not the character.** The AI is an actor that receives a structured snapshot of character state and produces output consistent with it. Engine rules (how traits influence tone, how memory selection works, how goals prioritize) are hardcoded; the character's data is the only thing that varies.

> *"You are not scripting dialogue. You are building stateful character simulation with language output."*

---

## 1. Purpose

Defines the behavioral simulation layer for SYS-002 characters. Characters' outward behavior emerges from:

- personality traits (static / semi-static)
- dynamic state (mood, stress, condition)
- multi-dimensional relationships
- memory (short-term, long-term, working memory)
- goals and motivations

## 2. Core principles

1. **Single schema compliance** — no role-specific character models. All characters share the same behavioral schema; differences are expressed through nulls, sparsity, and attention.
2. **Truth vs belief** — extends SYS-006's truth/belief split beyond skills into personality perceptions, relationship perceptions, and memory accuracy (misremembering, bias, propaganda).
3. **Stateful simulation, not dialogue trees** — text output is a reflection of state. State is primary.
4. **Scalable attention** — only instantiated characters get individualized memory/goals/relationships. Latent population stays statistical.

## 3. Scope

This spec defines:

- additional shared behavioral attributes (nullable)
- relationship entity model (multi-axis)
- goal entity model
- memory entity model + retention/decay rules
- working-memory selection algorithm
- voice profile parameters (parameters, not stored audio)
- expression-style parameters
- runtime interaction payload contract (prompt assembly inputs)

It does **not** define UI, full narrative scripting, long-form conversation persistence (beyond memory rules), balance tuning values, or audio/TTS implementation details (only required parameters).

## 4. Behavioral trait block (extends SYS-002 character schema)

Add as shared nullable columns:

- `openness`
- `aggression`
- `humor`
- `idealism`
- `trauma_level`
- `discipline`
- `social_warmth`
- `talkativeness`

These do **not** replace competence traits (leadership, tactical, etc.) — they complement them. Many characters will have these null until instantiated or assessed.

## 5. Relationship model (multi-dimensional)

Relationships are **edges**, not embedded in character records.

```
Relationship {
  relationship_id        : UUID
  source_character_id    : CharId
  target_entity_id       : CharId | PlayerId | FactionId
  target_entity_type     : 'character' | 'player' | 'faction'

  trust       : 0-100
  respect     : 0-100
  affection   : 0-100
  resentment  : 0-100
  fear        : 0-100
  loyalty     : 0-100  // relationship loyalty, not faction loyalty
  attraction  : 0-100  // optional axis
  suspicion   : 0-100

  last_change_time     : SIM_TIME
  last_change_event_id : EventId | null
}
```

Rules:
- Relationships are **directional**.
- Axes move **independently**.
- Edges may be missing (null) until relevant.

### 5.1 Update triggers
Completed/disobeyed orders (SYS-005), promotions/demotions, public praise, betrayal events, combat outcomes/survival, investigations/perceived deceit (SYS-006), resource allocations/favoritism (SYS-009/SYS-010 later).

### 5.2 Drift
At coarse intervals (monthly/quarterly):
- Resentment decays slowly unless reinforced.
- Trust decays when no contact and uncertainty rises.
- Fear decays when target loses power or distance increases.
- Loyalty drifts toward faction doctrine unless a strong personal bond exists.

Exact functions are tuning; **drift existence is required**.

## 6. Goals model

```
Goal {
  goal_id            : UUID
  character_id       : CharId
  goal_text          : string
  priority           : 0-100
  time_horizon       : 'short' | 'medium' | 'long'
  visibility         : 'secret' | 'public'
  status             : 'active' | 'completed' | 'failed'
  created_time       : SIM_TIME
  last_updated_time  : SIM_TIME
  related_entities   : ['type:id', ...]
}
```

### 6.1 Effects
Goals influence:
- which memories become salient (working memory selection)
- what information the character seeks or hides
- how the character interprets new events (bias)
- which orders they resist or comply with

### 6.2 Creation triggers
Role assignment ("secure region"), promotion incentives ("prove worth"), faction doctrine injection (SYS-007), personal relationship events ("protect X", "avenge X"), trauma events ("avoid risk", "control situation").

## 7. Memory model

```
Memory {
  memory_id           : UUID
  character_id        : CharId
  related_entity_id   : EntityId
  event_summary       : string
  emotion_tag         : enum
  importance          : 0-100
  created_time        : SIM_TIME
  last_recalled_time  : SIM_TIME | null
  long_term_flag      : bool
  decay_rate          : float [0,1]
  source_event_id     : EventId | null
}
```

### 7.1 Layers
- **Short-term** — high recency, low persistence.
- **Long-term** — major events, persistent anchors (`long_term_flag = true`).
- **Working memory** — small selected subset used per interaction only.

### 7.2 Retention rules
Importance is influenced by:
- emotional intensity
- recency
- repetition
- relevance to goals
- relationship impact

Low importance → decays. High importance → becomes long-term.

### 7.3 Decay
At strategic intervals: short-term memories decay; long-term memories decay slowly or not at all (tunable). Recalling a memory refreshes it.

### 7.4 Misremembering / distortion (SYS-006 tie-in)
Memory records are **truth for the character's internal history** but may not match objective reality. Supports propaganda, ego protection, trauma distortion, ComStar misinformation, faction stereotyping. Optional fields for later: `accuracy_confidence`, `distortion_bias`.

## 8. Voice profile (identity expression)

Voice is part of identity but separate from personality. Voice is **generated at runtime** via TTS — no audio assets are stored on the character.

Fields (all nullable):
- `voice_id` — base TTS voice reference
- `accent_style`
- `speech_rate`
- `formality`
- `warmth`
- `roughness`
- `radio_effect` — `none | comms_filter | encrypted | static_heavy`
- `cadence` — short vs long phrasing

## 9. Expression style (how they speak)

Defines the **shape** of output, not what they know.

- `preferred_sentence_length` — short | medium | long
- `emotional_openness` — closed | guarded | open
- `directness` — indirect | balanced | direct
- `confidence_style` — hesitant | neutral | assertive
- `humor_usage` — never | occasional | frequent
- `sarcasm_usage` — never | occasional | frequent

Can be derived from traits, but stored as **explicit knobs for authorial control**.

## 10. Engine layer vs data layer (hard separation)

### 10.1 Engine layer (hardcoded rules)
- How traits influence tone/behavior.
- How relationships influence tone/choices.
- Memory selection rules and decay.
- Goal prioritization.
- Mood/state transitions.
- Knowledge boundaries / secrecy enforcement.
- Role boundaries (what they're allowed to do/say).

### 10.2 Data layer (character state)
- Traits.
- Relationships.
- Memory.
- Goals.
- Voice profile.
- Expression style.

## 11. Runtime interaction payload (prompt contract)

Every interaction generates a structured payload — the **stable interface between simulation and language output**.

```
PAYLOAD {
  SYSTEM:
    - personality + expression rules
    - role_boundaries
    - knowledge_constraints

  STATE:
    - current mood / stress / condition
    - current assignment / environment context

  RELATIONSHIP:
    - relationship snapshot toward interlocutor

  MEMORY:
    - working_memories  (small subset, 3-10 entries)

  GOALS:
    - active_goals shortlist (sorted by priority + relevance)

  USER_INPUT:
    - player message / event prompt
}
```

**Working memory must be a small subset (3–10 entries), not the full memory table.**

## 12. Working memory selection (required algorithm)

Inputs: current interaction context, active goals, relationship snapshot, recent events.

Score each candidate memory by:
- recency weight
- importance weight
- emotional match weight
- goal relevance weight
- relationship relevance weight
- repetition boost (recently recalled)

Select top-N. **Diversity constraint:** avoid selecting near-duplicates unless extremely high importance.

## 13. Phase 1 implementation target (MVP)

Phase 1 goal is **not** "full system." It is: **one character feels real**.

Phase 1 requires:
- 1 instantiated character
- 1 relationship edge to player
- 5–10 memory entries
- 2–4 active goals
- basic prompt assembly using the runtime payload contract

This is the proof that state → language feels coherent.

## 14. Starter character (seed)

**Precentor Halden** — ComStar Liaison / Information Officer.

- Calm, controlled, precise.
- Slightly cryptic.
- Knows more than they reveal.
- Guides rather than directly answers.
- Maintains emotional distance.

| Field | Value |
|---|---|
| Faction | ComStar |
| Role | Liaison / Information Officer |
| Trust (toward player) | 50 |
| Respect (toward player) | 60 |
| Suspicion (toward player) | 20 |
| Voice | formal, measured, light comms filter, deliberate cadence |

Already seeded in the live sheet as `char_001`.

## 15. Non-goals

RPG leveling trees, morality meters, cinematic dialogue writing, UI presentation, balancing exact curve values (left to tuning passes).

## 16. Design statement

> *"You are not scripting dialogue. You are building stateful character simulation with language output."*

---

## How this plugs into other systems

| Hook | Effect |
|---|---|
| SYS-002 instantiation | Sample personality / voice / expression in addition to competency traits. Many fields stay null. |
| SYS-006 truth-vs-belief | Observer knowledge can apply to personality traits, relationship perceptions, and memory accuracy (misremembering events) — not only "skills." |
| SYS-002 progression | Experience updates write into goals / memory / relationships, not just stats. |
| SYS-005 messaging | Order compliance and disobedience are relationship update events. |
| SYS-001 time | All `_time` fields are `SIM_TIME` ticks; decay schedules read the clock. |

## Status against the live schema

The Characters / Relationships / Goals / Memories tables in the live sheet already implement most of this spec at the column level (verified against the data dump). Missing pieces vs this spec:

- **Engine rules** — no implementation yet of decay, drift, working-memory selection, prompt assembly.
- **Misremembering / distortion fields** on Memory (optional per §7.4) — not yet present.
- **Visibility / `last_change_event_id`** on Relationships exists but `events` table itself doesn't yet (lands with SYS-006).
