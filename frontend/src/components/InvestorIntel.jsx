import { useState, useMemo } from "react";

// ─── Investor Data ────────────────────────────────────────────────────────────
const FUND_PROFILES = {
  "Sequoia Capital":         { aum: "$85B", stage: "Seed–Growth", hq: "Menlo Park, CA", partners: ["Roelof Botha", "Doug Leone"], portfolio: ["Stripe", "Airbnb", "OpenAI", "Instacart"] },
  "Andreessen Horowitz":     { aum: "$35B", stage: "Seed–Growth", hq: "San Francisco, CA", partners: ["Marc Andreessen", "Ben Horowitz"], portfolio: ["GitHub", "Lyft", "Robinhood", "Figma"] },
  "Founders Fund":           { aum: "$11B", stage: "Seed–Late", hq: "San Francisco, CA", partners: ["Peter Thiel", "Keith Rabois"], portfolio: ["SpaceX", "Palantir", "Anduril", "Stripe"] },
  "Khosla Ventures":         { aum: "$15B", stage: "Seed–Series B", hq: "Menlo Park, CA", partners: ["Vinod Khosla", "Keith Comito"], portfolio: ["DoorDash", "Square", "OpenAI", "Impossible Foods"] },
  "Benchmark":               { aum: "$3B", stage: "Series A–B", hq: "San Francisco, CA", partners: ["Bill Gurley", "Peter Fenton"], portfolio: ["Uber", "Twitter", "Snap", "Discord"] },
  "Index Ventures":          { aum: "$10B", stage: "Seed–Growth", hq: "London / SF", partners: ["Danny Rimer", "Neil Rimer"], portfolio: ["Dropbox", "Figma", "Robinhood", "Slack"] },
  "First Round Capital":     { aum: "$3B", stage: "Pre-Seed–Seed", hq: "San Francisco, CA", partners: ["Josh Kopelman", "Bill Trenchard"], portfolio: ["Uber", "Square", "Notion", "Roblox"] },
  "LocalGlobe":              { aum: "$700M", stage: "Pre-Seed–Seed", hq: "London, UK", partners: ["Robin Klein", "Saul Klein"], portfolio: ["Robinhood", "Wise", "Cazoo", "Lovefilm"] },
  "Initialized":             { aum: "$700M", stage: "Pre-Seed–Seed", hq: "San Francisco, CA", partners: ["Garry Tan", "Kim-Mai Cutler"], portfolio: ["Coinbase", "Instacart", "Flexport"] },
  "NFX":                     { aum: "$900M", stage: "Pre-Seed–Series A", hq: "San Francisco, CA", partners: ["Pete Flint", "Gigi Levy-Weiss"], portfolio: ["Lyft", "Trulia", "Doordash", "Ref Finance"] },
  "Pear VC":                 { aum: "$500M", stage: "Pre-Seed–Seed", hq: "Palo Alto, CA", partners: ["Pejman Nozad", "Mar Hershenson"], portfolio: ["Gusto", "DoorDash", "Branch"] },
};

const WARM_PATH_TEMPLATES = [
  (inv, domain) => [
    { type: "you",        label: "You",                    detail: `Building in ${domain}` },
    { type: "event",     label: "TechCrunch Disrupt 2024", detail: `${inv.name} scouts at this event every year` },
    { type: "person",    label: (FUND_PROFILES[inv.name]?.partners?.[0] || "Partner"),  detail: `Managing Partner at ${inv.name}` },
    { type: "investor",  label: inv.name,                 detail: `${inv.type} · ${inv.match}% match` },
  ],
  (inv, domain) => [
    { type: "you",       label: "You",                    detail: `${domain} founder` },
    { type: "portfolio", label: (FUND_PROFILES[inv.name]?.portfolio?.[0] || "Portfolio Co."), detail: `${inv.name} portfolio company in adjacent space` },
    { type: "person",    label: (FUND_PROFILES[inv.name]?.partners?.[1] || FUND_PROFILES[inv.name]?.partners?.[0] || "Partner"), detail: `Board member, warm intro likely` },
    { type: "investor",  label: inv.name,                 detail: `Actively deploying in ${domain}` },
  ],
  (inv, domain) => [
    { type: "you",       label: "You",                    detail: `${domain} thesis` },
    { type: "event",     label: "YC Demo Day / Batch",    detail: "Shared network overlap" },
    { type: "person",    label: (FUND_PROFILES[inv.name]?.partners?.[0] || "Partner"), detail: `Co-invests with ${inv.name} leadership` },
    { type: "investor",  label: inv.name,                 detail: `${FUND_PROFILES[inv.name]?.stage || inv.type}` },
  ],
];

