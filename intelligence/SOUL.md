# SOUL

## Purpose
SOUL stores user intelligence for OpenClaw so the system can adapt discovery behavior over time.

## Memory Structure


```yaml
user_profile:
  domains: ["cinema", "it", "ai", "lab grown meat"]
  interests: ["research"]
  exclusions: []
  risk_appetite: "medium"
  behavior_signals: []
  discovery_preferences: []
  last_updated: "2026-05-06T19:39:43.158Z"
```

## Usage Rules
- OpenClaw writes updates after each meaningful discovery cycle.
- The backend reads this file only for presentation and context.
- Domain and behavior signals should be appended as they evolve.
- Keep the schema simple and easy to extend.
