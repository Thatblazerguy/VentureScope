import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../lib/api";

const levelColor = {
  INFO:   "var(--fog)",
  SCAN:   "var(--parchment)",
  RESULT: "var(--amber)",
  DB:     "#7ec99a",
  DONE:   "var(--amber-light)",
  ERROR:  "var(--danger)",
};

function TerminalLog() {
  const [logs, setLogs] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    const apiBase = API_BASE_URL || "http://localhost:8000";
    const eventSource = new EventSource(`${apiBase}/logs/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const logLine = JSON.parse(event.data);
        setLogs((prev) => {
          const next = [...prev, logLine];
          // keep last 100 lines
          if (next.length > 100) return next.slice(next.length - 100);
          return next;
        });
      } catch (err) {
        // Fallback for non-JSON lines
        setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), level: "INFO", msg: event.data }]);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

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
        height: "calc(100vh - 280px)",
        minHeight: "400px",
        overflowY: "auto",
      }}
    >
      {logs.length === 0 && (
        <div style={{ color: "var(--fog)", fontStyle: "italic" }}>Waiting for logs...</div>
      )}
      {logs.map((line, i) => (
        <div key={i} style={{ display: "flex", gap: "12px", animation: "fadeSlideUp 200ms ease both" }}>
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
      <div ref={messagesEndRef} />
    </div>
  );
}

export default function HeartbeatLog() {
  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: "24px", padding: "0 16px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "700", color: "var(--cream)", marginBottom: "6px" }}>
          HEARTBEAT Log
        </h2>
        <p style={{ fontSize: "14px", color: "var(--fog)" }}>
          Real-time activity log from the OpenClaw autonomous pipeline.
        </p>
      </div>
      <TerminalLog />
    </div>
  );
}
