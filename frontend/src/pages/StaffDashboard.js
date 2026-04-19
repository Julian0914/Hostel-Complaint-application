import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Badge, Card, EmptyState, Modal, Timeline } from "../components/SharedComponents";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { id: "active", label: "Active Tasks", helper: "assigned" },
  { id: "completed", label: "Completed", helper: "resolved" },
];

const toneForStatus = {
  Pending: "amber",
  "In Progress": "blue",
  Resolved: "green",
};

export default function StaffDashboard() {
  const { authFetch, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [note, setNote] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    authFetch("/staff/complaints")
      .then((data) => setComplaints(data.complaints))
      .catch((err) => setError(err.message));
  }, [authFetch, refreshKey]);

  const activeComplaints = useMemo(
    () => complaints.filter((item) => item.status !== "Resolved"),
    [complaints]
  );
  const completedComplaints = useMemo(
    () => complaints.filter((item) => item.status === "Resolved"),
    [complaints]
  );

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setRemarks(complaint.remarks || "");
    setNote("");
  };

  const closeComplaint = () => {
    setSelectedComplaint(null);
    setRemarks("");
    setNote("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const refresh = () => setRefreshKey((value) => value + 1);

  const addProgressNote = async () => {
    if (!selectedComplaint || !note.trim()) return;
    setError("");
    setMessage("");

    try {
      await authFetch(`/staff/complaints/${selectedComplaint._id}/progress`, {
        method: "PUT",
        body: JSON.stringify({ note }),
      });
      setMessage("Progress note added.");
      refresh();
      closeComplaint();
    } catch (err) {
      setError(err.message);
    }
  };

  const markResolved = async () => {
    if (!selectedComplaint) return;
    setError("");
    setMessage("");

    try {
      await authFetch(`/staff/complaints/${selectedComplaint._id}/complete`, {
        method: "PUT",
        body: JSON.stringify({ remarks }),
      });
      setMessage("Task marked as resolved.");
      refresh();
      closeComplaint();
      setActiveTab("completed");
    } catch (err) {
      setError(err.message);
    }
  };

  const list = activeTab === "active" ? activeComplaints : completedComplaints;

  return (
    <div className="dashboard-layout">
      <Sidebar
        title="Staff Dashboard"
        navItems={navItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="dashboard-main">
        <div className="page-header">
          <div>
            <p className="eyebrow">Maintenance workspace</p>
            <h2>Handle assigned hostel issues and update students in real time</h2>
          </div>
        </div>

        {error && <div className="form-error floating">{error}</div>}
        {message && <div className="form-success">{message}</div>}

        <Card
          title={activeTab === "active" ? "Assigned tasks" : "Completed tasks"}
          subtitle={
            activeTab === "active"
              ? "Open issues assigned to you."
              : "Resolved items with final notes."
          }
        >
          {list.length === 0 ? (
            <EmptyState
              title="Nothing here right now"
              description={
                activeTab === "active"
                  ? "Once the admin assigns you a complaint, it will show up here."
                  : "Resolved tasks will appear here after completion."
              }
            />
          ) : (
            <div className="stack compact">
              {list.map((complaint) => (
                <button
                  className="list-row interactive wide"
                  type="button"
                  key={complaint._id}
                  onClick={() => openComplaint(complaint)}
                >
                  <div>
                    <div className="list-title">{complaint.title}</div>
                    <div className="muted small">
                      {complaint.student?.name} · Room{" "}
                      {complaint.student?.roomNumber || complaint.roomNumber}
                    </div>
                  </div>
                  <Badge tone={toneForStatus[complaint.status]}>{complaint.status}</Badge>
                </button>
              ))}
            </div>
          )}
        </Card>
      </main>

      <Modal open={Boolean(selectedComplaint)} title="Task details" onClose={closeComplaint}>
        {selectedComplaint && (
          <div className="stack">
            <Card
              title={selectedComplaint.title}
              subtitle={`${selectedComplaint.category} · ${selectedComplaint.priority} priority`}
              action={<Badge tone={toneForStatus[selectedComplaint.status]}>{selectedComplaint.status}</Badge>}
            >
              <p>{selectedComplaint.description}</p>
              <Timeline items={selectedComplaint.statusLog} />
            </Card>

            {selectedComplaint.status !== "Resolved" && (
              <>
                <Card title="Add progress note">
                  <div className="stack compact">
                    <textarea
                      rows="4"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Example: Checked router connection and replacing cable."
                    />
                    <button className="button primary" type="button" onClick={addProgressNote}>
                      Save note
                    </button>
                  </div>
                </Card>

                <Card title="Mark resolved">
                  <div className="stack compact">
                    <textarea
                      rows="4"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Example: Router reset and signal strength restored."
                    />
                    <button className="button primary" type="button" onClick={markResolved}>
                      Mark as resolved
                    </button>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
