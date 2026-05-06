# SOUL

## Purpose
SOUL stores user intelligence for OpenClaw so the system can adapt discovery behavior over time.

## Memory Structure


```yaml
user_profile:
  domains: ["cricket"]
  interests: ["research"]
  exclusions: []
  risk_appetite: "low"
  behavior_signals: []
  discovery_preferences: []
  last_updated: "2026-05-06T12:25:51.102Z"
```

## Usage Rules
- OpenClaw writes updates after each meaningful discovery cycle.
- The backend reads this file only for presentation and context.
- Domain and behavior signals should be appended as they evolve.
- Keep the schema simple and easy to extend.
