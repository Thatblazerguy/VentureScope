import { useEffect, useRef, useState } from "react";
import "./login.css";
import { generateOTP, sendVerificationEmail } from "./utils/emailAuth";

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
      const cx = W * 0.5, cy = H * 0.4;
      const spot = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.6);
      spot.addColorStop(0,   "rgba(244,184,150,0.06)");
      spot.addColorStop(0.4, "rgba(160,96,48,0.03)");
      spot.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 18; i++) {
        const prog  = i / 18;
        const alpha = 0.022 + prog * 0.055;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(244,184,150,${alpha})`;
        ctx.lineWidth = 0.8;
        const yBase = H * 0.1 + prog * H * 0.72;
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 3) {
          const nx = x / W;
          const y = yBase
            + Math.sin(nx * Math.PI * 2.8 + t * 0.9 + i * 0.38) * (20 - i * 0.5)
            + Math.cos(nx * Math.PI * 4.5 + t * 0.65 + i)        * (9 - i * 0.2);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      t += 0.0045;
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

/* ── OTP Input — 6 individual digit boxes ────────────────────────────────── */
function OTPInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  function handleKey(e, idx) {
    if (e.key === "Backspace") {
      const next = value.slice(0, idx) + value.slice(idx + 1);
      onChange(next);
      if (idx > 0) inputs.current[idx - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = (value.slice(0, idx) + e.key + value.slice(idx + 1)).slice(0, 6);
      onChange(next);
      if (idx < 5) inputs.current[idx + 1]?.focus();
    }
  }

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "32px 0" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={() => {}}
          onKeyDown={e => handleKey(e, i)}
          onFocus={e => e.target.select()}
          style={{
            width: "48px",
            height: "56px",
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${d.trim() ? "var(--lgi-accent, #F4B896)" : "rgba(255,255,255,0.18)"}`,
            borderRadius: "8px",
            color: "var(--lgi-text, #E8D5C0)",
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: "22px",
            fontWeight: "500",
            textAlign: "center",
            outline: "none",
            caretColor: "transparent",
            transition: "border-color 200ms ease",
          }}
        />
      ))}
    </div>
  );
}

