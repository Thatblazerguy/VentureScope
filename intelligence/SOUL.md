# SOUL

## Purpose
SOUL stores user intelligence for OpenClaw so the system can adapt discovery behavior over time.

## Memory Structure


```yaml
user_profile:
  domains: ["ai", "tech", "cloud"]
  interests: ["research"]
  exclusions: []
  risk_appetite: "medium"
  behavior_signals: []
  discovery_preferences: []
  last_updated: "2026-05-08T13:05:20.676Z"
```

## Usage Rules
- OpenClaw writes updates after each meaningful discovery cycle.
- The backend reads this file only for presentation and context.
- Domain and behavior signals should be appended as they evolve.
- Keep the schema simple and easy to extend.
