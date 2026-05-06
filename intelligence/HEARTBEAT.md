# HEARTBEAT

## Purpose
HEARTBEAT is the autonomous OpenClaw loop that runs discovery without depending on the API or UI being online.

## Execution Flow
1. Load the current SOUL memory state.
2. Run source discovery skills for ArXiv and GitHub.
3. Normalize discoveries into the shared result shape.
4. Persist results directly to Supabase.
5. Record the run state in Markdown for traceability.

## Operating Rules
- No step requires the backend API to be running.
- The pipeline must be callable on a schedule or by OpenClaw directly.
- Failures in one source should not block the other source from running.
- Every run should be idempotent where possible.

## Outputs
- Discovery results
- Run status
- Memory updates
- Persistence confirmation