/* ── Signup Page ─────────────────────────────────────────────────────────── */
export default function SignupPage({ onSignup, onBack, onLogin }) {
  // Step 1: registration form
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  // Step 2: OTP verification
  const [step,        setStep]        = useState(1);   // 1 = form, 2 = otp
  const [otp,         setOtp]         = useState("");   // entered by user
  const [generatedOtp,setGeneratedOtp]= useState("");  // sent to email

  // Shared
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [info,    setInfo]    = useState("");

  // Field focus states
  const [fnFocus, setFnFocus] = useState(false);
  const [lnFocus, setLnFocus] = useState(false);
  const [emFocus, setEmFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);

  /* ── Step 1 → Send OTP ─────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields."); return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service to continue."); return;
    }
    setError("");
    setLoading(true);
    try {
      const code = generateOTP();
      setGeneratedOtp(code);
      await sendVerificationEmail(email, `${firstName} ${lastName}`, code);
      setStep(2);
      setInfo(`A 6-digit verification code was sent to ${email}`);
    } catch (err) {
      console.error(err);
      setError("Failed to send verification email. Please check your email address and try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Step 2 → Verify OTP ───────────────────────────────────────────── */
  function handleVerify(e) {
    e.preventDefault();
    if (otp.trim().length < 6) {
      setError("Please enter the full 6-digit code."); return;
    }
    if (otp.trim() !== generatedOtp) {
      setError("Incorrect code. Please check your email and try again.");
      setOtp("");
      return;
    }
    setError("");
    setLoading(true);
    // OTP correct — proceed
    setTimeout(() => { setLoading(false); if (onSignup) onSignup(); }, 600);
  }

  /* ── Resend OTP ─────────────────────────────────────────────────────── */
  async function handleResend() {
    setError("");
    setInfo("");
    setOtp("");
    setLoading(true);
    try {
      const code = generateOTP();
      setGeneratedOtp(code);
      await sendVerificationEmail(email, `${firstName} ${lastName}`, code);
      setInfo("A new code has been sent to your email.");
    } catch (err) {
      setError("Failed to resend. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── OTP Verification Step UI ───────────────────────────────────────── */
  if (step === 2) {
    return (
      <div className="lgi-root">
        <WarmCanvas />
        <nav className="lgi-nav">
          <button className="lgi-nav-logo" onClick={onBack}>VentureScope</button>
          <div className="lgi-nav-status">
            <span className="lgi-status-dot" />
            VERIFICATION STEP
          </div>
        </nav>

        <main className="lgi-main">
          <form className="lgi-form" onSubmit={handleVerify} noValidate style={{ textAlign: "center" }}>

            {/* Icon */}
            <div style={{
              width: "64px", height: "64px", borderRadius: "16px",
              background: "rgba(244,184,150,0.12)",
              border: "1px solid rgba(244,184,150,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", margin: "0 auto 24px",
            }}>
              ✉️
            </div>

            <h1 className="lgi-heading" style={{ fontSize: "42px" }}>Check your inbox</h1>
            <p className="lgi-subtext" style={{ textTransform: "none", letterSpacing: "0.03em", fontSize: "13px" }}>
              We sent a 6-digit verification code to<br />
              <strong style={{ color: "var(--lgi-accent, #F4B896)" }}>{email}</strong>
            </p>

            {error && <p className="lgi-error">{error}</p>}
            {info  && (
              <p style={{ fontSize: "12px", color: "#6fbf73", marginBottom: "16px", letterSpacing: "0.03em" }}>
                {info}
              </p>
            )}

            {/* OTP boxes */}
            <OTPInput value={otp} onChange={v => { setOtp(v); setError(""); }} />

            {/* Verify button */}
            <button
              type="submit"
              className={`lgi-submit ${loading ? "lgi-submit--loading" : ""}`}
              disabled={loading || otp.trim().length < 6}
            >
              {loading ? <span className="lgi-spinner" /> : "VERIFY & CONTINUE"}
            </button>

            {/* Resend / Back */}
            <p style={{ fontSize: "11px", color: "var(--lgi-muted, #A08060)", marginTop: "16px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              DIDN'T RECEIVE IT?{" "}
              <button
                type="button"
                className="lgi-link lgi-link--accent"
                style={{ display: "inline", width: "auto", textTransform: "uppercase", fontSize: "11px" }}
                onClick={handleResend}
                disabled={loading}
              >
                RESEND CODE
              </button>
            </p>

            <button
              type="button"
              className="lgi-link"
              style={{ marginTop: "8px", fontSize: "11px", textTransform: "uppercase" }}
              onClick={() => { setStep(1); setOtp(""); setError(""); setInfo(""); }}
            >
              ← BACK TO REGISTRATION
            </button>

          </form>
        </main>

        <PageFooter />
      </div>
    );
  }

  /* ── Step 1: Registration Form ──────────────────────────────────────── */
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
        <form
          className="lgi-form"
          onSubmit={handleSubmit}
          noValidate
          style={{ maxWidth: 460 }}
        >
          <h1 className="lgi-heading">Create Account</h1>
          <p className="lgi-subtext">
            ENTER YOUR CREDENTIALS TO ACCESS THE INTELLIGENCE PLATFORM.
          </p>

          {error && <p className="lgi-error">{error}</p>}

          {/* First + Last Name */}
          <div className="lgi-name-row">
            <div className={`lgi-field ${fnFocus ? "lgi-field--focused" : ""}`}>
              <label className="lgi-label" htmlFor="sg-firstname">First Name</label>
              <input id="sg-firstname" type="text" className="lgi-input" placeholder="Jane"
                value={firstName} onChange={e => setFirstName(e.target.value)}
                onFocus={() => setFnFocus(true)} onBlur={() => setFnFocus(false)}
                autoComplete="given-name" required />
              <div className="lgi-underline" />
            </div>
            <div className={`lgi-field ${lnFocus ? "lgi-field--focused" : ""}`}>
              <label className="lgi-label" htmlFor="sg-lastname">Last Name</label>
              <input id="sg-lastname" type="text" className="lgi-input" placeholder="Doe"
                value={lastName} onChange={e => setLastName(e.target.value)}
                onFocus={() => setLnFocus(true)} onBlur={() => setLnFocus(false)}
                autoComplete="family-name" required />
              <div className="lgi-underline" />
            </div>
          </div>

          {/* Corporate Email */}
          <div className={`lgi-field ${emFocus ? "lgi-field--focused" : ""}`}>
            <label className="lgi-label" htmlFor="sg-email">Corporate Email</label>
            <input id="sg-email" type="email" className="lgi-input" placeholder="name@firm.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onFocus={() => setEmFocus(true)} onBlur={() => setEmFocus(false)}
              autoComplete="email" required />
            <div className="lgi-underline" />
          </div>

          {/* Password */}
          <div className={`lgi-field ${pwFocus ? "lgi-field--focused" : ""}`}>
            <div className="lgi-label-row">
              <label className="lgi-label" htmlFor="sg-password" style={{ marginBottom: 0 }}>Password</label>
              <button type="button" className="lgi-show-toggle" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                {showPass ? "HIDE" : "SHOW"}
              </button>
            </div>
            <input id="sg-password" type={showPass ? "text" : "password"} className="lgi-input"
              placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              onFocus={() => setPwFocus(true)} onBlur={() => setPwFocus(false)}
              autoComplete="new-password" required />
            <div className="lgi-underline" />
          </div>

          {/* Checkbox — Terms */}
          <div className="lgi-checkbox-row" style={{ marginTop: 8 }}>
            <input id="sg-terms" type="checkbox" className="lgi-checkbox"
              checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} required />
            <label htmlFor="sg-terms" className="lgi-checkbox-label">
              I AGREE TO THE{" "}
              <button type="button" onClick={() => {}}>TERMS OF SERVICE</button>
              {" "}AND ACKNOWLEDGE THE{" "}
              <button type="button" onClick={() => {}}>PRIVACY POLICY</button>.
            </label>
          </div>

          {/* Checkbox — Newsletter */}
          <div className="lgi-checkbox-row">
            <input id="sg-newsletter" type="checkbox" className="lgi-checkbox"
              checked={newsletter} onChange={e => setNewsletter(e.target.checked)} />
            <label htmlFor="sg-newsletter" className="lgi-checkbox-label">
              SUBSCRIBE TO OUR WEEKLY VENTURE INTELLIGENCE NEWSLETTER AND PLATFORM UPDATES.
            </label>
          </div>

          {/* Submit */}
          <button
            id="sg-submit" type="submit"
            className={`lgi-submit ${loading ? "lgi-submit--loading" : ""}`}
            disabled={loading} style={{ marginTop: 16 }}
          >
            {loading ? <span className="lgi-spinner" /> : "CREATE ACCOUNT →"}
          </button>

          {/* Divider */}
          <div className="lgi-divider">
            <div className="lgi-divider-line" />
            <span className="lgi-divider-text">OR</span>
            <div className="lgi-divider-line" />
          </div>

          {/* Already have account */}
          <p className="lgi-register">
            ALREADY HAVE AN ACCOUNT?{" "}
            <button type="button" className="lgi-link lgi-link--accent"
              style={{ display: "inline", width: "auto" }} onClick={onLogin}>
              LOG IN
            </button>
          </p>

          {/* Encryption note */}
          <p className="lgi-encrypt-note">
            PROTECTED BY ENTERPRISE-GRADE 256-BIT ENCRYPTION.<br />
            ALL INSTITUTIONAL DATA IS SILOED AND ANONYMIZED BY DEFAULT.
          </p>
        </form>
      </main>

      <PageFooter />
    </div>
  );
}