const NODE_ICONS = { you: "👤", event: "🎪", portfolio: "🏢", person: "🤝", investor: "💼" };
const NODE_COLORS = { you: "var(--cream)", event: "var(--amber)", portfolio: "#7ec99a", person: "#a0b4d0", investor: "var(--amber-light)" };

// ─── Warm Path Modal ──────────────────────────────────────────────────────────
function WarmPathModal({ investor, onClose }) {
  const [step, setStep] = useState(0);
  const domain = investor.domainFocus;
  const templateIdx = Math.abs(investor.name.charCodeAt(0)) % WARM_PATH_TEMPLATES.length;
  const nodes = WARM_PATH_TEMPLATES[templateIdx](investor, domain);
  const profile = FUND_PROFILES[investor.name] || {};

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(20,10,4,0.85)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", width: "min(560px, 92vw)", padding: "32px", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "var(--fog)", fontSize: "20px", cursor: "pointer" }}>×</button>

        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--amber)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Warm Path Analysis</p>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--cream)", marginBottom: "4px" }}>Path to {investor.name}</h3>
        <p style={{ fontSize: "12px", color: "var(--fog)", marginBottom: "28px" }}>Suggested connection route based on domain overlap and portfolio graph.</p>

        {/* Node Chain */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {nodes.map((node, i) => {
            const isVisible = i <= step;
            const isActive = i === step;
            return (
              <div key={i} style={{ opacity: isVisible ? 1 : 0.2, transition: "opacity 400ms ease", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", background: isActive ? "rgba(220,203,190,0.06)" : "transparent", borderRadius: "var(--radius-md)", border: isActive ? "1px solid var(--border)" : "1px solid transparent", transition: "all 300ms ease", width: "100%" }}>
                  <span style={{ fontSize: "22px", flexShrink: 0 }}>{NODE_ICONS[node.type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: "600", color: NODE_COLORS[node.type] }}>{node.label}</div>
                    <div style={{ fontSize: "11px", color: "var(--fog)", marginTop: "2px" }}>{node.detail}</div>
                  </div>
                  {isActive && <span style={{ fontSize: "10px", color: "var(--amber)", fontFamily: "var(--font-mono)", padding: "2px 6px", background: "rgba(200,146,58,0.1)", borderRadius: "4px", border: "1px solid rgba(200,146,58,0.2)" }}>NEXT STEP</span>}
                  {i < step && <span style={{ color: "#7ec99a", fontSize: "14px" }}>✓</span>}
                </div>
                {i < nodes.length - 1 && (
                  <div style={{ width: "2px", height: "20px", background: i < step ? "#7ec99a" : "var(--border)", marginLeft: "35px", transition: "background 300ms ease" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          {step < nodes.length - 1 ? (
            <button className="vs-btn vs-btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStep(s => s + 1)}>
              Reveal Next Node →
            </button>
          ) : (
            <button className="vs-btn vs-btn-primary" style={{ flex: 1, justifyContent: "center", background: "#7ec99a", borderColor: "#7ec99a", color: "var(--ink)" }} onClick={onClose}>
              ✓ Path Complete
            </button>
          )}
          {step > 0 && (
            <button className="vs-btn vs-btn-ghost" style={{ justifyContent: "center", padding: "8px 16px" }} onClick={() => setStep(0)}>
              Reset
            </button>
          )}
        </div>

        <p style={{ fontSize: "11px", color: "var(--fog)", marginTop: "16px", fontStyle: "italic", textAlign: "center" }}>
          Path strength: <span style={{ color: "var(--amber)" }}>{investor.match}% alignment</span> · Based on domain + portfolio graph analysis
        </p>
      </div>
    </div>
  );
}

// ─── Profile Drawer ───────────────────────────────────────────────────────────
function ProfileDrawer({ investor, onClose }) {
  const profile = FUND_PROFILES[investor.name] || {};
  const matchColor = investor.match >= 90 ? "#7ec99a" : investor.match >= 70 ? "var(--amber)" : "var(--fog)";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "stretch", justifyContent: "center", background: "rgba(20,10,4,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "var(--panel)", flex: 1, width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", padding: "40px clamp(24px, 8vw, 120px)", animation: "slideInRight 300ms cubic-bezier(0.16,1,0.3,1)", boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
        {/* Nav Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--fog)", fontSize: "13px", cursor: "pointer", padding: "6px 14px", borderRadius: "var(--radius-pill)", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: "6px" }}>← Back to Investors</button>
          <span style={{ fontSize: "11px", color: "var(--fog)", fontFamily: "var(--font-mono)" }}>INVESTOR PROFILE</span>
        </div>

        {/* Hero Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "28px", marginBottom: "48px", flexWrap: "wrap" }}>
          <div style={{ width: "80px", height: "80px", background: "rgba(220,203,190,0.08)", border: "1px solid var(--border)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", flexShrink: 0 }}>💼</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "36px", color: "var(--cream)", fontWeight: "700", marginBottom: "8px", lineHeight: 1.1 }}>{investor.name}</h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--amber)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "3px 10px", background: "rgba(200,146,58,0.1)", borderRadius: "4px", border: "1px solid rgba(200,146,58,0.2)" }}>{investor.type}</span>
              <span style={{ fontSize: "12px", color: "var(--fog)", fontFamily: "var(--font-mono)" }}>{profile.hq || "USA"}</span>
              <span style={{ fontSize: "12px", color: "var(--fog)" }}>·</span>
              <span style={{ fontSize: "12px", color: "var(--fog)", fontFamily: "var(--font-mono)" }}>{profile.aum || "Undisclosed"} AUM</span>
            </div>
          </div>
          {/* Match Score Hero */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "56px", fontWeight: "600", color: matchColor, lineHeight: 1 }}>{investor.match}%</div>
            <div style={{ fontSize: "11px", color: "var(--fog)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>Match · {investor.domainFocus}</div>
          </div>
        </div>

        {/* Two-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "32px", marginBottom: "40px" }}>

          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", minWidth: 0 }}>

            {/* Fund Overview */}
            <div>
              <p style={{ fontSize: "11px", color: "var(--fog)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontFamily: "var(--font-mono)" }}>Fund Overview</p>
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {[
                  { label: "AUM", value: profile.aum || "Undisclosed" },
                  { label: "Stage Focus", value: profile.stage || investor.type },
                  { label: "Headquarters", value: profile.hq || "USA" },
                  { label: "Signal Strength", value: investor.signalStrength },
                  { label: "Domain Focus", value: investor.domainFocus },
                ].map(({ label, value }, idx) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", borderBottom: idx < 4 ? "1px solid rgba(220,203,190,0.06)" : "none" }}>
                    <span style={{ fontSize: "13px", color: "var(--fog)" }}>{label}</span>
                    <span style={{ fontSize: "13px", color: "var(--cream)", fontFamily: "var(--font-mono)", textTransform: "capitalize" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Partners */}
            {profile.partners?.length > 0 && (
              <div>
                <p style={{ fontSize: "11px", color: "var(--fog)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontFamily: "var(--font-mono)" }}>Key Partners</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {profile.partners.map(p => (
                    <div key={p} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "rgba(220,203,190,0.04)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ width: "36px", height: "36px", background: "rgba(220,203,190,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🤝</div>
                      <div>
                        <div style={{ fontSize: "14px", color: "var(--cream)", fontWeight: "500" }}>{p}</div>
                        <div style={{ fontSize: "11px", color: "var(--fog)" }}>Partner · {investor.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", minWidth: 0 }}>

            {/* Investment Thesis */}
            <div>
              <p style={{ fontSize: "11px", color: "var(--fog)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontFamily: "var(--font-mono)" }}>Investment Thesis</p>
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", padding: "20px" }}>
                <p style={{ fontSize: "15px", color: "rgba(160,114,74,0.95)", lineHeight: "1.7", fontStyle: "italic", marginBottom: "16px" }}>"{investor.thesis}"</p>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", borderTop: "1px solid rgba(220,203,190,0.08)", paddingTop: "14px" }}>
                  <span style={{ fontSize: "14px" }}>⚡</span>
                  <span style={{ fontSize: "13px", color: "var(--fog)", lineHeight: "1.5" }}>{investor.recentActivity}</span>
                </div>
              </div>
            </div>

            {/* Portfolio */}
            {profile.portfolio?.length > 0 && (
              <div>
                <p style={{ fontSize: "11px", color: "var(--fog)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontFamily: "var(--font-mono)" }}>Notable Portfolio Companies</p>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "10px" }}>
                  {profile.portfolio.map(co => (
                    <div key={co} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "rgba(126,201,154,0.05)", border: "1px solid rgba(126,201,154,0.15)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "14px" }}>🏢</span>
                      <span style={{ fontSize: "13px", color: "#7ec99a", fontWeight: "500" }}>{co}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p style={{ fontSize: "11px", color: "var(--fog)", textAlign: "center", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
          Data sourced from OpenClaw gap signal analysis · Not financial advice
        </p>
      </div>
    </div>
  );
}

// ─── Investor Card Generator ─────────────────────────────────────────────────
function generateMockInvestors(opportunities = []) {
  if (opportunities.length === 0) return [];

  const tier1VCs = ["Sequoia Capital", "Andreessen Horowitz", "Founders Fund", "Khosla Ventures", "Benchmark", "Index Ventures"];
  const seedFunds = ["First Round Capital", "LocalGlobe", "Initialized", "NFX", "Pear VC"];
  let investors = [];

  opportunities.forEach((opp, i) => {
    const domain = opp.domain || opp.title || opp.name || "Emerging Tech";
    const score = Number(opp.score ?? 50);
    const numInvestors = (i % 2 === 0) ? 2 : 1;

    for (let j = 0; j < numInvestors; j++) {
      const isSeed = score > 60;
      const pool = isSeed ? seedFunds : tier1VCs;
      const name = pool[(i + j) % pool.length];
      const type = isSeed ? "Seed / Early Stage" : "Tier 1 VC";
      const baseMatch = isSeed ? score : (100 - score + 15);
      const matchPercent = Math.min(98, Math.max(45, Math.floor(baseMatch + (j * 6) + (i % 7))));

      investors.push({
        id: `${domain}-${name}-${j}`,
        name,
        type,
        domainFocus: domain,
        match: matchPercent,
        thesis: `Actively deploying capital in ${domain.toLowerCase()} with a focus on defensible tech and first-mover advantage.`,
        recentActivity: score > 60 ? `Scouting stealth startups in ${domain}` : `Led Series B in ${domain} sector`,
        signalStrength: score > 70 ? "Strong" : score > 40 ? "Moderate" : "Saturated",
      });
    }
  });

  return investors.sort((a, b) => b.match - a.match);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InvestorIntel({ domains = [], opportunities = [] }) {
  const [filter, setFilter] = useState("All");
  const [warmPathInvestor, setWarmPathInvestor] = useState(null);
  const [profileInvestor, setProfileInvestor] = useState(null);

  const investors = useMemo(() => generateMockInvestors(opportunities), [opportunities]);

  const filteredInvestors = investors.filter(inv => {
    if (filter === "All") return true;
    if (filter === "High Match") return inv.match >= 90;
    if (filter === "Seed Funds") return inv.type.includes("Seed");
    return true;
  });

  if (opportunities.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
        <span style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.5 }}>📡</span>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--cream)", marginBottom: "8px" }}>No Signals Found</h3>
        <p style={{ color: "var(--fog)", maxWidth: "400px", lineHeight: "1.6" }}>
          Add domains to your SOUL Context on the left to start discovering investors actively backing those sectors.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* Modals */}
      {warmPathInvestor && <WarmPathModal investor={warmPathInvestor} onClose={() => setWarmPathInvestor(null)} />}
      {profileInvestor && <ProfileDrawer investor={profileInvestor} onClose={() => setProfileInvestor(null)} />}

      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "700", color: "var(--cream)", marginBottom: "6px" }}>Investor Intelligence</h2>
          <p style={{ fontSize: "14px", color: "var(--fog)" }}>Warm-path capital matching based on your active Gap Radar signals.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["All", "High Match", "Seed Funds"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "var(--cream)" : "transparent", color: filter === f ? "var(--ink)" : "var(--fog)", border: filter === f ? "1px solid var(--cream)" : "1px solid var(--border)", padding: "6px 14px", borderRadius: "var(--radius-pill)", fontSize: "12px", fontFamily: "var(--font-mono)", cursor: "pointer", transition: "all 0.2s ease" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {filteredInvestors.map((inv, i) => (
          <div
            key={inv.id}
            className={`animate-fade-up animate-fade-up-d${Math.min(i + 1, 5)}`}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", transition: "transform 0.2s ease, border-color 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.015)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            {/* Card Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--cream)", fontWeight: "600", marginBottom: "4px" }}>{inv.name}</h3>
                <span style={{ fontSize: "11px", color: "var(--amber)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 8px", background: "rgba(200,146,58,0.1)", borderRadius: "4px", border: "1px solid rgba(200,146,58,0.2)" }}>{inv.type}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", color: inv.match >= 90 ? "#7ec99a" : "var(--cream)", fontWeight: "600" }}>{inv.match}%</span>
                <span style={{ fontSize: "10px", color: "var(--fog)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Match</span>
              </div>
            </div>

            {/* Domain */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", color: "var(--fog)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Target Domain</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "var(--cream)", borderRadius: "50%", flexShrink: 0 }} />
                <span style={{ fontSize: "14px", color: "var(--cream)", fontWeight: "500", textTransform: "capitalize" }}>{inv.domainFocus}</span>
              </div>
            </div>

            {/* Thesis */}
            <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: "var(--radius-md)", padding: "12px", marginBottom: "20px", flexGrow: 1 }}>
              <p style={{ fontSize: "12px", color: "#A0724A", lineHeight: "1.5", marginBottom: "8px", fontStyle: "italic" }}>"{inv.thesis}"</p>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", borderTop: "1px solid rgba(220,203,190,0.1)", paddingTop: "8px" }}>
                <span style={{ fontSize: "12px" }}>⚡</span>
                <span style={{ fontSize: "12px", color: "var(--fog)" }}>{inv.recentActivity}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
              <button className="vs-btn vs-btn-primary" style={{ flex: 1, justifyContent: "center", padding: "8px 0" }} onClick={() => setWarmPathInvestor(inv)}>
                Find Warm Path
              </button>
              <button className="vs-btn vs-btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "8px 0" }} onClick={() => setProfileInvestor(inv)}>
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredInvestors.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--fog)", fontStyle: "italic" }}>No investors match the current filter.</div>
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
