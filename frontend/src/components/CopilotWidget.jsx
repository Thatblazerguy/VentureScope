import { useState } from 'react';
import { CopilotChat } from './CopilotChat';

/* ─── CopilotWidget — Floating popup chatbot ────────────────────────────────
   Wraps the existing CopilotChat component in a fixed floating panel.
   Zero changes to CopilotChat logic, API calls, or streaming.
─────────────────────────────────────────────────────────────────────────── */
export default function CopilotWidget({ apiBase, domains }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Keyframes injected once ───────────────────────────────────────── */}
      <style>{`
        @keyframes copilotSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes copilotDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>

      {/* ── Floating Popup Panel ─────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '32px',
            width: '420px',
            height: '580px',
            background: 'var(--panel)',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.28), 0 2px 12px rgba(0,0,0,0.18)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'copilotSlideUp 250ms ease-out both',
          }}
        >
          {/* ── Popup Header ───────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
              background: 'var(--panel)',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--cream)',
                  marginBottom: '2px',
                  lineHeight: 1.3,
                }}
              >
                Venture Copilot
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--fog)', letterSpacing: '0.02em' }}>
                Powered by OpenClaw + your SOUL context
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Venture Copilot"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--fog)',
                fontSize: '18px',
                lineHeight: 1,
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'color 150ms ease, background 150ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--cream)';
                e.currentTarget.style.background = 'var(--surface)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--fog)';
                e.currentTarget.style.background = 'none';
              }}
            >
              ✕
            </button>
          </div>

          {/* ── CopilotChat fills the rest of the panel ──────────────────── */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CopilotChat apiBase={apiBase} domains={domains} />
          </div>
        </div>
      )}

      {/* ── Floating Trigger Button ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close Venture Copilot' : 'Open Venture Copilot'}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--amber, #75563f)',
          border: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.22), 0 1px 6px rgba(0,0,0,0.14)',
          zIndex: 1001,
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          // Live indicator container needs relative position
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.18)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.22), 0 1px 6px rgba(0,0,0,0.14)';
        }}
      >
        {open ? '✕' : '⚡'}

        {/* Pulsing green live indicator dot */}
        {!open && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: '#6fbf73',
              border: '1.5px solid var(--panel, #4A3828)',
              animation: 'copilotDotPulse 2.2s ease-in-out infinite',
            }}
          />
        )}
      </button>

      {/* ── Mobile overrides ─────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 520px) {
          .copilot-panel {
            width: 100vw !important;
            height: 60vh !important;
            bottom: 0 !important;
            right: 0 !important;
            border-radius: 16px 16px 0 0 !important;
          }
        }
      `}</style>
    </>
  );
}
