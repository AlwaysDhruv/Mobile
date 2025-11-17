import React, { useEffect, useState } from "react";
import { get, patch, del } from "../../api.js"; // IMPORTANT: add "del" here
import "./BuyerProfile.css";

export default function BuyerProfile() {
  const [user, setUser] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [passwordMode, setPasswordMode] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const res = await get("/auth/me");
    if (res) {
      setUser(res);
      setName(res.name || "");
      setAddress(res.address || "");
    }
  }

  async function saveProfile() {
    await patch("/auth/update", { name, address });
    alert("Profile updated!");
    setEditMode(false);
    loadProfile();
  }

  async function changePassword() {
    if (!oldPass || !newPass) return alert("Enter passwords");
    await patch("/auth/change-password", { oldPass, newPass });

    alert("Password updated!");
    setPasswordMode(false);
    setOldPass("");
    setNewPass("");
  }

  async function deleteAccount() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    await del("/auth/delete"); // DELETE request

    alert("Your account has been deleted.");
    localStorage.clear();
    window.location.href = "/login";
  }

  if (!user) return <div className="buyer-profile loading">Loading…</div>;

  return (
    <div className="buyer-profile">
      <h1 className="profile-title">Your Profile</h1>

      <div className="profile-card">

        {/* Left: Avatar */}
        <div className="avatar-box">
          <div className="avatar-circle">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <p className="email-text">{user.email}</p>
        </div>

        {/* Right: Details */}
        <div className="profile-info">

          {!editMode ? (
            <>
              <div className="info-row">
                <label>Name:</label>
                <span>{user.name}</span>
              </div>

              <div className="info-row">
                <label>Address:</label>
                <span>{user.address || "No address added"}</span>
              </div>

              <button className="edit-btn" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>

              <button className="password-btn" onClick={() => setPasswordMode(true)}>
                Change Password
              </button>

              {/* DELETE ACCOUNT BUTTON */}
              <button className="delete-account-btn" onClick={deleteAccount}>
                Delete Account
              </button>
            </>
          ) : (
            <>
              <div className="info-row">
                <label>Name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="info-row">
                <label>Address</label>
                <textarea
                  className="textarea"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                ></textarea>
              </div>

              <button className="save-btn" onClick={saveProfile}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </>
          )}

          {passwordMode && (
            <div className="password-box">
              <h3>Change Password</h3>

              <input
                className="input"
                type="password"
                placeholder="Old password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
              />

              <input
                className="input"
                type="password"
                placeholder="New password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />

              <button className="save-btn" onClick={changePassword}>
                Update Password
              </button>
              <button
                className="cancel-btn"
                onClick={() => setPasswordMode(false)}
              >
                Cancel
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
