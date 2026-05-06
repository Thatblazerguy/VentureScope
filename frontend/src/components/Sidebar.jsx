import { useState, useEffect, useRef, useCallback } from "react";

// ─── Utility: parse Supabase timestamp as UTC (they omit the Z suffix) ───────
function parseAsUTC(dateStr) {
  if (!dateStr) return null;
  // If it already has Z or a +offset, parse as-is; otherwise append Z
  return new Date(/[Z+]/.test(dateStr) ? dateStr : dateStr + 'Z');
}

// ─── Utility: format relative time ───────────────────────────────────────────
function relativeTime(dateStr, now = Date.now()) {
  if (!dateStr) return "never";
  const diff = now - parseAsUTC(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
}


// ─── Hook: live-ticking current timestamp (updates every 30s) ────────────────
function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// ─── Utility: count-up animation ────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = () => {
      startRef.current = performance.now();
      const step = (now) => {
        const elapsed = now - startRef.current;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step);
        }
      };
      frameRef.current = requestAnimationFrame(step);
    };
    start();
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);

  return value;
}

// ─── Agent Status Widget ─────────────────────────────────────────────────────
// Determines if the agent is "active" by checking if the most recent
// opportunity in Supabase was updated within the last 5 minutes.
// Uses the lastUpdatedAt prop passed from App.jsx (from your existing data fetch).
function AgentStatusWidget({ lastUpdatedAt, onTriggerScan, isScanning }) {
  const now = useNow();
  const isActive = lastUpdatedAt
    ? now - parseAsUTC(lastUpdatedAt).getTime() < 5 * 60_000
    : false;

  return (
    <div className="vs-sidebar-section">
      <p className="vs-section-label">Agent Status</p>

      {/* Status row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Pulsing status dot */}
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              flexShrink: 0,
              background: isActive ? "var(--success)" : "var(--fog)",
              animation: isActive ? "amberPulse 2s ease-out infinite" : "none",
              boxShadow: isActive ? "0 0 0 0 rgba(92, 158, 110, 0.55)" : "none",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: "600",
                color: isActive ? "var(--cream)" : "var(--fog)",
              }}
            >
              {isActive ? "OpenClaw Active" : "OpenClaw Idle"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--fog)",
                marginTop: "2px",
              }}
            >
              Last scan: {relativeTime(lastUpdatedAt, now)}
            </div>
          </div>
        </div>
      </div>

      {/* Trigger scan button */}
      <button
        className="vs-btn vs-btn-ghost"
        style={{ width: "100%", justifyContent: "center" }}
        onClick={onTriggerScan}
        disabled={isScanning}
      >
        {isScanning ? (
          <>
            <span className="vs-btn-spinner" />
            Scanning...
          </>
        ) : (
          <>
            <span style={{ fontSize: "12px" }}>▶</span>
            Trigger Scan
          </>
        )}
      </button>
    </div>
  );
}

// ─── Last Saved Label (live ticker) ─────────────────────────────────────────
function LastSavedLabel({ lastSaved }) {
  const now = useNow();
  return (
    <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fog)", textAlign: "center" }}>
      last saved: {relativeTime(lastSaved, now)}
    </p>
  );
}

