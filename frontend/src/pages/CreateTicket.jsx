import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function CreateTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    try {
      await API.post(
        "/tickets",
        { title, description, category },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="headerRow">
          <div>
            <h2 className="title">Create Ticket</h2>
            <p className="subtitle">Describe your issue clearly for quick support.</p>
          </div>
        </div>

        {error && <div className="msgError">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Ticket title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="textarea"
            placeholder="Describe your issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Technical">Technical</option>
            <option value="Billing">Billing</option>
            <option value="General">General</option>
          </select>

          <div className="row">
            <button className="btn btnGhost" type="button" onClick={() => navigate("/dashboard")}>
              Cancel
            </button>
            <button className="btn" type="submit">
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;