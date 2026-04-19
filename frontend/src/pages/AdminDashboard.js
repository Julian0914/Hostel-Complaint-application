import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Badge, Card, EmptyState, Modal, StatCard, Timeline } from "../components/SharedComponents";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { id: "overview", label: "Overview", helper: "stats" },
  { id: "complaints", label: "Complaints", helper: "filters" },
  { id: "staff", label: "Staff", helper: "team" },
];

const toneForStatus = {
  Pending: "amber",
  "In Progress": "blue",
  Resolved: "green",
};

export default function AdminDashboard() {
  const { authFetch, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filters, setFilters] = useState({ status: "", category: "", priority: "" });
  const [assignStaffId, setAssignStaffId] = useState("");
  const [statusForm, setStatusForm] = useState({ status: "Pending", remarks: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    authFetch(`/admin/complaints${params.toString() ? `?${params.toString()}` : ""}`)
      .then((data) => {
        setComplaints(data.complaints);
        setSummary(data.summary);
      })
      .catch((err) => setError(err.message));
  }, [authFetch, filters, refreshKey]);

  useEffect(() => {
    authFetch("/admin/complaints/staff")
      .then((data) => setStaff(data.staff))
      .catch((err) => setError(err.message));
  }, [authFetch]);

  const complaintCounts = useMemo(
    () => ({
      unassigned: complaints.filter((item) => !item.assignedTo).length,
      urgent: complaints.filter((item) => item.priority === "urgent").length,
    }),
    [complaints]
  );

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignStaffId(complaint.assignedTo?._id || "");
    setStatusForm({ status: complaint.status, remarks: complaint.remarks || "" });
  };

  const closeComplaint = () => {
    setSelectedComplaint(null);
    setAssignStaffId("");
    setStatusForm({ status: "Pending", remarks: "" });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const refresh = () => setRefreshKey((value) => value + 1);

  const assignComplaint = async () => {
    if (!selectedComplaint || !assignStaffId) return;
    setError("");
    setMessage("");

    try {
      await authFetch(`/admin/complaints/${selectedComplaint._id}/assign`, {
        method: "PUT",
        body: JSON.stringify({ staffId: assignStaffId }),
      });
      setMessage("Staff assigned successfully.");
      refresh();
      closeComplaint();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateComplaintStatus = async () => {
    if (!selectedComplaint) return;
    setError("");
    setMessage("");

    try {
      await authFetch(`/admin/complaints/${selectedComplaint._id}/status`, {
        method: "PUT",
        body: JSON.stringify(statusForm),
      });
      setMessage("Complaint status updated.");
      refresh();
      closeComplaint();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteComplaint = async () => {
    if (!selectedComplaint) return;
    setError("");
    setMessage("");

    try {
      await authFetch(`/admin/complaints/${selectedComplaint._id}`, {
        method: "DELETE",
      });
      setMessage("Complaint deleted.");
      refresh();
      closeComplaint();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        title="Admin Dashboard"
        navItems={navItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="dashboard-main">
        <div className="page-header">
          <div>
            <p className="eyebrow">Admin workspace</p>
            <h2>See the full complaint queue and move issues forward</h2>
          </div>
        </div>

        {error && <div className="form-error floating">{error}</div>}
        {message && <div className="form-success">{message}</div>}

        {activeTab === "overview" && (
          <>
            <div className="grid grid-stats">
              <StatCard label="Total" value={summary.total} tone="blue" />
              <StatCard label="Pending" value={summary.pending} tone="amber" />
              <StatCard label="In Progress" value={summary.inProgress} tone="green" />
              <StatCard label="Resolved" value={summary.resolved} tone="purple" />
            </div>

            <div className="grid two-up">
              <Card title="Queue health">
                <div className="stack compact">
                  <div className="list-row">
                    <span>Unassigned complaints</span>
                    <strong>{complaintCounts.unassigned}</strong>
                  </div>
                  <div className="list-row">
                    <span>Urgent complaints</span>
                    <strong>{complaintCounts.urgent}</strong>
                  </div>
                </div>
              </Card>

              <Card title="Latest complaints">
                {complaints.length === 0 ? (
                  <EmptyState
                    title="No complaints in the system"
                    description="Once students submit issues, they will appear here."
                  />
                ) : (
                  <div className="stack compact">
                    {complaints.slice(0, 4).map((complaint) => (
                      <button
                        className="list-row interactive"
                        key={complaint._id}
                        type="button"
                        onClick={() => openComplaint(complaint)}
                      >
                        <div>
                          <div className="list-title">{complaint.title}</div>
                          <div className="muted small">{complaint.student?.name}</div>
                        </div>
                        <Badge tone={toneForStatus[complaint.status]}>{complaint.status}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {activeTab === "complaints" && (
          <div className="stack">
            <Card title="Filters" subtitle="Refine the queue by status, category, or priority.">
              <div className="grid three-up">
                <label>
                  Status
                  <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">All</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </label>

                <label>
                  Category
                  <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                    <option value="">All</option>
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
                  <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </label>
              </div>
            </Card>

            <Card title="Complaint queue">
              {complaints.length === 0 ? (
                <EmptyState title="No matching complaints" description="Try changing the filters or wait for a new submission." />
              ) : (
                <div className="stack compact">
                  {complaints.map((complaint) => (
                    <button
                      className="list-row interactive wide"
                      key={complaint._id}
                      type="button"
                      onClick={() => openComplaint(complaint)}
                    >
                      <div>
                        <div className="list-title">{complaint.title}</div>
                        <div className="muted small">
                          {complaint.student?.name} · Room {complaint.roomNumber}
                        </div>
                      </div>
                      <div className="list-actions">
                        <Badge tone="neutral">{complaint.priority}</Badge>
                        <Badge tone={toneForStatus[complaint.status]}>{complaint.status}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "staff" && (
          <Card title="Maintenance staff">
            {staff.length === 0 ? (
              <EmptyState title="No staff found" description="Create or seed a staff account first." />
            ) : (
              <div className="stack compact">
                {staff.map((member) => (
                  <div className="list-row" key={member._id}>
                    <div>
                      <div className="list-title">{member.name}</div>
                      <div className="muted small">{member.email}</div>
                    </div>
                    <Badge tone="blue">{member.department || "general"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </main>

      <Modal open={Boolean(selectedComplaint)} title="Complaint details" onClose={closeComplaint}>
        {selectedComplaint && (
          <div className="stack">
            <Card
              title={selectedComplaint.title}
              subtitle={`${selectedComplaint.student?.name || "Student"} · Room ${selectedComplaint.roomNumber}`}
              action={<Badge tone={toneForStatus[selectedComplaint.status]}>{selectedComplaint.status}</Badge>}
            >
              <p>{selectedComplaint.description}</p>
              <div className="grid two-up">
                <div>
                  <div className="muted small">Category</div>
                  <strong>{selectedComplaint.category}</strong>
                </div>
                <div>
                  <div className="muted small">Priority</div>
                  <strong>{selectedComplaint.priority}</strong>
                </div>
              </div>
              <Timeline items={selectedComplaint.statusLog} />
            </Card>

            <Card title="Assign staff">
              <div className="grid two-up">
                <label>
                  Staff member
                  <select value={assignStaffId} onChange={(e) => setAssignStaffId(e.target.value)}>
                    <option value="">Select staff</option>
                    {staff.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.department || "general"})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="inline-actions align-end">
                  <button className="button primary" type="button" onClick={assignComplaint}>
                    Assign
                  </button>
                </div>
              </div>
            </Card>

            <Card title="Update status">
              <div className="stack compact">
                <label>
                  Status
                  <select value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </label>

                <label>
                  Remarks
                  <textarea rows="4" value={statusForm.remarks} onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })} />
                </label>

                <div className="inline-actions">
                  <button className="button primary" type="button" onClick={updateComplaintStatus}>
                    Save status
                  </button>
                  <button className="button danger" type="button" onClick={deleteComplaint}>
                    Delete complaint
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
