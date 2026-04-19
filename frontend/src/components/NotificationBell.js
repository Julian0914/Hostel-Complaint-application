import React, { useState } from "react";
import { useSocket } from "../hooks/useSocket";

const typeLabels = {
  new_assignment: "Assignment",
  status_update: "Status",
  complaint_resolved: "Resolved",
  new_complaint: "New",
};

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useSocket(userId, (notification) => {
    setNotifications((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ...notification,
        read: false,
        time: new Date().toISOString(),
      },
      ...current.slice(0, 19),
    ]);
  });

  const unreadCount = notifications.filter((item) => !item.read).length;

  const toggleOpen = () => {
    setOpen((current) => {
      const next = !current;
      if (!current) {
        setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      }
      return next;
    });
  };

  return (
    <div className="notification-shell">
      <button className="notification-trigger" onClick={toggleOpen} type="button">
        <span aria-hidden="true">Bell</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-heading">Notifications</div>
          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications yet.</div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`notification-item ${item.read ? "read" : "unread"}`}
              >
                <div className="notification-type">{typeLabels[item.type] || "Update"}</div>
                <div>{item.message || item.title || "New activity received."}</div>
                <div className="notification-time">
                  {new Date(item.time).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
