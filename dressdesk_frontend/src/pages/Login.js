import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const resp = await login(email, password);
    if (resp.ok) {
      navigate('/');
    } else {
      const message =
        resp.data && (resp.data.error || resp.data.detail)
          ? (resp.data.error || resp.data.detail)
          : 'You do not have an account yet. Please register first, then log in.';
      setError(message);
    }
  };

  return (
    <div className="login-page">
      <h1>User Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label>Email</label>
          <input name="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
