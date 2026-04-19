import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Badge, Card, EmptyState, Timeline } from "../components/SharedComponents";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { id: "dashboard", label: "Overview", helper: "summary" },
  { id: "submit", label: "Submit Complaint", helper: "new issue" },
  { id: "myComplaints", label: "My Complaints", helper: "history" },
];

const complaintFormDefault = {
  title: "",
  description: "",
  category: "wifi",
  priority: "medium",
};

const toneForStatus = {
  Pending: "amber",
  "In Progress": "blue",
  Resolved: "green",
};

export default function StudentDashboard() {
  const { authFetch, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState(complaintFormDefault);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    authFetch("/student/complaints")
      .then((data) => setComplaints(data.complaints))
      .catch((err) => setError(err.message));
  }, [authFetch, refreshKey]);

  const summary = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((item) => item.status === "Pending").length,
      inProgress: complaints.filter((item) => item.status === "In Progress").length,
      resolved: complaints.filter((item) => item.status === "Resolved").length,
    }),
    [complaints]
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const submitComplaint = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await authFetch("/student/complaints", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setMessage("Complaint submitted successfully.");
      setFormData(complaintFormDefault);
      setActiveTab("myComplaints");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        title="Student Dashboard"
        navItems={navItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="dashboard-main">
        <div className="page-header">
          <div>
            <p className="eyebrow">Student workspace</p>
            <h2>Track hostel issues from submission to resolution</h2>
          </div>
        </div>

        {error && <div className="form-error floating">{error}</div>}
        {message && <div className="form-success">{message}</div>}

        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-stats">
              <Card title="Total complaints">{summary.total}</Card>
              <Card title="Pending">{summary.pending}</Card>
              <Card title="In progress">{summary.inProgress}</Card>
              <Card title="Resolved">{summary.resolved}</Card>
            </div>

            <Card title="Recent complaints" subtitle="Latest issues from your room">
              {complaints.length === 0 ? (
                <EmptyState
                  title="No complaints yet"
                  description="Use the submit tab to raise your first hostel issue."
                />
              ) : (
                <div className="stack">
                  {complaints.slice(0, 3).map((complaint) => (
                    <div className="list-row" key={complaint._id}>
                      <div>
                        <div className="list-title">{complaint.title}</div>
                        <div className="muted small">{complaint.category}</div>
                      </div>
                      <Badge tone={toneForStatus[complaint.status]}>{complaint.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {activeTab === "submit" && (
          <Card title="Submit a new complaint" subtitle="Add enough detail to help the staff fix it faster.">
            <form className="stack" onSubmit={submitComplaint}>
              <label>
                Title
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  minLength="5"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  rows="5"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  minLength="10"
                  required
                />
              </label>

              <div className="grid two-up">
                <label>
                  Category
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="wifi">WiFi</option>
                    <option value="water">Water</option>
                    <option value="electricity">Electricity</option>
                    <option value="furniture">Furniture</option>
                    <option value="cleanliness">Cleanliness</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </label>
              </div>

              <button className="button primary" type="submit">
                Submit complaint
              </button>
            </form>
          </Card>
        )}

        {activeTab === "myComplaints" && (
          <div className="stack">
            {complaints.length === 0 ? (
              <EmptyState
                title="Nothing submitted yet"
                description="Your complaint history will appear here after your first submission."
              />
            ) : (
              complaints.map((complaint) => (
                <Card
                  key={complaint._id}
                  title={complaint.title}
                  subtitle={`Room ${complaint.roomNumber} · ${complaint.category}`}
                  action={<Badge tone={toneForStatus[complaint.status]}>{complaint.status}</Badge>}
                >
                  <p>{complaint.description}</p>
                  <div className="grid two-up tight-top">
                    <div>
                      <div className="muted small">Priority</div>
                      <strong>{complaint.priority}</strong>
                    </div>
                    <div>
                      <div className="muted small">Assigned to</div>
                      <strong>{complaint.assignedTo?.name || "Waiting for assignment"}</strong>
                    </div>
                  </div>
                  <Timeline items={complaint.statusLog} />
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
