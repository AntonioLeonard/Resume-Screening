import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./ScanHistory.css";

/* ── Build stat strip from current scans array ── */
function buildStats(scans) {
  const total = scans.length;
  const avg   = total ? Math.round(scans.reduce((s, r) => s + r.score, 0) / total) : 0;
  const best  = total ? Math.max(...scans.map(r => r.score)) : 0;
  const month = scans.length; 
  const low   = scans.filter(r => r.score < 60).length;
  return [
    { icon: "📋", label: "Total Scans",       value: total  },
    { icon: "📊", label: "Avg Score",         value: `${avg}%` },
    { icon: "🏆", label: "Best Score",        value: `${best}%` },
    { icon: "📅", label: "This Month",        value: month  },
    { icon: "⚠️", label: "Needs Improvement", value: low    },
  ];
}

/* ── Score badge colour ── */
function badgeStyle(score) {
  if (score >= 80) return { bg: "#dcfce7", color: "#16a34a" };
  if (score >= 60) return { bg: "#fef3c7", color: "#d97706" };
  return               { bg: "#fee2e2", color: "#dc2626" };
}

export default function ScanHistory({ navigate, user, setAnalysisData }) {
  const [scans,   setScans]   = useState([]); // Start empty, wait for DB
  const [search,  setSearch]  = useState("");
  const [sortDir, setSortDir] = useState("desc"); 

  // Fetch the real history from the backend database
  useEffect(() => {
    const email = user?.email || "harini@gmail.com";
    
    fetch(`http://localhost:5000/scan-history?user_email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setScans(data);
        }
      })
      .catch(err => console.error("Error fetching history:", err));
  }, [user]);

  /* Filter + sort */
  const filtered = scans
    .filter(s =>
      (s.job || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.skills || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortDir === "desc" ? b.score - a.score : a.score - b.score);

  const stats = buildStats(scans);

  const deleteRow = (id) => setScans(prev => prev.filter(s => s.id !== id));

  return (
    <div className="page-wrapper">
      <Sidebar active="scan-history" navigate={navigate} user={user} />

      <div className="main-content">

        {/* ── Header ── */}
        <div className="sh__header">
          <div>
            <h2 className="sh__title">Scan History</h2>
            <p className="sh__sub">View and manage all your resume scans and their results</p>
          </div>
          <div className="sh__controls">
            {/* Search */}
            <div className="sh__search-wrap">
              <span className="sh__search-icon">🔍</span>
              <input
                className="sh__search"
                placeholder="Search job or skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Sort toggle */}
            <button
              className="sh__sort-btn"
              onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
            >
              {sortDir === "desc" ? "↓ Score" : "↑ Score"}
            </button>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="sh__stats">
          {stats.map(({ icon, label, value }) => (
            <div className="card sh__stat-card" key={label}>
              <span className="sh__stat-icon">{icon}</span>
              <span className="sh__stat-value">{value}</span>
              <span className="sh__stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="card sh__table-card">
          {filtered.length === 0 ? (
            <p className="sh__empty">No results found.</p>
          ) : (
            <div className="sh__table-scroll">
              <table className="sh__table">
                <thead>
                  <tr>
                    <th>SCORE</th>
                    <th>JOB TITLE</th>
                    <th>SKILLS</th>
                    <th>SCAN DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => {
                    const { bg, color } = badgeStyle(row.score);
                    return (
                      <tr key={row.id}>
                        <td>
                          <span className="sh__badge" style={{ background: bg, color }}>
                            {row.score}%
                          </span>
                        </td>
                        <td className="sh__job">{row.job}</td>
                        <td className="sh__skills">{row.skills}</td>
                        <td className="sh__date">{row.date}</td>
                        <td>
                          <div className="sh__actions">
                            
                            {/* THE UPDATED VIEW BUTTON */}
                            <button
                              className="sh__action-btn"
                              title="View Result"
                              onClick={() => {
                                setAnalysisData(row);
                                navigate("result");
                              }}
                            >👁</button>

                            <button
                              className="sh__action-btn"
                              title="Download Resume PDF"
                              onClick={() => {
                                if (row.resume_url) {
                                  window.open(row.resume_url, "_blank"); // Opens the actual PDF in a new tab!
                                } else {
                                  alert("Resume PDF not found for this candidate.");
                                }
                              }}
                            >⬇</button>
                            <button
                              className="sh__action-btn sh__action-btn--del"
                              title="Delete"
                              onClick={() => deleteRow(row.id)}
                            >🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Quick actions ── */}
        <div className="card sh__quick">
          <span className="sh__quick-label">Quick Actions</span>
          <div className="sh__quick-btns">
            <button className="btn btn-primary" onClick={() => navigate("resume-upload")}>
              📂 Upload Resume
            </button>
            <button className="btn btn-outline" onClick={() => {
              if (scans.length > 0) {
                 setAnalysisData(scans[0]);
                 navigate("result");
              }
            }}>
              📊 View Result
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}