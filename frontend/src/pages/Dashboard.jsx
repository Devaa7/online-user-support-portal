import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function badgeClass(status) {
  if (status === "Open") return "badge badgeOpen";
  if (status === "In Progress") return "badge badgeInProgress";
  return "badge badgeClosed";
}

function formatRoomLabel(ticket) {
  if (!ticket?.block) return `Block: N/A - Room ${ticket?.roomNumber || "N/A"}`;
  return `Block ${ticket.block} - Room ${ticket?.roomNumber || "N/A"}`;
}

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchTickets = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await API.get("/tickets/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="container pageShell">
      <div className="cardWide">
        <div className="headerRow">
          <div>
            <h2 className="title">My Maintenance Requests</h2>
            <p className="subtitle">
              Track the status of your hostel maintenance requests.
            </p>
          </div>

          <div className="headerActions">
            <div className="profileCard">
              <div className="profileAvatar">
                {(user?.name?.[0] || "U").toUpperCase()}
              </div>
              <div className="profileInfo">
                <div className="profileName">{user?.name || "User"}</div>
                <div className="profileEmail">{user?.email || "No email"}</div>
              </div>
            </div>

            <button
              className="btn btnGhost"
              onClick={() => navigate("/create-ticket")}
            >
              + Create New Request
            </button>

            <button
              className="btn btnGhost"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* âœ… Status Legend (clarity for reviewers) */}
        <div className="ticketCard sectionCard" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Request Status Legend</h3>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            <span className="badge badgeOpen">Open = Request received</span>
            <span className="badge badgeInProgress">In Progress = Team is working</span>
            <span className="badge badgeClosed">Closed = Request resolved</span>
          </div>

          <p className="small" style={{ marginTop: 10, opacity: 0.9 }}>
            Raise a support request for any hostel-related issue such as room maintenance,
            electrical fault, plumbing issue, WiFi/network problem, or mess complaint.
          </p>
        </div>

        {loading && <p className="small">Loading support requests...</p>}

        {!loading && tickets.length === 0 && (
          <p className="small">
            No maintenance requests yet. Create your first request.
          </p>
        )}

        <div className="ticketGrid">
          {tickets.map((t) => (
            <div className="ticketCard requestCard" key={t._id}>
              <div className="headerRow" style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{t.title}</h3>
                <span className={badgeClass(t.status)}>{t.status}</span>
              </div>

              <div className="requestMeta">
                <p className="small" style={{ marginTop: 6, opacity: 0.9 }}>
                  <b>Request ID:</b> {t._id}
                </p>

                <p className="small" style={{ marginTop: 6, opacity: 0.9 }}>
                  <b>Room:</b> {formatRoomLabel(t)}
                </p>
              </div>

              <p className="small" style={{ marginTop: 0 }}>
                {t.description}
              </p>

              <p className="small">
                <b>Category:</b> {t.category || "General"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


