# SPEC-001 — Time & Simulation Clock Framework

**System:** SYS-001 Time & Simulation Clock
**Category:** Foundational System Definition
**Status:** Active – Foundational
**Depends on:** —
**Related:** SYS-004 Map & Navigation, SYS-005 Order & Messaging, SYS-007 Authority & Governance, every other system

---

## TL;DR

One authoritative clock (`SIM_TIME`), monotonic, deterministic, global. **Time advances independently of player attention** — nothing pauses for menus, lens changes, or planning. Internal unit is an integer **tick** to avoid float drift; layered conversions (minutes / hours / days) keep callers ergonomic.

Time advances by **explicit steps**, not continuous polling: `step_until(t)`, `step_by(d)`, or `step(NEXT_EVENT)`. Every non-trivial action **must declare** when it begins, how long it takes, and when it resolves — actions without declared time cost are invalid.

> *"Time is the cost of intention. If an action has no time cost, it has no weight. If time is not respected, distance and authority are illusions."*

---

## 1. Purpose

Defines how time exists, advances, and is consumed within the simulation. Time is treated as a **foundational substrate**, not a gameplay mechanic. All systems — map movement, orders, logistics, combat, information flow, player embodiment — derive meaning from time.

## 2. Core principle

**Time advances independently of player attention.** The universe does not pause for menus, planning, camera perspective, or role/lens changes. Players observe and act within time; they do not control it.

## 3. Authoritative simulation clock

Exactly one authoritative clock. Properties:

- **Monotonic** — never rewinds.
- **Global** — all systems reference it.
- **Deterministic** — same inputs produce same outcomes.

Referred to as `SIM_TIME`. All events occur at a specific `SIM_TIME` value.

## 4. Layered time resolution

Different systems consume time at different granularities while referencing the same clock.

### 4.1 Tactical / operational time
Granularity: **hours** (commonly 4-hour blocks).

Used for: ship maneuvering, dropship launch prep, unit readiness, orbital ops, crew fatigue/recovery, sensor operations.

Actions are not instantaneous — they declare a time cost which may vary based on crew quality, doctrine, damage, readiness.

### 4.2 Strategic time
Granularity: **days to weeks**.

Used for: interstellar movement (jump distance), order transmission, political decisions, governance, autonomy effects, logistics flow, information staleness.

Strategic systems do not react to hour-level detail.

### 4.3 Combat resolution time
Granularity: **variable** (minutes to real-time).

Used for: tactical combat, engagement resolution, pilot-level interaction. Combat has a defined start time, duration, and resolves at a specific `SIM_TIME`. Outcomes feed back into higher layers.

## 5. Time advancement model

Time advances through **explicit simulation steps**, not continuous polling.

Examples:
- Advance until next scheduled event.
- Advance by a fixed duration.
- Advance until player interruption.
- Advance until an order arrives.

**Fast-forward and pause are presentation controls layered on top of the same clock** — they don't alter `SIM_TIME` semantics, they just change whether `step()` is being called.

## 6. Event scheduling

All time-dependent actions schedule events. Events resolve in chronological order.

```
SimEvent {
  id              : EventId
  scheduled_time  : SimTime
  type            : EventType
  source_system   : SystemId
  target          : TargetRef  // entity / system / region
  payload         : versioned struct
  priority        : int        // tie-break
  nonce           : int        // monotonic per scheduler
}
```

## 7. Action time-cost declaration

**Every non-trivial action must declare** when it begins, how much time it consumes, and when its effects resolve. Actions that do not declare time are invalid.

Examples:
- "Prepare dropship launch" → 4–12 hours.
- "Transmit order across 5 jumps" → jump-based delay.
- "Engage in combat" → variable duration.

## 8. Multi-lens compatibility

Time behaves consistently across all gameplay lenses (strategic, operational, tactical, embodied). **Changing perspective does not pause or alter `SIM_TIME`.** Lenses are view/controllers, not time authorities.

## 9. Non-goals (this parcel)

Calendar flavor (dates, eras), UI time controls, speed multipliers, balance tuning, real-time vs turn-based combat rules — all out of scope here. The clock supports them; it doesn't define them.

---

## Implementation notes

### Hard invariants (must never break)

1. Single authoritative clock — exactly one `SIM_TIME`.
2. Monotonic — `SIM_TIME` never decreases.
3. Deterministic — same initial state + same inputs → identical outcome.
4. No instantaneous non-trivial actions — actions declare start + duration + resolve time.
5. Event order is chronological; ties broken deterministically (see ordering rules).

### Time representation

