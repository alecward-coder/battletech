# Entity-relationship diagram

```mermaid
erDiagram
    SIM ||--|| SYSTEMS : "shares SIM_TIME"
    CHARACTERS ||--o{ RELATIONSHIPS : "is source of"
    CHARACTERS ||--o{ GOALS : "owns"
    CHARACTERS ||--o{ MEMORIES : "remembers"
    CHARACTERS ||--o{ KNOWLEDGE : "believes"
    EVENTS ||--o{ MEMORIES : "may seed"
    EVENTS ||--o{ KNOWLEDGE : "ground truth for"
    EVENTS ||--o{ RELATIONSHIPS : "last_change_event_id"
    INFO_CHANNELS ||--o{ KNOWLEDGE : "delivered via"

    SIM {
        text key PK
        text value
    }
    SYSTEMS {
        int system_id PK
        text system_name
        real system_x
        real system_y
        int reveal_year
        int known_from_year
        int known_to_year
        text visibility_status
        text canon_certainty
    }
    CHARACTERS {
        text character_id PK
        text character_name
        text faction_id
        text role
        text status
        int stress
        int openness
        int aggression
        text voice_id
        text role_boundaries
        text knowledge_constraints
    }
    RELATIONSHIPS {
        text relationship_id PK
        text source_character_id FK
        text target_entity_id
        text target_entity_type
        int trust
        int respect
        int last_change_time
        text last_change_event_id FK
    }
    GOALS {
        text goal_id PK
        text character_id FK
        text goal_text
        int priority
        text visibility
        text status
    }
    MEMORIES {
        text memory_id PK
        text character_id FK
        text related_entity_id
        text event_summary
        int importance
        real decay_rate
        text source_event_id FK
    }
    EVENTS {
        text event_id PK
        int sim_time
        text actor_id
        text action_type
        text target_entity_id
        text payload_json
    }
    KNOWLEDGE {
        text knowledge_id PK
        text character_id FK
        text fact_type
        text subject_entity_id
        text claimed_value
        text ground_truth_event_id FK
        real confidence
        text source_channel_id FK
        int learned_time
        real staleness_rate
    }
    INFO_CHANNELS {
        text channel_id PK
        text channel_type
        int latency_ticks
        real fidelity
        int cost
    }
```

Tables in **bold** below are not yet in the live sheet — they're the SYS-006
additions documented here so the schema is unambiguous when we implement them:

- `events`, `knowledge`, `info_channels`
