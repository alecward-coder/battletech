# SPEC-003B — ComStar System Layer (Strategic Stability & Balance Engine)

**System:** SYS-003 ComStar Meta-Faction — **companion** to SPEC-003 (the player-facing Superset Admin Interface)
**Document type:** Game System Specification + Implementation Addendum
**Document version:** v1.0 (Foundational) + v1.1 (Implementation Addendum)
**Status:** Design-Complete / Implementation-Pending
**Depends on:** SYS-001 Time, SYS-004 Map, SYS-006 Information & Knowledge, SYS-007/SPEC-007A Faction Behavior & Governance
**Related:** SPEC-003 (the player UI when ComStar is being played), SPEC-005 Order Transmission, SPEC-008 Role & Legitimacy

---

## TL;DR

When ComStar is **not** the player, this is the autonomous system that runs in its place — a **non-player, non-territorial system controller** that maintains long-term strategic balance.

ComStar (in this mode) does not act as a conventional faction. It operates as a **reactive governance layer** that monitors power concentration, injects friction into runaway dominance, stabilizes systemic collapse risks, and preserves long-term multipolar equilibrium.

**It must function without explicit player-facing narration.** All effects are deniable modifiers — never direct orders, never declarations of intervention. Five intervention tiers (Passive Stewardship → Open Enforcement) escalate gradually and reversibly off three core indices (PCI, SSI, CAL) plus a relationship metric (CT). v1.1 adds exact tick order, math, smoothing rules, deterministic tier selection, and effect bundles.

> *"ComStar is not an enemy AI. It is a balance algorithm with a political personality."*

---

## 1. System purpose

ComStar System Layer = a non-player, non-territorial system controller responsible for maintaining long-term strategic balance.

ComStar (in this mode) is a **reactive governance layer** that:
- Monitors power concentration.
- Injects friction into runaway dominance.
- Stabilizes systemic collapse risks.
- Preserves long-term multipolar equilibrium.

**Must function without explicit player-facing narration.** Operates through measurable, mechanical effects only.

## 2. Design principles (non-negotiable)

1. ComStar **never** issues direct orders to players.
2. ComStar **never** explicitly declares intervention.
3. All actions must be **deniable and systemic**.
4. Effects must appear as "**emergent difficulty**," not punishment.
5. Intervention escalates **gradually and reversibly**.
6. **Balance is preferred over justice, fairness, or realism.**

## 3. Core system variables (global)

Recalculated each strategic tick.

### 3.1 Power Concentration Index (PCI)
**Per faction. 0.0–100.0.** Measures dominance of a single faction relative to the system.

Inputs (weighted):
- Territory Control % (0.35).
- Military Power Share (0.30).
- Industrial Output Share (0.25).
- Diplomatic Influence Share (0.10).

```
PCI = territory_share * 0.35
    + military_share  * 0.30
    + industry_share  * 0.25
    + diplomacy_share * 0.10
```

| Range | Interpretation |
|---|---|
| < 35 | No imbalance |
| 35–50 | Emerging concern |
| 50–65 | Unhealthy concentration |
| 65–80 | System destabilization risk |
| 80+ | Existential systemic threat |

### 3.2 System Stability Index (SSI)
**Global. 0.0–100.0.** Health of the game world.

| Decreases with | Increases with |
|---|---|
| Active wars | Peace treaties |
| Civilian devastation | Stable borders |
| Tech escalation speed | Low civilian casualties |
| Jump-point interdictions | Predictable diplomacy |
| Economic collapse events | Controlled tech diffusion |

**Lower SSI increases ComStar aggressiveness globally.**

### 3.3 ComStar Attention Level (CAL) — per faction
0.0–100.0. How closely ComStar is monitoring a specific faction.

| CAL increases when faction... | CAL decreases when faction... |
|---|---|
| Expands rapidly | Stabilizes borders |
| Breaks treaties | Limits escalation |
| Uses overwhelming force repeatedly | Accepts arbitration |
| Hoards advanced technology | Acts predictably |
| Bypasses communication norms | Preserves civilians |
| Attacks infrastructure-adjacent targets | |

