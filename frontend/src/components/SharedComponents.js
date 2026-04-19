import React from "react";

export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Card({ title, subtitle, action, children }) {
  return (
    <section className="card">
      {(title || subtitle || action) && (
        <div className="card-header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, tone = "blue" }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-panel" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="button ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Timeline({ items = [] }) {
  if (!items.length) {
    return <div className="empty-state">No timeline events yet.</div>;
  }

  return (
    <div className="timeline">
      {items.map((item, index) => (
        <div className="timeline-item" key={`${item.timestamp || index}-${index}`}>
          <div className="timeline-dot" />
          <div>
            <div className="timeline-title">{item.status}</div>
            <div className="timeline-note">{item.note || "No note provided."}</div>
            <div className="timeline-time">
              {item.timestamp ? new Date(item.timestamp).toLocaleString() : "Just now"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
