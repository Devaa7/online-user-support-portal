import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function CreateTicket() {
  const [roomNumber, setRoomNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      await API.post(
        "/tickets",
        { roomNumber, title, description, category },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create support ticket");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Raise a Support Ticket</h2>
        <p className="subtitle">Submit your issue and our team will assist you.</p>

        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Room Number (e.g., A-204)"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
          />
          <br />
          <br />

          <input
            className="input"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <br />
          <br />

          <textarea
            className="input"
            placeholder="Describe the issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />
          <br />
          <br />

          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="WiFi/Network">WiFi/Network</option>
            <option value="Room Damage">Room Damage</option>
            <option value="Mess Complaint">Mess Complaint</option>
            <option value="General">General</option>
          </select>
          <br />
          <br />

          <button className="btn" type="submit">
            Submit Support Ticket
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;