import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const departments = ["plumbing", "electrical", "networking", "carpentry", "cleaning"];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    roomNumber: "",
    department: departments[0],
  });

  const needsRoom = formData.role === "student";
  const needsDepartment = formData.role === "staff";

  const payload = useMemo(
    () => ({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      roomNumber: needsRoom ? formData.roomNumber : undefined,
      department: needsDepartment ? formData.department : undefined,
    }),
    [formData, needsDepartment, needsRoom]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await register(payload);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Create account</p>
        <h1>Get started</h1>
        <p className="muted">Choose a role and fill in the details needed for that account.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input name="email" type="email" value={formData.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Role
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </label>

          {needsRoom && (
            <label>
              Room number
              <input
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="A-204"
                required
              />
            </label>
          )}

          {needsDepartment && (
            <label>
              Department
              <select name="department" value={formData.department} onChange={handleChange}>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && <div className="form-error">{error}</div>}

          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
