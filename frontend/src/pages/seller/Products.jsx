import React, { useEffect, useState } from "react";
import { get, del } from "../../api.js";
import { Link, useNavigate } from "react-router-dom";
import "./Products.css";

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    const res = await get("/products/by-seller");
    setProducts(res || []);
  }

  async function loadCategories() {
    const res = await get("/categories/by-seller");
    setCategories(res || []);
  }

  async function remove(id) {
    if (window.confirm("Delete this product?")) {
      await del(`/products/${id}`);
      loadProducts();
    }
  }

  const shown = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterCat ? p.category?._id === filterCat : true)
  );

  return (
    <div className="products-page">
      {/* Top Bar */}
      <div className="top-bar">
        <h2>Your Products</h2>
        <Link className="btn" to="/seller/products/add">
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {shown.map((p) => (
          <div
            className="product-card"
            key={p._id}
            onClick={() => navigate(`/seller/products/${p._id}`)}
          >
            <div className="img-box">
              {p.images?.length ? (
                <img src={p.images[0]} alt={p.name} />
              ) : (
                <div className="no-img">No Image</div>
              )}
            </div>

            <h3>{p.name}</h3>
            <p className="brand">{p.brand || "Unbranded"}</p>

            <p className="price">₹{p.price}</p>
            <p className="qty">Qty: {p.qty}</p>

            <p className="cat">
              Category: <b>{p.category?.name || "None"}</b>
            </p>

            {/* Mobile Specs Preview */}
            <div className="specs">
              {p.ram && <span>RAM: {p.ram}</span>}
              {p.storage && <span>Storage: {p.storage}</span>}
              {p.battery && <span>Battery: {p.battery}</span>}
              {p.display && <span>Display: {p.display}</span>}
              {p.processor && <span>CPU: {p.processor}</span>}
            </div>

            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                remove(p._id);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {shown.length === 0 && <p className="no-result">No products found.</p>}
    </div>
  );
}
