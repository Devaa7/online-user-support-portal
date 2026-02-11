import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

/* ---------------- Helpers (hoisted) ---------------- */
function formatTimeLeft(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function getDueAt(t) {
  // Prefer slaDueAt if backend sends it
  if (t?.slaDueAt) return new Date(t.slaDueAt).getTime();

  // Fallback: createdAt + slaHours (for older tickets)
  const created = t?.createdAt ? new Date(t.createdAt).getTime() : Date.now();
  const hours = t?.slaHours ?? 48;
  return created + hours * 60 * 60 * 1000;
}

function priorityBadge(p) {
  if (p === "High") return "badge badgeOpen";
  if (p === "Medium") return "badge badgeInProgress";
  return "badge badgeClosed";
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [statusValue, setStatusValue] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const navigate = useNavigate();

  const fetchAllTickets = async () => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      navigate("/admin");
      return;
    }

    try {
      const res = await API.get("/tickets/admin/all", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setTickets(data);

      // setup default select values
      const map = {};
      data.forEach((t) => (map[t._id] = t.status));
      setStatusValue(map);
    } catch (err) {
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id) => {
    const adminToken = localStorage.getItem("adminToken");

    try {
      await API.put(
        `/tickets/admin/${id}`,
        { status: statusValue[id] },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      fetchAllTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update ticket");
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  // ✅ refresh countdown every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prev) => [...prev]);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  /* ---------------- Analytics ---------------- */
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === "Open").length;
  const inProg = tickets.filter((t) => t.status === "In Progress").length;
  const closed = tickets.filter((t) => t.status === "Closed").length;

  const now = Date.now();
  const overdue = tickets.filter((t) => getDueAt(t) < now && t.status !== "Closed")
    .length;
    
const filteredTickets = tickets.filter((t) => {
  const q = search.toLowerCase().trim();

  const matchesSearch =
    q === "" ||
    (t.title || "").toLowerCase().includes(q) ||
    (t.description || "").toLowerCase().includes(q) ||
    (t.createdBy?.name || "").toLowerCase().includes(q) ||
    (t.createdBy?.email || "").toLowerCase().includes(q);

  const matchesStatus =
    statusFilter === "All" ? true : t.status === statusFilter;

  const isOverdue =
    getDueAt(t) < Date.now() && t.status !== "Closed";

  const matchesOverdue = overdueOnly ? isOverdue : true;

  return matchesSearch && matchesStatus && matchesOverdue;
});
  return (
    <div className="container">
      <div className="cardWide">
        <div className="headerRow">
          <div>
            <h2 className="title">Admin Dashboard</h2>
            <p className="subtitle">View and update all user tickets.</p>
          </div>

          <button
            className="btn btnGhost"
            onClick={() => {
              localStorage.removeItem("adminToken");
              navigate("/admin");
            }}
          >
            Logout
          </button>
        </div>

        {/* ✅ Analytics Cards */}
        <div className="ticketGrid" style={{ marginBottom: 20 }}>
          <div className="ticketCard">
            <h4>Total Tickets</h4>
            <p className="title">{total}</p>
          </div>

          <div className="ticketCard">
            <h4>Open</h4>
            <p className="title">{open}</p>
          </div>

          <div className="ticketCard">
            <h4>In Progress</h4>
            <p className="title">{inProg}</p>
          </div>

          <div className="ticketCard">
            <h4>Closed</h4>
            <p className="title">{closed}</p>
          </div>

          <div className="ticketCard">
            <h4>Overdue (SLA)</h4>
            <p className="title">{overdue}</p>
          </div>
        </div>

        {loading && <p className="small">Loading tickets...</p>}

        {!loading && tickets.length === 0 && (
          <p className="small">No tickets found.</p>
        )}

        {/* 🔍 Search + Filter Controls */}
<div className="ticketCard" style={{ marginBottom: 16 }}>
  <div className="row">
    <input
      className="input"
      type="text"
      placeholder="Search by title, description, user name or email..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <div className="row" style={{ marginTop: 12 }}>

  <button
    className="btn btnGhost"
    type="button"
    onClick={() => setOverdueOnly((prev) => !prev)}
  >
    {overdueOnly ? "✅ Overdue Only" : "Overdue Only"}
  </button>
</div>

    <select
      className="select"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="All">All</option>
      <option value="Open">Open</option>
      <option value="In Progress">In Progress</option>
      <option value="Closed">Closed</option>
    </select>
  </div>

  <p className="small" style={{ marginTop: 10 }}>
    Showing <b>{filteredTickets.length}</b> of <b>{tickets.length}</b> tickets
  </p>
</div>

        {/* ✅ Tickets */}
        <div className="ticketGrid">
          {filteredTickets.map((t) => {
            const dueAt = getDueAt(t);
            const diff = dueAt - Date.now();
            const isOverdue = diff < 0;

            return (
              <div className="ticketCard" key={t._id}>
                <div className="headerRow" style={{ marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{t.title}</h3>

                  <div style={{ display: "flex", gap: 8 }}>
                    <span className={priorityBadge(t.priority)}>
                      {t.priority || "Low"}
                    </span>
                    <span className="badge">{t.status}</span>
                  </div>
                </div>

                <p className="small" style={{ marginTop: 0 }}>
                  {t.description}
                </p>

                <p className="small">
                  <b>User:</b> {t.createdBy?.name} ({t.createdBy?.email})
                </p>

                <p className="small">
                  <b>SLA:</b>{" "}
                  {isOverdue ? (
                    <span style={{ color: "var(--danger)" }}>
                      Overdue by {formatTimeLeft(Math.abs(diff))}
                    </span>
                  ) : (
                    <span style={{ color: "var(--success)" }}>
                      {formatTimeLeft(diff)} left
                    </span>
                  )}
                </p>

                <div className="row" style={{ marginTop: 10 }}>
                  <select
                    className="select"
                    value={statusValue[t._id] || t.status}
                    onChange={(e) =>
                      setStatusValue({ ...statusValue, [t._id]: e.target.value })
                    }
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <button className="btn" onClick={() => updateStatus(t._id)}>
                    Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

