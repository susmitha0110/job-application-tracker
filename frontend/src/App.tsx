import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import { login as loginApi } from "./api/auth";
import {
  fetchApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  type Application,
} from "./api/applications";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"] as const;
type Status = (typeof STATUSES)[number];

function isStatus(x: string): x is Status {
  return (STATUSES as readonly string[]).includes(x);
}

function safeTrim(s: string) {
  return s.trim();
}

export default function App() {
  // ---------------------------
  // Auth
  // ---------------------------
  const [token, setToken] = useState<string>(
    () => localStorage.getItem("token") || ""
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // ---------------------------
  // Data
  // ---------------------------
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  // ---------------------------
  // Filters
  // ---------------------------
  const [qCompany, setQCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");

  // ---------------------------
  // Create form
  // ---------------------------
  const [showCreate, setShowCreate] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<Status>("Applied");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  // ---------------------------
  // Load data
  // ---------------------------
  async function load() {
    if (!token) return;
    setLoading(true);
    setDataError("");
    try {
      const data = await fetchApplications(token, {
        status: filterStatus === "All" ? undefined : filterStatus,
        company: safeTrim(qCompany) || undefined,
      });
      setApps(data);
    } catch (e: any) {
      setDataError(e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filterStatus]);

  // Debounce company search
  useEffect(() => {
    if (!token) return;
    const t = setTimeout(() => load(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qCompany]);

  // ---------------------------
  // Stats
  // ---------------------------
  const stats = useMemo(() => {
    const base: Record<Status, number> = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    for (const a of apps) {
      const s = a.status || "Applied";
      if (isStatus(s)) base[s] += 1;
    }
    const total = apps.length;
    return { ...base, total };
  }, [apps]);

  // ---------------------------
  // Auth handlers
  // ---------------------------
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const res = await loginApi(email, password);
      localStorage.setItem("token", res.access_token);
      setToken(res.access_token);
      setPassword("");
      setEmail("");
    } catch {
      setAuthError("Invalid email or password.");
    } finally {
      setAuthBusy(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setApps([]);
    setFilterStatus("All");
    setQCompany("");
  }

  // ---------------------------
  // Create application
  // ---------------------------
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    const payload = {
      company: safeTrim(company),
      role: safeTrim(role),
      status,
      location: safeTrim(location) || null,
      job_url: safeTrim(jobUrl) || null,
      notes: safeTrim(notes) || null,
    };

    if (!payload.company || !payload.role) return;

    setCreateBusy(true);
    try {
      await createApplication(token, payload as any);
      setCompany("");
      setRole("");
      setStatus("Applied");
      setLocation("");
      setJobUrl("");
      setNotes("");
      setShowCreate(false);
      await load();
    } finally {
      setCreateBusy(false);
    }
  }

  // ---------------------------
  // Inline updates
  // ---------------------------
  async function changeStatus(id: number, newStatus: Status) {
    if (!token) return;
    // optimistic UI
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    try {
      await updateApplication(token, id, { status: newStatus } as any);
    } catch {
      // reload if something failed
      await load();
    }
  }

  async function removeApp(id: number) {
    if (!token) return;
    const ok = confirm("Delete this application?");
    if (!ok) return;

    // optimistic UI
    setApps((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteApplication(token, id);
    } catch {
      await load();
    }
  }

  // ---------------------------
  // UI: Login screen
  // ---------------------------
  if (!token) {
    return (
      <div className="page">
        <div className="bg-blur a" />
        <div className="bg-blur b" />

        <div className="authShell">
          <div className="brand">
            <div className="logo">JT</div>
            <div>
              <h1 className="title">Job Tracker</h1>
              <p className="subtitle">
                React • FastAPI • PostgreSQL • Docker • JWT
              </p>
            </div>
          </div>

          <div className="card authCard">
            <h2 className="cardTitle">Admin Login</h2>
            <p className="muted">
              Use your admin credentials from the backend .env.
            </p>

            <form onSubmit={handleLogin} className="form">
              <label className="label">Email</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@portfolio.com"
                required
              />

              <label className="label">Password</label>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />

              {authError ? <div className="error">{authError}</div> : null}

              <button className="btn primary" type="submit" disabled={authBusy}>
                {authBusy ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>

          <p className="footnote">
            Tip: If you get auth errors, check backend logs:{" "}
            <code>docker compose logs -f backend</code>
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------
  // UI: App dashboard
  // ---------------------------
  return (
    <div className="page">
      <div className="topbar">
        <div className="topbarLeft">
          <div className="logo sm">JT</div>
          <div>
            <div className="topTitle">Job Application Tracker</div>
            <div className="topSub">
              Track pipeline • notes • links • status
            </div>
          </div>
        </div>

        <div className="topbarRight">
          <button className="btn" onClick={() => setShowCreate(true)}>
            + Add Application
          </button>
          <button className="btn ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <div className="stats">
          <StatCard label="Total" value={stats.total} tone="neutral" />
          <StatCard label="Applied" value={stats.Applied} tone="blue" />
          <StatCard label="Interview" value={stats.Interview} tone="amber" />
          <StatCard label="Offer" value={stats.Offer} tone="green" />
          <StatCard label="Rejected" value={stats.Rejected} tone="red" />
        </div>

        {/* Filters */}
        <div className="card filters">
          <div className="filtersRow">
            <div className="field">
              <div className="labelSm">Search by company</div>
              <input
                className="input"
                value={qCompany}
                onChange={(e) => setQCompany(e.target.value)}
                placeholder="e.g., Amazon"
              />
            </div>

            <div className="field">
              <div className="labelSm">Status</div>
              <select
                className="select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="All">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="field right">
              <button className="btn ghost" onClick={load} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {dataError ? (
            <div className="error" style={{ marginTop: 10 }}>
              {dataError}
            </div>
          ) : null}
        </div>

        {/* Table */}
        <div className="card tableCard">
          <div className="tableHeader">
            <div className="cardTitle">Applications</div>
            <div className="muted">{apps.length} results</div>
          </div>

          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Links</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty">
                      No applications yet. Click “Add Application”.
                    </td>
                  </tr>
                ) : (
                  apps.map((a) => (
                    <tr key={a.id}>
                      <td className="tdStrong">{a.company}</td>
                      <td>{a.role}</td>
                      <td>
                        <div className={`pill ${pillTone(a.status)}`}>
                          <select
                            className="pillSelect"
                            value={a.status}
                            onChange={(e) =>
                              changeStatus(a.id, e.target.value as Status)
                            }
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>{a.location || <span className="muted">—</span>}</td>
                      <td>
                        <div className="links">
                          {a.job_url ? (
                            <a
                              className="link"
                              href={a.job_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Job
                            </a>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </div>
                      </td>
                      <td className="right">
                        <button
                          className="btn danger ghost"
                          onClick={() => removeApp(a.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="muted" style={{ marginTop: 10 }}>
            Tip: Add notes + job URL during creation. Next we can add “edit
            drawer” + kanban view.
          </div>
        </div>
      </div>

      {/* Create Panel */}
      {showCreate ? (
        <div className="modalOverlay" onMouseDown={() => setShowCreate(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHead">
              <div>
                <div className="cardTitle">Add Application</div>
                <div className="muted">
                  Save it to Postgres and track status over time.
                </div>
              </div>
              <button
                className="btn ghost"
                onClick={() => setShowCreate(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="form grid2">
              <div className="field">
                <div className="labelSm">Company *</div>
                <input
                  className="input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <div className="labelSm">Role *</div>
                <input
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <div className="labelSm">Status</div>
                <select
                  className="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div className="labelSm">Location</div>
                <input
                  className="input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote / Birmingham, AL"
                />
              </div>

              <div className="field span2">
                <div className="labelSm">Job URL</div>
                <input
                  className="input"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="field span2">
                <div className="labelSm">Notes</div>
                <textarea
                  className="textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Recruiter name, keywords, salary, follow-up plan..."
                />
              </div>

              <div className="actions span2">
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn primary"
                  type="submit"
                  disabled={createBusy}
                >
                  {createBusy ? "Saving..." : "Save Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "blue" | "amber" | "green" | "red";
}) {
  return (
    <div className={`stat ${tone}`}>
      <div className="statLabel">{label}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}

function pillTone(status: string) {
  switch (status) {
    case "Applied":
      return "blue";
    case "Interview":
      return "amber";
    case "Offer":
      return "green";
    case "Rejected":
      return "red";
    default:
      return "blue";
  }
}
