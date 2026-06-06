/*
 * ═══════════════════════════════════════════════════════════════
 *  Settings.jsx  —  Settings page
 * ───────────────────────────────────────────────────────────────
 *  CSS:        ./Settings.css
 *  Sidebar:    ./Sidebar.jsx  →  active="settings"
 *  Connected:  App.jsx  (screen="settings")
 *
 *  Props:
 *    navigate  (fn)     — navigate to another screen
 *    user      (obj)    — current { name, email, phone, location }
 *    setUser   (fn)     — updates user in App.jsx → Sidebar refreshes live
 *    theme     (string) — "light" | "dark"  (from App.jsx state)
 *    setTheme  (fn)     — updates theme in App.jsx → ALL modules update
 *
 *  Save Changes:
 *    • Calls setUser()  → name/email update in Sidebar instantly
 *    • Calls setTheme() → dark/light applies to ALL pages via data-theme
 *    • Shows green "Changes saved!" toast
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./Settings.css";

export default function Settings({ navigate, user, setUser, theme, setTheme }) {
  /* Local form — initialised from App-level user prop */
  const [form, setForm] = useState({
    name:     user?.name     || "Harini",
    email:    user?.email    || "harini@gmail.com",
    phone:    user?.phone    || "911504 84084",
    location: user?.location || "India",
  });

  const [localTheme, setLocalTheme] = useState(theme === "dark" ? "Dark Mode" : "Light Mode");
  const [saved,      setSaved]      = useState(false);
  
  // NEW: Data Retention state
  const [retention, setRetention] = useState("Keep indefinitely");

  // NEW: Load the specific user's saved privacy setting when the component mounts
  useEffect(() => {
    const userEmailKey = user?.email || "default";
    const savedRetention = localStorage.getItem(`retention_${userEmailKey}`);
    if (savedRetention) {
      setRetention(savedRetention);
    }
  }, [user?.email]);

  const update = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  /* Save: push all changes up to App.jsx and LocalStorage */
  const handleSave = () => {
    /* 1. Update profile in App → Sidebar updates instantly */
    if (setUser) setUser({ ...form });

    /* 2. Apply theme globally via data-theme on <html> */
    const isDark = localTheme === "Dark Mode";
    if (setTheme) setTheme(isDark ? "dark" : "light");

    /* 3. NEW: Save Data Privacy setting locally, tied strictly to this email! */
    localStorage.setItem(`retention_${form.email}`, retention);

    /* 4. Toast notification */
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initial = (form.name || "H").charAt(0).toUpperCase();

  return (
    <div className="page-wrapper">
      {/* Sidebar — pass form as user so avatar initial updates live */}
      <Sidebar active="settings" navigate={navigate} user={form} />

      <div className="main-content">

        {/* ── Page header ── */}
        <div className="st__page-header">
          <div>
            <h2 className="st__page-title">Settings</h2>
            <p className="st__page-sub">Manage your account preferences and application settings</p>
          </div>
          {saved && <span className="st__toast">✅ Changes saved!</span>}
        </div>

        <div className="card st__card">

          {/* ── Section 1: Profile Information ── */}
          <section className="st__section">
            <div className="st__section-head">
              {/* Avatar shows first letter of current name */}
              <div className="st__avatar">{initial}</div>
              <div>
                <h3 className="st__section-title">Profile Information</h3>
                <p className="st__section-desc">Update your personal information and contact details</p>
              </div>
            </div>

            <div className="st__grid">
              <div className="st__field">
                <label className="st__label">Full Name</label>
                <input className="st__input" value={form.name}
                  onChange={update("name")} placeholder="Enter your full name" />
              </div>
              <div className="st__field">
                <label className="st__label">Email</label>
                <input type="email" className="st__input" value={form.email}
                  onChange={update("email")} placeholder="Enter your email" />
              </div>
              <div className="st__field">
                <label className="st__label">Phone Number</label>
                <input className="st__input" value={form.phone}
                  onChange={update("phone")} placeholder="Enter your phone number" />
              </div>
              <div className="st__field">
                <label className="st__label">Location</label>
                <input className="st__input" value={form.location}
                  onChange={update("location")} placeholder="Enter your location" />
              </div>
            </div>
          </section>

          {/* ── Section 2: Preferences ── */}
          <section className="st__section">
            <h3 className="st__section-title">Preferences</h3>
            <p className="st__section-desc">Customize your application experience</p>

            <div className="st__prefs">

              {/* Theme card */}
              <div className="st__pref-card">
                <span className="st__pref-icon">🎨</span>
                <div className="st__pref-info">
                  <p className="st__pref-title">Theme</p>
                  <p className="st__pref-desc">Applies to all pages instantly on Save</p>
                </div>
                <select
                  className="st__select"
                  value={localTheme}
                  onChange={e => setLocalTheme(e.target.value)}
                >
                  <option>Light Mode</option>
                  <option>Dark Mode</option>
                </select>
              </div>

              {/* Data Retention card (Replaced Language) */}
              <div className="st__pref-card">
                <span className="st__pref-icon">🛡️</span>
                <div className="st__pref-info">
                  <p className="st__pref-title">Data Retention</p>
                  <p className="st__pref-desc">Auto-delete resumes to protect privacy</p>
                </div>
                <select
                  className="st__select"
                  value={retention}
                  onChange={e => setRetention(e.target.value)}
                >
                  <option>Keep indefinitely</option>
                  <option>Delete after 7 days</option>
                  <option>Delete after 30 days</option>
                </select>
              </div>

            </div>
          </section>

          {/* ── Save button ── */}
          <div className="st__save-row">
            <button className="btn btn-primary st__save-btn" onClick={handleSave}>
              💾 Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}