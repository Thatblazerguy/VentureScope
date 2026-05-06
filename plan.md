# 🚀 VentureScope: OpenClaw-Native Implementation Plan (Decoupled)

## 1. Core Philosophy: Total Structural Decoupling
VentureScope is an **OpenClaw-native** autonomous intelligence system where the Frontend, Backend, and Intelligence layers are physically and logically separate.
- **The Brain (OpenClaw):** Sovereign agent runtime that manages all autonomous execution.
- **The API (Backend):** A stateless Node.js/Express bridge between the data layer and the client.
- **The UI (Frontend):** A standalone React application focused on visualization and agent interaction.

## 2. Mandatory Components
### 2.1 HEARTBEAT.md (The Engine)
- **Weekly Pipeline:** Autonomous execution of data ingestion, gap scoring, and brief generation regardless of whether the UI or API is active.
- **Zero-Input Logic:** All system intelligence is triggered via OpenClaw HEARTBEAT—no manual execution exists.

### 2.2 SOUL.md (User Intelligence Layer)
- **Memory Storage:** Holds user domains, risk appetite, and behavioral history for agent context.
- **Agent Authority:** The agent writes to this memory, and the Backend merely reads it for the UI.

### 2.3 OpenClaw Skills (Execution Units)
- **Modular Integration:** All external scrapers (ArXiv, GitHub, ProductHunt) are implemented as OpenClaw Skills, not backend services.

## 3. Corrected System Architecture
- **L1 — Intelligence Layer (OpenClaw):** Executes Skills, maintains SOUL.md, and runs HEARTBEAT loops.
- **L2 — Storage Layer:** Supabase for global data and Markdown logs for pipeline state.
- **L3 — API Layer (Backend):** Stateless Node.js + Express handling only frontend requests and Copilot streaming.
- **L4 — UI Layer (Frontend):** React + Vite + D3.js visualization purely for displaying agent logic.

## 4. Feature Reframing
### 4.1 Gap Radar (Autonomous)
- **Execution:** Part of OpenClaw’s autonomous pipeline via scheduled HEARTBEAT runs.
- **Logic:** Compares research breakthroughs vs. market trends to score "Unrealized Potential".

### 4.2 Investor Intelligence
- **Extraction:** Signals are pulled by OpenClaw Skills and mapped during agent execution to the database.

### 4.3 Venture Copilot
- **Decoupled Stream:** UI requests context through the Backend, which fetches memory from OpenClaw-managed SOUL.md.

### 4.4 Weekly Digest
- **Agent Delivery:** Fully automated through OpenClaw multi-channel capabilities without user prompts.
