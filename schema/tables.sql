-- BattleTech sim schema, derived from the live Google Sheet
-- "BattleTech (Game)" (id 1nr-9ln8iWfK_ajDYpi7csVOfvfJKy_5IUxUrgB7EfD4).
--
-- The sheet is the system of record; this file documents the columns and types
-- so the schema travels with the codebase and can be diffed in PRs.
-- Foreign keys are documented but not enforced (Sheets has no constraints).

-- ============================================================================
-- SYS-001 Time & Simulation Clock
-- ============================================================================

CREATE TABLE sim (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
-- Seed: ('SIM_TIME_TICKS', '21367229774')

-- ============================================================================
-- SYS-004 Map & Navigation
-- ============================================================================

CREATE TABLE systems (
    system_id         INTEGER PRIMARY KEY,
    system_name       TEXT    NOT NULL,
    system_x          REAL    NOT NULL,
    system_y          REAL    NOT NULL,
    reveal_year       INTEGER,
    known_from_year   INTEGER,
    known_to_year     INTEGER,
    visibility_status TEXT,    -- 'normal' | 'hidden' | 'lost' | ...
    canon_certainty   TEXT,    -- 'canon' | 'inferred' | 'apocryphal'
    source_note       TEXT
);

-- ============================================================================
-- SYS-002 Universal Character System
-- ============================================================================

CREATE TABLE characters (
    character_id          TEXT PRIMARY KEY,
    character_name        TEXT NOT NULL,
    faction_id            TEXT,
    role                  TEXT,
    status                TEXT,    -- 'active' | 'inactive' | 'deceased' | ...
    -- Mutable state
    mood                  TEXT,
    stress                INTEGER, -- 0-100
    condition             TEXT,    -- 'healthy' | 'wounded' | ...
    -- Personality (0-100)
    openness              INTEGER,
    aggression            INTEGER,
    humor                 INTEGER,
    idealism              INTEGER,
    trauma_level          INTEGER,
    discipline            INTEGER,
    social_warmth         INTEGER,
    talkativeness         INTEGER,
    -- Voice / expression
    voice_id              TEXT,
    accent_style          TEXT,
    speech_rate           TEXT,    -- 'slow' | 'medium' | 'fast'
    formality             TEXT,    -- 'low' | 'medium' | 'high'
    warmth                TEXT,
    roughness             TEXT,
    radio_effect          TEXT,    -- e.g. 'comms_filter'
    cadence               TEXT,    -- 'short' | 'long' | ...
    preferred_sentence_length TEXT,
    -- Conversational style
    emotional_openness    TEXT,
    directness            TEXT,
    confidence_style      TEXT,
    humor_usage           TEXT,
    sarcasm_usage         TEXT,
    -- LLM / behavior constraints
    role_boundaries       TEXT,
    knowledge_constraints TEXT
);

-- ============================================================================
-- SYS-002 / SYS-012 Relationships
-- ============================================================================

CREATE TABLE relationships (
    relationship_id        TEXT PRIMARY KEY,
    source_character_id    TEXT NOT NULL,  -- FK characters.character_id
    target_entity_id       TEXT NOT NULL,
    target_entity_type     TEXT NOT NULL,  -- 'player' | 'character' | 'faction' | ...
    -- Affect (0-100)
    trust                  INTEGER,
    respect                INTEGER,
    affection              INTEGER,
    resentment             INTEGER,
    fear                   INTEGER,
    loyalty                INTEGER,
    attraction             INTEGER,
    suspicion              INTEGER,
    -- Provenance
    last_change_time       INTEGER,        -- SIM_TIME tick
    last_change_event_id   TEXT            -- FK events.event_id (added in SYS-006)
);

-- ============================================================================
-- SYS-012 Goals
-- ============================================================================

CREATE TABLE goals (
    goal_id           TEXT PRIMARY KEY,
    character_id      TEXT NOT NULL,        -- FK characters.character_id
    goal_text         TEXT NOT NULL,
    priority          INTEGER,              -- 0-100
    time_horizon      TEXT,                 -- 'short' | 'medium' | 'long'
    visibility        TEXT,                 -- 'public' | 'secret'
    status            TEXT,                 -- 'active' | 'completed' | 'abandoned'
    created_time      INTEGER,
    last_updated_time INTEGER,
    related_entities  TEXT                  -- pipe-delimited 'type:id' list
);

-- ============================================================================
-- SYS-012 Memories
-- ============================================================================

CREATE TABLE memories (
    memory_id          TEXT PRIMARY KEY,
    character_id       TEXT NOT NULL,       -- FK characters.character_id
    related_entity_id  TEXT,
    event_summary      TEXT NOT NULL,
    emotion_tag        TEXT,                -- 'pride' | 'fear' | ...
    importance         INTEGER,             -- 0-100
    created_time       INTEGER,
    last_recalled_time INTEGER,
    long_term_flag     INTEGER,             -- 0/1
    decay_rate         REAL,                -- importance lost per tick (unrecalled)
    source_event_id    TEXT                 -- FK events.event_id (added in SYS-006)
);

-- ============================================================================
-- SYS-006 Information & Knowledge — to be added in Phase B
-- ============================================================================

-- Append-only ground-truth ledger. Every state-changing action writes a row.
CREATE TABLE events (
    event_id          TEXT PRIMARY KEY,
    sim_time          INTEGER NOT NULL,    -- SIM_TIME tick
    actor_id          TEXT,                -- character_id or 'system'
    action_type       TEXT NOT NULL,
    target_entity_id  TEXT,
    target_entity_type TEXT,
    payload_json      TEXT,                -- arbitrary structured payload
    ground_truth_flag INTEGER NOT NULL DEFAULT 1
);

-- Per-character beliefs. NPCs read from `knowledge`, never directly from `events`.
CREATE TABLE knowledge (
    knowledge_id          TEXT PRIMARY KEY,
    character_id          TEXT NOT NULL,    -- FK characters.character_id
    fact_type             TEXT NOT NULL,    -- e.g. 'system_owner', 'character_location'
    subject_entity_id     TEXT NOT NULL,
    claimed_value         TEXT,             -- what the character believes
    ground_truth_event_id TEXT,             -- FK events.event_id (NULL if rumor)
    confidence            REAL,             -- 0.0-1.0
    source_character_id   TEXT,             -- who told them (NULL if firsthand)
    source_channel_id     TEXT,             -- FK info_channels.channel_id
    learned_time          INTEGER,
    staleness_rate        REAL,             -- confidence loss per tick (no recall)
    distortion_pct        REAL              -- 0.0-1.0; how distorted vs ground truth
);

-- Information transmission channels (HPG, courier, rumor, in-person, ...).
CREATE TABLE info_channels (
    channel_id     TEXT PRIMARY KEY,
    channel_type   TEXT NOT NULL,           -- 'hpg' | 'courier' | 'rumor' | 'in_person'
    latency_ticks  INTEGER NOT NULL,        -- delivery delay
    fidelity       REAL    NOT NULL,        -- 0.0-1.0 (chance per hop of preserving truth)
    cost           INTEGER,                 -- C-Bills per message
    notes          TEXT
);
