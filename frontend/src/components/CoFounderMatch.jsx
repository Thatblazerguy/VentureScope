import { useState } from "react";

// ── Real Founder Data (sorted by matchScore desc) ─────────────────────────────
const MOCK_USERS = [
  {
    id: 1,
    name: "Aravind Srinivas",
    role: "CEO & Co-Founder · Perplexity AI",
    avatar: "AS",
    skills: ["AI", "Search", "LLMs"],
    matchScore: 96,
    mutualDomain: "AI",
    bio: "Ex-OpenAI Research Scientist. Built Perplexity into the leading AI search engine backed by Jeff Bezos and Nvidia. Series C · $1B raise at $18B valuation (2025).",
    status: "Actively looking",
    linkedin: "https://www.linkedin.com/in/aravind-srinivas-16051987/",
    isUmbrellaMatch: true,
  },
  {
    id: 2,
    name: "Dario Amodei",
    role: "CEO & Co-Founder · Anthropic",
    avatar: "DA",
    skills: ["AI Safety", "LLMs", "Cloud AI"],
    matchScore: 91,
    mutualDomain: "AI Safety",
    bio: "Ex-VP Research at OpenAI. Co-founded Anthropic in 2021 focused on safe AI development. Series E · $61.5B valuation (March 2025).",
    status: "Actively looking",
    linkedin: "https://www.linkedin.com/in/dario-amodei-3934934/",
    isUmbrellaMatch: false,
  },
  {
    id: 3,
    name: "Tim Shi",
    role: "Co-Founder · Cresta",
    avatar: "TS",
    skills: ["AI", "Enterprise SaaS", "Cloud"],
    matchScore: 88,
    mutualDomain: "AI",
    bio: "Ex-OpenAI (2017). Built Cresta into a leading AI contact center platform. Series C · $270M+ from Sequoia & a16z.",
    status: "Actively looking",
    linkedin: "https://www.linkedin.com/in/timshi/",
    isUmbrellaMatch: false,
  },
  {
    id: 4,
    name: "Arjun Lalwani",
    role: "Co-Founder · Approval AI (YC X25)",
    avatar: "AL",
    skills: ["AI", "SaaS", "Fintech"],
    matchScore: 83,
    mutualDomain: "AI",
    bio: "YC-backed founder (Spring 2025). Building AI to simplify mortgage processes with multi-lender comparison. Pre-Seed · Y Combinator X25 Batch.",
    status: "Open to chat",
    linkedin: "https://www.ycombinator.com/companies/approval-ai",
    isUmbrellaMatch: false,
  },
  {
    id: 5,
    name: "Supreet Deshpande",
    role: "Co-Founder · Synthio Labs (YC X25)",
    avatar: "SD",
    skills: ["AI Infrastructure", "Dev Tools", "Cloud"],
    matchScore: 79,
    mutualDomain: "AI Infrastructure",
    bio: "YC Spring 2025 founder building next-gen AI infrastructure tooling. Pre-Seed · Y Combinator X25 Batch.",
    status: "Open to chat",
    linkedin: "https://www.ycombinator.com/companies/synthiolabs",
    isUmbrellaMatch: false,
  },
  {
    id: 6,
    name: "Anabelle Louis",
    role: "Co-Founder · Cua (YC X25)",
    avatar: "AL",
    skills: ["AI Agents", "DevOps", "Cloud Containers"],
    matchScore: 75,
    mutualDomain: "AI Agents",
    bio: "YC Spring 2025. Building a platform for deploying AI agents using cloud containers with cross-OS integration. Pre-Seed · Y Combinator X25 Batch.",
    status: "Open to chat",
    linkedin: "https://www.ycombinator.com/companies/cua",
    isUmbrellaMatch: false,
  },
];

const ALL_DOMAINS = ["All", ...new Set(MOCK_USERS.map((u) => u.mutualDomain))];
const ALL_SKILLS  = ["All", ...new Set(MOCK_USERS.flatMap((u) => u.skills))];
const SCORE_BANDS = ["All", "90%+ (Top Match)", "75–89%", "Below 75%"];

