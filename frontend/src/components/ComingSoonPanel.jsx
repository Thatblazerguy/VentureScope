export default function ComingSoonPanel({ icon, title, description, eta, children }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        minHeight: "420px",
        border: "1px solid var(--border)",
        background: "var(--panel)",
      }}
    >
      {/* Blurred preview content behind the overlay */}
      <div className="vs-coming-soon-content">
        {children}
      </div>

      {/* Shimmer animation on top of blur */}
      <div
        className="animate-shimmer"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Lock overlay */}
      <div className="vs-coming-soon-overlay">
        {/* Lock icon with amber glow */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-lg)",
            background: "rgba(200, 146, 58, 0.12)",
            border: "1px solid rgba(200, 146, 58, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            marginBottom: "4px",
            boxShadow: "0 0 24px rgba(200, 146, 58, 0.15)",
          }}
        >
          🔒
        </div>

        {/* Icon + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "22px" }}>{icon}</span>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: "600",
              color: "var(--cream)",
            }}
          >
            {title}
          </h3>
        </div>

        {/* COMING SOON badge */}
        <span
          className="vs-badge vs-badge-amber"
          style={{ letterSpacing: "0.1em" }}
        >
          Coming Soon
        </span>

        {/* Description */}
        <p
          style={{
            fontSize: "14px",
            color: "var(--parchment)",
            textAlign: "center",
            maxWidth: "440px",
            lineHeight: "1.65",
          }}
        >
          {description}
        </p>

        {/* ETA badge */}
        {eta && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              marginTop: "4px",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fog)" }}>
              ETA
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--parchment)", fontWeight: "500" }}>
              {eta}
            </span>
          </div>
        )}

        {/* Get notified button */}
        <button
          className="vs-btn vs-btn-ghost"
          onClick={() => console.log(`[VentureScope] Notification interest logged for: ${title}`)}
          style={{ marginTop: "8px" }}
        >
          🔔 Get Notified
        </button>
      </div>
    </div>
  );
}
