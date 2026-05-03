import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAdminStore } from "@/lib/adminStore";

function LoginModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuth((s) => s.login);
  const setSync = useAdminStore((s) => s.setSync);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(email, password);
      if (res.role !== "ADMIN") { setError("Access denied. Admin accounts only."); return; }
      login(res.token, { email: res.email, name: res.name });
      navigate("/dashboard");
      api.sync().then(setSync).catch(() => {});
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        <button style={s.modalClose} onClick={onClose}>✕</button>
        <div style={s.modalLogo}>SQ</div>
        <div style={s.modalTitle}>SkipQ Admin</div>
        <div style={s.modalSub}>Admin access only</div>
        <form onSubmit={handleSubmit}>
          {error && <div style={s.modalError}>{error}</div>}
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="admin@skipq.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button style={s.modalBtn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div style={s.page}>
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; padding: 80px 24px 40px !important; }
          .hero-right { display: none !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .nav { padding: 14px 24px !important; }
          .nav-links { display: none !important; }
          footer { padding: 20px 24px !important; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* NAV */}
      <nav style={s.nav} className="nav">
        <div style={s.logo}>Skip<span style={{ color: '#f97316' }}>Q</span></div>
        <div style={s.navLinks} className="nav-links">
          <a href="#how" style={s.navLink}>How It Works</a>
          <a href="#vendors" style={s.navLink}>For Vendors</a>
          <a href="#features" style={s.navLink}>Features</a>
          <a href="#contact" style={s.navLink}>Contact</a>
        </div>
        <button style={s.adminBtn} onClick={() => setShowLogin(true)}>🔒 Admin Login</button>
      </nav>

      {/* HERO */}
      <section style={s.hero} className="hero-grid">
        <div style={s.heroLeft}>
          <div style={s.eyebrow}><span style={s.eyebrowIcon}>✦</span> Smart Ordering for Campus</div>
          <h1 style={s.h1}>
            Skip the line.<br />
            Order ahead.<br />
            <span style={{ color: '#f97316' }}>Pick up when ready.</span>
          </h1>
          <p style={s.heroSub}>
            SkipQ helps students order from campus vendors without waiting in queues.
          </p>
          <div style={s.heroCtas}>
            <button style={s.btnPrimary}>Get Started &nbsp;›</button>
            <button style={s.btnGhost}>▶ Watch Demo</button>
          </div>
          <div style={s.trustRow}>
            <span style={s.trustItem}><span style={s.trustIcon}>⏱</span> Save Time</span>
            <span style={s.trustSep}>|</span>
            <span style={s.trustItem}><span style={s.trustIcon}>👥</span> No More Queues</span>
            <span style={s.trustSep}>|</span>
            <span style={s.trustItem}><span style={s.trustIcon}>🛡</span> Secure & Easy</span>
          </div>
        </div>
        <div style={s.heroRight} className="hero-right">
          <img src="/mobile-preview.png" alt="SkipQ app" style={s.mobileImg} />
        </div>
      </section>

      {/* WHY SKIPQ */}
      <section style={s.features} id="features">
        <h2 style={s.featuresTitle}>Why SkipQ?</h2>
        <div style={s.featuresGrid} className="features-grid">
          {[
            { icon: '⏱', color: '#f97316', bg: 'rgba(249,115,22,0.12)', title: 'Save Time', desc: 'Order in advance and skip long waiting lines.' },
            { icon: '🛍', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', title: 'Easy Ordering', desc: 'Simple, fast and student friendly.' },
            { icon: '🛡', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', title: 'Secure Payments', desc: 'Safe, secure and hassle-free payments.' },
            { icon: '📈', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', title: 'Smart Insights', desc: 'Real-time updates for better experience.' },
          ].map((f, i) => (
            <div style={s.featureCard} key={i}>
              <div style={{ ...s.featureIconCircle, background: f.bg, color: f.color }}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.logo}>Skip<span style={{ color: '#f97316' }}>Q</span></div>
        <div style={{ fontSize: 13, color: '#9ca3af' }}>© 2026 SkipQ · Real-time campus food ordering</div>
      </footer>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { fontFamily: 'Inter, sans-serif', background: '#ffffff', color: '#0f172a', minHeight: '100vh' },
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 48px', background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9',
  },
  logo: { fontWeight: 800, fontSize: 20, color: '#0f172a', letterSpacing: '-0.02em' },
  navLinks: { display: 'flex', gap: 32, alignItems: 'center' },
  navLink: { fontSize: 14, color: '#6b7280', textDecoration: 'none', fontWeight: 500 },
  adminBtn: {
    padding: '10px 20px', background: '#f97316', color: '#000',
    border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer',
  },
  hero: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 48, padding: '88px 80px 48px',
    alignItems: 'center', maxWidth: 1200, margin: '0 auto',
  },
  heroLeft: { display: 'flex', flexDirection: 'column', gap: 0 },
  heroRight: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
  eyebrow: {
    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
    color: '#ea6c00', background: 'rgba(249,115,22,0.1)',
    padding: '6px 14px', borderRadius: 100, marginBottom: 24,
  },
  eyebrowIcon: { fontSize: 11 },
  h1: { fontSize: 'clamp(34px, 3.8vw, 52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 18 },
  heroSub: { fontSize: 16, color: '#6b7280', lineHeight: 1.6, marginBottom: 32, maxWidth: 400 },
  heroCtas: { display: 'flex', gap: 14, marginBottom: 28, alignItems: 'center' },
  btnPrimary: {
    padding: '13px 28px', background: '#f97316', color: '#fff',
    border: 'none', borderRadius: 100, fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  btnGhost: {
    padding: '13px 24px', background: 'transparent', color: '#0f172a',
    border: '1.5px solid #d1d5db', borderRadius: 100, fontWeight: 600, fontSize: 15, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  trustRow: { display: 'flex', gap: 12, alignItems: 'center' },
  trustItem: { fontSize: 13, color: '#6b7280', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 },
  trustIcon: { fontSize: 14 },
  trustSep: { color: '#d1d5db', fontSize: 14 },
  mobileImg: { width: '100%', maxWidth: 520, objectFit: 'contain' as const },
  features: { padding: '48px 80px 56px', background: '#f8fafc', textAlign: 'center' },
  featuresTitle: { fontSize: 26, fontWeight: 800, marginBottom: 36, letterSpacing: '-0.02em' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 960, margin: '0 auto' },
  featureCard: { background: 'transparent', padding: '20px 16px', textAlign: 'center' },
  featureIconCircle: { width: 56, height: 56, borderRadius: 16, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' },
  featureTitle: { fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#0f172a' },
  featureDesc: { fontSize: 13, color: '#9ca3af', lineHeight: 1.6 },
  footer: {
    padding: '24px 64px', borderTop: '1px solid #f1f5f9', background: '#fff',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: '40px 36px',
    width: '100%', maxWidth: 400, position: 'relative',
    boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
  },
  modalClose: {
    position: 'absolute', top: 16, right: 16, background: 'transparent',
    border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer',
    width: 32, height: 32, fontSize: 14, color: '#9ca3af',
  },
  modalLogo: {
    width: 48, height: 48, borderRadius: 12, background: '#f97316',
    color: '#000', fontWeight: 800, fontSize: 15,
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#0f172a' },
  modalSub: { fontSize: 13, color: '#9ca3af', marginBottom: 28 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  input: {
    padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 8,
    fontSize: 14, color: '#0f172a', background: '#f9fafb', outline: 'none',
  },
  modalError: {
    padding: '10px 14px', background: 'rgba(239,68,68,0.06)',
    border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
    fontSize: 13, color: '#ef4444', marginBottom: 16,
  },
  modalBtn: {
    width: '100%', padding: 14, background: '#f97316', color: '#000',
    border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8,
  },
};
