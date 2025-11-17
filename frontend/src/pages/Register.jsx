import React, { useState } from "react";
import { post } from "../api.js";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function Register() {
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [confirmPassword,setConfirmPassword] = useState('');
  const [showPassword,setShowPassword] = useState(false);
  const [showPassword2,setShowPassword2] = useState(false);
  const [role,setRole] = useState('buyer');
  const [msg,setMsg] = useState('');

  const nav = useNavigate();

  async function register(e) {
    e.preventDefault();
    setMsg('');

    if (password !== confirmPassword) {
      return setMsg("Passwords do not match.");
    }

    const res = await post('/auth/register', { name, email, password, role });

    if (res && res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      if (res.user.role === "seller") {
        nav("/seller");
      } else {
        nav("/");
      }
      window.location.reload();
    } else {
      setMsg(res.message || 'Registration failed');
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={register}>
        <h2>Create Account</h2>

        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />

        <label>Password</label>
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
          />
          <span className="eye-btn" onClick={()=>setShowPassword(!showPassword)}>
            {showPassword ? "👁️‍🗨️" : "👁️"}
          </span>
        </div>

        <label>Re-enter Password</label>
        <div className="password-field">
          <input
            type={showPassword2 ? "text" : "password"}
            value={confirmPassword}
            onChange={e=>setConfirmPassword(e.target.value)}
            required
          />
          <span className="eye-btn" onClick={()=>setShowPassword2(!showPassword2)}>
            {showPassword2 ? "👁️‍🗨️" : "👁️"}
          </span>
        </div>

        <label>Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="rider">Rider</option>
        </select>

        <button className="btn full" type="submit">Register</button>
        {msg && <div className="error">{msg}</div>}

        <div className="switch-text">
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
}
