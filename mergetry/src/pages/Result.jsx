import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./Result.css";

/* ── Score → label + colours (Preserving your exact original styling) ── */
function scoreInfo(score) {
  if (score >= 80) return { label: "Good Match",       bg: "#dcfce7", color: "#16a34a", arc: "#22c55e" };
  if (score >= 60) return { label: "Average Match",    bg: "#fef3c7", color: "#d97706", arc: "#f59e0b" };
  return               { label: "Needs Improvement", bg: "#fee2e2", color: "#dc2626", arc: "#ef4444" };
}

/* ── Donut SVG (Preserving your Poppins font and exact SVG attributes) ── */
function Donut({ score }) {
  const R = 78;
  const C = 2 * Math.PI * R;
  const filled = C * (score / 100);
  const { arc, color, label } = scoreInfo(score);

  return (
    <svg viewBox="0 0 200 200" className="result__donut" aria-label={`Score ${score}%`}>
      <defs>
        <linearGradient id={`grad-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#2585f3" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r={R} fill="none" stroke="var(--input-bg)" strokeWidth="24" />
      <circle
        cx="100" cy="100" r={R}
        fill="none"
        stroke={`url(#grad-${score})`}
        strokeWidth="24"
        strokeDasharray={`${filled} ${C}`}
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
        style={{ transition: "stroke-dasharray 0.9s ease" }}
      />
      <text x="100" y="88" textAnchor="middle"
        style={{ fontSize: 26, fontWeight: 700, fontFamily: "Poppins,sans-serif", fill: "var(--text)" }}>
        {score}%
      </text>
      <text x="100" y="114" textAnchor="middle"
        style={{ fontSize: 12, fontFamily: "Poppins,sans-serif", fill: color, fontWeight: 600 }}>
        {label}
      </text>
    </svg>
  );
}

/* ── Animated progress bar row ── */
function BreakdownRow({ label, pct }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 150); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="result__row">
      <div className="result__row-meta">
        <span className="result__row-label">{label}</span>
        <span className="result__row-pct">{pct}%</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function Result({ navigate, user }) {
  const [scans, setScans] = useState([]);
  const [selected, setSelected] = useState(0);

  // NEW REQUIREMENT: Fetch real data to create the dynamic tabs
  useEffect(() => {
    const email = user?.email || "harini@gmail.com";
    fetch(`http://localhost:5000/scan-history?user_email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setScans(data);
        }
      });
  }, [user]);

  // Convert database rows into candidate profiles using your exact Breakdown labels
  const displayCandidates = scans.length > 0 ? scans.map((s, idx) => ({
    id: s.id || idx,
    name: s.name || "Analyzed Resume", // Dynamic Name 
    score: s.score || 0,                 // Dynamic Score
    summary: `Skills found: ${s.skills || "N/A"}.`,
    breakdown: [
      { label: "Skill Match", pct: s.score },
      { label: "Overall",     pct: s.score },
    ]
  })) : [{ 
    id: 1, 
    name: "Loading...", 
    score: 0, 
    summary: "Waiting for analysis data...", 
    breakdown: [
      { label: "Skill Match", pct: 0 },
      { label: "Overall",     pct: 0 }
    ] 
  }];

  const candidate = displayCandidates[selected];
  const { bg, color, label: matchLabel } = scoreInfo(candidate?.score || 0);

  return (
    <div className="page-wrapper">
      <Sidebar active="result" navigate={navigate} user={user} />

      <div className="main-content">
        <div className="result__header">
          <div>
            <h2 className="result__page-title">Result &amp; Analyze</h2>
            <p className="result__page-sub">AI-powered candidate analysis results</p>
          </div>
          <button className="btn btn-outline" onClick={() => window.print()}>
            📄 Download PDF
          </button>
        </div>

        <div className="result__tabs">
          {displayCandidates.map((c, i) => {
            const { color: tc } = scoreInfo(c.score);
            return (
              <button
                key={c.id}
                className={`result__tab${selected === i ? " result__tab--active" : ""}`}
                onClick={() => setSelected(i)}
              >
                <span className="result__tab-name">{c.name}</span>
                <span className="result__tab-score" style={{ color: tc }}>{c.score}%</span>
              </button>
            );
          })}
        </div>

        <div className="result__panels">
          <div className="card result__score-card">
            <h3 className="result__panel-title">AI Match Score</h3>
            <div className="result__donut-wrap">
              {candidate && <Donut score={candidate.score} key={candidate.id} />}
            </div>
            <p className="result__summary">{candidate?.summary}</p>
            <div className="result__pill-wrap">
              <span className="result__match-pill" style={{ background: bg, color }}>
                {matchLabel}
              </span>
            </div>
          </div>

          <div className="card result__breakdown-card">
            <h3 className="result__panel-title">Score Breakdown</h3>
            <div className="result__breakdown-list">
              {candidate?.breakdown.map(({ label, pct }) => (
                <BreakdownRow key={label} label={label} pct={pct} />
              ))}
            </div>
          </div>
        </div>

        <div className="card result__action-bar">
          <p className="result__action-note">
            Analysis complete — review scores above for {candidate?.name}
          </p>
          <div className="result__action-btns">
            <button className="btn btn-outline" onClick={() => navigate("resume-upload")}>
              ↩ Analyze Again
            </button>
            <button className="btn btn-primary" onClick={() => navigate("scan-history")}>
              View Overall Report →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}