import { Link } from "react-router-dom";

const CONTACT_EMAIL = "info@ohyeahsaas.com";
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=Get my stall on SkipQ`;

export default function ForVendors() {
  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
        @media (max-width: 768px) {
          .fv-nav { padding: 14px 24px !important; }
          .fv-hero { padding: 120px 24px 56px !important; }
          .fv-hero h1 { font-size: 44px !important; }
          .fv-section { padding: 48px 24px !important; }
          .fv-grid { grid-template-columns: 1fr !important; }
          .fv-steps { grid-template-columns: 1fr !important; }
          .fv-cta { flex-direction: column !important; align-items: flex-start !important; }
          footer { padding: 20px 24px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={s.nav} className="fv-nav">
        <div style={s.navLeft}>
          <Link to="/home" style={{ textDecoration: "none" }}>
            <button style={s.backBtn}>← Back to Home</button>
          </Link>
          <Link to="/home" style={{ textDecoration: "none" }}>
            <div style={s.logo}>Skip<span style={{ color: "#FF6B00" }}>Q</span></div>
          </Link>
        </div>
        <a href={MAILTO} style={{ textDecoration: "none" }}>
          <button style={s.navBtn}>Talk to Us</button>
        </a>
      </nav>

      {/* HERO — orange, like the deck cover */}
      <section style={s.hero} className="fv-hero">
        <div style={s.heroEyebrow}>SkipQ · Campus vendors</div>
        <h1 style={s.h1}>More orders.<br />No counter chaos.</h1>
        <p style={s.heroSub}>
          Paid, ready-to-cook orders straight to your phone — so your lunch rush
          runs itself and nobody walks away from a long line.
        </p>
        <a href={MAILTO} style={{ textDecoration: "none" }}>
          <button style={s.heroBtn}>Get Your Stall on SkipQ</button>
        </a>
      </section>

      {/* THE MONEY */}
      <section style={s.section} className="fv-section">
        <div style={s.eyebrow}>The money</div>
        <h2 style={s.h2}>You keep 100% of your menu price.</h2>
        <div style={s.grid} className="fv-grid">
          {[
            { mark: "₹", title: "Orders arrive paid", desc: "Every order is prepaid by UPI before you cook. No dues, no chasing, no cash handling." },
            { mark: "₹", title: "SkipQ's fee is paid by the student", desc: "Our service fee is added on top of your price — never taken out of it." },
            { mark: "₹", title: "Daily settlement to your bank", desc: "Yesterday's earnings land every morning, with a bank reference for each payout." },
            { mark: "₹", title: "Everything visible in your app", desc: "Live balance, payout history, and order records — no more guessing." },
          ].map((p) => (
            <div style={s.point} key={p.title}>
              <div style={s.dot}>{p.mark}</div>
              <div>
                <div style={s.pointTitle}>{p.title}</div>
                <div style={s.pointDesc}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...s.section, background: "#F2F0ED" }} className="fv-section">
        <div style={s.eyebrow}>Getting started</div>
        <h2 style={s.h2}>All you need is a smartphone.</h2>
        <div style={s.steps} className="fv-steps">
          {[
            { n: "1", title: "We create your account", desc: "You just set a password — no paperwork marathon." },
            { n: "2", title: "We set up your menu with you", desc: "Items, prices, photos — done together in one sitting." },
            { n: "3", title: "You're live", desc: "Orders start pinging your phone the same week." },
          ].map((st) => (
            <div style={s.stepCard} key={st.n}>
              <div style={s.stepNum}>{st.n}</div>
              <div style={s.stepTitle}>{st.title}</div>
              <div style={s.stepDesc}>{st.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — ink band, like the deck close */}
      <section style={s.ctaBand} className="fv-cta">
        <div>
          <div style={s.ctaTitle}>Your counter, without the crowd.</div>
          <div style={s.ctaSub}>Talk to us today — we'll have your stall live this week. Onboarding is free for early vendors.</div>
        </div>
        <a href={MAILTO} style={{ textDecoration: "none" }}>
          <button style={s.ctaBtn}>Contact the SkipQ Team</button>
        </a>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={s.logo}>Skip<span style={{ color: "#FF6B00" }}>Q</span></div>
          <div style={{ fontSize: 12, color: "#78716C" }}>
            For more details & onboarding —{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#E05A00", textDecoration: "none", fontWeight: 600 }}>{CONTACT_EMAIL}</a>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#A8A29E" }}>© 2026 SkipQ · Real-time campus food ordering</div>
      </footer>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { fontFamily: "'Poppins', 'Avenir Next', 'Segoe UI', system-ui, sans-serif", background: "#FAFAF8", color: "#1C1917", minHeight: "100vh" },
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 48px", background: "rgba(250,250,248,0.92)",
    backdropFilter: "blur(12px)", borderBottom: "1px solid #E7E4E0",
  },
  logo: { fontWeight: 800, fontSize: 20, color: "#1C1917", letterSpacing: "-0.02em" },
  navLeft: { display: "flex", alignItems: "center", gap: 16 },
  backBtn: {
    padding: "8px 16px", background: "transparent", color: "#57534E",
    border: "1.5px solid #E7E4E0", borderRadius: 999, fontWeight: 600, fontSize: 13, cursor: "pointer",
    fontFamily: "inherit",
  },
  navBtn: {
    padding: "10px 22px", background: "#1C1917", color: "#FAFAF8",
    border: "none", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer",
    fontFamily: "inherit",
  },
  hero: {
    background: "#FF6B00", color: "#FFFFFF",
    padding: "150px 80px 72px", display: "flex", flexDirection: "column", alignItems: "flex-start",
  },
  heroEyebrow: { fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#FFD9BD", marginBottom: 20 },
  h1: { fontSize: "clamp(44px, 6vw, 76px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.025em", marginBottom: 22 },
  heroSub: { fontSize: 18, color: "#FFE1CC", lineHeight: 1.6, marginBottom: 34, maxWidth: 520 },
  heroBtn: {
    padding: "15px 32px", background: "#FFFFFF", color: "#E05A00",
    border: "none", borderRadius: 999, fontWeight: 700, fontSize: 16, cursor: "pointer",
    fontFamily: "inherit",
  },
  section: { padding: "64px 80px" },
  eyebrow: { fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#E05A00", marginBottom: 12 },
  h2: { fontSize: "clamp(28px, 3.2vw, 40px)", fontWeight: 800, letterSpacing: "-0.015em", lineHeight: 1.12, marginBottom: 32, maxWidth: 640 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "22px 32px", maxWidth: 960 },
  point: { display: "flex", gap: 14, alignItems: "flex-start" },
  dot: {
    flex: "none", width: 38, height: 38, borderRadius: 999,
    background: "rgba(255,107,0,0.12)", color: "#E05A00",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 17, fontWeight: 800,
  },
  pointTitle: { fontSize: 17, fontWeight: 700, marginBottom: 3 },
  pointDesc: { fontSize: 14.5, color: "#78716C", lineHeight: 1.5 },
  steps: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, maxWidth: 960 },
  stepCard: { background: "#FFFFFF", border: "1px solid #E7E4E0", borderRadius: 16, padding: "26px 24px" },
  stepNum: { fontSize: 38, fontWeight: 800, color: "#FF6B00", opacity: 0.35, lineHeight: 1, marginBottom: 12 },
  stepTitle: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  stepDesc: { fontSize: 13.5, color: "#78716C", lineHeight: 1.5 },
  ctaBand: {
    background: "#1C1917", color: "#FAFAF8",
    padding: "56px 80px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 28,
  },
  ctaTitle: { fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em" },
  ctaSub: { fontSize: 14.5, color: "#A8A29E", marginTop: 8, maxWidth: 480, lineHeight: 1.55 },
  ctaBtn: {
    flex: "none", padding: "15px 32px", background: "#FF6B00", color: "#FFFFFF",
    border: "none", borderRadius: 999, fontWeight: 700, fontSize: 16, cursor: "pointer",
    fontFamily: "inherit",
  },
  footer: {
    padding: "24px 64px", borderTop: "1px solid #E7E4E0", background: "#FAFAF8",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
};
