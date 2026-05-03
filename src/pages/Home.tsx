import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAdminStore } from "@/lib/adminStore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --orange: #f97316;
    --orange-dim: rgba(249,115,22,0.15);
    --orange-glow: rgba(249,115,22,0.4);
    --navy: #050a14;
    --panel: rgba(255,255,255,0.03);
    --border: rgba(255,255,255,0.07);
    --text-muted: rgba(255,255,255,0.35);
    --text-sub: rgba(255,255,255,0.6);
  }

  html { scroll-behavior: smooth; }
  body { background: var(--navy); color: #fff; font-family: 'Syne', sans-serif; overflow-x: hidden; }

  .mono { font-family: 'JetBrains Mono', monospace; }

  /* NOISE OVERLAY */
  body::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 999;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.6;
  }

  /* SCROLL ANIMATIONS */
  .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.8s ease, transform 0.8s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.35s; }
  .reveal-delay-4 { transition-delay: 0.5s; }

  /* QUEUE BARS */
  @keyframes queuePulse {
    0%, 100% { opacity: 0.25; transform: scaleY(0.7); }
    50% { opacity: 0.7; transform: scaleY(1); }
  }

  @keyframes flowPulse {
    0% { width: 0%; opacity: 0; }
    100% { width: 100%; opacity: 1; }
  }

  @keyframes statusCycle {
    0%, 30% { content: 'ORDERED'; color: #60a5fa; }
    35%, 65% { content: 'PREPARING'; color: #f97316; }
    70%, 100% { content: 'READY'; color: #4ade80; }
  }

  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px var(--orange-glow), 0 0 60px rgba(249,115,22,0.1); }
    50% { box-shadow: 0 0 40px var(--orange-glow), 0 0 100px rgba(249,115,22,0.2); }
  }

  @keyframes dotFlow {
    0% { transform: translateX(-100%); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateX(400%); opacity: 0; }
  }

  @keyframes countUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  @keyframes scanLine {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes timerTick {
    0%, 100% { opacity: 1; }
    49% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes barGrow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes ripple {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 20px 48px;
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(5,10,20,0.7);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }

  .nav-logo {
    font-size: 18px; font-weight: 800; letter-spacing: -0.02em;
    color: #fff;
  }

  .nav-logo span { color: var(--orange); }

  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a {
    font-size: 13px; font-weight: 500; color: var(--text-sub);
    text-decoration: none; letter-spacing: 0.04em;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: #fff; }

  .btn-ghost {
    padding: 8px 20px; border: 1px solid var(--border);
    border-radius: 6px; font-size: 13px; font-weight: 600;
    color: #fff; background: transparent; cursor: pointer;
    font-family: 'Syne', sans-serif;
    transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: var(--orange); color: var(--orange); }

  .btn-primary {
    padding: 10px 24px; background: var(--orange);
    border: none; border-radius: 6px;
    font-size: 13px; font-weight: 700;
    color: #000; cursor: pointer;
    font-family: 'Syne', sans-serif;
    letter-spacing: 0.02em;
    transition: all 0.2s;
    animation: glowPulse 3s ease-in-out infinite;
  }
  .btn-primary:hover { transform: translateY(-1px); filter: brightness(1.1); }

  /* SECTIONS */
  section { display: flex; flex-direction: column; justify-content: center; padding: 60px 48px; position: relative; }

  /* HERO */
  .hero { min-height: 100vh; align-items: flex-start; justify-content: center; overflow: hidden; padding-top: 120px; }

  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 6px 14px;
    background: var(--orange-dim); border: 1px solid rgba(249,115,22,0.3);
    border-radius: 100px;
    font-size: 11px; font-weight: 600; color: var(--orange);
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 32px;
    font-family: 'JetBrains Mono', monospace;
  }

  .hero-eyebrow::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%;
    background: var(--orange);
    animation: glowPulse 2s ease-in-out infinite;
  }

  .hero h1 {
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 800; line-height: 1.05;
    letter-spacing: -0.04em;
    max-width: 700px;
    margin-bottom: 20px;
  }

  .hero h1 .strike {
    text-decoration: line-through;
    color: var(--text-muted);
  }

  .hero h1 .accent { color: var(--orange); }

  .hero-sub {
    font-size: 17px; color: var(--text-sub);
    max-width: 480px; line-height: 1.6;
    margin-bottom: 48px;
    font-weight: 400;
  }

  .hero-ctas { display: flex; gap: 16px; }

  .btn-large {
    padding: 14px 32px; border-radius: 8px;
    font-size: 15px; font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer; letter-spacing: 0.02em;
    transition: all 0.2s;
  }

  .btn-large-primary {
    background: var(--orange); color: #000; border: none;
    animation: glowPulse 3s ease-in-out infinite;
  }
  .btn-large-primary:hover { transform: translateY(-2px); filter: brightness(1.1); }

  .btn-large-ghost {
    background: transparent; color: #fff;
    border: 1px solid var(--border);
  }
  .btn-large-ghost:hover { border-color: rgba(255,255,255,0.3); }

  /* HERO BG GRID */
  .hero-grid {
    position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  .hero-grid::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 60% 40%, rgba(249,115,22,0.06), transparent 70%);
  }

  .hero-content { position: relative; z-index: 1; }

  /* SCAN LINE DECORATION */
  .scanline {
    position: absolute; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent);
    animation: scanLine 8s linear infinite;
    pointer-events: none;
  }

  /* SIMULATION SECTION */
  .simulation {
    background: rgba(0,0,0,0.3);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .sim-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 12px;
  }

  .sim-title {
    font-size: clamp(24px, 3vw, 40px);
    font-weight: 800; letter-spacing: -0.03em;
    margin-bottom: 40px;
    max-width: 600px;
  }

  .sim-grid {
    display: grid; grid-template-columns: 1fr auto 1fr;
    gap: 32px; align-items: start;
  }

  .sim-panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
    position: relative;
    overflow: hidden;
  }

  .sim-panel.chaos { border-color: rgba(239,68,68,0.2); }
  .sim-panel.flow { border-color: rgba(249,115,22,0.3); animation: glowPulse 4s ease-in-out infinite; }

  .sim-panel-title {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 20px;
    font-family: 'JetBrains Mono', monospace;
  }

  .chaos .sim-panel-title { color: #ef4444; }
  .flow .sim-panel-title { color: var(--orange); }

  /* Queue bars */
  .queue-bar {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 10px;
  }

  .queue-dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; flex-shrink: 0; }

  .queue-line {
    height: 6px; border-radius: 3px;
    background: rgba(239,68,68,0.3);
    transform-origin: left;
    animation: queuePulse 2s ease-in-out infinite;
  }

  /* Flow chips */
  .flow-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    background: rgba(249,115,22,0.06);
    border: 1px solid rgba(249,115,22,0.15);
    border-radius: 8px;
    margin-bottom: 8px;
    animation: fadeSlide 0.5s ease forwards;
  }

  .flow-chip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .flow-chip-id { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; width: 36px; flex-shrink: 0; }
  .flow-chip-label { font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace; flex: 1; }
  .flow-chip-time { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

  .chip-ordered .flow-chip-dot { background: #60a5fa; box-shadow: 0 0 8px #60a5fa; }
  .chip-preparing .flow-chip-dot { background: var(--orange); box-shadow: 0 0 8px var(--orange); }
  .chip-ready .flow-chip-dot { background: #4ade80; box-shadow: 0 0 8px #4ade80; animation: glowPulse 1.5s ease-in-out infinite; }
  .chip-queued .flow-chip-dot { background: rgba(255,255,255,0.3); }

  .chip-ordered .flow-chip-label { color: #60a5fa; }
  .chip-preparing .flow-chip-label { color: var(--orange); }
  .chip-ready .flow-chip-label { color: #4ade80; }
  .chip-queued .flow-chip-label { color: var(--text-muted); }

  /* Transition center */
  .sim-center {
    display: flex; flex-direction: column; align-items: center;
    gap: 12px; padding-top: 80px;
  }

  .sim-arrow {
    width: 40px; height: 1px; background: linear-gradient(90deg, transparent, var(--orange), transparent);
    position: relative;
  }

  .sim-flow-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--orange);
    box-shadow: 0 0 12px var(--orange);
    position: absolute; top: -3.5px; left: 0;
    animation: dotFlow 2.5s ease-in-out infinite;
  }

  .sim-state-chip {
    padding: 5px 12px;
    background: var(--orange-dim);
    border: 1px solid rgba(249,115,22,0.3);
    border-radius: 100px;
    font-size: 10px; font-weight: 700;
    color: var(--orange);
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  /* STATES SECTION */
  .states-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 2px;
  }

  .state-card {
    padding: 36px 28px;
    background: var(--panel);
    border: 1px solid var(--border);
    position: relative; overflow: hidden;
    transition: all 0.3s;
  }

  .state-card:first-child { border-radius: 12px 0 0 12px; }
  .state-card:last-child { border-radius: 0 12px 12px 0; }
  .state-card:hover { background: rgba(255,255,255,0.05); }

  .state-num {
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 24px;
  }

  .state-name {
    font-size: 28px; font-weight: 800; letter-spacing: -0.02em;
    margin-bottom: 16px;
  }

  .state-card:nth-child(1) .state-name { color: #ef4444; }
  .state-card:nth-child(2) .state-name { color: #facc15; }
  .state-card:nth-child(3) .state-name { color: #4ade80; }

  .state-desc { font-size: 14px; color: var(--text-sub); line-height: 1.7; margin-bottom: 32px; }

  .state-visual { margin-top: auto; }

  /* Visual bars for state 1 */
  .chaos-bars { display: flex; align-items: flex-end; gap: 5px; height: 56px; }
  .chaos-bar {
    flex: 1; border-radius: 2px 2px 0 0;
    background: rgba(239,68,68,0.5);
    transform-origin: bottom;
    animation: queuePulse 1.5s ease-in-out infinite;
  }

  /* Sync lines for state 2 */
  .sync-lines { display: flex; flex-direction: column; gap: 6px; }
  .sync-line {
    height: 3px; border-radius: 2px;
    background: linear-gradient(90deg, #facc15, transparent);
    animation: flowPulse 2s ease-in-out infinite;
  }

  /* Flow for state 3 */
  .flow-indicators { display: flex; flex-direction: column; gap: 8px; }
  .flow-indicator {
    display: flex; align-items: center; gap: 10px;
    font-size: 11px; font-family: 'JetBrains Mono', monospace;
    color: #4ade80;
  }
  .flow-indicator-bar {
    flex: 1; height: 2px; background: rgba(74,222,128,0.3);
    border-radius: 1px; overflow: hidden;
    position: relative;
  }
  .flow-indicator-bar::after {
    content: ''; position: absolute; inset: 0;
    background: #4ade80;
    animation: flowPulse 1.8s ease-in-out infinite;
  }

  /* ACTORS SECTION */
  .actors-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    border: 1px solid var(--border); border-radius: 12px;
    overflow: hidden;
  }

  .actor-card {
    padding: 36px 32px;
    background: var(--panel);
    position: relative;
    transition: background 0.3s;
  }
  .actor-card:hover { background: rgba(255,255,255,0.04); }

  .actor-icon {
    width: 48px; height: 48px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 24px;
    position: relative;
  }

  .actor-icon::after {
    content: ''; position: absolute; inset: -6px;
    border-radius: 14px; opacity: 0.2;
    animation: ripple 3s ease-out infinite;
  }

  .actor-student .actor-icon { background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.2); }
  .actor-student .actor-icon::after { background: #60a5fa; }
  .actor-vendor .actor-icon { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); }
  .actor-vendor .actor-icon::after { background: var(--orange); }
  .actor-campus .actor-icon { background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); }
  .actor-campus .actor-icon::after { background: #a855f7; }

  .actor-role {
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 8px;
  }

  .actor-name { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px; }
  .actor-student .actor-name { color: #60a5fa; }
  .actor-vendor .actor-name { color: var(--orange); }
  .actor-campus .actor-name { color: #a855f7; }

  .actor-desc { font-size: 14px; color: var(--text-sub); line-height: 1.6; }

  .actor-tag {
    display: inline-block; margin-top: 20px;
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 10px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.06em;
  }

  .actor-student .actor-tag { background: rgba(96,165,250,0.1); color: #60a5fa; border: 1px solid rgba(96,165,250,0.2); }
  .actor-vendor .actor-tag { background: var(--orange-dim); color: var(--orange); border: 1px solid rgba(249,115,22,0.2); }
  .actor-campus .actor-tag { background: rgba(168,85,247,0.1); color: #a855f7; border: 1px solid rgba(168,85,247,0.2); }

  /* PRODUCT VISUAL */
  .product-center {
    display: flex; flex-direction: column; align-items: center;
    text-align: center;
  }

  .dashboard-card {
    width: 100%; max-width: 640px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 0;
    overflow: hidden;
    animation: glowPulse 4s ease-in-out infinite;
    margin-top: 48px;
  }

  .dashboard-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px;
    background: rgba(0,0,0,0.3);
  }

  .dashboard-dots { display: flex; gap: 6px; }
  .dashboard-dot { width: 10px; height: 10px; border-radius: 50%; }

  .dashboard-title {
    font-size: 12px; font-weight: 600;
    color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    margin-left: 4px;
  }

  .dashboard-body { padding: 28px; }

  .order-row {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
  }
  .order-row:last-child { border-bottom: none; }

  .order-id {
    font-size: 11px; font-family: 'JetBrains Mono', monospace;
    color: var(--text-muted); width: 64px; flex-shrink: 0;
  }

  .order-item { font-size: 14px; font-weight: 600; flex: 1; }

  .status-pill {
    padding: 4px 12px; border-radius: 100px;
    font-size: 11px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }

  .status-ordered { background: rgba(96,165,250,0.1); color: #60a5fa; border: 1px solid rgba(96,165,250,0.2); }
  .status-preparing { background: var(--orange-dim); color: var(--orange); border: 1px solid rgba(249,115,22,0.2); }
  .status-ready { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }

  .order-time {
    font-size: 12px; font-family: 'JetBrains Mono', monospace;
    color: var(--text-muted); flex-shrink: 0; width: 56px; text-align: right;
  }

  .ready-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.3);
    border-radius: 8px;
    font-size: 13px; font-weight: 700;
    color: #4ade80;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 20px;
    animation: glowPulse 2s ease-in-out infinite;
  }

  .ready-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #4ade80;
    animation: glowPulse 1s ease-in-out infinite;
  }

  /* FINAL SECTION */
  .final { text-align: center; align-items: center; }

  .final-overline {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 24px;
  }

  .final h2 {
    font-size: clamp(32px, 4vw, 56px);
    font-weight: 800; letter-spacing: -0.04em;
    line-height: 1.05; margin-bottom: 16px;
    max-width: 800px;
  }

  .final-system-lines {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    margin-bottom: 48px;
  }

  .final-line {
    font-size: 15px; color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    font-weight: 400;
  }

  .final-line.highlight { color: var(--orange); font-weight: 600; }

  /* FOOTER */
  footer {
    padding: 32px 48px;
    border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }

  .footer-logo { font-size: 16px; font-weight: 800; letter-spacing: -0.02em; }
  .footer-logo span { color: var(--orange); }
  .footer-copy { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

  /* SECTION HEADERS */
  .section-overline {
    font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: clamp(28px, 3vw, 44px);
    font-weight: 800; letter-spacing: -0.03em;
    margin-bottom: 40px;
  }

  .section-title .dim { color: var(--text-muted); }

  /* STATS BAR */
  .stats-bar {
    display: flex; gap: 48px;
    padding: 32px 48px;
    background: rgba(255,255,255,0.02);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .stat { display: flex; flex-direction: column; gap: 4px; }
  .stat-val { font-size: 32px; font-weight: 800; color: var(--orange); letter-spacing: -0.03em; }
  .stat-label { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

  /* LOGIN MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-card {
    width: 100%; max-width: 400px;
    background: #0d1520;
    border: 1px solid rgba(249,115,22,0.2);
    border-radius: 16px;
    padding: 40px 36px;
    position: relative;
    animation: slideUp 0.25s ease;
    box-shadow: 0 0 60px rgba(249,115,22,0.08), 0 24px 64px rgba(0,0,0,0.6);
  }

  @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .modal-close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px;
    border: 1px solid var(--border); border-radius: 6px;
    background: transparent; color: var(--text-muted);
    cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    font-family: 'Syne', sans-serif;
  }
  .modal-close:hover { border-color: var(--orange); color: var(--orange); }

  .modal-logo {
    width: 48px; height: 48px; border-radius: 12px;
    background: var(--orange); color: #000;
    font-size: 15px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    font-family: 'Syne', sans-serif;
    letter-spacing: -0.02em;
  }

  .modal-title {
    font-size: 22px; font-weight: 800;
    letter-spacing: -0.03em; margin-bottom: 4px;
  }

  .modal-sub {
    font-size: 13px; color: var(--text-muted);
    margin-bottom: 32px; font-weight: 400;
    font-family: 'JetBrains Mono', monospace;
  }

  .modal-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }

  .modal-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
  }

  .modal-input {
    width: 100%; padding: 12px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: #fff; font-size: 14px;
    font-family: 'JetBrains Mono', monospace;
    outline: none; transition: border-color 0.2s;
  }
  .modal-input::placeholder { color: var(--text-muted); }
  .modal-input:focus { border-color: rgba(249,115,22,0.5); }

  .modal-error {
    padding: 10px 14px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px;
    font-size: 12px; color: #f87171;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 16px;
  }

  .modal-submit {
    width: 100%; padding: 14px;
    background: var(--orange); color: #000;
    border: none; border-radius: 8px;
    font-size: 14px; font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer; margin-top: 8px;
    transition: all 0.2s;
    letter-spacing: 0.02em;
  }
  .modal-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
  .modal-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    nav { padding: 16px 24px; }
    section { padding: 80px 24px; }
    .sim-grid { grid-template-columns: 1fr; }
    .sim-center { flex-direction: row; padding-top: 0; }
    .states-grid { grid-template-columns: 1fr; }
    .state-card:first-child { border-radius: 12px 12px 0 0; }
    .state-card:last-child { border-radius: 0 0 12px 12px; }
    .actors-row { grid-template-columns: 1fr; }
    .stats-bar { flex-wrap: wrap; gap: 24px; padding: 24px; }
    footer { flex-direction: column; gap: 12px; text-align: center; }
  }
`;

// Live status cycling component
function StatusCycler({ delay = 0 }: { delay?: number }) {
  const statuses = ['ORDERED', 'PREPARING', 'READY'];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setIdx(i => (i + 1) % statuses.length);
      }, 2200);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  const statusClass = ['status-ordered', 'status-preparing', 'status-ready'][idx];
  return <span className={`status-pill ${statusClass}`} style={{ transition: 'all 0.4s' }}>{statuses[idx]}</span>;
}

// Animated queue bars
function QueueBars() {
  const widths = [85, 60, 92, 45, 78, 55, 88, 40, 70, 65];
  const delays = [0, 0.3, 0.6, 0.9, 0.2, 0.5, 0.8, 0.1, 0.4, 0.7];
  return (
    <div>
      {widths.map((w, i) => (
        <div className="queue-bar" key={i}>
          <div className="queue-dot" style={{ animationDelay: `${delays[i]}s` }} />
          <div className="queue-line" style={{ width: `${w}%`, animationDelay: `${delays[i]}s` }} />
        </div>
      ))}
    </div>
  );
}

// Flow chips — one of each status plus a queued indicator
function FlowChips() {
  const chips = [
    { label: 'READY', cls: 'chip-ready', id: '#0041', time: '0:42' },
    { label: 'PREPARING', cls: 'chip-preparing', id: '#0042', time: '2:18' },
    { label: 'ORDERED', cls: 'chip-ordered', id: '#0043', time: '4:05' },
    { label: 'ORDERED', cls: 'chip-ordered', id: '#0044', time: '5:50' },
    { label: 'QUEUED', cls: 'chip-queued', id: '#0045', time: '7:30' },
  ];
  return (
    <div>
      {chips.map((c, i) => (
        <div className={`flow-chip ${c.cls}`} key={i} style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="flow-chip-dot" />
          <span className="flow-chip-id">{c.id}</span>
          <span className="flow-chip-label">{c.label}</span>
          <span className="flow-chip-time">{c.time}</span>
        </div>
      ))}
    </div>
  );
}

// Chaos bars for state card
function ChaosViz() {
  const heights = [60, 90, 45, 75, 100, 55, 80, 65, 85, 50, 95, 40];
  return (
    <div className="chaos-bars">
      {heights.map((h, i) => (
        <div key={i} className="chaos-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

// Login modal
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
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo">SQ</div>
        <div className="modal-title">SkipQ Admin</div>
        <div className="modal-sub">// admin access only</div>
        <form onSubmit={handleSubmit}>
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-field">
            <label className="modal-label">Email</label>
            <input className="modal-input" type="email" placeholder="admin@skipq.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="modal-field">
            <label className="modal-label">Password</label>
            <input className="modal-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="modal-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Scroll reveal hook
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function SkipQ() {
  useReveal();
  const [showLogin, setShowLogin] = useState(false);

  const orders = [
    { id: '#0041', item: 'Chicken Burger + Fries', time: '→ 0:42' },
    { id: '#0042', item: 'Veg Wrap + Lassi', time: '→ 3:12' },
    { id: '#0043', item: 'Masala Dosa', time: '→ 4:05' },
    { id: '#0044', item: 'Paneer Naan + Coke', time: '→ 5:30' },
  ];

  return (
    <>
      <style>{styles}</style>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* NAV */}
      <nav>
        <div className="nav-logo">Skip<span>Q</span></div>
        <div className="nav-links">
          <a href="#simulation">System</a>
          <a href="#states">States</a>
          <a href="#actors">Entities</a>
          <button className="btn-ghost" onClick={() => setShowLogin(true)}>Log in</button>
          <button className="btn-primary" onClick={() => setShowLogin(true)}>Enter System</button>
        </div>
      </nav>

      {/* ── 1. SYSTEM INTRO ── */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="scanline" />
        <div className="hero-content">
          <div className="hero-eyebrow reveal">REAL-TIME CAMPUS FOOD COORDINATION</div>
          <h1 className="reveal reveal-delay-1">
            Queue is a<br />
            <span className="strike">system</span><br />
            <span className="accent">failure.</span>
          </h1>
          <p className="hero-sub reveal reveal-delay-2">
            SkipQ replaces waiting with coordination. A real-time execution layer between students, vendors, and campuses.
          </p>
          <div className="hero-ctas reveal reveal-delay-3">
            <button className="btn-large btn-large-primary" onClick={() => setShowLogin(true)}>Enter System</button>
            <button className="btn-large btn-large-ghost" onClick={() => document.getElementById('simulation')?.scrollIntoView({ behavior: 'smooth' })}>View Flow →</button>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar reveal">
        {[
          { val: '0s', label: 'wait time at peak' },
          { val: '3min', label: 'avg ready time' },
          { val: '∞', label: 'order throughput' },
          { val: '3', label: 'system entities' },
        ].map((s, i) => (
          <div className="stat" key={i}>
            <span className="stat-val">{s.val}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── 2. LIVE SYSTEM SIMULATION ── */}
      <section className="simulation" id="simulation">
        <div className="sim-label reveal">// SYSTEM STATE VISUALIZATION</div>
        <div className="sim-title reveal reveal-delay-1">
          Watch the system<br />
          <span style={{ color: 'var(--text-muted)' }}>evolve in real time.</span>
        </div>

        <div className="sim-grid">
          {/* CHAOS */}
          <div className="sim-panel chaos reveal">
            <div className="sim-panel-title">⚠ CHAOS STATE</div>
            <div style={{ fontSize: 12, color: 'rgba(239,68,68,0.6)', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace' }}>
              unstructured demand
            </div>
            <QueueBars />
            <div style={{ marginTop: 20, fontSize: 12, color: 'rgba(239,68,68,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
              47 students waiting · no ETA
            </div>
          </div>

          {/* CENTER TRANSITION */}
          <div className="sim-center">
            {['ORDERED', 'PREPARING', 'READY'].map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div className="sim-state-chip">{s}</div>
                {i < 2 && (
                  <div className="sim-arrow" style={{ width: 2, height: 24, background: 'linear-gradient(180deg, rgba(249,115,22,0.6), transparent)' }} />
                )}
              </div>
            ))}
          </div>

          {/* FLOW */}
          <div className="sim-panel flow reveal reveal-delay-2">
            <div className="sim-panel-title">◆ FLOW STATE</div>
            <div style={{ fontSize: 12, color: 'rgba(249,115,22,0.6)', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace' }}>
              structured execution
            </div>
            <FlowChips />
            <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(74,222,128,0.6)', fontFamily: 'JetBrains Mono, monospace' }}>
              system nominal · all orders tracked
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SYSTEM STATES ── */}
      <section id="states">
        <div className="section-overline reveal">// SYSTEM STATES</div>
        <div className="section-title reveal reveal-delay-1">
          Three states.<br />
          <span className="dim">One direction.</span>
        </div>

        <div className="states-grid">
          {/* STATE 1 */}
          <div className="state-card reveal">
            <div className="state-num">STATE 01</div>
            <div className="state-name">CHAOS</div>
            <div className="state-desc">
              Demand exists but is unorganized. Queues form organically, wait times grow unpredictably, and vendors receive no structured input.
            </div>
            <div className="state-visual">
              <ChaosViz />
            </div>
          </div>

          {/* STATE 2 */}
          <div className="state-card reveal reveal-delay-1">
            <div className="state-num">STATE 02</div>
            <div className="state-name">SYNCHRONIZED</div>
            <div className="state-desc">
              Orders enter structure. Vendors receive live input. Demand is quantified and sequenced. The system begins to self-regulate.
            </div>
            <div className="state-visual">
              <div className="sync-lines">
                {[100, 80, 95, 70, 88].map((w, i) => (
                  <div key={i} className="sync-line" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
            </div>
          </div>

          {/* STATE 3 */}
          <div className="state-card reveal reveal-delay-2">
            <div className="state-num">STATE 03</div>
            <div className="state-name">FLOW</div>
            <div className="state-desc">
              Predictable execution. Orders move through defined stages. Time becomes structured. No waiting loops, no system collapse.
            </div>
            <div className="state-visual">
              <div className="flow-indicators">
                {['ORDERED', 'PREPARING', 'READY'].map((s, i) => (
                  <div className="flow-indicator" key={i}>
                    <span style={{ width: 72, flexShrink: 0 }}>{s}</span>
                    <div className="flow-indicator-bar" style={{ '--delay': `${i * 0.4}s` } as any} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. ACTORS ── */}
      <section id="actors" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="section-overline reveal">// SYSTEM ENTITIES</div>
        <div className="section-title reveal reveal-delay-1">
          Three actors.<br />
          <span className="dim">One system.</span>
        </div>

        <div className="actors-row">
          <div className="actor-card actor-student reveal">
            <div className="actor-icon">🎓</div>
            <div className="actor-role">ENTITY_01</div>
            <div className="actor-name">Student</div>
            <div className="actor-desc">Generates intent. Places structured demand into the system and receives a deterministic output time.</div>
            <span className="actor-tag">→ generates_intent</span>
          </div>
          <div className="actor-card actor-vendor reveal reveal-delay-1">
            <div className="actor-icon">🍳</div>
            <div className="actor-role">ENTITY_02</div>
            <div className="actor-name">Vendor</div>
            <div className="actor-desc">Executes orders. Receives live sequenced input and operates within a structured preparation flow.</div>
            <span className="actor-tag">→ executes_orders</span>
          </div>
          <div className="actor-card actor-campus reveal reveal-delay-2">
            <div className="actor-icon">🏛</div>
            <div className="actor-role">ENTITY_03</div>
            <div className="actor-name">Campus</div>
            <div className="actor-desc">Observes the system. Monitors throughput, vendor performance, and demand distribution across the network.</div>
            <span className="actor-tag">→ observes_system</span>
          </div>
        </div>
      </section>

      {/* ── 5. PRODUCT VISUAL ── */}
      <section>
        <div className="product-center">
          <div className="section-overline reveal">// LIVE ORDER SYSTEM</div>
          <div className="section-title reveal reveal-delay-1" style={{ textAlign: 'center', marginBottom: 0 }}>
            Real-time.<br />
            <span className="dim">Every order, every state.</span>
          </div>

          <div className="dashboard-card reveal reveal-delay-2">
            <div className="dashboard-header">
              <div className="dashboard-dots">
                <div className="dashboard-dot" style={{ background: '#ef4444' }} />
                <div className="dashboard-dot" style={{ background: '#facc15' }} />
                <div className="dashboard-dot" style={{ background: '#4ade80' }} />
              </div>
              <span className="dashboard-title">skipq.system — live order stream</span>
            </div>

            <div className="dashboard-body">
              {orders.map((o, i) => (
                <div className="order-row" key={i}>
                  <span className="order-id mono">{o.id}</span>
                  <span className="order-item">{o.item}</span>
                  <StatusCycler delay={i * 700} />
                  <span className="order-time mono">{o.time}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                <div className="ready-badge">
                  <div className="ready-dot" />
                  Ready in 4 min · Order #0041
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FINAL SYSTEM STATEMENT ── */}
      <section className="final" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249,115,22,0.06), transparent)' }}>
        <div className="final-overline reveal">// END OF QUEUE</div>
        <h2 className="reveal reveal-delay-1">
          SkipQ is a<br />
          <span style={{ color: 'var(--orange)' }}>coordination layer.</span>
        </h2>
        <div className="final-system-lines reveal reveal-delay-2">
          <span className="final-line">Not ordering. Not queueing.</span>
          <span className="final-line highlight">Execution flow.</span>
          <span className="final-line">Time becomes structured.</span>
        </div>
        <button className="btn-large btn-large-primary reveal reveal-delay-3" onClick={() => setShowLogin(true)}>
          Get Started →
        </button>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Skip<span>Q</span></div>
        <div className="footer-copy">© 2026 SkipQ Systems · Real-time campus coordination</div>
      </footer>
    </>
  );
}