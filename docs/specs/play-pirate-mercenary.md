# Play Spec — Pirate & Mercenary Play Framework

**System:** Play-mode spec — **does not have a SYS-XXX entry in the foundational tracker.** This is a role-specific play layer that consumes foundational systems.
**Document version:** v1.0 (Implementation-Oriented) — supersedes v0.5 placeholder
**Status:** Design-Complete / Tuning-Pending
**Depends on:** SYS-001 Time, SYS-005 Order & Messaging, SYS-006 Information & Knowledge, SYS-008 Role & Legitimacy Framework (universal foundation), SYS-003 ComStar
**Related:** `play-*` other role-specific specs (future: warlord, sovereign, sub-faction)

---

## TL;DR

Two non-sovereign armed roles, both playable, using the **same foundational state model** but differing in default parameters and UI emphasis:

- **Mercenaries** — *legible* violence. Contract-driven. Reputation, Legitimacy, Contract Tier, Scrutiny. Visible movements, traceable payments, predictable consequences. Failure = bankruptcy / blacklisting / mutiny / political liability.
- **Pirates** — *illegible* violence. Heat-driven. Heat, Notoriety, Safe Harbor Net, Fence Capacity. Low visibility until it isn't. Spike-based consequences. Failure = exposure cascade / coordinated retaliation / internal collapse / mobility loss.

> *"You do not choose to be legitimate or illegitimate. You choose how much risk you are willing to carry for freedom."*

Both share **identity/continuity, operational readiness, information/access, and ComStar exposure** state. Roles are not classes — transitions are gated by Legitimacy, Heat, Continuity Score, territory control, and recognition tokens.

---

## 1. System purpose

Defines playable mechanics, UI surfaces, state variables, and transition rules for **mercenary organizations** (legible, contract-driven, legitimacy-dependent) and **pirate bands** (illegible, opportunistic, heat-managed) within the universal Role & Legitimacy Framework (SYS-008).

This spec defines **player-facing mechanics and state changes**, not combat resolution or economy internals.

## 2. Core distinction (unchanged from v0.5)

| | Mercenaries | Pirates |
|---|---|---|
| Operate inside legitimacy systems | Yes | No |
| Rely on | Contracts + reputation | Anonymity + opportunity |
| Are visible/legible | Yes | Deliberately not |

Both use force. Only one is recorded as a "valid participant" by default.

## 3. Shared foundational state (both roles)

### 3.1 Identity & continuity
- `OrgID` — persistent internal id (never changes).
- `PublicIdentity (PID)` — outward-facing name / transponder profile (can change).
- `ContinuityScore (CS)` 0–100 — "this is the same actor" measure across time.
  - High CS = world can pattern-match you.
  - Low CS = you can plausibly rebrand / disappear.

### 3.2 Operational readiness
- Credits / liquid assets.
- Supplies (fuel, ammo, spares).
- Force roster (units, pilots, officers).
- Morale / loyalty (aggregate + per-subgroup).
- Mobility rating (jump capability, transport, maintenance state).

### 3.3 Information & access
- `IntelQuality (IQ)` 0–100 — accuracy of target/contract info.
- `NetworkStrength (NS)` 0–100 — contacts, fixers, port agents.
- `PortAccessLevel (PAL)` 0–5 — who will service you and where.

### 3.4 ComStar exposure interface
- `ComStarAttention (CSA)` 0–100 — how much the ComStar layer "cares." **Not morality**; systemic risk detection.

## 4. Mercenary play model

### 4.1 Role identity
Mercenary organizations sell force under contract, trading autonomy for access.

### 4.2 Mercenary-specific state
- `Reputation (REP)` -100 to +100 — quality + reliability.
- `Legitimacy (LEG)` 0–100 — recognition / acceptance by institutions.
- `ContractTier (CT)` 0–5 — what boards/clients will talk to you.
- `Scrutiny (SCR)` 0–100 — how closely factions watch you due to success + notoriety.

### 4.3 Core gameplay loop
1. Acquire contract leads (boards, brokers, direct clients).
2. Due diligence (intel buy, negotiation, travel-time estimation).
3. Accept contract (locks obligations + visibility).
4. Deploy forces (movement is trackable; logistics must route via access nodes).
5. Execute objective (combat resolves elsewhere).
6. Report outcome (truthfulness is a mechanic — can lie, but risk exposure).
7. Receive pay → update REP/LEG/SCR → unlock/lose access.
8. Refit/recruit → repeat.

### 4.4 Contract object (minimum fields)
`ContractID`, `IssuerFaction`, `TargetFaction/Entity`, `ObjectiveType` (defend / escort / raid-as-merc / garrison / extraction / sabotage), `PayStructure` (upfront / completion / salvage rights / bonuses / penalties), `TimeWindows` (start-by, complete-by), `VisibilityLevel`, `LegalCoverLevel`, `RiskEstimate` (modifiable by intel spend), `ReputationSensitivity`.

### 4.5 Reputation update rules
REP changes are a function of:
- Outcome (success / partial / fail).
- Collateral profile (civilian, infrastructure, restricted targets).
- Time adherence (late-completion penalties).
- Truthfulness (if caught misreporting later).
- Pattern reliability (streaks matter).

