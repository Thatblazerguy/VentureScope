# GitHub Skill

## Purpose
Fetch relevant repository and activity signals from GitHub as an OpenClaw-native execution unit.

## Responsibilities
- Query GitHub for repositories, issues, releases, and activity tied to target domains.
- Extract owner, repository, signal type, summary, date, and URL.
- Score relevance against the current SOUL memory.
- Emit normalized discovery records for persistence.

## Constraints
- Runs independently of the backend API.
- Must not require frontend interaction to complete.