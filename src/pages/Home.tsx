import { useState } from "react";

export default function SkipQ() {
  const [showLogin, setShowLogin] = useState(false);

return (
    <>
      <style>{`
        body {
          font-family: Inter, sans-serif;
          background: #f8fafc;
          color: #0f172a;
        }

        nav {
          display: flex;
          justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid #e5e7eb;
          background: white;
        }

        .logo {
          font-weight: 800;
          font-size: 18px;
        }

        .logo span { color: #f97316; }

        .btn {
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-primary {
          background: #f97316;
          color: black;
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 80px 60px;
          align-items: center;
        }

        .hero h1 {
          font-size: 44px;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .hero p {
          color: #6b7280;
          font-size: 16px;
          margin-bottom: 24px;
        }

        .dashboard {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 20px;
        }

        .order {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .order:last-child { border-bottom: none; }

        .status {
          font-size: 12px;
          font-weight: 600;
          color: #f97316;
        }

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            padding: 40px 20px;
          }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="logo">Skip<span>Q</span></div>
        <button className="btn btn-primary" onClick={() => setShowLogin(true)}>
          Admin Login
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div>
          <h1>
            Skip the line.<br />
            Order ahead.<br />
            Pick up when ready.
          </h1>

          <p>
            SkipQ helps students order from campus vendors without waiting in queues.
          </p>

          <button className="btn btn-primary">
            Get Started
          </button>
        </div>

        <img
          src="/mobile-preview.png"
          alt="SkipQ mobile app"
          style={{ width: '100%', maxWidth: 480, borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.12)' }}
        />
      </section>
    </>
  );
}