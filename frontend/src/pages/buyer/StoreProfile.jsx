import React, { useEffect, useState } from "react";
import { get, post } from "../../api";
import "./StoreProfile.css";
import { useParams } from "react-router-dom";

export default function StoreProfile() {
  const { storeId } = useParams();

  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [selectedCat, setSelectedCat] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const [viewProduct, setViewProduct] = useState(null);

  /* -----------------------------
      LOAD STORE DATA
  ----------------------------- */
  useEffect(() => {
    loadStore();
    loadCategories();
    loadProducts();
  }, [storeId]);

  async function loadStore() {
    const res = await get(`/store/${storeId}`);
    setStore(res || null);
  }

  async function loadCategories() {
    const res = await get(`/categories/store/${storeId}`);
    setCategories(Array.isArray(res) ? res : []);
  }

  async function loadProducts() {
    const res = await get(`/products/store/${storeId}`);

    if (!Array.isArray(res)) return;

    const fixed = res.map((p) => ({
      ...p,
      images: (p.images || []).map((img) =>
        img.startsWith("http") ? img : `http://localhost:5000${img}`
      ),
    }));

    setProducts(fixed);
    setAllProducts(fixed);
  }

  /* -----------------------------
      FILTER + SORT
  ----------------------------- */
  function applyFilters(text, cat, sortType) {
    let list = [...allProducts];

    if (cat) list = list.filter((p) => p.category?._id === cat);
    if (text)
      list = list.filter((p) =>
        p.name.toLowerCase().includes(text.toLowerCase())
      );

    switch (sortType) {
      case "low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "latest":
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "popular":
        list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      default:
        break;
    }

    setProducts(list);
  }

  function handleSearch(t) {
    setSearch(t);
    applyFilters(t, selectedCat, sort);
  }

  function handleCategory(cat) {
    setSelectedCat(cat);
    applyFilters(search, cat, sort);
  }

  function handleSort(type) {
    setSort(type);
    applyFilters(search, selectedCat, type);
  }

  async function addToCart(productId) {
    const res = await post("/orders/cart", { productId });
    alert(res.message || "Added to cart!");
  }

  if (!store) return <div className="store-profile">Loading…</div>;

  return (
    <div className="store-profile">

      {/* ===============================
            STORE INFORMATION SECTION
      =============================== */}
      <div className="store-info-box">

        {/* Banner + Logo */}
        {/* Banner */}
        <div className="store-banner-box">
          <img
            src={
              store.banner
                ? (store.banner.startsWith("http")
                    ? store.banner
                    : `http://localhost:5000${store.banner}`)
                : "/store-default-banner.jpg"
            }
            alt="Store Banner"
            className="store-banner-img"
          />
        </div>
        
        {/* Logo separated */}
        <div className="store-logo-wrapper">
          <img
            src={
              store.logo
                ? (store.logo.startsWith("http")
                    ? store.logo
                    : `http://localhost:5000${store.logo}`)
                : "/store-default-logo.png"
            }
            alt="Store Logo"
            className="store-logo-img"
          />
        </div>

        {/* Details */}
        {/* Details */}
        <div className="store-details">
          <h1 className="store-title">{store.storeName}</h1>
        
          <p className="store-desc">
            {store.description || "No description available"}
          </p>
        
          {/* STATUS */}
          <div className="store-status">
            <span className={store.isOpen ? "open" : "closed"}>
              {store.isOpen ? "🟢 Open Now" : "🔴 Closed"}
            </span>
          </div>
        
          {/* GRID — Only model fields */}
          <div className="store-info-grid">
        
            <div className="info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">{store.phone || "Not provided"}</span>
            </div>
        
            <div className="info-item">
              <span className="info-label">Address</span>
              <span className="info-value">{store.address || "Not provided"}</span>
            </div>
        
            <div className="info-item">
              <span className="info-label">City</span>
              <span className="info-value">{store.city || "N/A"}</span>
            </div>
        
            <div className="info-item">
              <span className="info-label">State</span>
              <span className="info-value">{store.state || "N/A"}</span>
            </div>
        
            <div className="info-item">
              <span className="info-label">Pincode</span>
              <span className="info-value">{store.pincode || "N/A"}</span>
            </div>
        
            <div className="info-item">
              <span className="info-label">Since</span>
              <span className="info-value">
                {new Date(store.createdAt).toLocaleDateString()}
              </span>
            </div>
        
          </div>
        
          {/* SOCIAL LINKS */}
          <h3 className="social-title">Social Links</h3>
          <div className="social-links">
            <a
              href={store.facebook || "#"}
              target="_blank"
              rel="noreferrer"
              className={store.facebook ? "link-active" : "link-disabled"}
            >
              Facebook
            </a>
        
            <a
              href={store.instagram || "#"}
              target="_blank"
              rel="noreferrer"
              className={store.instagram ? "link-active" : "link-disabled"}
            >
              Instagram
            </a>
        
            <a
              href={store.twitter || "#"}
              target="_blank"
              rel="noreferrer"
              className={store.twitter ? "link-active" : "link-disabled"}
            >
              Twitter
            </a>
          </div>
        
        </div>
      </div>

      {/* ===============================
            SEARCH + CATEGORY + SORT
      =============================== */}
      <div className="search-box" style={{ marginTop: "25px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <select value={selectedCat} onChange={(e) => handleCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select value={sort} onChange={(e) => handleSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="latest">Latest</option>
          <option value="low">Price Low → High</option>
          <option value="high">Price High → Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* CATEGORY TABS */}
      <div className="category-tabs">
        <button
          className={!selectedCat ? "active" : ""}
          onClick={() => handleCategory("")}
        >
          All
        </button>

        {categories.map((c) => (
          <button
            key={c._id}
            className={selectedCat === c._id ? "active" : ""}
            onClick={() => handleCategory(c._id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* ===============================
            PRODUCT GRID
      =============================== */}
      <div className="product-grid">
        {products.length === 0 ? (
          <p className="no-result">No products found.</p>
        ) : (
          products.map((p) => (
            <div
              key={p._id}
              className="product-card"
              onClick={() => setViewProduct(p)}
            >
              <img src={p.images?.[0]} alt={p.name} />
              <h3>{p.name}</h3>
              <p className="brand">{p.brand}</p>
              <p className="price">₹{p.price}</p>
            </div>
          ))
        )}
      </div>

      {/* ===============================
            PRODUCT VIEW MODAL
      =============================== */}
      {viewProduct && (
        <div className="modal" onClick={() => setViewProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setViewProduct(null)}>
              &times;
            </span>

            <div className="modal-img-box">
              <img className="modal-img" src={viewProduct.images?.[0]} alt={viewProduct.name} />

              <div className="thumb-row">
                {viewProduct.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="thumb"
                    onClick={() =>
                      setViewProduct({
                        ...viewProduct,
                        images: [
                          img,
                          ...viewProduct.images.filter((x) => x !== img),
                        ],
                      })
                    }
                  />
                ))}
              </div>
            </div>

            <h2>{viewProduct.name}</h2>
            <p className="brand">{viewProduct.brand}</p>
            <p className="price">₹{viewProduct.price}</p>
            <p className="modal-desc">{viewProduct.description}</p>

            <h3 className="spec-title">Mobile Specifications</h3>
            <table className="spec-table">
              <tbody>
                <tr><td>RAM</td><td>{viewProduct.ram || "—"}</td></tr>
                <tr><td>Storage</td><td>{viewProduct.storage || "—"}</td></tr>
                <tr><td>Battery</td><td>{viewProduct.battery || "—"}</td></tr>
                <tr><td>Display</td><td>{viewProduct.display || "—"}</td></tr>
                <tr><td>Processor</td><td>{viewProduct.processor || "—"}</td></tr>
                <tr><td>Camera</td><td>{viewProduct.camera || "—"}</td></tr>
                <tr><td>Operating System</td><td>{viewProduct.os || "—"}</td></tr>
                <tr><td>Color</td><td>{viewProduct.color || "—"}</td></tr>
              </tbody>
            </table>

            <button className="btn" onClick={() => addToCart(viewProduct._id)}>
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
