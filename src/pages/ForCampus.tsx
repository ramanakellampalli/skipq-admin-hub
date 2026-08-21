import { Link } from "react-router-dom";

const CONTACT_EMAIL = "info@ohyeahsaas.com";
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=SkipQ campus partnership`;

export default function ForCampus() {
  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
        @media (max-width: 768px) {
          .fc-nav { padding: 14px 24px !important; }
          .fc-hero { padding: 120px 24px 56px !important; }
          .fc-hero h1 { font-size: 40px !important; }
          .fc-section { padding: 48px 24px !important; }
          .fc-band { padding: 56px 24px !important; }
          .fc-band div { font-size: 30px !important; }
          .fc-grid { grid-template-columns: 1fr !important; }
          .fc-steps { grid-template-columns: 1fr !important; }
          .fc-cta { flex-direction: column !important; align-items: flex-start !important; }
          footer { padding: 20px 24px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={s.nav} className="fc-nav">
        <div style={s.navLeft}>
          <Link to="/home" style={{ textDecoration: "none" }}>
            <button style={s.backBtn}>← Back to Home</button>
          </Link>
          <Link to="/home" style={{ textDecoration: "none" }}>
            <div style={s.logo}>Skip<span style={{ color: "#FF6B00" }}>Q</span></div>
          </Link>
        </div>
        <a href={MAILTO} style={{ textDecoration: "none" }}>
          <button style={s.navBtn}>Partner With Us</button>
        </a>
      </nav>

      {/* HERO — paper, like the deck cover */}
      <section style={s.hero} className="fc-hero">
        <div style={s.eyebrow}>SkipQ · Campus partners</div>
        <h1 style={s.h1}>A calmer, cashless<br />campus food court.</h1>
        <p style={s.heroSub}>
          Students order and pay from their phone, vendors prepare without a crowd
          at the counter, and everyone collects when it's ready.
        </p>
        <a href={MAILTO} style={{ textDecoration: "none" }}>
          <button style={s.heroBtn}>Bring SkipQ to Your Campus</button>
        </a>
      </section>

      {/* ORANGE BAND — the deck's statement slide */}
      <section style={s.band} className="fc-band">
        <div style={s.bandText}>Students order ahead.<br />Pick up when ready.<br />No queues.</div>
      </section>

      {/* TRUST */}
      <section style={s.section} className="fc-section">
        <div style={s.eyebrow}>Built for a campus environment</div>
        <h2 style={s.h2}>Verified, prepaid, auditable.</h2>
        <div style={s.grid} className="fc-grid">
          {[
            { title: "College-email signup only", desc: "Only your students can register — the campus community stays closed." },
            { title: "100% cashless", desc: "Every order prepaid by UPI. No cash changes hands on campus." },
            { title: "Every transaction recorded", desc: "Digital trail for every order and payment — fully auditable." },
            { title: "Zero cost to the institution", desc: "No fees, no hardware, no integration work required from you." },
          ].map((p) => (
            <div style={s.point} key={p.title}>
              <div style={s.dot}>✓</div>
              <div>
                <div style={s.pointTitle}>{p.title}</div>
                <div style={s.pointDesc}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOR VENDORS AND INSTITUTION */}
      <section style={{ ...s.section, background: "#F2F0ED" }} className="fc-section">
        <div style={s.eyebrow}>What the campus gains</div>
        <h2 style={s.h2}>Better experience for everyone on it.</h2>
        <div style={s.grid} className="fc-grid">
          {[
            { title: "Less crowding at peak hours", desc: "Students wait anywhere on campus, not pressed against counters." },
            { title: "Students back in class on time", desc: "Order between lectures, collect in seconds." },
            { title: "Local vendors thrive", desc: "Calmer counters, documented daily earnings, and their full menu price kept." },
            { title: "A digitized food court", desc: "A modern amenity to show parents and visitors." },
          ].map((p) => (
            <div style={s.point} key={p.title}>
              <div style={s.dot}>✓</div>
              <div>
                <div style={s.pointTitle}>{p.title}</div>
                <div style={s.pointDesc}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE ASK */}
      <section style={s.section} className="fc-section">
        <div style={s.eyebrow}>What we ask from you</div>
        <h2 style={s.h2}>Three small things.</h2>
        <div style={s.steps} className="fc-steps">
          {[
            { n: "1", title: "Permission to operate", desc: "A green light for food-court vendors to take orders through SkipQ." },
            { n: "2", title: "Vendor introductions", desc: "A word to your vendors that SkipQ is welcome on campus." },
            { n: "3", title: "Email domain confirmation", desc: "We whitelist your college domain so only your students can sign up." },
          ].map((a) => (
            <div style={s.stepCard} key={a.n}>
              <div style={s.stepNum}>{a.n}</div>
              <div style={s.stepTitle}>{a.title}</div>
              <div style={s.stepDesc}>{a.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — ink band, like the deck close */}
      <section style={s.ctaBand} className="fc-cta">
        <div>
          <div style={s.ctaTitle}>Bring order-ahead to your campus.</div>
          <div style={s.ctaSub}>Live on the Google Play Store today. We can pilot with your food court this month.</div>
        </div>
        <a href={MAILTO} style={{ textDecoration: "none" }}>
          <button style={s.ctaBtn}>Talk to the SkipQ Team</button>
        </a>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={s.logo}>Skip<span style={{ color: "#FF6B00" }}>Q</span></div>
          <div style={{ fontSize: 12, color: "#78716C" }}>
            For partnerships & onboarding —{" "}
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
  hero: { padding: "150px 80px 64px", display: "flex", flexDirection: "column", alignItems: "flex-start" },
  eyebrow: { fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#E05A00", marginBottom: 16 },
  h1: { fontSize: "clamp(40px, 5.5vw, 68px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.025em", marginBottom: 22 },
  heroSub: { fontSize: 18, color: "#57534E", lineHeight: 1.6, marginBottom: 34, maxWidth: 560 },
  heroBtn: {
    padding: "15px 32px", background: "#FF6B00", color: "#FFFFFF",
    border: "none", borderRadius: 999, fontWeight: 700, fontSize: 16, cursor: "pointer",
    fontFamily: "inherit",
  },
  band: { background: "#FF6B00", color: "#FFFFFF", padding: "72px 80px" },
  bandText: { fontSize: "clamp(30px, 4.5vw, 54px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" },
  section: { padding: "64px 80px" },
  h2: { fontSize: "clamp(28px, 3.2vw, 40px)", fontWeight: 800, letterSpacing: "-0.015em", lineHeight: 1.12, marginBottom: 32, maxWidth: 640 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "22px 32px", maxWidth: 960 },
  point: { display: "flex", gap: 14, alignItems: "flex-start" },
  dot: {
    flex: "none", width: 38, height: 38, borderRadius: 999,
    background: "rgba(255,107,0,0.12)", color: "#E05A00",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, fontWeight: 800,
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
