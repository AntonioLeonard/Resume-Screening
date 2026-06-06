/*
 * ═══════════════════════════════════════════════════════════════
 *  Sidebar.jsx  —  Shared sidebar used by ALL modules
 * ────────────────────────────────═════════════════════════════════
 *  Location:   src/pages/Sidebar.jsx
 *  CSS:        ./Sidebar.css  (sidebar-specific)
 *              ./global.css   (base variables & sidebar classes)
 *
 *  Props:
 *    active   (string)   — current page key
 *    navigate (function) — switches screen in App.jsx
 *    user     (object)   — { name, email } shown at bottom
 *
 *  New Requirement: Added logout popout to the user account section.
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { FaRobot }       from "react-icons/fa";
import { IoChevronBack, IoLogOutOutline } from "react-icons/io5";
import { MdDashboard, MdUploadFile, MdBarChart,
         MdHistory, MdSettings }  from "react-icons/md";
import { supabase } from "../supabase"; /* CORRECTED PATH: Steps out of pages folder */
import "./Sidebar.css"; 

/* Navigation items */
const NAV_ITEMS = [
  { key: "dashboard",     label: "Dashboard",        Icon: MdDashboard  },
  { key: "resume-upload", label: "Resume Upload",    Icon: MdUploadFile },
  { key: "result",        label: "Result & Analyze", Icon: MdBarChart   },
  { key: "scan-history",  label: "Scan History",     Icon: MdHistory    },
  { key: "settings",      label: "Settings",         Icon: MdSettings   },
];

export default function Sidebar({ active, navigate, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [popoutOpen, setPopoutOpen] = useState(false); 

  /* User details from props */
  const name    = user?.name  || "Harini";
  const email   = user?.email || "harini@gmail.com";
  const initial = name.charAt(0).toUpperCase();

  /* Log out handler */
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      // Success: Redirection is handled by App.jsx auth listener
      setPopoutOpen(false); 
    }
  };

  return (
    <aside
      className="sidebar"
      style={{ width: collapsed ? "66px" : "var(--sidebar-width)" }}
    >

      {/* ── TOP BLOCK: logo + nav ─────────────────────────── */}
      <div>

        {/* Brand row */}
        <div className="sidebar__brand">

          {/* Logo + brand text (hidden when collapsed) */}
          {!collapsed && (
            <div className="sidebar__logo-wrap">
              <div className="sidebar__logo-box">
                <FaRobot size={20} />
              </div>
              <span className="sidebar__brand-name">AI SCREENER</span>
            </div>
          )}

          {/* Collapsed: only show the logo box, no text */}
          {collapsed && (
            <div className="sidebar__logo-box" style={{ margin: "0 auto" }}>
              <FaRobot size={20} />
            </div>
          )}

          {/* Toggle button with chevron icon */}
          <button
            className="sidebar__toggle"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{ marginLeft: collapsed ? 0 : undefined }}
          >
            <IoChevronBack
              size={16}
              className="sidebar__chevron"
              style={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.25s ease",
              }}
            />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`sidebar__nav-item${active === key ? " active" : ""}`}
              onClick={() => navigate(key)}
              title={collapsed ? label : ""}
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}
            >
              <span className="sidebar__nav-icon">
                <Icon size={20} />
              </span>
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* ── BOTTOM BLOCK: user profile + new logout popout ───────────────────── */}
      <div className="sidebar__user-container">
        
        {/* The user profile section itself */}
        <div 
          className="sidebar__user" 
          onClick={() => setPopoutOpen(!popoutOpen)} 
          style={{ cursor: "pointer" }}
        >
          {/* Avatar circle */}
          <div className="sidebar__avatar">{initial}</div>

          {/* Name + email (hidden when collapsed) */}
          {!collapsed && (
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{name}</span>
              <span className="sidebar__user-email">{email}</span>
            </div>
          )}
        </div>

        {/* The new popout logout menu */}
        {popoutOpen && !collapsed && (
          <div className="sidebar__popout">
            <button className="sidebar__popout-item logout" onClick={handleLogout}>
              <IoLogOutOutline size={18} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>

    </aside>
  );
}