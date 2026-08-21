import { useEffect } from "react";
import { Link } from "react-router-dom";

// This page mirrors the published SkipQ project-documentation artifact 1:1.
// Content and CSS are kept verbatim (body selector scoped to .skq-doc);
// mermaid renders the same diagrams the artifact shows.

const DOC_CSS = `
  :root {
    --paper: #FAFAF8;
    --surface: #F2F0ED;
    --surface-high: #E8E4DF;
    --border: #E7E4E0;
    --ink: #1C1917;
    --body: #44403C;
    --muted: #78716C;
    --accent: #FF6B00;
    --accent-dark: #E05A00;
    --accent-glow: rgba(255,107,0,0.10);
    --code-bg: #EDEAE5;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --paper: #171411;
      --surface: #211D18;
      --surface-high: #2B2620;
      --border: #332D26;
      --ink: #F0EDE8;
      --body: #D6D0C8;
      --muted: #A39B91;
      --accent: #FF7A1F;
      --accent-dark: #FF6B00;
      --accent-glow: rgba(255,122,31,0.12);
      --code-bg: #2B2620;
    }
  }

  .skq-doc { box-sizing: border-box; }
  .skq-doc *, .skq-doc *::before, .skq-doc *::after { box-sizing: border-box; }
  .skq-doc {
    background: var(--paper);
    color: var(--body);
    font-family: 'Poppins', 'Avenir Next', 'Segoe UI', system-ui, sans-serif;
    line-height: 1.65;
    margin: 0;
    padding: 56px 24px 120px;
    min-height: 100vh;
  }
  .skq-doc main { max-width: 860px; margin: 0 auto; }

  .skq-doc header.hero { padding: 72px 0 24px; border-bottom: 1px solid var(--border); }
  .skq-doc .eyebrow {
    text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; font-weight: 600;
    color: var(--accent); margin: 0 0 12px;
  }
  .skq-doc h1 { font-size: clamp(34px, 5.5vw, 50px); font-weight: 800; line-height: 1.08; margin: 0 0 14px; color: var(--ink); letter-spacing: -0.02em; text-wrap: balance; }
  .skq-doc .lede { color: var(--muted); font-size: 16.5px; max-width: 66ch; margin: 0 0 10px; }
  .skq-doc .meta { font-size: 13px; color: var(--muted); }

  .skq-doc nav.toc { margin: 28px 0 0; padding: 20px 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
  .skq-doc nav.toc .t { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 10px; }
  .skq-doc nav.toc ol { margin: 0; padding-left: 20px; columns: 2; column-gap: 32px; font-size: 14.5px; }
  .skq-doc nav.toc li { margin-bottom: 5px; }
  .skq-doc nav.toc a { color: var(--accent-dark); text-decoration: none; }
  .skq-doc nav.toc a:hover { text-decoration: underline; }
  @media (max-width: 640px) { .skq-doc nav.toc ol { columns: 1; } }

  .skq-doc section { margin-top: 56px; }
  .skq-doc h2 { font-size: 27px; font-weight: 800; color: var(--ink); letter-spacing: -0.015em; margin: 0 0 6px; scroll-margin-top: 90px; }
  .skq-doc h2 .num { color: var(--accent); margin-right: 10px; }
  .skq-doc h3 { font-size: 18px; font-weight: 700; color: var(--ink); margin: 30px 0 8px; }
  .skq-doc p { margin: 0 0 14px; max-width: 72ch; }
  .skq-doc strong { color: var(--ink); }
  .skq-doc ul, .skq-doc ol { margin: 0 0 14px; padding-left: 22px; }
  .skq-doc li { margin-bottom: 6px; }
  .skq-doc a { color: var(--accent-dark); }

  .skq-doc .callout {
    background: var(--accent-glow); border: 1px solid var(--border); border-radius: 12px;
    padding: 16px 20px; margin: 18px 0; font-size: 15px; color: var(--ink);
  }
  .skq-doc .callout b { color: var(--accent-dark); }

  .skq-doc .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; margin: 16px 0; }
  .skq-doc table { border-collapse: collapse; width: 100%; min-width: 560px; font-size: 14.5px; }
  .skq-doc th {
    text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.09em;
    color: var(--muted); font-weight: 700; padding: 11px 14px;
    background: var(--surface); border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .skq-doc td { padding: 11px 14px; border-bottom: 1px solid var(--border); vertical-align: top; }
  .skq-doc tr:last-child td { border-bottom: none; }
  .skq-doc td.k { font-weight: 600; color: var(--ink); white-space: nowrap; }
  .skq-doc td.num { font-variant-numeric: tabular-nums; }

  .skq-doc code {
    background: var(--code-bg); border-radius: 6px; padding: 1px 6px;
    font-size: 0.88em; font-family: ui-monospace, 'SF Mono', Menlo, monospace; color: var(--ink);
  }
  .skq-doc .diagram { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px; margin: 16px 0; overflow-x: auto; }
  .skq-doc .diagram .cap { font-size: 12.5px; color: var(--muted); margin-top: 8px; text-align: center; }
  .skq-doc .diagram .mermaid { display: flex; justify-content: center; }

  .skq-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; gap: 16px;
    padding: 12px 24px; background: var(--paper);
    border-bottom: 1px solid var(--border);
    font-family: 'Poppins', 'Avenir Next', 'Segoe UI', system-ui, sans-serif;
  }
  .skq-nav .back {
    padding: 8px 16px; background: transparent; color: var(--muted);
    border: 1.5px solid var(--border); border-radius: 999px; font-weight: 600; font-size: 13px; cursor: pointer;
    font-family: inherit;
  }
  .skq-nav .logo { font-weight: 800; font-size: 18px; color: var(--ink); letter-spacing: -0.02em; }
`;

