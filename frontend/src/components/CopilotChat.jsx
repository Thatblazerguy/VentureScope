import { useMemo, useState, useRef, useEffect } from 'react';
import { useCopilotStream } from '../hooks/useCopilotStream';

const starterMessages = [
  {
    role: 'system',
    content: 'OpenClaw is online. Ask for a summary of current opportunities or a deeper read on a signal.',
    timestamp: new Date().toISOString(),
  },
];

// ─── Timestamp formatter ────────────────────────────────────────────────────
function formatTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Suggestion chip data ───────────────────────────────────────────────────
const SUGGESTION_CHIPS = [
  "What are my top opportunities right now?",
  "Which domain has the most research momentum?",
  "Summarize the latest signals across all my domains.",
];

export function CopilotChat() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState('');
  const { isStreaming, error, sendMessage, cancel } = useCopilotStream();
  const messagesEndRef = useRef(null);

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, isStreaming]);

  const handleSend = async (messageText) => {
    if (!messageText.trim() || isStreaming) return;
    
    setInput('');
    setMessages((current) => [
      ...current, 
      { role: 'user', content: messageText, timestamp: new Date().toISOString() }, 
      { role: 'assistant', content: '', timestamp: new Date().toISOString() }
    ]);

    try {
      await sendMessage(
        messageText,
        (chunk, complete = chunk) => {
          setMessages((current) => {
            const next = [...current];
            next[next.length - 1] = {
              role: 'assistant',
              content: complete,
              timestamp: next[next.length - 1].timestamp || new Date().toISOString()
            };
            return next;
          });
        },
      );
    } catch (streamError) {
      if (streamError.name === 'AbortError') return;

      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = {
          role: 'assistant',
          content: 'The copilot stream failed. Try again after the OpenClaw runtime is reachable.',
          timestamp: new Date().toISOString()
        };
        return next;
      });
    }
  };

  const handleStop = () => {
    cancel();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "560px",
      }}
    >
      {/* ── Chat Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              fontWeight: "600",
              color: "var(--cream)",
              marginBottom: "2px",
            }}
          >
            Venture Copilot
          </h2>
          <p style={{ fontSize: "12px", color: "var(--fog)" }}>
            Powered by OpenClaw + your SOUL context
          </p>
        </div>

        {/* Stream status indicator */}
        {isStreaming && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(117, 86, 63, 0.08)",
              border: "1px solid rgba(117, 86, 63, 0.2)",
              animation: "fadeSlideUp 200ms ease both",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--amber)",
                animation: "amberPulse 1.5s ease-out infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--amber-light)",
                letterSpacing: "0.05em",
              }}
            >
              ⚡ Thinking...
            </span>
          </div>
        )}
      </div>

      {/* ── Messages Container ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          // Glassmorphism background
          background: "rgba(232, 218, 207, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* ── Welcome message (when only system message or empty) ── */}
        {messages.length <= 1 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: "24px",
              paddingTop: "32px",
            }}
          >
            {/* Logo / icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "var(--radius-lg)",
                background: "linear-gradient(135deg, rgba(117,86,63,0.15), rgba(117,86,63,0.08))",
                border: "1px solid rgba(117,86,63,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
              }}
            >
              ⚡
            </div>

            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "var(--cream)",
                  marginBottom: "8px",
                }}
              >
                Your Venture Copilot is ready.
              </h3>
              <p style={{ fontSize: "13px", color: "var(--fog)", maxWidth: "340px", lineHeight: "1.6" }}>
                Ask anything about your tracked domains, signals, or investment landscape.
              </p>
            </div>

            {/* Suggestion chips */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "460px" }}>
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setInput(chip);
                    setTimeout(() => handleSend(chip), 50);
                  }}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--parchment)",
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    padding: "10px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 150ms ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-raised)";
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.color = "var(--cream)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--surface)";
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--parchment)";
                  }}
                >
                  <span style={{ color: "var(--amber)", opacity: 0.7, fontSize: "12px", flexShrink: 0 }}>→</span>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Rendered messages ── */}
        {messages.map((msg, i) => {
          // Skip rendering the system prompt
          if (msg.role === "system") return null;

          const isUser = msg.role === "user";
          const isLastAI = !isUser && i === messages.length - 1;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                animation: "fadeSlideUp 300ms ease both",
              }}
            >
              {/* Role label + timestamp */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  marginBottom: "4px",
                  padding: isUser ? "0" : "0 4px",
                }}
              >
                {!isUser && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--amber)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Copilot
                  </span>
                )}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fog)" }}>
                  {msg.timestamp ? formatTime(msg.timestamp) : ""}
                </span>
                {isUser && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--amber)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    You
                  </span>
                )}
              </div>

              {/* Message bubble */}
              {isUser ? (
                <div className="vs-chat-bubble-user">
                  {msg.content}
                </div>
              ) : (
                <div className="vs-chat-bubble-ai">
                  {msg.content}
                  {/* Streaming cursor on the last AI message while streaming */}
                  {isLastAI && isStreaming && (
                    <span className="vs-stream-cursor" />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
          background: "var(--panel)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          {/* Text input */}
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              className="vs-input"
              placeholder="Ask your Copilot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" && (e.metaKey || e.ctrlKey)) || e.key === "Enter") {
                  e.preventDefault();
                  if (!isStreaming && input.trim()) handleSend(input);
                }
              }}
              disabled={isStreaming}
              style={{ paddingRight: "80px" }}
            />
            {/* Keyboard shortcut label */}
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--fog)",
                pointerEvents: "none",
                letterSpacing: "0.04em",
              }}
            >
              ⌘↵
            </span>
          </div>

          {/* Send / Stop button */}
          {isStreaming ? (
            <button
              className="vs-btn vs-btn-danger"
              onClick={handleStop}
              style={{ flexShrink: 0, padding: "9px 16px" }}
            >
              ◼ Stop
            </button>
          ) : (
            <button
              className="vs-btn vs-btn-primary"
              onClick={() => { if (input.trim()) handleSend(input); }}
              disabled={!input.trim()}
              style={{
                flexShrink: 0,
                padding: "9px 20px",
              }}
            >
              Send →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}