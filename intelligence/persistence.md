# Direct Persistence

## Goal
Discovery results should be written directly from OpenClaw to Supabase.

## Flow
1. A skill produces normalized discovery records.
2. HEARTBEAT hands those records to the persistence step.
3. OpenClaw writes the records to Supabase without waiting on the backend API.
4. Markdown run logs are kept alongside the database write for auditability.

## Notes
- Supabase is the system of record for structured discoveries.
- The backend is a consumer of persisted data, not the execution path.
- Persistence should tolerate partial source failures and continue writing valid records.