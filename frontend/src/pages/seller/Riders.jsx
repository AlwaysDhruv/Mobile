import React, { useEffect, useState } from "react";
import { get, patch } from "../../api.js";
import SendMailBox from "../../components/SendMailBox.jsx";
import "./Users.css";

export default function SellerRiders() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [removalPending, setRemovalPending] = useState([]);
  const [mailTo, setMailTo] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const pend = await get("/rider-store/requests");
    const appr = await get("/rider-store/approved-riders");

    // Separate approved and removal_pending
    const approvedList = [];
    const removalList = [];

    (Array.isArray(appr) ? appr : []).forEach(r => {
      if (r.type === "removal_pending") removalList.push(r);
      else approvedList.push(r);
    });

    setPending(Array.isArray(pend) ? pend : []);
    setApproved(approvedList);
    setRemovalPending(removalList);
  }

  async function approve(id) {
    await patch(`/rider-store/requests/${id}/approve`);
    load();
  }

  async function approveRemoval(riderId) {
    await patch(`/rider-store/approve-remove/${riderId}`);
    load();
  }

  return (
    <div className="buyers-container">
      <h1>Store Riders</h1>

      {/* Pending Join Requests */}
      <h2>Pending Join Requests</h2>
      <table className="buyers-table">
        <tbody>
          {pending.map(req => (
            <tr key={req._id}>
              <td>{req.rider?.name}</td>
              <td>{req.rider?.email}</td>
              <td>{new Date(req.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="view-btn" onClick={() => approve(req._id)}>
                  Approve
                </button>
                <button className="mail-btn" onClick={() => setMailTo(req.rider?.email)}>
                  Mail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Approved Riders */}
      <h2>Active Riders</h2>
      <table className="buyers-table">
        <tbody>
          {approved.map(r => (
            <tr key={r._id}>
              <td>{r.rider?.name}</td>
              <td>{r.rider?.email}</td>
              <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="mail-btn"
                  onClick={() => setMailTo(r.rider?.email)}
                >
                  Mail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Riders Who Requested Removal */}
      <h2>Removal Requests</h2>
      <table className="buyers-table">
        <tbody>
          {removalPending.map(r => (
            <tr key={r._id}>
              <td>{r.rider?.name}</td>
              <td>{r.rider?.email}</td>
              <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => approveRemoval(r.rider?._id)}
                >
                  Approve Removal
                </button>
                <button
                  className="mail-btn"
                  onClick={() => setMailTo(r.rider?.email)}
                >
                  Mail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mailTo && <SendMailBox email={mailTo} onClose={() => setMailTo(null)} />}
    </div>
  );
}
