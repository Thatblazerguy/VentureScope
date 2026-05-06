import { useEffect, useRef, useState } from "react";
import "./landing.css";

/* ── tiny intersection-observer hook ─────────────────────────────────────── */
function useReveal(threshold = 0.15) {
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

/* ── Animated noise canvas (hero background) ─────────────────────────────── */
function NoiseCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame;
    let t = 0;
    function draw() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width, H = canvas.height;
      // Draw subtle wave lines
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, W * 0.7);
      grad.addColorStop(0, "rgba(255,255,255,0.03)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Flowing lines
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${0.015 + i * 0.002})`;
        ctx.lineWidth = 0.8;
        const yBase = H * 0.3 + i * (H * 0.04);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 4) {
          const y = yBase + Math.sin((x / W) * Math.PI * 3 + t + i * 0.5) * 18
                        + Math.sin((x / W) * Math.PI * 6 + t * 1.3 + i) * 8;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      t += 0.006;
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={canvasRef} className="lp-hero-canvas" />;
}

/* ── WaveCard (dark feature card with animated wave) ─────────────────────── */
function WaveCard({ children, className = "" }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame, t = 0;
    function draw() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + i * 0.008})`;
        ctx.lineWidth = 1;
        const yBase = H * 0.45 + i * (H * 0.07);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 3) {
          const y = yBase + Math.sin((x / W) * Math.PI * 4 + t + i * 0.7) * 14
                        + Math.cos((x / W) * Math.PI * 2 + t * 0.8) * 7;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      t += 0.008;
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className={`lp-wave-card ${className}`}>
      <canvas ref={canvasRef} className="lp-wave-canvas" />
      <div className="lp-wave-card-content">{children}</div>
    </div>
  );
}

/* ── MarketCard (right panel with metric lines) ──────────────────────────── */
function MarketCard() {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`lp-market-card ${visible ? "lp-reveal" : ""}`}>
      <div className="lp-card-label">● ANALYSIS&nbsp;&nbsp;&nbsp;EST CLOSE: 2025</div>
      <h3 className="lp-market-title">Market<br />Saturation.</h3>
      <p className="lp-market-body">
        Cross-reference multiple investors and VCs to see which ideas are crowded
        — find niches while space still exists.
      </p>
      <div className="lp-market-metrics">
        <div className="lp-metric">
          <span className="lp-metric-num">247</span>
          <span className="lp-metric-lbl">COMPETITORS<br />FOUND</span>
        </div>
        <div className="lp-metric">
          <span className="lp-metric-num">89%</span>
          <span className="lp-metric-lbl">MORE<br />PROFITABLE</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Landing Page ───────────────────────────────────────────────────── */
