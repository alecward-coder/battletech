# SPEC-006 — Information & Knowledge Framework

**System:** SYS-006 Information & Knowledge
**Category:** Foundational
**Status:** Active
**Depends on:** SYS-001 Time, SYS-002 Universal Character System, SYS-003 ComStar, SYS-004 Map & Navigation, SYS-005 Order & Messaging
**Related:** SYS-007 Authority & Governance, SYS-008 Legitimacy & Reputation, SYS-012 Character Behavior & Cognition

---

## TL;DR

The simulation enforces a strict separation between **ground truth** and **knowledge state**. Actors never act on truth directly — they act on perceived information that may be incomplete, outdated, contradictory, or manipulated.

Information is **first instantiated at the character level** (direct observation, participation, reports, comms, rumors). Factions and institutions don't "know" anything directly — their knowledge is an **aggregation** of character-held information with weighting, filtering, summarization, and delay. ComStar aggregates more aggressively across factions and regions but is still operating on perceived reality and **can be surprised**.

Information records are **immutable snapshots**; updates create new records. This gives a full audit trail and makes "history as gameplay" possible. Conflicts are not auto-resolved — they require new info, higher-trust sources, direct observation, or time-based invalidation.

> *"Truth exists. Knowledge is fragmented. Power acts on belief. Time erodes certainty. No actor sees the whole board."*

---

## 1. Purpose

Defines how information exists, propagates, decays, conflicts, and is acted upon within the simulation.

**The system governs perceived reality, not ground truth.** All decisions by factions, characters, and organizations are made using their knowledge state, which may be incomplete, outdated, contradictory, or manipulated.

## 2. Core principle

Strict separation between:

- **Ground Truth** — simulation reality.
- **Knowledge State** — what actors believe.

Actors never act on ground truth directly. **All behavior is driven by perceived information.**

## 3. Information ownership model (hybrid)

### 3.1 Character-level knowledge
- All information is **first instantiated at the character level**.
- Characters acquire information through direct observation, participation in events, reports, communications, or rumors.
- Characters may possess unique, partial, or incorrect knowledge.

### 3.2 Faction-level aggregation
- **Factions do not "know" things directly.**
- Faction knowledge is an aggregation of character-held information.
- Aggregation applies weighting, filtering, summarization, and delay.
- **Loss of characters can reduce or distort faction knowledge.**

### 3.3 Organizational knowledge (ComStar, institutions)
- Institutions aggregate across many characters and domains.
- Broader scope, faster access, higher aggregation density.
- Institutional knowledge is still perceived reality, **not omniscience**.

## 4. Information record

Each information item is a record with:

- `subject` — entity, system, event, or condition.
- `believed_value` — what is believed to be true.
- `source` — originating character or institution.
- `acquisition_time` — SIM_TIME.
- `last_update_time` — SIM_TIME.
- `trust_weight` — derived from source relationship.
- `precision` — `exact` | `estimated` | `vague`.
- `conflict_state` — `none` | `partial` | `high`.
- `scope` — `local` | `regional` | `strategic`.

**Information records are immutable snapshots; updates create new records.**

## 5. Trust & source reliability

Actors maintain trust relationships with sources. Trust influences:
- Effective confidence of received information.
- Resistance to contradiction.
- Willingness to act on weak data.

**Trust values are internal and never shown numerically to players.**

Trust changes over time based on historical accuracy, alignment of interests, detected contradictions, institutional reputation.

## 6. Information decay & staleness

Information decays as SIM_TIME advances. Decay is influenced by:
- Elapsed time.
- Distance (jump count).
- Transmission path.
- Regional instability.
- Institutional filtering.

**Stale information remains visible but loses effective weight.**

## 7. Conflicting information

Multiple contradictory records may coexist. When conflicts are detected:
- `conflict_state` is raised.
- Effective confidence is reduced.
- Actors may delay, verify, or gamble.

**Conflicts are not automatically resolved.** Resolution requires:
- New information.
- Higher-trust sources.
- Direct observation.
- Time-based invalidation.

## 8. Misinformation

Arises through:
- Intentional deception.
- Partial observation.
- Rumor propagation.
- Aggregation loss.
- Outdated assumptions.

Intent is not required for false information to exist. **The system does not distinguish intent at the data level; only outcomes.**

## 9. Access scope & visibility

Information visibility depends on actor role:

