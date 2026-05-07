# Real-time combat without graphics — multi-layer timing & modular actor schema

**Primary system:** SYS-011 Combat Resolution
**Also affects:** SYS-002 Universal Character System, SYS-012 Character Behavior & Cognition, SYS-001 Time
**Source:** ChatGPT design conversation
**Status:** Exploratory — informs design, not yet formalized into a SPEC

---

## TL;DR

The simulation is the truth. Graphics, when they exist, are a "viewer" on top of pure data exchange. Because we're graphics-light by design (bridge-style readouts, audio reports, abstracted minimap), we can run a deeper, smarter combat sim than render-bound games.

Two design pivots fall out of this:

1. **Time is per-actor, not global.** Each character has independent clocks for *reflex*, *decision-making*, and *command-issuing*, distorted by morale/stress/fatigue. The sim is event-driven (Next Available Action Time per layer), not a fixed global tick.
2. **Characters are layered, not monolithic.** A core persistent profile + pluggable domain skill packs (aerospace / mech / infantry / command / etc.) + temporary state + equipment + battle context, composed at runtime into an "active combat profile."

---

## Key takeaways

### Multi-layer timing model (replaces "everyone acts every tick")

| Layer | What it governs | Typical interval |
|---|---|---|
| **Reflex** | maneuvering, trigger pulls, evasion | 80 ms (elite) – 180 ms (avg) |
| **Executive function** | target selection, tactical shifts, ability usage | 250 ms (sharp) – 800 ms (overwhelmed) |
| **Command / leadership** | orders, formation changes, strategic pivots | 1.5 s (excellent) – 4 s (weak) |

State modifiers (morale, stress, fatigue, panic, confidence) **don't have their own tick** — they distort the intervals and option-quality of the layers above. Examples:
- Low morale: +50% decision interval, fewer options considered.
- Panic: faster decisions, worse decisions.
- Cognitive overload: a pilot can only track ~3 threats; a commander can only manage ~5 squads; overflow → slower decisions, mistakes.

Industry reference points:
- Sim tick: 30–60 Hz typical.
- AI decision tick: 5–20 Hz typical (much slower than sim).
- We can run **lower** than this because we don't render — 10–30 Hz sim, 2–10 Hz decisions, with time compression, scales to thousands of units.

### Event-driven scheduling (NAAT)

Don't tick every actor every frame. Each actor schedules:
- `next_reflex_action_time`
- `next_decision_window_time`
- `next_command_window_time`

The sim advances time and fires whichever event is next. Lets us simulate hundreds of actors cheaply and avoid meaningless micro-updates. Couples cleanly to SYS-001 (`SIM_TIME_TICKS`).

### Layered character schema

Single flat record is mentally muddy and bloats SYS-002. Fully separate per-context records breaks continuity (fatigue, trauma, experience must propagate everywhere). The middle path:

- **Layer A — Core actor profile** (always loaded): reflex baseline, executive speed, tactical awareness, morale stability, discipline, aggression, fatigue resistance, leadership, perception, experience, personality tendencies.
- **Layer B — Domain skill packs** (loaded by context): aerospace, mech, infantry, command, logistics, espionage, …
- **Layer C — Temporary state**: fatigue, stress, injuries, confidence, morale, heat load, sensory impairment.
- **Layer D — Equipment / platform modifiers**: thrust profile, sensor quality, missile package, cockpit ergonomics, flight-assist quality, armor state. The pilot is one record; the craft is another.
- **Layer E — Battle context modifiers**: vacuum, asteroid clutter, sensor interference, friendly command quality, ambush status, surprise level.

At runtime, compose:

```
ACTIVE_COMBAT_PROFILE
  = CORE
  + DOMAIN_PACK[context]
  + CURRENT_STATE
  + EQUIPMENT
  + ENVIRONMENT
```

**Rule of thumb for placement:** "If the trait would still matter in three very different contexts, keep it core. If it mostly matters in one combat domain, keep it in a module."