## 4. Intervention tiers (escalation model)

Tier is derived from **PCI + CAL + SSI trend**.

### Tier 0 — Passive Stewardship
Conditions: PCI < 35, CAL < 25.
Effects: **none** (mechanical baseline).

### Tier 1 — Friction Injection
Conditions: PCI ≥ 35 AND CAL ≥ 25.
Effects:
- +5–10% command latency.
- −10% intel accuracy.
- Increased fog-of-war radius.
- Slower diplomatic confirmations.

### Tier 2 — Selective Counterweighting
Conditions: PCI ≥ 50 AND CAL ≥ 45.
- **Rivals receive:** faster tech diffusion; improved mercenary availability; slight intel boosts.
- **Target faction experiences:** minor logistics inefficiency; increased uncertainty.

**Rule: ComStar never directly buffs enemies — only system parity.**

### Tier 3 — Political Isolation
Conditions: PCI ≥ 65 AND CAL ≥ 65.
- Diplomatic actions cost more.
- Alliance upkeep increases.
- Reinforcement coordination penalties.
- Asymmetric message delays.

### Tier 4 — Controlled Crisis
Conditions: PCI ≥ 80 AND CAL ≥ 80 AND SSI trending downward.
Rare, targeted effects:
- Surprise invasions succeed.
- Supply chains fail temporarily.
- Critical intel inaccuracies.
- Strategic miscoordination events.

**Design intent: momentum disruption, not annihilation.**

### Tier 5 — Open Enforcement (Endgame)
Conditions: PCI extreme + CAL maxed + system survival threatened.
- Direct ComStar military appearance.
- Advanced technology revealed.
- Forced de-escalation or reset events.

**This tier represents system failure prevention, not normal play.**

## 5. Technology throttling system

### 5.1 Technology Visibility Score (TVS)
Measures how visible and destabilizing a faction's tech advantage is.

Inputs: use of advanced units; salvage exposure; battlefield witnesses; trade diffusion rate.

Effects of high TVS: rival tech "rediscovery" events; faster parity restoration; increased ComStar scrutiny.

**Rule: tech is never removed — parity is restored by diffusion.**

## 6. Player–ComStar relationship metric

### ComStar Trust (CT)
**Range: −100 to +100.**

| Positive CT actions | Negative CT actions |
|---|---|
| Arbitration acceptance | Mass devastation |
| Civilian protection | Information warfare |
| Limited warfare | Infrastructure sabotage |
| Predictable conduct | ComStar bypass attempts |

**Effects:** high CT → slower CAL growth, gentler intervention. Low CT → rapid escalation, harsher corrections.

## 7. Player feedback rules (critical)

- **Never** explicitly state "ComStar intervened."
- Show effects only through: delays; confusion; unexpected parity; system resistance.
- Pattern recognition is **intentional and delayed**.
- Revelation occurs only through late-game intel.

## 8. Player counterplay (high level)

Players may:
- Manage CAL via restraint.
- Reduce PCI through decentralization.
- Stabilize SSI via peace and recovery.
- Pursue alternate communications (late game).
- Reform, bypass, or collapse ComStar (endgame arcs).

## 9. Implementation notes

- Treat ComStar as a **background system daemon**.
- No UI panels unless in advanced intel views.
- All values logged internally for debugging.
- Effects must **stack subtly, not catastrophically**.
- System must be tunable via config files.

## 10. Design truth statement

> *"ComStar is not an enemy AI.*
> *It is a balance algorithm with a political personality."*

---

## v1.1 Implementation Addendum

### A) Tick order (authoritative)

Every strategic tick, run in this order:

1. **Ingest world state** (territory, military, industry, diplomacy, wars, civilian damage, tech usage, comm disruptions, treaties).
2. **Compute global indices**: PCI per faction, SSI global, TVS per faction.
3. **Update relationship state**: CAL per faction, CT per faction, with smoothing.
4. **Compute intervention tier** per faction + global modifier from SSI.
5. **Apply effects** as modifiers to downstream systems (fog, logistics, diplomacy, command latency, intel).
6. **Log everything** (pre/post) for debugging + balancing.

