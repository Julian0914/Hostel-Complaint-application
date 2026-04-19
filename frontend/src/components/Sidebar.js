import React from "react";
import NotificationBell from "./NotificationBell";

export default function Sidebar({ title, navItems, activeTab, setActiveTab, user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div>
          <p className="eyebrow">Hostel Complaints</p>
          <h1>{title}</h1>
        </div>
        <NotificationBell userId={user?.id} />
      </div>

      <div className="sidebar-user">
        <div className="avatar-circle">{user?.name?.slice(0, 1) || "U"}</div>
        <div>
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-meta">
            {user?.role}
            {user?.roomNumber ? ` · Room ${user.roomNumber}` : ""}
            {user?.department ? ` · ${user.department}` : ""}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-link ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="sidebar-link-label">{item.label}</span>
            {item.helper && <span className="sidebar-link-helper">{item.helper}</span>}
          </button>
        ))}
      </nav>

      <button className="button ghost logout-button" type="button" onClick={onLogout}>
        Log out
      </button>
    </aside>
  );
}
