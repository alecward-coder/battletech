# Jump operations — timing, lore, and misjump model

**Possible home system:** new `SYS-013 Jump Operations`, OR sub-module of SYS-004 Map & Navigation, OR sub-module of SYS-009 Logistics & Readiness. **Decision deferred** — file under `discussions/` until placement is confirmed.
**Source:** ChatGPT design conversation
**Status:** Exploratory — no SYS ID or SPEC entry yet

---

## TL;DR

Three things to model:

1. **Time from "we're jumping" to actually jumping.** With a charged drive at a standard jump point: ~10–30 minutes (mostly nav-solution checks). With hand-calcs / nonstandard points: hours. Drive uncharged: bottleneck is the ~7-day recharge, not the procedure.
2. **What it looks like.** Standard: subtle distortion → flash → the universe "cuts" and you're elsewhere. Misjumps: distortion lingers, flash whites out instruments, vertigo and pressure, then arrival at wrong location with possible damage. Total visual experience under ~2 seconds either way.
3. **Misjump probability model.** No canon "X% per jump" number exists. Lore treats standard jumps as routine and misjumps as memorable rarities. Below: a calibrated game model with a base rate per-severity and risk multipliers for the things that actually go wrong (pirate points, hand-calcs, undercharged drive, mass mismatch, deferred maintenance, super-jumps).

---

## 1. Decision-to-jump timing

### Drive charged + at a standard jump point (Zenith / Nadir)

| Phase | Time |
|---|---|
| Astrogation confirmation, mass verification, system alignment, safety checks | 10–30 min (up to 12 h on tricky solutions) |
| Final clearance + commit | seconds |
| Translation itself | effectively instantaneous |

Practical sim window: **~20 minutes** for routine readiness.

### Drive charged + non-standard / pirate point
Hand-calcs and pirate-point precision push the prep into the **hours** range, with much higher misjump risk.

### Drive not charged
Bottleneck: **~7 days** standard solar-sail recharge. (Faster only with rare charging stations.) The "decision to jump" sequence itself is moot until charge is complete.

### Not at a jump point
JumpShips can only translate from Zenith / Nadir / pirate points — transit from a planet to a jump point under fusion thrust takes **days to weeks** depending on system.

### Recommended sim states

| State | Window |
|---|---|
| Standard readiness jump | 20 min |
| Emergency rapid jump | 5–10 min (raises misjump risk) |
| Unplanned (uncharged) | + ~7 days |

Once initiated, the jump program is effectively committed (only safety interlocks can abort).

---

## 2. Bridge-view lore

### Standard jump (the user-facing event the sim renders)

Pre-jump:
- Bridge lighting dimmed.
- K-F core hum deepens — felt more than heard.
- Faint static sensation; hair stands slightly on end.
- Electronics flicker at the edges of tolerance.
- Outside the viewport: deep space, still, usually far from the system's star.

Translation event:
- Stars **smear / lens / fold** — not warp-tunnel; more like gravitational lensing.
- Brief white or blue flash, sometimes perceived more internally than externally.
- A "snap" through the hull; pressure in the inner ear; momentary vertigo.
- Viewport black for a split second.
- Different stars.

Post-arrival:
- New starfield, no motion.
- Mild crew disorientation.
- Solar sail redeploys.
- Silence.

Total visual experience: **under 2 seconds**.

Cultural tone: ComStar treats jumps with ritual reverence. Veteran captains describe the experience as disconcertingly abrupt and almost spiritual — "humanity does not truly understand K-F physics."

### Suggested visual profile for the sim renderer

| Phase | Duration |
|---|---|
| Pre-distortion ripple | 0.5 s |
| Flash | 0.2 s |
| Blackout | 0.5 s |
| New starfield | (instant) |

### Misjump variants
Misjumps are physics-glitch territory, not explosions. The distortion **doesn't collapse cleanly**: the ripple turns turbulent, the flash becomes a roar of light (consoles overload, internal lights flicker, afterimages), sensory chaos lasts minutes instead of seconds. Severe misjumps can cause structural groaning, sheared docking collars, fused/fried equipment.

---

## 3. Misjump probability model (game-side)

