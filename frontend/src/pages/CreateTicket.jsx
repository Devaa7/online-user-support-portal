import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function CreateTicket() {
  const [block, setBlock] = useState("A");
  const [roomNumber, setRoomNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const parsedRoom = Number(roomNumber);
    const validBlocks = ["A", "B", "C", "D", "E", "F"];

    if (!validBlocks.includes(block)) {
      alert("Please select a valid block (A-F).");
      return;
    }

    if (!Number.isInteger(parsedRoom)) {
      alert("Room Number must be numeric.");
      return;
    }

    if (parsedRoom < 1 || parsedRoom > 200) {
      alert("Room Number must be between 1 and 200.");
      return;
    }

    try {
      await API.post(
        "/tickets",
        { block, roomNumber: parsedRoom, title, description, category },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit support request");
    }
  };

  return (
    <div className="container pageShell">
      <div className="card formCard">
        <h2 className="title">Create New Request</h2>
        <p className="subtitle">Submit a support request for your room or hostel facilities.</p>

        <form className="form" onSubmit={handleSubmit}>
          <p className="small">Request Details</p>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <select
              className="select"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              required
            >
              <option value="A">Block A</option>
              <option value="B">Block B</option>
              <option value="C">Block C</option>
              <option value="D">Block D</option>
              <option value="E">Block E</option>
              <option value="F">Block F</option>
            </select>

            <input
              className="input"
              type="number"
              placeholder="Room Number (1-200)"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              min={1}
              max={200}
              step={1}
              required
            />
          </div>

          <input
            className="input"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="input"
            placeholder="Describe the issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />

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

          <button className="btn" type="submit">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;

