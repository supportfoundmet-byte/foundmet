import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "./services/api.js";
import "./global.css";

const emptyData = { users: [], reports: [], admins: [], posts: [] };

export default function Admin() {
  const [admin, setAdmin] = useState(null);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [data, setData] = useState(emptyData);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [adminPage, setAdminPage] = useState(1);
  const [adminPagination, setAdminPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [dataError, setDataError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [dataResponse, statusResponse] = await Promise.all([
      api.get("/admin/data", { params: { page: adminPage, limit: 20, search: query.trim() || undefined }, headers: { "Cache-Control": "no-cache" } }),
      api.get("/admin/status", { headers: { "Cache-Control": "no-cache" } }),
    ]);
    setData({
      users: Array.isArray(dataResponse.data.users) ? dataResponse.data.users : [],
      reports: Array.isArray(dataResponse.data.reports) ? dataResponse.data.reports : [],
      admins: Array.isArray(dataResponse.data.admins) ? dataResponse.data.admins : [],
      posts: Array.isArray(dataResponse.data.posts) ? dataResponse.data.posts : [],
    });
    setStatus(statusResponse.data.status || null);
    setAdminPagination(dataResponse.data.pagination || { page: adminPage, limit: 20, total: 0, totalPages: 1 });
    setDataError("");
  }, [adminPage, query]);

  useEffect(() => {
    api.get("/admin/session")
      .then(async ({ data: result }) => {
        setAdmin(result.admin);
        try {
          await loadData();
        } catch (error) {
          setDataError(error.response?.data?.message || "Admin data could not be loaded.");
        }
      })
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, [loadData]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(searchInput);
      setAdminPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const run = async (request, successText) => {
    setBusy(true);
    setMessage({ type: "", text: "" });
    try {
      await request();
      await loadData();
      setMessage({ type: "success", text: successText });
    } catch (error) {
      setMessage({ type: "danger", text: error.response?.data?.message || "The operation failed." });
    } finally {
      setBusy(false);
    }
  };

  const login = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    await run(async () => {
      const { data: result } = await api.post("/admin/login", credentials);
      setAdmin(result.admin);
    }, "Signed in securely.");
  };

  const createAdmin = async (event) => {
    event.preventDefault();
    await run(async () => {
      await api.post("/admin/admins", form);
      setForm({ name: "", email: "", password: "" });
    }, "Superadmin created.");
  };

  const manageAdmin = (id, action) => {
    if (action === "delete" && !window.confirm("Delete this Superadmin account?")) return;
    run(() => api.patch(`/admin/admins/${id}`, { action }), `Superadmin ${action}d.`);
  };

  const moderate = (url, action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    run(() => api.patch(url, { action }), `Action ${action} completed.`);
  };

  const deleteNews = (postId) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    run(() => api.delete(`/admin/posts/${postId}`), "Spam post deleted.");
  };

  if (loading) {
    return (
      <main className="min-vh-100 bg-background d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" aria-label="Loading" />
      </main>
    );
  }

  if (!admin) {
    return (
      <main className="min-vh-100 bg-background d-flex align-items-center justify-content-center p-3">
        <form className="card border-0 shadow-sm p-4 w-100" style={{ maxWidth: 420 }} onSubmit={login}>
          <p className="admin-eyebrow mb-2">RESTRICTED ACCESS</p>
          <h1 className="h3 fw-bold">Superadmin sign in</h1>
          <p className="small text-secondary">Manage users, reports, posts, and trusted administrators.</p>
          {message.text && <div className={`alert alert-${message.type} small`}>{message.text}</div>}
          <input className="form-control mb-3" type="email" placeholder="Email" autoComplete="username" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} required />
          <input className="form-control mb-3" type="password" placeholder="Password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} required minLength={8} />
          <button className="btn btn-primary w-100" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
        </form>
      </main>
    );
  }

  const sections = [
    ["overview", "Overview", "bi-grid-1x2"],
    ["admins", "Superadmins", "bi-shield-lock"],
    ["users", "Manage users", "bi-people"],
    ["reports", "Reports", "bi-flag"],
    ["news", "Posts & news", "bi-newspaper"],
  ];
  const navigate = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };
  const openReports = data.reports.filter((item) => item.status === "open");

  return (
    <main className="admin-shell">
      {sidebarOpen && <button className="admin-sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="admin-brand"><span className="admin-brand-mark"><i className="bi bi-stars" /></span><span>FoundMet <small>Superadmin</small></span></div>
        <div className="admin-profile">
          <div className="admin-avatar">{admin.name?.charAt(0)?.toUpperCase()}</div>
          <div className="text-truncate"><strong>{admin.name}</strong><small>{admin.email}</small></div>
        </div>
        <nav className="admin-nav" aria-label="Superadmin navigation">
          {sections.map(([key, label, icon]) => (
            <button className={activeSection === key ? "active" : ""} key={key} onClick={() => navigate(key)}>
              <i className={`bi ${icon}`} /> <span>{label}</span>
              {key === "reports" && openReports.length > 0 && <b>{openReports.length}</b>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link className="admin-sidebar-link" to="/"><i className="bi bi-house" /> Open FoundMet</Link>
          <button onClick={() => run(loadData, "Data refreshed.")} disabled={busy}><i className="bi bi-arrow-clockwise" /> Refresh data</button>
          <button className="text-danger" onClick={async () => { try { await api.post("/admin/logout"); } finally { setAdmin(null); } }}><i className="bi bi-box-arrow-left" /> Log out</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><i className="bi bi-list" /></button>
          <div>
            <p className="admin-eyebrow">SECURE ADMINISTRATION</p>
            <h1>{sections.find(([key]) => key === activeSection)?.[1]}</h1>
          </div>
          <div className="admin-top-actions">
            <span className="admin-status-dot"><i /> {status?.database === "connected" ? "System online" : "Database issue"}</span>
            <button className="btn btn-outline-primary btn-sm" onClick={() => run(loadData, "Data refreshed.")} disabled={busy}>Refresh</button>
          </div>
        </header>
        {message.text && <div className={`alert alert-${message.type} small admin-alert`}>{message.text}</div>}
        {dataError && <div className="alert alert-warning small admin-alert d-flex align-items-center justify-content-between gap-2"><span>{dataError}</span><button className="btn btn-sm btn-warning" onClick={() => run(loadData, "Admin data refreshed.")} disabled={busy}>Retry</button></div>}

        {activeSection === "overview" && (
          <>
            <div className="admin-welcome">
              <div>
                <span className="admin-eyebrow">WELCOME BACK</span>
                <h2>{admin.name}</h2>
                <p>Add Superadmins, review reports, remove spam accounts, and delete fake news posts.</p>
              </div>
              <i className="bi bi-bar-chart-line" />
            </div>
            <div className="row g-3 mb-4">
              <Metric label="Users" value={status?.users ?? 0} />
              <Metric label="Open reports" value={status?.openReports ?? openReports.length} />
              <Metric label="Posts" value={status?.posts ?? data.posts.length} />
            </div>
            <div className="admin-panel">
              <span className="admin-eyebrow">QUICK ACTIONS</span>
              <h2>Keep the community safe</h2>
              <div className="row g-3 mt-1">
                <div className="col-12 col-md-3"><button className="admin-action-card" onClick={() => navigate("users")}><i className="bi bi-people" /><strong>Manage users</strong><small>Block or delete spam accounts</small></button></div>
                <div className="col-12 col-md-3"><button className="admin-action-card" onClick={() => navigate("admins")}><i className="bi bi-shield-plus" /><strong>Add Superadmin</strong><small>Invite trusted operators</small></button></div>
                <div className="col-12 col-md-3"><button className="admin-action-card" onClick={() => navigate("reports")}><i className="bi bi-flag" /><strong>Review reports</strong><small>Act on fake or unsafe profiles</small></button></div>
                <div className="col-12 col-md-3"><button className="admin-action-card" onClick={() => navigate("news")}><i className="bi bi-trash" /><strong>Delete spam posts</strong><small>Remove fake news from the feed</small></button></div>
              </div>
            </div>
          </>
        )}

        {activeSection === "admins" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">ACCESS CONTROL</span><h2>Superadmin team</h2></div>
              <span className="admin-count">{data.admins.length} accounts</span>
            </div>
            <form className="row g-2 admin-create-form" onSubmit={createAdmin}>
              <Field className="col-12 col-md-3" placeholder="Name" maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <Field className="col-12 col-md-3" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <Field className="col-12 col-md-3" type="password" minLength="12" maxLength="128" placeholder="Password (12+)" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              <div className="col-12 col-md-3"><button className="btn btn-primary w-100" disabled={busy}>{busy ? "Saving..." : "Add Superadmin"}</button></div>
            </form>
            <AdminList data={data} admin={admin} busy={busy} manageAdmin={manageAdmin} />
          </section>
        )}

        {activeSection === "users" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">COMMUNITY SAFETY</span><h2>Manage users</h2></div>
              <span className="admin-count">{adminPagination.total} users</span>
            </div>
            <input className="form-control admin-search mb-3" placeholder="Search by name, email, role, or address" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
            {data.users.length ? data.users.map((user) => (
              <div className="admin-list-row" key={user._id}>
                <div className="text-break">
                  <strong>{user.name}</strong>
                  <small>{user.email} · {user.role} · reports: {user.reportCount || 0}{user.isBlocked ? " · blocked" : ""}{user.hiddenFromFeed ? " · hidden" : ""}</small>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => moderate(`/admin/users/${user._id}`, user.isBlocked ? "unblock" : "block")}>{user.isBlocked ? "Unblock" : "Block"}</button>
                  <button className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => moderate(`/admin/users/${user._id}`, user.hiddenFromFeed ? "restore" : "hide")}>{user.hiddenFromFeed ? "Restore" : "Hide"}</button>
                  <button className="btn btn-sm btn-danger" disabled={busy} onClick={() => moderate(`/admin/users/${user._id}`, "delete", `Permanently delete ${user.name}? This removes their posts, chats, and reports.`)}>Delete</button>
                </div>
              </div>
            )) : <EmptyState icon="bi-people" text={query ? "No users match your search." : "No users yet."} />}
            <div className="admin-pagination">
              <button className="btn btn-sm btn-outline-primary" disabled={adminPage <= 1 || busy} onClick={() => setAdminPage((value) => value - 1)}>Previous</button>
              <span>Page {adminPagination.page} of {Math.max(1, adminPagination.totalPages)}</span>
              <button className="btn btn-sm btn-outline-primary" disabled={adminPage >= adminPagination.totalPages || busy} onClick={() => setAdminPage((value) => value + 1)}>Next</button>
            </div>
          </section>
        )}

        {activeSection === "reports" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">REVIEW QUEUE</span><h2>User reports</h2></div>
              <span className="admin-count">{openReports.length} open</span>
            </div>
            {data.reports.length ? data.reports.map((report) => (
              <div className="admin-list-row" key={report._id}>
                <span>
                  <strong>{report.targetUser?.name || "Unknown user"}</strong>
                  <small>{report.reason} · {report.status} · by {report.reporter?.name || "member"}{report.details ? ` · ${report.details}` : ""}</small>
                </span>
                {report.status === "open" && (
                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-sm btn-outline-success" disabled={busy} onClick={() => moderate(`/admin/reports/${report._id}`, "dismiss")}>False report</button>
                    <button className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => moderate(`/admin/reports/${report._id}`, "restore")}>Restore</button>
                    <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => moderate(`/admin/reports/${report._id}`, "hide")}>Hide</button>
                    <button className="btn btn-sm btn-warning" disabled={busy} onClick={() => moderate(`/admin/reports/${report._id}`, "block")}>Block</button>
                    <button className="btn btn-sm btn-danger" disabled={busy} onClick={() => moderate(`/admin/reports/${report._id}`, "delete", "Delete this reported user and their content?")}>Delete user</button>
                  </div>
                )}
              </div>
            )) : <EmptyState icon="bi-check2-circle" text="No reports require review." />}
          </section>
        )}

        {activeSection === "news" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">CONTENT MODERATION</span><h2>Posts & news</h2></div>
              <span className="admin-count">{data.posts.length} recent</span>
            </div>
            {data.posts.length ? data.posts.map((post) => (
              <div className="admin-list-row" key={post._id}>
                <div className="text-break">
                  <strong>{post.author?.name || "Unknown author"}</strong>
                  <small>{post.text} · {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</small>
                </div>
                <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => deleteNews(post._id)}>Delete post</button>
              </div>
            )) : <EmptyState icon="bi-newspaper" text="No posts to moderate." />}
          </section>
        )}
      </div>
    </main>
  );
}

