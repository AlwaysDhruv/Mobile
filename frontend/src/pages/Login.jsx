import React, { useState } from "react";
import { post } from "../api.js";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [newPass, setNewPass] = useState("");

  const nav = useNavigate();

  async function login(e) {
    e.preventDefault();
    const res = await post("/auth/login", { email, password });

    if (res && res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      if (res.user.role === "seller") nav("/seller");
      else if (res.user.role === "rider") nav("/rider");
      else if (res.user.role === "buyer") nav("/buyer");
      else nav("/");

      window.location.reload();
    } else {
      setMsg(res.message || "Login failed");
    }
  }

  /* -------------------------------------------------------
      STEP 1: SEND OTP TO EMAIL
  --------------------------------------------------------- */
  async function sendOtp() {
    const res = await post("/auth/forgot-password", { email: fpEmail });

    if (res.success) {
      alert("OTP sent to your email.");
      setOtpSent(true);
    } else {
      alert(res.message);
    }
  }

  /* -------------------------------------------------------
      STEP 2: VERIFY OTP
  --------------------------------------------------------- */
  async function verifyOtp() {
    const res = await post("/auth/verify-otp", { email: fpEmail, otp });

    if (res.success) {
      alert("OTP Verified! You can now reset password.");
      setVerified(true);
    } else {
      alert(res.message);
    }
  }

  /* -------------------------------------------------------
      STEP 3: RESET PASSWORD
  --------------------------------------------------------- */
  async function resetPassword() {
    const res = await post("/auth/reset-password", {
      email: fpEmail,
      newPass,
    });

    if (res.success) {
      alert("Password updated successfully!");
      window.location.reload();
    } else {
      alert(res.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={login}>
        <h2>Login</h2>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="eye-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️‍🗨️" : "👁️"}
          </span>
        </div>

        <button className="btn full" type="submit">
          Login
        </button>
        {msg && <div className="error">{msg}</div>}

        <div className="switch-text">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowForgot(true);
            }}
          >
            Forgot Password?
          </a>
        </div>

        <div className="switch-text">
          Don't have an account? <a href="/register">Create one</a>
        </div>
      </form>

      {/* --------------------------- */}
      {/* FORGOT PASSWORD POPUP UI   */}
      {/* --------------------------- */}
      {showForgot && (
        <div className="forgot-popup">
          <div className="forgot-box">
            <h3>Reset Password</h3>

            {!otpSent && (
              <>
                <label>Enter Email</label>
                <input
                  type="email"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                />
                <button className="btn" onClick={sendOtp}>
                  Send OTP
                </button>
              </>
            )}

            {otpSent && !verified && (
              <>
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button className="btn" onClick={verifyOtp}>
                  Verify OTP
                </button>
              </>
            )}

            {verified && (
              <>
                <label>New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                <button className="btn" onClick={resetPassword}>
                  Update Password
                </button>
              </>
            )}

            <button
              className="cancel-btn"
              onClick={() => setShowForgot(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
