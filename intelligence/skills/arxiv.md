# ArXiv Skill

## Purpose
Fetch relevant research signals from ArXiv as an OpenClaw-native execution unit.

## Responsibilities
- Query ArXiv for new papers matching the target domains.
- Extract title, abstract, authors, publication date, and URL.
- Score relevance against the current SOUL memory.
- Emit normalized discovery records for persistence.

## Constraints
- Runs independently of the backend API.
- Must fail gracefully and return partial results when needed.