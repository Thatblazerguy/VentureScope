import { useState, useMemo } from "react";

// Helper to generate dynamic mock investors based on active domains
function generateMockInvestors(opportunities = []) {
  if (opportunities.length === 0) return [];

  const tier1VCs = ["Sequoia Capital", "Andreessen Horowitz", "Founders Fund", "Khosla Ventures", "Benchmark", "Index Ventures"];
  const seedFunds = ["First Round Capital", "LocalGlobe", "Initialized", "NFX", "Pear VC"];
  const accelerators = ["Y Combinator", "Techstars", "500 Global"];

  let investors = [];

  opportunities.forEach((opp, i) => {
    const domain = opp.domain || opp.title || opp.name || "Emerging Tech";
    const score = Number(opp.score ?? 50);

    // If gap score is high (whitespace), attract deep tech / seed funds
    // If gap score is low (saturated), attract Tier 1 growth funds

    // Generate 1-2 investors per domain
    const numInvestors = (i % 2 === 0) ? 2 : 1;

    for (let j = 0; j < numInvestors; j++) {
      const isSeed = score > 60;
      const pool = isSeed ? seedFunds : tier1VCs;
      const name = pool[(i + j) % pool.length];
      const type = isSeed ? "Seed / Early Stage" : "Tier 1 VC";

      const matchPercent = Math.min(99, Math.max(75, score + (j * 5) + 12));

      investors.push({
        id: `${domain}-${name}-${j}`,
        name,
        type,
        domainFocus: domain,
        match: matchPercent,
        thesis: `Actively deploying capital in ${domain.toLowerCase()} with a focus on defensible tech.`,
        recentActivity: score > 60 ? `Scouting stealth startups in ${domain}` : `Led Series B in ${domain} sector`,
        signalStrength: score > 70 ? "Strong" : score > 40 ? "Moderate" : "Saturated"
      });
    }
  });

  // Sort by match percentage
  return investors.sort((a, b) => b.match - a.match);
}

export default function InvestorIntel({ domains = [], opportunities = [] }) {
  const [filter, setFilter] = useState("All");

  const investors = useMemo(() => generateMockInvestors(opportunities), [opportunities]);

  const filteredInvestors = investors.filter(inv => {
    if (filter === "All") return true;
    if (filter === "High Match") return inv.match >= 90;
    if (filter === "Seed Funds") return inv.type.includes("Seed");
    return true;
  });

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <span className="text-4xl mb-4 opacity-50">📡</span>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--cream)", marginBottom: "8px" }}>No Signals Found</h3>
        <p style={{ color: "var(--fog)", maxWidth: "400px", lineHeight: "1.6" }}>
          Add domains to your SOUL Context on the left to start discovering investors actively backing those sectors.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* Header Area */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "700", color: "var(--cream)", marginBottom: "6px" }}>
            Investor Intelligence
          </h2>
          <p style={{ fontSize: "14px", color: "var(--fog)" }}>
            Warm-path capital matching based on your active Gap Radar signals.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "8px" }}>
          {["All", "High Match", "Seed Funds"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "var(--cream)" : "transparent",
                color: filter === f ? "var(--ink)" : "var(--fog)",
                border: filter === f ? "1px solid var(--cream)" : "1px solid var(--border)",
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {filteredInvestors.map((inv, i) => (
          <div
            key={inv.id}
            className={`animate-fade-up animate-fade-up-d${Math.min(i + 1, 5)}`}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s ease, border-color 0.2s ease",
              cursor: "default"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.015)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            {/* Card Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--cream)", fontWeight: "600", marginBottom: "4px" }}>
                  {inv.name}
                </h3>
                <span style={{ fontSize: "11px", color: "var(--amber)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 8px", background: "rgba(200,146,58,0.1)", borderRadius: "4px", border: "1px solid rgba(200,146,58,0.2)" }}>
                  {inv.type}
                </span>
              </div>

              {/* Match Score */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", color: inv.match >= 90 ? "var(--success)" : "var(--cream)", fontWeight: "600" }}>
                  {inv.match}%
                </span>
                <span style={{ fontSize: "10px", color: "var(--fog)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Match</span>
              </div>
            </div>

            {/* Target Domain */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", color: "var(--fog)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                Target Domain
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "var(--cream)", borderRadius: "50%" }}></span>
                <span style={{ fontSize: "14px", color: "var(--cream)", fontWeight: "500", textTransform: "capitalize" }}>
                  {inv.domainFocus}
                </span>
              </div>
            </div>

            {/* Thesis & Activity */}
            <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: "var(--radius-md)", padding: "12px", marginBottom: "20px", flexGrow: 1 }}>
              <p style={{ fontSize: "12px", color: "#A0724A", lineHeight: "1.5", marginBottom: "8px", fontStyle: "italic" }}>
                "{inv.thesis}"
              </p>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", borderTop: "1px solid rgba(220,203,190,0.1)", paddingTop: "8px" }}>
                <span style={{ fontSize: "12px" }}>⚡</span>
                <span style={{ fontSize: "12px", color: "var(--fog)" }}>{inv.recentActivity}</span>
              </div>
            </div>

            {/* Action Area */}
            <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
              <button className="vs-btn vs-btn-primary" style={{ flex: 1, justifyContent: "center", padding: "8px 0" }}>
                Find Warm Path
              </button>
              <button className="vs-btn vs-btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "8px 0" }}>
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredInvestors.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--fog)", fontStyle: "italic" }}>
          No investors match the current filter.
        </div>
      )}
    </div>
  );
}
