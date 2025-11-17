import React, { useEffect, useState } from "react";
import { get, post, patch } from "../../api.js";
import "../seller/Users.css";

export default function RiderStores() {
  const [stores, setStores] = useState([]);
  const [myStore, setMyStore] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

// RiderStores.jsx (replace your loadData function)
async function loadData() {
  try {
    const my = await get("/rider-store/approved");
    const selected = Array.isArray(my) && my.length > 0 ? my[0] : null;
    setMyStore(selected);

    if (!selected) {
      const list = await get("/rider-store/stores/all");
      // defensive: if the API returned something unexpected, ensure an array
      if (!Array.isArray(list)) {
        console.error("stores/all returned non-array:", list);
        setStores([]);
      } else {
        setStores(list);
      }
    }
  } catch (err) {
    // network / parse errors
    console.error("loadData error:", err);
    setStores([]);
  }
}

  async function sendRequest(storeId) {
    await post("/rider-store/request", { storeId });
    loadData();
  }

  async function requestRemoveStore() {
    await patch("/rider-store/request-remove");
    loadData();
  }

  /* -------------------------------
     SHOW CURRENT STORE (IF ANY)
  -------------------------------- */
  if (myStore) {
    const s = myStore.store || {};

    return (
      <div className="buyers-container">
        <h1>Your Store</h1>

        <table className="buyers-table">
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>{s.storeName || "Unnamed Store"}</td>
              <td>{s.description || "No description"}</td>

              <td>
                {myStore.type === "approved" && (
                  <span className="status delivered">Approved</span>
                )}
                {myStore.type === "pending" && (
                  <span className="status pending">Pending</span>
                )}
                {myStore.type === "removal_pending" && (
                  <span className="status cancelled">Removal Requested</span>
                )}
              </td>

              <td>
                {myStore.type === "approved" && (
                  <button className="delete-btn" onClick={requestRemoveStore}>
                    Request Removal
                  </button>
                )}

                {myStore.type === "pending" && (
                  <button className="delete-btn" disabled>
                    Awaiting Approval
                  </button>
                )}

                {myStore.type === "removal_pending" && (
                  <button className="delete-btn" disabled>
                    Removal Pending
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  /* -------------------------------
     SHOW AVAILABLE STORES TO JOIN
  -------------------------------- */
  return (
    <div className="buyers-container">
      <h1>Choose a Store to Join</h1>

      <table className="buyers-table">
        <thead>
          <tr>
            <th>Store Name</th>
            <th>Description</th>
            <th>Join</th>
          </tr>
        </thead>

        <tbody>
          {stores.map(s => (
            <tr key={s._id}>
              <td>{s.storeName}</td>
              <td>{s.description || "No description"}</td>
              <td>
                <button className="view-btn" onClick={() => sendRequest(s._id)}>
                  Request Join
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