Internal unit is an **integer tick** to avoid float drift:

```
SIM_TIME_TICKS : int64
```

Conversion constants:

- `TICKS_PER_MINUTE`
- `TICKS_PER_HOUR`
- `TICKS_PER_DAY`

Supports tactical minutes, operational hours, strategic days/weeks without changing the clock model.

Calendar formatting (tick → "Day X / Hour Y" or "12 February 2786 TC") is a **thin formatter on top**, not part of the clock.

### Core interfaces

```
TimeService:
  now()                           -> SimTime
  schedule(event: SimEvent)       -> EventId
  cancel(event_id: EventId)       -> bool
  step(mode: StepMode)            -> StepResult
  step_until(target: SimTime)     -> StepResult
  step_by(duration: SimDuration)  -> StepResult

SimTime     = int64 ticks
SimDuration = int64 ticks
```

Subsystems implement:

```
ISimSystem:
  on_event(event, ctx) -> void
  on_time_advanced(prev, now, ctx)  // optional; prefer event-driven
```

Systems should prefer `on_event` and avoid continuous `on_time_advanced` unless absolutely necessary.

### Step modes

- `NEXT_EVENT` — advance to next scheduled event time, resolve all events at that time.
- `FIXED_DURATION(d)` — advance by `d`, resolving all events ≤ new time.
- `UNTIL_INTERRUPT` — advance until interruption (modeled as a scheduled "interrupt check" event or external stop flag).
- `UNTIL_CONDITION(predicate)` — internal sim-run condition. Predicate must be **pure** to preserve determinism.

### Step algorithm (canonical)

1. Determine `target_time` from mode.
2. While events exist with `scheduled_time ≤ target_time`:
   - Pop next event(s) at earliest time `t_next`.
   - Advance `SIM_TIME` to `t_next`.
   - Resolve all events at `t_next` in deterministic order.
3. Advance `SIM_TIME` to `target_time` if not already there.
4. Return `StepResult` (events resolved, time advanced, interrupts raised).

### Deterministic ordering rules

When multiple events share `scheduled_time`:

1. `priority` (descending — pick a direction and freeze it)
2. `source_system` (stable id sort)
3. `nonce` (ascending, monotonic per scheduler)
4. `event_id` (final backstop)

**Resolve-all-at-time:** when you hit time T, resolve everything scheduled at T before moving past T.

**Events scheduling events "at now":** if a handler schedules a new event at `scheduled_time == current SIM_TIME`, it goes into the same time bucket and resolves after the currently executing event, still respecting ordering.

### Combat as sub-simulation

Combat obeys `SIM_TIME` no matter how it's rendered:

- Combat has `start_time`, `duration`, and a `combat_resolved` event at `start + duration`.
- Internally, combat may run minute-level or real-time-like logic.
- Output: final outcome (losses, damage, morale, intel) plus optional intermediate world-visible events.

**Key rule:** no matter how rendered, combat resolves at a specific `SIM_TIME`.

### Save / load & reproducibility

To preserve determinism across sessions, persist:

- `SIM_TIME_TICKS`
- full event queue (with `nonce` / `priority`)
- RNG state(s) per system, if any
- versioned payload schemas

### Integration hooks

- **SYS-005 Order & Messaging** — schedules `order_arrives` events based on jump-latency model.
- **SYS-004 Map & Navigation** — movement is a chain of timed events (depart, transit checkpoints, arrive).
- **SYS-007 Authority** / **SYS-008 Legitimacy** — propagation uses time-based decay and delayed-notice events ("report reaches authority" at `t+Δ`).
- **SYS-002 Characters** — `birth_time`, `death_time`, `last_updated_time`, mortality batch all reference `SIM_TIME`.
- **SYS-006 Information & Knowledge** — `learned_time`, `staleness_rate`, propagation latency all in ticks.

### Current implementation status

The live Apps Script project already persists `SIM_TIME_TICKS` per-user via `PropertiesService.getUserProperties()` (functions `getSimTime()` / `saveSimTime(tick)`). The current authoritative tick value seen in the live sheet is `SIM_TIME_TICKS = 21,367,229,774` (era ≈ 2786 TC, post-Star-League collapse).

Event queue, deterministic ordering, and step modes are the **next implementation work** for this system — the clock exists but the scheduler does not yet.

---

## Open question (not blocking)

**Calendar formatter** — out of scope per §9, but worth a follow-up: do we render to Terran Calendar (TC) day/month/year for player-facing UI, or keep it abstract? See `docs/conventions.md` for in-universe calendar reference.