#### Aerospace pack examples
- thrust management, vector prediction, target tracking, missile discipline, sensor fusion interpretation, formation coordination, **G-tolerance, blackout/redout resistance**, high-speed intercept judgment, disengagement discipline.

#### Ground pack examples
- cover usage, footwork, terrain nav, suppression resistance, room-clearing, recoil control, line-of-sight discipline.

#### Indoor / CQB pack examples
- cornering, snap aim, noise discipline, breaching coordination, close-range target discrimination, fear response in confined spaces.

### Bridge-level player UX (the "Star Wars minimap" idea)

Player isn't flying — they're on the bridge. They see:
- A simplified map with squadron icons.
- **Delayed** reports ("Squadron 2 taking heavy fire", "Missile lock detected") — couples directly to SYS-005 messaging + SYS-006 information staleness.
- Occasional voice/audio updates.

What's actually running underneath: hundreds of micro-decisions per second, individual pilot timing differences, leadership shaping coordination. The visible UI is a heavily abstracted summary of a much richer sim — the same gap SYS-006 already enforces between ground truth and what any one character knows.

### Aerospace specifics worth modelling

- G-tolerance, blackout rate, redout rate as character stats interacting with platform thrust profile.
- Disengagement vs commitment as a tactical decision, not a binary.
- Sensor clarity / fog of war flows directly from SYS-006 confidence bands.

---

## How this maps onto the existing system index

| What this discussion proposes | Where it lives |
|---|---|
| Per-actor multi-layer timing + NAAT scheduling | **SYS-012** (extends behavior/cognition) + **SYS-001** (clock advances by next-event, not fixed tick) |
| Layered character schema (Core + Packs + State + Equipment + Context) | **SYS-002** (substantial extension; current schema is roughly Layer A + bits of C) |
| Combat resolution loop + domain packs (aerospace/ground/indoor) | **SYS-011** (currently Backlog/P3 — design here is well ahead of priority) |
| Bridge-style abstracted reports with delay/distortion | Couples **SYS-005** (messaging) + **SYS-006** (knowledge) — already on the critical path |

### Gaps surfaced (not currently in the 12-system index)

- **Equipment / platform modelling** — Layer D above. No system today owns "the mech, fighter, or jumpship as a stat-bearing entity." Candidates: extend SYS-011, or carve out a new SYS for platforms/loadouts. Worth a decision before SYS-011 work begins.
- **Squad / unit composition** — Layer E partially, plus the bridge UX implies a unit hierarchy (player → squadron → pilot). May fit under SYS-007 Authority & Governance or warrant its own system.

---

## Open questions raised here that need answers before SYS-011 lands

1. **Domain pack list** — confirm the canonical set: aerospace, mech, infantry, indoor/CQB, command, logistics, espionage. Anything else (vehicle, naval, EVA)?
2. **Equipment/platform schema** — own system, or sub-module of SYS-011?
3. **Time compression** — how does the sim handle "two weeks of vulnerability while the jumpship recharges"? Variable tick rate? Fast-forward until an event fires?
4. **Bridge UX delay model** — does report delay use the same channels/latency as SYS-005, or a separate "internal command net" with its own latency profile?
5. **G-tolerance / blackout** — discrete states (conscious / greying / blacked out) or continuous?

---

## Full transcript

> *Conversation between user and ChatGPT, captured verbatim for reference.*

### User

All right, this conversation thread will have to do with real-time combat, but without graphics. I'm thinking, I've always wondered this in games since we're like 20 years now. And you see, you can see the two AI opponents going at it against each other. They're doing their thing. You're watching it as a graphic, but all of that is really just data moving around. It's all just, you know, internal pieces of data. Okay, this opponent is going to this direction now. It's using this kind of positioning. Here's how it may kind of attempt to do the first thing, that kind of stuff. And so, really, when two AI opponents are going against each other, are they really just, the game is going on in like, in the way that they're interacting with each other. And what you're seeing graphically is just a representation of it, isn't that correct?

