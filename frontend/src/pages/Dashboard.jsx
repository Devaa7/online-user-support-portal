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
      setTickets(res.data);
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
            <h2 className="title">My Tickets</h2>
            <p className="subtitle">Track your issues and their current status.</p>
          </div>

          <div className="row" style={{ maxWidth: 340 }}>
            <button className="btn btnGhost" onClick={() => navigate("/create-ticket")}>
              + New Ticket
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

        {loading && <p className="small">Loading tickets...</p>}

        {!loading && tickets.length === 0 && (
          <p className="small">No tickets yet. Create your first ticket.</p>
        )}

        <div className="ticketGrid">
          {tickets.map((t) => (
            <div className="ticketCard" key={t._id}>
              <div className="headerRow" style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{t.title}</h3>
                <span className={badgeClass(t.status)}>{t.status}</span>
              </div>
              <p className="small" style={{ marginTop: 0 }}>
                {t.description}
              </p>
              <p className="small">
                Category: <b>{t.category}</b>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;