There's no canon universal rate. Sarna treats serious misjumps as rare and memorable; super-jumps and pirate points are explicitly riskier. The model below is a **calibrated game model**, not canon.

### Base rates (everything nominal: standard jump point, charged drive, computer nav, accurate mass)

| Severity | Rate | One in N |
|---|---|---|
| Minor discrepancy (off but fine) | 0.05% | 1 / 2,000 |
| Serious misjump (dangerous) | 0.005% | 1 / 20,000 |
| Catastrophic (lost ship) | 0.0005% | 1 / 200,000 |

Divide by 10 if you want an even more "industrial reliability" feel.

### Risk multipliers (apply to the base serious-misjump rate; clamp at 1.0)

| Factor | Multiplier |
|---|---|
| **Jump point** — standard Zenith/Nadir | ×1 (baseline) |
| Pirate / nonstandard point | ×10 to ×50 |
| **Nav solution** — computer, normal | ×1 |
| Hand-calculated | ×5 |
| Rushed / incomplete verification | ×2 to ×10 |
| **Charge state** — fully charged | ×1 |
| 95–99% charged | ×2 (and bias toward "minor discrepancy") |
| < 95% charged | ×10 (unlocks catastrophic outcomes) |
| **Mass accounting** — accurate | ×1 |
| Mismatch (unaccounted cargo, unauthorized craft, collar fault) | ×5 to ×100 by severity |
| **Drive condition** — nominal maintenance | ×1 |
| Deferred maintenance / known minor fault | ×3 |
| Known serious fault / damaged coils | ×10 to ×50 |
| **Super-jump attempt** | ×10+ (and bias severity toward catastrophic) |

**Decision rule for the engine:** if you only want jumps to "roll" when something sketchy is happening, only roll when any multiplier > 1. Otherwise nominal jumps don't roll at all. (Alternative: always roll; nominal is so safe it almost never triggers.)

### Severity ladder when a misjump triggers

| Tier | Outcome | Player impact |
|---|---|---|
| Discrepancy | Off-position at intended destination, still in safe envelope | Time + fuel cost; small damage check |
| Hard misjump (survival) | Arrive in deep interstellar space, not at a system | Limp / get rescued / husband resources — strong story moment |
| Partial translation | Arrive damaged: lost collars, fried systems, possible casualties | Crippled but playable; needs repairs / escort |
| Catastrophic | Ship never reappears, or emerges inside something lethal | Game-over for that ship / campaign thread |

Misjumps should be **expensive but not auto-game-over**. The "hard misjump → survival scenario" tier is where the best emergent stories live.

---

## How this couples to existing systems

| Connection | What it provides |
|---|---|
| SYS-001 Time | Recharge timer, prep-window timer, all schedule against `SIM_TIME` |
| SYS-004 Map & Navigation | Jump destination, jump-point geometry, visualization of recharge state per ship |
| SYS-005 Order & Messaging | "Initiate jump" is an order with a declared time cost (per SPEC-001 §7) |
| SYS-006 Information & Knowledge | What other ships / factions know about a JumpShip's location and recharge state — useful for ambushes, pirate intel |
| SYS-009 Logistics & Readiness | Charge level, maintenance level, crew training, mass accounting — all live here |
| SYS-002 Characters | Astrogation skill of the navigator → rolls into "nav solution" multiplier |

Most of the failure-mode multipliers are **read** from SYS-009 state, then a single `attempt_jump(ship_id)` call rolls against the model and emits an event with the outcome.

---

## Open questions

1. **Standalone SYS-013 or sub-module?** Argument for standalone: jump operations touch enough independent state (charge, mass, nav, drive integrity, point geometry) that they read like a system. Argument against: every multiplier sources from existing systems, which is the signature of a sub-module.
2. **Public misjump rates** — does the player ever see the actual probabilities, or only flavor descriptors ("nominal", "elevated risk")?
3. **Abort semantics** — once the jump program is committed, what fraction of safety interlocks succeed in real failures?
4. **WarShip vs JumpShip vs DropShip-as-rider** — does the model differ structurally, or just by parameter?
5. **Era flavor** — Succession Wars vs Clan Invasion vs Jihad — does the model shift (e.g., Word of Blake super-jumps unlock late)?