**Design rule:** ComStar never "acts," it only applies modifiers to systems that already exist.

### B) Exact math

#### B1) PCI per faction
Use the weighted sum from §3.1 with all inputs normalized 0..100. `PCI = clamp(PCI_raw, 0, 100)`.

#### B2) SSI global (slow-moving)
```
SSI_target = 100
           - (wars_penalty + civilian_penalty + tech_penalty
              + interdiction_penalty + collapse_penalty)
           + (treaty_bonus + stability_bonus)

SSI_target = clamp(SSI_target, 0, 100)
SSI        = lerp(SSI_prev, SSI_target, SSI_ALPHA)        // alpha ~0.05–0.15
```

Each penalty/bonus uses `min(input * weight, cap)` so single events can't dominate.

#### B3) TVS per faction
```
TVS_target = 100 * clamp(
    A * advanced_use_rate
  + S * salvage_exposure
  + W * sigmoid(witnesses)
  + T * trade_diffusion_rate,
  0, 1)

TVS = lerp(TVS_prev, TVS_target, TVS_ALPHA)
```

### C) CAL + CT update rules

#### C1) CT (long-memory reputation, slow change)

```
CT_delta = sum of per-tick event impacts (positive + negative)
CT_target = clamp(CT_prev + CT_delta, -100, 100)
CT        = lerp(CT_prev, CT_target, CT_ALPHA)            // alpha ~0.03–0.08
```

#### C2) CAL (responds faster than CT, not instant)

```
AggScore = w_expand   * expansion_rate
         + w_treaty   * treaty_break_rate
         + w_force    * overwhelming_force_index
         + w_hoard    * tech_hoarding_index
         + w_comm     * comm_norm_violation_index
         + w_infra    * infra_adjacent_attack_index
         + w_tvs      * (TVS / 100)

TrustFactor = remap(CT, -100..+100, 1.25..0.75)           // high trust slows attention

CAL_target = clamp(
    CAL_prev
  + (AggScore * TrustFactor)
  - w_stable * border_stability
  - w_peace  * peace_behavior,
  0, 100)

CAL = lerp(CAL_prev, CAL_target, CAL_ALPHA)               // alpha ~0.10–0.25
```

### D) Tier selection (deterministic, tunable, reversible)

```
PCI_norm = PCI       (0..100)
CAL_norm = CAL       (0..100)
SSI_risk = 100 - SSI (0..100)   // higher = worse

Pressure = p1 * PCI_norm + p2 * CAL_norm + p3 * SSI_risk
```

Then tier by **pressure bands AND hard gates**:

| Tier | Hard gates |
|---|---|
| 1 | PCI ≥ 35 AND CAL ≥ 25 |
| 2 | PCI ≥ 50 AND CAL ≥ 45 |
| 3 | PCI ≥ 65 AND CAL ≥ 65 |
| 4 | PCI ≥ 80 AND CAL ≥ 80 AND SSI trending downward |
| 5 | "System survival threatened" flag set |

Within a tier:
```
Intensity = clamp(remap(Pressure, TierMinPressure, TierMaxPressure), 0, 1)
```

`SSI trending downward` = `SSI - SSI_prev < -SSI_TREND_EPS` for K consecutive ticks (e.g. K=3).

`SystemThreat` (Tier 5 gate, deliberately rare):
```
SystemThreat = (PCI_max > 92) AND (SSI < 25)
             AND (major_factions_alive_count <= N OR global_war_count >= X)
```

### E) Effect application (clean attachment points)

Per faction, compute an **EffectBundle** each tick:

