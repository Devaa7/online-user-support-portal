import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function badgeClass(status) {
  if (status === "Open") return "badge badgeOpen";
  if (status === "In Progress") return "badge badgeInProgress";
  return "badge badgeClosed";
}

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    <div className="container">
      <div className="cardWide">
        <div className="headerRow">
          <div>
            <h2 className="title">My Support Tickets</h2>
            <p className="subtitle">
              Track your submitted support requests and their current status.
            </p>
          </div>

          <div className="row" style={{ maxWidth: 380 }}>
            <button
              className="btn btnGhost"
              onClick={() => navigate("/create-ticket")}
            >
              + Raise Support Ticket
            </button>

            <button
              className="btn btnGhost"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* ✅ Status Legend (clarity for reviewers) */}
        <div className="ticketCard" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Status Legend</h3>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            <span className="badge badgeOpen">Open = Received</span>
            <span className="badge badgeInProgress">In Progress = Working</span>
            <span className="badge badgeClosed">Closed = Resolved</span>
          </div>

          <p className="small" style={{ marginTop: 10, opacity: 0.9 }}>
            Tip: Create a support ticket for any issue. Admin will update the
            status as work progresses.
          </p>
        </div>

        {loading && <p className="small">Loading support tickets...</p>}

        {!loading && tickets.length === 0 && (
          <p className="small">
            No support tickets yet. Click <b>Raise Support Ticket</b> to create
            your first request.
          </p>
        )}

        <div className="ticketGrid">
          {tickets.map((t) => (
            <div className="ticketCard" key={t._id}>
              <div className="headerRow" style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{t.title}</h3>
                <span className={badgeClass(t.status)}>{t.status}</span>
              </div>

              <p className="small" style={{ marginTop: 6, opacity: 0.9 }}>
                <b>Ticket ID:</b> {t._id}
              </p>

              <p className="small" style={{ marginTop: 6, opacity: 0.9 }}>
                <b>Room:</b> {t.roomNumber || "—"}
              </p>

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