// ── Score colour helpers ──────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 90) return { color: "#7ec99a", bg: "rgba(126,201,154,0.12)", border: "rgba(126,201,154,0.3)" };
  if (score >= 75) return { color: "#7aaddc", bg: "rgba(122,173,220,0.12)", border: "rgba(122,173,220,0.3)" };
  return { color: "var(--fog)", bg: "rgba(130,120,110,0.12)", border: "rgba(130,120,110,0.2)" };
}

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  "Actively looking": { dot: "#7ec99a", label: "Actively looking" },
  "Open to chat":     { dot: "var(--amber)", label: "Open to chat" },
  "Exploring":        { dot: "var(--fog)", label: "Exploring" },
};

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ visible, onDismiss }) {
  if (!visible) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "rgba(126,201,154,0.1)", border: "1px solid rgba(126,201,154,0.25)",
      borderRadius: "var(--radius-md)", padding: "12px 18px", marginBottom: "24px", gap: "12px",
    }}>
      <span style={{ fontSize: "13px", color: "var(--cream)" }}>
        💡 <strong>6 founders</strong> are building in <strong>AI</strong> — your top signal domain.
      </span>
      <button onClick={onDismiss} style={{
        background: "transparent", border: "none", color: "var(--fog)",
        cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "0 4px", flexShrink: 0,
      }}>×</button>
    </div>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ user }) {
  const sc = scoreColor(user.matchScore);
  const st = STATUS_CFG[user.status] || STATUS_CFG["Exploring"];

  return (
    <div style={{
      background: "var(--panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "24px", display: "flex",
      flexDirection: "column", gap: "16px",
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(117,86,63,0.4)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(117,86,63,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Top row: avatar + name + match score */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        {/* Avatar */}
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, rgba(117,86,63,0.25), rgba(200,146,58,0.2))",
          border: "1px solid rgba(117,86,63,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: "700", color: "var(--amber)",
        }}>{user.avatar}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
            {/* Name — dark so it's visible on light card background */}
            <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "700", color: "#2C1A0E" }}>
              {user.name}
            </span>
            {/* Match score badge */}
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700",
              color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`,
              padding: "2px 8px", borderRadius: "var(--radius-pill)",
            }}>{user.matchScore}% match</span>
            {/* Umbrella match badge */}
            {user.isUmbrellaMatch && (
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700",
                background: "rgba(200,146,58,0.15)", border: "1px solid rgba(200,146,58,0.4)",
                color: "var(--amber)", padding: "2px 8px", borderRadius: "var(--radius-pill)",
              }}>★ Top Pick</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Role — medium dark brown */}
            <span style={{ fontSize: "12px", color: "#6B4530", fontFamily: "var(--font-mono)" }}>{user.role}</span>
            {/* Status dot */}
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: st.dot, flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "#7B5A3C" }}>{st.label}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mutual domain tag */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "10px", color: "#7B5A3C", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>Mutual Domain</span>
        <span style={{
          fontSize: "11px", padding: "2px 10px", borderRadius: "var(--radius-pill)",
          background: "rgba(200,146,58,0.1)", border: "1px solid rgba(200,146,58,0.25)", color: "var(--amber)",
          fontFamily: "var(--font-mono)",
        }}>{user.mutualDomain}</span>
      </div>

      {/* Bio — dark readable brown */}
      <p style={{ fontSize: "13px", color: "#4A3020", lineHeight: "1.6", margin: 0 }}>
        {user.bio}
      </p>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {user.skills.slice(0, 3).map(skill => (
          <span key={skill} style={{
            fontSize: "11px", padding: "3px 10px",
            background: "rgba(117,86,63,0.08)",
            border: "1px solid rgba(117,86,63,0.2)", borderRadius: "var(--radius-pill)",
            color: "#5A3C28", fontFamily: "var(--font-mono)",
          }}>{skill}</span>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
        <a
          href={user.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, padding: "8px 0", borderRadius: "var(--radius-pill)",
            background: "transparent", border: "1px solid rgba(117,86,63,0.35)",
            color: "#5A3C28", fontSize: "12px", cursor: "pointer",
            fontFamily: "var(--font-body)", transition: "all 0.2s",
            textAlign: "center", textDecoration: "none", display: "flex",
            alignItems: "center", justifyContent: "center", gap: "4px",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(117,86,63,0.6)"; e.currentTarget.style.color = "#2C1A0E"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(117,86,63,0.35)"; e.currentTarget.style.color = "#5A3C28"; }}
        >
          ↗ View Profile
        </a>
        <button
          onClick={() => alert("🚀 Feature coming soon!")}
          style={{
            flex: 1, padding: "8px 0", borderRadius: "var(--radius-pill)",
            background: "linear-gradient(135deg, rgba(117,86,63,0.25), rgba(200,146,58,0.15))",
            border: "1px solid rgba(117,86,63,0.4)",
            color: "var(--amber)", fontSize: "12px", cursor: "pointer",
            fontFamily: "var(--font-body)", fontWeight: "600", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(117,86,63,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(117,86,63,0.25), rgba(200,146,58,0.15))"; }}
        >Connect →</button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CoFounderMatch() {
  const [toastVisible, setToastVisible] = useState(true);
  const [domain, setDomain] = useState("All");
  const [skill, setSkill] = useState("All");
  const [scoreBand, setScoreBand] = useState("All");

  const selectStyle = {
    background: "var(--panel)", border: "1px solid var(--border)",
    color: "var(--parchment)", borderRadius: "var(--radius-pill)",
    padding: "6px 14px", fontSize: "12px", fontFamily: "var(--font-mono)",
    cursor: "pointer", outline: "none", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
    paddingRight: "28px",
  };

  return (
    <div className="animate-fade-up">

      {/* ── Dismissable Toast ───────────────────────────────────────────────── */}
      <Toast visible={toastVisible} onDismiss={() => setToastVisible(false)} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "700", color: "var(--cream)", lineHeight: 1.1 }}>
            Find Your Co-Founder
          </h2>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "600",
            background: "rgba(117,86,63,0.15)", border: "1px solid rgba(117,86,63,0.4)",
            color: "var(--brown)", padding: "3px 10px", borderRadius: "var(--radius-pill)",
          }}>
            🤝 6 founders exploring similar opportunities
          </span>
        </div>
        <p style={{ fontSize: "14px", color: "var(--fog)", lineHeight: "1.6" }}>
          VentureScope detected people exploring the same opportunities as you.
        </p>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center",
        padding: "14px 18px", background: "rgba(0,0,0,0.15)",
        border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginBottom: "28px",
      }}>
        <span style={{ fontSize: "11px", color: "var(--fog)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: "4px" }}>
          Filter:
        </span>

        <select style={selectStyle} value={domain} onChange={e => setDomain(e.target.value)}>
          {ALL_DOMAINS.map(d => <option key={d} value={d}>{d === "All" ? "All Domains" : d}</option>)}
        </select>

        <select style={selectStyle} value={skill} onChange={e => setSkill(e.target.value)}>
          {ALL_SKILLS.map(s => <option key={s} value={s}>{s === "All" ? "All Skills" : s}</option>)}
        </select>

        <select style={selectStyle} value={scoreBand} onChange={e => setScoreBand(e.target.value)}>
          {SCORE_BANDS.map(b => <option key={b} value={b}>{b === "All" ? "All Match Scores" : b}</option>)}
        </select>

        <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--fog)", fontFamily: "var(--font-mono)" }}>
          {MOCK_USERS.length} matches found
        </span>
      </div>

      {/* ── Card Grid ───────────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px",
      }}>
        {MOCK_USERS.map(user => <MatchCard key={user.id} user={user} />)}
      </div>

      {/* ── Footer note ─────────────────────────────────────────────────────── */}
      <div style={{ marginTop: "40px", paddingTop: "16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--fog)", fontStyle: "italic" }}>
          Co-Founder matching uses your SOUL profile domains and saved opportunities to surface relevant builders. Data sourced from TechCrunch, YC Directory — public records.
        </p>
      </div>
    </div>
  );
}
