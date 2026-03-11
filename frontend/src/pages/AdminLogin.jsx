import { useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) navigate("/admin/dashboard");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <div className="container">
      <div className="card authCard">
        <h2 className="title">Admin Login – WeSupport</h2>
        <p className="subtitle">Green Valley Hostel Administration Portal</p>
        <p className="small" style={{ marginTop: 6, opacity: 0.85 }}>
          Admins can monitor, update, and resolve hostel maintenance and support requests.
        </p>

        {error && <div className="msgError">{error}</div>}

        <form className="form" onSubmit={handleLogin}>
          <input
            className="input"
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn" type="submit">
            Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;


