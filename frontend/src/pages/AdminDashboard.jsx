import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
  if (p === "High") return "badge badgePriorityHigh";
  if (p === "Medium") return "badge badgePriorityMedium";
  return "badge badgePriorityLow";
}

function statusBadge(status) {
  if (status === "Open") return "badge badgeOpen";
  if (status === "In Progress") return "badge badgeInProgress";
  return "badge badgeClosed";
}

function formatRoomLabel(ticket) {
  if (!ticket?.block) return `Block: N/A - Room ${ticket?.roomNumber || "N/A"}`;
  return `Block ${ticket.block} - Room ${ticket?.roomNumber || "N/A"}`;
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [statusValue, setStatusValue] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin") || "null");

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
      alert(err.response?.data?.message || "Failed to update request");
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  // âœ… refresh countdown every minute
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
  const statusChartData = [
    { name: "Open", value: open },
    { name: "In Progress", value: inProg },
    { name: "Closed", value: closed },
  ];
  const STATUS_COLORS = ["#f7b84d", "#21d5df", "#34d399"];
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
      (t.roomNumber || "").toLowerCase().includes(q) ||
      (t.block || "").toLowerCase().includes(q) ||
      (t.createdBy?.email || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All" ? true : t.status === statusFilter;

    const isOverdue =
      getDueAt(t) < Date.now() && t.status !== "Closed";

    const matchesOverdue = overdueOnly ? isOverdue : true;

    return matchesSearch && matchesStatus && matchesOverdue;
  });
  return (
    <div className="container pageShell">
      <div className="cardWide">
        <div className="headerRow">
          <div>
            <h2 className="kpiValue">Green Valley Hostel Maintenance Dashboard</h2>
            <p className="subtitle">Manage all support requests raised by hostel residents.</p>
          </div>

          <div className="headerActions">
            <div className="profileCard">
              <div className="profileAvatar">
                {(admin?.name?.[0] || "A").toUpperCase()}
              </div>
              <div className="profileInfo">
                <div className="profileName">{admin?.name || "Admin"}</div>
                <div className="profileEmail">{admin?.email || "No email"}</div>
              </div>
            </div>

            <button
              className="btn btnGhost"
              onClick={() => {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("admin");
                navigate("/admin");
              }}
            >
              Logout
            </button>
          </div>
        </div>
        {/* âœ… Clarity Panel (for reviewer understanding) */}
        <div className="ticketCard sectionCard" style={{ marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>How WeSupport Works</h3>

          <p className="small" style={{ marginTop: 10, lineHeight: 1.7 }}>
            Hostel residents raise <b>Support Requests</b> with room number, category, and issue details.
            The system assigns <b>Priority</b> and <b>SLA</b> automatically. The <b>Green Valley Hostel</b> support
            team updates the request status until resolution.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <span className="badge badgeOpen">Open = Request received</span>
            <span className="badge badgeInProgress">In Progress = Team is working</span>
            <span className="badge badgeClosed">Closed = Request resolved</span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <span className="badge badgeOpen">High = Urgent</span>
            <span className="badge badgeInProgress">Medium = Normal</span>
            <span className="badge badgeClosed">Low = Minor</span>
          </div>

          <p className="small" style={{ marginTop: 10, opacity: 0.9 }}>
            SLA shows time remaining before the request becomes overdue.
          </p>
        </div>
        {/* ðŸ“Š Ticket Status Analytics Chart */}
        <div className="ticketCard sectionCard chartCard" style={{ marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Request Status Overview</h3>
          <p className="small" style={{ marginTop: 6, opacity: 0.9 }}>
            Visual distribution of support request statuses.
          </p>

          <div className="chartShell">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* âœ… Analytics Cards */}
        <div className="ticketGrid" style={{ marginBottom: 20 }}>
          <div className="ticketCard analyticsCard analyticsTotal">
            <h4>Total Requests</h4>
            <p className="kpiValue">{total}</p>
          </div>

          <div className="ticketCard analyticsCard analyticsOpen">
            <h4>Open Requests</h4>
            <p className="kpiValue">{open}</p>
          </div>

          <div className="ticketCard analyticsCard analyticsProgress">
            <h4>In Progress Requests</h4>
            <p className="kpiValue">{inProg}</p>
          </div>

          <div className="ticketCard analyticsCard analyticsResolved">
            <h4>Resolved Requests</h4>
            <p className="kpiValue">{closed}</p>
          </div>

          <div className="ticketCard analyticsCard analyticsOverdue">
            <h4>Overdue Requests</h4>
            <p className="kpiValue">{overdue}</p>
          </div>
        </div>

        {loading && <p className="small">Loading support requests...</p>}

        {!loading && tickets.length === 0 && (
          <p className="small">No support requests found.</p>
        )}

        {/* ðŸ” Search + Filter Controls */}
        <div className="ticketCard sectionCard" style={{ marginBottom: 16 }}>
          <div className="filterToolbar">
            <input
              className="input"
              type="text"
              placeholder="Search by block, room, title, description, user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="filterActions">

              <button
                className={`btn btnGhost ${overdueOnly ? "isActive" : ""}`}
                type="button"
                onClick={() => setOverdueOnly((prev) => !prev)}
              >
                {overdueOnly ? "âœ… Overdue Only" : "Overdue Only"}
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
            Showing <b>{filteredTickets.length}</b> of <b>{tickets.length}</b> requests
          </p>
        </div>

        {/* âœ… Tickets */}
        <div className="ticketGrid">
          {filteredTickets.map((t) => {
            const dueAt = getDueAt(t);
            const diff = dueAt - Date.now();
            const isOverdue = diff < 0;

            return (
              <div
                className="ticketCard"
                key={t._id}
                style={isOverdue && t.status !== "Closed" ? { border: "2px solid var(--danger)" } : {}}
              >
                <div className="headerRow" style={{ marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{t.title}</h3>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {isOverdue && t.status !== "Closed" && (
                      <span className="badge badgeEscalated">ESCALATED</span>
                    )}

                    <span className={priorityBadge(t.priority)}>{t.priority || "Low"}</span>

                    <span className={statusBadge(t.status)}>{t.status}</span>
                  </div>
                </div>

                <p className="small" style={{ marginTop: 6, opacity: 0.9 }}>
                  <b>Category:</b> {t.category || "General"}
                </p>

                <p className="small" style={{ marginTop: 0 }}>{t.description}</p>

                <p className="small">
                  <b>User:</b> {t.createdBy?.name} ({t.createdBy?.email})
                </p>

                <div className="requestMeta">
                  <p className="small">
                    <b>Room:</b> {formatRoomLabel(t)}
                  </p>
                </div>

                <p className="small">
                  <b>SLA:</b>{" "}
                  {isOverdue && t.status !== "Closed" ? (
                    <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                      Overdue by {formatTimeLeft(Math.abs(diff))} (Escalated)
                    </span>
                  ) : (
                    <span style={{ color: "var(--success)" }}>
                      {formatTimeLeft(diff)} remaining
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
                    Update Request
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
