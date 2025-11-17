import React, { useEffect, useState } from "react";
import { get, del } from "../../api.js";
import { Link, useNavigate } from "react-router-dom";
import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  async function loadCategories() {
    const res = await get("/categories/by-seller");
    setCategories(res || []);
  }

  async function loadProducts() {
    const res = await get("/products");
    setProducts(res || []);
  }

  async function remove(id) {
    if (!window.confirm("Delete this category?")) return;
    await del(`/categories/${id}`);
    loadCategories();
  }

  function countProducts(catId) {
    return products.filter(p => p.category?._id === catId).length;
  }

  const shown = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="categories-page">

      <div className="top-bar">
        <h2>Manage Categories</h2>
        <Link className="btn" to="/seller/categories/add">+ Add Category</Link>
      </div>

      <div className="filters">
        <input
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="category-grid">
        {shown.map(c => (
          <div className="category-card" key={c._id}>

            <div className="category-main" onClick={() => navigate(`/seller/categories/edit/${c._id}`)}>
              <h3>{c.name}</h3>
              <p className="count">{countProducts(c._id)} product(s)</p>
            </div>

            <div className="cat-actions">
              <button className="edit-btn" onClick={() => navigate(`/seller/categories/edit/${c._id}`)}>Edit</button>
              <button className="del-btn" onClick={() => remove(c._id)}>Delete</button>
            </div>

          </div>
        ))}
      </div>

      {shown.length === 0 && <p className="no-result">No categories found.</p>}
    </div>
  );
}