Designer knob example:

```
REP_delta = BaseOutcome
          + ReliabilityBonus
          - CollateralPenalty
          - LiePenalty(if exposed)
```

### 4.6 Legitimacy & access coupling
- `LEG` gates `PAL` ceilings (you cannot buy service where you're not accepted).
- `CT` is a function of `REP` + `LEG`, but can be **suppressed by SCR** (too hot politically).

### 4.7 Scrutiny (success has a price)
SCR rises with: high REP, high payoffs, repeated involvement in major wars, proximity to flashpoints.
SCR effects: more inspections, tighter contract terms, higher intel-leakage risk, "forced publicity" of actions.

### 4.8 Constraints
- Payments are traceable (unless you accept dirty / black-market terms → LEG hit).
- Movement is legible (jump signatures, docking records).
- Defection or betrayal causes REP collapse and contract-exclusion cascades.

### 4.9 Failure states (measurable triggers)
| Failure | Trigger |
|---|---|
| Bankruptcy | `Credits < 0` OR cannot meet supply upkeep for N turns |
| Blacklisting | `REP ≤ threshold` AND `LEG ≤ threshold` (locks CT to 0–1) |
| Mutiny / fragmentation | Loyalty average < threshold OR factional split event |
| Political liability blowback | `SCR ≥ threshold` + controversial contract chain → targeted sanctions/hunts |

## 5. Pirate play model

### 5.1 Role identity
Pirate bands prey on routes and weak points by **staying illegible longer than response cycles**.

### 5.2 Pirate-specific state
- `Heat (HEAT)` 0–100 — active attention + pattern recognition.
- `Notoriety (NOT)` 0–100 — how "known" the brand is (separate from actual identification).
- `SafeHarborNet (SHN)` 0–100 — places that hide / service you.
- `FenceCapacity (FC)` 0–100 — ability to liquidate loot quickly without spikes.

### 5.3 Core gameplay loop
1. Scout routes + nodes (buy intel, observe traffic, probe defenses).
2. Select target by value / defense / response time.
3. Ambush / raid (combat resolves elsewhere).
4. Salvage + capture + loot.
5. Exfiltrate along evasion plan (route selection matters).
6. Liquidate (fences, black markets, corrupt ports).
7. Manage HEAT (cooldown, relocate, fragment, rebrand).
8. Re-arm / recruit → repeat.

### 5.4 Heat mechanics
**HEAT increases with:** frequency of actions (short intervals), scale (value destroyed/stolen, tonnage, casualties), repetition (same corridor, same signature, same tactics), `NOT` (public fear amplifies attention), evidence left behind (survivors, sensor logs, captured transponders).

**HEAT decreases with:** inactivity (time-based decay), relocation distance (jumping away from corridor clusters), fragmentation (splitting force into sub-bands), identity change (PID shift + signature masking), bribery / misdirection (spend loot to reduce effective HEAT).

**Key design requirement:** HEAT is **not "wanted stars."** It is *coordination readiness* — how prepared the system is to act against you.

### 5.5 Notoriety vs identification
- `NOT` can be high while `CS` is low (people fear "Red Jackal," but don't know who it is).
- If `CS` rises, `NOT` begins **converting into targeted hunts**.

### 5.6 Constraints
- No guaranteed service access — `PAL` is conditional on `SHN` + bribes.
- Loot liquidation is bottlenecked by `FC` (too much loot too fast spikes HEAT).
- Crew loyalty more volatile (piracy attracts opportunists).

### 5.7 Failure states (measurable triggers)
| Failure | Trigger |
|---|---|
| Exposure cascade | `HEAT ≥ threshold` AND `CS ≥ threshold` (true identification forms) |
| Coordinated retaliation | `HEAT ≥ threshold` for N turns → multi-faction hunt task force spawns |
| Internal collapse | Loyalty < threshold OR loot disputes event chain |
| Mobility loss | Transport / drive damage + no safe repair access for N turns |

## 6. Interaction with factions

### 6.1 Mercenary (formal)
- Contract boards require `LEG` minimums.
- Contracts produce recorded outcomes that propagate via info systems.
- Enforcement is indirect: denial of access, bounties, political isolation.

### 6.2 Pirate (influence, not hiring)
Pirate "support" is modeled via covert modifiers, never enforceable promises.

| Mode | What it looks like |
|---|---|
| **Passive tolerance** | Patrol density reduced in specific corridor(s); response time increased. Often traded for "pirates avoid these shipments" (non-binding). |
| **Indirect encouragement** | Intel "falls off a truck" (`IQ` boost for specific targets); traffic misrouting; supplies appear at neutral nodes (`SHN`/`FC` boosts). |
| **Dirty bargains** | One-time payoff to stop attacks in zone; temporary safe-harbor flag for X turns. **High betrayal probability**; bargain itself raises CSA if detected. |

## 7. ComStar relationship (mechanical hooks)

### 7.1 Mercenaries
- Actions are legible: contracts, docking, comms, payments.
- ComStar generally tolerates mercenaries as stabilizing intermediaries.
- `CSA` rises when mercs accelerate consolidation (helping a runaway hegemon).

### 7.2 Pirates
- Pirates are anomalies; ComStar tracks patterns, not "evil."
- ComStar intervenes (via attention allocation) when piracy threatens: critical message infrastructure, systemic trade stability, inter-faction balance (pirates enabling a hegemon or causing collapse).

### 7.3 Attention allocation outputs (what CSA can do without "acting directly")
- Adjust info latency / reliability for factions hunting you.
- Increase coordination speed among anti-pirate coalitions.
- Trigger "infrastructure priority protection" events.
- Change patrol routing efficiency in critical corridors.

(Direct combat / assassination explicitly out-of-scope unless added later.)

## 8. Role transitions (gated + costed)

Roles are **not skins**; transitions are systemic reconfiguration.

### 8.1 Transition variables
- `LEG` (institutional acceptance).
- `HEAT` (active pressure).
- `CS` (identification continuity).
- Territory control (if applicable elsewhere).
- Recognition tokens (explicit faction endorsements / pardons).

### 8.2 Transition paths

| Path | Requirements | Effects |
|---|---|---|
| **Pirate → Mercenary** (conditional legitimization) | HEAT below threshold (cool off first); CS below threshold OR formal amnesty event; pay "laundering cost" (credits + surrendered assets); accept "probation" status | REP starts low; SCR starts moderate |
| **Mercenary → Pirate** (legitimacy loss) | REP collapse + LEG collapse OR deliberate "go dark" choice | Lose CT access; PAL collapses to SHN-based; gain immediate loot flexibility, but HEAT rises faster due to known baseline CS |
| **Pirate → Warlord** (territorial control) | Stable supply + garrison ability + local compliance mechanics (out-of-scope) | CS tends to rise (territory is legible); HEAT converts into open warfare pressure |
| **Mercenary → State Instrument → Sovereign Actor** | High REP + high LEG + faction patronage | Increasing SCR, decreasing autonomy; eventually a "recognized military arm" (different interface later) |

### 8.3 Persistent modifiers ("past roles stick")
- **Former pirate:** permanent trust penalty with institutions, mitigated by years of clean REP.
- **Former merc turned pirate:** higher baseline `CS` (easier to identify), but higher operational competence.

## 9. Permission & visibility differences (UI impact)

| | Mercenary defaults | Pirate defaults |
|---|---|---|
| Visibility | High | Low until it isn't |
| Consequences | Predictable (REP/LEG-driven) | Spike-based (HEAT cascades) |
| Access | Stable but conditional | Fragile, relationship-driven |
| Planning style | Portfolio management (contracts, obligations, timing) | Rhythm management (strike → vanish → liquidate → cool) |

## 10. Player UI control surfaces

### 10.1 Shared screens
- Org Dashboard — credits, supplies, roster, readiness, mobility.
- Intel Screen — IQ sources, purchase options, rumor reliability.
- Network Screen — NS, key contacts, favors owed, betray risk.
- Identity Screen — PID management, CS projections, signature masking options.
- Heat / Reputation graphs (time series + projection).

### 10.2 Mercenary screens
- Contract Board (filter by pay, risk, politics, travel time).
- Negotiation Panel (terms sliders → REP/LEG/SCR effects).
- After-Action Report (truthfulness choice; evidence-risk indicator).
- Reputation Ledger (who thinks what, where).

### 10.3 Pirate screens
- Route Map Overlay (trade density, patrol density, response-time bands).
- Target Picker (value vs risk vs evidence left behind).
- Fence Market (liquidation speed vs heat spike).
- Safe Harbor Manager (SHN nodes, cooldown timers, bribe costs).
- Fragment / Rebrand Tool (splitting, PID swap, CS reduction cost).

## 11. Generation logic surfaces (tuning-pending)

### 11.1 Contract generation inputs (merc)
Regional conflict intensity, faction budgets + desperation, player REP/LEG/CT/SCR, travel distances + comm latency. Output: Contract objects with pay/risk/visibility tuned.

### 11.2 Raid opportunity generation inputs (pirate)
Trade density and route value, patrol allocation (dynamic), player IQ/NS/SHN/FC, recent piracy patterns (avoid repetition unless player chooses). Output: target set with projected HEAT gain and liquidation feasibility.

## 12. Explicit non-goals

Combat mechanics, economy simulation internals, AI behavior trees, balance tuning values, narrative scripting.

## 13. Design statement

> *"You do not choose to be legitimate or illegitimate.*
> *You choose how much risk you are willing to carry for freedom."*

---

## Placement note

This spec doesn't carry a SYS-XXX prefix because it's a **role-specific play framework**, not a foundational system. It depends on (and is constrained by) SPEC-008 Role & Legitimacy Framework. As more role-specific specs arrive (warlord, sovereign actor, sub-faction authority), they should follow the same `play-*.md` convention or earn their own `SYS-XXX` if they introduce truly foundational mechanics.

Open question: should there be a "play modes" category in `architecture.md` parallel to the 12-system foundational table?
