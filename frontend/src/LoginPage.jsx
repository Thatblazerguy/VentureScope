import { useEffect, useRef, useState } from "react";
import "./login.css";

/* ── Animated dark sculptural canvas background ───────────────────────────── */
function SculptureCanvas() {
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

      /* ── radial spotlight centre ── */
      const cx = W * 0.5, cy = H * 0.38;
      const spot = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.55);
      spot.addColorStop(0,   "rgba(60,35,18,0.55)");
      spot.addColorStop(0.45,"rgba(30,18,8,0.30)");
      spot.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, W, H);

      /* ── flowing contour lines ── */
      const lineCount = 22;
      for (let i = 0; i < lineCount; i++) {
        const progress = i / lineCount;
        const alpha = 0.03 + progress * 0.07;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(200,160,100,${alpha})`;
        ctx.lineWidth = 0.8;

        const yBase = H * 0.15 + progress * H * 0.65;
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 3) {
          const nx = x / W;
          const y = yBase
            + Math.sin(nx * Math.PI * 2.5 + t + i * 0.4)  * (24 - i * 0.5)
            + Math.cos(nx * Math.PI * 4   + t * 0.7 + i)  * (10 - i * 0.2)
            + Math.sin(nx * Math.PI * 1   - t * 0.4)      * 6;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      /* ── subtle central glow blob ── */
      const blob = ctx.createRadialGradient(cx, cy * 0.9, 0, cx, cy * 0.9, H * 0.28);
      blob.addColorStop(0,   "rgba(120,60,20,0.18)");
      blob.addColorStop(0.6, "rgba(80,35,10,0.06)");
      blob.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = blob;
      ctx.fillRect(0, 0, W, H);

      t += 0.005;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="lgi-canvas" />;
}

/* ── Main Login Page ─────────────────────────────────────────────────────── */
export default function LoginPage({ onLogin, onBack, onRequestAccess }) {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [emailFocus,  setEmailFocus]  = useState(false);
  const [passFocus,   setPassFocus]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    // Simulate auth — call onLogin to switch to the app
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  }

  return (
    <div className="lgi-root">
      <SculptureCanvas />

      {/* ── NAV ── */}
      <nav className="lgi-nav">
        <button className="lgi-nav-logo" onClick={onBack}>VentureScope</button>
        <div className="lgi-nav-status">
          <span className="lgi-status-dot" />
          SYSTEM STATUS: OPTIMAL
        </div>
      </nav>

      {/* ── FORM PANEL ── */}
      <main className="lgi-main">
        <form className="lgi-form" onSubmit={handleSubmit} noValidate>
          <h1 className="lgi-heading">Log in</h1>

          {error && <p className="lgi-error">{error}</p>}

          {/* Email */}
          <div className={`lgi-field ${emailFocus ? "lgi-field--focused" : ""}`}>
            <label className="lgi-label" htmlFor="lgi-email">Email Address</label>
            <input
              id="lgi-email"
              type="email"
              className="lgi-input"
              placeholder="name@venturescope.com"
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
              <label className="lgi-label" htmlFor="lgi-password">Password</label>
              <button
                type="button"
                className="lgi-show-toggle"
                onClick={() => setShowPass(p => !p)}
                tabIndex={-1}
              >
                {showPass ? "⊙ HIDE" : "⊙ SHOW"}
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
            {loading ? <span className="lgi-spinner" /> : "SIGN IN"}
          </button>

          {/* Links */}
          <button type="button" className="lgi-link" onClick={() => {}}>
            Forgot Username / Password?
          </button>

          <p className="lgi-register">
            Don&apos;t have an account?{" "}
            <button type="button" className="lgi-link lgi-link--accent" onClick={onRequestAccess}>
              Request Access
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
