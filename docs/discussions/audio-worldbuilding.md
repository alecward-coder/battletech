# Audio worldbuilding — DropShip ambience & intercom

**Possible home system:** none currently. Could become a future SYS (audio / asset pipeline) or a sub-module of a UX/presentation system. **Decision deferred.**
**Source:** ChatGPT design conversation
**Status:** Exploratory — production workflow notes; no SYS ID or SPEC entry yet
**Conversation title (user's):** "BT – Audio Worldbuilding"

---

## TL;DR

For in-game ambient audio (DropShip interiors, intercom chatter, etc.) the user is using **Suno**. Suno is great at songs, **terrible at "boring utilitarian audio"** — it keeps musical-izing prompts that should be pure SFX. Two workarounds proven in this conversation:

1. **Reframe the prompt as an "industrial test tone / machinery noise" recording**, not "ambient music." This is the single biggest reliability win — it told Suno the output should be utility, not aesthetic.
2. **Split prompt fields** — Suno's `Content` field describes the recording; the `Lyrics` field carries the actual lines (no line breaks → less likely to be sung). Keep PA voice prompts in transcript style, not poem style.

For **layered DropShip ambience**, build a "kit" of separate single-purpose tracks (reactor hum, ventilation, electrical-cabinet whine, hull stress ticks, plus PA voice over the top). Stem extraction in Suno is expensive (50 credits per pull), so per-layer single-purpose generations save credits long-term.

For **House Davion intercom voice**, faction-name keywords sometimes trip Suno moderation. Reframe to "Federated Suns standard military comms" or, if that fails, drop faction-branding entirely and describe the cadence: "real duty officer on a long shift — calm, practical, slightly tired but focused — natural conversational cadence, not theatrical."

The user explicitly noted that the best long-term workflow is probably: **dedicated TTS tool for spoken lines + DAW for layering**, instead of fighting Suno into doing the wrong job. Suno is good for "background bed" generations once given the right industrial framing.

---

## DropShip ambient "kit" (layer concept)

Build the soundscape from independent layers, each generated separately and mixed in a DAW (Audacity, Reaper, etc.):

| Layer | Role | Always-on? |
|---|---|---|
| A — Reactor / drive hum | Low-frequency core hum, modulated subtly every 15–30 s | Yes |
| B — Life support / ventilation | Soft broadband airflow whoosh, faint pressure flutter | Yes |
| C — Electrical / avionics | Faint inverter whine, soft relay chatter, distant cooling fan | Yes (low volume) |
| D — Hull stress / thermal ticks | Sparse metal creaks every 20–60 s | Yes (sparse) |
| E — PA voice / intercom chatter | Periodic announcements, faint crew acknowledgements | No (1 every 1–4 min) |
| F — Tense moments | Klaxon, fault chirps, thruster rumble | Event-driven |

**Anti-music framing principle:** the more "industrial / diagnostic / compliance / test recording" language you give Suno, the more likely it stays non-musical. "Ambient" alone makes Suno reach for pads and chord progressions.

---

## Suno prompts that worked (constant-bed layers)

Each is designed as a separate generation. Keep them under Suno's character limit when pasting.

### Layer 1 — Reactor / drive hum (industrial framing)

```
Industrial machinery test tone recording (SFX), continuous low-frequency
generator rumble with faint transformer buzz and steady mechanical
resonance, like a safety compliance audio sample from a ship engine
room. Non-musical: no melody, no chords, no harmony, no pads, no rhythm,
no percussion, no tempo, no key center. Steady-state, minimal
modulation, seamless loop feel, 3–5 minutes.
```

### Layer 2 — Life support / ventilation

```
Industrial HVAC airflow calibration recording (SFX), constant filtered
broadband noise (pink-noise-like) with gentle ventilation whoosh, subtle
pressure variations, like a maintenance diagnostic capture inside a
metal corridor. Non-musical: no melody, no chords, no harmony, no pads,
no rhythm, no percussion, no tempo, no key center. Quiet, unobtrusive,
seamless loop feel, 3–5 minutes.
```

### Layer 3 — Electrical / avionics cabinet whine

```
Industrial electrical cabinet / avionics bay room tone (SFX), faint
high-frequency inverter whine, soft relay chatter barely audible,
distant cooling fan hiss, like an equipment-room diagnostic recording.
Non-musical: no melody, no chords, no harmony, no pads, no rhythm, no
percussion, no tempo, no key center. Steady continuous bed, seamless
loop feel, 3–5 minutes.
```

### Layer 4 — Hull stress / thermal ticks

```
Industrial structural stress monitoring audio (SFX), near-silent
background with rare metal ticks and distant creaks, like a
long-duration recording from sensors inside a large steel pressure
vessel. Non-musical: no melody, no chords, no harmony, no pads, no
rhythm, no percussion, no tempo, no key center. Sparse events every
20–60 seconds, subtle reverb, seamless loop feel, 3–5 minutes.
```

### "Anti-music" salvage line

Append if Suno still adds harmony:

```
This is NOT music, it is a technical diagnostic capture. Avoid
cinematic ambience.
```

---

## Suno prompts for PA / intercom (split fields)

Suno's interface has separate `Content` (description) and `Lyrics` (text to be performed) fields. PA voice works better when these are split deliberately.

### Content field (describes the recording)

```
Spacecraft PA/intercom SFX ambience: routine ship announcements with
faint crew replies. No singing. No music, no instruments, no beat.
Voice is natural and everyday—calm, practical, slightly tired, not
dramatic. Mild PA filter with light reverb and occasional mic click.
Loopable 2–4 min.
```

(Earlier wordings included "Federated Suns standard military comms"; that triggered moderation. Remove faction-name keywords if rejected.)

### Lyrics field (transcript style, NOT poem style)

For a House Davion DropShip in-transit, with BattleTech-flavored lines (JumpShip docking, K-F field, jump sails, HPG traffic, mech bay restraining gantries):

```
All hands, stand by for JumpShip docking ops.
Okay — collar teams, you're up. Verify seals and clamps are green.
Nav, confirm jump point clearance and the final solution upload.
Comms, keep it tightbeam until we're latched.
Engineering, just double-check K-F field containment for the attached craft.
Flight deck, we'll be doing small station-keeping thruster nudges — expect a little vibration.
Cargo, secure everything for micro-g handling. Mag-locks and tie-downs, please.
Mech bay, confirm restraining gantries are locked across all cradles.
No EVA unless you're cleared by the duty officer.
Jump sail ops are starting — stay clear of exterior routes.
Recharge cycle is running, so keep nonessential power draw down.
Stand by for undock. We'll equalize collar pressure on my mark.
Heads up: transit burn to primary is on schedule — strap in and secure loose gear.
Reminder: HPG traffic is queued. Don't request priority routing without command authorization.
Copy.
Roger.
Yeah, confirmed.
Affirmative.
```

**Voice-direction principle:** "calm, practical, slightly tired duty officer on a long shift" produces more believable intercom audio than "professional" or "clipped" — those make Suno output sound theatrical, like a movie trailer.

---

## Issues encountered & lessons

| Issue | Resolution |
|---|---|
| Suno keeps making it musical | Use "industrial test tone / machinery noise" framing, not "ambient music." Add explicit `no melody / no chords / no harmony / no pads / no rhythm / no percussion / no tempo / no key center`. |
| Suno still adds harmony | Append: *"This is NOT music, it is a technical diagnostic capture. Avoid cinematic ambience."* |
| Stem extraction is wasteful (50 credits per pull) | Per-layer single-purpose generations. Generate longer than needed; harvest 30–60 s of usable texture per gen; loop manually. |
| Faction-keyword moderation rejection ("House Davion / Federated Suns / military") | Drop faction names from prompts. Describe cadence and vibe instead. Use "service accent" or "duty officer" framing. |
| Voice still sings | Lyrics field with line-break-heavy text reads as "verses." Reformat as a single transcript paragraph. Replace some lines with `[muffled PA]`, `(unintelligible)` markers. |
| Voice sounds theatrical | Replace "professional, clipped, military comms" with "real duty officer on a long shift — calm, practical, slightly tired but focused, natural conversational cadence, not theatrical." Allow filler words and tiny self-corrections. |
| Suno character limit (500) | Short version: *"Spacecraft PA/intercom SFX ambience: routine ship announcements with faint crew replies. No singing. No music, no instruments, no beat. Voice is natural and everyday—calm, practical, slightly tired, not dramatic. Mild PA filter with light reverb and occasional mic click. Loopable 2–4 min."* |

---

## Recommended long-term workflow (per the conversation)

> *"It's an awesome tool for what it does, but the interface just sucks… I wish I could talk to it the same way I talk to you. I wish you could make sound for me."*

The cleanest path forward is to **stop fighting Suno**:

1. **Beds** — Suno (with industrial framing) is good for the constant-bed layers. Generate one long take per layer; stem-extract once; harvest loops + one-shots; reuse forever.
2. **PA voice** — use a dedicated TTS tool with promptable voice style. Generates intelligible spoken lines without the singing risk.
3. **Mixing** — DAW (Audacity / Reaper / Audition) to layer beds + voice + occasional event SFX (klaxons, thruster rumble).

Outcome: a small library of reusable assets (3–5 bed loops, 10–20 micro SFX one-shots, a TTS voice profile per faction). Future scenes are then **mixing problems, not generation problems**.

---

## Lore-grounded PA line bank (House Davion DropShip)

Useful in any TTS workflow. Drawn from established BattleTech terminology — JumpShip docking, jump points, jump sails, K-F drive/field, HPG traffic, mech bays.

### Routine transit
- "All hands, this is the duty officer. Routine systems check in progress."
- "Engineering, confirm coolant flow steady across primary loop."
- "Flight deck, verify burn window. Navigation, confirm solution."
- "Cargo bay, secure tie-downs. Safety inspection in ten minutes."
- "Comms discipline reminder: mission traffic only on channel two."
- "Corridor access is restricted near the docking collar. Thank you."

### Pre-jump / docking
- "All hands, stand by for JumpShip docking operations."
- "Approach vector confirmed — zenith jump point operations underway."
- "Docking collar teams, report to stations. Verify collar seals and clamp status."
- "Do not cycle the collar airlock during field operations."
- "Engineering, confirm K-F field containment parameters for attached craft."
- "Jump sail operations commencing — keep clear of exterior maintenance routes."
- "JumpShip recharge cycle is in progress; minimize nonessential power draw."

### Pre-drop / maneuvering
- "Attention all hands: strap in for thrust transition."
- "Maneuvering thrusters firing in three… two… one."
- "Secure hatches. Verify mag-locks in bays one through three."
- "Flight crew, final checks. Drop timing to follow."
- "Medical team to readiness stations."

### Acknowledgements (background)
- "Copy." / "Roger." / "Affirmative." / "Confirmed." / "Understood."

---

## Open questions (if/when this becomes a SYS)

1. **Asset bundle structure** — single library indexed by scene type, or per-DropShip-class (Leopard / Union / Overlord — each has different acoustic character: small-tight-whiny vs big-slow-deep-industrial)?
2. **Per-faction sound signatures** — does each Successor House get its own intercom voice profile, klaxon tone, comm-filter color? (House Davion's Federated Suns crispness vs Kurita's military formality vs Marik's parliamentary tone vs Steiner's Germanic precision vs Liao's measured authority.)
3. **Diegetic vs UI audio** — separate SYS, or one umbrella? Diegetic = "sounds the character could hear"; UI = beeps/alerts the player hears regardless of in-fiction position.
4. **Era flavor** — does audio shift by era (Star League polish vs Succession Wars decay vs Clan Invasion vs Jihad)?
5. **Where does this live in the architecture?** — possible homes: a new SYS-014 (Audio / Diegetic Soundscape), a sub-module of a future presentation/UI system, or just an `assets/audio/` library managed without a dedicated SYS.