| Actor | Visibility |
|---|---|
| Characters | Personal, local, experiential |
| Governors | Detailed local, summarized regional |
| Faction leadership | Broad, delayed, aggregated |
| Military command | Readiness-focused, limited political context |
| Pirates | Opportunistic, current, unreliable |
| ComStar | Cross-domain aggregation with selective dissemination |

## 10. ComStar role in information flow

ComStar:
- Receives information earlier than most actors.
- Aggregates across factions and regions.
- Controls transmission speed and fidelity.
- Selectively releases summaries, not raw data.

**ComStar operates on perceived reality and can be surprised. It is asymmetrically informed, not omniscient.**

## 11. Information costs

Acquisition may cost: money, time, political capital, legitimacy, attention, exposure risk.

**Some costs are implicit** (revealing interest by asking).

## 12. Interfaces with other systems

| System | Feeds |
|---|---|
| SYS-007 Authority | Faction behavior evaluation |
| SYS-008 Legitimacy | Intervention logic |
| SYS-005 Orders | Order confidence and delay |
| SYS-002 Characters | Risk assessment |
| Player UI | Decision context |

**SYS-006 does not** resolve combat, calculate economy, or enforce outcomes.

## 13. Performance & scale

- Only instantiated characters hold records.
- Aggregation is batch-processed.
- Stale records are deprioritized, not deleted.
- Fog-of-war is layered, not per-hex only.

## 14. Design statement

> *"Truth exists.*
> *Knowledge is fragmented.*
> *Power acts on belief.*
> *Time erodes certainty.*
> *No actor sees the whole board."*

---

## Proposed extensions (not yet adopted)

The following refinements were proposed alongside the parcel. They preserve the design statement while adding implementation specificity. Adopt explicitly before treating as authoritative.

### §4-ext — Additional record fields

- `claim_key` — canonical identifier for the asserted claim, e.g. `SYSTEM:OutpostSigma|attribute:owner` or `FLEET:ID-448|attribute:location`. Lets aggregation and conflict detection compare apples-to-apples.
- `claim_type` — `state` | `event` | `intent` | `capability` | `relationship`.
- `channel` — `observation` | `HPG` | `courier` | `intercepted` | `rumor` | `institutional report`.
- `channel_fidelity` — `high` | `medium` | `low`.
- `source_trust` — internal value; may differ from channel fidelity.

Replaces the single `trust_weight` with a two-layer model:
`effective_confidence = f(source_trust, channel_fidelity, staleness, precision, conflict_state)`.

A trusted person via a garbage channel ≠ a direct report.

### §7.1-ext — Conflict detection rule

Conflicts evaluated **per `claim_key`**. Two records conflict when:
1. `claim_key` matches.
2. `believed_value` differs beyond `precision` tolerance. *Estimated* values may partially conflict rather than fully conflict.

### §7.2-ext — Conflict persistence

Conflicting records persist until:
- Overwritten by direct observation within relevant scope.
- Outweighed by higher-trust + higher-fidelity sources.
- Invalidated by time (event windows expire; capability estimates time out).

### §8.1-ext — Deception & manipulation vectors

False/distorted records may be created by:
- Forged reports / doctored manifests.
- Spoofed identity / transponders.
- Staged events / decoys.
- Compromised channels (intercept / alter / relay).
- Selective disclosure (true but incomplete framing).

System stores outcomes only; intent is inferred (if at all) by actors.

### §11.1-ext — Verification actions (first-class)

Named actions actors and players can take:
- `verify_by_observation` — direct recon / scouting.
- `verify_by_second_source` — second-source confirmation.
- `verify_by_institution_query` — query a trusted institution.
- `probe_by_operation` — raid to test defenses, bribe to test owner, etc.
- (And) institutional query, interception operations, bribery / informants.

**Verification always creates new immutable records.**

### §15-ext — Player presentation rules

Players never see numeric trust/confidence. UI uses standard hint vocabulary so it stays consistent across systems:

| Dimension | Vocabulary |
|---|---|
| Source label | who/what (e.g. "Capt. Halden", "ComStar bulletin", "intercepted Marik comms") |
| Channel label | "local report", "ComStar summary", "intercepted", "rumor" |
| Staleness band | "fresh" / "recent" / "stale" — never exact SIM_TIME |
| Conflict tag | "confirmed" / "credible" / "uncertain" / "contested" / "stale" |
| Precision tag | "exact" / "estimated" / "vague" |

