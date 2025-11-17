// src/pages/seller/EditCategory.jsx
import React, { useEffect, useState } from "react";
import { get, put } from "../../api.js";
import { useParams, useNavigate } from "react-router-dom";
import "./Categories.css";

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cat, setCat] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const categoryRes = await get(`/categories/${id}`);
    const productRes = await get(`/products/by-seller`);
    const productIds = (categoryRes.products || []).map(p => p._id || p);
    setCat({ ...categoryRes, products: productIds });
    setAllProducts(productRes);
  }

  async function updateProducts(newProducts) {
    setSaving(true);
    setCat({ ...cat, products: newProducts });

    await put(`/categories/${id}`, {
      name: cat.name,
      description: cat.description,
      products: newProducts,
    });

    setSaving(false);
  }

  if (!cat) return <div className="no-result">Loading...</div>;

  return (
    <div className="edit-category">
      <h1>Edit Category</h1>

      <input
        value={cat.name}
        onChange={e => setCat({ ...cat, name: e.target.value })}
        className="input"
      />

      <textarea
        value={cat.description}
        onChange={e => setCat({ ...cat, description: e.target.value })}
        className="textarea"
      />

      <h3>Products</h3>

      <div className="product-list-box">
      {allProducts.map(p => {
        const included = cat.products.some(x => String(x) === String(p._id));
      
        return (
          <div key={p._id} className="product-row">
            <span className="product-name">{p.name} — ₹{p.price}</span>
      
            {included ? (
              <button
                className="remove-btn"
                disabled={saving}
                onClick={() => updateProducts(cat.products.filter(x => String(x) !== String(p._id)))}
              >
                Remove
              </button>
            ) : (
              <button
                className="add-btn"
                disabled={saving}
                onClick={() => updateProducts([...cat.products, p._id])}
              >
                Add
              </button>
            )}
          </div>
        );
      })}
      </div>

      <button className="btn" onClick={() => navigate("/seller/categories")}>
        Back
      </button>
    </div>
  );
}