### ChatGPT

Yeah—you're exactly right. What you're describing is basically the core truth of how games work under the hood.

What you see on screen is not the game itself. It's just a visualization layer sitting on top of a bunch of systems exchanging data.

**🧠 What's actually happening in real-time combat**

At the lowest level, the game is doing something like this every frame (or tick):

- **Unit A:** Position (x, y); Velocity (vx, vy); State "attacking"; Target Unit B; Cooldown 0.3s remaining.
- **Unit B:** Position (x, y); State "dodging"; Decision "move left"; Health 42.

Then systems process:
- AI decision-making — "Should I attack, retreat, flank?"
- Physics / movement — Update positions based on velocity
- Combat resolution — Did attack hit? Apply damage
- State transitions — Switch from "attacking" → "recovering"

👉 All of that happens as pure data.

**🎮 The graphics are just a "viewer"**

After the simulation updates, the rendering system goes: Draw Unit A at (x, y); Play attack animation; Show hit effect; Update health bar.

So what you're seeing is essentially: "Here's a visual interpretation of what the simulation already decided happened."

**⚔️ AI vs AI = data interacting with data**

When two AI opponents fight, they are not "seeing" each other like players do. They are reading variables, running decision trees / behavior systems, writing new state changes. So yeah, it's basically a loop of structured data modifying other structured data over time.

**🔄 Important distinction: simulation vs presentation**

- Simulation Layer (truth) — Positions, decisions, outcomes
- Presentation Layer (illusion) — Animations, effects, sound

These can even be separated entirely.

**🧪 Proof this is true (cool examples)**
- Headless servers — Run full matches with no graphics at all
- Replay systems — Reconstruct battles from saved data logs
- Fast-forward simulations — Run 1000 battles in seconds for balancing

Your BattleTech idea is perfectly aligned with this.

