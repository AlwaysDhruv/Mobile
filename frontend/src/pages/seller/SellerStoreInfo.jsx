import React, { useEffect, useState } from "react";
import { get, patch } from "../../api";
import "./SellerStoreInfo.css";

export default function SellerStoreInfo() {
  const [store, setStore] = useState(null);

  // text fields
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");

  const [isOpen, setIsOpen] = useState(true);

  // image preview
  const [bannerPrev, setBannerPrev] = useState(null);
  const [logoPrev, setLogoPrev] = useState(null);

  // image files
  const [bannerFile, setBannerFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    loadStore();
  }, []);

  async function loadStore() {
    const res = await get("/store/my");
    if (!res) return;

    setStore(res);
    setStoreName(res.storeName || "");
    setDescription(res.description || "");
    setPhone(res.phone || "");
    setAddress(res.address || "");
    setCity(res.city || "");
    setState(res.state || "");
    setPincode(res.pincode || "");

    setFacebook(res.facebook || "");
    setInstagram(res.instagram || "");
    setTwitter(res.twitter || "");

    setIsOpen(res.isOpen);
    setBannerPrev(res.banner ? `http://localhost:5000${res.banner}` : null);
    setLogoPrev(res.logo ? `http://localhost:5000${res.logo}` : null);
  }

  async function saveStore() {
    const formData = new FormData();

    formData.append("storeName", storeName);
    formData.append("description", description);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("pincode", pincode);

    formData.append("facebook", facebook);
    formData.append("instagram", instagram);
    formData.append("twitter", twitter);

    formData.append("isOpen", isOpen);

    if (bannerFile) formData.append("banner", bannerFile);
    if (logoFile) formData.append("logo", logoFile);

    await patch("/store/update", formData, true);

    alert("Store updated!");
    loadStore();
  }

  if (!store) return <div className="seller-store loading">Loading…</div>;

  return (
    <div className="seller-store">
      <h1 className="title">Edit Store Information</h1>

      <div className="store-card">

        {/* Store Name */}
        <label>Store Name</label>
        <input className="input" value={storeName} onChange={e => setStoreName(e.target.value)} />

        {/* Description */}
        <label>Description</label>
        <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} />

        {/* Phone */}
        <label>Phone Number</label>
        <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />

        {/* Address */}
        <label>Full Address</label>
        <textarea className="textarea" value={address} onChange={e => setAddress(e.target.value)} />

        {/* Extra Address Fields */}
        <div className="row">
          <div>
            <label>City</label>
            <input className="input" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <label>State</label>
            <input className="input" value={state} onChange={e => setState(e.target.value)} />
          </div>
          <div>
            <label>Pincode</label>
            <input className="input" value={pincode} onChange={e => setPincode(e.target.value)} />
          </div>
        </div>

        {/* Social Links */}
        <h3 className="sub-title">Social Links</h3>
        <label>Facebook</label>
        <input className="input" value={facebook} onChange={e => setFacebook(e.target.value)} />

        <label>Instagram</label>
        <input className="input" value={instagram} onChange={e => setInstagram(e.target.value)} />

        <label>Twitter</label>
        <input className="input" value={twitter} onChange={e => setTwitter(e.target.value)} />

        {/* Open Close Toggle */}
        <div className="toggle-row">
          <label>Store Status</label>
          <select className="input" value={isOpen} onChange={(e) => setIsOpen(e.target.value === "true")}>
            <option value="true">Open</option>
            <option value="false">Closed</option>
          </select>
        </div>

        {/* Banner Upload */}
        <label>Banner Image</label>
        {bannerPrev && <img src={bannerPrev} className="preview-img" />}
        <input type="file" className="input" onChange={(e) => {
          setBannerFile(e.target.files[0]);
          setBannerPrev(URL.createObjectURL(e.target.files[0]));
        }} />

        {/* Logo Upload */}
        <label>Logo</label>
        {logoPrev && <img src={logoPrev} className="preview-logo" />}
        <input type="file" className="input" onChange={(e) => {
          setLogoFile(e.target.files[0]);
          setLogoPrev(URL.createObjectURL(e.target.files[0]));
        }} />

        {/* Submit */}
        <button className="save-btn" onClick={saveStore}>Save Changes</button>

      </div>
    </div>
  );
}
