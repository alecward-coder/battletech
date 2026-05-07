# SYS-005 Spec — Order Transmission & ComStar Messaging System

**System:** SYS-005 Order & Messaging
**Document type:** System Placeholder Spec
**Document version:** v0.5 (Identified / Incomplete by Design)
**Status:** Scaffolded — to be expanded
**Depends on:** SYS-001 Time, SYS-003 ComStar, SYS-004 Map & Navigation
**Related:** SPEC-007 Authority & Governance, SPEC-007A Faction Behavior, SPEC-006 Information & Knowledge, SPEC-008 Role & Legitimacy

> *Note on numbering:* the project tracker reserves "SPEC-005" for the Character Behavior, Memory & Goals Layer (SYS-012). This spec covers SYS-005 Order Transmission and is referenced by file path / SYS-XXX prefix instead of a conflicting SPEC-XXX number.

---

## TL;DR

How **intent moves through space**. Translates faction decisions into actionable outcomes over time, introducing **latency, distortion, and failure** along the way. ComStar's primary surface for exerting influence — but ComStar **does not block orders outright**; it modulates timing, fidelity, and confirmation behavior.

Every order has a 5-step lifecycle: **Formulation → Transmission → Receipt → Interpretation → Execution.** Delays, degradation, and failure occur primarily in steps 2–4.

Three transmission paths: **HPG (ComStar-mediated)** — fast, scalable, modulatable; **Physical Courier** — slow, secure, ComStar-resistant; **Local Execution** — instant, scope-limited, requires prior delegation.

Players never see ComStar's internal routing or priority queues — they see delayed effects, unexpected outcomes, stale confirmations, and "last updated" timestamps.

> *"Authority exists only where intent arrives intact and on time."*

---

## 1. System purpose

Governs how faction decisions are conveyed across interstellar space and converted into actionable outcomes.

This system exists to:
- Translate faction intent into effects over time.
- Introduce latency, distortion, and failure into governance and warfare.
- Serve as the primary surface through which ComStar exerts influence.

**This system does not decide policy or strategy.** It only determines how decisions propagate.

## 2. Core concept

Orders do not apply instantly. Every order follows a lifecycle:

1. **Formulation** (consumes Governance Capacity from SPEC-007A).
2. **Transmission**.
3. **Receipt**.
4. **Interpretation**.
5. **Execution**.

**Delays, degradation, and failure occur primarily during steps 2–4.**

## 3. Order types

### 3.1 Bootstrap orders
- Create or dissolve administrative regions.
- Assign governors or authorities.
- Establish foundational doctrine.

Characteristics: high Governance Capacity cost; high transmission complexity; one-time or infrequent; critical to long-term structure.

### 3.2 Standing doctrine orders
- Persistent intent-based rules.
- Define default regional behavior.
- Limit need for ongoing micromanagement.

Characteristics: moderate Governance Capacity cost; infrequent updates; high durability; low urgency.

### 3.3 Intervention orders
- Overrides of local autonomy.
- Crisis response.
- Military mobilization or suppression.

Characteristics: high Governance Capacity cost; time-sensitive; high distortion and delay sensitivity; generates follow-on instability.

## 4. Transmission paths

### 4.1 HPG transmission (ComStar-mediated)
- Near-instant interstellar communication.
- High scalability.
- Default method for most factions.

**Properties:** subject to ComStar prioritization; vulnerable to delay and distortion; uniform pricing, **variable quality**.

### 4.2 Physical courier
- JumpShip or DropShip delivery.
- Slow but secure.
- High cost, limited scalability.

**Properties:** resistant to ComStar interference; long execution delay; used for redundancy or secrecy.

### 4.3 Local execution
- Orders executed within an autonomous region.
- No interstellar transmission required.

**Properties:** instant; limited scope; **requires prior delegation** (a doctrine order issued earlier).

## 5. ComStar interaction

ComStar **does not generally block orders outright**. Influence manifests as:

- Latency variation.
- Priority handling.
- Confirmation delays.
- Minor distortion or ambiguity.

Influence is modulated by:
- ComStar Trust (CT — see SPEC-003B).
- ComStar Attention (CAL — see SPEC-003B).
- System Stability Index (SSI — see SPEC-003B).

## 6. Latency & reliability variables (placeholders)

Each order has associated properties:
- Transmission time (derived from jump distance — see SPEC-004 / SPEC-004A).
- Priority class.
- Reliability score.
- Distortion risk.

**Failure modes:**
- Delayed execution.
- Partial compliance (couples to SPEC-007 §7 partial-compliance rules).
- Misinterpretation.
- Silent degradation.

**Exact formulas to be defined in later iterations.**

## 7. Player & AI visibility

Players and AI **do not see**: internal ComStar routing; priority queues; direct manipulation indicators.

Players and AI **do see**: delayed effects; unexpected outcomes; stale confirmations; "last updated" timestamps.

Consistent with SPEC-006 §15-ext (qualitative tags only, never numeric trust).

## 8. System interfaces

**Interfaces with:**
- SPEC-007A Faction Behavior — consumes Governance Capacity.
- SPEC-003 / SPEC-003B ComStar — modulates delivery quality.
- SPEC-004 / SPEC-004A Map — defines distance.
- SPEC-007 Authority & Governance — receives partial-compliance feedback at the destination.
- SPEC-006 Information & Knowledge — order receipt = events that produce information records.

**Does not interface with:** tactical combat resolution; economic simulation logic; motivation evaluation.

## 9. Explicit non-goals

This specification does not yet define:
- Exact latency mathematics.
- Encryption or interception mechanics.
- Espionage systems.
- Message content simulation.

## 10. Design statement

> *"Authority exists only where intent arrives intact and on time."*

---

## Implementation notes

### Order object (minimum shape)

```
{
  "order_id": "UUID",
  "issued_at": "SIM_TIME",
  "issuer_id": "actor_id",
  "addressee_id": "actor_id | region_id | unit_id",
  "order_type": "bootstrap | doctrine | intervention",
  "intent_payload": {...},
  "transmission_path": "hpg | courier | local",
  "priority_class": "routine | priority | flash",
  "lifecycle_state": "formulating | transmitting | received | interpreted | executing | resolved | failed",
  "lifecycle_events": [
    { "state": "...", "at": "SIM_TIME", "detail": "..." }
  ]
}
```

Each lifecycle state transition emits an event into the SPEC-006 ledger.

### Couplings

- **SPEC-001 §7 (action time-cost declaration)** — every order declares `transmission_time` + `interpretation_time` + `execution_time` at formulation. The clock-driven scheduler dispatches state transitions at the right ticks.
- **SPEC-003B (ComStar balance engine)** — when ComStar applies a `command_latency_mult` or `message_delay_add` modifier to a faction, this is where it actually lands. Read CT/CAL/SSI at transmission time.
- **SPEC-006 (information & knowledge)** — order receipt + interpretation outcomes are emitted as events with `claim_type=event`, `channel=hpg|courier|in_person`, propagating through normal SPEC-006 rules.
- **SPEC-008 (role & legitimacy)** — provides Q (transmission quality) per the legitimacy/heat state of the issuing actor.

### What a placeholder spec means

This is v0.5 deliberately. Concrete formulas (latency math, reliability scoring, distortion mechanics) are explicit non-goals until the spec advances. The order lifecycle, transmission paths, and interface points are stable enough to implement against.