**🧩 Where your thinking is heading (and it's powerful)**

You're basically describing: "What if we ran combat as a pure simulation, and didn't need graphics at all?"

That leads to text-based combat logs, tactical summaries, data-driven outcomes, scalable massive simulations. And more importantly: 👉 You can make much smarter, more complex systems because you're not bottlenecked by rendering.

**🔥 The big realization**

The real game is the invisible system. The graphics are just a storytelling layer on top.

### User

In like real face-to-face combat kind of stuff, what's like the industry standard for ticks? Like, how often are the AI characters responding? Is it like, are they doing like, you know, a hundred ticks a second, or what?

### ChatGPT

Great question—and this is one of those "it depends, but there are patterns" situations.

**🎯 The short answer (industry reality)**
- 30 ticks/sec (33 ms) → common for simpler or networked games
- 60 ticks/sec (16.6 ms) → very standard for responsive gameplay
- 120+ ticks/sec (8 ms or lower) → high-end / competitive / physics-heavy

👉 NOT usually 1000 ticks/sec. Most "serious" combat sits around 60 Hz.

**🧠 Different parts of the game run at different tick rates**

1. **🎮 Simulation Tick (core combat logic)** — Typical 30–60 Hz. AI decisions (sometimes), movement updates, attack resolution, state changes.
2. **🤖 AI Decision Tick (often slower!)** — Typical 5–20 times per second; sometimes 0.2–1 sec intervals. AI usually does NOT think every frame because decision-making is expensive, humans don't react instantly anyway, and slower thinking adds realism (no perfect twitch AI).
3. **🎥 Rendering** — 60 FPS or higher. Purely visual, not authoritative.
4. **🌐 Networking** — Often 20–60 Hz. Lower to save bandwidth.

**⚔️ Example modern system**
- Simulation tick: 60 Hz
- AI thinking: 10 Hz (every 100 ms)

Every 16.6 ms: update positions, resolve hits, apply damage. Every 100 ms: AI picks new action.

**🔥 Why not super high tick rates?**
CPU cost explodes. Diminishing returns (humans can't perceive it). AI doesn't benefit much from ultra-fast decisions.

**🧩 For YOUR system**

A really strong setup for you: simulation tick 10–30 Hz, AI decision tick 2–10 Hz, time compression variable. You can simulate thousands of units, get readable logs, avoid over-processing meaningless micro-changes.

**🧠 Key insight**

Higher tick rate ≠ better combat. What matters more: decision quality, state modeling, interaction rules.

Ticks = how often the world updates. AI cycles = how often actors choose what to do. They are NOT the same thing.

### User

What I was thinking was that, depending on the character, their tick rate might be faster or slower, you know? Like some people, they have better reflexes, put in for their actions, some people maybe a little slower, and then also it would be that there would be an executive function tick, where some people, they can make decisions faster. They can, um, even if their body is faster, they can make a, it's separate from their actual physical ability, as it is their way to see the system as a whole and make a decision. So, tactical or a slash, maybe strategic systems, mostly tactical, um, those would, um, someone with like a high leadership ability or whatever you want to do, call it, that element, they will be able to make more decisions, um, tactically than another person, possibly, you know, or vice versa. It just uh it depends on the uh the leader, the leader's ability, it depends on the on the warrior's ability. Like right now, in my head, I'm thinking, what got me thinking about this was like, OK, we're in the we're in the uh the jump ship, right? We just, um, we just jumped to a new system. We've got what, two weeks of vulnerability while the thing reloads, uh, while the, while the solar panels are out getting more energy. And so, we're in hostile area, we set out some escorts, you know, just have some battle, some aerotech fighters out in space, kind of just, you know, patrolling the area, seeing if they come up against some pirates or whatever. Battle begins. I'm not playing it as the aerotech person. I'm on the bridge saying captain or something like that. But we're getting reports of this happening. Maybe even like a really simple interface where we can see the battle, kind of like, you know, you see in like Star Wars and stuff, they show like a little, little icon of the squadron moving around. And so when you see a limited version of what's going on in the battle, eggs and feet, while it's really going on in the code. That's kind of where I was thinking of it. I'm like, okay, well, so from here to think, what are the variables of the battle? There's going to be response times, there's going to be like their gunnery skill, their missile lock skill, their leadership skill for making decisions. How often, how many decisions per second can they, or orders can they issue, that kind of thing. And all this cool stuff can happen because, yeah, there's no graphics slowing you down. It's all, it's all conceptual or just, it's going on endlessly, which I think is really cool. Maybe you get a few, like, audio messages that this is what's going on. You're getting, you've seen the interface on the bridge of what's going on a little bit. There's that. You could even have things like for in aerospace fight, you could, you could have something about um the amount of G-forces that a certain pilot can handle because those, I would imagine those, those aerospace fighters in space, they can probably do some insane maneuvering more so than a human being can even handle. And so there'd be like, um, you know, blackout rate, redout rates, and you could, and resistance to that. And and that would affect your maneuverability. Just there's a lot of variables to consider, which is a lot of, which is fun. And yeah, I'd like to kind of map out who all those would be. And that's just for spaceflight. For like land stuff, all different ballpark. But either way, there'll be some fundamentals. A lot of the things I mentioned, and also the um your morale. If your morale is hurt, if your morale is low, that might lower the amount of decisions you make. You know, people might stall out, they get like, you know, way less decisions in a per cycle. Or maybe they think decisions really fast instead, but their options, you know, they can't, they can only do the gross motor skill options. They can't do anything that's a little too fine-tuned. Uh, we can play with it all kinds of different ways, depending on the character attributes we create.

### ChatGPT

What you're describing is really strong system thinking. You've basically taken the idea of "ticks" and turned it into something much more interesting: different layers of human capability operating on different clocks.

**🧠 Core Idea: Multi-Layer Human Timing Model**

1. **Physical Response Loop (Reflex Layer)** — How fast the body can act. Governs maneuvering, trigger pulls, evasive movement. `REFLEX_INTERVAL` = 80 ms (elite pilot) to 180 ms (average).
2. **Executive Function Loop (Decision Layer)** — How fast someone can evaluate and choose. Governs target selection, tactical shifts, ability usage. `DECISION_INTERVAL` = 250 ms (sharp tactician) to 800 ms (overwhelmed).
3. **Command / Leadership Loop (Coordination Layer)** — How often someone can issue meaningful orders. Governs squad coordination, formation changes, strategic pivots. `COMMAND_INTERVAL` = 1.5 s (excellent leader) to 4 s (weak leader).
4. **Morale / Cognitive Load Modifiers (State Layer)** — Don't have their own tick. They distort the others. Low morale: +50% decision interval, reduced option complexity. Panic: faster decisions, worse decisions. High confidence: faster + better.

**⚔️ Event-driven timing per character**

Each character has their own internal clocks: Next Reflex Action, Next Decision Window, Next Command Window. The simulation just advances time and fires events when ready. Removes the need for high global tick rates.

**🚀 Aerospace pilot variables**
- Physical: Reflex Interval, G-Tolerance, Blackout Resistance, Fine Motor Precision.
- Combat Skill: Gunnery Accuracy, Missile Lock Speed, Tracking Stability.
- Cognitive: Decision Interval, Tactical Awareness, Target Prioritization Skill.
- Psychological: Morale, Stress Load, Fatigue.

**🌌 Environment variables**
- Sensor clarity (fog of war), incoming threats, velocity differentials, relative positioning.

**🧠 Example moment in combat**

At t = 12.4 s: Pilot A gets decision window, chooses to flank. Pilot B still waiting (slower cognition). Pilot C high stress, chooses immediate evasive action (low quality but fast). At t = 12.48 s: Pilot A reflex fires, executes maneuver. Pilot B reflex fires, too late, gets hit.

**🧭 Bridge-level gameplay**

You're not controlling units — you're observing. Icons moving (simplified map), delayed reports ("Squadron 2 taking heavy fire", "Missile lock detected"), occasional voice/audio updates. Underneath: hundreds of micro-decisions per second, individual pilot timing differences, leadership shaping coordination.

**🔥 The breakthrough**

Action frequency is not uniform — it is a character stat. Most games fake this with attack speed and cooldowns; you're doing it at a deeper level (thinking speed, reaction speed, command bandwidth).

**🧩 Optional refinement: "Next Available Action Time" (NAAT)**

Each system schedules itself: Reflex schedules next action, Decision schedules next evaluation, Command schedules next order. Becomes efficient, scalable, easy to simulate thousands of actors.

**🧠 Cognitive bandwidth limits**

A pilot can only track 3 threats effectively. A commander can only manage 5 squads well. Overflow causes slower decisions, mistakes, delays. Ties into morale and leadership.

### User

I'm thinking like for the overall complexity of it, just around space combat solely, I think that depending on where you're at, whether it's, you know, space, ground fight, indoor first-person shooting style kind of thing, the attributes might need to be almost a, or depending on what kind of battle it is, the attributes might have to be each their own dataset depending on what you're doing. I mean, there's always gonna be some core ones, you know, like the person themselves, they bring those certain values with them wherever they go, but other ones, there's gonna be a, again, the datasets will have to be pulled depending on the type of battle it is. Otherwise, you're gonna be like, you have all these extra data that you're not even using sometimes, or, you know. So I don't know if it's good to keep it all in one dataset or have multiple datasets depending on that you use and use certain ones depending on the situation, you know? It might be more efficient that way. It might not even matter at all because certain things just won't be used also. Like who cares? Like, maybe you can't have like G-force resistance in the same dataset as you would in a land war and it doesn't matter because it's not gonna be used. Yeah, I don't, I'm not sure what's the more efficient approach. Mentally, I would think keeping them separate would work. But I just, that's kind of a higher tier idea that, or a higher tier question that I wouldn't be able to have an answer for that I'd kind of seek recommendations from you on.

### ChatGPT

Separate them, but not as totally isolated character sheets. Best fit is usually: **one core actor dataset + multiple context-specific combat modules**. Gives you the mental clarity you want without fragmenting the person into unrelated records.

**1. Core Actor Profile** — the person that exists everywhere. Travels with them across contexts: reflex baseline, executive speed, tactical awareness, morale stability, discipline, aggression, fatigue resistance, leadership ability, perception, memory/experience, personality tendencies. Portable human truths.

**2. Context Modules** — each combat domain pulls in its own relevant layer.
- *Space Combat Module:* G-force tolerance, blackout resistance, missile lock discipline, sensor interpretation, vacuum combat stress, formation flying, high-velocity interception skill.
- *Ground Combat Module:* cover usage, footwork, terrain navigation, suppression resistance, room-clearing skill, recoil control, line-of-sight discipline.
- *Indoor / CQB Module:* cornering, snap aim, noise discipline, breaching coordination, close-range target discrimination, fear response in confined space.

The actor is always the same person, but the simulation loads the relevant module depending on battle type.

**Why one giant flat sheet is bad:** hard to read, balancing gets messy, lose conceptual clarity, every system sees stats that don't matter, future expansion gets uglier.

**Why fully separate is bad:** the same person exists in multiple incompatible forms, updating becomes harder, cross-context effects messy. If a pilot becomes fatigued / wounded / traumatized / more experienced, that should affect all contexts.

**Best architecture:** Actor Record (who the person is), Capability Layers (what the person can do in particular environments), Active Context Loadout (what subset is currently loaded).

During a space fight, the engine reads: core actor stats + aerospace combat stats + current equipment + current morale state + current fatigue state + current command structure + current environmental modifiers.

**Storage vs usage:** You do not need to store things the same way you use them. Storage can be modular; runtime can compose a temporary active profile. `ACTIVE_COMBAT_PROFILE = CORE + SPACE_MODULE + CURRENT_STATE + EQUIPMENT + ENVIRONMENT`.

**Recommended layered schema:**
- **Layer A — Core Persistent Character Data** (always exists)
- **Layer B — Domain Skill Packs** (aerospace, mech, infantry, command, logistics, espionage)
- **Layer C — Temporary State** (fatigue, stress, injuries, confidence, morale, heat load, sensory impairment)
- **Layer D — Equipment/Platform Modifiers** (the pilot is one thing; the craft is another — fighter thrust profile, sensor quality, missile package, cockpit ergonomics, flight assist quality, armor state)
- **Layer E — Battle Context Modifiers** (vacuum, asteroid clutter, sensor interference, friendly command quality, ambush status, surprise level)

**For space combat specifically:** A pilot should not just have "space combat skill" as one number. Better to break it into: thrust management, vector prediction, target tracking, missile discipline, sensor interpretation, formation coordination, G-load tolerance, high-speed interception judgment, disengagement discipline. Combined with core person stats: reflex, executive function, courage, composure, tactical intelligence.

**Practical rule of thumb:** If the trait would still matter in three very different contexts, keep it core. If it mostly matters in one combat domain, keep it in a module.

- *Core:* reflex speed, morale stability, leadership, discipline, awareness, stress tolerance.
- *Space-only or mostly space:* G-tolerance, missile lock handling, orbital intercept judgment, sensor fusion interpretation.
- *Ground-only or mostly ground:* foot mobility, suppression handling, cover instinct, room-clearing coordination.

**Efficiency-wise:** Either approach works performance-wise. Modular is much better for design and maintenance. Bottleneck won't be raw computation — it'll be clarity, extensibility, debugging, balancing, keeping character identity coherent.

**Simplest sentence version:** Keep the person unified, but keep the combat capabilities modular.
