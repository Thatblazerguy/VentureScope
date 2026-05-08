import { useEffect, useRef, useState } from "react";
import "./login.css";

/* ── Animated warm background canvas ───────────────────────────────────── */
function WarmCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, t = 0;
    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W * 0.5, cy = H * 0.38;
      const spot = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.6);
      spot.addColorStop(0,   "rgba(244,184,150,0.07)");
      spot.addColorStop(0.4, "rgba(160,96,48,0.04)");
      spot.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 20; i++) {
        const prog  = i / 20;
        const alpha = 0.025 + prog * 0.06;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(244,184,150,${alpha})`;
        ctx.lineWidth = 0.8;
        const yBase = H * 0.12 + prog * H * 0.68;
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 3) {
          const nx = x / W;
          const y = yBase
            + Math.sin(nx * Math.PI * 2.5 + t + i * 0.4) * (22 - i * 0.5)
            + Math.cos(nx * Math.PI * 4   + t * 0.7 + i) * (10 - i * 0.2)
            + Math.sin(nx * Math.PI       - t * 0.4)      * 6;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      t += 0.005;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="lgi-canvas" />;
}

/* ── Shared Footer ──────────────────────────────────────────────────────── */
function PageFooter() {
  return (
    <footer className="lgi-footer">
      <div className="lgi-footer-brand">
        <span className="lgi-footer-logo">VentureScope</span>
        <p className="lgi-footer-tagline">
          THE INTELLIGENCE RADAR<br />FOR THE FIRST MOVERS OF VC
        </p>
      </div>
      <div className="lgi-footer-nav">
        <div className="lgi-footer-links">
          <a href="#" className="lgi-footer-link">Platform</a>
          <a href="#" className="lgi-footer-link">Privacy</a>
          <a href="#" className="lgi-footer-link">Terms</a>
        </div>
        <span className="lgi-footer-copy">© 2025 VentureScope. All rights reserved.</span>
      </div>
    </footer>
  );
}

/* ── Login Page — no OTP, direct sign in ────────────────────────────────── */
export default function LoginPage({ onLogin, onBack, onRequestAccess }) {
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus,  setPassFocus]  = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    // Direct login — no OTP
    setTimeout(() => { setLoading(false); onLogin(); }, 600);
  }

  return (
    <div className="lgi-root">
      <WarmCanvas />

      {/* NAVBAR */}
      <nav className="lgi-nav">
        <button className="lgi-nav-logo" onClick={onBack}>VentureScope</button>
        <div className="lgi-nav-status">
          <span className="lgi-status-dot" />
          SYSTEM STATUS: OPTIMAL
        </div>
      </nav>

      {/* FORM */}
      <main className="lgi-main">
        <form className="lgi-form" onSubmit={handleSubmit} noValidate>
          <h1 className="lgi-heading">Sign in</h1>
          <p className="lgi-subtext">ENTER YOUR CREDENTIALS TO ACCESS THE INTELLIGENCE LAYER</p>

          {error && <p className="lgi-error">{error}</p>}

          {/* Email */}
          <div className={`lgi-field ${emailFocus ? "lgi-field--focused" : ""}`}>
            <label className="lgi-label" htmlFor="lgi-email">Email Address</label>
            <input
              id="lgi-email"
              type="email"
              className="lgi-input"
              placeholder="name@institution.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              autoComplete="email"
              required
            />
            <div className="lgi-underline" />
          </div>

          {/* Password */}
          <div className={`lgi-field ${passFocus ? "lgi-field--focused" : ""}`}>
            <div className="lgi-label-row">
              <label className="lgi-label" htmlFor="lgi-password" style={{ marginBottom: 0 }}>
                Password
              </label>
              <button
                type="button"
                className="lgi-show-toggle"
                onClick={() => setShowPass(p => !p)}
                tabIndex={-1}
              >
                {showPass ? "HIDE" : "SHOW"}
              </button>
            </div>
            <input
              id="lgi-password"
              type={showPass ? "text" : "password"}
              className="lgi-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
              autoComplete="current-password"
              required
            />
            <div className="lgi-underline" />
          </div>

          {/* Submit */}
          <button
            id="lgi-submit"
            type="submit"
            className={`lgi-submit ${loading ? "lgi-submit--loading" : ""}`}
            disabled={loading}
          >
            {loading ? <span className="lgi-spinner" /> : "SIGN IN →"}
          </button>

          <button type="button" className="lgi-link" onClick={() => {}}>
            FORGOT USERNAME / PASSWORD?
          </button>

          <p className="lgi-register">
            DON'T HAVE AN ACCOUNT?{" "}
            <button
              type="button"
              className="lgi-link lgi-link--accent"
              style={{ display: "inline", width: "auto" }}
              onClick={onRequestAccess}
            >
              SIGNUP
            </button>
          </p>
        </form>
      </main>

      <PageFooter />
    </div>
  );
}
