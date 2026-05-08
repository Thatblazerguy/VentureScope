import { useEffect, useRef, useState } from "react";
import "./landing.css";

/* ── Intersection-observer reveal hook ──────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Animated hero canvas (warm flowing contour lines) ─────────────────── */
function HeroCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame, t = 0;
    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      // Radial warm glow
      const glow = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.6);
      glow.addColorStop(0,   "rgba(244,184,150,0.06)");
      glow.addColorStop(0.5, "rgba(160,96,48,0.03)");
      glow.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      // Flowing contour lines
      for (let i = 0; i < 16; i++) {
        const prog  = i / 16;
        const alpha = 0.025 + prog * 0.055;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(244,184,150,${alpha})`;
        ctx.lineWidth = 0.9;
        const yBase = H * 0.22 + prog * H * 0.56;
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 4) {
          const nx = x / W;
          const y = yBase
            + Math.sin(nx * Math.PI * 2.8 + t + i * 0.45) * (22 - i * 0.6)
            + Math.cos(nx * Math.PI * 5.2 + t * 0.75 + i) * (9 - i * 0.2);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      t += 0.005;
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="lp-hero-canvas" />;
}

/* ── WaveCard (card with animated wave texture) ─────────────────────────── */
function WaveCard({ children, className = "" }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame, t = 0;
    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < 10; i++) {
        const prog  = i / 10;
        const alpha = 0.03 + prog * 0.07;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(244,184,150,${alpha})`;
        ctx.lineWidth = 1;
        const yBase = H * 0.38 + i * (H * 0.065);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 3) {
          const y = yBase
            + Math.sin((x / W) * Math.PI * 4 + t + i * 0.7) * 14
            + Math.cos((x / W) * Math.PI * 2 + t * 0.8 + i * 0.3) * 7;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      t += 0.007;
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <div className={`lp-wave-card ${className}`}>
      <canvas ref={canvasRef} className="lp-wave-canvas" />
      <div className="lp-wave-card-content">{children}</div>
    </div>
  );
}

/* ── Market Saturation Card ──────────────────────────────────────────────── */
function MarketCard() {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`lp-market-card ${visible ? "lp-reveal" : ""}`}>
      <div className="lp-card-chips">
        <span className="lp-chip">■ Analysis</span>
        <span className="lp-chip lp-chip--accent">Gap Score: High</span>
      </div>
      <h3 className="lp-market-title">Market<br />Saturation.</h3>
      <p className="lp-market-body">
        Cross-reference ProductHunt and GitHub to see which ideas are
        crowded — and where white space still exists.
      </p>
      <p className="lp-market-score">OPPORTUNITY SCORE: 92nd PERCENTILE</p>
    </div>
  );
}