// ─── SOUL Context Editor ────────────────────────────────────────────────────
// Migrated from App.jsx. Accepts domains, riskAppetite, and all handlers as props.
// Renders tag chips for domains, a 3-button toggle for risk appetite,
// a save button with loading state, and a last-saved timestamp.
function SoulContextEditor({
  domains,
  riskAppetite,
  onAddDomain,
  onRemoveDomain,
  onChangeRisk,
  onSave,
  isSaving,
  lastSaved,
}) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const trimmed = inputValue.trim().toLowerCase();
      onAddDomain(trimmed);
      setInputValue("");
    }
    // Allow backspace to remove the last tag when input is empty
    if (e.key === "Backspace" && inputValue === "" && domains.length > 0) {
      onRemoveDomain(domains[domains.length - 1]);
    }
  };

  return (
    <div className="vs-sidebar-section">
      <p className="vs-section-label">SOUL Context</p>

      {/* Domain tag chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginBottom: "10px",
          minHeight: "32px",
        }}
      >
        {domains.length === 0 && (
          <span style={{ fontSize: "12px", color: "var(--fog)", fontStyle: "italic" }}>
            No domains added yet
          </span>
        )}
        {domains.map((domain) => (
          <span key={domain} className="vs-tag-chip">
            {domain}
            <button
              className="remove-btn"
              onClick={() => onRemoveDomain(domain)}
              aria-label={`Remove ${domain}`}
              title={`Remove ${domain}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Add domain input */}
      <input
        ref={inputRef}
        type="text"
        className="vs-input"
        placeholder="+ Add domain, press Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ marginBottom: "14px" }}
      />

      {/* Risk Appetite toggle */}
      <div style={{ marginBottom: "14px" }}>
        <p
          style={{
            fontSize: "11px",
            color: "var(--fog)",
            fontWeight: "500",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Risk Appetite
        </p>
        <div className="vs-toggle-group">
          {["Low", "Medium", "High"].map((level) => (
            <button
              key={level}
              className={riskAppetite === level.toLowerCase() ? "active" : ""}
              onClick={() => onChangeRisk(level.toLowerCase())}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        className="vs-btn vs-btn-primary"
        style={{ width: "100%", justifyContent: "center", marginBottom: "8px" }}
        onClick={onSave}
        disabled={isSaving || domains.length === 0}
      >
        {isSaving ? (
          <>
            <span className="vs-btn-spinner" />
            Saving...
          </>
        ) : (
          "Save to SOUL"
        )}
      </button>

      {/* Last saved timestamp */}
      {lastSaved && (
        <LastSavedLabel lastSaved={lastSaved} />
      )}
    </div>
  );
}

// ─── System Stats ────────────────────────────────────────────────────────────
// 3 animated stat tiles. Reads from props derived from existing Supabase data.
// pipelineRuns is tracked in localStorage and incremented on each SOUL save.
function SystemStats({ signalsCount, domainsCount, pipelineRuns }) {
  const animatedSignals  = useCountUp(signalsCount);
  const animatedDomains  = useCountUp(domainsCount);
  const animatedPipeline = useCountUp(pipelineRuns);

  const stats = [
    { label: "Signals Discovered", value: animatedSignals,  icon: "◎" },
    { label: "Domains Tracked",    value: animatedDomains,  icon: "⬡" },
    { label: "Pipeline Runs",      value: animatedPipeline, icon: "⚡" },
  ];

  return (
    <div className="vs-sidebar-section">
      <p className="vs-section-label">System Stats</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {stats.map((stat) => (
          <div key={stat.label} className="vs-stat-tile">
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--amber)",
                  opacity: 0.7,
                }}
              >
                {stat.icon}
              </span>
              <span className="stat-number">{stat.value}</span>
            </div>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar Main Component ──────────────────────────────────────────────────
export default function Sidebar({
  isOpen,
  onClose,
  // Agent status props
  lastUpdatedAt,
  onTriggerScan,
  isScanning,
  // SOUL context props (all state managed in App.jsx, passed down)
  domains,
  riskAppetite,
  onAddDomain,
  onRemoveDomain,
  onChangeRisk,
  onSave,
  isSaving,
  lastSaved,
  // System stats props
  signalsCount,
  domainsCount,
  pipelineRuns,
}) {
  // Close sidebar on Escape key (mobile)
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile backdrop overlay */}
      <style>{`
        @media (max-width: 767px) {
          .vs-sidebar-root {
            position: fixed !important;
            top: var(--navbar-height) !important;
            left: 0 !important;
            height: calc(100vh - var(--navbar-height)) !important;
            width: 100vw !important;
            transform: ${isOpen ? "translateX(0)" : "translateX(-100%)"} !important;
            z-index: 95 !important;
            transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .vs-sidebar-backdrop { display: ${isOpen ? "block" : "none"} !important; }
        }
      `}</style>

      {/* Backdrop (mobile only) */}
      <div
        className="vs-sidebar-backdrop"
        onClick={onClose}
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          background: "rgba(220, 203, 190, 0.7)",
          zIndex: 90,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Sidebar panel */}
      <aside
        className="vs-sidebar-root"
        style={{
          position: "fixed",
          top: "var(--navbar-height)",
          left: 0,
          width: "var(--sidebar-width)",
          height: "calc(100vh - var(--navbar-height))",
          background: "var(--panel)",
          borderRight: "1px solid var(--border)",
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: 90,
          display: "flex",
          flexDirection: "column",
          // Warm inner glow at top
          boxShadow: "inset 0 -1px 0 var(--border), 4px 0 24px rgba(117, 86, 63, 0.1)",
        }}
      >
        {/* Optional close button (mobile) */}
        <div
          style={{
            padding: "14px 20px 0",
            display: "flex",
            justifyContent: "flex-end",
          }}
          className="sidebar-close-row"
        >
          <style>{`
            @media (min-width: 768px) { .sidebar-close-row { display: none !important; } }
          `}</style>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--fog)",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: 1,
              padding: "4px",
            }}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Section 1: Agent Status */}
        <AgentStatusWidget
          lastUpdatedAt={lastUpdatedAt}
          onTriggerScan={onTriggerScan}
          isScanning={isScanning}
        />

        {/* Section 2: SOUL Context Editor */}
        <SoulContextEditor
          domains={domains}
          riskAppetite={riskAppetite}
          onAddDomain={onAddDomain}
          onRemoveDomain={onRemoveDomain}
          onChangeRisk={onChangeRisk}
          onSave={onSave}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />

        {/* Section 3: System Stats */}
        <SystemStats
          signalsCount={signalsCount}
          domainsCount={domainsCount}
          pipelineRuns={pipelineRuns}
        />
      </aside>
    </>
  );
}