const DOC_HTML = `
  <header class="hero">
    <p class="eyebrow">SkipQ · About the project</p>
    <h1>SkipQ, end to end</h1>
    <p class="lede">How the SkipQ campus food-ordering marketplace works: the product, the order flow, how the money moves, and what's built.</p>
    <p class="meta">August 2026 · SkipQ is an OhYeah product</p>

    <nav class="toc">
      <div class="t">Contents</div>
      <ol>
        <li><a href="#overview">What SkipQ is</a></li>
        <li><a href="#surfaces">Product surfaces</a></li>
        <li><a href="#lifecycle">Order lifecycle</a></li>
        <li><a href="#payments">Payments</a></li>
        <li><a href="#ledger">Ledger &amp; settlement</a></li>
        <li><a href="#revenue">Revenue model</a></li>
        <li><a href="#onboarding">Vendor onboarding &amp; KYC</a></li>
        <li><a href="#features">Feature status</a></li>
        <li><a href="#architecture">Architecture &amp; infrastructure</a></li>
      </ol>
    </nav>
  </header>

  <section id="overview">
    <h2><span class="num">1</span>What SkipQ is</h2>
    <p>SkipQ is a <strong>campus food-ordering marketplace</strong>. Students browse menus from food stalls on their campus, order and pay from a mobile app via UPI, and pick the order up when the vendor marks it ready — no queuing at the counter. Vendors fulfill orders through their own app; SkipQ operates the platform and the money flow between everyone.</p>
    <p>The defining architectural choice: <strong>SkipQ is the merchant of record</strong>. Every customer payment lands in SkipQ's account. Vendors are never paid per order — instead SkipQ maintains an internal ledger of what each vendor has earned and settles it to their bank in a daily batch. This single decision shapes most of the system (see <a href="#ledger">§5</a>).</p>
    <div class="table-wrap"><table>
      <tr><td class="k">Market</td><td>Indian college campuses; students verified by college-email signup</td></tr>
      <tr><td class="k">Payment method</td><td>UPI only at launch (GPay, PhonePe, Paytm) via Razorpay</td></tr>
      <tr><td class="k">Supply</td><td>Campus food stalls, onboarded personally by the SkipQ team</td></tr>
      <tr><td class="k">Distribution</td><td>Customer app live on the Google Play Store (<code>com.skipqcustomer</code>)</td></tr>
      <tr><td class="k">Company</td><td>OhYeah</td></tr>
    </table></div>
  </section>

  <section id="surfaces">
    <h2><span class="num">2</span>Product surfaces</h2>
    <p>Four surfaces make up the platform:</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Surface</th><th>Stack</th><th>What it does</th></tr></thead>
      <tbody>
        <tr><td class="k">Customer app</td><td>React Native (Expo)</td><td>Browse vendors and menus, cart, UPI checkout via Razorpay SDK, live order tracking, scheduled orders.</td></tr>
        <tr><td class="k">Vendor app</td><td>React Native</td><td>Incoming order queue, state transitions (accept → prepare → ready → complete), menu management, earnings screen with balance and payout history, subscription status.</td></tr>
        <tr><td class="k">Admin hub</td><td>React + Vite</td><td>Doubles as the public marketing site. Behind admin login: vendor management and KYC approval, campus management, orders view, daily payout dashboard, vendor subscription billing, support tickets.</td></tr>
        <tr><td class="k">Backend</td><td>Spring Boot 3, Java 21</td><td>All business logic: auth (JWT), orders, payments, webhooks, the financial ledger, daily settlement job, notifications.</td></tr>
      </tbody>
    </table></div>
    <p>Real-time updates (new-order pings to vendors, status changes to customers) are delivered over <strong>Ably</strong> channels. Images (logos, avatars, menu photos) are stored in <strong>Cloudflare R2</strong>.</p>
  </section>

  <section id="lifecycle">
    <h2><span class="num">3</span>Order lifecycle</h2>
    <p>Orders move through a strict state machine. No state may be skipped, and <code>COMPLETED</code> is irreversible.</p>
    <div class="diagram">
      <pre class="mermaid">
stateDiagram-v2
    direction LR
    [*] --> PLACED
    PLACED --> ACCEPTED : vendor accepts (only if paid)
    ACCEPTED --> PREPARING
    PREPARING --> READY
    READY --> COMPLETED : student picks up
    PLACED --> CANCELLED : customer / system
    PLACED --> REJECTED : vendor declines → refund
    ACCEPTED --> CANCELLED : admin only
    COMPLETED --> [*]
      </pre>
      <div class="cap">Vendor credit is created at COMPLETED — and only there.</div>
    </div>
    <ul>
      <li><strong>Payment gates acceptance:</strong> a vendor cannot accept an order until its <code>payment_status</code> is <code>PAID</code> (confirmed by Razorpay webhook).</li>
      <li><strong><code>COMPLETED</code> is the only state with financial effect</strong> — it triggers the ledger credit (§5). <code>READY</code> means food is prepared, not delivered; crediting at pickup minimizes refund clawbacks.</li>
      <li><strong>Terminal without money movement:</strong> <code>REJECTED</code> (vendor declined; refund issued) and <code>CANCELLED</code> (before preparation; refund if payment was captured).</li>
    </ul>
  </section>

  <section id="payments">
    <h2><span class="num">4</span>Payments</h2>
    <p>Razorpay's role is deliberately narrow: <strong>collect customer payments, fire webhooks, process refunds</strong>. It does not route money to vendors, know about commission splits, hold vendor balances, or initiate settlements.</p>
    <div class="diagram">
      <pre class="mermaid">
sequenceDiagram
    participant S as Student app
    participant B as Backend
    participant R as Razorpay
    participant V as Vendor app
    S->>B: POST /orders
    B->>R: create payment order (INR, paise)
    B-->>S: razorpayOrderId
    S->>R: pay via UPI (SDK)
    R->>B: webhook payment.captured
    B->>B: verify signature, mark order PAID
    B->>V: notify via Ably
      </pre>
      <div class="cap">Payment collection flow. Webhook processing is idempotent and signature-verified.</div>
    </div>
    <ul>
      <li><strong>UPI only at launch</strong>, enforced in the Razorpay SDK config (cards, wallets, and Pay Later are excluded). Campus users overwhelmingly pay by UPI, and this avoids PCI-DSS scope and pay-later credit risk.</li>
      <li><strong>Webhooks handled:</strong> <code>payment.captured</code> (mark paid, notify vendor), <code>payment.failed</code>, <code>refund.processed</code> (ledger clawback if the order had completed), <code>refund.failed</code>.</li>
      <li><strong>Refunds</strong> are initiated by the SkipQ backend via the Razorpay Refund API — decided by admin or system logic, never automatic on Razorpay's side.</li>
    </ul>
  </section>

  <section id="ledger">
    <h2><span class="num">5</span>Ledger &amp; settlement — the financial core</h2>
    <p>This is the heart of the system, governed by non-negotiable rules:</p>
    <div class="callout"><b>ledger_entries is the single source of truth for all money movement.</b> No financial action is valid without a row here. All monetary values are <code>NUMERIC(10,2)</code> in the database and <code>BigDecimal</code> in Java — never float. Every financial write happens inside a transaction.</div>
    <h3>The three financial tables</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Table</th><th>Role</th><th>Key invariant</th></tr></thead>
      <tbody>
        <tr><td class="k">ledger_entries</td><td>Source of truth. One row per money event: <code>CREDIT</code>, <code>REFUND</code> (negative), <code>ADJUSTMENT</code>, <code>PAYOUT_REVERSAL</code>.</td><td><code>UNIQUE(order_id, type)</code> — the DB itself guarantees an order can never be credited twice, even if application code is bypassed.</td></tr>
        <tr><td class="k">vendor_ledger</td><td>Read cache of each vendor's unsettled balance, for fast dashboard reads.</td><td>Written in the <em>same transaction</em> as ledger_entries; rebuildable from scratch at any time; never trusted as truth.</td></tr>
        <tr><td class="k">vendor_payouts</td><td>Daily settlement records with snapshotted amounts.</td><td><code>UNIQUE(vendor_id, settlement_cutoff_at)</code> — a re-run job cannot create duplicate payouts.</td></tr>
      </tbody>
    </table></div>
    <h3>Daily settlement flow</h3>
    <div class="diagram">
      <pre class="mermaid">
flowchart TD
    A["Order COMPLETED"] --> B["LedgerService.creditVendor()\\nINSERT CREDIT + update cache\\n(one transaction, idempotent)"]
    B --> C["07:00 AM SettlementJob\\ncutoff = yesterday 23:59:59"]
    C --> D["Per vendor: INSERT payout PENDING\\nreserve entries (payout_id set)"]
    D --> E["Admin transfers via UPI/NEFT\\nenters bank reference"]
    E --> F["Mark SUCCESS: settled=true,\\nbalance decremented (one transaction)"]
    E --> G["Mark FAILED: reservation released,\\nentries roll to next cycle"]
      </pre>
      <div class="cap">Money leaves SkipQ only through this path — never per order, never in real time.</div>
    </div>
    <ul>
      <li><strong>Reservation before settlement:</strong> the job stamps <code>payout_id</code> on entries at payout creation, so a re-run can never double-count them. <code>settled = true</code> is written only when the admin confirms the bank transfer.</li>
      <li><strong>Strict cutoff:</strong> an order completed at 07:00:01 waits for the next day's batch — no race between the job and late completions.</li>
      <li><strong>Refunds never edit rows.</strong> A refund is a new negative entry. Before payout it simply reduces the balance; after payout it reduces the next cycle (with <code>PAYOUT_REVERSAL</code> for full unwinds).</li>
      <li><strong>Single-writer settlement:</strong> ShedLock ensures one node runs the job; all settlement logic lives in <code>SettlementJob</code> and <code>LedgerService</code> only.</li>
    </ul>
  </section>

  <section id="revenue">
    <h2><span class="num">6</span>Revenue model</h2>
    <p>Three revenue streams, all designed so <strong>the vendor always keeps their full menu price</strong>:</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Stream</th><th>Rate</th><th>Who pays</th><th>Notes</th></tr></thead>
      <tbody>
        <tr><td class="k">Platform fee</td><td class="num">3% of subtotal</td><td>Student</td><td>SkipQ's margin, added on top of the vendor's price.</td></tr>
        <tr><td class="k">Convenience fee</td><td class="num">2% of subtotal</td><td>Student</td><td>Passthrough of Razorpay's ~2% gateway fee on UPI (which is separate from the 0% MDR mandate). Named per Indian-market convention; introduced after fee analysis showed it was silently eating SkipQ's margin.</td></tr>
        <tr><td class="k">Vendor subscription</td><td class="num">Admin-set monthly (₹0 = free)</td><td>Vendor</td><td>Platform access fee, collected offline and recorded in the admin hub. Fully decoupled from the order ledger. <code>PAST_DUE</code> is computed on read from a single paid-through date — no billing jobs.</td></tr>
      </tbody>
    </table></div>
    <h3>Worked example — a ₹100 order</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Line</th><th>Amount</th><th>Goes to</th></tr></thead>
      <tbody>
        <tr><td>Subtotal</td><td class="num">₹100.00</td><td>Vendor (ledger credit at COMPLETED)</td></tr>
        <tr><td>Platform fee (3%)</td><td class="num">₹3.00</td><td>SkipQ</td></tr>
        <tr><td>Convenience fee (2%)</td><td class="num">₹2.00</td><td>Razorpay (passed through)</td></tr>
        <tr><td class="k">Student pays</td><td class="num"><strong>₹105.00</strong></td><td>—</td></tr>
        <tr><td class="k">SkipQ net</td><td class="num"><strong>~₹3.00</strong></td><td>After Razorpay deducts its gateway fee</td></tr>
      </tbody>
    </table></div>
  </section>

  <section id="onboarding">
    <h2><span class="num">7</span>Vendor onboarding &amp; KYC</h2>
    <p>Onboarding is <strong>admin-driven</strong> — the vendor's only job is to set a password:</p>
    <ol>
      <li>Admin creates the vendor in the admin hub with all business data: name, contact, campus, prep time, PAN, bank account, IFSC, GST details, subscription price. A <code>vendor_ledger</code> row is initialized at ₹0.</li>
      <li>The vendor receives an invite email with a setup link (24-hour token), sets a password, and is logged in immediately — they can take and fulfill orders right away.</li>
      <li>Admin reviews the submitted details and approves KYC manually. Until <code>kycApproved</code> is set, the vendor can operate but <strong>payouts are gated</strong> — the app shows "Payouts on hold — details pending review."</li>
    </ol>
    <p>Bank details are stored on the vendor record and used only by the admin to execute the manual settlement transfers. Razorpay Route / linked accounts are not used — which is why KYC is a SkipQ-internal approval rather than an external dependency, and vendors can start selling on day one.</p>
  </section>

  <section id="features">
    <h2><span class="num">8</span>Feature status</h2>
    <h3>Live in production</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Feature</th><th>Summary</th></tr></thead>
      <tbody>
        <tr><td class="k">Core ordering + payments</td><td>Full order lifecycle, UPI checkout, webhooks, real-time notifications.</td></tr>
        <tr><td class="k">Ledger + daily settlement</td><td>The full financial core of §5, with the admin payout dashboard.</td></tr>
        <tr><td class="k">Scheduled orders</td><td>Students can order ahead for a chosen time.</td></tr>
        <tr><td class="k">Vendor suspension</td><td>Admin can suspend a vendor from the marketplace.</td></tr>
        <tr><td class="k">Convenience fee</td><td>2% gateway passthrough; students see a 5% total service fee, vendor earnings unchanged.</td></tr>
        <tr><td class="k">Vendor subscriptions</td><td>Monthly platform fee across all three apps: admin billing UI, vendor status/payment history, status derived on read.</td></tr>
        <tr><td class="k">Observability</td><td>New Relic APM agent on prod with structured log forwarding and MDC markers on all settlement/ledger operations.</td></tr>
        <tr><td class="k">Admin session timeout</td><td>15-minute idle timeout with warning on protected admin pages.</td></tr>
      </tbody>
    </table></div>
    <h3>Coming next</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Feature</th><th>What it brings</th></tr></thead>
      <tbody>
        <tr><td class="k">Vendor discounts</td><td>Vendors can run their own item-level discounts, with every discounted order carrying a permanent record of the original price and amount saved.</td></tr>
        <tr><td class="k">Coupon codes</td><td>Promo codes for campaigns like first-order offers.</td></tr>
        <tr><td class="k">Automated payouts</td><td>The manual bank-transfer step of daily settlement replaced by automated transfers — with the ledger model unchanged.</td></tr>
      </tbody>
    </table></div>
  </section>

  <section id="architecture">
    <h2><span class="num">9</span>Architecture &amp; infrastructure</h2>
    <div class="diagram">
      <pre class="mermaid">
flowchart TB
    subgraph Apps["Mobile apps (React Native)"]
      CA["Customer app"]
      VA["Vendor app"]
    end
    subgraph BE["Backend — Spring Boot 3, Java 21"]
      OS["OrderService"]
      LS["LedgerService"]
      SJ["SettlementJob (07:00 daily)"]
      PS["PaymentService / WebhookService"]
      VS["VendorService / AuthService"]
    end
    AH["Admin hub (React + Vite)\\npublic marketing site + admin dashboard"]
    DB[("PostgreSQL — Neon\\norders · ledger_entries · vendor_ledger\\nvendor_payouts · vendors · users")]
    RZ["Razorpay\\ncollection only"]
    AB["Ably\\nreal-time"]
    R2["Cloudflare R2\\nimages"]
    CA -->|HTTPS/REST| BE
    VA -->|HTTPS/REST| BE
    AH -->|HTTPS/REST| BE
    BE --> DB
    PS <--> RZ
    BE --> AB
    AB --> CA
    AB --> VA
    BE --> R2
      </pre>
    </div>
    <div class="table-wrap"><table>
      <tbody>
        <tr><td class="k">Backend</td><td>Spring Boot 3 / Java 21, systemd-managed on an Oracle Cloud VPS behind nginx with Let's Encrypt TLS</td></tr>
        <tr><td class="k">Database</td><td>PostgreSQL on Neon (managed)</td></tr>
        <tr><td class="k">CI/CD</td><td>GitHub Actions with manual-dispatch deploys; secrets held in GitHub Secrets → server env, never in source</td></tr>
        <tr><td class="k">Monitoring</td><td>New Relic APM + log forwarding; settlement and ledger operations carry structured MDC markers for traceability</td></tr>
        <tr><td class="k">Quality gates</td><td>SonarCloud coverage gate and CodeQL on the backend repo; PR-based workflow across all repos</td></tr>
      </tbody>
    </table></div>
  </section>
`;

export default function About() {
  useEffect(() => {
    let cancelled = false;
    import("mermaid").then(({ default: mermaid }) => {
      if (cancelled) return;
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "neutral" });
      mermaid.run({ querySelector: ".skq-doc .mermaid" });
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="skq-doc">
      <style>{DOC_CSS}</style>
      <nav className="skq-nav">
        <Link to="/home" style={{ textDecoration: "none" }}>
          <button className="back">← Back to Home</button>
        </Link>
        <Link to="/home" style={{ textDecoration: "none" }}>
          <div className="logo">Skip<span style={{ color: "#FF6B00" }}>Q</span></div>
        </Link>
      </nav>
      <main dangerouslySetInnerHTML={{ __html: DOC_HTML }} />
    </div>
  );
}