function AdminList({ data, admin, busy, manageAdmin }) {
  if (!data.admins.length) return <EmptyState icon="bi-shield-lock" text="No Superadmins found." />;
  return (
    <div className="admin-list mt-4">
      {data.admins.map((item) => (
        <div className="admin-list-row" key={item._id}>
          <div className="text-break"><strong>{item.name}</strong><small>{item.email}</small></div>
          <div className="d-flex gap-2 align-items-center">
            <span className={`badge bg-${item.isBlocked ? "danger" : "success"}`}>{item.isBlocked ? "Blocked" : "Active"}</span>
            {String(item._id) !== String(admin._id) && (
              <>
                <button className="btn btn-sm btn-outline-warning" disabled={busy} onClick={() => manageAdmin(item._id, item.isBlocked ? "unblock" : "block")}>{item.isBlocked ? "Unblock" : "Block"}</button>
                <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => manageAdmin(item._id, "delete")}>Delete</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value, tone = "primary" }) {
  return (
    <div className="col-12 col-md-4">
      <div className="card border-0 shadow-sm p-3">
        <small className="text-secondary">{label}</small>
        <strong className={`fs-3 text-${tone}`}>{value}</strong>
      </div>
    </div>
  );
}

function Field({ className, ...props }) {
  return <div className={className}><input className="form-control" autoComplete="off" required {...props} /></div>;
}

function EmptyState({ icon, text }) {
  return <div className="admin-empty-state"><i className={`bi ${icon}`} /><span>{text}</span></div>;
}
