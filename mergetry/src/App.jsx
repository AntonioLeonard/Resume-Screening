/*
 * ═══════════════════════════════════════════════════════════════
 * App.jsx  —  Root of Resume Analyzer
 * ───────────────────────────────────────────────────────────────
 * All pages live in:  src/pages/
 * Shared CSS:         src/pages/global.css  (imported here once)
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import { supabase } from "./supabase"; // Make sure this path points to your supabase.js file

import Login        from "./pages/Login"; // Make sure Login.jsx is in your pages folder
import Dashboard    from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import Result       from "./pages/Result";
import ScanHistory  from "./pages/ScanHistory";
import Settings     from "./pages/Settings";

import "./pages/global.css";

export default function App() {
  /* ── 0. Authentication State ── */
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  /* ── 1. Active screen ── */
  const [screen, setScreen] = useState("dashboard");
  const navigate = (key) => setScreen(key);

  /* ── 2. Theme ── */
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ── 3. User profile (Dynamic based on login) ── */
  const [user, setUser] = useState({
    name:     "",
    email:    "",
    phone:    "",
    location: "",
  });

  /* ── Listen for Supabase Login/Logout ── */
  useEffect(() => {
    // Check if they are already logged in when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setUser({
          email: session.user.email,
          name: session.user.email.split('@')[0], // Creates a default name from the email prefix
          phone: "",
          location: ""
        });
      }
      setIsAuthLoading(false);
    });

    // Listen for changes (like when they click 'Log In' in Login.jsx)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setUser({
          email: session.user.email,
          name: session.user.email.split('@')[0],
          phone: "",
          location: ""
        });
      } else {
        // Clear user data if they log out
        setUser({ name: "", email: "", phone: "", location: "" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ── 4. Analysis data  ResumeUpload → Result ── */
  const [analysisData, setAnalysisData] = useState(null);

  const shared = {
    navigate,
    user,
    setUser,
    theme,
    setTheme,
    analysisData,
    setAnalysisData,
  };

  const screens = {
    "dashboard":     <Dashboard    {...shared} />,
    "resume-upload": <ResumeUpload {...shared} />,
    "result":        <Result       {...shared} />,
    "scan-history":  <ScanHistory  {...shared} />,
    "settings":      <Settings     {...shared} />,
  };

  /* ── RENDER LOGIC ── */
  
  // 1. Show a blank/loading screen while Supabase checks the browser for a login token
  if (isAuthLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Poppins' }}>Loading AI Screener...</div>;
  }

  // 2. If no session is found, ONLY show the Login screen
  if (!session) {
    return <Login />;
  }

  // 3. If they are logged in, show the main application!
  return (
    <div className="app-root">
      {screens[screen] ?? screens["dashboard"]}
    </div>
  );
}