Confidence is **inferred** by the player from these tags, not displayed as a number.

### Companion parcel (suggested) — SYS-006A: Aggregation & Summarization Engine

Keep SYS-006 pure (the ontology). Spin out:
- Batch rules for faction-level aggregation.
- Role-based summarizers (governor vs high command vs pirates vs ComStar).
- What gets dropped, delayed, or abstracted.

Becomes the AI + performance implementation contract while SYS-006 stays the data model.

---

## Resolution of Q-001 (project tracker, blocking)

**Q-001: "How wrong can information be before players notice?"**

The combination of §15-ext (qualitative-only player UI) and §7 (conflicts surface but don't auto-resolve) gives the answer:

- **Numeric confidence is never shown.** Players read tags ("contested", "stale", "estimated") and infer reliability.
- **The threshold is the player's, not the system's.** Wrongness is *visible* in the data (channel, source, conflict tag) but the system never says "this is wrong" — it says "this is what character X believes, from source Y, via channel Z, last updated W."
- **Distortion is per-channel and per-source.** Same fact via different channels can produce different `believed_value`s; both are stored, both are visible.

This was the working answer I noted in the original Phase B plan; SPEC-006 confirms it with §7 + §15-ext.

---

## Status against the live schema

`schema/tables.sql` already drafts an `events`, `knowledge`, and `info_channels` triplet preemptively. The **shape is right** but the field names need reconciliation with this spec before implementation:

| `tables.sql` (preemptive) | This spec | Reconciliation |
|---|---|---|
| `events.event_id` | acts as the immutable record id | Keep as the canonical "ground truth event" log; information records reference it as `source_event_id` or in §4-ext as part of the claim |
| `knowledge.fact_type` | `claim_type` | Rename for consistency with spec |
| `knowledge.claimed_value` | `believed_value` | Rename |
| `knowledge.confidence` | `effective_confidence` (derived) + `source_trust` (stored) | Split per §4-ext |
| `knowledge.source_character_id` | `source` | Rename / generalize (institutions are also valid sources) |
| `knowledge.source_channel_id` | `channel` + FK to `info_channels` | Already aligned |
| `knowledge.staleness_rate` | per §6, decay is influenced by multiple factors; staleness_rate is a per-record decay parameter | Keep; derive effective staleness at read time |
| `knowledge.distortion_pct` | per §8, intent is not stored | Drop or repurpose as `channel_fidelity` |
| (missing) `claim_key` | §4-ext required | Add |
| (missing) `precision`, `conflict_state`, `scope` | §4 required | Add |
| (missing) immutability | §4 ("updates create new records") | Add an `INSERT-only` convention; updates produce new rows with same `claim_key`, new `acquisition_time` |

The **`events` table already aligns** with the spec's "ground truth" layer — it's the immutable ledger, separate from the per-character `knowledge` records. That separation matches §2 cleanly.

---

## Implementation notes

### Aggregation pipeline (sketch — for the suggested SYS-006A companion)

1. Walk `instantiated_characters` filtered by faction membership.
2. For each `claim_key`:
   - Collect all records.
   - Resolve conflicts using §7 rules.
   - Aggregate to faction-level snapshot (latest acquisition + highest source_trust × channel_fidelity wins; ties produce a contested aggregate).
   - Apply role-based summarizer for the consumer (governor vs high command vs ComStar).
3. Write a faction-level snapshot record (also immutable, also referencing the underlying character records).

Batch interval: tunable (start at SYS-007's monthly cadence; decouple later if needed).

### Verification actions wire into SYS-005

`verify_by_observation` and `probe_by_operation` are scheduled as orders in SYS-005 (with declared time cost per SPEC-001 §7). Their successful resolution emits new information records. This keeps verification on the same time-cost discipline as everything else.

### Dependencies for implementation

- **Required:** SYS-001 clock + event-queue scaffolding.
- **Required:** SYS-002 character records (already in live sheet).
- **Helpful:** SYS-005 order-event types (we know they exist; details unread until `clasp pull`).
- **Not required:** SYS-007 (it consumes from SYS-006, doesn't gate it).

This system was previously identified as the recommended Phase B target. With SPEC-006 now formal, that recommendation stands — SYS-006 is ready to implement.
