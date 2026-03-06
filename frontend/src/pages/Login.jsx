import { useEffect, useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="headerRow">
          <div>
            <h2 className="title">User Login – WeSupport</h2>
<p className="subtitle">
  Login to raise and track your <b>Support Requests</b>.
</p>
          </div>
        </div>

        {error && <div className="msgError">{error}</div>}

        <form className="form" onSubmit={handleLogin}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn" type="submit">
            Login
          </button>

          <button
            className="btn btnGhost"
            type="button"
            onClick={() => navigate("/register")}
          >
            Create new account
          </button>
          <p className="small" style={{ marginTop: 10, opacity: 0.9 }}>
  This portal helps users submit issues and track resolution updates.
</p>
          <div style={{ textAlign: "center", marginTop: 20 }}>
  <span className="small" style={{ opacity: 0.9 }}>
    New user?
  </span>{" "}
  <Link
    to="/register"
    style={{
      fontWeight: 600,
      textDecoration: "none",
      color: "var(--primary)",
    }}
  >
    Register here
  </Link>
</div>
        </form>
        <div className="ticketCard" style={{ marginTop: 16 }}>
  <h3 style={{ margin: 0, fontSize: 16 }}>How WeSupport Works</h3>
  <ol className="small" style={{ marginTop: 10, lineHeight: 1.8 }}>
    <li>Login / Register</li>
    <li>Raise a <b>Support Request</b> (issue details)</li>
    <li>Admin reviews and updates the status</li>
    <li>Track progress + SLA time remaining</li>
  </ol>

  <p className="small" style={{ marginTop: 10, opacity: 0.9 }}>
    Status meaning: <b>Open</b> = received, <b>In Progress</b> = working, <b>Closed</b> = resolved.
  </p>
</div>
      </div>
    </div>
  );
}

export default Login;