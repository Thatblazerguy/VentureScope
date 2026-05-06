import { useState, useEffect, useCallback, useRef } from "react";

// ── Import all new + existing components ────────────────────────────────────
import Navbar       from "./components/Navbar";
import Sidebar      from "./components/Sidebar";
import TabNav, { TABS } from "./components/TabNav";
import { GapRadar } from "./components/GapRadar";
import { CopilotChat } from "./components/CopilotChat";
import InvestorIntel  from "./components/InvestorIntel";
import WeeklyDigest   from "./components/WeeklyDigest";
import HeartbeatLog   from "./components/HeartbeatLog";

import { getContext, getOpportunities, updateContext, API_BASE_URL } from './lib/api';

// ── Your existing API base URL constant (keep as-is from your current App.jsx) ──
const API_BASE = API_BASE_URL || "http://localhost:8000";

export default function App() {

  // ── Sidebar open state (for mobile drawer) ──────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Active tab state ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("radar");

  // ── Loading and Error state ──────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [context, setContext] = useState(null);

  // ── SOUL Context state (migrate from existing App.jsx if not already here)
  const [domains, setDomains]           = useState([]);
  const [riskAppetite, setRiskAppetite] = useState("Medium");
  const [isSaving, setIsSaving]         = useState(false);
  const [lastSaved, setLastSaved]       = useState(null);

  // ── Agent scan state ─────────────────────────────────────────────────────
  const [isScanning, setIsScanning]     = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  // ── Pipeline run counter (persisted in localStorage) ────────────────────
  const [pipelineRuns, setPipelineRuns] = useState(() => {
    return parseInt(localStorage.getItem("vs_pipeline_runs") || "0", 10);
  });

  // ── Opportunities data (from your existing Supabase fetch) ───────────────
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const [opportunityPayload, contextPayload] = await Promise.all([
          getOpportunities().catch(() => ({ opportunities: [] })),
          getContext().catch(() => null),
        ]);

        if (!mounted) return;

        const opps = opportunityPayload.opportunities || [];
        setOpportunities(opps);
        setContext(contextPayload);
        
        if (opps.length > 0) {
          const mostRecent = opps.reduce((latest, opp) =>
            new Date(opp.updated_at || opp.created_at) > new Date(latest.updated_at || latest.created_at) ? opp : latest
          );
          setLastUpdatedAt(mostRecent.updated_at || mostRecent.created_at);
        }

        if (contextPayload?.soul?.profile?.user_profile) {
          setDomains(contextPayload.soul.profile.user_profile.domains || []);
          setRiskAppetite(contextPayload.soul.profile.user_profile.risk_appetite || 'medium');
          setLastSaved(contextPayload.soul.profile.last_updated);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load dashboard data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  // ── SOUL context handlers ────────────────────────────────────────────────

  const handleAddDomain = useCallback((domain) => {
    setDomains((prev) =>
      prev.includes(domain) ? prev : [...prev, domain]
    );
  }, []);

  const handleRemoveDomain = useCallback((domain) => {
    setDomains((prev) => prev.filter((d) => d !== domain));
  }, []);

  const handleChangeRisk = useCallback((level) => {
    setRiskAppetite(level);
  }, []);

  const handleSaveSOUL = useCallback(async () => {
    if (domains.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      const nextUserProfile = {
        ...context?.soul?.profile?.user_profile,
        domains,
        risk_appetite: riskAppetite
      };

      const result = await updateContext(nextUserProfile);
      setContext(result);
      setLastSaved(new Date().toISOString());

      // Fetch fresh radar data instantly after pipeline runs
      const opResult = await getOpportunities().catch(() => ({ opportunities: [] }));
      const opps = opResult.opportunities || [];
      setOpportunities(opps);
      
      if (opps.length > 0) {
        const mostRecent = opps.reduce((latest, opp) =>
          new Date(opp.updated_at || opp.created_at) > new Date(latest.updated_at || latest.created_at) ? opp : latest
        );
        setLastUpdatedAt(mostRecent.updated_at || mostRecent.created_at);
      }

      // After successful save, update pipeline run counter:
      const prev = parseInt(localStorage.getItem("vs_pipeline_runs") || "0", 10);
      const next = prev + 1;
      localStorage.setItem("vs_pipeline_runs", next.toString());
      setPipelineRuns(next);
      
    } catch (err) {
      console.error("[VentureScope] Failed to save SOUL context:", err);
    } finally {
      setIsSaving(false);
    }
  }, [domains, riskAppetite, isSaving, context]);

  // ── Trigger Scan handler ─────────────────────────────────────────────────
  const handleTriggerScan = useCallback(async () => {
    if (isScanning || domains.length === 0) return;
    setIsScanning(true);
    try {
      const opResult = await getOpportunities();
      const opps = opResult.opportunities || [];
      setOpportunities(opps);
      if (opps.length > 0) {
        const mostRecent = opps.reduce((latest, opp) =>
          new Date(opp.updated_at || opp.created_at) > new Date(latest.updated_at || latest.created_at) ? opp : latest
        );
        setLastUpdatedAt(mostRecent.updated_at || mostRecent.created_at);
      }
      setLastSaved(new Date().toISOString());
    } catch (err) {
      console.error("[VentureScope] Scan trigger failed:", err);
    } finally {
      setIsScanning(false);
    }
  }, [domains, riskAppetite, isScanning]);

  // ── Tab change handler ───────────────────────────────────────────────────
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    // Close sidebar on mobile when tab is changed
    setSidebarOpen(false);
  }, []);

  // ── Render the active tab content ────────────────────────────────────────
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex h-[400px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] m-6">
          <div className="flex flex-col items-center gap-4">
            <span className="h-8 w-8 animate-spin-slow rounded-full border-2 border-[var(--aurora)] border-t-transparent"></span>
            <span className="text-sm uppercase tracking-widest text-[var(--mist)]">Initializing Dashboard...</span>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "radar":
        return (
          <div key="radar" className="animate-tab-enter" style={{ padding: "24px" }}>
            <GapRadar
              opportunities={opportunities}
              riskAppetite={riskAppetite}
            />
          </div>
        );

      case "copilot":
        return null; // Rendered persistently outside switch to preserve chat history

      case "intel":
        return (
          <div key="intel" className="animate-tab-enter" style={{ padding: "24px" }}>
            <InvestorIntel domains={domains} opportunities={opportunities} />
          </div>
        );

      case "digest":
        return (
          <div key="digest" className="animate-tab-enter" style={{ padding: "24px" }}>
            <WeeklyDigest />
          </div>
        );

      case "heartbeat":
        return (
          <div key="heartbeat" className="animate-tab-enter" style={{ padding: "24px" }}>
            <HeartbeatLog />
          </div>
        );

      default:
        return null;
    }
  };

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Fixed top navbar */}
      <Navbar
        apiBase={API_BASE}
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Fixed left sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        // Agent status
        lastUpdatedAt={lastUpdatedAt}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
        // SOUL context
        domains={domains}
        riskAppetite={riskAppetite}
        onAddDomain={handleAddDomain}
        onRemoveDomain={handleRemoveDomain}
        onChangeRisk={handleChangeRisk}
        onSave={handleSaveSOUL}
        isSaving={isSaving}
        lastSaved={lastSaved}
        // System stats
        signalsCount={opportunities.length}
        domainsCount={domains.length}
        pipelineRuns={pipelineRuns}
      />

      {/* Main content area — offset by navbar height and sidebar width */}
      <main
        style={{
          marginTop: "var(--navbar-height)",
          marginLeft: "var(--sidebar-width)",
          minHeight: "calc(100vh - var(--navbar-height))",
          display: "flex",
          flexDirection: "column",
          // On mobile, sidebar doesn't push content — it overlays
        }}
      >
        <style>{`
          @media (max-width: 767px) {
            main { margin-left: 0 !important; }
          }
          @media (min-width: 768px) and (max-width: 1100px) {
            main { margin-left: 240px !important; }
          }
        `}</style>

        {/* Sticky tab navigation */}
        <div style={{ position: "sticky", top: "var(--navbar-height)", zIndex: 50 }}>
          <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Tab panel content — scrollable */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {error && <p style={{ color: "var(--danger)", padding: "24px", textAlign: "center" }}>{error}</p>}
          
          {/* Always mount CopilotChat to preserve chat history, but hide it if not active */}
          <div style={{ display: !loading && activeTab === "copilot" ? "block" : "none", height: "100%" }}>
            <div
              className={activeTab === "copilot" ? "animate-tab-enter" : ""}
              style={{
                padding: "0",
                height: "calc(100vh - var(--navbar-height) - 53px)", // subtract tab nav height
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CopilotChat
                apiBase={API_BASE}
                domains={domains}
              />
            </div>
          </div>

          {renderTabContent()}
        </div>
      </main>
    </>
  );
}