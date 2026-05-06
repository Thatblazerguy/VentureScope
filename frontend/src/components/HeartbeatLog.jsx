import ComingSoonPanel from "./ComingSoonPanel";

// Blurred mock terminal log preview
function MockTerminalLog() {
  const mockLines = [
    { time: "13:37:02", level: "INFO",    msg: "HEARTBEAT triggered by SOUL context change" },
    { time: "13:37:03", level: "INFO",    msg: "Domains in scope: underwater robotics, ai agents" },
    { time: "13:37:04", level: "SCAN",    msg: "Querying ArXiv API — underwater robotics" },
    { time: "13:37:06", level: "RESULT",  msg: "ArXiv: 10 papers found, 3 new since last run" },
    { time: "13:37:07", level: "SCAN",    msg: "Querying GitHub Search — underwater robotics" },
    { time: "13:37:09", level: "RESULT",  msg: "GitHub: 20 repos found, 5 with recent commits" },
    { time: "13:37:09", level: "DB",      msg: "Upserted to Supabase: 1 record (score: 84)" },
    { time: "13:37:10", level: "SCAN",    msg: "Querying ArXiv API — ai agents" },
    { time: "13:37:12", level: "RESULT",  msg: "ArXiv: 22 papers found, 8 new since last run" },
    { time: "13:37:13", level: "RESULT",  msg: "GitHub: 45 repos found, 12 recently updated" },
    { time: "13:37:14", level: "DB",      msg: "Upserted to Supabase: 1 record (score: 91)" },
    { time: "13:37:14", level: "DONE",    msg: "Pipeline complete in 12.4s · 2 domains · 2 upserts" },
  ];

  const levelColor = {
    INFO:   "var(--fog)",
    SCAN:   "var(--parchment)",
    RESULT: "var(--amber)",
    DB:     "#7ec99a",
    DONE:   "var(--amber-light)",
  };

  return (
    <div
      style={{
        padding: "20px 24px",
        background: "var(--ink)",
        borderRadius: "var(--radius-lg)",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        lineHeight: "2",
        margin: "16px",
        border: "1px solid var(--border)",
        maxHeight: "340px",
        overflow: "hidden",
      }}
    >
      {mockLines.map((line, i) => (
        <div key={i} style={{ display: "flex", gap: "12px" }}>
          <span style={{ color: "var(--fog)", flexShrink: 0 }}>[{line.time}]</span>
          <span
            style={{
              color: levelColor[line.level] || "var(--parchment)",
              flexShrink: 0,
              minWidth: "52px",
              fontWeight: line.level === "DONE" ? "500" : "400",
            }}
          >
            {line.level}
          </span>
          <span style={{ color: "var(--parchment)" }}>{line.msg}</span>
        </div>
      ))}
    </div>
  );
}

export default function HeartbeatLog() {
  return (
    <ComingSoonPanel
      icon="💓"
      title="HEARTBEAT Log"
      description="Every OpenClaw pipeline run will be logged here in real-time — with timestamps, domains scanned, signal counts, Supabase upsert results, and total duration. Full observability into your AI agent's activity."
      eta="~3 weeks"
    >
      <MockTerminalLog />
    </ComingSoonPanel>
  );
}
