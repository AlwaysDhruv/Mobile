import React, { useEffect, useState } from "react";
import { get, post } from "../../api.js";
import "../seller/MailPage.css";

export default function RiderMailPage() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [view, setView] = useState("inbox");
  const [composeOpen, setComposeOpen] = useState(false);

  // compose fields
  const [contacts, setContacts] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMails();
  }, []);

  async function loadMails() {
    const res = await get("/mail/list");
    if (res) {
      setSent(res.sent || []);
      setReceived(res.received || []);
    }
  }

  async function loadContacts() {
    // Load possible recipients: sellers + buyers (backend auto-validates who’s allowed)
    const sellers = await get("/auth/search?role=seller");
    const buyers = await get("/auth/search?role=buyer");
    const rider = await get("/auth/search?role=rider");
    setContacts([...sellers, ...buyers, ...rider]);
  }

  async function sendMail() {
    if (!recipient || !subject || !message) {
      alert("Please fill all fields");
      return;
    }
    await post("/mail/send", { recipientId: recipient, subject, message });
    alert("✅ Mail sent successfully");
    setComposeOpen(false);
    setRecipient("");
    setSubject("");
    setMessage("");
    loadMails();
  }

  return (
    <div className="mail-page">
      {/* Sidebar */}
      <div className="mail-sidebar">
        <button
          className="compose-btn"
          onClick={() => {
            loadContacts();
            setComposeOpen(true);
          }}
        >
          ✉ Compose
        </button>
        <button
          className={view === "inbox" ? "active" : ""}
          onClick={() => setView("inbox")}
        >
          Inbox ({received.length})
        </button>
        <button
          className={view === "sent" ? "active" : ""}
          onClick={() => setView("sent")}
        >
          Sent ({sent.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="mail-content">
        <h2>{view === "inbox" ? "Inbox" : "Sent Messages"}</h2>

        <table className="mail-table">
          <thead>
            <tr>
              <th>{view === "inbox" ? "From" : "To"}</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(view === "inbox" ? received : sent).map((m) => (
              <tr key={m._id}>
                <td>
                  {view === "inbox"
                    ? m.sender?.name || "Unknown"
                    : m.recipient?.name || "Unknown"}
                </td>
                <td>{m.subject}</td>
                <td>{m.message}</td>
                <td>{new Date(m.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compose Box */}
      {composeOpen && (
        <div className="compose-overlay">
          <div className="compose-box enhanced">
            <h3>New Message</h3>

            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              <option value="">Select Recipient</option>
              {contacts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.role}) — {c.email}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <textarea
              rows="5"
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>

            <div className="compose-actions">
              <button className="send-btn" onClick={sendMail}>Send</button>
              <button className="cancel-btn" onClick={() => setComposeOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}
