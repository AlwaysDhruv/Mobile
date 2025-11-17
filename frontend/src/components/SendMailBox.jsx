import React, { useState, useEffect } from "react";
import { get, post } from "../api.js";
import "./SendMailBox.css";

export default function SendMailBox({ email: presetEmail = "", onClose }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(presetEmail);
  const [role, setRole] = useState("buyer"); // buyer or rider
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim().length > 1) searchUsers();
    else setResults([]);
  }, [query, role]);

  async function searchUsers() {
    const res = await get(`/auth/search?role=${role}&q=${query}`);
    setResults(res || []);
  }

  async function send() {
    if (!email) return alert("Select recipient first!");
    if (!subject || !message) return alert("Subject & message required!");
    await post("/mail/send", { email, subject, message });
    alert("Message Sent ✅");
    onClose();
  }

  return (
    <div className="mail-box">
      <div className="mail-header">
        <h3>Compose Message</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="search-area">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="buyer">Buyer</option>
          <option value="rider">Rider</option>
        </select>

        <input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {results.length > 0 && (
          <ul className="search-results">
            {results.map((u) => (
              <li key={u._id} onClick={() => { setEmail(u.email); setResults([]); }}>
                <strong>{u.name}</strong> <small>{u.email}</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <input
        placeholder="To (email)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        rows="3"
        placeholder="Message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>

      <div className="mail-actions">
        <button className="btn send" onClick={send}>Send</button>
        <button className="btn cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
