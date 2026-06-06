import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Sidebar from "./Sidebar";
import { FileText, CheckCircle, Star } from "lucide-react";

export default function Dashboard({ navigate, user, setUser, theme, setTheme, analysisData, setAnalysisData }) {

  const [stats, setStats] = useState({
    totalResumes: 0,
    totalAnalyses: 0,
    averageScore: 0,
  });
  
  // NEW: State to hold the real history from Supabase
  const [scans, setScans] = useState([]);

  useEffect(() => {
    const email = user?.email || "harini@gmail.com"; 
    
    // 1. Fetch Top Stats
    fetch(`http://localhost:5000/dashboard-stats?user_email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        if(!data.error) setStats(data);
      })
      .catch((err) => console.error(err));

    // 2. NEW: Fetch Real History for Chart & Recent Activity
    fetch(`http://localhost:5000/scan-history?user_email=${email}`)
      .then(res => res.json())
      .then(data => { 
        if (Array.isArray(data)) setScans(data); 
      })
      .catch((err) => console.error(err));
  }, [user]);

  // NEW: Dynamically calculate the Bar Chart based on real months
  const monthlyCounts = {};
  scans.forEach(scan => {
    const month = new Date(scan.date).toLocaleString('default', { month: 'short' });
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });
  const chartLabels = Object.keys(monthlyCounts);
  const chartValues = Object.values(monthlyCounts);
  const maxVal = Math.max(...chartValues, 1); // Prevent dividing by zero

  const cards = [
    {
      icon: <FileText size={28} color="#2563eb" />,
      label: "Total Resumes",
      value: stats.totalResumes,
      color: "#e8f0fe",
    },
    {
      icon: <CheckCircle size={28} color="#16a34a" />,
      label: "AI Matches",
      value: stats.totalAnalyses,
      color: "#e8fef4",
    },
    {
      icon: <Star size={28} color="#eab308" />,
      label: "Avg Match Score",
      value: Math.round(stats.averageScore) + "%",
      color: "#fff8e1",
    },
  ];

  // --- NEW: Dynamic Time-Based Greeting Logic ---
  const currentHour = new Date().getHours();
  let greeting = "Good Evening";
  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 18) {
    greeting = "Good Afternoon";
  }
  // ----------------------------------------------

  return (
    <div className="page-wrapper">
      <Sidebar active="dashboard" navigate={navigate} user={user} />

      <div className="main-content dashboard-container">
        <h2 className="dashboard-title">
          {/* Replaced hardcoded "Good Morning" with {greeting} */}
          {greeting}, {user?.name || "User"}
        </h2>
        <p className="dashboard-subtitle">
          Optimize Your Resume. Unlock Better Opportunities.
        </p>

        <div className="stats-grid">
          {cards.map((c) => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: c.color }}>
                {c.icon}
              </div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="bottom-grid">
          {/* Graph Section */}
          <div className="content-card">
            <h3 className="card-title">Monthly Applications</h3>
            <div className="chart-container">
              {chartLabels.length === 0 ? (
                 <p style={{color: "#888", textAlign: "center", marginTop: "20px"}}>Upload a resume to see chart data</p> 
              ) : (
                chartLabels.map((label, i) => (
                  <div key={label} style={{display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end"}}>
                    <div
                      className="chart-bar"
                      style={{ height: `${(chartValues[i] / maxVal) * 100}%`, width: "40px", minHeight: "10%" }} 
                    ></div>
                    <span style={{fontSize: "12px", color: "#888", marginTop: "8px"}}>{label}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="content-card">
            <h3 className="card-title">Recent Activity</h3>

            {scans.length === 0 ? (
              <div className="empty-state">
                <p>No recent activity yet</p>
                <p>Upload your resume</p>
              </div>
            ) : (
              <div className="activity-list">
                {scans.slice(0, 4).map((s, i) => (
                  <div key={i} className="activity-item">
                    <div>
                      <div className="activity-title">
                        {s.name || s.job || "Resume"}
                      </div>
                      <div className="activity-date">
                        {s.date}
                      </div>
                    </div>

                    <div
                      className="activity-badge"
                      style={{
                        background: s.score >= 70 ? "#dcfce7" : "#fef3c7",
                        color: s.score >= 70 ? "#166534" : "#92400e",
                      }}
                    >
                      {s.score}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}