export default function LandingPage({ onEnterApp, onLogin }) {
  const [heroRef, heroVisible] = useReveal(0.05);
  const [feat1Ref, feat1Visible] = useReveal();
  const [feat2Ref, feat2Visible] = useReveal();
  const [engineRef, engineVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();

  return (
    <div className="lp-root">
      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-logo">VentureScope</div>
        <div className="lp-nav-links">
          <button className="lp-nav-link" onClick={onLogin} style={{background:'none',border:'none',cursor:'pointer',font:'inherit'}}>Login</button>
          <button className="lp-nav-cta" onClick={onEnterApp}>Project Access</button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="lp-hero" ref={heroRef}>
        <NoiseCanvas />
        <div className={`lp-hero-inner ${heroVisible ? "lp-reveal" : ""}`}>
          <h1 className="lp-hero-heading">
            The fastest way to<br />
            discover what to build<br />
            next.
          </h1>
          <p className="lp-hero-sub">
            VentureScope inspects research, products, and funding signals so<br />
            unmet future-ready opportunities are emerging — before they<br />
            become crowded.
          </p>
          <p className="lp-hero-tagline">→ THE INTELLIGENCE LAYER FOR US</p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={onEnterApp}>
              START DISCOVERING &nbsp;→
            </button>
            <button className="lp-btn-ghost" onClick={onEnterApp}>
              EXPLORE OUR RADAR
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID 1 ─────────────────────────────────────────────── */}
      <section className="lp-section" ref={feat1Ref}>
        <div className={`lp-feature-grid ${feat1Visible ? "lp-reveal" : ""}`}>
          {/* ArXiv Pulse */}
          <WaveCard className="lp-arxiv-card">
            <div className="lp-card-label">● LIVE</div>
            <h3 className="lp-feature-title">ArXiv Pulse</h3>
            <p className="lp-feature-body">
              Track emerging research breakthroughs before they
              reach the commercialized market.
            </p>
          </WaveCard>

          {/* Market Saturation */}
          <MarketCard />
        </div>

        {/* Row 2 */}
        <div className={`lp-feature-grid lp-feature-grid-equal ${feat1Visible ? "lp-reveal lp-reveal-d2" : ""}`}>
          {/* Inverse Velocity */}
          <div className="lp-plain-card">
            <h3 className="lp-feature-title">Inverse Velocity</h3>
            <p className="lp-feature-body">
              Follow where capital is flowing through SEI, STAK and more RSS signals
              before it becomes obvious.
            </p>
          </div>

          {/* Unbiased Due Diligence */}
          <WaveCard className="lp-dd-card">
            <div className="lp-card-label">● INTELLIGENCE</div>
            <h3 className="lp-feature-title">Unbiased Due Diligence</h3>
            <p className="lp-feature-body">
              Remove cognitive bias from your research process with data, hard
              computational evidence and historical pattern matching.
            </p>
          </WaveCard>
        </div>
      </section>

      {/* ── DISCOVERY ENGINE ───────────────────────────────────────────── */}
      <section className="lp-section lp-engine-section" ref={engineRef}>
        <div className={`lp-engine-grid ${engineVisible ? "lp-reveal" : ""}`}>
          <div className="lp-engine-text">
            <div className="lp-card-label">● AUTONOMOUSLY COMPILING: ACTIVE</div>
            <h2 className="lp-engine-heading">
              <em>The Discovery<br />Engine</em>
            </h2>
            <p className="lp-engine-body">
              Our autonomous pipeline analyzes research, products, and funding signals to generate your
              personalized opportunity feed — updated every week.
            </p>
          </div>
          <WaveCard className="lp-engine-visual">
            <div className="lp-engine-stats">
              <div className="lp-engine-stat">
                <span className="lp-engine-stat-num">12K+</span>
                <span className="lp-engine-stat-lbl">Papers Indexed</span>
              </div>
              <div className="lp-engine-stat">
                <span className="lp-engine-stat-num">850+</span>
                <span className="lp-engine-stat-lbl">Signals Daily</span>
              </div>
              <div className="lp-engine-stat">
                <span className="lp-engine-stat-num">99%</span>
                <span className="lp-engine-stat-lbl">Uptime</span>
              </div>
            </div>
          </WaveCard>
        </div>

        {/* Footer links row */}
        <div className={`lp-engine-footer ${engineVisible ? "lp-reveal lp-reveal-d2" : ""}`}>
          <span className="lp-footer-label">QUANTITATIVE ANALYSIS · STRATEGIC AWARENESS</span>
          <div className="lp-footer-links">
            <a href="#" className="lp-footer-link">Support</a>
            <a href="#" className="lp-footer-link">Anti-Enshitment</a>
            <a href="#" className="lp-footer-link">Benchmark</a>
            <a href="#" className="lp-footer-link">Safety</a>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="lp-cta-section" ref={ctaRef}>
        <div className={`lp-cta-inner ${ctaVisible ? "lp-reveal" : ""}`}>
          <h2 className="lp-cta-heading">
            <em>Stop guessing. Start<br />building.</em>
          </h2>
          <p className="lp-cta-sub">
            Join the exclusive layer of founders using GenAI research to lead
            the next decade of innovation.
          </p>
          <button className="lp-btn-outline" onClick={onEnterApp}>
            JOIN VENTURESCOPE &nbsp;→
          </button>
        </div>
      </section>

      {/* ── PAGE FOOTER ────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <span className="lp-footer-logo">VentureScope</span>
          <p className="lp-footer-copy">
            Mapping the opportunities / Radar for the<br />
            first movers of venture capital
          </p>
        </div>
        <div className="lp-footer-nav">
          <a href="#" className="lp-footer-link">Platform</a>
          <a href="#" className="lp-footer-link">Privacy</a>
          <a href="#" className="lp-footer-link">Terms</a>
        </div>
      </footer>
    </div>
  );
}
