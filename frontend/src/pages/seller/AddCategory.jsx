import React, { useState, useEffect } from "react";
import { get, post } from "../../api.js";
import { useNavigate } from "react-router-dom";
import "./Categories.css";

export default function AddCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setAllProducts(await get("/products/by-seller") || []);
  }

  async function submit(e) {
    e.preventDefault();
    await post("/categories", { name, description, products });
    navigate("/seller/categories");
  }

  return (
    <div className="add-category">
      <h1>Add Category</h1>

      <form onSubmit={submit}>
        <input placeholder="Category Name" value={name} onChange={e=>setName(e.target.value)} required />

        <textarea placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />

        <label>Products (Optional)</label>
        <div className="product-checkbox-list">
          {allProducts.map(p => (
            <label key={p._id} className="checkbox-item">
              <input
                type="checkbox"
                value={p._id}
                checked={products.includes(p._id)}
                onChange={(e) => {
                  if (e.target.checked) setProducts([...products, p._id]);
                  else setProducts(products.filter(id => id !== p._id));
                }}
              />
              {p.name} — ₹{p.price}
            </label>
          ))}
        </div>

        <button className="btn">Add Category</button>
      </form>
    </div>
  );
}