/* ── Animated stat bar (Discovery Engine) ────────────────────────────────── */
function StatBar({ label, value, max, pct, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className="lp-engine-stat-row">
      <div className="lp-engine-stat-header">
        <span className="lp-engine-stat-lbl">{label}</span>
        <span className="lp-engine-stat-num">{value}</span>
      </div>
      <div className="lp-engine-bar-track">
        <div
          className="lp-engine-bar-fill"
          style={{
            width: visible ? `${pct}%` : "0%",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Main Landing Page ───────────────────────────────────────────────────── */
export default function LandingPage({ onEnterApp, onLogin, onSignup }) {
  const [heroRef,   heroVisible]   = useReveal(0.05);
  const [feat1Ref,  feat1Visible]  = useReveal();
  const [feat2Ref,  feat2Visible]  = useReveal();
  const [engineRef, engineVisible] = useReveal();
  const [ctaRef,    ctaVisible]    = useReveal();

  return (
    <div className="lp-root">

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <button className="lp-nav-logo" onClick={() => {}}>VentureScope</button>
        <div className="lp-nav-links">
          <button className="lp-nav-login" onClick={onLogin}>Login</button>
          <button className="lp-nav-cta"   onClick={onSignup || onEnterApp}>Sign Up</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="lp-hero" ref={heroRef}>
        <HeroCanvas />
        <div className={`lp-hero-inner ${heroVisible ? "lp-reveal" : ""}`}>
          <h1 className="lp-hero-heading">
            The fastest way to<br />
            discover what to<br />
            build next.
          </h1>
          <p className="lp-hero-sub">
            VentureScope tracks research, products, and funding signals to reveal
            where real opportunities are emerging — before they become crowded.
          </p>
          <span className="lp-hero-attribution">
            — THE INTELLIGENCE LAYER FOR VC
          </span>
          <div>
            <a href="#features" className="lp-hero-cta-link">
              START DISCOVERING &nbsp;→
            </a>
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID — ROW 1 ────────────────────────────────────────── */}
      <section id="features" className="lp-section" ref={feat1Ref}>
        <div className={`lp-feature-grid ${feat1Visible ? "lp-reveal" : ""}`}>

          {/* ArXiv Pulse */}
          <WaveCard className="lp-arxiv-card">
            <div className="lp-card-label">
              <span className="lp-card-label-dot" />
              LIVE
            </div>
            <h3 className="lp-feature-title">ArXiv Pulse</h3>
            <p className="lp-feature-body">
              Track emerging research breakthroughs before they
              reach the commercial market.
            </p>
          </WaveCard>

          {/* Market Saturation */}
          <MarketCard />
        </div>

        {/* ── ROW 2 ─────────────────────────────────────────────────────── */}
        <div
          ref={feat2Ref}
          className={`lp-feature-grid lp-feature-grid-equal ${feat2Visible ? "lp-reveal lp-reveal-d2" : ""}`}
        >
          {/* Investor Velocity */}
          <div className="lp-plain-card">
            <div className="lp-plain-card-icon">↗</div>
            <h3 className="lp-feature-title">Investor Velocity</h3>
            <p className="lp-feature-body">
              Follow where capital is flowing through SEC EDGAR and news RSS
              signals before it becomes obvious.
            </p>
          </div>

          {/* Unbiased Due Diligence */}
          <WaveCard className="lp-dd-card">
            <div className="lp-card-label">● INTELLIGENCE</div>
            <h3 className="lp-feature-title">
              <em>Unbiased Due Diligence</em>
            </h3>
            <p className="lp-feature-body">
              Remove cognitive bias from your investment process with cold, hard
              computational evidence and historical pattern matching.
            </p>
          </WaveCard>
        </div>
      </section>

      {/* ── DISCOVERY ENGINE ────────────────────────────────────────────── */}
      <section className="lp-section lp-engine-section" ref={engineRef}>
        <div className={`lp-engine-grid ${engineVisible ? "lp-reveal" : ""}`}>

          <div className="lp-engine-text">
            <div className="lp-card-label">
              <span className="lp-card-label-dot" />
              AUTONOMOUS PIPELINE: ACTIVE
            </div>
            <h2 className="lp-engine-heading">
              <em>The Discovery<br />Engine</em>
            </h2>
            <p className="lp-engine-body">
              Our autonomous pipeline continuously analyzes research papers,
              commercial products, and funding signals to surface your personalized
              opportunity feed — refreshed every week.
            </p>
          </div>

          <WaveCard className="lp-engine-visual">
            <div className="lp-engine-stats">
              <StatBar label="Research Papers" value="47" pct={72} delay={0} />
              <StatBar label="Commercial Products" value="2"  pct={18} delay={120} />
            </div>
            <p className="lp-engine-caption">
              DISSOLVING THE INNOVATION GAP: THE DELTA OF OPPORTUNITY
            </p>
          </WaveCard>
        </div>

        {/* ── Social Proof Bar ──────────────────────────────────────────── */}
        <div className={`lp-engine-footer ${engineVisible ? "lp-reveal lp-reveal-d2" : ""}`}>
          <span className="lp-footer-label">
            QUANTITATIVE ANALYSIS &nbsp;|&nbsp; STRATEGIC ADVANTAGE
          </span>
          <div className="lp-footer-logos">
            {["Sequoia", "Andreessen", "Benchmark", "Index"].map(name => (
              <span key={name} className="lp-footer-logo-name">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="lp-cta-section" ref={ctaRef}>
        <div className={`lp-cta-inner ${ctaVisible ? "lp-reveal" : ""}`}>
          <h2 className="lp-cta-heading">
            <em>Stop guessing.<br />Start building.</em>
          </h2>
          <p className="lp-cta-sub">
            Join the exclusive layer of founders using GenAI research to lead
            the next decade of innovation.
          </p>
          <button className="lp-btn-primary" onClick={onSignup || onEnterApp}>
            JOIN VENTURESCOPE &nbsp;→
          </button>
        </div>
      </section>

      {/* ── PAGE FOOTER ─────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <span className="lp-footer-logo">VentureScope</span>
          <p className="lp-footer-tagline">
            THE INTELLIGENCE RADAR<br />FOR THE FIRST MOVERS OF VENTURE CAPITAL
          </p>
        </div>
        <div className="lp-footer-nav">
          <div className="lp-footer-nav-links">
            <a href="#" className="lp-footer-link">Platform</a>
            <a href="#" className="lp-footer-link">Privacy</a>
            <a href="#" className="lp-footer-link">Terms</a>
          </div>
          <span className="lp-footer-copy">© 2025 VentureScope. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
