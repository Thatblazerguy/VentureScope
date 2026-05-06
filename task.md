[x] Directory Splitting: Create /frontend, /backend, and /intelligence (OpenClaw) as root-level directories.
  [x] Environment Management: Set up .env in the backend for Supabase/LLM keys and .env.local in the frontend for VITE_API_URL.

[x] HEARTBEAT Logic: Configure HEARTBEAT.md to run the discovery pipeline without any dependency on the API being online.
[x] SOUL Schema: Initialize the user memory structure to track behavior and domains.
[x] Skills Development: Build autonomous scrapers for ArXiv and GitHub as native OpenClaw execution units.
[x] Direct Persistence: Ensure OpenClaw writes discovery results directly to Supabase.
[x] Server Scaffold: Initialize Node.js/Express with strict CORS middleware to permit requests from your frontend's origin.
[x] Stateless Endpoints: GET /opportunities fetches agent-discovered gaps from Supabase.
[x] Stateless Endpoints: GET /context reads SOUL.md data for UI personalization.
[x] Stateless Endpoints: POST /copilot proxies streaming agent responses from the OpenClaw runtime.
[x] Auth Integration: Connect Supabase Auth to handle user sessions independently.

[x] Client Scaffold: Build the React application using Vite and Tailwind CSS.
[x] API Service Layer: Create an Axios or Fetch instance that points to the Backend URL.
[x] Data Visualization: Implement the D3.js Gap Radar to pull and render the pipeline's findings.
[x] Real-time Interface: Build the Venture Copilot chat UI that consumes the backend's streaming responses.

[x] Cross-Origin Verification: Confirm the Frontend can successfully fetch data from the Backend.
[x] Autonomous Sync: Verify that when OpenClaw runs a HEARTBEAT loop, the Frontend updates without manual server intervention.
[x] Context Loop: Ensure a user action in the Frontend updates SOUL.md via the Backend, which then influences the next OpenClaw discovery run.