| Tier | Effects (lerped by Intensity) |
|---|---|
| 0 | none |
| 1 (Friction Injection) | `command_latency_mult = 1 + lerp(0.05, 0.10, I)`; `intel_accuracy_mult = 1 - lerp(0.05, 0.10, I)`; `fog_radius_add = lerp(MIN, MAX, I)`; `diplomacy_confirmation_delay_add = lerp(MIN, MAX, I)` |
| 2 (Counterweighting) | **Rivals:** tech-diffusion bonus, merc-availability bonus, intel bonus. **Target:** `logistics_efficiency_mult = 1 - lerp(MIN, MAX, I)`; `uncertainty_events_rate_add = lerp(MIN, MAX, I)` |
| 3 (Isolation) | `diplomacy_cost_mult`, `alliance_upkeep_mult`, `reinforcement_coordination_mult`, `message_delay_add` — all lerped up by I |
| 4 (Controlled Crisis) | Event rate `crisis_event_rate = lerp(MIN, MAX, I)`. Events: supply_chain_fault, intel_false_positive, miscoordination_delay, surprise_invasion_window |
| 5 (Open Enforcement) | `spawn_comstar_force` (scripted); `forced_ceasefire` / reset arcs |

**Defining "rivals" for Tier 2:** factions that satisfy at least one of — currently at war with target; border adjacency with high tension; historic rivalry flag; competing for same regional strategic objectives. Pick top K (1–3) by conflict score.

### F) Tuning knobs (single config file)

- Weights: PCI weights, AggScore weights, Pressure weights.
- Smoothing alphas: SSI_ALPHA, CAL_ALPHA, CT_ALPHA, TVS_ALPHA.
- Threshold gates and pressure bands.
- Intensity ranges (min/max) per effect.
- Event rates + durations for Tier 4.
- Caps for SSI penalties/bonuses.
- Debug toggles, deterministic seed mode.

### G) Logging (mandatory for balancing)

Each tick, write one structured log record per faction:
- `tick_id`, `faction_id`.
- PCI, CAL, CT, TVS.
- SSI, SSI_trend.
- Tier, Intensity, Pressure.
- `applied_modifiers` (resolved numbers).
- `events_triggered`.
- Internal explanation flags (which gate triggered tier; top contributors to AggScore).

### H) Test scenarios (fast validation)

- **Balanced multipolar:** all PCI < 35 → Tier 0 across the board.
- **One faction snowball:** PCI 30 → 70 over 20 ticks → tiers climb gradually, recede if expansion stops.
- **High wars, low SSI:** SSI < 40 → global aggressiveness rises (Pressure via SSI_risk).
- **Tech show-off:** TVS spike → CAL accelerates; parity restored via diffusion events.
- **Trust buffer:** identical PCI/CAL inputs but different CT → high-CT faction escalates slower.
- **No thrashing:** small oscillations around thresholds shouldn't flip tiers every tick (smoothing + hysteresis).

**Anti-thrash:** add hysteresis — tier drops require staying below threshold *minus margin* for N ticks.

### I) Build prompt for the implementation pass

> "Implement ComStar as a background balance daemon. It must:
> - run once per strategic tick,
> - compute PCI (per faction), SSI (global), TVS (per faction), CT/CAL (per faction),
> - select tier + intensity deterministically from gates + pressure,
> - output an EffectBundle per faction consumed by other systems,
> - trigger Tier 4 crisis events probabilistically from a per-tick rate,
> - be fully tunable from config constants,
> - log all intermediate values for debugging.
> No UI. No direct player messaging. All effects must be deniable modifiers."

---

## Relationship to SPEC-003 (the admin interface)

| | SPEC-003 (Admin Interface) | SPEC-003B (Balance Engine) |
|---|---|---|
| When does it apply? | When ComStar is **player-controlled** | When ComStar is **NOT** player-controlled |
| What does it produce? | UI controls + observables | EffectBundles per faction |
| Who reads it? | Player | Other game systems (silently) |
| Visibility to players | High (it's a UI) | Zero (never named) |

These are two faces of the same SYS-003 entity. A future "AI ComStar that decides which controls to pull" implementation would sit between them: it would *use* the SPEC-003 control surface but be *driven* by SPEC-003B's measurements. For now they live as separate specs because they have different audiences and acceptance criteria.
